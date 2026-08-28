package com.keystone.platform.backend.service;

import com.keystone.platform.backend.dto.ScheduleRequest;
import com.keystone.platform.backend.dto.ScheduleResponse;
import com.keystone.platform.backend.entity.Role;
import com.keystone.platform.backend.entity.Schedule;
import com.keystone.platform.backend.entity.ScheduleStatus;
import com.keystone.platform.backend.entity.Technician;
import com.keystone.platform.backend.entity.User;
import com.keystone.platform.backend.entity.WorkOrder;
import com.keystone.platform.backend.entity.WorkOrderStatus;
import com.keystone.platform.backend.exception.ForbiddenException;
import com.keystone.platform.backend.exception.ResourceNotFoundException;
import com.keystone.platform.backend.exception.ValidationException;
import com.keystone.platform.backend.repository.ScheduleRepository;
import com.keystone.platform.backend.repository.TechnicianRepository;
import com.keystone.platform.backend.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ScheduleService {

    private final ScheduleRepository scheduleRepository;
    private final WorkOrderService workOrderService;
    private final TechnicianService technicianService;
    private final TechnicianRepository technicianRepository;
    private final SecurityUtils securityUtils;
    private final NotificationService notificationService;

    @Transactional(readOnly = true)
    public List<ScheduleResponse> list(LocalDate from, LocalDate to) {
        LocalDate start = from != null ? from : LocalDate.now().minusDays(7);
        LocalDate end = to != null ? to : LocalDate.now().plusDays(30);

        User current = securityUtils.currentUser();
        List<Schedule> schedules = scheduleRepository.findByScheduledDateBetweenOrderByScheduledDateAscStartTimeAsc(start, end);

        if (current.getRole() == Role.TECHNICIAN) {
            Technician tech = technicianRepository.findByUserId(current.getId())
                    .orElseThrow(() -> new ForbiddenException("Technician profile not found"));
            schedules = schedules.stream()
                    .filter(s -> s.getTechnician().getId().equals(tech.getId()))
                    .toList();
        }

        return schedules.stream().map(ScheduleResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public ScheduleResponse findById(Long id) {
        Schedule schedule = getSchedule(id);
        enforceAccess(schedule);
        return ScheduleResponse.from(schedule);
    }

    @Transactional
    public ScheduleResponse create(ScheduleRequest request) {
        if (!request.endTime().isAfter(request.startTime())) {
            throw new ValidationException("End time must be after start time");
        }

        WorkOrder workOrder = workOrderService.getWorkOrder(request.workOrderId());
        Technician technician = technicianService.getTechnician(request.technicianId());

        if (!technician.isActive()) {
            throw new ValidationException("Cannot schedule inactive technician");
        }

        List<Schedule> conflicts = scheduleRepository.findConflicts(
                technician.getId(),
                request.scheduledDate(),
                request.startTime(),
                request.endTime(),
                ScheduleStatus.CANCELLED,
                null
        );
        if (!conflicts.isEmpty()) {
            throw new ValidationException("Technician has a scheduling conflict");
        }

        Schedule schedule = Schedule.builder()
                .workOrder(workOrder)
                .technician(technician)
                .scheduledDate(request.scheduledDate())
                .startTime(request.startTime())
                .endTime(request.endTime())
                .status(ScheduleStatus.SCHEDULED)
                .notes(request.notes())
                .build();

        workOrder.setTechnician(technician);
        workOrder.setScheduledDate(request.scheduledDate());
        if (workOrder.getStatus() == WorkOrderStatus.NEW || workOrder.getStatus() == WorkOrderStatus.ASSIGNED) {
            workOrder.setStatus(WorkOrderStatus.SCHEDULED);
        }

        Schedule saved = scheduleRepository.save(schedule);

        if (technician.getUser() != null) {
            notificationService.notifyUser(
                    technician.getUser(),
                    "New schedule assigned",
                    workOrder.getWorkOrderNumber() + " — " + request.scheduledDate()
                            + " " + request.startTime() + "–" + request.endTime(),
                    "SCHEDULE",
                    "/schedule"
            );
        }

        return ScheduleResponse.from(saved);
    }

    @Transactional
    public ScheduleResponse update(Long id, ScheduleRequest request) {
        Schedule schedule = getSchedule(id);

        if (!request.endTime().isAfter(request.startTime())) {
            throw new ValidationException("End time must be after start time");
        }

        Technician technician = technicianService.getTechnician(request.technicianId());
        WorkOrder workOrder = workOrderService.getWorkOrder(request.workOrderId());

        List<Schedule> conflicts = scheduleRepository.findConflicts(
                technician.getId(),
                request.scheduledDate(),
                request.startTime(),
                request.endTime(),
                ScheduleStatus.CANCELLED,
                id
        );
        if (!conflicts.isEmpty()) {
            throw new ValidationException("Technician has a scheduling conflict");
        }

        schedule.setWorkOrder(workOrder);
        schedule.setTechnician(technician);
        schedule.setScheduledDate(request.scheduledDate());
        schedule.setStartTime(request.startTime());
        schedule.setEndTime(request.endTime());
        schedule.setNotes(request.notes());
        schedule.setStatus(ScheduleStatus.RESCHEDULED);

        workOrder.setTechnician(technician);
        workOrder.setScheduledDate(request.scheduledDate());

        Schedule saved = scheduleRepository.save(schedule);

        if (technician.getUser() != null) {
            notificationService.notifyUser(
                    technician.getUser(),
                    "Schedule updated",
                    workOrder.getWorkOrderNumber() + " — " + request.scheduledDate()
                            + " " + request.startTime() + "–" + request.endTime(),
                    "SCHEDULE",
                    "/schedule"
            );
        }

        return ScheduleResponse.from(saved);
    }

    @Transactional
    public void cancel(Long id) {
        Schedule schedule = getSchedule(id);
        schedule.setStatus(ScheduleStatus.CANCELLED);
        scheduleRepository.save(schedule);
    }

    public Schedule getSchedule(Long id) {
        return scheduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Schedule not found with id: " + id));
    }

    private void enforceAccess(Schedule schedule) {
        User current = securityUtils.currentUser();
        if (current.getRole() != Role.TECHNICIAN) {
            return;
        }
        Technician tech = technicianRepository.findByUserId(current.getId())
                .orElseThrow(() -> new ForbiddenException("Technician profile not found"));
        if (!schedule.getTechnician().getId().equals(tech.getId())) {
            throw new ForbiddenException("You can only access your own schedule");
        }
    }
}
