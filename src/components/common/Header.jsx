import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useProgress } from '../../contexts/ProgressContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import ThemeToggle from './ThemeToggle';

const Header = () => {
  const { counters, streak } = useProgress();
  const { signOut } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 bg-tp-surface border-b-2 border-solid border-tp-border">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <h1 className="font-pixel text-lg md:text-xl">
              TaalPix
            </h1>
            
            {/* Streak */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-tp-warning-light border-2 border-solid border-tp-warning">
              <span>🔥</span>
              <span className="font-pixel text-xs text-tp-text">{streak} days</span>
            </div>
          </div>

          {/* Word Counters */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Mastered */}
            <div className="hidden xs:flex items-center gap-1 px-2 py-1 bg-tp-success-light border-2 border-solid border-tp-success">
              <span className="text-xs">✓</span>
              <span className="font-pixel text-xs text-tp-text">{counters.mastered}</span>
            </div>

            {/* Pending */}
            <div className="hidden xs:flex items-center gap-1 px-2 py-1 bg-tp-neutral-light border-2 border-solid border-tp-neutral">
              <span className="text-xs">⏳</span>
              <span className="font-pixel text-xs text-tp-text">{counters.pending}</span>
            </div>

            {/* Review - Clickable (always visible) */}
            <button
              onClick={() => navigate('/review')}
              className={`flex items-center gap-1 px-2 py-1 border-2 border-solid transition-colors ${
                counters.review > 0
                  ? 'bg-tp-error-light border-tp-error hover:bg-tp-error-light/80'
                  : 'bg-tp-surface2 border-tp-border hover:bg-tp-neutral-light'
              }`}
            >
              <span className="text-xs">📝</span>
              <span className="font-pixel text-xs text-tp-text">{counters.review}</span>
            </button>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Logout */}
            <button
              onClick={() => signOut()}
              className="font-pixel text-xs text-tp-text2 hover:text-tp-error transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Mobile Streak (visible only on small screens) */}
        <div className="sm:hidden mt-2 flex items-center justify-center gap-2 px-3 py-1 bg-tp-warning-light border-2 border-solid border-tp-warning w-fit mx-auto">
          <span>🔥</span>
          <span className="font-pixel text-xs text-tp-text">{streak} days</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
