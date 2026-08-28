package com.keystone.platform.backend.service;

import com.keystone.platform.backend.dto.TimeLogRequest;
import com.keystone.platform.backend.dto.TimeLogResponse;
import com.keystone.platform.backend.dto.WorkOrderPartRequest;
import com.keystone.platform.backend.dto.WorkOrderPartResponse;
import com.keystone.platform.backend.entity.InventoryItem;
import com.keystone.platform.backend.entity.InventoryTransaction;
import com.keystone.platform.backend.entity.InventoryTransactionType;
import com.keystone.platform.backend.entity.Role;
import com.keystone.platform.backend.entity.User;
import com.keystone.platform.backend.entity.WorkOrder;
import com.keystone.platform.backend.entity.WorkOrderPart;
import com.keystone.platform.backend.entity.WorkOrderTimeLog;
import com.keystone.platform.backend.exception.ForbiddenException;
import com.keystone.platform.backend.exception.ValidationException;
import com.keystone.platform.backend.repository.InventoryItemRepository;
import com.keystone.platform.backend.repository.InventoryTransactionRepository;
import com.keystone.platform.backend.repository.WorkOrderPartRepository;
import com.keystone.platform.backend.repository.WorkOrderTimeLogRepository;
import com.keystone.platform.backend.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WorkOrderOpsService {

    private final WorkOrderService workOrderService;
    private final WorkOrderTimeLogRepository timeLogRepository;
    private final WorkOrderPartRepository partRepository;
    private final InventoryItemRepository inventoryItemRepository;
    private final InventoryTransactionRepository inventoryTransactionRepository;
    private final SecurityUtils securityUtils;

    @Transactional(readOnly = true)
    public List<TimeLogResponse> listTimeLogs(Long workOrderId) {
        WorkOrder workOrder = workOrderService.getWorkOrder(workOrderId);
        enforceAccess(workOrder);
        return timeLogRepository.findByWorkOrderIdOrderByCreatedAtDesc(workOrderId).stream()
                .map(TimeLogResponse::from)
                .toList();
    }

    @Transactional
    public TimeLogResponse addTimeLog(Long workOrderId, TimeLogRequest request) {
        WorkOrder workOrder = workOrderService.getWorkOrder(workOrderId);
        enforceAccess(workOrder);

        WorkOrderTimeLog log = WorkOrderTimeLog.builder()
                .workOrder(workOrder)
                .loggedBy(securityUtils.currentUser())
                .minutes(request.minutes())
                .notes(request.notes())
                .build();

        return TimeLogResponse.from(timeLogRepository.save(log));
    }

    @Transactional(readOnly = true)
    public List<WorkOrderPartResponse> listParts(Long workOrderId) {
        WorkOrder workOrder = workOrderService.getWorkOrder(workOrderId);
        enforceAccess(workOrder);
        return partRepository.findByWorkOrderIdOrderByCreatedAtDesc(workOrderId).stream()
                .map(WorkOrderPartResponse::from)
                .toList();
    }

    @Transactional
    public WorkOrderPartResponse addPart(Long workOrderId, WorkOrderPartRequest request) {
        WorkOrder workOrder = workOrderService.getWorkOrder(workOrderId);
        enforceAccess(workOrder);

        InventoryItem item = inventoryItemRepository.findById(request.inventoryItemId())
                .orElseThrow(() -> new ValidationException("Inventory item not found"));

        if (!item.isActive()) {
            throw new ValidationException("Cannot use inactive inventory item");
        }
        if (item.getQuantity() < request.quantity()) {
            throw new ValidationException("Insufficient stock. Available: " + item.getQuantity());
        }

        item.setQuantity(item.getQuantity() - request.quantity());
        inventoryItemRepository.save(item);

        inventoryTransactionRepository.save(InventoryTransaction.builder()
                .inventoryItem(item)
                .type(InventoryTransactionType.STOCK_OUT)
                .quantity(request.quantity())
                .reference(workOrder.getWorkOrderNumber())
                .notes(request.notes() != null ? request.notes() : "Used on work order")
                .build());

        WorkOrderPart part = WorkOrderPart.builder()
                .workOrder(workOrder)
                .inventoryItem(item)
                .quantity(request.quantity())
                .notes(request.notes())
                .build();

        return WorkOrderPartResponse.from(partRepository.save(part));
    }

    private void enforceAccess(WorkOrder workOrder) {
        User current = securityUtils.currentUser();
        if (current.getRole() == Role.ADMIN
                || current.getRole() == Role.MANAGER
                || current.getRole() == Role.DISPATCHER) {
            return;
        }
        if (current.getRole() == Role.TECHNICIAN
                && workOrder.getTechnician() != null
                && workOrder.getTechnician().getUser().getId().equals(current.getId())) {
            return;
        }
        throw new ForbiddenException("You do not have access to this work order");
    }
}
