package ir.ac.ut.ece.ie.articleplatform.service;

import ir.ac.ut.ece.ie.articleplatform.model.Article;
import ir.ac.ut.ece.ie.articleplatform.repository.ArticleRepository;
import ir.ac.ut.ece.ie.articleplatform.dto.ArticleCreateDTO;
import ir.ac.ut.ece.ie.articleplatform.exception.DuplicateTitleException;
import ir.ac.ut.ece.ie.articleplatform.exception.ArticleNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.*;

@Service
@Transactional
public class ArticleService {

    @Autowired
    private ArticleRepository articleRepository;

    // Get all articles sorted by date (newest first)
    public List<Article> getAllArticlesSortedByDate() {
        return articleRepository.findAllByOrderByPublicationDateDesc();
    }

    // Search articles - title matches come BEFORE abstract matches
    public List<Article> searchArticles(String term) {
        if (term == null || term.trim().isEmpty()) {
            return new ArrayList<>();
        }

        List<Article> titleMatches = articleRepository.findByTitleContainingIgnoreCase(term);
        List<Article> abstractMatches = articleRepository.findByAbstractTextContainingIgnoreCase(term);

        // Remove any article that already appears in title matches
        abstractMatches.removeAll(titleMatches);

        // Combine: title matches first, then abstract matches
        List<Article> results = new ArrayList<>();
        results.addAll(titleMatches);
        results.addAll(abstractMatches);

        return results;
    }

    // Check if title is unique
    public boolean isTitleUnique(String title) {
        return !articleRepository.existsByTitle(title);
    }

    // Get single article by ID
    public Article getArticleById(Long id) {
        return articleRepository.findById(id)
                .orElseThrow(() -> new ArticleNotFoundException("Article not found with id: " + id));
    }

    // Create a new article
    public Article createArticle(ArticleCreateDTO dto) {
        // Validate title uniqueness
        if (!isTitleUnique(dto.getTitle())) {
            throw new DuplicateTitleException("An article with title '" + dto.getTitle() + "' already exists");
        }

        // Create new article entity
        Article article = new Article();
        article.setTitle(dto.getTitle());
        article.setAbstractText(dto.getAbstractText());
        article.setBody(dto.getBody());
        article.setPublicationDate(LocalDateTime.now());

        // Bonus: Add references if provided
        if (dto.getReferenceIds() != null && !dto.getReferenceIds().isEmpty()) {
            List<Article> references = articleRepository.findAllById(dto.getReferenceIds());
            article.setReferences(new HashSet<>(references));
        }

        return articleRepository.save(article);
    }

    // Bonus: Get articles sorted by citation count
    public List<Article> getArticlesSortedByCitationCount() {
        return articleRepository.findAllOrderByCitationCountDesc();
    }
}