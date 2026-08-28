package com.keystone.platform.backend.repository;

import com.keystone.platform.backend.entity.Customer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
    boolean existsByEmailIgnoreCase(String email);

    Optional<Customer> findByUserId(Long userId);

    @Query("""
            SELECT c from Customer c
            WHERE (:active IS NULL OR c.active = :active)
              AND (
                :search IS NULL OR :search = '' OR
                LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(c.email) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(COALESCE(c.companyName, '')) LIKE LOWER(CONCAT('%', :search, '%'))
              )
            """)
    Page<Customer> search(@Param("search") String search, @Param("active") Boolean active, Pageable pageable);

    long countByActiveTrue();
}
