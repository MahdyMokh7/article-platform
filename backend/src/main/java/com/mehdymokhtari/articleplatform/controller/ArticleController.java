package com.mehdymokhtari.articleplatform.controller;

import com.mehdymokhtari.articleplatform.dto.ArticleCreateDTO;
import com.mehdymokhtari.articleplatform.dto.ArticleDetailDTO;
import com.mehdymokhtari.articleplatform.dto.ArticleSummaryDTO;
import com.mehdymokhtari.articleplatform.model.Article;
import com.mehdymokhtari.articleplatform.service.ArticleService;
import ir.ac.ut.ece.ie.articleplatform.dto.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/articles")
public class ArticleController {

    @Autowired
    private ArticleService articleService;

    @GetMapping
    public ResponseEntity<List<ArticleSummaryDTO>> getAllArticles() {
        List<Article> articles = articleService.getAllArticlesSortedByDate();

        List<ArticleSummaryDTO> dtos = articles.stream()
                .map(this::convertToSummaryDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/search")
    public ResponseEntity<List<ArticleSummaryDTO>> searchArticles(@RequestParam String q) {
        List<Article> articles = articleService.searchArticles(q);

        List<ArticleSummaryDTO> dtos = articles.stream()
                .map(this::convertToSummaryDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ArticleDetailDTO> getArticle(@PathVariable Long id) {
        Article article = articleService.getArticleById(id);
        ArticleDetailDTO dto = convertToDetailDTO(article);
        return ResponseEntity.ok(dto);
    }

    @PostMapping
    public ResponseEntity<ArticleDetailDTO> createArticle(@Valid @RequestBody ArticleCreateDTO createDTO) {
        Article savedArticle = articleService.createArticle(createDTO);
        ArticleDetailDTO responseDTO = convertToDetailDTO(savedArticle);

        URI location = URI.create("/api/articles/" + savedArticle.getId());
        return ResponseEntity.created(location).body(responseDTO);
    }

    @GetMapping("/check-title")
    public ResponseEntity<Map<String, Boolean>> checkTitleAvailability(@RequestParam String title) {
        boolean available = articleService.isTitleUnique(title);
        Map<String, Boolean> response = new HashMap<>();
        response.put("available", available);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/popular")
    public ResponseEntity<List<ArticleSummaryDTO>> getPopularArticles() {
        List<Article> articles = articleService.getArticlesSortedByCitationCount();

        List<ArticleSummaryDTO> dtos = articles.stream()
                .map(this::convertToSummaryDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    // Helper Methods
    private ArticleSummaryDTO convertToSummaryDTO(Article article) {
        return new ArticleSummaryDTO(
                article.getId(),
                article.getTitle(),
                article.getAbstractText(),
                article.getPublicationDate(),
                article.getCitedBy().size()
        );
    }

    private ArticleDetailDTO convertToDetailDTO(Article article) {
        List<ArticleSummaryDTO> referenceDTOs = article.getReferences().stream()
                .map(this::convertToSummaryDTO)
                .collect(Collectors.toList());

        return new ArticleDetailDTO(
                article.getId(),
                article.getTitle(),
                article.getAbstractText(),
                article.getPublicationDate(),
                article.getCitedBy().size(),
                article.getBody(),
                referenceDTOs
        );
    }
}