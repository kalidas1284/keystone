package com.keystone.platform.backend.service;

import com.keystone.platform.backend.dto.AssignTechnicianRequest;
import com.keystone.platform.backend.dto.PageResponse;
import com.keystone.platform.backend.dto.ScheduleWorkOrderRequest;
import com.keystone.platform.backend.dto.UpdateStatusRequest;
import com.keystone.platform.backend.dto.WorkOrderRequest;
import com.keystone.platform.backend.dto.WorkOrderResponse;
import com.keystone.platform.backend.entity.AvailabilityStatus;
import com.keystone.platform.backend.entity.Customer;
import com.keystone.platform.backend.entity.Role;
import com.keystone.platform.backend.entity.Schedule;
import com.keystone.platform.backend.entity.ScheduleStatus;
import com.keystone.platform.backend.entity.Technician;
import com.keystone.platform.backend.entity.User;
import com.keystone.platform.backend.entity.WorkOrder;
import com.keystone.platform.backend.entity.WorkOrderPriority;
import com.keystone.platform.backend.entity.WorkOrderStatus;
import com.keystone.platform.backend.entity.WorkOrderStatusHistory;
import com.keystone.platform.backend.exception.ForbiddenException;
import com.keystone.platform.backend.exception.InvalidStatusTransitionException;
import com.keystone.platform.backend.exception.ResourceNotFoundException;
import com.keystone.platform.backend.exception.ValidationException;
import com.keystone.platform.backend.repository.ScheduleRepository;
import com.keystone.platform.backend.repository.SiteRepository;
import com.keystone.platform.backend.repository.TechnicianRepository;
import com.keystone.platform.backend.repository.UserRepository;
import com.keystone.platform.backend.repository.WorkOrderRepository;
import com.keystone.platform.backend.repository.WorkOrderStatusHistoryRepository;
import com.keystone.platform.backend.util.SecurityUtils;
import com.keystone.platform.backend.util.SlaUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.Year;
import java.util.EnumMap;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class WorkOrderService {

    private static final Map<WorkOrderStatus, Set<WorkOrderStatus>> ALLOWED_TRANSITIONS = new EnumMap<>(WorkOrderStatus.class);

    static {
        ALLOWED_TRANSITIONS.put(WorkOrderStatus.NEW, EnumSet.of(WorkOrderStatus.ASSIGNED, WorkOrderStatus.CANCELLED));
        ALLOWED_TRANSITIONS.put(WorkOrderStatus.ASSIGNED, EnumSet.of(WorkOrderStatus.SCHEDULED, WorkOrderStatus.IN_PROGRESS, WorkOrderStatus.CANCELLED));
        ALLOWED_TRANSITIONS.put(WorkOrderStatus.SCHEDULED, EnumSet.of(WorkOrderStatus.IN_PROGRESS, WorkOrderStatus.ON_HOLD, WorkOrderStatus.CANCELLED));
        ALLOWED_TRANSITIONS.put(WorkOrderStatus.IN_PROGRESS, EnumSet.of(WorkOrderStatus.ON_HOLD, WorkOrderStatus.COMPLETED, WorkOrderStatus.CANCELLED));
        ALLOWED_TRANSITIONS.put(WorkOrderStatus.ON_HOLD, EnumSet.of(WorkOrderStatus.IN_PROGRESS, WorkOrderStatus.CANCELLED));
        ALLOWED_TRANSITIONS.put(WorkOrderStatus.COMPLETED, EnumSet.of(WorkOrderStatus.CLOSED));
        ALLOWED_TRANSITIONS.put(WorkOrderStatus.CLOSED, EnumSet.noneOf(WorkOrderStatus.class));
        ALLOWED_TRANSITIONS.put(WorkOrderStatus.CANCELLED, EnumSet.noneOf(WorkOrderStatus.class));
    }

    private final WorkOrderRepository workOrderRepository;
    private final CustomerService customerService;
    private final TechnicianService technicianService;
    private final TechnicianRepository technicianRepository;
    private final ScheduleRepository scheduleRepository;
    private final SiteRepository siteRepository;
    private final UserRepository userRepository;
    private final SecurityUtils securityUtils;
    private final NotificationService notificationService;
    private final SlaMonitorService slaMonitorService;
    private final WorkOrderStatusHistoryRepository statusHistoryRepository;

    @Transactional(readOnly = true)
    public PageResponse<WorkOrderResponse> search(
            String search,
            WorkOrderStatus status,
            WorkOrderPriority priority,
            Long technicianId,
            Pageable pageable
    ) {
        User current = securityUtils.currentUser();
        Long effectiveTechnicianId = technicianId;

        if (current.getRole() == Role.TECHNICIAN) {
            Technician tech = technicianRepository.findByUserId(current.getId())
                    .orElseThrow(() -> new ForbiddenException("Technician profile not found"));
            effectiveTechnicianId = tech.getId();
        }

        Page<WorkOrder> page = workOrderRepository.search(search, status, priority, effectiveTechnicianId, pageable);
        return new PageResponse<>(
                page.getContent().stream().map(WorkOrderResponse::from).toList(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages()
        );
    }

    @Transactional(readOnly = true)
    public WorkOrderResponse findById(Long id) {
        WorkOrder workOrder = getWorkOrder(id);
        enforceTechnicianAccess(workOrder);
        return WorkOrderResponse.from(workOrder);
    }

    @Transactional(readOnly = true)
    public List<WorkOrderResponse> findByCustomer(Long customerId) {
        customerService.getCustomer(customerId);
        return workOrderRepository.findByCustomerIdOrderByCreatedAtDesc(customerId).stream()
                .map(WorkOrderResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<WorkOrderResponse> findByTechnician(Long technicianId) {
        technicianService.getTechnician(technicianId);
        return workOrderRepository.findByTechnicianIdOrderByCreatedAtDesc(technicianId).stream()
                .map(WorkOrderResponse::from)
                .toList();
    }

    @Transactional
    public WorkOrderResponse create(WorkOrderRequest request) {
        Customer customer = customerService.getCustomer(request.customerId());
        var site = siteRepository.findByIdAndCustomerId(request.siteId(), customer.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Site not found for customer"));
        if (!customer.isActive()) {
            throw new ValidationException("Cannot create work order for inactive customer");
        }

        WorkOrder workOrder = WorkOrder.builder()
                .workOrderNumber(generateWorkOrderNumber())
                .customer(customer)
                .site(site)
                .title(request.title().trim())
                .description(request.description())
                .priority(request.priority())
                .status(WorkOrderStatus.NEW)
                .scheduledDate(request.scheduledDate())
                .estimatedDuration(request.estimatedDuration())
                .location(request.location() != null && !request.location().isBlank() ? request.location().trim() : site.getLocation())
                .notes(request.notes())
                .slaDueAt(SlaUtils.calculateDueAt(request.priority(), Instant.now()))
                .build();

        return WorkOrderResponse.from(workOrderRepository.save(workOrder));
    }

    @Transactional
    public WorkOrderResponse update(Long id, WorkOrderRequest request) {
        WorkOrder workOrder = getWorkOrder(id);
        if (workOrder.getStatus() == WorkOrderStatus.CLOSED || workOrder.getStatus() == WorkOrderStatus.CANCELLED) {
            throw new ValidationException("Completed or cancelled work orders cannot be edited");
        }

        Customer customer = customerService.getCustomer(request.customerId());
        var site = siteRepository.findByIdAndCustomerId(request.siteId(), customer.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Site not found for customer"));
        workOrder.setCustomer(customer);
        workOrder.setSite(site);
        workOrder.setTitle(request.title().trim());
        workOrder.setDescription(request.description());
        if (workOrder.getPriority() != request.priority()) {
            workOrder.setPriority(request.priority());
            workOrder.setSlaDueAt(SlaUtils.calculateDueAt(request.priority(), workOrder.getCreatedAt()));
        }
        workOrder.setScheduledDate(request.scheduledDate());
        workOrder.setEstimatedDuration(request.estimatedDuration());
        workOrder.setLocation(request.location() != null && !request.location().isBlank() ? request.location().trim() : site.getLocation());
        workOrder.setNotes(request.notes());

        return WorkOrderResponse.from(workOrderRepository.save(workOrder));
    }

    @Transactional
    public WorkOrderResponse assign(Long id, AssignTechnicianRequest request) {
        WorkOrder workOrder = getWorkOrder(id);
        if (workOrder.getStatus() == WorkOrderStatus.COMPLETED || workOrder.getStatus() == WorkOrderStatus.CANCELLED || workOrder.getStatus() == WorkOrderStatus.CLOSED) {
            throw new ValidationException("Cannot assign technician to completed or cancelled work order");
        }

        Technician technician = technicianService.getTechnician(request.technicianId());
        if (!technician.isActive()) {
            throw new ValidationException("Cannot assign inactive technician");
        }

        WorkOrderStatus previousStatus = workOrder.getStatus();
        workOrder.setTechnician(technician);
        if (workOrder.getStatus() == WorkOrderStatus.NEW) {
            workOrder.setStatus(WorkOrderStatus.ASSIGNED);
        }
        technician.setAvailabilityStatus(AvailabilityStatus.BUSY);

        WorkOrder saved = workOrderRepository.save(workOrder);

        if (previousStatus != saved.getStatus()) {
            writeStatusHistory(saved, previousStatus, saved.getStatus(), securityUtils.currentUser(), null);
        }

        notificationService.notifyUser(
                technician.getUser(),
                "New work order assigned",
                saved.getWorkOrderNumber() + " — " + saved.getTitle(),
                "ASSIGNMENT",
                "/work-orders/" + saved.getId()
        );

        return WorkOrderResponse.from(saved);
    }

    @Transactional
    public WorkOrderResponse schedule(Long id, ScheduleWorkOrderRequest request) {
        WorkOrder workOrder = getWorkOrder(id);
        if (workOrder.getTechnician() == null) {
            throw new ValidationException("Assign a technician before scheduling");
        }
        if (workOrder.getStatus() == WorkOrderStatus.COMPLETED || workOrder.getStatus() == WorkOrderStatus.CANCELLED || workOrder.getStatus() == WorkOrderStatus.CLOSED) {
            throw new ValidationException("Cannot schedule completed or cancelled work order");
        }

        LocalDate date = request.scheduledDate();
        LocalTime start = request.startTime() != null ? request.startTime() : LocalTime.of(9, 0);
        LocalTime end = request.endTime() != null
                ? request.endTime()
                : start.plusMinutes(workOrder.getEstimatedDuration() != null ? workOrder.getEstimatedDuration() : 60);

        if (!end.isAfter(start)) {
            throw new ValidationException("End time must be after start time");
        }

        List<Schedule> conflicts = scheduleRepository.findConflicts(
                workOrder.getTechnician().getId(),
                date,
                start,
                end,
                ScheduleStatus.CANCELLED,
                null
        );
        if (!conflicts.isEmpty()) {
            throw new ValidationException("Technician has a scheduling conflict for the selected time");
        }

        Schedule schedule = Schedule.builder()
                .workOrder(workOrder)
                .technician(workOrder.getTechnician())
                .scheduledDate(date)
                .startTime(start)
                .endTime(end)
                .status(ScheduleStatus.SCHEDULED)
                .notes(request.notes())
                .build();
        scheduleRepository.save(schedule);

        WorkOrderStatus previousStatus = workOrder.getStatus();
        workOrder.setScheduledDate(date);
        if (workOrder.getStatus() == WorkOrderStatus.ASSIGNED || workOrder.getStatus() == WorkOrderStatus.NEW) {
            workOrder.setStatus(WorkOrderStatus.SCHEDULED);
        }

        WorkOrder saved = workOrderRepository.save(workOrder);

        if (previousStatus != saved.getStatus()) {
            writeStatusHistory(saved, previousStatus, saved.getStatus(), securityUtils.currentUser(), null);
        }

        if (workOrder.getTechnician() != null && workOrder.getTechnician().getUser() != null) {
            notificationService.notifyUser(
                    workOrder.getTechnician().getUser(),
                    "Work order scheduled",
                    saved.getWorkOrderNumber() + " — " + date + " " + start + "–" + end,
                    "SCHEDULE",
                    "/work-orders/" + saved.getId()
            );
        }

        notifyCustomerPortal(
                saved,
                "Service request scheduled",
                "Your request " + saved.getWorkOrderNumber() + " is scheduled for " + date
        );

        return WorkOrderResponse.from(saved);
    }

    @Transactional
    public WorkOrderResponse updateStatus(Long id, UpdateStatusRequest request) {
        WorkOrder workOrder = getWorkOrder(id);
        enforceTechnicianAccess(workOrder);

        User current = securityUtils.currentUser();
        if (current.getRole() == Role.TECHNICIAN && request.status() == WorkOrderStatus.CANCELLED) {
            throw new ForbiddenException("Technicians cannot cancel work orders");
        }

        // Role-gated state transitions (spec requires role restricted transitions).
        if (request.status() == WorkOrderStatus.CLOSED) {
            if (current.getRole() != Role.MANAGER && current.getRole() != Role.ADMIN) {
                throw new ForbiddenException("Only managers can close work orders");
            }
        }

        if (current.getRole() == Role.TECHNICIAN) {
            // Technicians can drive work: start/hold/complete.
            if (request.status() != WorkOrderStatus.IN_PROGRESS
                    && request.status() != WorkOrderStatus.ON_HOLD
                    && request.status() != WorkOrderStatus.COMPLETED
                    && request.status() != WorkOrderStatus.CANCELLED) {
                throw new ForbiddenException("Technicians cannot transition to " + request.status());
            }
        } else {
            // Non-technicians should not set operational workflow states.
            if (request.status() == WorkOrderStatus.IN_PROGRESS
                    || request.status() == WorkOrderStatus.ON_HOLD) {
                throw new ForbiddenException("Only technicians can transition to " + request.status());
            }
        }

        validateTransition(workOrder.getStatus(), request.status());

        WorkOrderStatus previous = workOrder.getStatus();

        if (request.notes() != null && !request.notes().isBlank()) {
            String existing = workOrder.getNotes() == null ? "" : workOrder.getNotes() + "\n";
            workOrder.setNotes(existing + request.notes().trim());
        }

        workOrder.setStatus(request.status());
        if (request.status() == WorkOrderStatus.COMPLETED) {
            workOrder.setCompletedAt(Instant.now());
        }

        WorkOrder saved = workOrderRepository.save(workOrder);

        if (saved.getStatus() == WorkOrderStatus.COMPLETED) {
            releaseTechnicianIfIdle(saved.getTechnician());
        }

        if (previous != saved.getStatus()) {
            writeStatusHistory(saved, previous, saved.getStatus(), current, request.notes());
            notifyStatusChange(saved, previous);
            if (slaMonitorService != null) {
                slaMonitorService.notifySlaIfNeeded(saved);
            }
        }

        return WorkOrderResponse.from(saved);
    }

    @Transactional
    public WorkOrderResponse complete(Long id, String notes) {
        return updateStatus(id, new UpdateStatusRequest(WorkOrderStatus.COMPLETED, notes));
    }

    @Transactional
    public WorkOrderResponse cancel(Long id, String notes) {
        return updateStatus(id, new UpdateStatusRequest(WorkOrderStatus.CANCELLED, notes));
    }

    @Transactional
    public void delete(Long id) {
        WorkOrder workOrder = getWorkOrder(id);
        if (workOrder.getStatus() != WorkOrderStatus.NEW && workOrder.getStatus() != WorkOrderStatus.CANCELLED) {
            throw new ValidationException("Only NEW or CANCELLED work orders can be deleted");
        }
        workOrderRepository.delete(workOrder);
    }

    public WorkOrder getWorkOrder(Long id) {
        return workOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Work order not found with id: " + id));
    }

    /** Spec F3: closed/cancelled work orders are immutable for field operations. */
    public void ensureMutable(WorkOrder workOrder) {
        if (workOrder.getStatus() == WorkOrderStatus.CLOSED || workOrder.getStatus() == WorkOrderStatus.CANCELLED) {
            throw new ValidationException("Closed or cancelled work orders cannot be modified");
        }
    }

    private void enforceTechnicianAccess(WorkOrder workOrder) {
        User current = securityUtils.currentUser();
        if (current.getRole() != Role.TECHNICIAN) {
            return;
        }
        Technician tech = technicianRepository.findByUserId(current.getId())
                .orElseThrow(() -> new ForbiddenException("Technician profile not found"));
        if (workOrder.getTechnician() == null || !workOrder.getTechnician().getId().equals(tech.getId())) {
            throw new ForbiddenException("You can only access assigned work orders");
        }
    }

    private void validateTransition(WorkOrderStatus from, WorkOrderStatus to) {
        if (from == to) {
            return;
        }
        Set<WorkOrderStatus> allowed = ALLOWED_TRANSITIONS.getOrDefault(from, EnumSet.noneOf(WorkOrderStatus.class));
        if (!allowed.contains(to)) {
            throw new InvalidStatusTransitionException(
                    "Invalid status transition from " + from + " to " + to
            );
        }
    }

    private void notifyStatusChange(WorkOrder workOrder, WorkOrderStatus previous) {
        String title = "Work order " + workOrder.getStatus().name().toLowerCase().replace('_', ' ');
        String message = workOrder.getWorkOrderNumber() + " moved from " + previous + " to " + workOrder.getStatus();
        String link = "/work-orders/" + workOrder.getId();

        if (workOrder.getTechnician() != null && workOrder.getTechnician().getUser() != null) {
            notificationService.notifyUser(
                    workOrder.getTechnician().getUser(),
                    title,
                    message,
                    "STATUS",
                    link
            );
        }

        notifyCustomerPortal(
                workOrder,
                "Request update: " + workOrder.getStatus().name().replace('_', ' '),
                "Your request " + workOrder.getWorkOrderNumber() + " is now " + workOrder.getStatus()
        );

        if (workOrder.getStatus() == WorkOrderStatus.COMPLETED
                || workOrder.getStatus() == WorkOrderStatus.CLOSED
                || workOrder.getStatus() == WorkOrderStatus.CANCELLED) {
            notifyDispatchers(
                    "Work order " + workOrder.getStatus().name().toLowerCase(),
                    message,
                    "STATUS",
                    link
            );
        }
    }

    private void writeStatusHistory(
            WorkOrder saved,
            WorkOrderStatus from,
            WorkOrderStatus to,
            User changedBy,
            String note
    ) {
        if (from == to) {
            return;
        }
        // Unit tests may not have this dependency mocked; avoid NPE in isolated service tests.
        if (statusHistoryRepository == null) {
            return;
        }

        WorkOrderStatusHistory history = WorkOrderStatusHistory.builder()
                .workOrder(saved)
                .fromStatus(from)
                .toStatus(to)
                .changedBy(changedBy)
                .note(note != null && !note.isBlank() ? note.trim() : null)
                .build();
        statusHistoryRepository.save(history);
    }

    private void notifyDispatchers(String title, String message, String type, String link) {
        List<User> recipients = userRepository.findByRoleAndActiveTrue(Role.DISPATCHER);
        if (recipients.isEmpty()) {
            recipients = userRepository.findByRoleAndActiveTrue(Role.ADMIN);
        }
        recipients.forEach(user -> notificationService.notifyUser(user, title, message, type, link));
    }

    private void notifyCustomerPortal(WorkOrder workOrder, String title, String message) {
        Customer customer = workOrder.getCustomer();
        if (customer == null || customer.getUser() == null) {
            return;
        }
        notificationService.notifyUser(
                customer.getUser(),
                title,
                message,
                "PORTAL_UPDATE",
                "/portal/requests/" + workOrder.getId()
        );
    }

    private void releaseTechnicianIfIdle(Technician technician) {
        if (technician == null) {
            return;
        }
        long activeJobs = workOrderRepository.countByTechnicianIdAndStatusIn(
                technician.getId(),
                List.of(
                        WorkOrderStatus.ASSIGNED,
                        WorkOrderStatus.SCHEDULED,
                        WorkOrderStatus.IN_PROGRESS,
                        WorkOrderStatus.ON_HOLD
                )
        );
        if (activeJobs == 0) {
            technician.setAvailabilityStatus(AvailabilityStatus.AVAILABLE);
            technicianRepository.save(technician);
        }
    }

    private String generateWorkOrderNumber() {
        int year = Year.now().getValue();
        long next = workOrderRepository.count() + 1;
        return String.format("WO-%d-%05d", year, next);
    }
}
