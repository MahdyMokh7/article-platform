package com.mehdymokhtari.articleplatform.service;

import com.mehdymokhtari.articleplatform.dto.request.ChangePasswordRequest;
import com.mehdymokhtari.articleplatform.dto.request.UpdateProfileRequest;
import com.mehdymokhtari.articleplatform.exception.EmailAlreadyExistsException;
import com.mehdymokhtari.articleplatform.exception.InvalidCredentialsException;
import com.mehdymokhtari.articleplatform.exception.PhoneAlreadyExistsException;
import com.mehdymokhtari.articleplatform.model.entity.User;
import com.mehdymokhtari.articleplatform.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final PasswordService passwordService;

    public UserService(UserRepository userRepository, PasswordService passwordService) {
        this.userRepository = userRepository;
        this.passwordService = passwordService;
    }

    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User updateProfile(User user, UpdateProfileRequest request) {
        if (request.getEmail() != null && !request.getEmail().isEmpty()) {
            if (!request.getEmail().equals(user.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
                throw new EmailAlreadyExistsException("Email '" + request.getEmail() + "' is already registered");
            }
            user.setEmail(request.getEmail());
        }

        if (request.getPhone() != null && !request.getPhone().isEmpty()) {
            if (!request.getPhone().equals(user.getPhone()) && userRepository.existsByPhone(request.getPhone())) {
                throw new PhoneAlreadyExistsException("Phone number '" + request.getPhone() + "' is already registered");
            }
            user.setPhone(request.getPhone());
        }

        return userRepository.save(user);
    }

    public void changePassword(User user, ChangePasswordRequest request) {
        if (!passwordService.verifyPassword(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new InvalidCredentialsException("Current password is incorrect");
        }

        String newHashedPassword = passwordService.hashPassword(request.getNewPassword());
        user.setPasswordHash(newHashedPassword);
        userRepository.save(user);
    }
}