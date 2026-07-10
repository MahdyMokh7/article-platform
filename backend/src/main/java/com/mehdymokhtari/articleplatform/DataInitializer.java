package com.mehdymokhtari.articleplatform;

import com.mehdymokhtari.articleplatform.model.entity.Article;
import com.mehdymokhtari.articleplatform.model.entity.User;
import com.mehdymokhtari.articleplatform.model.enums.Role;
import com.mehdymokhtari.articleplatform.repository.ArticleRepository;
import com.mehdymokhtari.articleplatform.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
@Profile("!test")
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private ArticleRepository articleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        // Check if any data exists (users are the parent table)
        if (userRepository.count() > 0) {
            System.out.println("ℹ️ Data already exists. Skipping initialization.");
            return;
        }

        System.out.println("📝 Initializing database with sample data...");

        try {
            // Create users
            User user1 = new User(
                    "alirezav",
                    "alireza@example.com",
                    "+989123456789",
                    passwordEncoder.encode("SecurePass123"),
                    Role.ROLE_USER
            );
            userRepository.save(user1);

            User user2 = new User(
                    "maryamh",
                    "maryam@example.com",
                    "+989987654321",
                    passwordEncoder.encode("StrongPass456"),
                    Role.ROLE_USER
            );
            userRepository.save(user2);

            User admin = new User(
                    "admin",
                    "admin@articleplatform.com",
                    "+989111111111",
                    passwordEncoder.encode("AdminPass123"),
                    Role.ROLE_ADMIN
            );
            userRepository.save(admin);

            // Create articles
            Article article1 = new Article();
            article1.setTitle("REST API Architecture");
            article1.setAbstractText("An introduction to RESTful API design principles");
            article1.setBody("REST (Representational State Transfer) is an architectural style for designing networked applications.");
            article1.setPublicationDate(LocalDateTime.now().minusDays(5));
            article1.setAuthor(user1);
            articleRepository.save(article1);

            Article article2 = new Article();
            article2.setTitle("Spring Boot Fundamentals");
            article2.setAbstractText("Getting started with Spring Boot framework");
            article2.setBody("Spring Boot is a Java-based framework used for creating microservices.");
            article2.setPublicationDate(LocalDateTime.now().minusDays(3));
            article2.setAuthor(user1);
            articleRepository.save(article2);

            Article article3 = new Article();
            article3.setTitle("Hibernate ORM Guide");
            article3.setAbstractText("Understanding Object-Relational Mapping with Hibernate");
            article3.setBody("Hibernate is an ORM tool that maps Java objects to database tables.");
            article3.setPublicationDate(LocalDateTime.now().minusDays(1));
            article3.setAuthor(user2);
            articleRepository.save(article3);

            // Set references
            article2.getReferences().add(article1);
            articleRepository.save(article2);

            article3.getReferences().add(article1);
            article3.getReferences().add(article2);
            articleRepository.save(article3);

            // Update user-article relationships
            user1.getArticles().addAll(List.of(article1, article2));
            user2.getArticles().add(article3);
            userRepository.save(user1);
            userRepository.save(user2);

            System.out.println("✅ Initialized 3 users and 3 articles!");
            System.out.println("   Test Users:");
            System.out.println("   - alirezav / SecurePass123 (ROLE_USER)");
            System.out.println("   - maryamh / StrongPass456 (ROLE_USER)");
            System.out.println("   - admin / AdminPass123 (ROLE_ADMIN)");

        } catch (Exception e) {
            System.err.println("❌ Failed to initialize data: " + e.getMessage());
            e.printStackTrace();
        }
    }
}