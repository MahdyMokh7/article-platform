/**
 * Add Article Page Component
 *
 * Form for creating new articles with:
 * - Real-time title uniqueness validation
 * - Character counters for abstract (max 500)
 * - Reference selection from existing articles (bonus)
 * - Form validation with error messages
 * - Loading states during submission
 * - Success/error toast notifications
 * - Auto-redirect after successful creation
 *
 * @component
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { createArticle, checkTitleAvailability, getAllArticles } from '../services/articleApi';
import styles from './AddArticlePage.module.css';

const AddArticlePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [availableArticles, setAvailableArticles] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    abstractText: '',
    body: '',
    referenceIds: [],
  });

  const [titleStatus, setTitleStatus] = useState({
    isChecking: false,
    isAvailable: null,
    message: '',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Check authentication on mount
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please login to create an article');
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Load available articles for reference selection
  useEffect(() => {
    loadAvailableArticles();
  }, []);

  const loadAvailableArticles = async () => {
    try {
      const articles = await getAllArticles();
      setAvailableArticles(articles);
    } catch (err) {
      console.error('[AddArticlePage] Failed to load articles for references:', err);
    }
  };

  // Debounced title validation
  const validateTitle = useCallback(async (title) => {
    if (!title.trim()) {
      setTitleStatus({ isChecking: false, isAvailable: null, message: '' });
      return;
    }

    setTitleStatus(prev => ({ ...prev, isChecking: true, message: '' }));

    try {
      const isAvailable = await checkTitleAvailability(title);
      setTitleStatus({
        isChecking: false,
        isAvailable,
        message: isAvailable ? 'Title is available ✓' : 'This title already exists. Please use a unique title.',
      });

      if (!isAvailable) {
        setErrors(prev => ({ ...prev, title: 'Title already exists' }));
      } else {
        setErrors(prev => ({ ...prev, title: '' }));
      }
    } catch (err) {
      setTitleStatus({
        isChecking: false,
        isAvailable: null,
        message: 'Unable to validate title. Please try again.',
      });
    }
  }, []);

  // Debounce timer for title validation
  let titleTimeout;

  const handleTitleChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, title: value }));

    if (touched.title) {
      clearTimeout(titleTimeout);
      titleTimeout = setTimeout(() => validateTitle(value), 500);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));

    if (field === 'title' && formData.title) {
      validateTitle(formData.title);
    }
  };

  const handleReferenceToggle = (articleId) => {
    setFormData(prev => {
      const currentIds = prev.referenceIds;
      if (currentIds.includes(articleId)) {
        return { ...prev, referenceIds: currentIds.filter(id => id !== articleId) };
      } else {
        return { ...prev, referenceIds: [...currentIds, articleId] };
      }
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (titleStatus.isAvailable === false) {
      newErrors.title = 'Title must be unique';
    }

    if (!formData.body.trim()) {
      newErrors.body = 'Body is required';
    }

    if (formData.abstractText.length > 500) {
      newErrors.abstractText = 'Abstract cannot exceed 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setTouched({ title: true, body: true, abstractText: true });

    if (!validateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    setLoading(true);

    try {
      const submissionData = {
        title: formData.title.trim(),
        abstractText: formData.abstractText.trim(),
        body: formData.body.trim(),
        referenceIds: formData.referenceIds,
      };

      const createdArticle = await createArticle(submissionData);
      toast.success(`🎉 "${createdArticle.title}" has been published!`);
      navigate(`/article/${createdArticle.id}`);
    } catch (err) {
      console.error('[AddArticlePage] Create error:', err);

      const status = err.response?.status;
      const message = err.response?.data?.message || err.message || 'Failed to create article.';

      if (status === 401) {
        toast.error('Please login to create an article');
        navigate('/login');
      } else if (message?.includes('already exists') || status === 409) {
        setErrors(prev => ({ ...prev, title: 'Title already exists' }));
        setTitleStatus({ isChecking: false, isAvailable: false, message: 'Title already exists' });
        toast.error('An article with this title already exists');
      } else {
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const abstractCharCount = formData.abstractText.length;
  const isAbstractOverLimit = abstractCharCount > 500;
  const isTitleInvalid = titleStatus.isAvailable === false && touched.title;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          <span className={styles.titleIcon}>✍️</span>
          Write New Article
        </h1>
        <p className={styles.subtitle}>
          Share your knowledge with the world. All articles are reviewed for quality.
        </p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Title Field */}
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="title">
            Title <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleTitleChange}
            onBlur={() => handleBlur('title')}
            className={`${styles.input} ${errors.title ? styles.inputError : ''} ${titleStatus.isAvailable === true && touched.title ? styles.inputValid : ''}`}
            placeholder="Enter a compelling title for your article"
            disabled={loading}
            maxLength={200}
          />
          <div className={styles.fieldFooter}>
            <div>
              {titleStatus.isChecking && (
                <span className={styles.checkingMessage}>Checking availability...</span>
              )}
              {titleStatus.isAvailable === true && touched.title && !errors.title && (
                <span className={styles.validMessage}>✓ Title available</span>
              )}
              {isTitleInvalid && (
                <span className={styles.errorMessage}>{titleStatus.message}</span>
              )}
            </div>
            <span className={styles.charCount}>{formData.title.length}/200</span>
          </div>
        </div>

        {/* Abstract Field */}
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="abstractText">
            Abstract (Optional)
          </label>
          <textarea
            id="abstractText"
            name="abstractText"
            value={formData.abstractText}
            onChange={handleInputChange}
            onBlur={() => handleBlur('abstractText')}
            className={`${styles.textarea} ${errors.abstractText ? styles.inputError : ''}`}
            rows={4}
            placeholder="A brief summary of your article (max 500 characters)"
            disabled={loading}
            maxLength={500}
          />
          <div className={styles.fieldFooter}>
            <span className={`${styles.charCount} ${isAbstractOverLimit ? styles.charCountError : ''}`}>
              {abstractCharCount}/500 characters
            </span>
            {errors.abstractText && <span className={styles.errorMessage}>{errors.abstractText}</span>}
          </div>
        </div>

        {/* Body Field */}
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="body">
            Full Text <span className={styles.required}>*</span>
          </label>
          <textarea
            id="body"
            name="body"
            value={formData.body}
            onChange={handleInputChange}
            onBlur={() => handleBlur('body')}
            className={`${styles.textarea} ${styles.bodyTextarea} ${errors.body ? styles.inputError : ''}`}
            rows={12}
            placeholder="Write your article content here... Use markdown or plain text."
            disabled={loading}
          />
          {errors.body && <span className={styles.errorMessage}>{errors.body}</span>}
        </div>

        {/* References Section (Bonus) */}
        {availableArticles.length > 0 && (
          <div className={styles.formGroup}>
            <label className={styles.label}>
              📚 References <span className={styles.bonusBadge}>Bonus Feature</span>
            </label>
            <p className={styles.hint}>
              Select articles that this article cites. Cited articles will appear in your article's reference list.
            </p>

            {availableArticles.length > 5 && (
              <div className={styles.referenceControls}>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, referenceIds: availableArticles.map(a => a.id) }))}
                  className={styles.referenceSelectAll}
                  disabled={loading}
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, referenceIds: [] }))}
                  className={styles.referenceClearAll}
                  disabled={loading}
                >
                  Clear All
                </button>
              </div>
            )}

            <div className={styles.referenceList}>
              {availableArticles
                .filter(a => a.id !== undefined)
                .map(article => (
                  <label key={article.id} className={styles.referenceItem}>
                    <input
                      type="checkbox"
                      checked={formData.referenceIds.includes(article.id)}
                      onChange={() => handleReferenceToggle(article.id)}
                      disabled={loading}
                      className={styles.referenceCheckbox}
                    />
                    <div className={styles.referenceContent}>
                      <span className={styles.referenceTitle}>{article.title}</span>
                      <span className={styles.referenceMeta}>
                        {article.citationCount > 0 && (
                          <span className={styles.referenceCitations}>📖 {article.citationCount}</span>
                        )}
                      </span>
                    </div>
                  </label>
                ))}
            </div>

            {formData.referenceIds.length > 0 && (
              <div className={styles.selectedCount}>
                Selected {formData.referenceIds.length} reference{formData.referenceIds.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        )}

        {/* Form Actions */}
        <div className={styles.formActions}>
          <button
            type="button"
            onClick={() => navigate('/')}
            className={styles.cancelButton}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading || !formData.title.trim() || !formData.body.trim() || titleStatus.isAvailable === false}
          >
            {loading ? (
              <>
                <span className={styles.spinner} />
                Publishing...
              </>
            ) : (
              '📝 Publish Article'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddArticlePage;