package ir.ac.ut.ece.ie.articleplatform;

import ir.ac.ut.ece.ie.articleplatform.model.Article;
import ir.ac.ut.ece.ie.articleplatform.repository.ArticleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private ArticleRepository articleRepository;

    @Override
    public void run(String... args) throws Exception {
        // Check if database is empty
        if (articleRepository.count() == 0) {
            System.out.println("📝 Adding initial articles...");

            // Article 1
            Article article1 = new Article();
            article1.setTitle("REST API Architecture");
            article1.setAbstractText("An introduction to RESTful API design principles");
            article1.setBody("REST (Representational State Transfer) is an architectural style for designing networked applications. It uses HTTP methods (GET, POST, PUT, DELETE) and status codes to represent operations and results.");
            article1.setPublicationDate(LocalDateTime.now().minusDays(5));
            articleRepository.save(article1);

            // Article 2
            Article article2 = new Article();
            article2.setTitle("Spring Boot Fundamentals");
            article2.setAbstractText("Getting started with Spring Boot framework");
            article2.setBody("Spring Boot is a Java-based framework used for creating microservices. It provides auto-configuration, embedded servers, and production-ready features.");
            article2.setPublicationDate(LocalDateTime.now().minusDays(3));
            articleRepository.save(article2);

            // Article 3
            Article article3 = new Article();
            article3.setTitle("Hibernate ORM Guide");
            article3.setAbstractText("Understanding Object-Relational Mapping with Hibernate");
            article3.setBody("Hibernate is an ORM tool that maps Java objects to database tables. It reduces boilerplate JDBC code and provides features like lazy loading and caching.");
            article3.setPublicationDate(LocalDateTime.now().minusDays(1));
            articleRepository.save(article3);

            // Set references (Bonus - Article 2 references Article 1)
            article2.getReferences().add(article1);
            articleRepository.save(article2);

            // Article 3 references Article 1 and Article 2
            article3.getReferences().add(article1);
            article3.getReferences().add(article2);
            articleRepository.save(article3);

            System.out.println("✅ Added 3 initial articles!");
            System.out.println("   Article 1: REST API Architecture");
            System.out.println("   Article 2: Spring Boot Fundamentals (references Article 1)");
            System.out.println("   Article 3: Hibernate ORM Guide (references Articles 1 & 2)");
        } else {
            System.out.println("ℹ️ Database already has " + articleRepository.count() + " articles. Skipping initialization.");
        }
    }
}