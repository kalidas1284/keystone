package com.keystone.platform.backend.service;

import com.keystone.platform.backend.dto.LoginRequest;
import com.keystone.platform.backend.dto.RegisterRequest;
import com.keystone.platform.backend.entity.Role;
import com.keystone.platform.backend.entity.User;
import com.keystone.platform.backend.exception.DuplicateResourceException;
import com.keystone.platform.backend.exception.UnauthorizedException;
import com.keystone.platform.backend.exception.ValidationException;
import com.keystone.platform.backend.repository.CustomerRepository;
import com.keystone.platform.backend.repository.UserRepository;
import com.keystone.platform.backend.security.JwtService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private CustomerRepository customerRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtService jwtService;
    @Mock
    private AuthenticationManager authenticationManager;

    @InjectMocks
    private AuthService authService;

    @Test
    void registerRejectsDuplicateEmail() {
        when(userRepository.existsByEmailIgnoreCase("customer@keystone.local")).thenReturn(true);

        RegisterRequest request = new RegisterRequest(
                "Customer",
                "customer@keystone.local",
                "password123",
                "555",
                Role.CUSTOMER
        );

        assertThrows(DuplicateResourceException.class, () -> authService.register(request));
    }

    @Test
    void registerRejectsStaffRoles() {
        RegisterRequest request = new RegisterRequest(
                "Admin",
                "admin@keystone.local",
                "password123",
                "555",
                Role.ADMIN
        );

        assertThrows(ValidationException.class, () -> authService.register(request));
    }

    @Test
    void loginRejectsInvalidCredentials() {
        when(authenticationManager.authenticate(any())).thenThrow(new BadCredentialsException("bad"));

        assertThrows(
                UnauthorizedException.class,
                () -> authService.login(new LoginRequest("admin@keystone.local", "wrong"))
        );
    }

    @Test
    void loginReturnsTokenForValidUser() {
        User user = User.builder()
                .id(1L)
                .fullName("Admin")
                .email("admin@keystone.local")
                .password("hashed")
                .role(Role.ADMIN)
                .active(true)
                .build();

        when(authenticationManager.authenticate(any())).thenReturn(null);
        when(userRepository.findByEmailIgnoreCase("admin@keystone.local")).thenReturn(Optional.of(user));
        when(jwtService.generateToken(any(), any())).thenReturn("jwt-token");

        var response = authService.login(new LoginRequest("admin@keystone.local", "password123"));

        assertEquals("jwt-token", response.token());
        assertEquals(Role.ADMIN, response.role());
    }
}
