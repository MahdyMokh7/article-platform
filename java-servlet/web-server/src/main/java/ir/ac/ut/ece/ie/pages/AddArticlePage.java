package ir.ac.ut.ece.ie.pages;

import ir.ac.ut.ece.ie.model.Article;
import ir.ac.ut.ece.ie.repository.ArticleRepository;
import java.util.*;

public class AddArticlePage {

    private ArticleRepository repository;

    public AddArticlePage() {
        repository = ArticleRepository.getInstance();
    }

    public byte[] pageBody(Map<String, Object> request) {
        String method = (String) request.get("method");

        if (method.equalsIgnoreCase("POST")) {
            return handlePost(request);
        } else {
            return handleGet();
        }
    }

    private byte[] handleGet() {
        StringBuilder html = new StringBuilder();
        html.append("<!DOCTYPE html>\n");
        html.append("<html>\n");
        html.append("<head>\n");
        html.append("    <meta charset=\"UTF-8\">\n");
        html.append("    <title>Add New Article</title>\n");
        html.append("    <link rel=\"stylesheet\" href=\"http://localhost:9091/static/css/style.css\">\n");
        html.append("</head>\n");
        html.append("<body>\n");
        html.append("    <div class=\"container\">\n");

        // Navigation
        html.append("        <div class=\"nav\">\n");
        html.append("            <a href=\"/MainPage\">← Back to Articles</a>\n");
        html.append("        </div>\n");

        html.append("        <h1>Add New Article</h1>\n");
        html.append("        <form method=\"POST\" action=\"/AddArticlePage\">\n");
        html.append("            <div class=\"form-group\">\n");
        html.append("                <label>Title:</label>\n");
        html.append("                <input type=\"text\" name=\"title\" required>\n");
        html.append("            </div>\n");
        html.append("            <div class=\"form-group\">\n");
        html.append("                <label>Abstract:</label>\n");
        html.append("                <textarea name=\"abstract\" required></textarea>\n");
        html.append("            </div>\n");
        html.append("            <div class=\"form-group\">\n");
        html.append("                <label>Body:</label>\n");
        html.append("                <textarea name=\"body\" required></textarea>\n");
        html.append("            </div>\n");

        // References (Bonus)
        html.append("            <div class=\"form-group\">\n");
        html.append("                <label>References (article IDs, comma-separated):</label>\n");
        html.append("                <input type=\"text\" name=\"references\" placeholder=\"e.g., 1,3,5\">\n");
        html.append("            </div>\n");

        html.append("            <div class=\"form-group\">\n");
        html.append("                <input type=\"submit\" value=\"Publish Article\">\n");
        html.append("            </div>\n");
        html.append("        </form>\n");
        html.append("    </div>\n");
        html.append("</body>\n");
        html.append("</html>\n");

        return html.toString().getBytes();
    }

    private byte[] handlePost(Map<String, Object> request) {
        Map<String, String> postParams = (Map<String, String>) request.get("postParams");

        String title = postParams.getOrDefault("title", "");
        String abstractText = postParams.getOrDefault("abstract", "");
        String body = postParams.getOrDefault("body", "");
        String referencesStr = postParams.getOrDefault("references", "");

        List<Integer> references = new ArrayList<>();
        if (!referencesStr.isEmpty()) {
            for (String refId : referencesStr.split(",")) {
                try {
                    references.add(Integer.parseInt(refId.trim()));
                } catch (NumberFormatException e) {
                    // Ignore invalid references
                }
            }
        }

        Article article = repository.createArticle(title, abstractText, body, references);

        StringBuilder html = new StringBuilder();
        html.append("<!DOCTYPE html>\n");
        html.append("<html>\n");
        html.append("<head>\n");
        html.append("    <meta charset=\"UTF-8\">\n");
        html.append("    <title>Article Created</title>\n");
        html.append("    <style>\n");
        html.append("        body { font-family: Arial, sans-serif; margin: 40px; background-color: #f5f5f5; }\n");
        html.append("        .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 5px; text-align: center; }\n");
        html.append("        .success { color: green; }\n");
        html.append("        .error { color: red; }\n");
        html.append("        .nav a { color: #0066cc; }\n");
        html.append("    </style>\n");
        html.append("</head>\n");
        html.append("<body>\n");
        html.append("    <div class=\"container\">\n");

        if (article != null) {
            html.append("        <h1 class=\"success\">✓ Article Published Successfully!</h1>\n");
            html.append("        <p>Your article \"" + escapeHtml(title) + "\" has been published.</p>\n");
            html.append("        <p><a href=\"/ArticlePage?id=" + article.getId() + "\">View your article</a></p>\n");
        } else {
            html.append("        <h1 class=\"error\">✗ Error: Title Already Exists</h1>\n");
            html.append("        <p>An article with the title \"" + escapeHtml(title) + "\" already exists.</p>\n");
            html.append("        <p><a href=\"/AddArticlePage\">Try again</a></p>\n");
        }

        html.append("        <p><a href=\"/MainPage\">Return to Home</a></p>\n");
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
