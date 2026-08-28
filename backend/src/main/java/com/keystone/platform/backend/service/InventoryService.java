package com.keystone.platform.backend.service;

import com.keystone.platform.backend.dto.InventoryItemRequest;
import com.keystone.platform.backend.dto.InventoryItemResponse;
import com.keystone.platform.backend.dto.PageResponse;
import com.keystone.platform.backend.dto.StockAdjustmentRequest;
import com.keystone.platform.backend.entity.InventoryItem;
import com.keystone.platform.backend.entity.InventoryTransaction;
import com.keystone.platform.backend.entity.InventoryTransactionType;
import com.keystone.platform.backend.exception.DuplicateResourceException;
import com.keystone.platform.backend.exception.ResourceNotFoundException;
import com.keystone.platform.backend.exception.ValidationException;
import com.keystone.platform.backend.repository.InventoryItemRepository;
import com.keystone.platform.backend.repository.InventoryTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InventoryItemRepository inventoryItemRepository;
    private final InventoryTransactionRepository inventoryTransactionRepository;

    @Transactional(readOnly = true)
    public PageResponse<InventoryItemResponse> search(String search, String category, Boolean active, Pageable pageable) {
        Page<InventoryItem> page = inventoryItemRepository.search(search, category, active, pageable);
        return new PageResponse<>(
                page.getContent().stream().map(InventoryItemResponse::from).toList(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages()
        );
    }

    @Transactional(readOnly = true)
    public InventoryItemResponse findById(Long id) {
        return InventoryItemResponse.from(getItem(id));
    }

    @Transactional(readOnly = true)
    public List<InventoryItemResponse> lowStock() {
        return inventoryItemRepository.findLowStock().stream().map(InventoryItemResponse::from).toList();
    }

    @Transactional
    public InventoryItemResponse create(InventoryItemRequest request) {
        if (inventoryItemRepository.existsByItemCodeIgnoreCase(request.itemCode())) {
            throw new DuplicateResourceException("Item code already exists");
        }

        InventoryItem item = InventoryItem.builder()
                .itemCode(request.itemCode().trim().toUpperCase())
                .name(request.name().trim())
                .description(request.description())
                .category(request.category())
                .quantity(request.quantity())
                .minimumStock(request.minimumStock())
                .unitPrice(request.unitPrice())
                .supplier(request.supplier())
                .active(true)
                .build();

        return InventoryItemResponse.from(inventoryItemRepository.save(item));
    }

    @Transactional
    public InventoryItemResponse update(Long id, InventoryItemRequest request) {
        InventoryItem item = getItem(id);

        if (!item.getItemCode().equalsIgnoreCase(request.itemCode())
                && inventoryItemRepository.existsByItemCodeIgnoreCase(request.itemCode())) {
            throw new DuplicateResourceException("Item code already exists");
        }

        item.setItemCode(request.itemCode().trim().toUpperCase());
        item.setName(request.name().trim());
        item.setDescription(request.description());
        item.setCategory(request.category());
        item.setMinimumStock(request.minimumStock());
        item.setUnitPrice(request.unitPrice());
        item.setSupplier(request.supplier());

        return InventoryItemResponse.from(inventoryItemRepository.save(item));
    }

    @Transactional
    public InventoryItemResponse stockIn(Long id, StockAdjustmentRequest request) {
        InventoryItem item = getItem(id);
        item.setQuantity(item.getQuantity() + request.quantity());
        inventoryItemRepository.save(item);

        inventoryTransactionRepository.save(InventoryTransaction.builder()
                .inventoryItem(item)
                .type(InventoryTransactionType.STOCK_IN)
                .quantity(request.quantity())
                .reference(request.reference())
                .notes(request.notes())
                .build());

        return InventoryItemResponse.from(item);
    }

    @Transactional
    public InventoryItemResponse stockOut(Long id, StockAdjustmentRequest request) {
        InventoryItem item = getItem(id);
        if (item.getQuantity() < request.quantity()) {
            throw new ValidationException("Insufficient stock. Available: " + item.getQuantity());
        }

        item.setQuantity(item.getQuantity() - request.quantity());
        inventoryItemRepository.save(item);

        inventoryTransactionRepository.save(InventoryTransaction.builder()
                .inventoryItem(item)
                .type(InventoryTransactionType.STOCK_OUT)
                .quantity(request.quantity())
                .reference(request.reference())
                .notes(request.notes())
                .build());

        return InventoryItemResponse.from(item);
    }

    @Transactional
    public void deactivate(Long id) {
        InventoryItem item = getItem(id);
        item.setActive(false);
        inventoryItemRepository.save(item);
    }

    public InventoryItem getItem(Long id) {
        return inventoryItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory item not found with id: " + id));
    }
}
