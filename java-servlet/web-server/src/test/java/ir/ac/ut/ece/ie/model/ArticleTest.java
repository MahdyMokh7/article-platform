package ir.ac.ut.ece.ie.model;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import static org.junit.jupiter.api.Assertions.*;

public class ArticleTest {

    private Article article;

    @BeforeEach
    void setUp() {
        article = new Article(1, "Test Title", "Test Abstract", "Test Body", new ArrayList<>());
    }

    @Test
    void testArticleCreation() {
        assertNotNull(article);
        assertEquals(1, article.getId());
        assertEquals("Test Title", article.getTitle());
        assertEquals("Test Abstract", article.getAbstractText());
        assertEquals("Test Body", article.getBody());
        assertNotNull(article.getPublicationDate());
        assertEquals(0, article.getCitationCount());
        assertTrue(article.getReferences().isEmpty());
    }

    @Test
    void testArticleWithReferences() {
        Article articleWithRefs = new Article(2, "Referenced Article", "Abstract", "Body", Arrays.asList(1, 2));
        assertFalse(articleWithRefs.getReferences().isEmpty());
        assertEquals(2, articleWithRefs.getReferences().size());
        assertEquals(1, articleWithRefs.getReferences().get(0));
    }

    @Test
    void testTitleContains() {
        assertTrue(article.titleContains("Test"));
        assertTrue(article.titleContains("test")); // Case insensitive
        assertTrue(article.titleContains("Title"));
        assertFalse(article.titleContains("Nonexistent"));
        assertFalse(article.titleContains(""));
    }

    @Test
    void testAbstractContains() {
        assertTrue(article.abstractContains("Test"));
        assertTrue(article.abstractContains("Abstract"));
        assertTrue(article.abstractContains("abstract")); // Case insensitive
        assertFalse(article.abstractContains("Nonexistent"));
    }

    @Test
    void testCitationCount() {
        assertEquals(0, article.getCitationCount());
        article.setCitationCount(5);
        assertEquals(5, article.getCitationCount());
        article.incrementCitationCount();
        assertEquals(6, article.getCitationCount());
    }

    @Test
    void testPublicationDateIsSet() {
        Date beforeCreation = new Date();
        Article newArticle = new Article(3, "New", "Abstract", "Body", new ArrayList<>());
        Date afterCreation = new Date();

        assertNotNull(newArticle.getPublicationDate());
        assertTrue(newArticle.getPublicationDate().compareTo(beforeCreation) >= 0);
        assertTrue(newArticle.getPublicationDate().compareTo(afterCreation) <= 0);
    }
}
