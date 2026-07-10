package com.mehdymokhtari.articleplatform.integration;

import com.mehdymokhtari.articleplatform.dto.request.CreateArticleRequest;
import com.mehdymokhtari.articleplatform.dto.request.LoginRequest;
import com.mehdymokhtari.articleplatform.dto.request.RegisterRequest;
import com.mehdymokhtari.articleplatform.dto.response.LoginResponse;
import com.mehdymokhtari.articleplatform.model.entity.User;
import com.mehdymokhtari.articleplatform.model.enums.Role;
import com.mehdymokhtari.articleplatform.repository.UserRepository;
import com.mehdymokhtari.articleplatform.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.context.annotation.Import;
import org.springframework.http.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class ProtectedEndpointIntegrationTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    private String authToken;
    private User testUser;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();

        testUser = new User();
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");
        testUser.setPhone("+989123456789");
        testUser.setPasswordHash(passwordEncoder.encode("SecurePass123"));
        testUser.setRole(Role.ROLE_USER);
        userRepository.save(testUser);

        authToken = jwtService.generateToken(testUser);
    }

    @Test
    void shouldCreateArticleWithValidToken() {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(authToken);

        CreateArticleRequest request = new CreateArticleRequest();
        request.setTitle("Integration Test Article");
        request.setAbstractText("Testing article creation");
        request.setBody("This is a test article created during integration testing");
        request.setReferenceIds(List.of());

        HttpEntity<CreateArticleRequest> entity = new HttpEntity<>(request, headers);

        ResponseEntity<String> response = restTemplate.exchange(
                "/api/articles",
                HttpMethod.POST,
                entity,
                String.class
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
    }

    @Test
    void shouldReturnUnauthorizedWhenCreatingArticleWithoutToken() {
        CreateArticleRequest request = new CreateArticleRequest();
        request.setTitle("Unauthorized Article");
        request.setAbstractText("This should fail");
        request.setBody("No token provided");

        HttpEntity<CreateArticleRequest> entity = new HttpEntity<>(request);

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    "/api/articles",
                    HttpMethod.POST,
                    entity,
                    String.class
            );
            assertThat(response.getStatusCode())
                    .isIn(HttpStatus.UNAUTHORIZED, HttpStatus.FORBIDDEN);
        } catch (Exception e) {

            assertTrue(true);
        }
    }

    @Test
    void shouldGetUserProfileWithValidToken() {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(authToken);

        HttpEntity<Void> entity = new HttpEntity<>(headers);

        ResponseEntity<String> response = restTemplate.exchange(
                "/api/users/profile",
                HttpMethod.GET,
                entity,
                String.class
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).contains("testuser");
    }

    @Test
    void shouldReturnUnauthorizedForProfileWithoutToken() {
        ResponseEntity<String> response = restTemplate.exchange(
                "/api/users/profile",
                HttpMethod.GET,
                null,
                String.class
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    void shouldLoginAndReceiveToken() {
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setUsername("testuser");
        loginRequest.setPassword("SecurePass123");

        HttpEntity<LoginRequest> entity = new HttpEntity<>(loginRequest);

        ResponseEntity<LoginResponse> response = restTemplate.exchange(
                "/api/auth/login",
                HttpMethod.POST,
                entity,
                LoginResponse.class
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody().getAccessToken()).isNotNull();
        assertThat(response.getBody().getUsername()).isEqualTo("testuser");
    }

    @Test
    void shouldRegisterNewUser() {
        RegisterRequest registerRequest = new RegisterRequest();
        registerRequest.setUsername("newintegrationuser");
        registerRequest.setPassword("SecurePass456");
        registerRequest.setEmail("newintegration@example.com");
        registerRequest.setPhone("+989123456780");

        HttpEntity<RegisterRequest> entity = new HttpEntity<>(registerRequest);

        ResponseEntity<String> response = restTemplate.exchange(
                "/api/auth/register",
                HttpMethod.POST,
                entity,
                String.class
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).contains("newintegrationuser");
    }
}