import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** Jump to the top instantly on every route change (no smooth scroll). */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    const html = document.documentElement;
    const prev = html.style.scrollBehavior;
    html.style.scrollBehavior = 'auto';

    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    html.scrollTop = 0;
    document.body.scrollTop = 0;

    html.style.scrollBehavior = prev;
  }, [pathname]);

  return null;
}
