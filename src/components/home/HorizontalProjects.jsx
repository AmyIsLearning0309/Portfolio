import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { projects } from '../../data/projects.js';
import '../../styles/horizontal-projects.css';

const STACKED_MQ = '(max-width: 1023px)';

/** True when the media box sits fully inside the clear stage (right of intro, inside viewport). */
function isThumbnailFullyVisible(mediaEl, introEl) {
  if (!mediaEl) return false;
  const rect = mediaEl.getBoundingClientRect();
  if (rect.width < 2 || rect.height < 2) return false;

  const tol = 2;
  const isStacked = window.matchMedia(STACKED_MQ).matches;
  const leftBound = isStacked || !introEl ? 0 : introEl.getBoundingClientRect().right;
  const rightBound = window.innerWidth;
  const topBound = 0;
  const bottomBound = window.innerHeight;

  return (
    rect.left >= leftBound - tol &&
    rect.right <= rightBound + tol &&
    rect.top >= topBound - tol &&
    rect.bottom <= bottomBound + tol
  );
}

/** Tight follow — smooth without feeling delayed */
const FLOW_LERP = 0.22;
const GIF_FADE_MS = 450;
const GIF_HOVER_DELAY_MS = 1200;

const SNAP_COUNT = projects.length;

/**
 * Vertical scroll drives a horizontal track.
 * Scroll progress maps continuously across snap points
 * (native CSS scroll-snap) — no post-scroll recenter delay.
 * Starting view already shows the first project, so the first
 * scroll advances to the second project immediately.
 */
