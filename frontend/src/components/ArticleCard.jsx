/**
 * Article Card Component
 *
 * Displays a preview/summary of an article in list views.
 * Features:
 * - Responsive design (works on mobile/tablet/desktop)
 * - Truncated abstract with "Read more" link
 * - Formatted date display
 * - Citation count badge
 * - Conditional Edit/Delete buttons (based on authentication + ownership)
 * - Smooth hover animations
 * - Accessibility support
 *
 * @component
 */

import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuth } from '../context/AuthContext';
import { isArticleAuthor } from '../utils/helpers';
import styles from './ArticleCard.module.css';

// ============================
// Utility Functions
// ============================
const formatDate = (dateString) => {
  if (!dateString) return 'Date unknown';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  } catch {
    return 'Date unknown';
  }
};

const truncateText = (text, maxLength = 150) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  const truncated = text.substring(0, maxLength);
  const lastSpaceIndex = truncated.lastIndexOf(' ');
  if (lastSpaceIndex > 0) {
    return truncated.substring(0, lastSpaceIndex) + '...';
  }
  return truncated + '...';
};

const getArticleAvatarColor = (id) => {
  const hue = (id * 137.5) % 360;
  return `hsl(${hue}, 70%, 55%)`;
};

// ============================
// Main Component
// ============================
const ArticleCard = ({
  article,
  compact = false,
  onClick,
  showAvatar = true,
  animate = true,
  onEdit,
  onDelete,
}) => {
  const { user, isAuthenticated } = useAuth();

  if (!article || !article.id) {
    console.warn('[ArticleCard] Missing article data');
    return null;
  }

  const {
    id,
    title,
    abstractText,
    publicationDate,
    citationCount = 0,
  } = article;

  const formattedDate = formatDate(publicationDate);
  const truncatedAbstract = truncateText(abstractText, compact ? 80 : 150);
  const hasAbstract = abstractText && abstractText.trim().length > 0;
  const avatarColor = getArticleAvatarColor(id);

  // Conditional rendering: Show Edit/Delete only if user is authenticated AND is the author
  const canEdit = isAuthenticated && isArticleAuthor(article, user);

  const handleEdit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onEdit) onEdit(article);
  };

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) onDelete(article);
  };

  return (
    <article
      className={`${styles.card} ${animate ? styles.animate : ''} ${compact ? styles.compact : ''}`}
      data-testid={`article-card-${id}`}
    >
      {showAvatar && (
        <div className={styles.avatarSection}>
          <div className={styles.avatar} style={{ backgroundColor: avatarColor }} aria-label={`Article ${title}`}>
            <span className={styles.avatarText}>{title.charAt(0).toUpperCase()}</span>
          </div>
          {citationCount > 0 && (
            <div className={styles.citationBadge} title={`Cited ${citationCount} times`}>
              <span className={styles.citationIcon}>📖</span>
              <span className={styles.citationCount}>{citationCount}</span>
            </div>
          )}
        </div>
      )}

      <div className={styles.content}>
        <Link to={`/article/${id}`} className={styles.titleLink} onClick={onClick}>
          <h3 className={styles.title}>{title}</h3>
        </Link>

        <div className={styles.meta}>
          <time dateTime={publicationDate} className={styles.date}>
            <span className={styles.metaIcon}>📅</span>
            {formattedDate}
          </time>

          {!showAvatar && citationCount > 0 && (
            <span className={styles.citationInline}>
              <span className={styles.metaIcon}>📖</span>
              Cited by {citationCount}
            </span>
          )}
        </div>

        {hasAbstract && (
          <p className={styles.abstract}>{truncatedAbstract}</p>
        )}

        <div className={styles.cardActions}>
          <Link to={`/article/${id}`} className={styles.readMore} onClick={onClick}>
            <span>Read full article</span>
            <span className={styles.arrow} aria-hidden="true">→</span>
          </Link>

          {/* Conditional Edit/Delete buttons */}
          {canEdit && (
            <div className={styles.actionButtons}>
              <button
                onClick={handleEdit}
                className={`${styles.actionButton} ${styles.editButton}`}
                aria-label="Edit article"
                title="Edit article"
              >
                ✏️ Edit
              </button>
              <button
                onClick={handleDelete}
                className={`${styles.actionButton} ${styles.deleteButton}`}
                aria-label="Delete article"
                title="Delete article"
              >
                🗑️ Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

// ============================
// PropTypes
// ============================
ArticleCard.propTypes = {
  article: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    title: PropTypes.string.isRequired,
    abstractText: PropTypes.string,
    publicationDate: PropTypes.string.isRequired,
    citationCount: PropTypes.number,
    authorId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    author: PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    }),
  }).isRequired,
  compact: PropTypes.bool,
  onClick: PropTypes.func,
  showAvatar: PropTypes.bool,
  animate: PropTypes.bool,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
};

ArticleCard.defaultProps = {
  compact: false,
  showAvatar: true,
  animate: true,
  onClick: null,
  onEdit: null,
  onDelete: null,
};

// ============================
// Export
// ============================
export default ArticleCard;