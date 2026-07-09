package com.mehdymokhtari.articleplatform.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mehdymokhtari.articleplatform.dto.request.CreateArticleRequest;
import com.mehdymokhtari.articleplatform.dto.response.ArticleDetailResponse;
import com.mehdymokhtari.articleplatform.dto.response.ArticleSummaryResponse;
import com.mehdymokhtari.articleplatform.mapper.ArticleMapper;
import com.mehdymokhtari.articleplatform.model.entity.Article;
import com.mehdymokhtari.articleplatform.model.entity.User;
import com.mehdymokhtari.articleplatform.model.enums.Role;
import com.mehdymokhtari.articleplatform.service.ArticleService;
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

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ArticleController.class)
@AutoConfigureMockMvc(addFilters = false)  // Disable security filters for controller tests
class ArticleControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ArticleService articleService;

    @MockBean
    private UserService userService;

    @MockBean
    private ArticleMapper articleMapper;

    private User testUser;
    private Article testArticle;
    private ArticleSummaryResponse summaryResponse;
    private ArticleDetailResponse detailResponse;
    private CreateArticleRequest createRequest;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");
        testUser.setRole(Role.ROLE_USER);

        testArticle = new Article();
        testArticle.setId(1L);
        testArticle.setTitle("Test Article");
        testArticle.setAbstractText("Test Abstract");
        testArticle.setBody("Test Body");
        testArticle.setPublicationDate(LocalDateTime.now());
        testArticle.setAuthor(testUser);

        summaryResponse = new ArticleSummaryResponse(
                1L,
                "Test Article",
                "Test Abstract",
                LocalDateTime.now(),
                0
        );

        detailResponse = new ArticleDetailResponse(
                1L,
                "Test Article",
                "Test Abstract",
                LocalDateTime.now(),
                0,
                "Test Body",
                Collections.emptyList()
        );

        createRequest = new CreateArticleRequest();
        createRequest.setTitle("New Article");
        createRequest.setAbstractText("New Abstract");
        createRequest.setBody("New Body");
    }

    @Test
    void getAllArticles_ShouldReturnListOfArticles() throws Exception {
        when(articleService.getAllArticlesSortedByDate()).thenReturn(List.of(testArticle));
        when(articleMapper.toSummaryResponseList(any())).thenReturn(List.of(summaryResponse));

        mockMvc.perform(get("/api/articles"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Test Article"));
    }

    @Test
    void searchArticles_ShouldReturnMatchingArticles() throws Exception {
        when(articleService.searchArticles(anyString())).thenReturn(List.of(testArticle));
        when(articleMapper.toSummaryResponseList(any())).thenReturn(List.of(summaryResponse));

        mockMvc.perform(get("/api/articles/search?q=test"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Test Article"));
    }

    @Test
    void getArticleById_WhenExists_ShouldReturnArticle() throws Exception {
        when(articleService.getArticleById(anyLong())).thenReturn(testArticle);
        when(articleMapper.toDetailResponse(any())).thenReturn(detailResponse);

        mockMvc.perform(get("/api/articles/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Test Article"))
                .andExpect(jsonPath("$.body").value("Test Body"));
    }

    @Test
    @WithMockUser(username = "testuser")
    void createArticle_WhenAuthenticated_ShouldReturnCreated() throws Exception {
        when(userService.getUserByUsername(anyString())).thenReturn(testUser);
        when(articleService.createArticle(any(), any())).thenReturn(testArticle);
        when(articleMapper.toDetailResponse(any())).thenReturn(detailResponse);

        mockMvc.perform(post("/api/articles")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Test Article"));
    }

    @Test
    @WithMockUser(username = "testuser")
    void updateArticle_WhenAuthorized_ShouldReturnUpdated() throws Exception {
        when(userService.getUserByUsername(anyString())).thenReturn(testUser);
        when(articleService.updateArticle(anyLong(), any(), any())).thenReturn(testArticle);
        when(articleMapper.toDetailResponse(any())).thenReturn(detailResponse);

        mockMvc.perform(put("/api/articles/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Test Article"));
    }

    @Test
    @WithMockUser(username = "testuser")
    void deleteArticle_WhenAuthorized_ShouldReturnNoContent() throws Exception {
        when(userService.getUserByUsername(anyString())).thenReturn(testUser);
        doNothing().when(articleService).deleteArticle(anyLong(), any());

        mockMvc.perform(delete("/api/articles/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    void checkTitleAvailability_WhenTitleAvailable_ShouldReturnTrue() throws Exception {
        when(articleService.isTitleUnique(anyString())).thenReturn(true);

        mockMvc.perform(get("/api/articles/check-title?title=NewTitle"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.available").value(true));
    }

    @Test
    void checkTitleAvailability_WhenTitleExists_ShouldReturnFalse() throws Exception {
        when(articleService.isTitleUnique(anyString())).thenReturn(false);

        mockMvc.perform(get("/api/articles/check-title?title=ExistingTitle"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.available").value(false));
    }

    @Test
    void getPopularArticles_ShouldReturnSortedList() throws Exception {
        when(articleService.getArticlesSortedByCitationCount()).thenReturn(List.of(testArticle));
        when(articleMapper.toSummaryResponseList(any())).thenReturn(List.of(summaryResponse));

        mockMvc.perform(get("/api/articles/popular"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Test Article"));
    }
}