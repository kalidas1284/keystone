package com.keystone.platform.backend.controller;

import com.keystone.platform.backend.dto.AssignTechnicianRequest;
import com.keystone.platform.backend.dto.PageResponse;
import com.keystone.platform.backend.dto.ScheduleWorkOrderRequest;
import com.keystone.platform.backend.dto.TimeLogRequest;
import com.keystone.platform.backend.dto.TimeLogResponse;
import com.keystone.platform.backend.dto.UpdateStatusRequest;
import com.keystone.platform.backend.dto.WorkOrderPartRequest;
import com.keystone.platform.backend.dto.WorkOrderPartResponse;
import com.keystone.platform.backend.dto.WorkOrderRequest;
import com.keystone.platform.backend.dto.WorkOrderResponse;
import com.keystone.platform.backend.entity.WorkOrderPriority;
import com.keystone.platform.backend.entity.WorkOrderStatus;
import com.keystone.platform.backend.service.WorkOrderOpsService;
import com.keystone.platform.backend.service.WorkOrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/work-orders")
@RequiredArgsConstructor
public class WorkOrderController {

    private final WorkOrderService workOrderService;
    private final WorkOrderOpsService workOrderOpsService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','DISPATCHER','TECHNICIAN')")
    public ResponseEntity<PageResponse<WorkOrderResponse>> list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) WorkOrderStatus status,
            @RequestParam(required = false) WorkOrderPriority priority,
            @RequestParam(required = false) Long technicianId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(workOrderService.search(
                search,
                status,
                priority,
                technicianId,
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"))
        ));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','DISPATCHER','TECHNICIAN')")
    public ResponseEntity<WorkOrderResponse> get(@PathVariable Long id) {
        return ResponseEntity.ok(workOrderService.findById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','DISPATCHER')")
    public ResponseEntity<WorkOrderResponse> create(@Valid @RequestBody WorkOrderRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(workOrderService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','DISPATCHER')")
    public ResponseEntity<WorkOrderResponse> update(@PathVariable Long id, @Valid @RequestBody WorkOrderRequest request) {
        return ResponseEntity.ok(workOrderService.update(id, request));
    }

    @PostMapping("/{id}/assign")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','DISPATCHER')")
    public ResponseEntity<WorkOrderResponse> assign(@PathVariable Long id, @Valid @RequestBody AssignTechnicianRequest request) {
        return ResponseEntity.ok(workOrderService.assign(id, request));
    }

    @PostMapping("/{id}/schedule")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','DISPATCHER')")
    public ResponseEntity<WorkOrderResponse> schedule(@PathVariable Long id, @Valid @RequestBody ScheduleWorkOrderRequest request) {
        return ResponseEntity.ok(workOrderService.schedule(id, request));
    }

    @PostMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','DISPATCHER','TECHNICIAN')")
    public ResponseEntity<WorkOrderResponse> updateStatus(@PathVariable Long id, @Valid @RequestBody UpdateStatusRequest request) {
        return ResponseEntity.ok(workOrderService.updateStatus(id, request));
    }

    @PostMapping("/{id}/complete")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','DISPATCHER','TECHNICIAN')")
    public ResponseEntity<WorkOrderResponse> complete(
            @PathVariable Long id,
            @RequestBody(required = false) UpdateStatusRequest request
    ) {
        String notes = request != null ? request.notes() : null;
        return ResponseEntity.ok(workOrderService.complete(id, notes));
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','DISPATCHER')")
    public ResponseEntity<WorkOrderResponse> cancel(
            @PathVariable Long id,
            @RequestBody(required = false) UpdateStatusRequest request
    ) {
        String notes = request != null ? request.notes() : null;
        return ResponseEntity.ok(workOrderService.cancel(id, notes));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        workOrderService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/time-logs")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','DISPATCHER','TECHNICIAN')")
    public ResponseEntity<List<TimeLogResponse>> timeLogs(@PathVariable Long id) {
        return ResponseEntity.ok(workOrderOpsService.listTimeLogs(id));
    }

    @PostMapping("/{id}/time-logs")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','DISPATCHER','TECHNICIAN')")
    public ResponseEntity<TimeLogResponse> addTimeLog(
            @PathVariable Long id,
            @Valid @RequestBody TimeLogRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(workOrderOpsService.addTimeLog(id, request));
    }

    @GetMapping("/{id}/parts")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','DISPATCHER','TECHNICIAN')")
    public ResponseEntity<List<WorkOrderPartResponse>> parts(@PathVariable Long id) {
        return ResponseEntity.ok(workOrderOpsService.listParts(id));
    }

    @PostMapping("/{id}/parts")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','DISPATCHER','TECHNICIAN')")
    public ResponseEntity<WorkOrderPartResponse> addPart(
            @PathVariable Long id,
            @Valid @RequestBody WorkOrderPartRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(workOrderOpsService.addPart(id, request));
    }
}
