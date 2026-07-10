import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { validateRegistration } from '../utils/validators';
import styles from './RegisterPage.module.css';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);

  const passwordStrength = useMemo(() => {
    const pwd = formData.password;
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 10) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) score++;
    return Math.min(score, 6);
  }, [formData.password]);

  const getPasswordStrengthLabel = (score) => {
    const labels = ['', 'Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
    return labels[score] || '';
  };

  const getPasswordStrengthColor = (score) => {
    const colors = ['', '#ef4444', '#ef4444', '#f59e0b', '#10b981', '#10b981', '#059669'];
    return colors[score] || '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Validate on blur
    const validationErrors = validateRegistration(formData);
    setErrors(prev => ({ ...prev, ...validationErrors }));
  };

  const validate = () => {
    const validationErrors = validateRegistration(formData);
    setErrors(validationErrors);
    // Mark all fields as touched
    const allTouched = Object.keys(formData).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allTouched);
    return Object.keys(validationErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const { confirmPassword, ...registerData } = formData;
      await register(registerData);
      toast.success('Account created successfully! Please login.');
      navigate('/login');
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(message);
      setErrors({ general: message });
    } finally {
      setLoading(false);
    }
  };

  const showError = (field) => {
    return errors[field] && touched[field];
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>Create Account</h1>
          <p className={styles.subtitle}>Join the Article Platform community</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {errors.general && (
            <div className={styles.generalError}>{errors.general}</div>
          )}

          <div className={styles.formGroup}>
            <label className={styles.label}>Username *</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`${styles.input} ${showError('username') ? styles.inputError : ''}`}
              placeholder="Choose a username (3-50 characters)"
              disabled={loading}
            />
            {showError('username') && <span className={styles.errorMessage}>{errors.username}</span>}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`${styles.input} ${showError('email') ? styles.inputError : ''}`}
              placeholder="your@email.com"
              disabled={loading}
            />
            {showError('email') && <span className={styles.errorMessage}>{errors.email}</span>}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Phone (Optional)</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`${styles.input} ${showError('phone') ? styles.inputError : ''}`}
              placeholder="+989123456789"
              disabled={loading}
            />
            {showError('phone') && <span className={styles.errorMessage}>{errors.phone}</span>}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Password *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`${styles.input} ${showError('password') ? styles.inputError : ''}`}
              placeholder="Create a strong password"
              disabled={loading}
            />
            {formData.password && (
              <div className={styles.passwordStrengthContainer}>
                <div className={styles.passwordStrengthBar}>
                  <div
                    className={styles.passwordStrengthFill}
                    style={{
                      width: `${(passwordStrength / 6) * 100}%`,
                      background: getPasswordStrengthColor(passwordStrength),
                    }}
                  />
                </div>
                <span className={styles.passwordStrengthLabel}>
                  {getPasswordStrengthLabel(passwordStrength)}
                </span>
              </div>
            )}
            {showError('password') && <span className={styles.errorMessage}>{errors.password}</span>}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Confirm Password *</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`${styles.input} ${showError('confirmPassword') ? styles.inputError : ''}`}
              placeholder="Confirm your password"
              disabled={loading}
            />
            {showError('confirmPassword') && <span className={styles.errorMessage}>{errors.confirmPassword}</span>}
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className={styles.footer}>
          <p className={styles.footerText}>
            Already have an account?{' '}
            <Link to="/login" className={styles.footerLink}>
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;