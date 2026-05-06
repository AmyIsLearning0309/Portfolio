import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { projects } from '../../data/projects.js';
import '../../styles/horizontal-work.css';

export default function HorizontalWork() {
  const tunnelRef = useRef(null);
  const stageRef = useRef(null);
  const heroCloneRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(-1); // -1 = not yet entered
  const [progress, setProgress] = useState(0); // 0–1 within tunnel

  useEffect(() => {
    const tunnel = tunnelRef.current;
    if (!tunnel) return;

    const onScroll = () => {
      const rect = tunnel.getBoundingClientRect();
      const tunnelHeight = tunnel.offsetHeight;
      const viewportH = window.innerHeight;

      // progress: 0 when tunnel top hits viewport top, 1 when tunnel bottom leaves
      const raw = -rect.top / (tunnelHeight - viewportH);
      const p = Math.max(0, Math.min(1, raw));
      setProgress(p);

      // Which card slot is active (0-indexed), -1 = before first
      // Divide progress into (projects.length + 1) slots:
      // slot 0 = intro/hero only, slots 1-N = each project card
      const totalSlots = projects.length;
      const cardIndex = Math.floor(p * totalSlots);
      setActiveIndex(Math.min(cardIndex, projects.length - 1));
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // run once on mount
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Per-card progress within its own slot (0–1), used for entrance animation
  const totalSlots = projects.length;
  const slotSize = 1 / totalSlots;
  const cardLocalProgress = (index) => {
    const slotStart = index * slotSize;
    const raw = (progress - slotStart) / slotSize;
    return Math.max(0, Math.min(1, raw));
  };

  return (
    /* ── Scroll tunnel — tall enough to give scroll room for all 4 cards ── */
    <section className="hw-tunnel" ref={tunnelRef} aria-label="Selected works">

      {/* ── Sticky stage — stays in view while user scrolls through tunnel ── */}
      <div className="hw-stage" ref={stageRef}>

        {/* LEFT HALF — hero summary, scales down as work enters */}
        <div
          className="hw-hero-panel"
          ref={heroCloneRef}
          style={{
            transform: `scale(${progress > 0 ? 0.88 : 1})`,
            opacity: progress > 0 ? 0.72 : 1,
          }}
        >
          <p className="hw-hero-panel__eyebrow">Selected Work</p>
          <h2 className="hw-hero-panel__heading">
            Things I've<br /><em>designed.</em>
          </h2>
          <p className="hw-hero-panel__sub">
            {activeIndex >= 0
              ? `${activeIndex + 1} / ${projects.length}`
              : `${projects.length} case studies`}
          </p>

          {/* Project nav dots */}
          <div className="hw-dots" aria-hidden="true">
            {projects.map((p, i) => (
              <span
                key={p.id}
                className={`hw-dot ${i === activeIndex ? 'hw-dot--active' : ''}`}
              />
            ))}
          </div>
        </div>

        {/* RIGHT HALF — project cards slide in one by one */}
        <div className="hw-cards-panel">
          {projects.map((project, i) => {
            const local = cardLocalProgress(i);
            const isActive = i === activeIndex;
            const isPast = i < activeIndex;

            return (
              <div
                key={project.id}
                className={`hw-card ${isActive ? 'hw-card--active' : ''} ${isPast ? 'hw-card--past' : ''}`}
                style={{
                  transform: `translateX(${(1 - local) * 60}px)`,
                  opacity: local,
                  pointerEvents: isActive ? 'all' : 'none',
                }}
                aria-hidden={!isActive}
              >
                {/* Image area */}
                <div
                  className="hw-card__image"
                  style={{ background: project.placeholderColor }}
                >
                  <div
                    className="hw-card__image-inner"
                    style={{ background: project.placeholderAccent, opacity: 0.15 }}
                  />
                  <span className="hw-card__image-label">{project.images[0]?.label}</span>
                </div>

                {/* Card body */}
                <div className="hw-card__body">
                  <div className="hw-card__meta">
                    <span className="hw-card__category">{project.category}</span>
                    <span className="hw-card__year">{project.year}</span>
                  </div>

                  <h3 className="hw-card__title">{project.title}</h3>
                  <p className="hw-card__subtitle">{project.subtitle}</p>

                  <div className="hw-card__tags">
                    {project.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="hw-card__tag">{tag}</span>
                    ))}
                  </div>

                  <Link to={`/work/${project.slug}`} className="hw-card__link">
                    View case study
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
