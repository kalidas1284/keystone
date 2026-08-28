package com.keystone.platform.backend.service;

import com.keystone.platform.backend.dto.StockAdjustmentRequest;
import com.keystone.platform.backend.entity.InventoryItem;
import com.keystone.platform.backend.exception.ValidationException;
import com.keystone.platform.backend.repository.InventoryItemRepository;
import com.keystone.platform.backend.repository.InventoryTransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class InventoryServiceTest {

    @Mock
    private InventoryItemRepository inventoryItemRepository;
    @Mock
    private InventoryTransactionRepository inventoryTransactionRepository;

    @InjectMocks
    private InventoryService inventoryService;

    private InventoryItem item;

    @BeforeEach
    void setUp() {
        item = InventoryItem.builder()
                .id(1L)
                .itemCode("FILT-20")
                .name("Air Filter")
                .quantity(2)
                .minimumStock(5)
                .unitPrice(new BigDecimal("12.50"))
                .active(true)
                .build();
    }

    @Test
    void stockOutRejectsNegativeQuantity() {
        when(inventoryItemRepository.findById(1L)).thenReturn(Optional.of(item));

        assertThrows(
                ValidationException.class,
                () -> inventoryService.stockOut(1L, new StockAdjustmentRequest(5, "WO-1", null))
        );

        verify(inventoryTransactionRepository, never()).save(any());
        assertEquals(2, item.getQuantity());
    }

    @Test
    void stockInIncreasesQuantity() {
        when(inventoryItemRepository.findById(1L)).thenReturn(Optional.of(item));
        when(inventoryItemRepository.save(any(InventoryItem.class))).thenAnswer(inv -> inv.getArgument(0));

        var response = inventoryService.stockIn(1L, new StockAdjustmentRequest(3, "PO-1", null));

        assertEquals(5, response.quantity());
        assertEquals("LOW_STOCK", response.stockStatus());
    }
}
