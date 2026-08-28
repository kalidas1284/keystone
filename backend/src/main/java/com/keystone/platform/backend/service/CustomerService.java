package com.keystone.platform.backend.service;

import com.keystone.platform.backend.dto.CustomerRequest;
import com.keystone.platform.backend.dto.CustomerResponse;
import com.keystone.platform.backend.dto.LinkPortalUserRequest;
import com.keystone.platform.backend.dto.PageResponse;
import com.keystone.platform.backend.dto.SiteRequest;
import com.keystone.platform.backend.dto.SiteResponse;
import com.keystone.platform.backend.dto.UserResponse;
import com.keystone.platform.backend.entity.Customer;
import com.keystone.platform.backend.entity.Site;
import com.keystone.platform.backend.entity.Role;
import com.keystone.platform.backend.entity.User;
import com.keystone.platform.backend.exception.ResourceNotFoundException;
import com.keystone.platform.backend.exception.ValidationException;
import com.keystone.platform.backend.repository.CustomerRepository;
import com.keystone.platform.backend.repository.SiteRepository;
import com.keystone.platform.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;
    private final SiteRepository siteRepository;

    @Transactional(readOnly = true)
    public PageResponse<CustomerResponse> search(String search, Boolean active, Pageable pageable) {
        Page<Customer> page = customerRepository.search(search, active, pageable);
        return new PageResponse<>(
                page.getContent().stream().map(CustomerResponse::from).toList(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages()
        );
    }

    @Transactional(readOnly = true)
    public CustomerResponse findById(Long id) {
        return CustomerResponse.from(getCustomer(id));
    }

    @Transactional
    public CustomerResponse create(CustomerRequest request) {
        Customer customer = Customer.builder()
                .name(request.name().trim())
                .email(request.email().trim().toLowerCase())
                .phone(request.phone())
                .companyName(request.companyName())
                .address(request.address())
                .city(request.city())
                .state(request.state())
                .postalCode(request.postalCode())
                .notes(request.notes())
                .active(true)
                .build();
        return CustomerResponse.from(customerRepository.save(customer));
    }

    @Transactional
    public CustomerResponse update(Long id, CustomerRequest request) {
        Customer customer = getCustomer(id);
        customer.setName(request.name().trim());
        customer.setEmail(request.email().trim().toLowerCase());
        customer.setPhone(request.phone());
        customer.setCompanyName(request.companyName());
        customer.setAddress(request.address());
        customer.setCity(request.city());
        customer.setState(request.state());
        customer.setPostalCode(request.postalCode());
        customer.setNotes(request.notes());
        return CustomerResponse.from(customerRepository.save(customer));
    }

    @Transactional
    public void deactivate(Long id) {
        Customer customer = getCustomer(id);
        customer.setActive(false);
        customerRepository.save(customer);
    }

    @Transactional(readOnly = true)
    public List<UserResponse> availablePortalUsers() {
        return userRepository.findByRoleAndActiveTrue(Role.CUSTOMER).stream()
                .filter(user -> customerRepository.findByUserId(user.getId()).isEmpty())
                .map(UserResponse::from)
                .toList();
    }

    @Transactional
    public CustomerResponse linkPortalUser(Long customerId, LinkPortalUserRequest request) {
        Customer customer = getCustomer(customerId);
        User user = userRepository.findById(request.userId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getRole() != Role.CUSTOMER) {
            throw new ValidationException("Only CUSTOMER users can be linked to a customer profile");
        }
        if (!user.isActive()) {
            throw new ValidationException("Cannot link an inactive user");
        }

        customerRepository.findByUserId(user.getId())
                .filter(existing -> !existing.getId().equals(customerId))
                .ifPresent(existing -> {
                    throw new ValidationException("That portal user is already linked to another customer");
                });

        customer.setUser(user);
        return CustomerResponse.from(customerRepository.save(customer));
    }

    @Transactional
    public CustomerResponse unlinkPortalUser(Long customerId) {
        Customer customer = getCustomer(customerId);
        customer.setUser(null);
        return CustomerResponse.from(customerRepository.save(customer));
    }

    public Customer getCustomer(Long id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public List<SiteResponse> findSitesForCustomer(Long customerId, String search, Pageable pageable) {
        // Reuses existing "customer exists" behaviour for consistent errors.
        getCustomer(customerId);

        return siteRepository
                .searchByCustomerId(customerId, search, pageable)
                .getContent()
                .stream()
                .map(SiteResponse::from)
                .toList();
    }

    @Transactional
    public SiteResponse createSite(Long customerId, SiteRequest request) {
        Customer customer = getCustomer(customerId);
        if (!customer.isActive()) {
            throw new ValidationException("Cannot create a site for inactive customer");
        }
        if (!customerId.equals(request.customerId())) {
            throw new ValidationException("Site customerId does not match route customerId");
        }

        Site site = Site.builder()
                .customer(customer)
                .name(request.name().trim())
                .location(request.location().trim())
                .notes(request.notes())
                .build();
        return SiteResponse.from(siteRepository.save(site));
    }

    @Transactional
    public SiteResponse updateSite(Long customerId, Long siteId, SiteRequest request) {
        Customer customer = getCustomer(customerId);
        if (!customer.isActive()) {
            throw new ValidationException("Cannot update a site for inactive customer");
        }
        if (!customerId.equals(request.customerId())) {
            throw new ValidationException("Site customerId does not match route customerId");
        }

        Site site = siteRepository.findByIdAndCustomerId(siteId, customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Site not found with id: " + siteId));

        site.setName(request.name().trim());
        site.setLocation(request.location().trim());
        site.setNotes(request.notes());
        return SiteResponse.from(siteRepository.save(site));
    }
}
