/**
 * Footer Component
 *
 * Displays copyright information and author details
 *
 * @component
 */

import styles from './Footer.module.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.authorSection}>
            <div className={styles.avatarWrapper}>
                <img
                src="/mehdy-avatar.jpg"
                alt="Mehdy Mokhtari"
                className={styles.avatar}
                />
            </div>
            <div className={styles.authorInfo}>
              <p className={styles.authorName}>Mehdy Mokhtari</p>
              <p className={styles.authorTitle}>Software Engineer</p>
            </div>
          </div>
          <div className={styles.copyright}>
            <p>
              &copy; {currentYear} Article Platform. Built by{' '}
              <span className={styles.authorHighlight}>Mehdy Mokhtari</span>
            </p>
          </div>
          <div className={styles.socialLinks}>
            <a
              href="https://github.com/MahdyMokh7"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
              aria-label="GitHub"
            >
              <span aria-hidden="true">🐙</span>
            </a>
            <a
              href="https://linkedin.com/in/mehdymokhtari"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
              aria-label="LinkedIn"
            >
              <span aria-hidden="true">🔗</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;