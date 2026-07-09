package com.mehdymokhtari.articleplatform.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mehdymokhtari.articleplatform.dto.request.CreateArticleRequest;
import com.mehdymokhtari.articleplatform.model.entity.Article;
import com.mehdymokhtari.articleplatform.repository.ArticleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class ArticleControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ArticleRepository articleRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private Article testArticle;

    @BeforeEach
    void setUp() {
        articleRepository.deleteAll();

        testArticle = new Article();
        testArticle.setTitle("Integration Test Article");
        testArticle.setAbstractText("This is an integration test abstract");
        testArticle.setBody("This is the full body");
        testArticle.setPublicationDate(LocalDateTime.now());
        testArticle = articleRepository.save(testArticle);
    }

    @Test
    void getAllArticles_ShouldReturnList() throws Exception {
        mockMvc.perform(get("/api/articles"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Integration Test Article"));
    }

    @Test
    void getArticleById_WhenExists_ShouldReturnArticle() throws Exception {
        mockMvc.perform(get("/api/articles/{id}", testArticle.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(testArticle.getId()))
                .andExpect(jsonPath("$.title").value("Integration Test Article"));
    }

    @Test
    void getArticleById_WhenNotExists_ShouldReturn404() throws Exception {
        mockMvc.perform(get("/api/articles/9999"))
                .andExpect(status().isNotFound());
    }

    @Test
    void createArticle_WithValidData_ShouldReturn201() throws Exception {
        CreateArticleRequest newArticle = new CreateArticleRequest();
        newArticle.setTitle("Brand New Test Article");
        newArticle.setAbstractText("Test Abstract");
        newArticle.setBody("Test Body Content");

        mockMvc.perform(post("/api/articles")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newArticle)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Brand New Test Article"));
    }

    @Test
    void createArticle_WithDuplicateTitle_ShouldReturn409() throws Exception {
        CreateArticleRequest duplicateArticle = new CreateArticleRequest();
        duplicateArticle.setTitle("Integration Test Article");
        duplicateArticle.setAbstractText("Another Abstract");
        duplicateArticle.setBody("Another Body");

        mockMvc.perform(post("/api/articles")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(duplicateArticle)))
                .andExpect(status().isConflict());
    }

    @Test
    void checkTitleAvailability_WhenTitleTaken_ShouldReturnFalse() throws Exception {
        mockMvc.perform(get("/api/articles/check-title")
                        .param("title", "Integration Test Article"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.available").value(false));
    }
}