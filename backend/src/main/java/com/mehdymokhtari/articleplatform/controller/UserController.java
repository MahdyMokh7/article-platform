package com.mehdymokhtari.articleplatform.controller;

import com.mehdymokhtari.articleplatform.dto.request.ChangePasswordRequest;
import com.mehdymokhtari.articleplatform.dto.request.UpdateProfileRequest;
import com.mehdymokhtari.articleplatform.dto.response.ProfileResponse;
import com.mehdymokhtari.articleplatform.model.entity.User;
import com.mehdymokhtari.articleplatform.service.AuthService;
import com.mehdymokhtari.articleplatform.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final AuthService authService;

    public UserController(UserService userService, AuthService authService) {
        this.userService = userService;
        this.authService = authService;
    }

    @GetMapping("/profile")
    public ResponseEntity<ProfileResponse> getProfile() {
        User currentUser = getCurrentUser();
        ProfileResponse response = authService.buildProfileResponse(currentUser);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/profile")
    public ResponseEntity<ProfileResponse> updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        User currentUser = getCurrentUser();
        User updatedUser = userService.updateProfile(currentUser, request);
        ProfileResponse response = authService.buildProfileResponse(updatedUser);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/password")
    public ResponseEntity<Void> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        User currentUser = getCurrentUser();
        userService.changePassword(currentUser, request);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        return ResponseEntity.noContent().build();
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return userService.getUserByUsername(username);
    }
}