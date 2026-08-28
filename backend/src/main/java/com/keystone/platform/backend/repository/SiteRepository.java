package com.keystone.platform.backend.repository;

import com.keystone.platform.backend.entity.Site;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface SiteRepository extends JpaRepository<Site, Long> {
    List<Site> findByCustomerIdOrderByCreatedAtDesc(Long customerId);

    @Query("""
            SELECT s
            FROM Site s
            WHERE s.customer.id = :customerId
              AND (
                :search IS NULL OR :search = '' OR
                LOWER(s.name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(s.location) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(COALESCE(s.notes, '')) LIKE LOWER(CONCAT('%', :search, '%'))
              )
            """)
    Page<Site> searchByCustomerId(
            @Param("customerId") Long customerId,
            @Param("search") String search,
            Pageable pageable
    );

    Optional<Site> findByIdAndCustomerId(Long id, Long customerId);
}

