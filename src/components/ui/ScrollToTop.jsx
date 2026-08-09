import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

function jumpToTop() {
  const html = document.documentElement;
  const body = document.body;
  const scrolling = document.scrollingElement || html;
  const prevHtml = html.style.scrollBehavior;
  const prevBody = body.style.scrollBehavior;

  html.style.scrollBehavior = 'auto';
  body.style.scrollBehavior = 'auto';

  window.scrollTo(0, 0);
  if (typeof window.scroll === 'function') window.scroll(0, 0);
  scrolling.scrollTop = 0;
  html.scrollTop = 0;
  body.scrollTop = 0;

  html.style.scrollBehavior = prevHtml;
  body.style.scrollBehavior = prevBody;
}

/** Jump to the top instantly on every route change (no smooth scroll). */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    // Homepage scroll-snap can keep a mid-tunnel offset; clear it on leave
    document.documentElement.classList.remove('hx-scroll-snap');
    document.documentElement.classList.remove('sd-howto-scroll-snap');

    jumpToTop();

    const timers = [0, 16, 50, 100, 200, 400, 800].map((ms) =>
      window.setTimeout(jumpToTop, ms)
    );

    let raf1 = 0;
    let raf2 = 0;
    raf1 = requestAnimationFrame(() => {
      jumpToTop();
      raf2 = requestAnimationFrame(jumpToTop);
    });

    // Catch late layout shifts (fonts / images) that reintroduce offset
    const onLoad = () => jumpToTop();
    window.addEventListener('load', onLoad, { once: true });

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      timers.forEach((id) => window.clearTimeout(id));
      window.removeEventListener('load', onLoad);
    };
  }, [pathname]);

  return null;
}
