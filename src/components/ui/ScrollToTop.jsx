import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** Jump to the top instantly on every route change (no smooth scroll). */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    // Homepage scroll-snap can keep a mid-tunnel offset; clear it on leave
    document.documentElement.classList.remove('hx-scroll-snap');

    const jumpToTop = () => {
      const html = document.documentElement;
      const scrolling = document.scrollingElement || html;
      const prev = html.style.scrollBehavior;
      html.style.scrollBehavior = 'auto';

      window.scrollTo(0, 0);
      scrolling.scrollTop = 0;
      html.scrollTop = 0;
      document.body.scrollTop = 0;

      html.style.scrollBehavior = prev;
    };

    jumpToTop();
    const raf1 = requestAnimationFrame(() => {
      jumpToTop();
      requestAnimationFrame(jumpToTop);
    });
    const t0 = window.setTimeout(jumpToTop, 0);
    const t1 = window.setTimeout(jumpToTop, 50);
    const t2 = window.setTimeout(jumpToTop, 150);

    return () => {
      cancelAnimationFrame(raf1);
      window.clearTimeout(t0);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [pathname]);

  return null;
}
