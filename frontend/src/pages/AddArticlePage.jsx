/**
 * Article Page Component
 *
 * Displays a single article with full content.
 * Features:
 * - Shows title, abstract, full body, publication date
 * - Displays citation count
 * - Shows referenced articles as clickable links (bonus)
 * - Conditional Edit/Delete buttons (based on authentication + ownership)
 * - Toast notifications for success/error/permission
 * - Loading skeleton
 * - Error handling for 404
 * - Back to home navigation
 *
 * @component
 */

import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getArticleById, deleteArticle } from '../services/articleApi';
import { isArticleAuthor } from '../utils/helpers';
import { toast } from 'react-toastify';
import styles from './ArticlePage.module.css';

const ArticlePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadArticle();
  }, [id]);

  const loadArticle = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getArticleById(id);
      setArticle(data);
    } catch (err) {
      if (err.message?.includes('404') || err.message?.includes('not found')) {
        setError('Article not found');
      } else {
        setError('Failed to load article. Please try again.');
      }
      console.error('[ArticlePage] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date unknown';
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    } catch {
      return 'Date unknown';
    }
  };

  const handleEdit = () => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      toast.error('Please login to edit this article');
      navigate('/login');
      return;
    }

    // Check if user is the author
    if (!isArticleAuthor(article, user)) {
      toast.error("You don't have permission to edit this article");
      return;
    }

    navigate(`/edit/${id}`);
  };

  const handleDelete = async () => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      toast.error('Please login to delete this article');
      navigate('/login');
      return;
    }

    // Check if user is the author
    if (!isArticleAuthor(article, user)) {
      toast.error("You don't have permission to delete this article");
      return;
    }

    if (!window.confirm('Are you sure you want to delete this article? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    try {
      await deleteArticle(id);
      toast.success('🗑️ Article deleted successfully!');
      navigate('/');
    } catch (error) {
      const status = error.response?.status;
      const message = error.response?.data?.message || 'Failed to delete article.';
      
      if (status === 401) {
        toast.error('Please login to delete this article');
      } else if (status === 403) {
        toast.error("You don't have permission to delete this article");
      } else {
        toast.error(message);
      }
      console.error('[ArticlePage] Delete error:', error);
    } finally {
      setDeleting(false);
    }
  };

  // Conditional: Show Edit/Delete only if user is authenticated AND is the author
  const canEdit = isAuthenticated && article && isArticleAuthor(article, user);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.skeleton}>
          <div className={styles.skeletonTitle} />
          <div className={styles.skeletonMeta} />
          <div className={styles.skeletonAbstract} />
          <div className={styles.skeletonBody} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <div className={styles.errorIcon}>📖</div>
          <h2 className={styles.errorTitle}>{error}</h2>
          <p className={styles.errorMessage}>
            The article you're looking for doesn't exist or has been removed.
          </p>
          <div className={styles.errorActions}>
            <Link to="/" className={styles.homeButton}>
              ← Back to Home
            </Link>
            <button onClick={() => navigate(-1)} className={styles.backButton}>
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return null;
  }

  return (
    <div className={styles.container}>
      <nav className={styles.breadcrumb}>
        <Link to="/" className={styles.breadcrumbLink}>Home</Link>
        <span className={styles.breadcrumbSeparator}>/</span>
        <span className={styles.breadcrumbCurrent}>{article.title}</span>
      </nav>

      <article className={styles.article}>
        <h1 className={styles.title}>{article.title}</h1>

        <div className={styles.meta}>
          <div className={styles.metaItem}>
            <span className={styles.metaIcon}>📅</span>
            <time dateTime={article.publicationDate}>
              {formatDate(article.publicationDate)}
            </time>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaIcon}>📖</span>
            <span>Cited by <strong>{article.citationCount || 0}</strong></span>
          </div>
        </div>

        {canEdit && (
          <div className={styles.articleActions}>
            <button
              onClick={handleEdit}
              className={styles.editButton}
              disabled={deleting}
            >
              ✏️ Edit Article
            </button>
            <button
              onClick={handleDelete}
              className={styles.deleteButton}
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : '🗑️ Delete Article'}
            </button>
          </div>
        )}

        {article.abstractText && (
          <div className={styles.abstractSection}>
            <h2 className={styles.sectionTitle}>Abstract</h2>
            <p className={styles.abstract}>{article.abstractText}</p>
          </div>
        )}

        <div className={styles.bodySection}>
          <h2 className={styles.sectionTitle}>Full Text</h2>
          <div className={styles.body}>{article.body}</div>
        </div>

        {article.references && article.references.length > 0 && (
          <div className={styles.referencesSection}>
            <h2 className={styles.sectionTitle}>
              📚 References ({article.references.length})
            </h2>
            <ul className={styles.referencesList}>
              {article.references.map((ref) => (
                <li key={ref.id} className={styles.referenceItem}>
                  <Link to={`/article/${ref.id}`} className={styles.referenceLink}>
                    <span className={styles.referenceBullet}>•</span>
                    {ref.title}
                  </Link>
                  {ref.citationCount > 0 && (
                    <span className={styles.referenceCitation}>
                      (cited by {ref.citationCount})
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </article>

      <div className={styles.actions}>
        <Link to="/" className={styles.backToHome}>
          ← Back to all articles
        </Link>
      </div>
    </div>
  );
};

export default ArticlePage;