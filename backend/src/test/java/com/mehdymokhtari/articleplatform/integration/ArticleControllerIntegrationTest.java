package com.mehdymokhtari.articleplatform.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mehdymokhtari.articleplatform.dto.request.CreateArticleRequest;
import com.mehdymokhtari.articleplatform.model.entity.Article;
import com.mehdymokhtari.articleplatform.model.entity.User;
import com.mehdymokhtari.articleplatform.model.enums.Role;
import com.mehdymokhtari.articleplatform.repository.ArticleRepository;
import com.mehdymokhtari.articleplatform.repository.UserRepository;
import com.mehdymokhtari.articleplatform.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ArticleControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ArticleRepository articleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    private String authToken;
    private User testUser;
    private Article testArticle;

    @BeforeEach
    void setUp() {
        // Clean database
        articleRepository.deleteAll();
        userRepository.deleteAll();

        // Create test user
        testUser = new User();
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");
        testUser.setPhone("+989123456789");
        testUser.setPasswordHash(passwordEncoder.encode("SecurePass123"));
        testUser.setRole(Role.ROLE_USER);
        userRepository.save(testUser);

        // Create test article
        testArticle = new Article();
        testArticle.setTitle("Test Integration Article");
        testArticle.setAbstractText("Integration test abstract");
        testArticle.setBody("Integration test body");
        testArticle.setPublicationDate(LocalDateTime.now());
        testArticle.setAuthor(testUser);
        articleRepository.save(testArticle);

        // Generate JWT token for test user
        authToken = jwtService.generateToken(testUser);
    }

    @Test
    void getArticles_ShouldReturnList() throws Exception {
        mockMvc.perform(get("/api/articles"))
                .andExpect(status().isOk());
    }

    @Test
    void getArticleById_WhenExists_ShouldReturnArticle() throws Exception {
        mockMvc.perform(get("/api/articles/" + testArticle.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Test Integration Article"))
                .andExpect(jsonPath("$.abstractText").value("Integration test abstract"));
    }

    @Test
    void searchArticles_ShouldReturnMatching() throws Exception {
        mockMvc.perform(get("/api/articles/search?q=Integration"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Test Integration Article"));
    }

    @Test
    void createArticle_WithValidData_ShouldReturn201() throws Exception {
        CreateArticleRequest request = new CreateArticleRequest();
        request.setTitle("New Integration Article");
        request.setAbstractText("Testing article creation");
        request.setBody("This is a test article created during integration testing");

        mockMvc.perform(post("/api/articles")
                        .header("Authorization", "Bearer " + authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("New Integration Article"));
    }

    @Test
    void createArticle_WithDuplicateTitle_ShouldReturn409() throws Exception {
        // First create an article
        CreateArticleRequest firstRequest = new CreateArticleRequest();
        firstRequest.setTitle("Duplicate Title Article");
        firstRequest.setAbstractText("First article");
        firstRequest.setBody("This is the first article");

        mockMvc.perform(post("/api/articles")
                        .header("Authorization", "Bearer " + authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(firstRequest)))
                .andExpect(status().isCreated());

        // Try to create another with same title
        CreateArticleRequest duplicateRequest = new CreateArticleRequest();
        duplicateRequest.setTitle("Duplicate Title Article");
        duplicateRequest.setAbstractText("This should fail");
        duplicateRequest.setBody("Duplicate title not allowed");

        mockMvc.perform(post("/api/articles")
                        .header("Authorization", "Bearer " + authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(duplicateRequest)))
                .andExpect(status().isConflict());
    }

    @Test
    void checkTitleAvailability_WhenTitleAvailable_ShouldReturnTrue() throws Exception {
        mockMvc.perform(get("/api/articles/check-title?title=BrandNewTitle"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.available").value(true));
    }

    @Test
    void checkTitleAvailability_WhenTitleExists_ShouldReturnFalse() throws Exception {
        mockMvc.perform(get("/api/articles/check-title?title=Test Integration Article"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.available").value(false));
    }

    @Test
    void getPopularArticles_ShouldReturnSortedList() throws Exception {
        mockMvc.perform(get("/api/articles/popular"))
                .andExpect(status().isOk());
    }
}