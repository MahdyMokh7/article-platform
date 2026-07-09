package com.mehdymokhtari.articleplatform.dto.response;

import com.mehdymokhtari.articleplatform.dto.response.ArticleSummaryResponse;

import java.util.List;

public class ProfileResponse {

    private Long id;
    private String username;
    private String email;
    private String phone;
    private List<ArticleSummaryResponse> articles;

    public ProfileResponse(Long id, String username, String email, String phone, List<ArticleSummaryResponse> articles) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.phone = phone;
        this.articles = articles;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public List<ArticleSummaryResponse> getArticles() { return articles; }
    public void setArticles(List<ArticleSummaryResponse> articles) { this.articles = articles; }
}