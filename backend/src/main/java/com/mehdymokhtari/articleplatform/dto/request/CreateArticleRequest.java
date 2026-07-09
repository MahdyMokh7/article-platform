package com.mehdymokhtari.articleplatform.dto.request;

import jakarta.validation.constraints.*;
import java.util.List;

public class CreateArticleRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 200, message = "Title cannot exceed 200 characters")
    private String title;

    @Size(max = 500, message = "Abstract cannot exceed 500 characters")
    private String abstractText;

    @NotBlank(message = "Body is required")
    private String body;

    private List<Long> referenceIds;

    // Getters and Setters
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getAbstractText() { return abstractText; }
    public void setAbstractText(String abstractText) { this.abstractText = abstractText; }

    public String getBody() { return body; }
    public void setBody(String body) { this.body = body; }

    public List<Long> getReferenceIds() { return referenceIds; }
    public void setReferenceIds(List<Long> referenceIds) { this.referenceIds = referenceIds; }
}