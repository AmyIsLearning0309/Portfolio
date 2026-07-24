import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { projects } from '../../data/projects.js';
import '../../styles/horizontal-projects.css';

/**
 * Diana.lu–style stage:
 * Vertical scroll drives one continuous horizontal track.
 * Panel 0 = homepage intro; panels 1..N = projects.
 */
export default function HorizontalProjects() {
  const tunnelRef = useRef(null);
  const trackRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [maxShift, setMaxShift] = useState(0);
  const [tunnelHeight, setTunnelHeight] = useState('400vh');

  useEffect(() => {
    const measure = () => {
      const track = trackRef.current;
      if (!track) return;
      const overflow = Math.max(0, track.scrollWidth - window.innerWidth);
      setMaxShift(overflow);
      // Scroll distance roughly matches horizontal travel (1px scroll ≈ 1px shift feel)
      const vh = Math.max(
        280,
        100 + (overflow / Math.max(window.innerHeight, 1)) * 100 * 1.2
      );
      setTunnelHeight(`${vh}vh`);
    };

    measure();
    const t = window.setTimeout(measure, 250);
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
      aria-label="Introduction and selected works"
    >
      <div className="hx__stage">
        <div
          className="hx__track"
          ref={trackRef}
          style={{ transform: `translate3d(${-shift}px, 0, 0)` }}
        >
          {/* ── Intro — counter-translates so it stays pinned like the navbar ── */}
          <article
            className="hx__intro"
            aria-label="Introduction"
            style={
              shift > 0
                ? { transform: `translate3d(${shift}px, 0, 0)` }
                : undefined
            }
          >
            <div className="hx__intro-inner">
              <p className="eyebrow hx__intro-eyebrow">
                Bay Area, San Francisco, CA
              </p>
              <h1 className="hx__intro-heading">
                <span className="hx__intro-greeting">Hello, I&apos;m</span>
                <a
                  className="hx__intro-photo-link"
                  href="https://www.linkedin.com/in/amy-ai-a1b466229/"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor-label="Linkedin?"
                  aria-label="Amy Ai on LinkedIn"
                >
                  <img
                    className="hx__intro-photo"
                    src="/about/linkedin-profile.jpg"
                    alt="Amy Ai"
                    width={200}
                    height={200}
                  />
                </a>
                <span className="hx__intro-name">Amy Ai.</span>
              </h1>
              <p className="eyebrow hx__intro-tagline">
                Forward deployed product designer,
                <br />
                building and shipping AI-Native Tools.
              </p>
            </div>

            <div className="hx__intro-foot">
              <p className="eyebrow hx__intro-subtitle">
                <span className="hx__intro-role">
                  Product designer{' '}
                  <a
                    href="https://joinmochi.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hx__intro-link"
                  >
                    <span className="hx__intro-at" aria-hidden="true">@</span>
                    <img
                      className="hx__intro-favicon"
                      src="/brands/mochi-icon.webp"
                      alt=""
                      width={14}
                      height={14}
                      decoding="async"
                    />
                    <span className="hx__intro-brand">Mochi Health</span>
                  </a>
                </span>
                <span className="hx__intro-role">
                  prev.{' '}
                  <a
                    href="https://www.sw.siemens.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hx__intro-link"
                  >
                    <span className="hx__intro-at" aria-hidden="true">@</span>
                    <img
                      className="hx__intro-favicon"
                      src="/brands/siemens-icon.svg"
                      alt=""
                      width={14}
                      height={14}
                      decoding="async"
                    />
                    <span className="hx__intro-brand">
                      Siemens Industrial Digital Software Inc.
                    </span>
                  </a>
                </span>
              </p>

              <nav className="hx__contacts" aria-label="Contact">
                <a
                  href="tel:+18182556234"
                  className="hx__contacts-link"
                  data-cursor-label="+1 (818) 255-6234"
                >
                  Phone
                </a>
                <a
                  href="mailto:aiamy0309@gmail.com"
                  className="hx__contacts-link"
                  data-cursor-label="aiamy0309@gmail.com"
                >
                  Email
                </a>
                <a
                  href="/resume.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hx__contacts-link"
                  data-cursor-label="View resume"
                >
                  Resume
                </a>
              </nav>
            </div>
          </article>

          {/* ── Project panels ── */}
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

                {project.pills?.length > 0 && (
                  <div className="hx__card-pills" aria-hidden="true">
                    {project.pills.map((pill) => (
                      <span key={pill} className="hx__card-pill">
                        {pill}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="hx__card-head">
                <h3 className="hx__card-title">{project.title}</h3>
                {project.year && (
                  <span className="hx__card-year">{project.year}</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
