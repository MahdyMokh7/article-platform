package ir.ac.ut.ece.ie.pages;

import ir.ac.ut.ece.ie.model.Article;
import ir.ac.ut.ece.ie.repository.ArticleRepository;
import java.util.*;
import java.util.stream.Collectors;

public class MainPage {

    private ArticleRepository repository;
    private static final String STATIC_SERVER = "http://localhost:9091";
    private static final String DYNAMIC_SERVER = "http://localhost:9092";

    public MainPage() {
        repository = ArticleRepository.getInstance();
    }

    public byte[] pageBody(Map<String, Object> request) {
        Map<String, String> queryParams = (Map<String, String>) request.get("queryParams");
        String searchTerm = queryParams.getOrDefault("search", "");

        List<Article> articles;
        if (!searchTerm.isEmpty()) {
            articles = repository.searchArticles(searchTerm);
        } else {
            articles = repository.getAllArticlesByDate();
        }

        StringBuilder html = new StringBuilder();
        html.append("<!DOCTYPE html>\n");
        html.append("<html>\n");
        html.append("<head>\n");
        html.append("    <meta charset=\"UTF-8\">\n");
        html.append("    <title>Article Platform</title>\n");
        html.append("    <link rel=\"stylesheet\" href=\"" + STATIC_SERVER + "/static/css/style.css\">\n");
        html.append("</head>\n");
        html.append("<body>\n");
        html.append("    <div class=\"container\">\n");

        // Navigation
        html.append("        <div class=\"nav\">\n");
        html.append("            <a href=\"" + DYNAMIC_SERVER + "/MainPage\">Home</a>\n");
        html.append("            <a href=\"" + DYNAMIC_SERVER + "/AddArticlePage\">Add New Article</a>\n");
        html.append("        </div>\n");

        // Search
        html.append("        <div class=\"search-box\">\n");
        html.append("            <form method=\"GET\" action=\"" + DYNAMIC_SERVER + "/MainPage\">\n");
        html.append("                <input type=\"text\" name=\"search\" placeholder=\"Search articles...\" value=\"" + escapeHtml(searchTerm) + "\">\n");
        html.append("                <input type=\"submit\" value=\"Search\">\n");
        html.append("            </form>\n");
        html.append("        </div>\n");

        // Articles
        if (articles.isEmpty()) {
            html.append("        <p>No articles found.</p>\n");
        } else {
            for (Article article : articles) {
                html.append("        <div class=\"article\">\n");
                html.append("            <h2><a href=\"" + DYNAMIC_SERVER + "/ArticlePage?id=" + article.getId() + "\">" + escapeHtml(article.getTitle()) + "</a></h2>\n");
                html.append("            <div class=\"meta\">Published: " + article.getPublicationDate() + " | Citations: " + article.getCitationCount() + "</div>\n");
                html.append("            <div class=\"abstract\">" + escapeHtml(article.getAbstractText()) + "</div>\n");
                html.append("        </div>\n");
            }
        }

        // Footer with image and copyright
        html.append("        <div class=\"footer\">\n");
        html.append("            <div class=\"footer-content\">\n");
        html.append("                <div class=\"author-image\">\n");
        html.append("                    <img src=\"" + STATIC_SERVER + "/myImage.jpg\" alt=\"Mehdy Mokhtari\" class=\"profile-img\">\n");
        html.append("                </div>\n");
        html.append("                <div class=\"copyright\">\n");
        html.append("                    <p>© 2024 Mehdy Mokhtari. All rights reserved.</p>\n");
        html.append("                    <p>All data and content on this platform are owned by Mehdy Mokhtari.</p>\n");
        html.append("                </div>\n");
        html.append("            </div>\n");
        html.append("        </div>\n");

        html.append("    </div>\n");
        html.append("</body>\n");
        html.append("</html>\n");

        return html.toString().getBytes();
    }

    private String escapeHtml(String text) {
        if (text == null) return "";
        return text.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;");
    }
}