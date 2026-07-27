import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import Logo from '../ui/Logo';
import '../../styles/navbar.css';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 60);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [location.pathname]);

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const isHome = location.pathname === '/';
  const isSiemens = location.pathname === '/work/siemens';
  const isRecO = location.pathname === '/work/rec-o';

  return (
    <>
      <nav
        className={[
          'navbar',
          scrolled ? 'navbar--scrolled' : '',
          isHome ? 'navbar--home' : '',
          isSiemens ? 'navbar--siemens' : '',
          isRecO ? 'navbar--reco' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <div className="navbar__inner">
          <Link to="/" className="navbar__brand" aria-label="Amy Ai — Home">
            <Logo className="navbar__logo" />
          </Link>

          <ul className="navbar__links">
            {!isHome && (
              <li>
                <NavLink
                  to="/"
                  end
                  className={({ isActive }) =>
                    `navbar__link${isActive ? ' navbar__link--active' : ''}`
                  }
                >
                  Works
                </NavLink>
              </li>
            )}
            <li>
              <NavLink
                to="/about"
                className={({ isActive }) =>
                  `navbar__link${isActive ? ' navbar__link--active' : ''}`
                }
              >
                About Me
              </NavLink>
            </li>
          </ul>

          <button
            className={`navbar__hamburger ${menuOpen ? 'is-open' : ''}`}
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            <span />
            <span />
            <span />
          </button>
        </div>

        {!isHome && (
          <div
            className="navbar__progress"
            role="progressbar"
            aria-label="Reading progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress * 100)}
          >
            <div
              className="navbar__progress-bar"
              style={{ transform: `scaleX(${progress})` }}
            />
          </div>
        )}
      </nav>

      {/* Mobile overlay menu */}
      <div className={`navbar__mobile-menu ${menuOpen ? 'is-open' : ''}`}>
        {!isHome && (
          <Link to="/" className="navbar__mobile-link">Works</Link>
        )}
        <Link to="/about" className="navbar__mobile-link">About Me</Link>
      </div>
    </>
  );
}
