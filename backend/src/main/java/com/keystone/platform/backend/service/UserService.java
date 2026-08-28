package com.keystone.platform.backend.service;

import com.keystone.platform.backend.dto.ChangePasswordRequest;
import com.keystone.platform.backend.dto.CreateUserRequest;
import com.keystone.platform.backend.dto.UpdateProfileRequest;
import com.keystone.platform.backend.dto.UpdateUserRequest;
import com.keystone.platform.backend.dto.UserResponse;
import com.keystone.platform.backend.entity.Role;
import com.keystone.platform.backend.entity.User;
import com.keystone.platform.backend.exception.DuplicateResourceException;
import com.keystone.platform.backend.exception.ResourceNotFoundException;
import com.keystone.platform.backend.exception.UnauthorizedException;
import com.keystone.platform.backend.exception.ValidationException;
import com.keystone.platform.backend.repository.UserRepository;
import com.keystone.platform.backend.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final SecurityUtils securityUtils;

    @Transactional(readOnly = true)
    public List<UserResponse> findAll() {
        return userRepository.findAll().stream().map(UserResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<UserResponse> findByRole(Role role) {
        return userRepository.findByRoleAndActiveTrue(role).stream().map(UserResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public UserResponse findById(Long id) {
        return UserResponse.from(getUser(id));
    }

    @Transactional
    public UserResponse create(CreateUserRequest request) {
        if (request.role() == Role.CUSTOMER) {
            throw new ValidationException("Use public registration for CUSTOMER accounts");
        }

        if (userRepository.existsByEmailIgnoreCase(request.email())) {
            throw new DuplicateResourceException("Email is already registered");
        }

        User user = User.builder()
                .fullName(request.fullName().trim())
                .email(request.email().trim().toLowerCase())
                .password(passwordEncoder.encode(request.password()))
                .phoneNumber(request.phoneNumber())
                .role(request.role())
                .active(true)
                .build();

        return UserResponse.from(userRepository.save(user));
    }

    @Transactional
    public UserResponse update(Long id, UpdateUserRequest request) {
        User user = getUser(id);

        userRepository.findByEmailIgnoreCase(request.email().trim())
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw new DuplicateResourceException("Email is already registered");
                });

        user.setFullName(request.fullName().trim());
        user.setEmail(request.email().trim().toLowerCase());
        user.setPhoneNumber(request.phoneNumber());
        user.setRole(request.role());
        user.setActive(request.active());

        return UserResponse.from(userRepository.save(user));
    }

    @Transactional
    public UserResponse updateProfile(UpdateProfileRequest request) {
        User user = securityUtils.currentUser();
        user.setFullName(request.fullName().trim());
        user.setPhoneNumber(request.phoneNumber());
        return UserResponse.from(userRepository.save(user));
    }

    @Transactional
    public void changePassword(ChangePasswordRequest request) {
        User user = securityUtils.currentUser();
        if (!passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
            throw new UnauthorizedException("Current password is incorrect");
        }
        if (request.currentPassword().equals(request.newPassword())) {
            throw new ValidationException("New password must be different from the current password");
        }
        user.setPassword(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
    }

    @Transactional
    public void deactivate(Long id) {
        User user = getUser(id);
        user.setActive(false);
        userRepository.save(user);
    }

    public User getUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    public User getByEmail(String email) {
        return userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
