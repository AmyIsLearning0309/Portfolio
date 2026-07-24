import { useState, useEffect, useRef } from 'react';
import '../../styles/table-of-contents.css';

/**
 * Fixed left-side table of contents with scroll tracking + back-to-top.
 * Props:
 *   sections — array of { id: string, label: string }
 *   projectTitle — string shown above the section links
 *   accent — optional CSS color for active/progress accents
 *   autoHideAfterId — optional section id; when this section (or later) is the
 *                     active in-view section, the TOC slides away (Siemens-style).
 *                     Leave unset to keep always-visible TOC (NASA).
 */
export default function TableOfContents({
  sections,
  projectTitle,
  accent,
  autoHideAfterId,
}) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? '');
  const [showTop, setShowTop] = useState(false);
  /** Once true, TOC stays tucked until the user clicks Show Content (no auto-reopen). */
  const [dismissed, setDismissed] = useState(false);
  /** User pinned the panel open via Show Content; cleared when crossing Scale again. */
  const [manualOpen, setManualOpen] = useState(false);
  const pastRef = useRef(false);
  const observerRef = useRef(null);

  const isCollapsed = Boolean(autoHideAfterId) && dismissed && !manualOpen;

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

  /* ── Auto-hide when the threshold section (or later) is in view ── */
  useEffect(() => {
    if (!autoHideAfterId) return;

    const thresholdIdx = sections.findIndex((s) => s.id === autoHideAfterId);
    if (thresholdIdx < 0) return;

    const activeIdx = sections.findIndex((s) => s.id === activeId);
    const atOrPast = activeIdx >= thresholdIdx;

    // Edge-trigger: tuck when Scale first becomes the active (in-view) section
    if (atOrPast && !pastRef.current) {
      setDismissed(true);
      setManualOpen(false);
    }
    pastRef.current = atOrPast;
  }, [autoHideAfterId, activeId, sections]);

  /* ── Sync layout offset when TOC is collapsed ── */
  useEffect(() => {
    if (!autoHideAfterId) return undefined;

    document.documentElement.classList.toggle('toc-is-hidden', isCollapsed);
    return () => {
      document.documentElement.classList.remove('toc-is-hidden');
    };
  }, [autoHideAfterId, isCollapsed]);

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

  const handleRevealToggle = () => {
    setManualOpen(isCollapsed);
  };

  const accentStyle = accent ? { '--toc-accent': accent } : undefined;

  const panel = (
    <>
      {projectTitle && (
        <p className="toc__project-title">{projectTitle}</p>
      )}

      <p className="toc__label">Content</p>
      <nav>
        <ol className="toc__list">
          {sections.map(({ id, label }) => (
            <li key={id} className="toc__item">
              <button
                className={`toc__link${activeId === id ? ' toc__link--active' : ''}`}
                onClick={() => handleClick(id)}
                tabIndex={isCollapsed ? -1 : undefined}
              >
                <span className="toc__indicator" aria-hidden="true" />
                {label}
              </button>
            </li>
          ))}
        </ol>
      </nav>

      <button
        className={`toc__back-top${showTop ? ' toc__back-top--visible' : ''}`}
        onClick={handleBackToTop}
        aria-label="Back to top"
        tabIndex={isCollapsed ? -1 : undefined}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path d="M6 10V2M2 6l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Back to top
      </button>
    </>
  );

  /* Always-visible TOC (NASA / default) */
  if (!autoHideAfterId) {
    return (
      <aside className="toc" aria-label="Page navigation" style={accentStyle}>
        {panel}
      </aside>
    );
  }

  /* Auto-hide TOC shell (Siemens) */
  return (
    <aside
      className={`toc-shell${isCollapsed ? ' toc-shell--collapsed' : ''}`}
      aria-label="Page navigation"
      style={accentStyle}
    >
      <div
        className="toc toc--in-shell"
        id="toc-panel"
        aria-hidden={isCollapsed}
      >
        {panel}
      </div>

      {/* Discreet show/hide control after the TOC has tucked away once */}
      {dismissed && (
        <button
          type="button"
          className={`toc__reveal${isCollapsed ? ' toc__reveal--collapsed' : ' toc__reveal--icon'}`}
          aria-expanded={!isCollapsed}
          aria-controls="toc-panel"
          aria-label={isCollapsed ? undefined : 'Hide content'}
          onClick={handleRevealToggle}
        >
          {isCollapsed ? (
            <>
              Show Content
              <span className="toc__reveal-chevron" aria-hidden="true">
                &gt;
              </span>
            </>
          ) : (
            <span className="toc__reveal-chevron" aria-hidden="true">
              &lt;
            </span>
          )}
        </button>
      )}
    </aside>
  );
}
