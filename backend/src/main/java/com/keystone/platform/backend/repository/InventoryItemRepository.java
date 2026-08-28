package com.keystone.platform.backend.repository;

import com.keystone.platform.backend.entity.InventoryItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface InventoryItemRepository extends JpaRepository<InventoryItem, Long> {
    boolean existsByItemCodeIgnoreCase(String itemCode);

    @Query("""
            SELECT i from InventoryItem i
            WHERE (:active IS NULL OR i.active = :active)
              AND (:category IS NULL OR :category = '' OR LOWER(i.category) = LOWER(:category))
              AND (
                :search IS NULL OR :search = '' OR
                LOWER(i.itemCode) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(i.name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(COALESCE(i.category, '')) LIKE LOWER(CONCAT('%', :search, '%'))
              )
            """)
    Page<InventoryItem> search(
            @Param("search") String search,
            @Param("category") String category,
            @Param("active") Boolean active,
            Pageable pageable
    );

    @Query("SELECT i FROM InventoryItem i WHERE i.active = true AND i.quantity <= i.minimumStock AND i.quantity > 0")
    List<InventoryItem> findLowStock();

    @Query("SELECT i FROM InventoryItem i WHERE i.active = true AND i.quantity = 0")
    List<InventoryItem> findOutOfStock();

    long countByActiveTrue();

    @Query("SELECT COUNT(i) FROM InventoryItem i WHERE i.active = true AND i.quantity <= i.minimumStock AND i.quantity > 0")
    long countLowStock();

    @Query("SELECT COUNT(i) FROM InventoryItem i WHERE i.active = true AND i.quantity = 0")
    long countOutOfStock();
}
