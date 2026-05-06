import { useState, useEffect, useRef } from 'react';
import '../../styles/table-of-contents.css';

/**
 * Fixed left-side table of contents with scroll tracking + back-to-top.
 * Props:
 *   sections — array of { id: string, label: string }
 *   projectTitle — string shown above the section links
 */
export default function TableOfContents({ sections, projectTitle }) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? '');
  const [showTop, setShowTop] = useState(false);
  const observerRef = useRef(null);

  /* ── Scroll tracking via IntersectionObserver ── */
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    const handleIntersect = (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible.length > 0) setActiveId(visible[0].target.id);
    };

    observerRef.current = new IntersectionObserver(handleIntersect, {
      rootMargin: '-10% 0px -65% 0px',
      threshold: 0,
    });

    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observerRef.current.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, [sections]);

  /* ── Show back-to-top after 300px scroll ── */
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 300);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleClick = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const navbarHeight = parseInt(
      getComputedStyle(document.documentElement).getPropertyValue('--navbar-height') || '64',
      10
    );
    const top = el.getBoundingClientRect().top + window.scrollY - navbarHeight - 24;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <aside className="toc" aria-label="Page navigation">
      {/* Project title */}
      {projectTitle && (
        <p className="toc__project-title">{projectTitle}</p>
      )}

      {/* Section links */}
      <p className="toc__label">On this page</p>
      <nav>
        <ol className="toc__list">
          {sections.map(({ id, label }) => (
            <li key={id} className="toc__item">
              <button
                className={`toc__link${activeId === id ? ' toc__link--active' : ''}`}
                onClick={() => handleClick(id)}
              >
                <span className="toc__indicator" aria-hidden="true" />
                {label}
              </button>
            </li>
          ))}
        </ol>
      </nav>

      {/* Back to top — fades in after scrolling */}
      <button
        className={`toc__back-top${showTop ? ' toc__back-top--visible' : ''}`}
        onClick={handleBackToTop}
        aria-label="Back to top"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path d="M6 10V2M2 6l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Back to top
      </button>
    </aside>
  );
}
