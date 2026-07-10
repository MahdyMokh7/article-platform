/**
 * Edit Article Page Component
 * 
 * Form for editing existing articles with:
 * - Pre-filled form with existing article data
 * - Real-time title uniqueness validation
 * - Character counters for abstract (max 500)
 * - Form validation with error messages
 * - Loading states during submission
 * - Success/error toast notifications
 * - Auto-redirect after successful update
 * - Permission error handling
 * 
 * @component
 */

import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { getArticleById, updateArticle, checkTitleAvailability } from '../services/articleApi';
import { isArticleAuthor } from '../utils/helpers';
import styles from './EditArticlePage.module.css';

const EditArticlePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    abstractText: '',
    body: '',
  });
  const [originalTitle, setOriginalTitle] = useState('');
  const [titleStatus, setTitleStatus] = useState({
    isChecking: false,
    isAvailable: null,
    message: '',
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [permissionError, setPermissionError] = useState(false);

  // Load article on mount
  useEffect(() => {
    loadArticle();
  }, [id]);

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please login to edit an article');
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const loadArticle = async () => {
    setLoading(true);
    setPermissionError(false);
    try {
      const article = await getArticleById(id);
      
      // Check if user is the author
      if (!isArticleAuthor(article, user)) {
        setPermissionError(true);
        toast.error("You don't have permission to edit this article");
        setTimeout(() => navigate(`/article/${id}`), 2000);
        return;
      }

      setFormData({
        title: article.title,
        abstractText: article.abstractText || '',
        body: article.body,
      });
      setOriginalTitle(article.title);
    } catch (error) {
      toast.error('Failed to load article for editing');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  // Debounced title validation
  const validateTitle = useCallback(async (title) => {
    if (!title.trim()) {
      setTitleStatus({ isChecking: false, isAvailable: null, message: '' });
      return;
    }

    if (title === originalTitle) {
      setTitleStatus({
        isChecking: false,
        isAvailable: true,
        message: 'Original title (unchanged)',
      });
      setErrors(prev => ({ ...prev, title: '' }));
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
    } catch {
      setTitleStatus({
        isChecking: false,
        isAvailable: null,
        message: 'Unable to validate title. Please try again.',
      });
    }
  }, [originalTitle]);

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

    setSubmitting(true);

    try {
      const submissionData = {
        title: formData.title.trim(),
        abstractText: formData.abstractText.trim(),
        body: formData.body.trim(),
      };

      const updatedArticle = await updateArticle(id, submissionData);
      toast.success(`✅ "${updatedArticle.title}" has been updated!`);
      navigate(`/article/${updatedArticle.id}`);
    } catch (err) {
      console.error('[EditArticlePage] Update error:', err);

      const status = err.response?.status;
      const message = err.response?.data?.message || err.message || 'Failed to update article.';

      if (status === 401) {
        toast.error('Please login to edit an article');
        navigate('/login');
      } else if (status === 403) {
        toast.error("You don't have permission to edit this article");
        navigate(`/article/${id}`);
      } else if (message?.includes('already exists') || status === 409) {
        setErrors(prev => ({ ...prev, title: 'Title already exists' }));
        setTitleStatus({ isChecking: false, isAvailable: false, message: 'Title already exists' });
        toast.error('An article with this title already exists');
      } else {
        toast.error(message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const abstractCharCount = formData.abstractText.length;
  const isAbstractOverLimit = abstractCharCount > 500;
  const isTitleInvalid = titleStatus.isAvailable === false && touched.title;

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.skeleton}>
          <div className={styles.skeletonTitle} />
          <div className={styles.skeletonField} />
          <div className={styles.skeletonField} />
          <div className={styles.skeletonField} />
        </div>
      </div>
    );
  }

  if (permissionError) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <div className={styles.errorIcon}>🔒</div>
          <h2 className={styles.errorTitle}>Permission Denied</h2>
          <p className={styles.errorMessage}>
            You don't have permission to edit this article.
          </p>
          <button
            onClick={() => navigate(`/article/${id}`)}
            className={styles.backButton}
          >
            ← Back to Article
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          <span className={styles.titleIcon}>✏️</span>
          Edit Article
        </h1>
        <p className={styles.subtitle}>
          Update your article content
        </p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label className={styles.label}>
            Title <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleTitleChange}
            onBlur={() => handleBlur('title')}
            className={`${styles.input} ${errors.title ? styles.inputError : ''} ${titleStatus.isAvailable === true && touched.title ? styles.inputValid : ''}`}
            placeholder="Enter a compelling title for your article"
            disabled={submitting}
            maxLength={200}
          />
          <div className={styles.fieldFooter}>
            {titleStatus.isChecking && (
              <span className={styles.checkingMessage}>Checking availability...</span>
            )}
            {titleStatus.isAvailable === true && touched.title && !errors.title && (
              <span className={styles.validMessage}>✓ Title available</span>
            )}
            {isTitleInvalid && (
              <span className={styles.errorMessage}>{titleStatus.message}</span>
            )}
            <span className={styles.charCount}>{formData.title.length}/200</span>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Abstract (Optional)</label>
          <textarea
            name="abstractText"
            value={formData.abstractText}
            onChange={handleInputChange}
            onBlur={() => handleBlur('abstractText')}
            className={`${styles.textarea} ${errors.abstractText ? styles.inputError : ''}`}
            rows={4}
            placeholder="A brief summary of your article (max 500 characters)"
            disabled={submitting}
            maxLength={500}
          />
          <div className={styles.fieldFooter}>
            <span className={`${styles.charCount} ${isAbstractOverLimit ? styles.charCountError : ''}`}>
              {abstractCharCount}/500 characters
            </span>
            {errors.abstractText && <span className={styles.errorMessage}>{errors.abstractText}</span>}
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>
            Full Text <span className={styles.required}>*</span>
          </label>
          <textarea
            name="body"
            value={formData.body}
            onChange={handleInputChange}
            onBlur={() => handleBlur('body')}
            className={`${styles.textarea} ${styles.bodyTextarea} ${errors.body ? styles.inputError : ''}`}
            rows={12}
            placeholder="Write your article content here..."
            disabled={submitting}
          />
          {errors.body && <span className={styles.errorMessage}>{errors.body}</span>}
        </div>

        <div className={styles.formActions}>
          <button
            type="button"
            onClick={() => navigate(`/article/${id}`)}
            className={styles.cancelButton}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={submitting || !formData.title.trim() || !formData.body.trim() || titleStatus.isAvailable === false}
          >
            {submitting ? (
              <>
                <span className={styles.spinner} />
                Updating...
              </>
            ) : (
              '💾 Update Article'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditArticlePage;