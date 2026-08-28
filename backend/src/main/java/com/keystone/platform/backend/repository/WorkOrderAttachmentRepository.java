package com.keystone.platform.backend.repository;

import com.keystone.platform.backend.entity.WorkOrderAttachment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WorkOrderAttachmentRepository extends JpaRepository<WorkOrderAttachment, Long> {
    List<WorkOrderAttachment> findByWorkOrderIdOrderByCreatedAtDesc(Long workOrderId);
}
