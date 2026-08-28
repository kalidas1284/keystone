package com.keystone.platform.backend.service;

import com.keystone.platform.backend.dto.CreateTechnicianAccountRequest;
import com.keystone.platform.backend.dto.PageResponse;
import com.keystone.platform.backend.dto.TechnicianRequest;
import com.keystone.platform.backend.dto.TechnicianResponse;
import com.keystone.platform.backend.dto.UpdateAvailabilityRequest;
import com.keystone.platform.backend.entity.AvailabilityStatus;
import com.keystone.platform.backend.entity.Role;
import com.keystone.platform.backend.entity.Technician;
import com.keystone.platform.backend.entity.User;
import com.keystone.platform.backend.exception.DuplicateResourceException;
import com.keystone.platform.backend.exception.ResourceNotFoundException;
import com.keystone.platform.backend.exception.ValidationException;
import com.keystone.platform.backend.repository.TechnicianRepository;
import com.keystone.platform.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TechnicianService {

    private final TechnicianRepository technicianRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public PageResponse<TechnicianResponse> search(
            String search,
            AvailabilityStatus availability,
            Boolean active,
            Pageable pageable
    ) {
        Page<Technician> page = technicianRepository.search(search, availability, active, pageable);
        return new PageResponse<>(
                page.getContent().stream().map(TechnicianResponse::from).toList(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages()
        );
    }

    @Transactional(readOnly = true)
    public TechnicianResponse findById(Long id) {
        return TechnicianResponse.from(getTechnician(id));
    }

    @Transactional
    public TechnicianResponse create(TechnicianRequest request) {
        if (technicianRepository.existsByEmployeeCodeIgnoreCase(request.employeeCode())) {
            throw new DuplicateResourceException("Employee code already exists");
        }

        User user = userRepository.findById(request.userId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + request.userId()));

        if (user.getRole() != Role.TECHNICIAN) {
            throw new ValidationException("Linked user must have TECHNICIAN role");
        }

        technicianRepository.findByUserId(user.getId()).ifPresent(existing -> {
            throw new DuplicateResourceException("Technician profile already exists for this user");
        });

        return TechnicianResponse.from(technicianRepository.save(buildTechnician(user, request.employeeCode(),
                request.phone(), request.specialization(), request.availabilityStatus(), request.currentLocation())));
    }

    @Transactional
    public TechnicianResponse createWithAccount(CreateTechnicianAccountRequest request) {
        if (technicianRepository.existsByEmployeeCodeIgnoreCase(request.employeeCode())) {
            throw new DuplicateResourceException("Employee code already exists");
        }
        if (userRepository.existsByEmailIgnoreCase(request.email())) {
            throw new DuplicateResourceException("Email is already registered");
        }

        User user = userRepository.save(User.builder()
                .fullName(request.fullName().trim())
                .email(request.email().trim().toLowerCase())
                .password(passwordEncoder.encode(request.password()))
                .phoneNumber(request.phone())
                .role(Role.TECHNICIAN)
                .active(true)
                .build());

        return TechnicianResponse.from(technicianRepository.save(buildTechnician(user, request.employeeCode(),
                request.phone(), request.specialization(), request.availabilityStatus(), request.currentLocation())));
    }

    private Technician buildTechnician(
            User user,
            String employeeCode,
            String phone,
            String specialization,
            AvailabilityStatus availabilityStatus,
            String currentLocation
    ) {
        return Technician.builder()
                .user(user)
                .employeeCode(employeeCode.trim().toUpperCase())
                .phone(phone)
                .specialization(specialization)
                .availabilityStatus(availabilityStatus != null ? availabilityStatus : AvailabilityStatus.AVAILABLE)
                .currentLocation(currentLocation)
                .active(true)
                .build();
    }

    @Transactional
    public TechnicianResponse update(Long id, TechnicianRequest request) {
        Technician technician = getTechnician(id);

        if (!technician.getEmployeeCode().equalsIgnoreCase(request.employeeCode())
                && technicianRepository.existsByEmployeeCodeIgnoreCase(request.employeeCode())) {
            throw new DuplicateResourceException("Employee code already exists");
        }

        technician.setEmployeeCode(request.employeeCode().trim().toUpperCase());
        technician.setPhone(request.phone());
        technician.setSpecialization(request.specialization());
        if (request.availabilityStatus() != null) {
            technician.setAvailabilityStatus(request.availabilityStatus());
        }
        technician.setCurrentLocation(request.currentLocation());

        return TechnicianResponse.from(technicianRepository.save(technician));
    }

    @Transactional
    public TechnicianResponse updateAvailability(Long id, UpdateAvailabilityRequest request) {
        Technician technician = getTechnician(id);
        technician.setAvailabilityStatus(request.availabilityStatus());
        return TechnicianResponse.from(technicianRepository.save(technician));
    }

    @Transactional
    public void deactivate(Long id) {
        Technician technician = getTechnician(id);
        technician.setActive(false);
        technician.setAvailabilityStatus(AvailabilityStatus.OFF_DUTY);
        technicianRepository.save(technician);
    }

    public Technician getTechnician(Long id) {
        return technicianRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Technician not found with id: " + id));
    }
}
