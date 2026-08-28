package com.keystone.platform.backend.util;

import com.keystone.platform.backend.entity.User;
import com.keystone.platform.backend.exception.UnauthorizedException;
import com.keystone.platform.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SecurityUtils {

    private final UserRepository userRepository;

    public String currentEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new UnauthorizedException("Authentication required");
        }
        return authentication.getName();
    }

    public User currentUser() {
        return userRepository.findByEmailIgnoreCase(currentEmail())
                .orElseThrow(() -> new UnauthorizedException("Authenticated user not found"));
    }
}
