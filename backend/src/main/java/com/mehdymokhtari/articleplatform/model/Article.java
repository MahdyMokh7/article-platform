package com.mehdymokhtari.articleplatform.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "articles")
public class Article {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 200)
    private String title;

    @Column(name = "abstract_text", length = 500)
    private String abstractText;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String body;

    @Column(name = "publication_date")
    private LocalDateTime publicationDate;

    // Self-referential many-to-many for references (Bonus)
    @ManyToMany
    @JoinTable(
            name = "article_references",
            joinColumns = @JoinColumn(name = "article_id"),
            inverseJoinColumns = @JoinColumn(name = "reference_id")
    )
    private Set<Article> references = new HashSet<>();

    @ManyToMany(mappedBy = "references")
    private Set<Article> citedBy = new HashSet<>();

    // Constructors
    public Article() {}

    public Article(String title, String abstractText, String body) {
        this.title = title;
        this.abstractText = abstractText;
        this.body = body;
        this.publicationDate = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getAbstractText() { return abstractText; }
    public void setAbstractText(String abstractText) { this.abstractText = abstractText; }

    public String getBody() { return body; }
    public void setBody(String body) { this.body = body; }

    public LocalDateTime getPublicationDate() { return publicationDate; }
    public void setPublicationDate(LocalDateTime publicationDate) { this.publicationDate = publicationDate; }

    public Set<Article> getReferences() { return references; }
    public void setReferences(Set<Article> references) { this.references = references; }

    public Set<Article> getCitedBy() { return citedBy; }
    public void setCitedBy(Set<Article> citedBy) { this.citedBy = citedBy; }
}