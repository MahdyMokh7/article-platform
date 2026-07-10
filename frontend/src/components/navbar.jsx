/**
 * Navigation Bar Component
 *
 * Main navigation component for the Article Platform.
 * Features:
 * - Responsive mobile-first design with hamburger menu
 * - Active route highlighting
 * - Authentication-aware (shows login/register or profile/logout)
 * - User avatar with dropdown menu
 * - Smooth mobile menu animations
 * - Accessibility (keyboard navigation, ARIA labels, skip-to-content)
 * - Scroll behavior (hides on scroll down, shows on scroll up)
 * - User session indicator
 *
 * @component
 */

import { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Navbar.module.css';

// ============================
// Constants
// ============================

const NAV_ITEMS = [
  { path: '/', label: 'Home', icon: '🏠', ariaLabel: 'Navigate to home page' },
  { path: '/add', label: 'Write', icon: '✍️', ariaLabel: 'Add a new article', requiresAuth: true },
  { path: '/popular', label: 'Popular', icon: '🔥', ariaLabel: 'View most cited articles' },
];

// Scroll threshold for hiding navbar
const SCROLL_THRESHOLD = 100;

// ============================
// Custom Hook: useScrollDirection
// ============================

/**
 * Detects scroll direction to hide/show navbar
 * @returns {string} 'up' | 'down' | 'idle'
 */
const useScrollDirection = () => {
  const [scrollDirection, setScrollDirection] = useState('idle');
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      if (ticking.current) return;

      ticking.current = true;

      requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;

        if (currentScrollY < SCROLL_THRESHOLD) {
          setScrollDirection('idle');
        } else if (currentScrollY > lastScrollY.current + 10) {
          setScrollDirection('down');
        } else if (currentScrollY < lastScrollY.current - 10) {
          setScrollDirection('up');
        }

        lastScrollY.current = currentScrollY;
        ticking.current = false;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return scrollDirection;
};

// ============================
// Custom Hook: useMobileDetection
// ============================

/**
 * Detects if viewport is mobile size
 * @returns {boolean} True if mobile viewport
 */
const useMobileDetection = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile;
};

// ============================
// NavLink Component (Custom styled)
// ============================

/**
 * Custom navigation link with active state styling
 */
const NavItem = ({ item, onClick, isAuthenticated }) => {
  const location = useLocation();
  const isActive = location.pathname === item.path;

  // Hide items that require authentication if not authenticated
  if (item.requiresAuth && !isAuthenticated) {
    return null;
  }

  return (
    <NavLink
      to={item.path}
      className={({ isActive: active }) =>
        `${styles.navLink} ${active ? styles.active : ''}`
      }
      aria-label={item.ariaLabel}
      aria-current={isActive ? 'page' : undefined}
      onClick={onClick}
    >
      <span className={styles.navIcon} aria-hidden="true">
        {item.icon}
      </span>
      <span className={styles.navLabel}>{item.label}</span>
      {isActive && <span className={styles.activeIndicator} />}
    </NavLink>
  );
};

// ============================
// User Menu Component
// ============================

const UserMenu = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const getInitials = (username) => {
    return username?.charAt(0).toUpperCase() || 'U';
  };

  return (
    <div className={styles.userMenu} ref={menuRef}>
      <button
        ref={buttonRef}
        className={styles.userButton}
        onClick={toggleMenu}
        aria-label="User menu"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className={styles.userAvatar}>
          {getInitials(user?.username)}
        </span>
        <span className={styles.userName}>{user?.username}</span>
        <span className={`${styles.dropdownArrow} ${isOpen ? styles.dropdownArrowOpen : ''}`} />
      </button>

      {isOpen && (
        <div className={styles.dropdownMenu} role="menu">
          <div className={styles.dropdownHeader}>
            <span className={styles.dropdownUsername}>{user?.username}</span>
            <span className={styles.dropdownEmail}>{user?.email}</span>
          </div>
          <div className={styles.dropdownDivider} />
          <NavLink
            to="/profile"
            className={styles.dropdownItem}
            onClick={() => setIsOpen(false)}
            role="menuitem"
          >
            <span aria-hidden="true">👤</span> Profile
          </NavLink>
          <NavLink
            to="/add"
            className={styles.dropdownItem}
            onClick={() => setIsOpen(false)}
            role="menuitem"
          >
            <span aria-hidden="true">✍️</span> Write Article
          </NavLink>
          <div className={styles.dropdownDivider} />
          <button
            className={`${styles.dropdownItem} ${styles.dropdownLogout}`}
            onClick={() => {
              setIsOpen(false);
              onLogout();
            }}
            role="menuitem"
          >
            <span aria-hidden="true">🚪</span> Sign Out
          </button>
        </div>
      )}
    </div>
  );
};

