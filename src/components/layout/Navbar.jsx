import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import Logo from '../ui/Logo';
import '../../styles/navbar.css';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
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

  const isHome = location.pathname === '/';
  const isSiemens = location.pathname === '/work/siemens';
  const isRecO = location.pathname === '/work/rec-o';
  const isNasa = location.pathname === '/work/nasa-suit';

  return (
    <nav
      className={[
        'navbar',
        scrolled ? 'navbar--scrolled' : '',
        isHome ? 'navbar--home' : '',
        isSiemens ? 'navbar--siemens' : '',
        isRecO ? 'navbar--reco' : '',
        isNasa ? 'navbar--nasa' : '',
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
  );
}
