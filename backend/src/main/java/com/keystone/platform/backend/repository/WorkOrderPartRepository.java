package com.keystone.platform.backend.repository;

import com.keystone.platform.backend.entity.WorkOrderPart;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WorkOrderPartRepository extends JpaRepository<WorkOrderPart, Long> {
    List<WorkOrderPart> findByWorkOrderIdOrderByCreatedAtDesc(Long workOrderId);
}
