import { useEffect, useRef, useState } from 'react';
import Navbar from '../../components/layout/Navbar';
import TableOfContents from '../../components/ui/TableOfContents';
import NextProjectBanner from '../../components/ui/NextProjectBanner';
import {
  RecoHowItWorksGraph,
  RecoFollowUpGraph,
} from '../../components/work/RecoPortfolioGraphs';
import { projects } from '../../data/projects';
import '../../styles/project-detail.css';
import '../../styles/reco-detail.css';

const LIVE_URL = 'https://reco-api-production-9d9c.up.railway.app/';

const TOC_SECTIONS = [
  { id: 'ro-overview', label: 'Overview' },
  { id: 'ro-rec', label: 'REC (Software)' },
  { id: 'ro-hardware', label: 'O (Hardware)' },
  { id: 'ro-how-it-works', label: 'How it Works' },
  { id: 'ro-architecture', label: 'Iterations' },
];

const METHOD_STEPS = ['Observe', 'Diagnose', 'Design', 'Build', 'Reflect'];

function MethodLoop() {
  const wrapRef = useRef(null);
  const n = METHOD_STEPS.length;
  const size = 520;
  const cx = size / 2;
  const cy = size / 2;
  const r = 168;

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('ro-method-loop--ready');
          io.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const nodes = METHOD_STEPS.map((label, i) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    return {
      label,
      index: i,
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
      angle,
    };
  });

  // Arc from node i → i+1, slightly inset so arrowheads clear the dots
  const arcs = nodes.map((from, i) => {
    const to = nodes[(i + 1) % n];
    const a1 = from.angle + 0.28;
    const a2 = to.angle - 0.28;
    const x1 = cx + r * Math.cos(a1);
    const y1 = cy + r * Math.sin(a1);
    const x2 = cx + r * Math.cos(a2);
    const y2 = cy + r * Math.sin(a2);
    const large = 0;
    return {
      i,
      d: `M ${x1.toFixed(1)} ${y1.toFixed(1)} A ${r} ${r} 0 ${large} 1 ${x2.toFixed(1)} ${y2.toFixed(1)}`,
    };
  });

  return (
    <div
      ref={wrapRef}
      className="ro-method-loop"
      role="img"
      aria-label={`Method loop: ${METHOD_STEPS.join(', then ')}, then back to Observe.`}
    >
      <svg className="ro-method-loop__svg" viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <defs>
          <marker
            id="roMethodArrow"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M 1 1 L 9 5 L 1 9 Z" fill="#554c4c" />
          </marker>
        </defs>

        {/* faint full ring */}
        <circle className="ro-method-loop__ring" cx={cx} cy={cy} r={r} />

        {arcs.map((arc) => (
          <path
            key={arc.i}
            className="ro-method-loop__arc"
            d={arc.d}
            pathLength="1"
            style={{ '--i': arc.i }}
            markerEnd="url(#roMethodArrow)"
          />
        ))}

        {nodes.map((node) => (
          <g key={node.label} className="ro-method-loop__node" style={{ '--i': node.index }}>
            <circle className="ro-method-loop__dot" cx={node.x} cy={node.y} r="7" />
          </g>
        ))}

        <text className="ro-method-loop__center" x={cx} y={cy + 5} textAnchor="middle">
          iterate
        </text>
      </svg>

      <ol className="ro-method-loop__labels">
        {nodes.map((node) => {
          const lx = cx + (r + 52) * Math.cos(node.angle);
          const ly = cy + (r + 52) * Math.sin(node.angle);
          return (
            <li
              key={node.label}
              className="ro-method-loop__label"
              style={{
                left: `${(lx / size) * 100}%`,
                top: `${(ly / size) * 100}%`,
                '--i': node.index,
              }}
            >
              <span className="ro-method-loop__num">{String(node.index + 1).padStart(2, '0')}</span>
              <span className="ro-method-loop__name">{node.label}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function CaseImage({ src, alt, caption, wide, frame = 'default' }) {
  return (
    <figure className={`ro-media${wide ? ' ro-media--wide' : ''}`}>
      <div
        className={`ro-media__frame${frame === 'white' ? ' ro-media__frame--white' : ''}`}
      >
        <img src={src} alt={alt} loading="lazy" />
      </div>
      {caption && <figcaption className="ro-media__caption">{caption}</figcaption>}
    </figure>
  );
}

/** Inline insights-iteration.svg — connectors draw once in view:
 * left stroke pair first, then right connectors (stroke + fill) L→R
 */
function InsightsIterationDraw() {
  const hostRef = useRef(null);
  const playedRef = useRef(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;

    let cancelled = false;
    let io;
    let rightTimer;
    let viewTimer;

    const strokeLength = (el) => {
      try {
        if (typeof el.getTotalLength === 'function') {
          return el.getTotalLength() || 1;
        }
        const x1 = Number(el.getAttribute('x1') || 0);
        const y1 = Number(el.getAttribute('y1') || 0);
        const x2 = Number(el.getAttribute('x2') || 0);
        const y2 = Number(el.getAttribute('y2') || 0);
        return Math.hypot(x2 - x1, y2 - y1) || 1;
      } catch {
        return 1;
      }
    };

    const elementX = (el) => {
      try {
        return el.getBBox().x;
      } catch {
        return 0;
      }
    };

    /** Right-side fill connectors only (exported without stroke). Skip mid-frame text/glyphs. */
    const isFillConnector = (el) => {
      if (el.tagName.toLowerCase() !== 'path') return false;
      if (el.hasAttribute('stroke')) return false;
      const fill = (el.getAttribute('fill') || '').toLowerCase();
      if (!['#554c4c', '#594b4b', '#ab5c5c'].includes(fill)) return false;
      try {
        const box = el.getBBox();
        const d = el.getAttribute('d') || '';
        const complexity = (d.match(/[CcLlQqSsTt]/g) || []).length;
        // True connectors sit on the right, are wide, and are simple paths
        // (taller mid branch can exceed ~240px height).
        return (
          box.x >= 3200 &&
          box.width > 400 &&
          box.height < 400 &&
          box.width / Math.max(box.height, 1) > 1.5 &&
          complexity < 30 &&
          d.length < 2000
        );
      } catch {
        return false;
      }
    };

    fetch('/rec-o/insights-iteration.svg')
      .then((r) => r.text())
      .then((svgText) => {
        if (cancelled) return;
        host.innerHTML = svgText;
        const svg = host.querySelector('svg');
        if (svg) {
          svg.removeAttribute('width');
          svg.removeAttribute('height');
          svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
          svg.setAttribute('role', 'img');
          svg.setAttribute(
            'aria-label',
            'Insights feature iteration across design versions',
          );
        }

        const strokeEls = [...host.querySelectorAll('path[stroke], line[stroke]')];
        const fillConnectors = [...host.querySelectorAll('path[fill]')].filter(
          isFillConnector,
        );

        const strokeMeta = strokeEls.map((el) => ({
          el,
          kind: 'stroke',
          len: strokeLength(el),
          x: elementX(el),
        }));
        const fillMeta = fillConnectors.map((el) => ({
          el,
          kind: 'fill',
          len: 0,
          x: elementX(el),
        }));

        // Left wave: three connectors (top flat bridge + two branched forks).
        const leftWave = strokeMeta
          .filter((m) => {
            if (m.el.tagName.toLowerCase() !== 'path' || m.x >= 2500) return false;
            const stroke = (m.el.getAttribute('stroke') || '').toLowerCase();
            return stroke === '#554c4c';
          })
          .sort((a, b) => a.el.getBBox().y - b.el.getBBox().y);

        // Right wave: fill connectors + red stroke path, L→R.
        // Do NOT animate mid-frame vertical lines or mid-frame text fills.
        const rightStroke = strokeMeta
          .filter((m) => m.el.tagName.toLowerCase() === 'path' && m.x >= 2500)
          .sort((a, b) => a.x - b.x);
        const rightWave = [...fillMeta, ...rightStroke].sort((a, b) => a.x - b.x);

        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        const hideStroke = (m) => {
          m.el.style.strokeDasharray = String(m.len);
          m.el.style.strokeDashoffset = reduce ? '0' : String(m.len);
          m.el.style.opacity = '1';
        };
        const hideFill = (m) => {
          m.el.style.clipPath = reduce ? 'inset(0 0 0 0)' : 'inset(0 100% 0 0)';
          m.el.style.opacity = '1';
        };

        // Everything else (mid lines, mid text) stays fully visible.
        leftWave.forEach(hideStroke);
        rightStroke.forEach(hideStroke);
        fillMeta.forEach(hideFill);

        if (reduce) return;

        // Same start + same end within a wave (length differences shouldn't desync timing).
        const DRAW_MS = 1000;
        const BETWEEN_WAVES_MS = 500;
        const EASE = 'cubic-bezier(0.4, 0, 0.2, 1)';

        const drawStrokeWave = (wave) => {
          wave.forEach((m) => {
            m.el.style.transition = 'none';
            m.el.style.strokeDasharray = String(m.len);
            m.el.style.strokeDashoffset = String(m.len);
          });
          void host.offsetWidth;
          wave.forEach((m) => {
            m.el.style.transition = `stroke-dashoffset ${DRAW_MS}ms ${EASE}`;
            m.el.style.strokeDashoffset = '0';
          });
        };

        const drawMixedWave = (wave) => {
          wave.forEach((m) => {
            m.el.style.transition = 'none';
            if (m.kind === 'stroke') {
              m.el.style.strokeDasharray = String(m.len);
              m.el.style.strokeDashoffset = String(m.len);
            } else {
              m.el.style.clipPath = 'inset(0 100% 0 0)';
            }
          });
          void host.offsetWidth;
          wave.forEach((m) => {
            if (m.kind === 'stroke') {
              m.el.style.transition = `stroke-dashoffset ${DRAW_MS}ms ${EASE}`;
              m.el.style.strokeDashoffset = '0';
            } else {
              m.el.style.transition = `clip-path ${DRAW_MS}ms ${EASE}`;
              m.el.style.clipPath = 'inset(0 0 0 0)';
            }
          });
        };

        const play = () => {
          if (playedRef.current) return;
          playedRef.current = true;

          drawStrokeWave(leftWave);

          rightTimer = window.setTimeout(() => {
            if (cancelled) return;
            drawMixedWave(rightWave);
          }, DRAW_MS + BETWEEN_WAVES_MS);
        };

        const VIEW_DELAY_MS = 1000;

        io = new IntersectionObserver(
          ([entry]) => {
            if (!entry.isIntersecting) {
              if (viewTimer) {
                window.clearTimeout(viewTimer);
                viewTimer = undefined;
              }
              return;
            }
            if (playedRef.current || viewTimer) return;
            viewTimer = window.setTimeout(() => {
              viewTimer = undefined;
              if (cancelled) return;
              play();
              io.disconnect();
            }, VIEW_DELAY_MS);
          },
          // Start after the SVG has been in view for 1s
          { threshold: 0, rootMargin: '0px 0px 0px 0px' },
        );
        io.observe(host);
      });

    return () => {
      cancelled = true;
      io?.disconnect();
      if (rightTimer) window.clearTimeout(rightTimer);
      if (viewTimer) window.clearTimeout(viewTimer);
    };
  }, []);

  return (
    <figure className="ro-media ro-media--wide ro-insights-draw">
      <div
        className="ro-media__frame ro-media__frame--white ro-insights-draw__frame"
        ref={hostRef}
        aria-hidden="false"
      />
    </figure>
  );
}

/** Red connector paths traced from reco-featurepage.png (viewBox 2543×1430) */
const RECO_FLOW_PATHS = [
  // Bottom branch: Mentions → under phones → up into Participant
  'M300 827 H489 Q607 827 607 945 V1220 Q607 1332 719 1332 H1968 Q2082 1332 2082 1218 V872',
  // Top branch: Open Threads → over phones → down into Participant
  'M477 731 H489 Q600 731 600 620 V246 Q600 136 710 136 H2007 Q2121 136 2121 250 V387',
  // Mid bridge: Summary ↔ Follow-up
  'M1129 493 H1413',
];

const RECO_FLOW_DOTS = [
  [300, 827],
  [477, 731],
  [1129, 493],
  [1413, 493],
  [2082, 872],
  [2121, 387],
];

/** Scroll reveal still — fade in + optional left→right flow line */
function FeatureFlowImage({ src, alt, variant = 'flow' }) {
  const ref = useRef(null);
  const showFlowLine = variant === 'flow';

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        el.classList.add('is-visible');
        io.disconnect();
      },
      { threshold: 0.28, rootMargin: '0px 0px -8% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <figure
      ref={ref}
      className={`ro-media reco-feature-flow reco-feature-flow--${variant}${showFlowLine ? ' reco-feature-flow--lined' : ''}`}
    >
      <div className="ro-media__frame ro-media__frame--white">
        <img src={src} alt={alt} loading="lazy" />
        {showFlowLine && (
          <svg
            className="reco-flow-line"
            viewBox="0 0 2543 1430"
            preserveAspectRatio="xMidYMid meet"
            aria-hidden="true"
          >
            {RECO_FLOW_PATHS.map((d) => (
              <path
                key={d}
                className="reco-flow-line__path"
                d={d}
                pathLength="1"
              />
            ))}
            {RECO_FLOW_DOTS.map(([cx, cy]) => (
              <circle
                key={`${cx}-${cy}`}
                className="reco-flow-line__dot"
                cx={cx}
                cy={cy}
                r="5"
              />
            ))}
          </svg>
        )}
      </div>
    </figure>
  );
}

/** Muted autoplaying loop — behaves like a GIF */
function LoopClip({ src, label, wide = false, phone = false, plain = false }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    el.muted = true;
    const tryPlay = () => {
      const p = el.play();
      if (p?.catch) p.catch(() => {});
    };
    tryPlay();
    el.addEventListener('canplay', tryPlay);
    return () => el.removeEventListener('canplay', tryPlay);
  }, [src]);

  const figureClass = plain
    ? 'ro-media'
    : phone
      ? 'ro-media ro-media--phone'
      : `ro-media${wide ? ' ro-media--wide' : ' ro-media--gif-left'}`;
  const frameClass = plain
    ? 'ro-media__frame'
    : `ro-media__frame${phone || !wide ? ' ro-media__frame--gif' : ''}`;

  return (
    <figure className={figureClass}>
      <div className={frameClass}>
        <video
          ref={ref}
          src={src}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-label={label}
        />
      </div>
    </figure>
  );
}

const CONTACT_SLIDE_MS = 1800;
const CONTACT_SLIDE_FALLBACK_MS = CONTACT_SLIDE_MS + 150;

/** In-view auto-play: phone slides apart, then gradient bands reveal */
function ContactPairScroll() {
  const rootRef = useRef(null);
  const stageRef = useRef(null);
  const moverRef = useRef(null);
  const gradHostRef = useRef(null);
  const gradRectsRef = useRef([]);
  const slideStartedRef = useRef(false);
  const slideDoneRef = useRef(false);
  const gradStartedRef = useRef(false);
  const gradRafRef = useRef(0);
  const startDelayRef = useRef(0);
  const [open, setOpen] = useState(false);
  const [gradReveal, setGradReveal] = useState(0);

  const resetGrad = () => {
    if (gradRafRef.current) {
      cancelAnimationFrame(gradRafRef.current);
      gradRafRef.current = 0;
    }
    gradStartedRef.current = false;
    setGradReveal(0);
    gradRectsRef.current.forEach((el) => {
      el.style.transition = 'none';
      el.style.opacity = '0';
    });
  };

  const playGrad = () => {
    if (gradStartedRef.current) return;
    const rects = gradRectsRef.current;
    if (!rects.length) return;

    gradStartedRef.current = true;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      rects.forEach((el) => {
        el.style.transition = 'none';
        el.style.opacity = '1';
      });
      setGradReveal(1);
      return;
    }

    rects.forEach((el) => {
      el.style.transition = 'none';
      el.style.opacity = '0';
    });
    void rects[0]?.getBoundingClientRect();

    const STAGGER = 0.1;
    const BAND_DUR = 0.45;
    rects.forEach((el, i) => {
      el.style.transition = `opacity ${BAND_DUR}s ease ${i * STAGGER}s`;
      el.style.opacity = '1';
    });

    const totalMs = (BAND_DUR + Math.max(0, rects.length - 1) * STAGGER) * 1000;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / totalMs);
      setGradReveal(t);
      if (t < 1) {
        gradRafRef.current = requestAnimationFrame(tick);
      } else {
        gradRafRef.current = 0;
      }
    };
    gradRafRef.current = requestAnimationFrame(tick);
  };

  const resetSequence = () => {
    if (startDelayRef.current) {
      clearTimeout(startDelayRef.current);
      startDelayRef.current = 0;
    }
    slideStartedRef.current = false;
    slideDoneRef.current = false;
    setOpen(false);
    resetGrad();
  };

  const isMobileContact = () =>
    window.matchMedia('(max-width: 900px)').matches;

  const startSequence = () => {
    if (slideStartedRef.current) return;
    slideStartedRef.current = true;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Mobile: no slide — park open and play gradient immediately.
    if (reduce || isMobileContact()) {
      setOpen(true);
      slideDoneRef.current = true;
      playGrad();
      return;
    }

    startDelayRef.current = window.setTimeout(() => {
      startDelayRef.current = 0;
      setOpen(true);
    }, 200);
  };

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;

    let raf = 0;
    const update = () => {
      raf = 0;
      // Mobile: gate on the second phone bottom; desktop: whole stage bottom.
      const target =
        isMobileContact() && moverRef.current ? moverRef.current : stage;
      const rect = target.getBoundingClientRect();
      const vh = window.innerHeight;
      const bottomInView = rect.bottom <= vh && rect.bottom > 0;
      const fullyOut = rect.bottom < 0 || rect.top > vh;

      if (bottomInView) startSequence();
      else if (fullyOut) resetSequence();
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
      if (startDelayRef.current) clearTimeout(startDelayRef.current);
      if (gradRafRef.current) cancelAnimationFrame(gradRafRef.current);
    };
  }, []);

  useEffect(() => {
    const mover = moverRef.current;
    if (!mover || !open) return undefined;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || isMobileContact()) {
      slideDoneRef.current = true;
      playGrad();
      return undefined;
    }

    const finishSlide = () => {
      if (slideDoneRef.current) return;
      slideDoneRef.current = true;
      playGrad();
    };

    const onEnd = (e) => {
      if (e.target !== mover || e.propertyName !== 'transform') return;
      finishSlide();
    };
    mover.addEventListener('transitionend', onEnd);
    const fallback = window.setTimeout(finishSlide, CONTACT_SLIDE_FALLBACK_MS);
    return () => {
      mover.removeEventListener('transitionend', onEnd);
      clearTimeout(fallback);
    };
  }, [open]);

  useEffect(() => {
    const host = gradHostRef.current;
    if (!host) return undefined;

    let cancelled = false;
    fetch('/rec-o/test.svg')
      .then((r) => r.text())
      .then((svgText) => {
        if (cancelled) return;
        host.innerHTML = svgText;
        const svg = host.querySelector('svg');
        if (svg) {
          svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
          svg.style.width = '100%';
          svg.style.height = '100%';
          svg.style.display = 'block';
          svg.style.overflow = 'visible';
        }
        const rects = Array.from(host.querySelectorAll('rect')).sort(
          (a, b) => a.getBBox().y - b.getBBox().y,
        );
        rects.forEach((el) => {
          el.style.opacity = '0';
          el.style.transition = 'none';
        });
        gradRectsRef.current = rects;
        if (slideDoneRef.current) {
          gradStartedRef.current = false;
          playGrad();
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const video = rootRef.current?.querySelector('video');
    if (!video) return undefined;
    video.muted = true;
    const tryPlay = () => {
      const p = video.play();
      if (p?.catch) p.catch(() => {});
    };
    tryPlay();
    video.addEventListener('canplay', tryPlay);
    return () => video.removeEventListener('canplay', tryPlay);
  }, []);

  return (
    <div className="ro-contact-scroll" ref={rootRef}>
      <div className="ro-contact-scroll__sticky">
        <div
          ref={stageRef}
          className={`ro-contact-stage${open ? ' ro-contact-stage--open' : ''}`}
          aria-label="Contact session phone sliding to reveal network view"
          style={{ '--ro-contact-grad': gradReveal }}
        >
          <p className="ro-gif-feature__index reco-feature-flow__intro-above">
            Every conversation adds a little more color.
            <br />
            The more you connect, the more it{' '}
            <span className="reco-feature-flow__intro-accent">shows</span>.
          </p>
          <div className="ro-contact-stage__cluster">
            <figure className="ro-contact-stage__phone ro-contact-stage__phone--base">
              <div className="ro-contact-stage__frame">
                <img
                  className="ro-contact-stage__bg"
                  src="/rec-o/bg.png"
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                />
                <video
                  src="/rec-o/reco2.0-contact.mp4"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                  aria-label="Rec contact session looping preview"
                />
              </div>
            </figure>

            <div className="ro-contact-stage__mover" ref={moverRef}>
              <div
                className="ro-contact-stage__grad"
                ref={gradHostRef}
                aria-hidden="true"
              />
              <figure className="ro-contact-stage__phone ro-contact-stage__phone--slide">
                <div className="ro-contact-stage__frame ro-contact-stage__frame--white">
                  <img
                    src="/rec-o/test1.png"
                    alt="Frequent contacts from conversations you can follow up with later"
                    loading="lazy"
                  />
                </div>
              </figure>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const REC_INSIGHT_CLIPS = [
  {
    src: '/rec-o/reco2.0-recording.mp4',
    label: 'REC-O recording session looping preview',
    index: '01 Record or Upload',
    body:
      'REC-O listens to your conversation in a private setting to gain context.',
  },
  {
    src: '/rec-o/reco2.0-insight.mp4',
    label: 'Rec insight tab looping preview',
    index: '02 Get Your Personal Insight',
    body:
      'See what mattered most, highlights, names, open questions, pulled straight from your conversation.',
  },
  {
    src: '/rec-o/Reco2.0-followup.mp4',
    label: 'Rec Highlight tab looping preview',
    index: '03 Follow-up That Fits',
    body:
      'REC-O writes the first draft based on conversation details. You bring the finishing touch.',
  },
  {
    src: '/rec-o/Reco2.0-participant.mp4',
    label: 'Rec Transcript tab looping preview',
    index: '04 The Start of a Network',
    body:
      'Every contact you save is the start of another conversation.',
  },
];

const ITER_PHONES = [
  { src: '/rec-o/1.png', alt: 'REC UI iteration screen 1', motion: 'exit' },
  { src: '/rec-o/2.png', alt: 'REC UI iteration screen 2', motion: 'exit' },
  { src: '/rec-o/3.png', alt: 'REC UI iteration screen 3', motion: 'stay' },
  { src: '/rec-o/4.png', alt: 'REC UI iteration screen 4', motion: 'exit' },
  { src: '/rec-o/5.png', alt: 'REC UI iteration screen 5', motion: 'exit' },
];

/** Sticky scrub progress segments (share of total track):
 * exit+enlarge → annotate 3 → hold → fade 3 → crossfade → annotate 5 → short hold
 */
const ITER_ANNOT_DUR = 0.11;
const ITER_HOLD_DUR = 0.07;
const ITER_FADE_DUR = 0.05;
const ITER_CROSSFADE_DUR = 0.09;
const ITER_FINAL_HOLD = 0.1;

const ITER_SEG = (() => {
  const exitEnd = 0.14;
  const annotateEnd = exitEnd + ITER_ANNOT_DUR;
  const hold3End = annotateEnd + ITER_HOLD_DUR;
  const fade3End = hold3End + ITER_FADE_DUR;
  const crossfadeEnd = fade3End + ITER_CROSSFADE_DUR;
  const annotate5End = crossfadeEnd + ITER_ANNOT_DUR;
  // Pack earlier beats so the final annotated-5 hold stays short.
  const scale = (1 - ITER_FINAL_HOLD) / annotate5End;
  return {
    exitEnd: exitEnd * scale,
    annotateEnd: annotateEnd * scale,
    hold3End: hold3End * scale,
    fade3End: fade3End * scale,
    crossfadeEnd: crossfadeEnd * scale,
    annotate5End: annotate5End * scale,
    // annotate5End → 1.0 = short hold phone 5 with annotations
  };
})();

function iterSegmentProgress(p, start, end) {
  if (p <= start) return 0;
  if (p >= end) return 1;
  return (p - start) / (end - start);
}

function prepareAnnotPaths(host, { outwardFromCenter = false } = {}) {
  const svg = host.querySelector('svg');
  if (svg) {
    svg.setAttribute(
      'preserveAspectRatio',
      outwardFromCenter ? 'xMidYMid meet' : 'xMinYMin meet',
    );
    svg.style.width = '100%';
    svg.style.height = '100%';
    svg.style.display = 'block';
    svg.style.overflow = 'visible';
  }

  const paths = Array.from(host.querySelectorAll('path'));
  let strokePaths = paths.filter((p) => p.hasAttribute('stroke'));
  const textPaths = paths.filter((p) => p.hasAttribute('fill'));

  let reverse = strokePaths.map(() => false);
  if (outwardFromCenter && svg) {
    const vb = svg.viewBox?.baseVal;
    const cx = vb ? vb.x + vb.width / 2 : 0;
    strokePaths = [...strokePaths].sort((a, b) => {
      const da = Math.abs(a.getBBox().x + a.getBBox().width / 2 - cx);
      const db = Math.abs(b.getBBox().x + b.getBBox().width / 2 - cx);
      return da - db;
    });
    reverse = strokePaths.map((path) => {
      try {
        const len = path.getTotalLength();
        const start = path.getPointAtLength(0);
        const end = path.getPointAtLength(len);
        // Reverse when path data runs outer → center so dash draws center → out.
        return Math.abs(start.x - cx) > Math.abs(end.x - cx);
      } catch {
        return false;
      }
    });
  } else {
    strokePaths = [...strokePaths].sort((a, b) => a.getBBox().y - b.getBBox().y);
  }

  const strokeLens = strokePaths.map((p) => {
    try {
      return p.getTotalLength();
    } catch {
      return 1;
    }
  });

  return { strokePaths, textPaths, strokeLens, reverse };
}

/** Sticky scrub:
 * 1) 1/2/4/5 exit + 3 enlarges
 * 2) annotation lines draw L→R, then text fades in
 * 3) hold annotated phone 3
 * 4) fade phone 3 annotations out
 * 5) enlarged 3 crossfades into 5
 * 6) phone 5 annotations draw center→out, then text fades in
 * 7) hold centered phone 5 with annotations
 */
function IterationPhonesScroll() {
  const trackRef = useRef(null);
  const linesHostRef = useRef(null);
  const lines5HostRef = useRef(null);
  const linesPathsRef = useRef({ strokePaths: [], textPaths: [], strokeLens: [], reverse: [] });
  const lines5PathsRef = useRef({ strokePaths: [], textPaths: [], strokeLens: [], reverse: [] });
  const progressRef = useRef(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setProgress(1);
      return undefined;
    }

    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = track.getBoundingClientRect();
      const viewH = window.innerHeight;
      const scrollable = Math.max(1, rect.height - viewH);
      const scrolled = Math.min(scrollable, Math.max(0, -rect.top));
      const next = scrolled / scrollable;
      progressRef.current = next;
      setProgress(next);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const phasesFromProgress = (p) => {
    const phase1 = iterSegmentProgress(p, 0, ITER_SEG.exitEnd);
    const phase2 = iterSegmentProgress(p, ITER_SEG.exitEnd, ITER_SEG.annotateEnd);
    const fade3 = iterSegmentProgress(p, ITER_SEG.hold3End, ITER_SEG.fade3End);
    const phase3 = iterSegmentProgress(p, ITER_SEG.fade3End, ITER_SEG.crossfadeEnd);
    const phase4 = iterSegmentProgress(p, ITER_SEG.crossfadeEnd, ITER_SEG.annotate5End);
    const lineDraw = Math.min(1, phase2 / 0.55);
    const textReveal = Math.min(1, Math.max(0, (phase2 - 0.55) / 0.45));
    const lineDraw5 = Math.min(1, phase4 / 0.55);
    const textReveal5 = Math.min(1, Math.max(0, (phase4 - 0.55) / 0.45));
    return {
      phase1,
      phase2,
      fade3,
      phase3,
      phase4,
      lineDraw,
      textReveal,
      lineDraw5,
      textReveal5,
    };
  };

  const paintAnnot = (store, lineDraw, textReveal, visible) => {
    const { strokePaths, textPaths, strokeLens, reverse } = store;
    if (!strokePaths.length && !textPaths.length) return;

    strokePaths.forEach((path, i) => {
      const len = strokeLens[i] || 1;
      const local = Math.min(1, Math.max(0, (lineDraw - i * 0.08) / 0.84));
      path.style.strokeDasharray = String(len);
      path.style.strokeDashoffset = reverse?.[i]
        ? String(-len * (1 - local))
        : String(len - len * local);
      path.style.opacity = String(lineDraw > 0 ? visible : 0);
    });
    textPaths.forEach((path) => {
      path.style.opacity = String(textReveal * visible);
    });
  };

  const applyLineAnimation = (p) => {
    const { phase2, lineDraw, textReveal, fade3, lineDraw5, textReveal5, phase4 } =
      phasesFromProgress(p);
    const lines3Visible = phase2 > 0 ? Math.max(0, 1 - fade3) : 0;
    paintAnnot(linesPathsRef.current, lineDraw, textReveal, lines3Visible);
    paintAnnot(lines5PathsRef.current, lineDraw5, textReveal5, phase4 > 0 ? 1 : 0);
  };

  // Load line.svg once — strokes draw, then text fades.
  useEffect(() => {
    const host = linesHostRef.current;
    if (!host) return undefined;

    let cancelled = false;
    fetch('/rec-o/line.svg')
      .then((r) => r.text())
      .then((svgText) => {
        if (cancelled) return;
        host.innerHTML = svgText;
        linesPathsRef.current = prepareAnnotPaths(host);
        applyLineAnimation(progressRef.current);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Load annotation5.svg — strokes draw center→out, then text fades.
  useEffect(() => {
    const host = lines5HostRef.current;
    if (!host) return undefined;

    let cancelled = false;
    fetch('/rec-o/annotation5.svg')
      .then((r) => r.text())
      .then((svgText) => {
        if (cancelled) return;
        host.innerHTML = svgText;
        lines5PathsRef.current = prepareAnnotPaths(host, { outwardFromCenter: true });
        applyLineAnimation(progressRef.current);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const {
    phase1,
    phase2,
    fade3,
    phase3,
    phase4,
    lineDraw,
    textReveal,
    lineDraw5,
    textReveal5,
  } = phasesFromProgress(progress);

  useEffect(() => {
    applyLineAnimation(progress);
  }, [lineDraw, textReveal, fade3, phase3, lineDraw5, textReveal5, phase4, progress]);

  const exitY = `${-phase1 * 110}%`;
  const exitOpacity = 1 - phase1;
  const stayScale = 1 + phase1 * 0.85;
  const linesOpacity = phase2 > 0 ? Math.max(0, 1 - fade3) : 0;
  const lines5Opacity = phase4 > 0 ? 1 : 0;
  const beforeLabelOpacity = linesOpacity;
  const currentLabelOpacity = phase3;

  return (
    <div className="ro-iter-scroll" ref={trackRef}>
      <div className="ro-iter-scroll__sticky">
        <div
          className="ro-iter-phones"
          aria-label="REC UI iterations across five screens"
          style={{ '--ro-iter-p': progress }}
        >
          {ITER_PHONES.map((phone) => {
            if (phone.motion === 'exit') {
              return (
                <figure
                  key={phone.src}
                  className="ro-iter-phones__item ro-iter-phones__item--exit"
                  style={{
                    transform: `translate3d(0, ${exitY}, 0)`,
                    opacity: exitOpacity,
                  }}
                >
                  <img src={phone.src} alt={phone.alt} loading="lazy" />
                </figure>
              );
            }

            return (
              <figure
                key={phone.src}
                className="ro-iter-phones__item ro-iter-phones__item--stay"
                style={{
                  transform: `scale(${stayScale})`,
                }}
              >
                <img
                  src={phone.src}
                  alt={phone.alt}
                  loading="lazy"
                  style={{ opacity: 1 - phase3 }}
                />
                <img
                  className="ro-iter-phones__final"
                  src="/rec-o/5.png"
                  alt="REC UI iteration screen 5"
                  loading="lazy"
                  style={{ opacity: phase3 }}
                />
                <div
                  className="ro-iter-phones__lines"
                  ref={linesHostRef}
                  aria-hidden="true"
                  style={{ opacity: linesOpacity }}
                />
                <div
                  className="ro-iter-phones__lines5"
                  ref={lines5HostRef}
                  aria-hidden="true"
                  style={{ opacity: lines5Opacity }}
                />
                <p
                  className="ro-iter-phones__caption"
                  aria-hidden={beforeLabelOpacity < 0.05}
                  style={{ opacity: beforeLabelOpacity }}
                >
                  Before
                </p>
                <p
                  className="ro-iter-phones__caption ro-iter-phones__caption--current"
                  aria-hidden={currentLabelOpacity < 0.05}
                  style={{ opacity: currentLabelOpacity }}
                >
                  Current
                </p>
              </figure>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StickyInsightClips({ clips }) {
  const [active, setActive] = useState(0);
  const [inView, setInView] = useState(true);
  const stackRef = useRef(null);
  const clipRefs = useRef([]);

  useEffect(() => {
    const stack = stackRef.current;
    if (!stack) return undefined;

    const updateActive = () => {
      // Mobile shows copy under each clip — no sticky rail to drive.
      if (window.matchMedia('(max-width: 900px)').matches) {
        setInView(false);
        return;
      }

      const mid = window.innerHeight * 0.5;
      const nodes = clipRefs.current;
      let best = 0;
      let bestDist = Infinity;
      let anyVisible = false;

      nodes.forEach((node, i) => {
        if (!node) return;
        const rect = node.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > window.innerHeight) return;
        anyVisible = true;
        const center = rect.top + rect.height / 2;
        const dist = Math.abs(center - mid);
        if (dist < bestDist) {
          bestDist = dist;
          best = i;
        }
      });

      const stackRect = stack.getBoundingClientRect();
      const stackVisible =
        stackRect.bottom > window.innerHeight * 0.15 &&
        stackRect.top < window.innerHeight * 0.85;

      setInView(stackVisible && anyVisible);
      if (anyVisible) setActive(best);
    };

    updateActive();
    window.addEventListener('scroll', updateActive, { passive: true });
    window.addEventListener('resize', updateActive);
    return () => {
      window.removeEventListener('scroll', updateActive);
      window.removeEventListener('resize', updateActive);
    };
  }, [clips]);

  const current = clips[active] ?? clips[0];
  const showCopy = Boolean(current?.index) && inView;

  return (
    <div className="ro-gif-feature-stack" ref={stackRef}>
      <div className="ro-gif-feature-stack__clips">
        {clips.map((clip, i) => (
          <div
            key={clip.src}
            className="ro-gif-feature-stack__clip"
            data-insight-index={i}
            ref={(el) => {
              clipRefs.current[i] = el;
            }}
          >
            <LoopClip src={clip.src} label={clip.label} />
            {clip.index ? (
              <aside className="ro-gif-feature-stack__copy ro-gif-feature-stack__copy--inline">
                <p className="ro-gif-feature__index">{clip.index}</p>
                <p className="ro-gif-feature__body">{clip.body}</p>
              </aside>
            ) : null}
          </div>
        ))}
      </div>
      <div className="ro-gif-feature-stack__rail" aria-hidden={!showCopy}>
        <aside
          className={`ro-gif-feature-stack__copy ro-gif-feature-stack__copy--sticky${showCopy ? '' : ' ro-gif-feature-stack__copy--hidden'}`}
          aria-live="polite"
        >
          {current?.index ? (
            <>
              <p className="ro-gif-feature__index">{current.index}</p>
              <p className="ro-gif-feature__body">{current.body}</p>
            </>
          ) : null}
        </aside>
      </div>
    </div>
  );
}

export default function RecODetail() {
  useEffect(() => {
    const els = document.querySelectorAll('.ro-reveal');
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('ro-reveal--visible');
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const project = projects.find((p) => p.slug === 'rec-o');
  const currentIndex = projects.findIndex((p) => p.slug === 'rec-o');
  const prevProject =
    currentIndex > 0 ? projects[currentIndex - 1] : projects[projects.length - 1];
  const nextProject =
    currentIndex < projects.length - 1 ? projects[currentIndex + 1] : projects[0];

  return (
    <>
      <Navbar />
      <TableOfContents
        sections={TOC_SECTIONS}
        projectTitle={project.title}
        accent="#554c4c"
        autoHideAfterId="ro-rec"
      />

      <main className="project-detail reco-detail">
        <div className="pd-container">
          <div className="ro-phone-hero">
            <CaseImage
              src="/rec-o/reco-hero2.png"
              alt="REC-O wearable pin and coaching app"
              wide
            />
          </div>

          {/* ── Header + credits ── */}
          <div className="ro-intro" id="ro-overview">
            <header className="pd-header">
              <h1 className="pd-header__title">REC-O</h1>
              <p className="pd-header__subtitle">
                We treat every conversation as a relationship building point.
                Paired with a wearable recording pin to record anywhere,
                any time. From there, REC-O handles the recap and the
                follow-through, so nothing gets lost after the moment ends.
              </p>
              <p className="pd-header__subtitle">
                A conversation agent is embedded inside the app, designed with a
                touch of warmth so the AI feels seamless and natural rather than
                like a chat interface.
              </p>
              <a
                className="ro-try-link"
                href={LIVE_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                Try it <span className="ro-try-link__arrow" aria-hidden="true">↗</span>
              </a>
            </header>

            <div className="pd-credits">
              <div className="pd-credits__item">
                <span className="pd-credits__label">Date</span>
                <span className="pd-credits__value">May 2026</span>
              </div>
              <div className="pd-credits__item">
                <span className="pd-credits__label">Role</span>
                <span className="pd-credits__value">
                  Journey Owner · UX Researcher · UI Designer · Developer
                </span>
              </div>
              <div className="pd-credits__item">
                <span className="pd-credits__label">Deliverables</span>
                <span className="pd-credits__value">
                  Audio Recording Hardware · iOS App (WIP)
                </span>
              </div>
            </div>
          </div>

          {/* ── Approach / Method (hidden) ── */}
          <section id="ro-method" className="pd-section ro-reveal" hidden aria-hidden="true">
            <p className="pd-section__label">Approach</p>
            <h2 className="pd-section__heading">Method</h2>
            <MethodLoop />
          </section>

          <CaseImage
            src="/rec-o/scenario.png"
            alt="REC in use during a conversation — phone showing CoffeeNotes while recording"
            wide
          />

          <section id="ro-rec" className="pd-section ro-reveal">
            <p className="pd-section__label">REC · Software</p>
          </section>

          <div className="ro-gif-row">
            <StickyInsightClips clips={REC_INSIGHT_CLIPS} />
          </div>

          <ContactPairScroll />

          {/* ── O Hardware ── */}
          <section id="ro-hardware" className="pd-section ro-reveal">
            <p className="pd-section__label">O · Hardware</p>
            <div className="ro-pair ro-pair--equal">
              <CaseImage
                src="/rec-o/reco-hardware.png"
                alt="O wearable pin product render"
              />
              <LoopClip
                src="/rec-o/reco-pairing.mp4"
                label="O wearable pin paired and worn during use"
                plain
              />
            </div>
          </section>

          {/* ── How It Works ── */}
          <section id="ro-how-it-works" className="pd-section ro-reveal">
            <p className="pd-section__label">How it works</p>
            <div className="reco-graphs">
              <div className="reco-graph-stack">
                <RecoHowItWorksGraph />
                <h2 className="pd-section__heading reco-feature-flow__heading">
                  Multiple touch points inform follow-up
                </h2>
                <FeatureFlowImage
                  src="/rec-o/logistic.png"
                  alt="REC feature pages across Capture, Structure, and Note"
                />
              </div>
              <RecoFollowUpGraph />
            </div>
            <h2 className="pd-section__heading reco-feature-flow__heading">
              Tailor every follow-up based on context, make it personal
            </h2>
            <div className="ro-pair ro-pair--equal ro-pair--iteration">
              <FeatureFlowImage
                src="/rec-o/reco-followup-insights.png"
                alt="Follow-up insights and advice interface"
                variant="bridge"
              />
              <LoopClip
                src="/rec-o/Reco2.0-followup.mp4"
                label="Rec Follow-up tab looping preview"
                plain
              />
            </div>
          </section>

          {/* ── Architecture ── */}
          <section id="ro-architecture" className="pd-section ro-reveal">
            <p className="pd-section__label">Iterations</p>
            <h2 className="pd-section__heading">Home Screen</h2>
            <IterationPhonesScroll />
            <h2 className="pd-section__heading">Insights Page</h2>
            <InsightsIterationDraw />
          </section>

          <figure className="ro-color-after-collapse">
            <img src="/rec-o/color.png" alt="REC-O color study" loading="lazy" />
          </figure>

          <section className="pd-section ro-reveal ro-in-use">
            <p className="pd-section__label">In Use</p>
            <div className="ro-pair ro-pair--equal ro-pair--posters">
              <CaseImage
                src="/rec-o/reco-poster1.png"
                alt="REC-O product poster"
                frame="white"
              />
              <CaseImage
                src="/rec-o/reco-poster2.png"
                alt="REC-O lifestyle poster"
                frame="white"
              />
            </div>
          </section>

          <CaseImage
            src="/rec-o/reco-hero.png"
            alt="O wearable pin — product render and worn on a jacket lapel"
            wide
          />
        </div>

        <NextProjectBanner nextProject={nextProject} prevProject={prevProject} />
      </main>
    </>
  );
}
