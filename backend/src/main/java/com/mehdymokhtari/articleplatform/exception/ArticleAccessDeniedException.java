package com.mehdymokhtari.articleplatform.exception;

public class ArticleAccessDeniedException extends RuntimeException {
    public ArticleAccessDeniedException(String message) {
        super(message);
    }
}