package com.mehdymokhtari.articleplatform.service;

import com.mehdymokhtari.articleplatform.dto.request.CreateArticleRequest;
import com.mehdymokhtari.articleplatform.exception.ArticleAccessDeniedException;
import com.mehdymokhtari.articleplatform.exception.ArticleNotFoundException;
import com.mehdymokhtari.articleplatform.exception.DuplicateTitleException;
import com.mehdymokhtari.articleplatform.model.entity.Article;
import com.mehdymokhtari.articleplatform.model.entity.User;
import com.mehdymokhtari.articleplatform.model.enums.Role;
import com.mehdymokhtari.articleplatform.repository.ArticleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

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
    private User testAuthor;
    private User otherUser;
    private CreateArticleRequest testCreateRequest;

    @BeforeEach
    void setUp() {
        testAuthor = new User();
        testAuthor.setId(1L);
        testAuthor.setUsername("testuser");
        testAuthor.setEmail("test@example.com");
        testAuthor.setPasswordHash("hashedPassword");
        testAuthor.setRole(Role.ROLE_USER);

        otherUser = new User();
        otherUser.setId(2L);
        otherUser.setUsername("otheruser");
        otherUser.setEmail("other@example.com");
        otherUser.setPasswordHash("hashedPassword");
        otherUser.setRole(Role.ROLE_USER);

        testArticle = new Article();
        testArticle.setId(1L);
        testArticle.setTitle("Test Article");
        testArticle.setAbstractText("Test Abstract");
        testArticle.setBody("Test Body");
        testArticle.setPublicationDate(LocalDateTime.now());
        testArticle.setAuthor(testAuthor);

        testCreateRequest = new CreateArticleRequest();
        testCreateRequest.setTitle("New Article");
        testCreateRequest.setAbstractText("New Abstract");
        testCreateRequest.setBody("New Body");
    }

    @Test
    void getAllArticlesSortedByDate_ShouldReturnArticlesSortedDescending() {
        List<Article> expectedArticles = Arrays.asList(testArticle);
        when(articleRepository.findAllByOrderByPublicationDateDesc()).thenReturn(expectedArticles);

        List<Article> actualArticles = articleService.getAllArticlesSortedByDate();

        assertNotNull(actualArticles);
        assertEquals(1, actualArticles.size());
        verify(articleRepository, times(1)).findAllByOrderByPublicationDateDesc();
    }

    @Test
    void searchArticles_WhenTermExists_ShouldReturnTitleMatchesFirst() {
        String searchTerm = "Test";
        Article titleMatch = testArticle;
        Article abstractMatch = new Article();
        abstractMatch.setTitle("Other");
        abstractMatch.setAbstractText("This contains Test in abstract");

        when(articleRepository.findByTitleContainingIgnoreCase(searchTerm))
                .thenReturn(Arrays.asList(titleMatch));
        when(articleRepository.findByAbstractTextContainingIgnoreCase(searchTerm))
                .thenReturn(Arrays.asList(abstractMatch));

        List<Article> results = articleService.searchArticles(searchTerm);

        assertEquals(2, results.size());
        assertEquals(titleMatch.getTitle(), results.get(0).getTitle());
    }

    @Test
    void searchArticles_WhenTermIsEmpty_ShouldReturnEmptyList() {
        List<Article> results = articleService.searchArticles("");

        assertTrue(results.isEmpty());
        verify(articleRepository, never()).findByTitleContainingIgnoreCase(any());
    }

    @Test
    void searchArticles_WhenTermIsNull_ShouldReturnEmptyList() {
        List<Article> results = articleService.searchArticles(null);

        assertTrue(results.isEmpty());
        verify(articleRepository, never()).findByTitleContainingIgnoreCase(any());
    }

    @Test
    void isTitleUnique_WhenTitleDoesNotExist_ShouldReturnTrue() {
        when(articleRepository.existsByTitle("Unique Title")).thenReturn(false);

        boolean isUnique = articleService.isTitleUnique("Unique Title");

        assertTrue(isUnique);
    }

    @Test
    void isTitleUnique_WhenTitleExists_ShouldReturnFalse() {
        when(articleRepository.existsByTitle("Existing Title")).thenReturn(true);

        boolean isUnique = articleService.isTitleUnique("Existing Title");

        assertFalse(isUnique);
    }

    @Test
    void getArticleById_WhenArticleExists_ShouldReturnArticle() {
        when(articleRepository.findById(1L)).thenReturn(Optional.of(testArticle));

        Article found = articleService.getArticleById(1L);

        assertNotNull(found);
        assertEquals("Test Article", found.getTitle());
    }

    @Test
    void getArticleById_WhenArticleDoesNotExist_ShouldThrowException() {
        when(articleRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ArticleNotFoundException.class,
                () -> articleService.getArticleById(999L));
    }

    @Test
    void createArticle_WithUniqueTitle_ShouldSaveArticle() {
        when(articleRepository.existsByTitle("New Article")).thenReturn(false);
        when(articleRepository.save(any(Article.class))).thenReturn(testArticle);

        Article saved = articleService.createArticle(testCreateRequest, testAuthor);

        assertNotNull(saved);
        verify(articleRepository, times(1)).save(any(Article.class));
    }

    @Test
    void createArticle_WithDuplicateTitle_ShouldThrowException() {
        when(articleRepository.existsByTitle("New Article")).thenReturn(true);

        assertThrows(DuplicateTitleException.class,
                () -> articleService.createArticle(testCreateRequest, testAuthor));
        verify(articleRepository, never()).save(any(Article.class));
    }

    @Test
    void createArticle_WithReferences_ShouldSaveArticleWithReferences() {
        CreateArticleRequest requestWithReferences = new CreateArticleRequest();
        requestWithReferences.setTitle("Article With References");
        requestWithReferences.setAbstractText("Abstract");
        requestWithReferences.setBody("Body");
        requestWithReferences.setReferenceIds(Arrays.asList(2L, 3L));

        Article reference1 = new Article();
        reference1.setId(2L);
        Article reference2 = new Article();
        reference2.setId(3L);

        when(articleRepository.existsByTitle("Article With References")).thenReturn(false);
        when(articleRepository.findAllById(Arrays.asList(2L, 3L))).thenReturn(Arrays.asList(reference1, reference2));
        when(articleRepository.save(any(Article.class))).thenReturn(testArticle);

        Article saved = articleService.createArticle(requestWithReferences, testAuthor);

        assertNotNull(saved);
        verify(articleRepository, times(1)).findAllById(Arrays.asList(2L, 3L));
        verify(articleRepository, times(1)).save(any(Article.class));
    }

    @Test
    void updateArticle_WhenAuthorIsOwner_ShouldUpdateArticle() {
        when(articleRepository.findById(1L)).thenReturn(Optional.of(testArticle));
        when(articleRepository.existsByTitle("New Article")).thenReturn(false);
        when(articleRepository.save(any(Article.class))).thenReturn(testArticle);

        Article updated = articleService.updateArticle(1L, testCreateRequest, testAuthor);

        assertNotNull(updated);
        verify(articleRepository, times(1)).save(any(Article.class));
    }

    @Test
    void updateArticle_WhenAuthorIsNotOwner_ShouldThrowException() {
        when(articleRepository.findById(1L)).thenReturn(Optional.of(testArticle));

        assertThrows(ArticleAccessDeniedException.class,
                () -> articleService.updateArticle(1L, testCreateRequest, otherUser));
        verify(articleRepository, never()).save(any(Article.class));
    }

    @Test
    void updateArticle_WhenTitleChangesAndIsUnique_ShouldUpdate() {
        CreateArticleRequest updateRequest = new CreateArticleRequest();
        updateRequest.setTitle("Updated Title");
        updateRequest.setAbstractText("Updated Abstract");
        updateRequest.setBody("Updated Body");

        when(articleRepository.findById(1L)).thenReturn(Optional.of(testArticle));
        when(articleRepository.existsByTitle("Updated Title")).thenReturn(false);
        when(articleRepository.save(any(Article.class))).thenReturn(testArticle);

        Article updated = articleService.updateArticle(1L, updateRequest, testAuthor);

        assertNotNull(updated);
        verify(articleRepository, times(1)).existsByTitle("Updated Title");
    }

    @Test
    void updateArticle_WhenTitleChangesAndIsNotUnique_ShouldThrowException() {
        CreateArticleRequest updateRequest = new CreateArticleRequest();
        updateRequest.setTitle("Existing Title");
        updateRequest.setAbstractText("Updated Abstract");
        updateRequest.setBody("Updated Body");

        when(articleRepository.findById(1L)).thenReturn(Optional.of(testArticle));
        when(articleRepository.existsByTitle("Existing Title")).thenReturn(true);

        assertThrows(DuplicateTitleException.class,
                () -> articleService.updateArticle(1L, updateRequest, testAuthor));
        verify(articleRepository, never()).save(any(Article.class));
    }

    @Test
    void deleteArticle_WhenAuthorIsOwner_ShouldDeleteArticle() {
        when(articleRepository.findById(1L)).thenReturn(Optional.of(testArticle));

        articleService.deleteArticle(1L, testAuthor);

        verify(articleRepository, times(1)).delete(testArticle);
    }

    @Test
    void deleteArticle_WhenAuthorIsNotOwner_ShouldThrowException() {
        when(articleRepository.findById(1L)).thenReturn(Optional.of(testArticle));

        assertThrows(ArticleAccessDeniedException.class,
                () -> articleService.deleteArticle(1L, otherUser));
        verify(articleRepository, never()).delete(any(Article.class));
    }

    @Test
    void getArticlesSortedByCitationCount_ShouldReturnSortedList() {
        List<Article> expectedArticles = Arrays.asList(testArticle);
        when(articleRepository.findAllOrderByCitationCountDesc()).thenReturn(expectedArticles);

        List<Article> actualArticles = articleService.getArticlesSortedByCitationCount();

        assertNotNull(actualArticles);
        assertEquals(1, actualArticles.size());
        verify(articleRepository, times(1)).findAllOrderByCitationCountDesc();
    }
}