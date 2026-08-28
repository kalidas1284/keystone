package com.keystone.platform.backend.service;

import com.keystone.platform.backend.entity.Role;
import com.keystone.platform.backend.entity.SlaStatus;
import com.keystone.platform.backend.entity.User;
import com.keystone.platform.backend.entity.WorkOrder;
import com.keystone.platform.backend.entity.WorkOrderStatus;
import com.keystone.platform.backend.repository.UserRepository;
import com.keystone.platform.backend.repository.WorkOrderRepository;
import com.keystone.platform.backend.util.SlaUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.ArrayList;

@Service
@RequiredArgsConstructor
@Slf4j
public class SlaMonitorService {

    private final WorkOrderRepository workOrderRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Scheduled(fixedDelayString = "${app.sla.monitor-interval-ms:300000}")
    @Transactional
    public void scanOpenWorkOrders() {
        List<WorkOrder> open = workOrderRepository.findOpenWithSlaDue(List.of(
                WorkOrderStatus.COMPLETED,
                WorkOrderStatus.CLOSED,
                WorkOrderStatus.CANCELLED
        ));

        int alerts = 0;
        for (WorkOrder workOrder : open) {
            if (notifySlaIfNeeded(workOrder)) {
                alerts++;
            }
        }
        if (alerts > 0) {
            log.info("SLA monitor sent {} alert(s)", alerts);
        }
    }

    /**
     * @return true if a new alert was sent
     */
    @Transactional
    public boolean notifySlaIfNeeded(WorkOrder workOrder) {
        SlaStatus sla = SlaUtils.resolveStatus(workOrder);
        if (sla != SlaStatus.AT_RISK && sla != SlaStatus.BREACHED) {
            return false;
        }
        if (workOrder.getStatus() == WorkOrderStatus.COMPLETED
                || workOrder.getStatus() == WorkOrderStatus.CLOSED
                || workOrder.getStatus() == WorkOrderStatus.CANCELLED) {
            return false;
        }
        if (workOrder.getLastSlaAlertStatus() == sla) {
            return false;
        }

        String title = sla == SlaStatus.BREACHED ? "SLA breached" : "SLA at risk";
        String message = workOrder.getWorkOrderNumber() + " — " + workOrder.getTitle();
        String link = "/work-orders/" + workOrder.getId();

        List<User> recipients = new ArrayList<>();
        recipients.addAll(userRepository.findByRoleAndActiveTrue(Role.MANAGER));
        recipients.addAll(userRepository.findByRoleAndActiveTrue(Role.DISPATCHER));

        if (recipients.isEmpty()) {
            recipients.addAll(userRepository.findByRoleAndActiveTrue(Role.ADMIN));
        }

        recipients = recipients.stream().distinct().toList();
        recipients.forEach(user -> notificationService.notifyUser(user, title, message, "SLA", link));

        workOrder.setLastSlaAlertStatus(sla);
        workOrderRepository.save(workOrder);
        return true;
    }
}
