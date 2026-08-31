package com.keystone.platform.backend.controller;

import com.keystone.platform.backend.dto.InvoiceResponse;
import com.keystone.platform.backend.dto.PortalRequestCreate;
import com.keystone.platform.backend.dto.PortalWorkOrderResponse;
import com.keystone.platform.backend.dto.SiteResponse;
import com.keystone.platform.backend.service.PortalService;
import com.keystone.platform.backend.exception.ResourceNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/portal")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CUSTOMER')")
public class PortalController {

    private final PortalService portalService;

    @GetMapping("/requests")
    public ResponseEntity<List<PortalWorkOrderResponse>> myRequests() {
        return ResponseEntity.ok(portalService.myRequests());
    }

    @GetMapping("/sites")
    public ResponseEntity<List<SiteResponse>> mySites() {
        return ResponseEntity.ok(portalService.mySites());
    }

    @GetMapping("/requests/{id}")
    public ResponseEntity<PortalWorkOrderResponse> getRequest(@PathVariable Long id) {
        return ResponseEntity.ok(portalService.getRequest(id));
    }

    @PostMapping("/requests")
    public ResponseEntity<PortalWorkOrderResponse> createRequest(@Valid @RequestBody PortalRequestCreate request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(portalService.createRequest(request));
    }

    @GetMapping("/invoices")
    public ResponseEntity<List<InvoiceResponse>> myInvoices() {
        throw new ResourceNotFoundException("Invoicing is out of scope for KEYSTONE (spec).");
    }

    @GetMapping("/invoices/{id}")
    public ResponseEntity<InvoiceResponse> getInvoice(@PathVariable Long id) {
        throw new ResourceNotFoundException("Invoicing is out of scope for KEYSTONE (spec).");
    }
}
