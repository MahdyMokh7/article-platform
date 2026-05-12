package ir.ac.ut.ece.ie.repository;

import ir.ac.ut.ece.ie.model.Article;
import java.util.*;
import java.util.stream.Collectors;

public class ArticleRepository {
    private static ArticleRepository instance;
    private Map<Integer, Article> articles;
    private int nextId;

    private ArticleRepository() {
        articles = new HashMap<>();
        nextId = 1;
        initializeSampleData();
    }

    public static ArticleRepository getInstance() {
        if (instance == null) {
            instance = new ArticleRepository();
        }
        return instance;
    }

    public Article createArticle(String title, String abstractText, String body, List<Integer> references) {
        if (isTitleTaken(title)) {
            return null;
        }

        Article article = new Article(nextId++, title, abstractText, body, references);
        articles.put(article.getId(), article);

        // Update citation counts for referenced articles
        for (int refId : references) {
            Article refArticle = articles.get(refId);
            if (refArticle != null) {
                refArticle.incrementCitationCount();
            }
        }

        return article;
    }

    public Article getArticle(int id) {
        return articles.get(id);
    }

    public List<Article> getAllArticlesByDate() {
        return articles.values().stream()
                .sorted((a1, a2) -> a2.getPublicationDate().compareTo(a1.getPublicationDate()))
                .collect(Collectors.toList());
    }

    public List<Article> getAllArticlesByCitationCount() {
        return articles.values().stream()
                .sorted((a1, a2) -> Integer.compare(a2.getCitationCount(), a1.getCitationCount()))
                .collect(Collectors.toList());
    }

    public List<Article> searchArticles(String term) {
        List<Article> titleMatches = new ArrayList<>();
        List<Article> abstractMatches = new ArrayList<>();

        for (Article article : articles.values()) {
            if (article.titleContains(term)) {
                titleMatches.add(article);
            } else if (article.abstractContains(term)) {
                abstractMatches.add(article);
            }
        }

        // Sort title matches by date (newest first)
        titleMatches.sort((a1, a2) -> a2.getPublicationDate().compareTo(a1.getPublicationDate()));

        // Sort abstract matches by date (newest first)
        abstractMatches.sort((a1, a2) -> a2.getPublicationDate().compareTo(a1.getPublicationDate()));

        List<Article> results = new ArrayList<>();
        results.addAll(titleMatches);
        results.addAll(abstractMatches);
        return results;
    }

    public List<Article> getAllArticles() {
        return new ArrayList<>(articles.values());
    }

    private boolean isTitleTaken(String title) {
        return articles.values().stream()
                .anyMatch(article -> article.getTitle().equalsIgnoreCase(title));
    }

    private void initializeSampleData() {
        try {
            createArticle("Getting Started with Java",
                    "Learn the basics of Java programming language",
                    "Java is a powerful, object-oriented programming language...",
                    new ArrayList<>());
            Thread.sleep(2000); // Wait 2 seconds

            createArticle("Web Server Architecture",
                    "Understanding how web servers work",
                    "Web servers handle HTTP requests and serve content...",
                    Arrays.asList(1));
            Thread.sleep(2000); // Wait 2 seconds

            createArticle("REST API Design Best Practices",
                    "Guidelines for designing RESTful APIs",
                    "REST APIs should be stateless and use proper HTTP methods...",
                    new ArrayList<>());

        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
}
