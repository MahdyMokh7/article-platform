package ir.ac.ut.ece.ie.integration;

import ir.ac.ut.ece.ie.model.Article;
import ir.ac.ut.ece.ie.repository.ArticleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class ArticleWorkflowTest {

    private ArticleRepository repository;

    @BeforeEach
    void setUp() {
        // Reset repository
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
    void testCompleteArticleWorkflow() {
        // Step 1: Create a new article
        Article newArticle = repository.createArticle(
                "My Test Article",
                "This is a test abstract",
                "This is the test body content",
                new ArrayList<>()
        );
        assertNotNull(newArticle);
        int articleId = newArticle.getId();

        // Step 2: Retrieve the article
        Article retrieved = repository.getArticle(articleId);
        assertNotNull(retrieved);
        assertEquals("My Test Article", retrieved.getTitle());

        // Step 3: Search for the article
        List<Article> searchResults = repository.searchArticles("Test Article");
        assertFalse(searchResults.isEmpty());
        assertEquals("My Test Article", searchResults.get(0).getTitle());

        // Step 4: Create another article that references the first
        Article referencingArticle = repository.createArticle(
                "Referencing Article",
                "Abstract with reference",
                "Body",
                Arrays.asList(articleId)
        );
        assertNotNull(referencingArticle);

        // Step 5: Verify citation count increased
        Article citedArticle = repository.getArticle(articleId);
        assertEquals(1, citedArticle.getCitationCount());

        // Step 6: Verify sorting by date
        List<Article> allArticles = repository.getAllArticlesByDate();
        assertTrue(allArticles.size() >= 2);
        // Most recent article should be first
        assertEquals(referencingArticle.getId(), allArticles.get(0).getId());
    }

    @Test
    void testDuplicateTitlePrevention() {
        // First article
        Article first = repository.createArticle("Unique Title Workflow", "Abstract", "Body", new ArrayList<>());
        assertNotNull(first);

        // Second article with same title - should be prevented
        Article duplicate = repository.createArticle("Unique Title Workflow", "Different", "Different", new ArrayList<>());
        assertNull(duplicate);

        // Verify only one article exists with this title
        List<Article> searchResults = repository.searchArticles("Unique Title Workflow");
        assertEquals(1, searchResults.size());
    }
}
