package ir.ac.ut.ece.ie.repository;

import ir.ac.ut.ece.ie.model.Article;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;

public class ArticleRepositoryTest {

    private ArticleRepository repository;

    @BeforeEach
    void setUp() {
        // Reset the singleton for clean tests
        try {
            java.lang.reflect.Field instance = ArticleRepository.class.getDeclaredField("instance");
            instance.setAccessible(true);
            instance.set(null, null);
        } catch (Exception e) {
            e.printStackTrace();
        }
        repository = ArticleRepository.getInstance();
    }

    @Test
    void testSingletonPattern() {
        ArticleRepository anotherInstance = ArticleRepository.getInstance();
        assertSame(repository, anotherInstance);
    }

    @Test
    void testCreateArticleSuccess() {
        Article article = repository.createArticle(
                "Unique Test Title",
                "Test Abstract",
                "Test Body",
                new ArrayList<>()
        );

        assertNotNull(article);
        assertEquals("Unique Test Title", article.getTitle());
    }

    @Test
    void testCreateArticleDuplicateTitle() {
        // First creation should succeed
        Article first = repository.createArticle("Duplicate Title Test", "Abstract1", "Body1", new ArrayList<>());
        assertNotNull(first);

        // Second creation with same title should fail (return null)
        Article second = repository.createArticle("Duplicate Title Test", "Abstract2", "Body2", new ArrayList<>());
        assertNull(second);
    }

    @Test
    void testCreateArticleCaseInsensitiveDuplicate() {
        repository.createArticle("Java Programming Test", "Abstract", "Body", new ArrayList<>());

        // Different case should still be considered duplicate
        Article duplicate = repository.createArticle("JAVA PROGRAMMING TEST", "Abstract", "Body", new ArrayList<>());
        assertNull(duplicate);
    }

    @Test
    void testGetArticleById() {
        Article article = repository.getArticle(1);
        assertNotNull(article);
        assertEquals("Getting Started with Java", article.getTitle());

        Article nonExistent = repository.getArticle(999);
        assertNull(nonExistent);
    }

    @Test
    void testGetAllArticlesByDate() {
        List<Article> articles = repository.getAllArticlesByDate();
        assertNotNull(articles);
        assertTrue(articles.size() >= 3);

        // Verify articles are sorted by date (newest first)
        for (int i = 0; i < articles.size() - 1; i++) {
            assertTrue(articles.get(i).getPublicationDate().compareTo(articles.get(i + 1).getPublicationDate()) >= 0);
        }
    }

    @Test
    void testSearchArticlesByTitle() {
        List<Article> results = repository.searchArticles("Java");
        assertFalse(results.isEmpty());

        // All results should contain the search term
        for (Article article : results) {
            assertTrue(article.getTitle().toLowerCase().contains("java") ||
                    article.getAbstractText().toLowerCase().contains("java"));
        }
    }

    @Test
    void testSearchPriority_TitleBeforeAbstract() {
        // Search for a term that exists in both title and abstract
        List<Article> results = repository.searchArticles("Java");

        boolean foundTitleMatchFirst = false;
        boolean foundAbstractMatch = false;

        for (Article article : results) {
            if (article.getTitle().toLowerCase().contains("java")) {
                foundTitleMatchFirst = true;
            } else if (article.getAbstractText().toLowerCase().contains("java") && foundTitleMatchFirst) {
                foundAbstractMatch = true;
            }
        }

        // Title matches should appear before abstract matches
        // This is harder to assert directly, but we can check ordering
        int titleMatchIndex = -1;
        int abstractMatchIndex = -1;

        for (int i = 0; i < results.size(); i++) {
            if (results.get(i).getTitle().toLowerCase().contains("java") && titleMatchIndex == -1) {
                titleMatchIndex = i;
            }
            if (results.get(i).getAbstractText().toLowerCase().contains("java") &&
                    !results.get(i).getTitle().toLowerCase().contains("java") &&
                    abstractMatchIndex == -1) {
                abstractMatchIndex = i;
            }
        }

        if (titleMatchIndex != -1 && abstractMatchIndex != -1) {
            assertTrue(titleMatchIndex < abstractMatchIndex,
                    "Title matches should come before abstract matches");
        }
    }

    @Test
    void testSearchNoResults() {
        List<Article> results = repository.searchArticles("XYZNonexistentTerm12345");
        assertTrue(results.isEmpty());
    }

    @Test
    void testCitationCountWhenReferencing() {
        // Create an article that references article 1
        Article newArticle = repository.createArticle(
                "Referencing Article Test",
                "Abstract",
                "Body",
                Arrays.asList(1)
        );

        assertNotNull(newArticle);

        // Article 1 should have its citation count increased
        Article referencedArticle = repository.getArticle(1);
        assertTrue(referencedArticle.getCitationCount() > 0);
    }

    @Test
    void testGetAllArticles() {
        List<Article> allArticles = repository.getAllArticles();
        assertNotNull(allArticles);
        assertTrue(allArticles.size() >= 3);
    }
}
