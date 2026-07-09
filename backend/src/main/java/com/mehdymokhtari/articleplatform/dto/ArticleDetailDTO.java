package com.mehdymokhtari.articleplatform.dto;

import java.time.LocalDateTime;
import java.util.List;

public class ArticleDetailDTO extends ArticleSummaryDTO {
    private String body;
    private List<ArticleSummaryDTO> references;

    public ArticleDetailDTO(Long id, String title, String abstractText,
                            LocalDateTime publicationDate, int citationCount,
                            String body, List<ArticleSummaryDTO> references) {
        super(id, title, abstractText, publicationDate, citationCount);
        this.body = body;
        this.references = references;
    }

    public ArticleDetailDTO() {
    }

    public String getBody() { return body; }
    public void setBody(String body) { this.body = body; }

    public List<ArticleSummaryDTO> getReferences() { return references; }
    public void setReferences(List<ArticleSummaryDTO> references) { this.references = references; }
}