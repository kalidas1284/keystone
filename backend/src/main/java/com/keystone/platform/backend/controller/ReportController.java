package com.keystone.platform.backend.controller;

import com.keystone.platform.backend.dto.CustomerSummaryItem;
import com.keystone.platform.backend.dto.DashboardResponse;
import com.keystone.platform.backend.dto.InventoryReport;
import com.keystone.platform.backend.dto.TechnicianWorkloadItem;
import com.keystone.platform.backend.dto.SiteSummaryItem;
import com.keystone.platform.backend.dto.WorkOrderSummaryReport;
import com.keystone.platform.backend.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping({"/dashboard", "/summary"})
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','DISPATCHER')")
    public ResponseEntity<DashboardResponse> dashboard() {
        return ResponseEntity.ok(reportService.dashboard());
    }

    @GetMapping("/work-orders")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<WorkOrderSummaryReport> workOrders() {
        return ResponseEntity.ok(reportService.workOrderSummary());
    }

    @GetMapping("/technicians")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<List<TechnicianWorkloadItem>> technicians() {
        return ResponseEntity.ok(reportService.technicianWorkload());
    }

    @GetMapping("/customers")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<List<CustomerSummaryItem>> customers() {
        return ResponseEntity.ok(reportService.customerSummary());
    }

    @GetMapping("/sites")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<List<SiteSummaryItem>> sites() {
        return ResponseEntity.ok(reportService.siteSummary());
    }

    @GetMapping("/inventory")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<InventoryReport> inventory() {
        return ResponseEntity.ok(reportService.inventoryReport());
    }
}
