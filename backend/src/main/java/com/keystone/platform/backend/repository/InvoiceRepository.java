package com.keystone.platform.backend.repository;

import com.keystone.platform.backend.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    List<Invoice> findAllByOrderByCreatedAtDesc();

    List<Invoice> findByCustomerIdOrderByCreatedAtDesc(Long customerId);

    Optional<Invoice> findByWorkOrderId(Long workOrderId);

    boolean existsByWorkOrderId(Long workOrderId);
}
