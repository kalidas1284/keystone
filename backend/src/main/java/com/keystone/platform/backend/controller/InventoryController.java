package com.keystone.platform.backend.controller;

import com.keystone.platform.backend.dto.InventoryItemRequest;
import com.keystone.platform.backend.dto.InventoryItemResponse;
import com.keystone.platform.backend.dto.PageResponse;
import com.keystone.platform.backend.dto.StockAdjustmentRequest;
import com.keystone.platform.backend.service.InventoryService;
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
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','DISPATCHER','TECHNICIAN')")
    public ResponseEntity<PageResponse<InventoryItemResponse>> list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Boolean active,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(inventoryService.search(
                search,
                category,
                active,
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"))
        ));
    }

    @GetMapping("/low-stock")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','DISPATCHER')")
    public ResponseEntity<List<InventoryItemResponse>> lowStock() {
        return ResponseEntity.ok(inventoryService.lowStock());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','DISPATCHER','TECHNICIAN')")
    public ResponseEntity<InventoryItemResponse> get(@PathVariable Long id) {
        return ResponseEntity.ok(inventoryService.findById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<InventoryItemResponse> create(@Valid @RequestBody InventoryItemRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(inventoryService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<InventoryItemResponse> update(@PathVariable Long id, @Valid @RequestBody InventoryItemRequest request) {
        return ResponseEntity.ok(inventoryService.update(id, request));
    }

    @PostMapping("/{id}/stock-in")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<InventoryItemResponse> stockIn(@PathVariable Long id, @Valid @RequestBody StockAdjustmentRequest request) {
        return ResponseEntity.ok(inventoryService.stockIn(id, request));
    }

    @PostMapping("/{id}/stock-out")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<InventoryItemResponse> stockOut(@PathVariable Long id, @Valid @RequestBody StockAdjustmentRequest request) {
        return ResponseEntity.ok(inventoryService.stockOut(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<Void> deactivate(@PathVariable Long id) {
        inventoryService.deactivate(id);
        return ResponseEntity.noContent().build();
    }
}
