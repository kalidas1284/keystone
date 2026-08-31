package com.keystone.platform.backend.repository;

import com.keystone.platform.backend.entity.WorkOrder;
import com.keystone.platform.backend.entity.WorkOrderPriority;
import com.keystone.platform.backend.entity.WorkOrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface WorkOrderRepository extends JpaRepository<WorkOrder, Long> {
    long countByStatus(WorkOrderStatus status);

    long countByPriorityAndStatusNotIn(WorkOrderPriority priority, List<WorkOrderStatus> statuses);

    long countByCustomerId(Long customerId);

    long countByCustomerIdAndStatus(Long customerId, WorkOrderStatus status);

    long countByTechnicianId(Long technicianId);

    long countByTechnicianIdAndStatus(Long technicianId, WorkOrderStatus status);

    long countByTechnicianIdAndStatusIn(Long technicianId, List<WorkOrderStatus> statuses);

    long countBySiteId(Long siteId);

    long countBySiteIdAndStatus(Long siteId, WorkOrderStatus status);

    List<WorkOrder> findTop10ByOrderByCreatedAtDesc();

    List<WorkOrder> findByCustomerIdOrderByCreatedAtDesc(Long customerId);

    List<WorkOrder> findByTechnicianIdOrderByCreatedAtDesc(Long technicianId);

    @Query("""
            SELECT w from WorkOrder w
            LEFT JOIN w.customer c
            LEFT JOIN w.technician t
            LEFT JOIN t.user u
            WHERE (:status IS NULL OR w.status = :status)
              AND (:priority IS NULL OR w.priority = :priority)
              AND (:technicianId IS NULL OR t.id = :technicianId)
              AND (
                :search IS NULL OR :search = '' OR
                LOWER(w.workOrderNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(w.title) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(COALESCE(u.fullName, '')) LIKE LOWER(CONCAT('%', :search, '%'))
              )
            """)
    Page<WorkOrder> search(
            @Param("search") String search,
            @Param("status") WorkOrderStatus status,
            @Param("priority") WorkOrderPriority priority,
            @Param("technicianId") Long technicianId,
            Pageable pageable
    );

    @Query("SELECT COUNT(w) FROM WorkOrder w WHERE w.status NOT IN :statuses")
    long countOpen(@Param("statuses") List<WorkOrderStatus> statuses);

    @Query("""
            SELECT w FROM WorkOrder w
            WHERE w.status NOT IN :statuses
              AND w.slaDueAt IS NOT NULL
            """)
    List<WorkOrder> findOpenWithSlaDue(@Param("statuses") List<WorkOrderStatus> statuses);
}
