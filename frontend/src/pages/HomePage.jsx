/**
 * Home Page Component
 *
 * Displays list of articles with search functionality.
 * Features:
 * - Shows articles sorted by publication date (newest first)
 * - Search with debouncing
 * - Title matches appear before abstract matches (backend handles this)
 * - Conditional "Add Article" button (only when authenticated)
 * - Loading states with skeleton
 * - Error handling with retry option
 * - Empty states for no articles or no search results
 *
 * @component
 */

import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllArticles, searchArticles } from '../services/articleApi';
import ArticleCard from '../components/ArticleCard';
import SearchBar from '../components/SearchBar';
import styles from './HomePage.module.css';

const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllArticles();
      setArticles(data);
    } catch (err) {
      setError('Failed to load articles. Please make sure the backend is running on port 8080.');
      console.error('[HomePage] Error loading articles:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = useCallback(async (term) => {
    setSearchTerm(term);
    setIsSearching(true);
    setError(null);

    try {
      if (!term || term.trim() === '') {
        const data = await getAllArticles();
        setArticles(data);
      } else {
        const data = await searchArticles(term);
        setArticles(data);
      }
    } catch (err) {
      setError('Search failed. Please try again.');
      console.error('[HomePage] Search error:', err);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleClearSearch = () => {
    setSearchTerm('');
    loadArticles();
  };

  const handleRetry = () => {
    if (searchTerm) {
      handleSearch(searchTerm);
    } else {
      loadArticles();
    }
  };

  const handleEdit = (article) => {
    navigate(`/edit/${article.id}`);
  };

  const isLoading = loading || isSearching;
  const hasNoArticles = !isLoading && articles.length === 0;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div>
            <h1 className={styles.title}>All Articles</h1>
            <p className={styles.subtitle}>
              Discover the latest research and insights from our community
            </p>
          </div>
          {isAuthenticated && (
            <Link to="/add" className={styles.addButton}>
              ✍️ Write New Article
            </Link>
          )}
        </div>
      </div>

      <SearchBar
        onSearch={handleSearch}
        onClear={handleClearSearch}
        isLoading={isLoading}
        debounceMs={500}
      />

      {error && (
        <div className={styles.errorContainer}>
          <div className={styles.errorIcon}>⚠️</div>
          <p className={styles.errorMessage}>{error}</p>
          <button
            type="button"
            onClick={handleRetry}
            className={styles.retryButton}
          >
            Try Again
          </button>
        </div>
      )}

      {isLoading && (
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner} />
          <p className={styles.loadingText}>
            {isSearching ? 'Searching articles...' : 'Loading articles...'}
          </p>
        </div>
      )}

      {hasNoArticles && !error && (
        <div className={styles.emptyContainer}>
          <div className={styles.emptyIcon}>📭</div>
          <h3 className={styles.emptyTitle}>
            {searchTerm ? 'No matching articles found' : 'No articles yet'}
          </h3>
          <p className={styles.emptyMessage}>
            {searchTerm
              ? `We couldn't find any articles matching "${searchTerm}". Try a different search term.`
              : 'Be the first to share your knowledge! Click "Add Article" to get started.'}
          </p>
          {!searchTerm && isAuthenticated && (
            <Link to="/add" className={styles.emptyButton}>
              ✍️ Add Your First Article
            </Link>
          )}
          {!searchTerm && !isAuthenticated && (
            <Link to="/login" className={styles.emptyButton}>
              🔑 Login to Write
            </Link>
          )}
        </div>
      )}

      {!isLoading && articles.length > 0 && (
        <div className={styles.resultsInfo}>
          <span className={styles.resultsCount}>
            {searchTerm
              ? `Found ${articles.length} result${articles.length !== 1 ? 's' : ''}`
              : `${articles.length} article${articles.length !== 1 ? 's' : ''}`}
          </span>
          {searchTerm && (
            <button
              type="button"
              onClick={handleClearSearch}
              className={styles.clearSearchLink}
            >
              Clear search
            </button>
          )}
        </div>
      )}

      <div className={styles.articlesList}>
        {articles.map((article, index) => (
          <div key={article.id} className={styles.articleItem}>
            <div className={styles.articleRank}>
              {!searchTerm && index === 0 && (
                <span className={styles.newestBadge}>Newest</span>
              )}
            </div>
            <ArticleCard
              article={article}
              animate={!loading}
              onEdit={handleEdit}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomePage;