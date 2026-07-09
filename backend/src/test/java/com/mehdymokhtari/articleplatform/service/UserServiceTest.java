package com.mehdymokhtari.articleplatform.service;

import com.mehdymokhtari.articleplatform.dto.request.ChangePasswordRequest;
import com.mehdymokhtari.articleplatform.dto.request.UpdateProfileRequest;
import com.mehdymokhtari.articleplatform.exception.EmailAlreadyExistsException;
import com.mehdymokhtari.articleplatform.exception.InvalidCredentialsException;
import com.mehdymokhtari.articleplatform.exception.PhoneAlreadyExistsException;
import com.mehdymokhtari.articleplatform.model.entity.User;
import com.mehdymokhtari.articleplatform.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordService passwordService;

    @InjectMocks
    private UserService userService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");
        testUser.setPhone("+989123456789");
        testUser.setPasswordHash("hashedPassword");
    }

    @Test
    void shouldThrowExceptionWhenUpdatingEmailToExisting() {
        when(userRepository.existsByEmail(anyString())).thenReturn(true);

        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setEmail("existing@example.com");

        assertThatThrownBy(() -> userService.updateProfile(testUser, request))
                .isInstanceOf(EmailAlreadyExistsException.class)
                .hasMessageContaining("already registered");
    }

    @Test
    void shouldThrowExceptionWhenUpdatingPhoneToExisting() {
        when(userRepository.existsByPhone(anyString())).thenReturn(true);

        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setPhone("+989987654321");

        assertThatThrownBy(() -> userService.updateProfile(testUser, request))
                .isInstanceOf(PhoneAlreadyExistsException.class)
                .hasMessageContaining("already registered");
    }

    @Test
    void shouldThrowExceptionWhenChangingPasswordWithWrongCurrentPassword() {
        when(passwordService.verifyPassword(anyString(), anyString())).thenReturn(false);

        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setCurrentPassword("wrongPassword");
        request.setNewPassword("NewPass123");

        assertThatThrownBy(() -> userService.changePassword(testUser, request))
                .isInstanceOf(InvalidCredentialsException.class)
                .hasMessage("Current password is incorrect");
    }
}