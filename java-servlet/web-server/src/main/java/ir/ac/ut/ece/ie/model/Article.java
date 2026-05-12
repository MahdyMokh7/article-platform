package ir.ac.ut.ece.ie.model;

import java.util.Date;
import java.util.List;
import java.util.ArrayList;

public class Article {
    private int id;
    private String title;
    private String abstractText;
    private String body;
    private Date publicationDate;
    private List<Integer> references;
    private int citationCount;

    public Article(int id, String title, String abstractText, String body, List<Integer> references) {
        this.id = id;
        this.title = title;
        this.abstractText = abstractText;
        this.body = body;
        this.publicationDate = new Date();
        this.references = references != null ? references : new ArrayList<>();
        this.citationCount = 0;
    }

    // Getters
    public int getId() { return id; }
    public String getTitle() { return title; }
    public String getAbstractText() { return abstractText; }
    public String getBody() { return body; }
    public Date getPublicationDate() { return publicationDate; }
    public List<Integer> getReferences() { return references; }
    public int getCitationCount() { return citationCount; }

    // Setters
    public void setCitationCount(int citationCount) { this.citationCount = citationCount; }
    public void incrementCitationCount() { this.citationCount++; }

    // Search helpers
    public boolean titleContains(String term) {
        if(term.isEmpty()) {
            return false;
        }
        return title.toLowerCase().contains(term.toLowerCase());
    }

    public boolean abstractContains(String term) {
        return abstractText.toLowerCase().contains(term.toLowerCase());
    }
}
