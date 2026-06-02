package ir.ac.ut.ece.ie.articleplatform.exception;

public class DuplicateTitleException extends RuntimeException {
    public DuplicateTitleException(String message) {
        super(message);
    }
}