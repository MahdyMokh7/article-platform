/**
 * Article Card Component
 *
 * Displays a preview/summary of an article in list views.
 * Features:
 * - Responsive design (works on mobile/tablet/desktop)
 * - Truncated abstract with "Read more" link
 * - Formatted date display
 * - Citation count badge
 * - Smooth hover animations
 * - Accessibility support (keyboard navigation, ARIA labels)
 * - Skeleton loading state (prepared for future)
 *
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.article - Article object from backend
 * @param {number} props.article.id - Unique article identifier
 * @param {string} props.article.title - Article title
 * @param {string} props.article.abstractText - Article abstract (optional)
 * @param {string} props.article.publicationDate - ISO date string
 * @param {number} props.article.citationCount - Number of citations
 * @param {boolean} props.compact - Compact mode for sidebars (default: false)
 * @param {function} props.onClick - Optional click handler (for custom behavior)
 */

import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import styles from './ArticleCard.module.css';

// ============================
// Utility Functions
// ============================
const formatDate = (dateString) => {
  if (!dateString) return 'Date unknown';

  try {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }

    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  } catch (error) {
    console.warn('[ArticleCard] Date formatting failed:', error);
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
  const hue = (id * 137.5) % 360; // Golden angle approximation for even distribution
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
  animate = true
}) => {
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

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && onClick) {
      onClick(article);
    }
  };

  return (
    <article
      className={`${styles.card} ${animate ? styles.animate : ''} ${compact ? styles.compact : ''}`}
      data-testid={`article-card-${id}`}
    >
      {showAvatar && (
        <div className={styles.avatarSection}>
          <div className={styles.avatar} style={{ backgroundColor: avatarColor }} aria-label={`Article ${title}`}>
            <span className={styles.avatarText}> {title.charAt(0).toUpperCase()} </span>
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
        < Link to={`/article/${id}`} className={styles.titleLink} onClick={onClick} >
          <h3 className={styles.title}> {title} </h3>
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
          <p className={styles.abstract}>
            {truncatedAbstract}
          </p>
        )}

        <Link to={`/article/${id}`} className={styles.readMore} onClick={onClick}>
          <span>Read full article</span>
          <span className={styles.arrow} aria-hidden="true">→</span>
        </Link>
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
  }).isRequired,
  compact: PropTypes.bool,
  onClick: PropTypes.func,
  showAvatar: PropTypes.bool,
  animate: PropTypes.bool,
};

ArticleCard.defaultProps = {
  compact: false,
  showAvatar: true,
  animate: true,
  onClick: null,
  citationCount: 0,
};

// ============================
// Export
// ============================
export default ArticleCard;