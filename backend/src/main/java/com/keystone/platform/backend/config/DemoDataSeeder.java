package com.keystone.platform.backend.config;

import com.keystone.platform.backend.entity.AvailabilityStatus;
import com.keystone.platform.backend.entity.Customer;
import com.keystone.platform.backend.entity.InventoryItem;
import com.keystone.platform.backend.entity.Invoice;
import com.keystone.platform.backend.entity.InvoiceLine;
import com.keystone.platform.backend.entity.InvoiceLineType;
import com.keystone.platform.backend.entity.InvoiceStatus;
import com.keystone.platform.backend.entity.Role;
import com.keystone.platform.backend.entity.Technician;
import com.keystone.platform.backend.entity.User;
import com.keystone.platform.backend.entity.WorkOrder;
import com.keystone.platform.backend.entity.WorkOrderPart;
import com.keystone.platform.backend.entity.WorkOrderPriority;
import com.keystone.platform.backend.entity.WorkOrderStatus;
import com.keystone.platform.backend.entity.WorkOrderTimeLog;
import com.keystone.platform.backend.entity.Site;
import com.keystone.platform.backend.repository.CustomerRepository;
import com.keystone.platform.backend.repository.InventoryItemRepository;
import com.keystone.platform.backend.repository.InvoiceRepository;
import com.keystone.platform.backend.repository.TechnicianRepository;
import com.keystone.platform.backend.repository.SiteRepository;
import com.keystone.platform.backend.repository.UserRepository;
import com.keystone.platform.backend.repository.WorkOrderPartRepository;
import com.keystone.platform.backend.repository.WorkOrderRepository;
import com.keystone.platform.backend.repository.WorkOrderTimeLogRepository;
import com.keystone.platform.backend.util.SlaUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;

