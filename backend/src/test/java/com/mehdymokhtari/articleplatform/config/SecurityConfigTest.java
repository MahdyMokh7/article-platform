package com.mehdymokhtari.articleplatform.config;

import com.mehdymokhtari.articleplatform.security.JwtAuthenticationFilter;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class SecurityConfigTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockitoBean
    private AuthenticationEntryPoint authenticationEntryPoint;

    @Test
    void shouldAllowPublicAccessToAuthEndpoints() throws Exception {
        mockMvc.perform(post("/api/auth/login"))
                .andExpect(status().isBadRequest()); // Returns 400 because no body, but endpoint is public
    }

    @Test
    void shouldAllowPublicAccessToArticlesEndpoints() throws Exception {
        mockMvc.perform(get("/api/articles"))
                .andExpect(status().isOk());
    }

    @Test
    void shouldAllowPublicAccessToArticleSearch() throws Exception {
        mockMvc.perform(get("/api/articles/search?q=test"))
                .andExpect(status().isOk());
    }

    @Test
    void shouldAllowPublicAccessToPopularArticles() throws Exception {
        mockMvc.perform(get("/api/articles/popular"))
                .andExpect(status().isOk());
    }
}