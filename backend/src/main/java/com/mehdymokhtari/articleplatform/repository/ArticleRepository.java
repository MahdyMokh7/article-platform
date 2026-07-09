package com.mehdymokhtari.articleplatform.repository;

import com.mehdymokhtari.articleplatform.model.Article;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ArticleRepository extends JpaRepository<Article, Long> {

    // Homepage: Get all articles sorted by publication date (newest first)
    List<Article> findAllByOrderByPublicationDateDesc();

    // Search: Find by title containing term (case-insensitive)
    List<Article> findByTitleContainingIgnoreCase(String term);

    // Search: Find by abstract containing term (case-insensitive)
    List<Article> findByAbstractTextContainingIgnoreCase(String term);

    // Check if title already exists (for uniqueness validation)
    boolean existsByTitle(String title);

    // Bonus: Get articles sorted by citation count (how many times they've been referenced)
    @Query("SELECT a FROM Article a ORDER BY SIZE(a.citedBy) DESC")
    List<Article> findAllOrderByCitationCountDesc();
}