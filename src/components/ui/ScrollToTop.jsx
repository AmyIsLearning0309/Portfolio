import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** Jump to the top instantly on every route change (no smooth scroll). */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    // Keep the browser from re-applying a remembered scroll position
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    const jumpToTop = () => {
      const html = document.documentElement;
      const prev = html.style.scrollBehavior;
      html.style.scrollBehavior = 'auto';

      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      html.scrollTop = 0;
      document.body.scrollTop = 0;

      html.style.scrollBehavior = prev;
    };

    // Before paint, then again next frame in case late layout
    // (scroll-snap classes, media sizing) shifts the position back
    jumpToTop();
    const raf = requestAnimationFrame(jumpToTop);
    return () => cancelAnimationFrame(raf);
  }, [pathname]);

  return null;
}