// ============================
// Main Component
// ============================

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const scrollDirection = useScrollDirection();
  const isMobile = useMobileDetection();
  const menuButtonRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // Track scroll for background styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  const location = useLocation();
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Handle escape key to close mobile menu
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Determine navbar visibility class
  const getNavbarVisibilityClass = () => {
    if (!isMobile) return '';
    if (scrollDirection === 'down') return styles.hidden;
    if (scrollDirection === 'up') return styles.visible;
    return '';
  };

  // Filter nav items based on authentication
  const filteredNavItems = NAV_ITEMS.filter(item => {
    if (item.requiresAuth && !isAuthenticated) return false;
    return true;
  });

  return (
    <>
      {/* Skip to content link for accessibility */}
      <a href="#main-content" className={styles.skipLink}>
        Skip to main content
      </a>

      <header
        className={`${styles.navbar} ${isScrolled ? styles.scrolled : ''} ${getNavbarVisibilityClass()}`}
        role="banner"
      >
        <div className={styles.container}>
          {/* Logo / Brand */}
          <div className={styles.logoSection}>
            <NavLink
              to="/"
              className={styles.logo}
              aria-label="Article Platform Home"
            >
              <span className={styles.logoIcon} aria-hidden="true">📄</span>
              <span className={styles.logoText}>
                Article<span className={styles.logoHighlight}>Platform</span>
              </span>
            </NavLink>
          </div>

          {/* Desktop Navigation */}
          <nav
            className={styles.desktopNav}
            aria-label="Main navigation"
          >
            <ul className={styles.navList}>
              {filteredNavItems.map((item) => (
                <li key={item.path}>
                  <NavItem item={item} isAuthenticated={isAuthenticated} />
                </li>
              ))}
            </ul>
          </nav>

          {/* Right Section */}
          <div className={styles.rightSection}>
            {/* Authentication Section */}
            {isAuthenticated ? (
              <UserMenu user={user} onLogout={handleLogout} />
            ) : (
              <div className={styles.authButtons}>
                <NavLink to="/login" className={styles.loginLink}>
                  Log In
                </NavLink>
                <NavLink to="/register" className={styles.registerLink}>
                  Sign Up
                </NavLink>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              ref={menuButtonRef}
              className={`${styles.menuButton} ${isMobileMenuOpen ? styles.menuButtonOpen : ''}`}
              onClick={toggleMobileMenu}
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
            >
              <span className={styles.hamburger} aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div
            className={styles.mobileOverlay}
            onClick={closeMobileMenu}
            aria-hidden="true"
          />
        )}

        {/* Mobile Navigation Menu */}
        <div
          ref={mobileMenuRef}
          id="mobile-menu"
          className={`${styles.mobileNav} ${isMobileMenuOpen ? styles.mobileNavOpen : ''}`}
          role="dialog"
          aria-label="Mobile navigation menu"
          aria-modal="true"
        >
          <nav aria-label="Mobile navigation">
            <ul className={styles.mobileNavList}>
              {filteredNavItems.map((item, index) => (
                <li
                  key={item.path}
                  className={styles.mobileNavItem}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <NavItem item={item} onClick={closeMobileMenu} isAuthenticated={isAuthenticated} />
                </li>
              ))}
              
              {/* Mobile Auth Links */}
              {isAuthenticated ? (
                <>
                  <li className={styles.mobileNavItem}>
                    <NavLink
                      to="/profile"
                      className={styles.mobileNavLink}
                      onClick={closeMobileMenu}
                    >
                      <span aria-hidden="true">👤</span> Profile
                    </NavLink>
                  </li>
                  <li className={styles.mobileNavItem}>
                    <button
                      className={`${styles.mobileNavLink} ${styles.mobileLogoutButton}`}
                      onClick={() => {
                        closeMobileMenu();
                        handleLogout();
                      }}
                    >
                      <span aria-hidden="true">🚪</span> Sign Out
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li className={styles.mobileNavItem}>
                    <NavLink
                      to="/login"
                      className={styles.mobileNavLink}
                      onClick={closeMobileMenu}
                    >
                      Log In
                    </NavLink>
                  </li>
                  <li className={styles.mobileNavItem}>
                    <NavLink
                      to="/register"
                      className={`${styles.mobileNavLink} ${styles.mobileRegisterLink}`}
                      onClick={closeMobileMenu}
                    >
                      Sign Up
                    </NavLink>
                  </li>
                </>
              )}
            </ul>
          </nav>

          {/* Mobile Menu Footer */}
          <div className={styles.mobileFooter}>
            <p className={styles.mobileFooterText}>
              Article Platform — Share Knowledge
            </p>
          </div>
        </div>
      </header>

      {/* Spacer to prevent content jump when navbar is fixed */}
      <div className={styles.navbarSpacer} />
    </>
  );
};

// ============================
// Export
// ============================

export default Navbar;