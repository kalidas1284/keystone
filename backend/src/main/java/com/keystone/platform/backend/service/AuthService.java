package com.keystone.platform.backend.service;

import com.keystone.platform.backend.dto.LoginRequest;
import com.keystone.platform.backend.dto.LoginResponse;
import com.keystone.platform.backend.dto.RegisterRequest;
import com.keystone.platform.backend.dto.UserResponse;
import com.keystone.platform.backend.entity.Customer;
import com.keystone.platform.backend.entity.Role;
import com.keystone.platform.backend.entity.User;
import com.keystone.platform.backend.exception.DuplicateResourceException;
import com.keystone.platform.backend.exception.UnauthorizedException;
import com.keystone.platform.backend.exception.ValidationException;
import com.keystone.platform.backend.repository.CustomerRepository;
import com.keystone.platform.backend.repository.UserRepository;
import com.keystone.platform.backend.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public UserResponse register(RegisterRequest request) {
        // Public self-registration is limited to CUSTOMER accounts only.
        // Staff accounts must be provisioned by an ADMIN via POST /api/users.
        if (request.role() != null && request.role() != Role.CUSTOMER) {
            throw new ValidationException("Public registration is limited to CUSTOMER accounts. Contact an administrator for staff access.");
        }

        if (userRepository.existsByEmailIgnoreCase(request.email())) {
            throw new DuplicateResourceException("Email is already registered");
        }

        User user = User.builder()
                .fullName(request.fullName().trim())
                .email(request.email().trim().toLowerCase())
                .password(passwordEncoder.encode(request.password()))
                .phoneNumber(request.phoneNumber())
                .role(Role.CUSTOMER)
                .active(true)
                .build();

        User saved = userRepository.save(user);

        customerRepository.save(Customer.builder()
                .user(saved)
                .name(saved.getFullName())
                .email(saved.getEmail())
                .phone(saved.getPhoneNumber())
                .active(true)
                .notes("Created via customer self-service registration")
                .build());

        return UserResponse.from(saved);
    }

    public LoginResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.email().trim().toLowerCase(),
                            request.password()
                    )
            );
        } catch (Exception ex) {
            throw new UnauthorizedException("Invalid email or password");
        }

        User user = userRepository.findByEmailIgnoreCase(request.email().trim())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (!user.isActive()) {
            throw new UnauthorizedException("User account is inactive");
        }

        String token = jwtService.generateToken(
                user.getEmail(),
                Map.of(
                        "userId", user.getId(),
                        "role", user.getRole().name(),
                        "fullName", user.getFullName()
                )
        );

        return new LoginResponse(
                token,
                "Bearer",
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole()
        );
    }
}
