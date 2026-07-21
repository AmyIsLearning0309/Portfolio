import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { projects } from '../../data/projects.js';
import '../../styles/horizontal-projects.css';

/**
 * Vertical scroll drives a horizontal project track (diana.lu-style).
 * Tall tunnel + sticky stage; progress maps to translateX.
 */
export default function HorizontalProjects() {
  const tunnelRef = useRef(null);
  const trackRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [maxShift, setMaxShift] = useState(0);
  const [tunnelHeight, setTunnelHeight] = useState('300vh');

  useEffect(() => {
    const measure = () => {
      const track = trackRef.current;
      if (!track) return;
      const overflow = Math.max(0, track.scrollWidth - window.innerWidth);
      setMaxShift(overflow);
      // Extra scroll room proportional to how far the track must travel
      const vh = Math.max(220, 100 + (overflow / Math.max(window.innerHeight, 1)) * 100 * 1.15);
      setTunnelHeight(`${vh}vh`);
    };

    measure();
    // Remeasure after fonts/images settle
    const t = window.setTimeout(measure, 200);
    window.addEventListener('resize', measure);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener('resize', measure);
    };
  }, []);

  useEffect(() => {
    const tunnel = tunnelRef.current;
    if (!tunnel) return;

    const onScroll = () => {
      const rect = tunnel.getBoundingClientRect();
      const range = tunnel.offsetHeight - window.innerHeight;
      if (range <= 0) {
        setProgress(0);
        return;
      }
      const raw = -rect.top / range;
      setProgress(Math.max(0, Math.min(1, raw)));
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [tunnelHeight]);

  const shift = progress * maxShift;

  return (
    <section
      className="hx"
      id="selected-works"
      ref={tunnelRef}
      style={{ height: tunnelHeight }}
      aria-label="Selected works"
    >
      <div className="hx__stage">
        <div
          className="hx__track"
          ref={trackRef}
          style={{ transform: `translate3d(${-shift}px, 0, 0)` }}
        >
          {projects.map((project) => (
            <Link
              key={project.id}
              to={`/work/${project.slug}`}
              className="hx__card"
              aria-label={`Open ${project.title} case study`}
            >
              <div
                className="hx__card-media"
                style={{ background: project.placeholderColor }}
              >
                {project.heroImage ? (
                  <img
                    src={project.heroImage}
                    alt=""
                    className="hx__card-img"
                  />
                ) : (
                  <div
                    className="hx__card-wash"
                    style={{ background: project.placeholderAccent }}
                  />
                )}
              </div>
              <div className="hx__card-body">
                <h3 className="hx__card-title">{project.title}</h3>
                <p className="hx__card-subtitle">{project.subtitle}</p>
                <p className="hx__card-meta">
                  {project.category}
                  {project.year ? ` · ${project.year}` : ''}
                </p>
              </div>
            </Link>
          ))}
        </div>

        <p className="hx__hint" aria-hidden="true">
          <span>Scroll</span>
          <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
            <path
              d="M3 8h10M9 4l4 4-4 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </p>
      </div>
    </section>
  );
}