export default function HorizontalProjects() {
  const tunnelRef = useRef(null);
  const trackRef = useRef(null);
  const introRef = useRef(null);
  const mediaRefs = useRef({});
  const cardRefs = useRef({});
  const snapShiftsRef = useRef([0]);
  const targetShiftRef = useRef(0);
  const currentShiftRef = useRef(0);
  const [tunnelHeight, setTunnelHeight] = useState(`${SNAP_COUNT * 100}svh`);
  const [isStacked, setIsStacked] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(STACKED_MQ).matches : false
  );
  const [gifState, setGifState] = useState(null); // { id, key, visible }
  const hoveredIdRef = useRef(null);
  const gifPlayIdRef = useRef(null);
  const gifFadeTimerRef = useRef(null);
  const gifHoverTimerRef = useRef(null);

  const clearGifFadeTimer = () => {
    if (gifFadeTimerRef.current != null) {
      window.clearTimeout(gifFadeTimerRef.current);
      gifFadeTimerRef.current = null;
    }
  };

  const clearGifHoverTimer = () => {
    if (gifHoverTimerRef.current != null) {
      window.clearTimeout(gifHoverTimerRef.current);
      gifHoverTimerRef.current = null;
    }
  };

  const hideGif = (id, { immediate = false } = {}) => {
    clearGifFadeTimer();
    clearGifHoverTimer();

    if (immediate) {
      if (gifPlayIdRef.current === id) gifPlayIdRef.current = null;
      setGifState((prev) => (prev?.id === id ? null : prev));
      return;
    }

    setGifState((prev) => {
      if (!prev || prev.id !== id) return prev;
      return { ...prev, visible: false };
    });

    gifFadeTimerRef.current = window.setTimeout(() => {
      gifFadeTimerRef.current = null;
      setGifState((prev) => (prev?.id === id && !prev.visible ? null : prev));
      if (gifPlayIdRef.current === id) gifPlayIdRef.current = null;
    }, GIF_FADE_MS);
  };

  const showGif = (project) => {
    if (!project.hoverImage) return;
    if (hoveredIdRef.current !== project.id) return;

    const mediaEl = mediaRefs.current[project.id];
    if (!isThumbnailFullyVisible(mediaEl, introRef.current)) return;

    clearGifFadeTimer();
    clearGifHoverTimer();
    gifPlayIdRef.current = project.id;

    setGifState((prev) => {
      if (prev?.id === project.id) {
        return { ...prev, visible: true };
      }
      return { id: project.id, key: Date.now(), visible: false };
    });

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setGifState((prev) =>
          prev?.id === project.id ? { ...prev, visible: true } : prev,
        );
      });
    });
  };

  const scheduleGifStart = (project) => {
    if (!project.hoverImage) return;
    if (gifHoverTimerRef.current != null) return;

    // Already playing — keep / refresh visibility
    if (gifPlayIdRef.current === project.id) {
      showGif(project);
      return;
    }

    gifHoverTimerRef.current = window.setTimeout(() => {
      gifHoverTimerRef.current = null;
      if (hoveredIdRef.current !== project.id) return;
      showGif(project);
      // If still not fully visible, reschedule while hover continues
      if (gifPlayIdRef.current !== project.id && hoveredIdRef.current === project.id) {
        scheduleGifStart(project);
      }
    }, GIF_HOVER_DELAY_MS);
  };

  const handleCardEnter = (project) => {
    hoveredIdRef.current = project.id;
    scheduleGifStart(project);
  };

  const handleCardLeave = (project) => {
    if (hoveredIdRef.current === project.id) {
      hoveredIdRef.current = null;
    }
    clearGifHoverTimer();
    if (gifPlayIdRef.current === project.id) hideGif(project.id);
  };

  // Track viewport breakpoint
  useEffect(() => {
    const mq = window.matchMedia(STACKED_MQ);
    const onChange = () => setIsStacked(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // When entering stacked mode, clear desktop transforms
  useEffect(() => {
    if (isStacked) {
      document.documentElement.classList.remove('hx-scroll-snap');
      if (trackRef.current) trackRef.current.style.transform = '';
      if (introRef.current) introRef.current.style.transform = '';
      currentShiftRef.current = 0;
      targetShiftRef.current = 0;
    } else {
      document.documentElement.classList.add('hx-scroll-snap');
    }
    return () => {
      document.documentElement.classList.remove('hx-scroll-snap');
      clearGifFadeTimer();
      clearGifHoverTimer();
    };
  }, [isStacked]);

  // Measure max travel + per-card center shifts (desktop only)
  useEffect(() => {
    if (isStacked) return undefined;

    const measure = () => {
      const track = trackRef.current;
      const intro = introRef.current;
      if (!track) return;

      const prevTrack = track.style.transform;
      const prevIntro = intro?.style.transform ?? '';
      track.style.transform = 'translate3d(0,0,0)';
      if (intro) intro.style.transform = 'none';

      const max = Math.max(0, track.scrollWidth - window.innerWidth);
      const introRight = intro?.getBoundingClientRect().right ?? 0;
      const focusX = (introRight + window.innerWidth) / 2;

      const snaps = [0];
      projects.forEach((project, index) => {
        // First card is already in the resting view — skip recentering it
        if (index === 0) return;
        const card = cardRefs.current[project.id];
        if (!card) return;
        const rect = card.getBoundingClientRect();
        if (rect.width < 2) return;
        const cx = rect.left + rect.width / 2;
        snaps.push(Math.max(0, Math.min(max, cx - focusX)));
      });

      snapShiftsRef.current = snaps;
      track.style.transform = prevTrack;
      if (intro) intro.style.transform = prevIntro;

      setTunnelHeight(`${SNAP_COUNT * 100}svh`);
    };

    measure();
    const t = window.setTimeout(measure, 250);
    window.addEventListener('resize', measure);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener('resize', measure);
    };
  }, [isStacked]);

  // Scroll progress → interpolate across snap shifts (desktop only)
  useEffect(() => {
    if (isStacked) return undefined;

    let raf = 0;

    const syncGifVisibility = () => {
      const id = hoveredIdRef.current;
      if (!id) return;
      const project = projects.find((p) => p.id === id);
      if (!project?.hoverImage) return;

      const mediaEl = mediaRefs.current[id];
      const visible = isThumbnailFullyVisible(mediaEl, introRef.current);
      if (!visible) {
        clearGifHoverTimer();
        if (gifPlayIdRef.current === id) hideGif(id);
        return;
      }
      // Fully visible again while still hovering — wait the delay before (re)starting
      if (gifPlayIdRef.current !== id && gifHoverTimerRef.current == null) {
        scheduleGifStart(project);
      }
    };

    const shiftFromProgress = (progress) => {
      const snaps = snapShiftsRef.current;
      const n = snaps.length;
      if (n === 0) return 0;
      if (n === 1) return snaps[0];

      const scaled = Math.max(0, Math.min(1, progress)) * (n - 1);
      const i = Math.min(n - 2, Math.floor(scaled));
      const t = scaled - i;
      return snaps[i] + (snaps[i + 1] - snaps[i]) * t;
    };

    const readProgress = () => {
      const tunnel = tunnelRef.current;
      if (!tunnel) return 0;
      const rect = tunnel.getBoundingClientRect();
      const range = tunnel.offsetHeight - window.innerHeight;
      if (range <= 0) return 0;
      return Math.max(0, Math.min(1, -rect.top / range));
    };

    const tick = () => {
      targetShiftRef.current = shiftFromProgress(readProgress());

      const track = trackRef.current;
      const intro = introRef.current;
      const target = targetShiftRef.current;
      let current = currentShiftRef.current;
      current += (target - current) * FLOW_LERP;
      if (Math.abs(target - current) < 0.2) current = target;
      currentShiftRef.current = current;

      if (track) {
        track.style.transform = `translate3d(${-current}px, 0, 0)`;
      }
      if (intro) {
        intro.style.transform =
          current > 0.5 ? `translate3d(${current}px, 0, 0)` : 'none';
      }

      syncGifVisibility();
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [tunnelHeight, isStacked]);

  return (
    <section
      className={`hx${isStacked ? ' hx--stacked' : ''}`}
      id="selected-works"
      ref={tunnelRef}
      style={isStacked ? undefined : { height: tunnelHeight }}
      aria-label="Introduction and selected works"
    >
      {/* Native snap stops — desktop only */}
      {!isStacked && (
        <div className="hx__snap-rail" aria-hidden="true">
          {Array.from({ length: SNAP_COUNT }, (_, i) => (
            <div key={i} className="hx__snap-stop" />
          ))}
        </div>
      )}

      <div className="hx__stage">
        <div className="hx__track" ref={trackRef}>
          <article className="hx__intro" ref={introRef} aria-label="Introduction">
            <div className="hx__intro-inner">
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
              <p className="hx__intro-tagline">
                Product Designer/ Builder/ Product Manager
              </p>
            </div>

            <div className="hx__intro-foot">
              <p className="hx__intro-subtitle">
                <span className="hx__intro-role">
                  Current{' '}
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
                  Prev.{' '}
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

          {projects.map((project) => {
            const isGifMounted = gifState?.id === project.id;
            const isGifVisible = isGifMounted && gifState.visible;
            const isPreviewOnly = Boolean(project.externalUrl);
            const CardTag = isPreviewOnly ? 'div' : Link;
            const cardProps = isPreviewOnly
              ? {
                  'aria-label': project.title,
                }
              : {
                  to: `/work/${project.slug}`,
                  'aria-label': `Open ${project.title} case study`,
                };

            return (
              <CardTag
                key={project.id}
                {...cardProps}
                className={`hx__card${isGifVisible ? ' hx__card--gif-playing' : ''}${
                  isPreviewOnly ? ' hx__card--preview' : ''
                }`}
                ref={(el) => {
                  if (el) cardRefs.current[project.id] = el;
                  else delete cardRefs.current[project.id];
                }}
              >
                <div
                  className="hx__card-media"
                  ref={(el) => {
                    if (el) mediaRefs.current[project.id] = el;
                    else delete mediaRefs.current[project.id];
                  }}
                  style={{ background: project.placeholderColor }}
                  onMouseEnter={() => handleCardEnter(project)}
                  onMouseLeave={() => handleCardLeave(project)}
                  onFocus={() => handleCardEnter(project)}
                  onBlur={() => handleCardLeave(project)}
                  {...(isPreviewOnly
                    ? { 'data-cursor-label': project.externalUrl.replace(/^https?:\/\//, '').replace(/\/$/, '') }
                    : {})}
                >
                  {project.heroImage ? (
                    <>
                      <img
                        src={project.heroImage}
                        alt=""
                        className={`hx__card-img${project.slug === 'rec-o' ? ' hx__card-img--rec-o' : ''}`}
                      />
                      {project.hoverImage && isGifMounted && (
                        <img
                          key={gifState.key}
                          src={`${project.hoverImage}?restart=${gifState.key}`}
                          alt=""
                          className={`hx__card-img hx__card-img--hover${
                            isGifVisible ? ' hx__card-img--hover-visible' : ''
                          }`}
                          aria-hidden="true"
                        />
                      )}
                    </>
                  ) : (
                    <div
                      className="hx__card-wash"
                      style={{ background: project.placeholderAccent }}
                    />
                  )}
                </div>

                <div className="hx__card-head">
                  <h3 className="hx__card-title">{project.title}</h3>
                  <div className="hx__card-meta">
                    {project.pills?.length > 0 && (
                      <div className="hx__card-pills" aria-hidden="true">
                        {project.pills.map((pill) => (
                          <span key={pill} className="hx__card-pill">
                            {pill}
                          </span>
                        ))}
                      </div>
                    )}
                    {project.year && (
                      <span className="hx__card-year">{project.year}</span>
                    )}
                  </div>
                </div>
              </CardTag>
            );
          })}
        </div>
      </div>
    </section>
  );
}
