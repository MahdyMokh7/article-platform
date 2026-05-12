package ir.ac.ut.ece.ie.pages;

import ir.ac.ut.ece.ie.model.Article;
import ir.ac.ut.ece.ie.repository.ArticleRepository;
import java.util.*;

public class ArticlePage {

    private ArticleRepository repository;

    public ArticlePage() {
        repository = ArticleRepository.getInstance();
    }

    public byte[] pageBody(Map<String, Object> request) {
        Map<String, String> queryParams = (Map<String, String>) request.get("queryParams");
        String idStr = queryParams.get("id");

        if (idStr == null) {
            return "<html><body><h1>Error: Article ID required</h1></body></html>".getBytes();
        }

        try {
            int id = Integer.parseInt(idStr);
            Article article = repository.getArticle(id);

            if (article == null) {
                return "<html><body><h1>404 - Article Not Found</h1></body></html>".getBytes();
            }

            StringBuilder html = new StringBuilder();
            html.append("<!DOCTYPE html>\n");
            html.append("<html>\n");
            html.append("<head>\n");
            html.append("    <meta charset=\"UTF-8\">\n");
            html.append("    <title>" + escapeHtml(article.getTitle()) + "</title>\n");
            html.append("    <link rel=\"stylesheet\" href=\"http://localhost:9091/static/css/style.css\">\n");
            html.append("</head>\n");
            html.append("<body>\n");
            html.append("    <div class=\"container\">\n");

            // Navigation
            html.append("        <div class=\"nav\">\n");
            html.append("            <a href=\"/MainPage\">← Back to Articles</a>\n");
            html.append("        </div>\n");

            html.append("        <h1>" + escapeHtml(article.getTitle()) + "</h1>\n");
            html.append("        <div class=\"meta\">\n");
            html.append("            Published: " + article.getPublicationDate() + "<br>\n");
            html.append("            Citations: " + article.getCitationCount() + "\n");
            html.append("        </div>\n");

            html.append("        <div class=\"abstract\">\n");
            html.append("            <strong>Abstract:</strong><br>\n");
            html.append("            " + escapeHtml(article.getAbstractText()) + "\n");
            html.append("        </div>\n");

            html.append("        <div class=\"body\">\n");
            html.append("            " + escapeHtml(article.getBody()) + "\n");
            html.append("        </div>\n");

            // References (Bonus)
            if (!article.getReferences().isEmpty()) {
                html.append("        <div class=\"references\">\n");
                html.append("            <h3>References</h3>\n");
                html.append("            <ul>\n");
                for (int refId : article.getReferences()) {
                    Article refArticle = repository.getArticle(refId);
                    if (refArticle != null) {
                        html.append("                <li><a href=\"/ArticlePage?id=" + refId + "\">" +
                                escapeHtml(refArticle.getTitle()) + "</a></li>\n");
                    }
                }
                html.append("            </ul>\n");
                html.append("        </div>\n");
            }

            html.append("    </div>\n");
            html.append("</body>\n");
            html.append("</html>\n");

            return html.toString().getBytes();

        } catch (NumberFormatException e) {
            return "<html><body><h1>Error: Invalid article ID</h1></body></html>".getBytes();
        }
    }

    private String escapeHtml(String text) {
        if (text == null) return "";
        return text.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;");
    }
}