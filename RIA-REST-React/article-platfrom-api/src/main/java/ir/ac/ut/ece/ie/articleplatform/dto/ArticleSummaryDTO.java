package ir.ac.ut.ece.ie.articleplatform.dto;

import java.time.LocalDateTime;

public class ArticleSummaryDTO {
    private Long id;
    private String title;
    private String abstractText;
    private LocalDateTime publicationDate;
    private int citationCount;

    public ArticleSummaryDTO(Long id, String title, String abstractText,
                             LocalDateTime publicationDate, int citationCount) {
        this.id = id;
        this.title = title;
        this.abstractText = abstractText;
        this.publicationDate = publicationDate;
        this.citationCount = citationCount;
    }

    public ArticleSummaryDTO() {
    }

    // Getters
    public Long getId() { return id; }
    public String getTitle() { return title; }
    public String getAbstractText() { return abstractText; }
    public LocalDateTime getPublicationDate() { return publicationDate; }
    public int getCitationCount() { return citationCount; }

    // Setters (needed if Spring needs to bind data)
    public void setId(Long id) { this.id = id; }
    public void setTitle(String title) { this.title = title; }
    public void setAbstractText(String abstractText) { this.abstractText = abstractText; }
    public void setPublicationDate(LocalDateTime publicationDate) { this.publicationDate = publicationDate; }
    public void setCitationCount(int citationCount) { this.citationCount = citationCount; }
}