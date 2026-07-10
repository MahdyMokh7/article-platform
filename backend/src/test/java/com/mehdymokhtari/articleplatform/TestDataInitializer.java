package com.mehdymokhtari.articleplatform;

import com.mehdymokhtari.articleplatform.model.entity.Article;
import com.mehdymokhtari.articleplatform.model.entity.User;
import com.mehdymokhtari.articleplatform.model.enums.Role;
import com.mehdymokhtari.articleplatform.repository.ArticleRepository;
import com.mehdymokhtari.articleplatform.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
@Profile("test")  // Only runs when "test" profile is active
public class TestDataInitializer implements CommandLineRunner {

    @Autowired
    private ArticleRepository articleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        // Clean database first (since create-drop handles this, this is extra safety)
        articleRepository.deleteAll();
        userRepository.deleteAll();

        System.out.println("🧪 Initializing test database...");

        User testUser = new User(
                "testuser",
                "test@example.com",
                "+989123456789",
                passwordEncoder.encode("password123"),
                Role.ROLE_USER
        );
        userRepository.save(testUser);

        User testUser2 = new User(
                "testuser2",
                "test2@example.com",
                "+989987654321",
                passwordEncoder.encode("password123"),
                Role.ROLE_USER
        );
        userRepository.save(testUser2);

        Article article1 = new Article();
        article1.setTitle("Test Article 1");
        article1.setAbstractText("Test Abstract 1");
        article1.setBody("Test Body 1");
        article1.setPublicationDate(LocalDateTime.now());
        article1.setAuthor(testUser);
        articleRepository.save(article1);

        Article article2 = new Article();
        article2.setTitle("Test Article 2");
        article2.setAbstractText("Test Abstract 2");
        article2.setBody("Test Body 2");
        article2.setPublicationDate(LocalDateTime.now());
        article2.setAuthor(testUser);
        articleRepository.save(article2);

        Article article3 = new Article();
        article3.setTitle("Test Article 3");
        article3.setAbstractText("Test Abstract 3");
        article3.setBody("Test Body 3");
        article3.setPublicationDate(LocalDateTime.now());
        article3.setAuthor(testUser2);
        articleRepository.save(article3);

        article2.getReferences().add(article1);
        articleRepository.save(article2);

        article3.getReferences().add(article1);
        article3.getReferences().add(article2);
        articleRepository.save(article3);

        testUser.getArticles().addAll(List.of(article1, article2));
        testUser2.getArticles().add(article3);
        userRepository.save(testUser);
        userRepository.save(testUser2);

        System.out.println("✅ Test database initialized with 2 users and 3 articles!");
    }
}