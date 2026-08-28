package com.keystone.platform.backend.repository;

import com.keystone.platform.backend.entity.AvailabilityStatus;
import com.keystone.platform.backend.entity.Technician;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface TechnicianRepository extends JpaRepository<Technician, Long> {
    boolean existsByEmployeeCodeIgnoreCase(String employeeCode);

    Optional<Technician> findByUserId(Long userId);

    @Query("""
            SELECT t from Technician t JOIN t.user u
            WHERE (:active IS NULL OR t.active = :active)
              AND (:availability IS NULL OR t.availabilityStatus = :availability)
              AND (
                :search IS NULL OR :search = '' OR
                LOWER(u.fullName) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(COALESCE(t.specialization, '')) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(t.employeeCode) LIKE LOWER(CONCAT('%', :search, '%'))
              )
            """)
    Page<Technician> search(
            @Param("search") String search,
            @Param("availability") AvailabilityStatus availability,
            @Param("active") Boolean active,
            Pageable pageable
    );

    long countByActiveTrue();
}
