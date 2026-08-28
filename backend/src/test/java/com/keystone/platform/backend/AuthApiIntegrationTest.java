package com.keystone.platform.backend;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthApiIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void registerAndLoginFlow() throws Exception {
        String email = "api-test-" + System.currentTimeMillis() + "@keystone.local";

        String registerBody = """
                {
                  "fullName": "API Tester",
                  "email": "%s",
                  "password": "password123",
                  "phoneNumber": "555-0000",
                  "role": "CUSTOMER"
                }
                """.formatted(email);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerBody))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value(email))
                .andExpect(jsonPath("$.role").value("CUSTOMER"));

        String loginBody = """
                {
                  "email": "%s",
                  "password": "password123"
                }
                """.formatted(email);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.role").value("CUSTOMER"));
    }

    @Test
    void registerStaffRoleIsRejected() throws Exception {
        String email = "staff-attempt-" + System.currentTimeMillis() + "@keystone.local";

        String registerBody = """
                {
                  "fullName": "Would Be Manager",
                  "email": "%s",
                  "password": "password123",
                  "role": "MANAGER"
                }
                """.formatted(email);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerBody))
                .andExpect(status().isBadRequest());
    }

    @Test
    void loginWithBadPasswordReturnsUnauthorized() throws Exception {
        String body = """
                {
                  "email": "missing@keystone.local",
                  "password": "wrong-password"
                }
                """;

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isUnauthorized());
    }
}
