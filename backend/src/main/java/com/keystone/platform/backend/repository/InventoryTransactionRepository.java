package com.keystone.platform.backend.repository;

import com.keystone.platform.backend.entity.InventoryTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InventoryTransactionRepository extends JpaRepository<InventoryTransaction, Long> {
    List<InventoryTransaction> findByInventoryItemIdOrderByCreatedAtDesc(Long inventoryItemId);
}
