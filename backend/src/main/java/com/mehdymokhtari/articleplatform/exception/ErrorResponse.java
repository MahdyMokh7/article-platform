package com.mehdymokhtari.articleplatform.exception;

public class ErrorResponse {
    private String errorCode;
    private String message;
    private long timestamp;

    public ErrorResponse(String errorCode, String message) {
        this.errorCode = errorCode;
        this.message = message;
        this.timestamp = System.currentTimeMillis();
    }

    public String getErrorCode() { return errorCode; }
    public String getMessage() { return message; }
    public long getTimestamp() { return timestamp; }
}