package com.keystone.platform.backend.repository;

import com.keystone.platform.backend.entity.WorkOrderTimeLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WorkOrderTimeLogRepository extends JpaRepository<WorkOrderTimeLog, Long> {
    List<WorkOrderTimeLog> findByWorkOrderIdOrderByCreatedAtDesc(Long workOrderId);
}