@Component
@ConditionalOnProperty(name = "app.seed.demo", havingValue = "true")
@Order(10)
@RequiredArgsConstructor
@Slf4j
public class DemoDataSeeder implements ApplicationRunner {

    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final TechnicianRepository technicianRepository;
    private final WorkOrderRepository workOrderRepository;
    private final WorkOrderTimeLogRepository timeLogRepository;
    private final WorkOrderPartRepository partRepository;
    private final InventoryItemRepository inventoryItemRepository;
    private final InvoiceRepository invoiceRepository;
    private final SiteRepository siteRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(ApplicationArguments args) {
        if (userRepository.count() > 0) {
            ensureDemoCustomer();
            return;
        }

        log.info("Seeding Keystone demo data...");

        userRepository.save(User.builder()
                .fullName("Admin User")
                .email("admin@keystone.local")
                .password(passwordEncoder.encode("password123"))
                .phoneNumber("555-0100")
                .role(Role.ADMIN)
                .active(true)
                .build());

        userRepository.save(User.builder()
                .fullName("Morgan Manager")
                .email("manager@keystone.local")
                .password(passwordEncoder.encode("password123"))
                .phoneNumber("555-0101")
                .role(Role.MANAGER)
                .active(true)
                .build());

        userRepository.save(User.builder()
                .fullName("Dana Dispatcher")
                .email("dispatcher@keystone.local")
                .password(passwordEncoder.encode("password123"))
                .phoneNumber("555-0102")
                .role(Role.DISPATCHER)
                .active(true)
                .build());

        User techUser = userRepository.save(User.builder()
                .fullName("Taylor Technician")
                .email("tech@keystone.local")
                .password(passwordEncoder.encode("password123"))
                .phoneNumber("555-0200")
                .role(Role.TECHNICIAN)
                .active(true)
                .build());

        Technician technician = technicianRepository.save(Technician.builder()
                .user(techUser)
                .employeeCode("TECH-001")
                .phone("555-0200")
                .specialization("HVAC")
                .availabilityStatus(AvailabilityStatus.AVAILABLE)
                .currentLocation("Austin Hub")
                .active(true)
                .build());

        User techUser2 = userRepository.save(User.builder()
                .fullName("Riley Electric")
                .email("tech2@keystone.local")
                .password(passwordEncoder.encode("password123"))
                .phoneNumber("555-0201")
                .role(Role.TECHNICIAN)
                .active(true)
                .build());

        technicianRepository.save(Technician.builder()
                .user(techUser2)
                .employeeCode("TECH-002")
                .phone("555-0201")
                .specialization("Electrical")
                .availabilityStatus(AvailabilityStatus.AVAILABLE)
                .currentLocation("North Depot")
                .active(true)
                .build());

        User techUser3 = userRepository.save(User.builder()
                .fullName("Jordan Plumbing")
                .email("tech3@keystone.local")
                .password(passwordEncoder.encode("password123"))
                .phoneNumber("555-0202")
                .role(Role.TECHNICIAN)
                .active(true)
                .build());

        technicianRepository.save(Technician.builder()
                .user(techUser3)
                .employeeCode("TECH-003")
                .phone("555-0202")
                .specialization("Plumbing")
                .availabilityStatus(AvailabilityStatus.AVAILABLE)
                .currentLocation("South Depot")
                .active(true)
                .build());

        User techUser4 = userRepository.save(User.builder()
                .fullName("Sam General")
                .email("tech4@keystone.local")
                .password(passwordEncoder.encode("password123"))
                .phoneNumber("555-0203")
                .role(Role.TECHNICIAN)
                .active(true)
                .build());

        technicianRepository.save(Technician.builder()
                .user(techUser4)
                .employeeCode("TECH-004")
                .phone("555-0203")
                .specialization("General Maintenance")
                .availabilityStatus(AvailabilityStatus.OFF_DUTY)
                .currentLocation("Austin Hub")
                .active(true)
                .build());

        User customerUser = userRepository.save(User.builder()
                .fullName("Casey Customer")
                .email("customer@keystone.local")
                .password(passwordEncoder.encode("password123"))
                .phoneNumber("555-0300")
                .role(Role.CUSTOMER)
                .active(true)
                .build());

        Customer customer = customerRepository.save(Customer.builder()
                .user(customerUser)
                .name("Acme Facilities")
                .email("ops@acme.com")
                .phone("555-1000")
                .companyName("Acme Corp")
                .address("100 Commerce Blvd")
                .city("Austin")
                .state("TX")
                .postalCode("78701")
                .notes("Preferred commercial account")
                .active(true)
                .build());

        // Required by the spec: customer -> sites -> work orders
        var site = siteRepository.save(Site.builder()
                .customer(customer)
                .name("Acme Main Building")
                .location("100 Commerce Blvd")
                .notes("Primary serviced location")
                .build());

        Instant now = Instant.now();

        workOrderRepository.save(WorkOrder.builder()
                .workOrderNumber("WO-2026-00001")
                .customer(customer)
                .site(site)
                .title("Rooftop AC inspection")
                .description("Quarterly HVAC preventive maintenance")
                .priority(WorkOrderPriority.HIGH)
                .status(WorkOrderStatus.ASSIGNED)
                .technician(technician)
                .scheduledDate(LocalDate.now().plusDays(2))
                .estimatedDuration(90)
                .location("100 Commerce Blvd")
                .notes("Check condensate drain")
                .slaDueAt(SlaUtils.calculateDueAt(WorkOrderPriority.HIGH, now))
                .build());

        // Open urgent job already past SLA — for monitor / dashboard demos
        workOrderRepository.save(WorkOrder.builder()
                .workOrderNumber("WO-2026-00002")
                .customer(customer)
                .site(site)
                .title("Lobby lighting outage")
                .description("Multiple fixtures down near main entrance")
                .priority(WorkOrderPriority.URGENT)
                .status(WorkOrderStatus.IN_PROGRESS)
                .technician(technician)
                .scheduledDate(LocalDate.now())
                .estimatedDuration(60)
                .location("100 Commerce Blvd")
                .notes("Escalate if not restored today")
                .slaDueAt(now.minus(2, ChronoUnit.HOURS))
                .build());

        InventoryItem filter = inventoryItemRepository.save(InventoryItem.builder()
                .itemCode("FILT-20")
                .name("Air Filter 20x20")
                .description("Standard commercial filter")
                .category("Filters")
                .quantity(3)
                .minimumStock(5)
                .unitPrice(new BigDecimal("12.50"))
                .supplier("PartsCo")
                .active(true)
                .build());

        inventoryItemRepository.save(InventoryItem.builder()
                .itemCode("BELT-A")
                .name("Drive Belt A")
                .description("Replacement belt")
                .category("Belts")
                .quantity(12)
                .minimumStock(4)
                .unitPrice(new BigDecimal("18.00"))
                .supplier("PartsCo")
                .active(true)
                .build());

        Instant completedAt = now.minus(1, ChronoUnit.DAYS);
        WorkOrder completed = workOrderRepository.save(WorkOrder.builder()
                .workOrderNumber("WO-2026-00003")
                .customer(customer)
                .site(site)
                .title("Chiller filter replacement")
                .description("Replace clogged filters and verify airflow")
                .priority(WorkOrderPriority.MEDIUM)
                .status(WorkOrderStatus.COMPLETED)
                .technician(technician)
                .scheduledDate(LocalDate.now().minusDays(1))
                .estimatedDuration(120)
                .location("100 Commerce Blvd — Roof")
                .notes("Completed on site")
                .slaDueAt(SlaUtils.calculateDueAt(WorkOrderPriority.MEDIUM, completedAt.minus(2, ChronoUnit.DAYS)))
                .completedAt(completedAt)
                .build());

        timeLogRepository.save(WorkOrderTimeLog.builder()
                .workOrder(completed)
                .loggedBy(techUser)
                .minutes(new BigDecimal("150.0"))
                .notes("Filter swap + airflow check")
                .build());

        partRepository.save(WorkOrderPart.builder()
                .workOrder(completed)
                .inventoryItem(filter)
                .quantity(2)
                .notes("Two rooftop units")
                .build());

        BigDecimal labor = new BigDecimal("212.50"); // 2.5 * 85
        BigDecimal parts = new BigDecimal("25.00"); // 2 * 12.50
        BigDecimal total = labor.add(parts);

        Invoice sentInvoice = Invoice.builder()
                .invoiceNumber("INV-2026-00001")
                .workOrder(completed)
                .customer(customer)
                .status(InvoiceStatus.SENT)
                .laborAmount(labor)
                .partsAmount(parts)
                .totalAmount(total)
                .notes("Demo invoice visible in customer portal")
                .lines(new ArrayList<>())
                .build();

        sentInvoice.getLines().add(InvoiceLine.builder()
                .invoice(sentInvoice)
                .lineType(InvoiceLineType.LABOR)
                .description("Labor (2.50 hrs @ $85.00/hr)")
                .quantity(new BigDecimal("2.50"))
                .unitPrice(new BigDecimal("85.00"))
                .lineTotal(labor)
                .build());
        sentInvoice.getLines().add(InvoiceLine.builder()
                .invoice(sentInvoice)
                .lineType(InvoiceLineType.PART)
                .description("FILT-20 — Air Filter 20x20")
                .quantity(new BigDecimal("2"))
                .unitPrice(new BigDecimal("12.50"))
                .lineTotal(parts)
                .build());
        invoiceRepository.save(sentInvoice);

        log.info("Demo users ready: admin/manager/dispatcher/tech/tech2/tech3/tech4/customer @keystone.local (password123)");
        log.info("Demo also seeded: breached urgent WO, completed WO with time/parts, SENT invoice INV-2026-00001");
    }

    /** Ensures portal demo login works on databases seeded before the customer account existed. */
    private void ensureDemoCustomer() {
        if (userRepository.findByEmailIgnoreCase("customer@keystone.local").isPresent()) {
            return;
        }

        log.info("Adding missing demo customer account (customer@keystone.local)...");

        User customerUser = userRepository.save(User.builder()
                .fullName("Casey Customer")
                .email("customer@keystone.local")
                .password(passwordEncoder.encode("password123"))
                .phoneNumber("555-0300")
                .role(Role.CUSTOMER)
                .active(true)
                .build());

        Customer customer = customerRepository.save(Customer.builder()
                .user(customerUser)
                .name("Acme Facilities")
                .email("ops@acme.com")
                .phone("555-1000")
                .companyName("Acme Corp")
                .address("100 Commerce Blvd")
                .city("Austin")
                .state("TX")
                .postalCode("78701")
                .notes("Preferred commercial account")
                .active(true)
                .build());

        siteRepository.save(Site.builder()
                .customer(customer)
                .name("Acme Main Building")
                .location("100 Commerce Blvd")
                .notes("Primary serviced location")
                .build());
    }
}
