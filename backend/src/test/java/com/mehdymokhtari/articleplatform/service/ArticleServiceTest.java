package com.mehdymokhtari.articleplatform.service;

import com.mehdymokhtari.articleplatform.exception.ArticleNotFoundException;
import com.mehdymokhtari.articleplatform.dto.request.CreateArticleRequest;
import com.mehdymokhtari.articleplatform.exception.DuplicateTitleException;
import com.mehdymokhtari.articleplatform.model.entity.Article;
import com.mehdymokhtari.articleplatform.repository.ArticleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ArticleServiceTest {

    @Mock
    private ArticleRepository articleRepository;

    @InjectMocks
    private ArticleService articleService;

    private Article testArticle;
    private CreateArticleRequest testCreateDTO;

    @BeforeEach
    void setUp() {
        testArticle = new Article();
        testArticle.setId(1L);
        testArticle.setTitle("Test Article");
        testArticle.setAbstractText("Test Abstract");
        testArticle.setBody("Test Body");
        testArticle.setPublicationDate(LocalDateTime.now());

        testCreateDTO = new CreateArticleRequest();
        testCreateDTO.setTitle("New Article");
        testCreateDTO.setAbstractText("New Abstract");
        testCreateDTO.setBody("New Body");
    }

    @Test
    void getAllArticlesSortedByDate_ShouldReturnArticlesSortedDescending() {
        // Arrange
        List<Article> expectedArticles = Arrays.asList(testArticle);
        when(articleRepository.findAllByOrderByPublicationDateDesc()).thenReturn(expectedArticles);

        // Act
        List<Article> actualArticles = articleService.getAllArticlesSortedByDate();

        // Assert
        assertNotNull(actualArticles);
        assertEquals(1, actualArticles.size());
        verify(articleRepository, times(1)).findAllByOrderByPublicationDateDesc();
    }

    @Test
    void searchArticles_WhenTermExists_ShouldReturnTitleMatchesFirst() {
        // Arrange
        String searchTerm = "Test";
        Article titleMatch = testArticle;
        Article abstractMatch = new Article();
        abstractMatch.setTitle("Other");
        abstractMatch.setAbstractText("This contains Test in abstract");

        when(articleRepository.findByTitleContainingIgnoreCase(searchTerm))
                .thenReturn(Arrays.asList(titleMatch));
        when(articleRepository.findByAbstractTextContainingIgnoreCase(searchTerm))
                .thenReturn(Arrays.asList(abstractMatch));

        // Act
        List<Article> results = articleService.searchArticles(searchTerm);

        // Assert
        assertEquals(2, results.size());
        assertEquals(titleMatch.getTitle(), results.get(0).getTitle());
    }

    @Test
    void searchArticles_WhenTermIsEmpty_ShouldReturnEmptyList() {
        // Act
        List<Article> results = articleService.searchArticles("");

        // Assert
        assertTrue(results.isEmpty());
        verify(articleRepository, never()).findByTitleContainingIgnoreCase(any());
    }

    @Test
    void isTitleUnique_WhenTitleDoesNotExist_ShouldReturnTrue() {
        // Arrange
        when(articleRepository.existsByTitle("Unique Title")).thenReturn(false);

        // Act
        boolean isUnique = articleService.isTitleUnique("Unique Title");

        // Assert
        assertTrue(isUnique);
    }

    @Test
    void isTitleUnique_WhenTitleExists_ShouldReturnFalse() {
        // Arrange
        when(articleRepository.existsByTitle("Existing Title")).thenReturn(true);

        // Act
        boolean isUnique = articleService.isTitleUnique("Existing Title");

        // Assert
        assertFalse(isUnique);
    }

    @Test
    void getArticleById_WhenArticleExists_ShouldReturnArticle() {
        // Arrange
        when(articleRepository.findById(1L)).thenReturn(Optional.of(testArticle));

        // Act
        Article found = articleService.getArticleById(1L);

        // Assert
        assertNotNull(found);
        assertEquals("Test Article", found.getTitle());
    }

    @Test
    void getArticleById_WhenArticleDoesNotExist_ShouldThrowException() {
        // Arrange
        when(articleRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ArticleNotFoundException.class,
                () -> articleService.getArticleById(999L));
    }

    @Test
    void createArticle_WithUniqueTitle_ShouldSaveArticle() {
        // Arrange
        when(articleRepository.existsByTitle("New Article")).thenReturn(false);
        when(articleRepository.save(any(Article.class))).thenReturn(testArticle);

        // Act
        Article saved = articleService.createArticle(testCreateDTO);

        // Assert
        assertNotNull(saved);
        verify(articleRepository, times(1)).save(any(Article.class));
    }

    @Test
    void createArticle_WithDuplicateTitle_ShouldThrowException() {
        // Arrange
        when(articleRepository.existsByTitle("New Article")).thenReturn(true);

        // Act & Assert
        assertThrows(DuplicateTitleException.class,
                () -> articleService.createArticle(testCreateDTO));
        verify(articleRepository, never()).save(any(Article.class));
    }
}