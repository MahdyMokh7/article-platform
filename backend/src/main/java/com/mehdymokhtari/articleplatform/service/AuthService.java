package com.mehdymokhtari.articleplatform.service;

import com.mehdymokhtari.articleplatform.dto.request.LoginRequest;
import com.mehdymokhtari.articleplatform.dto.request.RegisterRequest;
import com.mehdymokhtari.articleplatform.dto.response.ArticleSummaryResponse;
import com.mehdymokhtari.articleplatform.dto.response.LoginResponse;
import com.mehdymokhtari.articleplatform.dto.response.ProfileResponse;
import com.mehdymokhtari.articleplatform.exception.EmailAlreadyExistsException;
import com.mehdymokhtari.articleplatform.exception.InvalidCredentialsException;
import com.mehdymokhtari.articleplatform.exception.PhoneAlreadyExistsException;
import com.mehdymokhtari.articleplatform.exception.UsernameAlreadyExistsException;
import com.mehdymokhtari.articleplatform.model.entity.User;
import com.mehdymokhtari.articleplatform.model.enums.Role;
import com.mehdymokhtari.articleplatform.repository.UserRepository;
import com.mehdymokhtari.articleplatform.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordService passwordService;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthService(
            UserRepository userRepository,
            PasswordService passwordService,
            JwtService jwtService,
            AuthenticationManager authenticationManager
    ) {
        this.userRepository = userRepository;
        this.passwordService = passwordService;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    public User register(RegisterRequest request) {
        validateUniqueness(request);

        String hashedPassword = passwordService.hashPassword(request.getPassword());

        User user = new User(
                request.getUsername(),
                request.getEmail(),
                request.getPhone(),
                hashedPassword,
                Role.ROLE_USER
        );

        return userRepository.save(user);
    }

    public LoginResponse login(LoginRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);

            User user = userRepository.findByUsername(request.getUsername())
                    .orElseThrow(() -> new InvalidCredentialsException("Invalid username or password"));

            String token = jwtService.generateToken(user);

            return new LoginResponse(token, user.getId(), user.getUsername(), user.getEmail());
        } catch (Exception e) {
            throw new InvalidCredentialsException("Invalid username or password");
        }
    }

    public ProfileResponse buildProfileResponse(User user) {
        List<ArticleSummaryResponse> articleResponses = user.getArticles().stream()
                .map(article -> new ArticleSummaryResponse(
                        article.getId(),
                        article.getTitle(),
                        article.getAbstractText(),
                        article.getPublicationDate(),
                        article.getCitedBy().size()
                ))
                .collect(Collectors.toList());

        return new ProfileResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getPhone(),
                articleResponses
        );
    }

    private void validateUniqueness(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new UsernameAlreadyExistsException("Username '" + request.getUsername() + "' is already taken");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException("Email '" + request.getEmail() + "' is already registered");
        }

        if (request.getPhone() != null && !request.getPhone().isEmpty()) {
            if (userRepository.existsByPhone(request.getPhone())) {
                throw new PhoneAlreadyExistsException("Phone number '" + request.getPhone() + "' is already registered");
            }
        }
    }
}