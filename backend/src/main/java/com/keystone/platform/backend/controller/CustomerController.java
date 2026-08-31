package com.keystone.platform.backend.controller;

import com.keystone.platform.backend.dto.CustomerRequest;
import com.keystone.platform.backend.dto.CustomerResponse;
import com.keystone.platform.backend.dto.LinkPortalUserRequest;
import com.keystone.platform.backend.dto.PageResponse;
import com.keystone.platform.backend.dto.SiteRequest;
import com.keystone.platform.backend.dto.SiteResponse;
import com.keystone.platform.backend.dto.UserResponse;
import com.keystone.platform.backend.dto.WorkOrderResponse;
import com.keystone.platform.backend.service.CustomerService;
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
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;
    private final WorkOrderService workOrderService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','DISPATCHER')")
    public ResponseEntity<PageResponse<CustomerResponse>> list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean active,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(customerService.search(
                search,
                active,
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"))
        ));
    }

    @GetMapping("/available-portal-users")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<List<UserResponse>> availablePortalUsers() {
        return ResponseEntity.ok(customerService.availablePortalUsers());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','DISPATCHER')")
    public ResponseEntity<CustomerResponse> get(@PathVariable Long id) {
        return ResponseEntity.ok(customerService.findById(id));
    }

    @GetMapping("/{id}/work-orders")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','DISPATCHER')")
    public ResponseEntity<List<WorkOrderResponse>> workOrders(@PathVariable Long id) {
        return ResponseEntity.ok(workOrderService.findByCustomer(id));
    }

    @GetMapping("/{id}/sites")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','DISPATCHER')")
    public ResponseEntity<PageResponse<SiteResponse>> sites(
            @PathVariable Long id,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(customerService.findSitesForCustomer(
                id,
                search,
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"))
        ));
    }

    @PostMapping("/{id}/sites")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','DISPATCHER')")
    public ResponseEntity<SiteResponse> createSite(
            @PathVariable Long id,
            @Valid @RequestBody SiteRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(customerService.createSite(id, request));
    }

    @PutMapping("/{customerId}/sites/{siteId}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','DISPATCHER')")
    public ResponseEntity<SiteResponse> updateSite(
            @PathVariable Long customerId,
            @PathVariable Long siteId,
            @Valid @RequestBody SiteRequest request
    ) {
        return ResponseEntity.ok(customerService.updateSite(customerId, siteId, request));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','DISPATCHER')")
    public ResponseEntity<CustomerResponse> create(@Valid @RequestBody CustomerRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(customerService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','DISPATCHER')")
    public ResponseEntity<CustomerResponse> update(@PathVariable Long id, @Valid @RequestBody CustomerRequest request) {
        return ResponseEntity.ok(customerService.update(id, request));
    }

    @PutMapping("/{id}/portal-user")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<CustomerResponse> linkPortalUser(
            @PathVariable Long id,
            @Valid @RequestBody LinkPortalUserRequest request
    ) {
        return ResponseEntity.ok(customerService.linkPortalUser(id, request));
    }

    @DeleteMapping("/{id}/portal-user")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<CustomerResponse> unlinkPortalUser(@PathVariable Long id) {
        return ResponseEntity.ok(customerService.unlinkPortalUser(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<Void> deactivate(@PathVariable Long id) {
        customerService.deactivate(id);
        return ResponseEntity.noContent().build();
    }
}
