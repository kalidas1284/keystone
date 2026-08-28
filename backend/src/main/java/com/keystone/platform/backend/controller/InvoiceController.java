package com.keystone.platform.backend.controller;

import com.keystone.platform.backend.dto.InvoiceResponse;
import com.keystone.platform.backend.dto.UpdateInvoiceStatusRequest;
import com.keystone.platform.backend.service.InvoiceService;
import com.keystone.platform.backend.exception.ResourceNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
public class InvoiceController {

    private final InvoiceService invoiceService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<List<InvoiceResponse>> list() {
        throw new ResourceNotFoundException("Invoicing is out of scope for KEYSTONE (spec).");
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<InvoiceResponse> get(@PathVariable Long id) {
        throw new ResourceNotFoundException("Invoicing is out of scope for KEYSTONE (spec).");
    }

    @GetMapping("/by-work-order/{workOrderId}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','DISPATCHER')")
    public ResponseEntity<InvoiceResponse> byWorkOrder(@PathVariable Long workOrderId) {
        throw new ResourceNotFoundException("Invoicing is out of scope for KEYSTONE (spec).");
    }

    @PostMapping("/from-work-order/{workOrderId}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<InvoiceResponse> generate(@PathVariable Long workOrderId) {
        throw new ResourceNotFoundException("Invoicing is out of scope for KEYSTONE (spec).");
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<InvoiceResponse> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateInvoiceStatusRequest request
    ) {
        throw new ResourceNotFoundException("Invoicing is out of scope for KEYSTONE (spec).");
    }
}
