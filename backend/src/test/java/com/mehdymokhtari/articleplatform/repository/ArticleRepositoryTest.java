package com.mehdymokhtari.articleplatform.repository;

import com.mehdymokhtari.articleplatform.model.Article;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class ArticleRepositoryTest {

    @Autowired
    private ArticleRepository articleRepository;

    @Autowired
    private TestEntityManager entityManager;

    @BeforeEach
    void setUp() {
        // Clear existing data first
        articleRepository.deleteAll();
        entityManager.flush();
        
        // Then add test data
        Article article1 = new Article();
        article1.setTitle("First Article");
        article1.setAbstractText("Abstract one");
        article1.setBody("Body one");
        article1.setPublicationDate(LocalDateTime.now().minusDays(1));

        Article article2 = new Article();
        article2.setTitle("Second Article");
        article2.setAbstractText("Abstract two");
        article2.setBody("Body two");
        article2.setPublicationDate(LocalDateTime.now());

        entityManager.persist(article1);
        entityManager.persist(article2);
        entityManager.flush();
    }

    @Test
    void findAllByOrderByPublicationDateDesc_ShouldReturnNewestFirst() {
        List<Article> articles = articleRepository.findAllByOrderByPublicationDateDesc();

        assertThat(articles).hasSize(2);
        assertThat(articles.get(0).getTitle()).isEqualTo("Second Article");
        assertThat(articles.get(1).getTitle()).isEqualTo("First Article");
    }

    @Test
    void findByTitleContainingIgnoreCase_ShouldReturnMatchingArticles() {
        List<Article> results = articleRepository.findByTitleContainingIgnoreCase("first");

        assertThat(results).hasSize(1);
        assertThat(results.get(0).getTitle()).isEqualTo("First Article");
    }

    @Test
    void existsByTitle_WhenTitleExists_ShouldReturnTrue() {
        boolean exists = articleRepository.existsByTitle("First Article");
        assertThat(exists).isTrue();
    }

    @Test
    void existsByTitle_WhenTitleDoesNotExist_ShouldReturnFalse() {
        boolean exists = articleRepository.existsByTitle("Non Existent Title");
        assertThat(exists).isFalse();
    }
}