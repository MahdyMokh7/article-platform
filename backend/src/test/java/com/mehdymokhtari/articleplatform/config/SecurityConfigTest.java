package com.mehdymokhtari.articleplatform.config;

import com.mehdymokhtari.articleplatform.security.JwtAuthenticationFilter;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class SecurityConfigTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockBean
    private AuthenticationEntryPoint authenticationEntryPoint;

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