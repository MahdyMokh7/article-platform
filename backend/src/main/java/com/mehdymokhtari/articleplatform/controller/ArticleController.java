package com.mehdymokhtari.articleplatform.controller;

import com.mehdymokhtari.articleplatform.dto.request.CreateArticleRequest;
import com.mehdymokhtari.articleplatform.dto.response.ArticleDetailResponse;
import com.mehdymokhtari.articleplatform.dto.response.ArticleSummaryResponse;
import com.mehdymokhtari.articleplatform.mapper.ArticleMapper;
import com.mehdymokhtari.articleplatform.model.entity.Article;
import com.mehdymokhtari.articleplatform.model.entity.User;
import com.mehdymokhtari.articleplatform.service.ArticleService;
import com.mehdymokhtari.articleplatform.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/articles")
public class ArticleController {

    private final ArticleService articleService;
    private final UserService userService;
    private final ArticleMapper articleMapper;

    public ArticleController(ArticleService articleService, UserService userService, ArticleMapper articleMapper) {
        this.articleService = articleService;
        this.userService = userService;
        this.articleMapper = articleMapper;
    }

    @GetMapping
    public ResponseEntity<List<ArticleSummaryResponse>> getAllArticles() {
        List<Article> articles = articleService.getAllArticlesSortedByDate();
        return ResponseEntity.ok(articleMapper.toSummaryResponseList(articles));
    }

    @GetMapping("/search")
    public ResponseEntity<List<ArticleSummaryResponse>> searchArticles(@RequestParam String q) {
        List<Article> articles = articleService.searchArticles(q);
        return ResponseEntity.ok(articleMapper.toSummaryResponseList(articles));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ArticleDetailResponse> getArticle(@PathVariable Long id) {
        Article article = articleService.getArticleById(id);
        return ResponseEntity.ok(articleMapper.toDetailResponse(article));
    }

    @PostMapping
    public ResponseEntity<ArticleDetailResponse> createArticle(@Valid @RequestBody CreateArticleRequest request) {
        User currentUser = getCurrentUser();
        Article savedArticle = articleService.createArticle(request, currentUser);
        ArticleDetailResponse response = articleMapper.toDetailResponse(savedArticle);
        return ResponseEntity.created(URI.create("/api/articles/" + savedArticle.getId())).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ArticleDetailResponse> updateArticle(
            @PathVariable Long id,
            @Valid @RequestBody CreateArticleRequest request
    ) {
        User currentUser = getCurrentUser();
        Article updatedArticle = articleService.updateArticle(id, request, currentUser);
        return ResponseEntity.ok(articleMapper.toDetailResponse(updatedArticle));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteArticle(@PathVariable Long id) {
        User currentUser = getCurrentUser();
        articleService.deleteArticle(id, currentUser);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/check-title")
    public ResponseEntity<Map<String, Boolean>> checkTitleAvailability(@RequestParam String title) {
        boolean available = articleService.isTitleUnique(title);
        return ResponseEntity.ok(Map.of("available", available));
    }

    @GetMapping("/popular")
    public ResponseEntity<List<ArticleSummaryResponse>> getPopularArticles() {
        List<Article> articles = articleService.getArticlesSortedByCitationCount();
        return ResponseEntity.ok(articleMapper.toSummaryResponseList(articles));
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return userService.getUserByUsername(username);
    }
}