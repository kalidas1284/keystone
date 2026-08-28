package com.keystone.platform.backend.controller;

import com.keystone.platform.backend.dto.CreateTechnicianAccountRequest;
import com.keystone.platform.backend.dto.PageResponse;
import com.keystone.platform.backend.dto.TechnicianRequest;
import com.keystone.platform.backend.dto.TechnicianResponse;
import com.keystone.platform.backend.dto.UpdateAvailabilityRequest;
import com.keystone.platform.backend.dto.WorkOrderResponse;
import com.keystone.platform.backend.entity.AvailabilityStatus;
import com.keystone.platform.backend.service.TechnicianService;
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
@RequestMapping("/api/technicians")
@RequiredArgsConstructor
public class TechnicianController {

    private final TechnicianService technicianService;
    private final WorkOrderService workOrderService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','DISPATCHER')")
    public ResponseEntity<PageResponse<TechnicianResponse>> list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) AvailabilityStatus availability,
            @RequestParam(required = false) Boolean active,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(technicianService.search(
                search,
                availability,
                active,
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"))
        ));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','DISPATCHER')")
    public ResponseEntity<TechnicianResponse> get(@PathVariable Long id) {
        return ResponseEntity.ok(technicianService.findById(id));
    }

    @GetMapping("/{id}/work-orders")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','DISPATCHER')")
    public ResponseEntity<List<WorkOrderResponse>> workOrders(@PathVariable Long id) {
        return ResponseEntity.ok(workOrderService.findByTechnician(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','DISPATCHER')")
    public ResponseEntity<TechnicianResponse> create(@Valid @RequestBody TechnicianRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(technicianService.create(request));
    }

    @PostMapping("/with-account")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','DISPATCHER')")
    public ResponseEntity<TechnicianResponse> createWithAccount(
            @Valid @RequestBody CreateTechnicianAccountRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(technicianService.createWithAccount(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<TechnicianResponse> update(@PathVariable Long id, @Valid @RequestBody TechnicianRequest request) {
        return ResponseEntity.ok(technicianService.update(id, request));
    }

    @PostMapping("/{id}/availability")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','DISPATCHER')")
    public ResponseEntity<TechnicianResponse> updateAvailability(
            @PathVariable Long id,
            @Valid @RequestBody UpdateAvailabilityRequest request
    ) {
        return ResponseEntity.ok(technicianService.updateAvailability(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<Void> deactivate(@PathVariable Long id) {
        technicianService.deactivate(id);
        return ResponseEntity.noContent().build();
    }
}
