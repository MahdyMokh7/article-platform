package com.mehdymokhtari.articleplatform.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mehdymokhtari.articleplatform.dto.request.ChangePasswordRequest;
import com.mehdymokhtari.articleplatform.dto.request.UpdateProfileRequest;
import com.mehdymokhtari.articleplatform.dto.response.ProfileResponse;
import com.mehdymokhtari.articleplatform.model.entity.User;
import com.mehdymokhtari.articleplatform.model.enums.Role;
import com.mehdymokhtari.articleplatform.service.AuthService;
import com.mehdymokhtari.articleplatform.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(UserController.class)
@AutoConfigureMockMvc(addFilters = false)
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private UserService userService;

    @MockBean
    private AuthService authService;

    private User testUser;
    private ProfileResponse profileResponse;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");
        testUser.setPhone("+989123456789");
        testUser.setRole(Role.ROLE_USER);

        profileResponse = new ProfileResponse(
                1L,
                "testuser",
                "test@example.com",
                "+989123456789",
                Collections.emptyList()
        );
    }

    @Test
    @WithMockUser(username = "testuser")
    void shouldGetProfile() throws Exception {
        when(userService.getUserByUsername(anyString())).thenReturn(testUser);
        when(authService.buildProfileResponse(any(User.class))).thenReturn(profileResponse);

        mockMvc.perform(get("/api/users/profile"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("testuser"))
                .andExpect(jsonPath("$.email").value("test@example.com"))
                .andExpect(jsonPath("$.phone").value("+989123456789"));
    }

    @Test
    @WithMockUser(username = "testuser")
    void shouldUpdateProfile() throws Exception {
        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setEmail("updated@example.com");
        request.setPhone("+989987654321");

        User updatedUser = new User();
        updatedUser.setId(1L);
        updatedUser.setUsername("testuser");
        updatedUser.setEmail("updated@example.com");
        updatedUser.setPhone("+989987654321");
        updatedUser.setRole(Role.ROLE_USER);

        ProfileResponse updatedResponse = new ProfileResponse(
                1L,
                "testuser",
                "updated@example.com",
                "+989987654321",
                Collections.emptyList()
        );

        when(userService.getUserByUsername(anyString())).thenReturn(testUser);
        when(userService.updateProfile(any(User.class), any(UpdateProfileRequest.class))).thenReturn(updatedUser);
        when(authService.buildProfileResponse(any(User.class))).thenReturn(updatedResponse);

        mockMvc.perform(put("/api/users/profile")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("updated@example.com"))
                .andExpect(jsonPath("$.phone").value("+989987654321"));
    }

    @Test
    @WithMockUser(username = "testuser")
    void shouldChangePassword() throws Exception {
        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setCurrentPassword("OldPass123");
        request.setNewPassword("NewPass456");

        when(userService.getUserByUsername(anyString())).thenReturn(testUser);
        doNothing().when(userService).changePassword(any(User.class), any(ChangePasswordRequest.class));

        mockMvc.perform(put("/api/users/password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNoContent());
    }
}