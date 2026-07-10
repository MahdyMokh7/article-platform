import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { validateProfile, validatePasswordChange } from '../utils/validators';
import styles from './ProfilePage.module.css';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, updateProfile, changePassword, logout } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [profileForm, setProfileForm] = useState({
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleProfileBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const validationErrors = validateProfile(profileForm);
    setErrors(prev => ({ ...prev, ...validationErrors }));
  };

  const handlePasswordBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const validationErrors = validatePasswordChange(passwordForm);
    setErrors(prev => ({ ...prev, ...validationErrors }));
  };

  const validateProfileForm = () => {
    const validationErrors = validateProfile(profileForm);
    setErrors(validationErrors);
    setTouched({ email: true, phone: true });
    return Object.keys(validationErrors).length === 0;
  };

  const validatePasswordForm = () => {
    const validationErrors = validatePasswordChange(passwordForm);
    setErrors(validationErrors);
    setTouched({ currentPassword: true, newPassword: true, confirmPassword: true });
    return Object.keys(validationErrors).length === 0;
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!validateProfileForm()) return;

    setLoading(true);
    try {
      await updateProfile(profileForm);
      toast.success('Profile updated successfully!');
      setIsEditing(false);
      setTouched({});
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!validatePasswordForm()) return;

    setLoading(true);
    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success('Password changed successfully!');
      setIsChangingPassword(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTouched({});
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const showError = (field) => {
    return errors[field] && touched[field];
  };

  if (!user) {
    return <div className={styles.container}>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.avatar}>
            <span className={styles.avatarText}>
              {user.username?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <h1 className={styles.title}>{user.username}</h1>
          <p className={styles.subtitle}>Member since {new Date(user.createdAt).toLocaleDateString()}</p>
        </div>

        {/* Profile Information */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Profile Information</h2>
            <button
              onClick={() => {
                setIsEditing(!isEditing);
                setTouched({});
                setErrors({});
              }}
              className={styles.editButton}
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          {isEditing ? (
            <form onSubmit={handleProfileSubmit} className={styles.editForm}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Email</label>
                <input
                  type="email"
                  name="email"
                  value={profileForm.email}
                  onChange={handleProfileChange}
                  onBlur={handleProfileBlur}
                  className={`${styles.input} ${showError('email') ? styles.inputError : ''}`}
                  disabled={loading}
                />
                {showError('email') && <span className={styles.errorMessage}>{errors.email}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={profileForm.phone}
                  onChange={handleProfileChange}
                  onBlur={handleProfileBlur}
                  className={`${styles.input} ${showError('phone') ? styles.inputError : ''}`}
                  disabled={loading}
                  placeholder="+989123456789"
                />
                {showError('phone') && <span className={styles.errorMessage}>{errors.phone}</span>}
              </div>

              <button type="submit" className={styles.saveButton} disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          ) : (
            <div className={styles.profileInfo}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Email</span>
                <span className={styles.infoValue}>{user.email}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Phone</span>
                <span className={styles.infoValue}>{user.phone || 'Not provided'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Password Change */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Change Password</h2>
            <button
              onClick={() => {
                setIsChangingPassword(!isChangingPassword);
                setTouched({});
                setErrors({});
              }}
              className={styles.editButton}
            >
              {isChangingPassword ? 'Cancel' : 'Change Password'}
            </button>
          </div>

          {isChangingPassword && (
            <form onSubmit={handlePasswordSubmit} className={styles.editForm}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  onBlur={handlePasswordBlur}
                  className={`${styles.input} ${showError('currentPassword') ? styles.inputError : ''}`}
                  disabled={loading}
                />
                {showError('currentPassword') && <span className={styles.errorMessage}>{errors.currentPassword}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  onBlur={handlePasswordBlur}
                  className={`${styles.input} ${showError('newPassword') ? styles.inputError : ''}`}
                  disabled={loading}
                />
                {showError('newPassword') && <span className={styles.errorMessage}>{errors.newPassword}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  onBlur={handlePasswordBlur}
                  className={`${styles.input} ${showError('confirmPassword') ? styles.inputError : ''}`}
                  disabled={loading}
                />
                {showError('confirmPassword') && <span className={styles.errorMessage}>{errors.confirmPassword}</span>}
              </div>

              <button type="submit" className={styles.saveButton} disabled={loading}>
                {loading ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          )}
        </div>

        {/* Published Articles */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Published Articles</h2>
          </div>

          {user.articles && user.articles.length > 0 ? (
            <ul className={styles.articleList}>
              {user.articles.map((article) => (
                <li key={article.id} className={styles.articleItem}>
                  <Link to={`/article/${article.id}`} className={styles.articleLink}>
                    <span className={styles.articleTitle}>{article.title}</span>
                    <span className={styles.articleMeta}>
                      {new Date(article.publicationDate).toLocaleDateString()}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.emptyMessage}>
              You haven't published any articles yet.
              <Link to="/add" className={styles.writeLink}>Write your first article</Link>
            </p>
          )}
        </div>

        {/* Logout */}
        <button onClick={handleLogout} className={styles.logoutButton}>
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;