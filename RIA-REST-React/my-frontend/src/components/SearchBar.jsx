/**
 * Search Bar Component
 *
 * Provides search functionality for articles with:
 * - Debounced search (prevents excessive API calls)
 * - Keyboard shortcuts (Ctrl+K / Cmd+K to focus)
 * - Loading states with skeleton
 * - Recent searches (local storage)
 * - Clear button with animation
 * - Accessibility (ARIA labels, screen reader support)
 * - Search suggestions (prepared for future)
 *
 * @component
 * @param {Object} props - Component props
 * @param {Function} props.onSearch - Callback when search is performed
 * @param {Function} props.onClear - Callback when search is cleared
 * @param {boolean} props.isLoading - Whether search is in progress
 * @param {string} props.placeholder - Custom placeholder text
 * @param {number} props.debounceMs - Debounce delay in milliseconds
 * @param {boolean} props.saveRecent - Whether to save recent searches
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import styles from './SearchBar.module.css';

// ============================
// Constants
// ============================

const DEFAULT_DEBOUNCE_MS = 500;
const MIN_SEARCH_LENGTH = 2;
const MAX_RECENT_SEARCHES = 5;
const STORAGE_KEY = 'recent-searches';

// ============================
// Custom Hook: useDebounce
// ============================


const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};

// ============================
// Custom Hook: useKeyboardShortcut
// ============================
const useKeyboardShortcut = (key, callback, withCtrl = true) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isCtrlPressed = withCtrl ? (e.ctrlKey || e.metaKey) : true;
      const isKeyMatch = e.key.toLowerCase() === key.toLowerCase();

      if (isCtrlPressed && isKeyMatch) {
        e.preventDefault();
        callback();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [key, callback, withCtrl]);
};

// ============================
// Recent Searches Manager
// ============================

class RecentSearchesManager {
  static getRecentSearches() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  static addSearch(term) {
    if (!term || term.trim().length < MIN_SEARCH_LENGTH) return;

    try {
      const recent = this.getRecentSearches();
      const filtered = recent.filter(t => t !== term);
      const updated = [term, ...filtered].slice(0, MAX_RECENT_SEARCHES);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
    }
  }

  static clearRecentSearches() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
    }
  }
}

// ============================
// Main Component
// ============================

const SearchBar = ({
  onSearch,
  onClear,
  isLoading = false,
  placeholder = "Search articles by title or abstract...",
  debounceMs = DEFAULT_DEBOUNCE_MS,
  saveRecent = true,
  showShortcutHint = true,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showRecent, setShowRecent] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [isComposing, setIsComposing] = useState(false);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  const debouncedSearchTerm = useDebounce(searchTerm, debounceMs);

  useEffect(() => {
    if (saveRecent) {
      setRecentSearches(RecentSearchesManager.getRecentSearches());
    }
  }, [saveRecent]);

  useEffect(() => {
    if (!isComposing && debouncedSearchTerm.trim().length >= MIN_SEARCH_LENGTH) {
      performSearch(debouncedSearchTerm);
    } else if (debouncedSearchTerm.trim().length === 0) {
      handleClear();
    }
  }, [debouncedSearchTerm, isComposing]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowRecent(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useKeyboardShortcut('k', () => {
    inputRef.current?.focus();
  }, true);

  useKeyboardShortcut('escape', () => {
    if (searchTerm) {
      clearSearch();
    } else {
      inputRef.current?.blur();
      setShowRecent(false);
    }
  }, false);

  const performSearch = useCallback((term) => {
    const trimmedTerm = term.trim();
    if (trimmedTerm.length >= MIN_SEARCH_LENGTH) {
      onSearch(trimmedTerm);
      if (saveRecent) {
        RecentSearchesManager.addSearch(trimmedTerm);
        setRecentSearches(RecentSearchesManager.getRecentSearches());
      }
    }
  }, [onSearch, saveRecent]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim().length === 0) {
      handleClear();
    }
  };

  const handleClear = () => {
    setSearchTerm('');
    if (onClear) {
      onClear();
    } else if (onSearch) {
      onSearch('');
    }
  };

  const clearSearch = () => {
    handleClear();
    inputRef.current?.focus();
  };

  const handleRecentSearchClick = (term) => {
    setSearchTerm(term);
    performSearch(term);
    setShowRecent(false);
  };

  const handleClearRecentSearches = () => {
    RecentSearchesManager.clearRecentSearches();
    setRecentSearches([]);
    setShowRecent(false);
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (recentSearches.length > 0 && !searchTerm) {
      setShowRecent(true);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    setTimeout(() => setShowRecent(false), 200);
  };

  const handleCompositionStart = () => {
    setIsComposing(true);
  };

  const handleCompositionEnd = () => {
    setIsComposing(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim().length >= MIN_SEARCH_LENGTH) {
      performSearch(searchTerm);
      setShowRecent(false);
      inputRef.current?.blur();
    }
  };

  const hasSearchTerm = searchTerm.trim().length > 0;
  const showLoading = isLoading && hasSearchTerm;

  return (
    <div
      ref={containerRef}
      className={`${styles.searchContainer} ${isFocused ? styles.focused : ''}`}
      role="search"
      aria-label="Article search"
    >
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputWrapper}>
          {/* Search Icon */}
          <span className={styles.searchIcon} aria-hidden="true">
            {showLoading ? (
              <span className={styles.loadingSpinner} />
            ) : (
              '🔍'
            )}
          </span>

          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            placeholder={placeholder}
            className={styles.input}
            aria-label="Search articles"
            aria-describedby="search-hint"
            disabled={isLoading}
            autoComplete="off"
          />

          {hasSearchTerm && (
            <button
              type="button"
              onClick={clearSearch}
              className={styles.clearButton}
              aria-label="Clear search"
              title="Clear search (Esc)"
            >
              <span aria-hidden="true">✕</span>
            </button>
          )}

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isLoading || searchTerm.trim().length < MIN_SEARCH_LENGTH}
            aria-label="Submit search"
          >
            Search
          </button>
        </div>

        {showShortcutHint && !isFocused && !searchTerm && (
          <div className={styles.shortcutHint}>
            <kbd className={styles.kbd}>⌘</kbd>
            <span>+</span>
            <kbd className={styles.kbd}>K</kbd>
            <span className={styles.hintText}>to search</span>
          </div>
        )}

        <div id="search-hint" className={styles.hint}>
          {searchTerm.trim().length > 0 && searchTerm.trim().length < MIN_SEARCH_LENGTH && (
            <span className={styles.hintWarning}>
              Type at least {MIN_SEARCH_LENGTH} characters to search
            </span>
          )}
          {!searchTerm && (
            <span className={styles.hintInfo}>
              Search by title or abstract — title matches appear first
            </span>
          )}
        </div>
      </form>

      {showRecent && recentSearches.length > 0 && (
        <div className={styles.recentDropdown} role="listbox" aria-label="Recent searches">
          <div className={styles.recentHeader}>
            <span className={styles.recentTitle}>Recent searches</span>
            <button
              type="button"
              onClick={handleClearRecentSearches}
              className={styles.clearRecentButton}
              aria-label="Clear all recent searches"
            >
              Clear all
            </button>
          </div>
          <ul className={styles.recentList}>
            {recentSearches.map((term, index) => (
              <li key={`${term}-${index}`}>
                <button
                  type="button"
                  onClick={() => handleRecentSearchClick(term)}
                  className={styles.recentItem}
                  role="option"
                  aria-selected="false"
                >
                  <span className={styles.recentIcon} aria-hidden="true">🕐</span>
                  <span className={styles.recentTerm}>{term}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {showLoading && (
        <div className={styles.loadingOverlay} aria-hidden="true">
          <div className={styles.loadingBar}>
            <div className={styles.loadingBarFill} />
          </div>
        </div>
      )}
    </div>
  );
};

// ============================
// PropTypes
// ============================

SearchBar.propTypes = {
  onSearch: PropTypes.func.isRequired,
  onClear: PropTypes.func,
  isLoading: PropTypes.bool,
  placeholder: PropTypes.string,
  debounceMs: PropTypes.number,
  saveRecent: PropTypes.bool,
  showShortcutHint: PropTypes.bool,
};

SearchBar.defaultProps = {
  isLoading: false,
  placeholder: 'Search articles by title or abstract...',
  debounceMs: 500,
  saveRecent: true,
  showShortcutHint: true,
  onClear: null,
};

// ============================
// Export
// ============================

export default SearchBar;