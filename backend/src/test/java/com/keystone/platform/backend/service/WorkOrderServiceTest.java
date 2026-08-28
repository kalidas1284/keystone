package com.keystone.platform.backend.service;

import com.keystone.platform.backend.dto.UpdateStatusRequest;
import com.keystone.platform.backend.entity.Customer;
import com.keystone.platform.backend.entity.Role;
import com.keystone.platform.backend.entity.User;
import com.keystone.platform.backend.entity.WorkOrder;
import com.keystone.platform.backend.entity.WorkOrderPriority;
import com.keystone.platform.backend.entity.WorkOrderStatus;
import com.keystone.platform.backend.exception.InvalidStatusTransitionException;
import com.keystone.platform.backend.repository.ScheduleRepository;
import com.keystone.platform.backend.repository.TechnicianRepository;
import com.keystone.platform.backend.repository.UserRepository;
import com.keystone.platform.backend.repository.WorkOrderRepository;
import com.keystone.platform.backend.util.SecurityUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class WorkOrderServiceTest {

    @Mock
    private WorkOrderRepository workOrderRepository;
    @Mock
    private CustomerService customerService;
    @Mock
    private TechnicianService technicianService;
    @Mock
    private TechnicianRepository technicianRepository;
    @Mock
    private ScheduleRepository scheduleRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private SecurityUtils securityUtils;
    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private WorkOrderService workOrderService;

    private User admin;
    private WorkOrder workOrder;

    @BeforeEach
    void setUp() {
        admin = User.builder()
                .id(1L)
                .fullName("Admin")
                .email("admin@test.com")
                .password("x")
                .role(Role.ADMIN)
                .active(true)
                .build();

        Customer customer = Customer.builder()
                .id(10L)
                .name("Acme")
                .email("ops@acme.com")
                .active(true)
                .build();

        workOrder = WorkOrder.builder()
                .id(100L)
                .workOrderNumber("WO-2026-00001")
                .customer(customer)
                .title("Repair")
                .priority(WorkOrderPriority.HIGH)
                .status(WorkOrderStatus.IN_PROGRESS)
                .build();
    }

    @Test
    void allowsValidTransitionToCompleted() {
        when(securityUtils.currentUser()).thenReturn(admin);
        when(workOrderRepository.findById(100L)).thenReturn(Optional.of(workOrder));
        when(workOrderRepository.save(any(WorkOrder.class))).thenAnswer(inv -> inv.getArgument(0));

        var response = workOrderService.updateStatus(100L, new UpdateStatusRequest(WorkOrderStatus.COMPLETED, "Done"));

        assertEquals(WorkOrderStatus.COMPLETED, response.status());
        assertNotNull(response.completedAt());
    }

    @Test
    void rejectsInvalidTransitionFromCompletedToNew() {
        workOrder.setStatus(WorkOrderStatus.COMPLETED);
        when(securityUtils.currentUser()).thenReturn(admin);
        when(workOrderRepository.findById(100L)).thenReturn(Optional.of(workOrder));

        assertThrows(
                InvalidStatusTransitionException.class,
                () -> workOrderService.updateStatus(100L, new UpdateStatusRequest(WorkOrderStatus.NEW, null))
        );
    }
}
