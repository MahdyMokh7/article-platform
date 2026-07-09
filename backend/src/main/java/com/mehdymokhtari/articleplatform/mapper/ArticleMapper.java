package com.mehdymokhtari.articleplatform.mapper;

import com.mehdymokhtari.articleplatform.dto.response.ArticleDetailResponse;
import com.mehdymokhtari.articleplatform.dto.response.ArticleSummaryResponse;
import com.mehdymokhtari.articleplatform.model.entity.Article;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class ArticleMapper {

    public ArticleSummaryResponse toSummaryResponse(Article article) {
        return new ArticleSummaryResponse(
                article.getId(),
                article.getTitle(),
                article.getAbstractText(),
                article.getPublicationDate(),
                article.getCitedBy().size()
        );
    }

    public List<ArticleSummaryResponse> toSummaryResponseList(List<Article> articles) {
        return articles.stream()
                .map(this::toSummaryResponse)
                .collect(Collectors.toList());
    }

    public ArticleDetailResponse toDetailResponse(Article article) {
        List<ArticleSummaryResponse> referenceResponses = article.getReferences().stream()
                .map(this::toSummaryResponse)
                .collect(Collectors.toList());

        return new ArticleDetailResponse(
                article.getId(),
                article.getTitle(),
                article.getAbstractText(),
                article.getPublicationDate(),
                article.getCitedBy().size(),
                article.getBody(),
                referenceResponses
        );
    }
}