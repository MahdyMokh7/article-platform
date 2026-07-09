package com.mehdymokhtari.articleplatform.dto.response;

import java.time.LocalDateTime;
import java.util.List;

public class ArticleDetailResponse extends ArticleSummaryResponse {
    private String body;
    private List<ArticleSummaryResponse> references;

    public ArticleDetailResponse(Long id, String title, String abstractText,
                                 LocalDateTime publicationDate, int citationCount,
                                 String body, List<ArticleSummaryResponse> references) {
        super(id, title, abstractText, publicationDate, citationCount);
        this.body = body;
        this.references = references;
    }

    public ArticleDetailResponse() {
        // default constructor for serialization framework
    }

    public String getBody() { return body; }
    public void setBody(String body) { this.body = body; }

    public List<ArticleSummaryResponse> getReferences() { return references; }
    public void setReferences(List<ArticleSummaryResponse> references) { this.references = references; }
}