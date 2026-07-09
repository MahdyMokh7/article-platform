package com.mehdymokhtari.articleplatform.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mehdymokhtari.articleplatform.dto.request.LoginRequest;
import com.mehdymokhtari.articleplatform.dto.request.RegisterRequest;
import com.mehdymokhtari.articleplatform.dto.response.LoginResponse;
import com.mehdymokhtari.articleplatform.dto.response.ProfileResponse;
import com.mehdymokhtari.articleplatform.model.entity.User;
import com.mehdymokhtari.articleplatform.model.enums.Role;
import com.mehdymokhtari.articleplatform.service.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;

    @Test
    void shouldRegisterUser() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("newuser");
        request.setPassword("SecurePass123");
        request.setEmail("newuser@example.com");
        request.setPhone("+989123456789");

        User user = new User("newuser", "newuser@example.com", "+989123456789", "hashedPassword", Role.ROLE_USER);
        user.setId(1L);

        ProfileResponse response = new ProfileResponse(1L, "newuser", "newuser@example.com", "+989123456789", Collections.emptyList());

        when(authService.register(any(RegisterRequest.class))).thenReturn(user);
        when(authService.buildProfileResponse(any(User.class))).thenReturn(response);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.username").value("newuser"));
    }

    @Test
    void shouldLoginUser() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setUsername("testuser");
        request.setPassword("SecurePass123");

        LoginResponse response = new LoginResponse("token123", 1L, "testuser", "test@example.com");

        when(authService.login(any(LoginRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("token123"))
                .andExpect(jsonPath("$.username").value("testuser"));
    }

    @Test
    void shouldReturnBadRequestWhenRegisterRequestInvalid() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setUsername(""); // Invalid
        request.setPassword("weak"); // Invalid

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }
}