package com.mehdymokhtari.articleplatform.service;

import com.mehdymokhtari.articleplatform.dto.request.CreateArticleRequest;
import com.mehdymokhtari.articleplatform.exception.ArticleAccessDeniedException;
import com.mehdymokhtari.articleplatform.exception.ArticleNotFoundException;
import com.mehdymokhtari.articleplatform.exception.DuplicateTitleException;
import com.mehdymokhtari.articleplatform.model.entity.Article;
import com.mehdymokhtari.articleplatform.model.entity.User;
import com.mehdymokhtari.articleplatform.repository.ArticleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;

@Service
@Transactional
public class ArticleService {

    private final ArticleRepository articleRepository;

    public ArticleService(ArticleRepository articleRepository) {
        this.articleRepository = articleRepository;
    }

    public List<Article> getAllArticlesSortedByDate() {
        return articleRepository.findAllByOrderByPublicationDateDesc();
    }

    public List<Article> searchArticles(String term) {
        if (term == null || term.trim().isEmpty()) {
            return new ArrayList<>();
        }

        String searchTerm = term.trim();

        List<Article> titleMatches = articleRepository.findByTitleContainingIgnoreCase(searchTerm);
        List<Article> abstractMatches = articleRepository.findByAbstractTextContainingIgnoreCase(searchTerm);

        abstractMatches.removeAll(titleMatches);

        List<Article> results = new ArrayList<>();
        results.addAll(titleMatches);
        results.addAll(abstractMatches);

        return results;
    }

    public boolean isTitleUnique(String title) {
        return !articleRepository.existsByTitle(title);
    }

    public Article getArticleById(Long id) {
        return articleRepository.findById(id)
                .orElseThrow(() -> new ArticleNotFoundException("Article not found with id: " + id));
    }

    public Article createArticle(CreateArticleRequest request, User author) {
        validateTitleUniqueness(request.getTitle());

        Article article = new Article();
        article.setTitle(request.getTitle());
        article.setAbstractText(request.getAbstractText());
        article.setBody(request.getBody());
        article.setPublicationDate(LocalDateTime.now());
        article.setAuthor(author);

        if (request.getReferenceIds() != null && !request.getReferenceIds().isEmpty()) {
            List<Article> references = articleRepository.findAllById(request.getReferenceIds());
            article.setReferences(new HashSet<>(references));
        }

        Article savedArticle = articleRepository.save(article);
        author.addArticle(savedArticle);

        return savedArticle;
    }

    public Article updateArticle(Long id, CreateArticleRequest request, User currentUser) {
        Article article = getArticleById(id);

        validateArticleOwnership(article, currentUser);

        if (!article.getTitle().equals(request.getTitle())) {
            validateTitleUniqueness(request.getTitle());
        }

        article.setTitle(request.getTitle());
        article.setAbstractText(request.getAbstractText());
        article.setBody(request.getBody());

        return articleRepository.save(article);
    }

    public void deleteArticle(Long id, User currentUser) {
        Article article = getArticleById(id);

        validateArticleOwnership(article, currentUser);

        articleRepository.delete(article);
    }

    public List<Article> getArticlesSortedByCitationCount() {
        return articleRepository.findAllOrderByCitationCountDesc();
    }

    private void validateTitleUniqueness(String title) {
        if (!isTitleUnique(title)) {
            throw new DuplicateTitleException("An article with title '" + title + "' already exists");
        }
    }

    private void validateArticleOwnership(Article article, User currentUser) {
        if (!Objects.equals(article.getAuthor().getId(), currentUser.getId())) {
            throw new ArticleAccessDeniedException("You do not have permission to modify this article");
        }
    }
}