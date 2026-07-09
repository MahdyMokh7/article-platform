package com.mehdymokhtari.articleplatform;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ArticlePlatformApplication {
    public static void main(String[] args) {
        SpringApplication.run(ArticlePlatformApplication.class, args);
        System.out.println("========================================");
        System.out.println("📚 Article Platform API is Running!");
        System.out.println("========================================");
        System.out.println("📍 API Base URL: http://localhost:8080/api/articles");
        System.out.println("🐘 PostgreSQL Database Connected");
        System.out.println("========================================");
    }
}