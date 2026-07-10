/**
 * Popular Page Component - BONUS FEATURE
 *
 * Displays articles sorted by citation count (most cited first).
 * Features:
 * - Ranked list with position numbers
 * - Medal icons for top 3 positions
 * - Citation count display
 * - Link to each article
 * - Loading and empty states
 *
 * @component
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPopularArticles } from '../services/articleApi';
import ArticleCard from '../components/ArticleCard';
import styles from './PopularPage.module.css';

const PopularPage = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPopularArticles();
  }, []);

  const loadPopularArticles = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPopularArticles();
      setArticles(data);
    } catch (err) {
      setError('Failed to load popular articles. Please try again.');
      console.error('[PopularPage] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (index) => {
    switch (index) {
      case 0:
        return '🥇';
      case 1:
        return '🥈';
      case 2:
        return '🥉';
      default:
        return null;
    }
  };

  const getRankClass = (index) => {
    switch (index) {
      case 0:
        return styles.rankGold;
      case 1:
        return styles.rankSilver;
      case 2:
        return styles.rankBronze;
      default:
        return styles.rankDefault;
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner} />
          <p className={styles.loadingText}>Loading popular articles...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <div className={styles.errorIcon}>⚠️</div>
          <h2 className={styles.errorTitle}>Unable to Load Rankings</h2>
          <p className={styles.errorMessage}>{error}</p>
          <button
            type="button"
            onClick={loadPopularArticles}
            className={styles.retryButton}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyContainer}>
          <div className={styles.emptyIcon}>📊</div>
          <h2 className={styles.emptyTitle}>No Citations Yet</h2>
          <p className={styles.emptyMessage}>
            Articles will appear here when they receive citations.
          </p>
          <Link to="/add" className={styles.emptyButton}>
            ✍️ Write an Article
          </Link>
        </div>
      </div>
    );
  }

  const totalCitations = articles.reduce((sum, a) => sum + (a.citationCount || 0), 0);
  const mostCitedCount = articles[0]?.citationCount || 0;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          <span className={styles.titleIcon}>🔥</span>
          Most Cited Articles
        </h1>
        <p className={styles.subtitle}>
          Articles ranked by how many times they've been referenced
        </p>
        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statValue}>{articles.length}</span>
            <span className={styles.statLabel}>Articles ranked</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{totalCitations}</span>
            <span className={styles.statLabel}>Total citations</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{mostCitedCount}</span>
            <span className={styles.statLabel}>Top citations</span>
          </div>
        </div>
      </div>

      <div className={styles.rankingsList}>
        {articles.map((article, index) => (
          <div key={article.id} className={styles.rankingItem}>
            <div className={`${styles.rankNumber} ${getRankClass(index)}`}>
              {getRankIcon(index) || <span className={styles.rankText}>{index + 1}</span>}
            </div>
            <div className={styles.rankContent}>
              <ArticleCard
                article={article}
                compact={true}
                showAvatar={false}
              />
            </div>
            <div className={styles.citationCount}>
              <span className={styles.citationIcon}>📖</span>
              <span className={styles.citationNumber}>{article.citationCount || 0}</span>
              <span className={styles.citationLabel}>
                citation{article.citationCount !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.footer}>
        <Link to="/" className={styles.backLink}>
          ← Browse all articles
        </Link>
      </div>
    </div>
  );
};

export default PopularPage;