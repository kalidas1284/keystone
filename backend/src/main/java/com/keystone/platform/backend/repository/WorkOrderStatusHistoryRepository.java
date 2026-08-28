package com.keystone.platform.backend.repository;

import com.keystone.platform.backend.entity.WorkOrderStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WorkOrderStatusHistoryRepository extends JpaRepository<WorkOrderStatusHistory, Long> {
    List<WorkOrderStatusHistory> findByWorkOrderIdOrderByChangedAtAsc(Long workOrderId);
}

