import { useEffect, useRef, useImperativeHandle, forwardRef, useState, memo, Children, useCallback } from 'react';
import Navbar from '../../components/layout/Navbar';
import PlaceholderImage from '../../components/ui/PlaceholderImage';
import Tag from '../../components/ui/Tag';
import TableOfContents from '../../components/ui/TableOfContents';
import NextProjectBanner from '../../components/ui/NextProjectBanner';
import { projects } from '../../data/projects';
import '../../styles/project-detail.css';
import '../../styles/siemens-detail.css';

const TOC_SECTIONS = [
  { id: 'sd-overview', label: 'Overview' },
  { id: 'sd-scale', label: 'Context' },
  // { id: 'sd-pain-points', label: 'Pain Points' }, // Removed — images live in Scale slideshow
  // { id: 'sd-gap', label: 'The Gap' }, // Hidden for now
  // { id: 'sd-opportunity', label: 'Opportunity' }, // Hidden for now
  { id: 'sd-solution', label: 'Solution' },
  // { id: 'sd-mapping', label: 'Pain Mapping' }, // Hidden for now
  { id: 'sd-results', label: 'Results' },
  { id: 'sd-findings', label: 'Findings' },
  { id: 'sd-bench-notetaker', label: 'Notetaker Benchmark' },
  { id: 'sd-bench-scrum', label: 'Scrum UXer Benchmark' },
  { id: 'sd-overall-gain', label: 'Overall Gain' },
  { id: 'sd-implementation', label: 'Implementation' },
  { id: 'sd-impact', label: 'Impact' },
  { id: 'sd-reflection', label: 'Reflection' },
];

/** Side-by-side figures — slideshow with arrow navigation */
function HScroll({ children, label }) {
  const slides = Children.toArray(children).filter(Boolean);
  const count = slides.length;
  const [index, setIndex] = useState(0);

  const go = useCallback(
    (next) => {
      if (count < 2) return;
      setIndex(((next % count) + count) % count);
    },
    [count]
  );

  if (count === 0) return null;

  const progress = count > 1 ? (index + 1) / count : 1;

  return (
    <div
      className="sd-slideshow"
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          go(index - 1);
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          go(index + 1);
        }
      }}
    >
      <div className="sd-slideshow__frame">
        {count > 1 && (
          <button
            type="button"
            className="sd-slideshow__arrow sd-slideshow__arrow--prev"
            onClick={() => go(index - 1)}
            aria-label="Previous slide"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path
                d="M15 4 L7 12 L15 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}

        <div className="sd-slideshow__viewport">
          <div
            className="sd-slideshow__track"
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {slides.map((slide, i) => (
              <div
                key={slide.key ?? i}
                className="sd-slideshow__slide"
                aria-hidden={i !== index}
              >
                {slide}
              </div>
            ))}
          </div>
        </div>

        {count > 1 && (
          <button
            type="button"
            className="sd-slideshow__arrow sd-slideshow__arrow--next"
            onClick={() => go(index + 1)}
            aria-label="Next slide"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path
                d="M9 4 L17 12 L9 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
      </div>

      {count > 1 && (
        <div className="sd-slideshow__progress" aria-hidden="true">
          <div
            className="sd-slideshow__progress-bar"
            style={{ transform: `scaleX(${progress})` }}
          />
        </div>
      )}
    </div>
  );
}

const SOLUTION_HOWTO_VIDEOS = [
  {
    src: '/siemens/nt-howto1.mp4',
    label: 'Notetaker Assistant how-to — attach script and stand by',
    caption: "Import Notetaker's note",
  },
  {
    src: '/siemens/nt-howto2.mp4',
    label: 'Notetaker Assistant how-to — continue the two-agent workflow',
    caption: 'Review newly found issues',
  },
  {
    src: '/siemens/nt-howto3.mp4',
    label: 'Notetaker Assistant how-to — review findings and evidence',
    caption: 'Review quotes',
  },
  {
    src: '/siemens/nt-howto4.mp4',
    label: 'Notetaker Assistant how-to — extract quotes and wrap up',
    caption: 'Convert to Json',
  },
];

const HOWTO_PROGRESS_STEPS = 4;
const HOWTO_PANEL_COUNT = SOLUTION_HOWTO_VIDEOS.length;

/** Vertical scroll drives a horizontal slide between howto videos */
function SolutionHowToHScroll() {
  const pinRef = useRef(null);
  const trackRef = useRef(null);
  const videoRefs = useRef([]);
  const activeRef = useRef(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const pin = pinRef.current;
    const track = trackRef.current;
    if (!pin || !track) return undefined;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const stackedMq = window.matchMedia('(max-width: 1023px)');
    if (reduceMotion) return undefined;

    const pauseAll = () => {
      videoRefs.current.forEach((video) => {
        if (!video) return;
        video.pause();
      });
    };

    const syncVideos = (index, sectionVisible) => {
      const next = Math.min(HOWTO_PANEL_COUNT - 1, Math.max(0, index));
      activeRef.current = next;

      if (!sectionVisible) {
        pauseAll();
        return;
      }

      videoRefs.current.forEach((video, i) => {
        if (!video) return;
        if (i === next) {
          if (video.paused) {
            const play = video.play();
            if (play?.catch) play.catch(() => {});
          }
        } else if (!video.paused) {
          video.pause();
        }
      });
    };

    const shiftFromProgress = (p) => {
      const n = HOWTO_PANEL_COUNT;
      if (n <= 1) return 0;
      const scaled = Math.max(0, Math.min(1, p)) * (n - 1);
      const i = Math.min(n - 2, Math.floor(scaled));
      const t = scaled - i;
      const a = (i / n) * 100;
      const b = ((i + 1) / n) * 100;
      return a + (b - a) * t;
    };

    const setSnapEnabled = (on) => {
      document.documentElement.classList.toggle('sd-howto-scroll-snap', on && !stackedMq.matches);
    };

    const readProgress = () => {
      const rect = pin.getBoundingClientRect();
      const scrollable = pin.offsetHeight - window.innerHeight;
      if (scrollable <= 0) return 0;
      return Math.min(1, Math.max(0, -rect.top / scrollable));
    };

    const stickyVisible = () => {
      const sticky = pin.querySelector('.sd-howto-hscroll__sticky');
      const el = sticky || pin;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // Play only when the frame is substantially on screen
      return r.top < vh * 0.85 && r.bottom > vh * 0.15;
    };

    const update = () => {
      if (stackedMq.matches) {
        setSnapEnabled(false);
        track.style.transform = 'translate3d(0,0,0)';
        setProgress(0);
        // Mobile: play whichever video is in view via IO below
        return;
      }

      const rect = pin.getBoundingClientRect();
      const vh = window.innerHeight;
      const scrollable = pin.offsetHeight - vh;
      const inSection = rect.top <= vh * 0.55 && rect.bottom >= vh * 0.45;
      const visible = stickyVisible();

      if (scrollable <= 0) {
        syncVideos(0, visible);
        return;
      }
      const p = Math.min(1, Math.max(0, -rect.top / scrollable));
      // Free scroll at the first/last stops so users can leave the section
      const edgePad = 0.5 / Math.max(1, HOWTO_PANEL_COUNT);
      const atFirst = p <= edgePad;
      const atLast = p >= 1 - edgePad;
      setSnapEnabled(inSection && !atFirst && !atLast);

      track.style.transform = `translate3d(-${shiftFromProgress(p)}%, 0, 0)`;
      syncVideos(Math.round(p * (HOWTO_PANEL_COUNT - 1)), visible);
      setProgress(p);
    };

    // Release snap immediately on upward intent at the first thumbnail
    const onWheel = (e) => {
      if (stackedMq.matches) return;
      const p = readProgress();
      if (e.deltaY < 0 && p <= 0.5 / Math.max(1, HOWTO_PANEL_COUNT)) {
        setSnapEnabled(false);
      } else if (e.deltaY > 0 && p >= 1 - 0.5 / Math.max(1, HOWTO_PANEL_COUNT)) {
        setSnapEnabled(false);
      }
    };

    // Stacked / mobile: each clip plays only while intersecting the viewport
    const observers = videoRefs.current.map((video) => {
      if (!video) return null;
      const io = new IntersectionObserver(
        ([entry]) => {
          if (!stackedMq.matches) return;
          if (entry.isIntersecting && entry.intersectionRatio >= 0.45) {
            const play = video.play();
            if (play?.catch) play.catch(() => {});
          } else {
            video.pause();
          }
        },
        { threshold: [0, 0.45, 0.7] }
      );
      io.observe(video);
      return io;
    });

    // Start paused; only play once in view
    pauseAll();
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    window.addEventListener('wheel', onWheel, { passive: true });
    stackedMq.addEventListener?.('change', update);
    return () => {
      setSnapEnabled(false);
      pauseAll();
      observers.forEach((io) => io?.disconnect());
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      window.removeEventListener('wheel', onWheel);
      stackedMq.removeEventListener?.('change', update);
    };
  }, []);

  const activePanel = Math.round(progress * Math.max(1, HOWTO_PANEL_COUNT - 1));
  const activeStep = Math.min(HOWTO_PROGRESS_STEPS, activePanel + 1);
  const fillPct =
    HOWTO_PROGRESS_STEPS <= 1
      ? 100
      : ((activeStep - 1) / (HOWTO_PROGRESS_STEPS - 1)) * 100;
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const pin = pinRef.current;
    if (!pin) return undefined;
    const sticky = pin.querySelector('.sd-howto-hscroll__sticky');
    const target = sticky || pin;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      setInView(true);
      return undefined;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.28) {
          setInView(true);
        }
      },
      { threshold: [0, 0.28, 0.5] }
    );
    io.observe(target);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={pinRef}
      className={`sd-howto-hscroll${inView ? ' sd-howto-hscroll--inview' : ''}`}
      aria-label="Two agents, one workflow — how-to walkthrough"
      style={{ height: `${HOWTO_PANEL_COUNT * 100}svh` }}
    >
      {/* Native y-snap stops — one centered panel per stop (homepage pattern) */}
      <div className="sd-howto-hscroll__snap-rail" aria-hidden="true">
        {SOLUTION_HOWTO_VIDEOS.map((clip) => (
          <div key={clip.src} className="sd-howto-hscroll__snap-stop" />
        ))}
      </div>

      <div className="sd-howto-hscroll__sticky">
        <div className="sd-howto-hscroll__viewport">
          <div
            ref={trackRef}
            className="sd-howto-hscroll__track"
            style={{
              width: `${HOWTO_PANEL_COUNT * 100}%`,
            }}
          >
            {SOLUTION_HOWTO_VIDEOS.map((clip, i) => (
              <figure
                key={clip.src}
                className="sd-journey-figure sd-howto-hscroll__panel"
                style={{
                  flex: `0 0 ${100 / HOWTO_PANEL_COUNT}%`,
                  width: `${100 / HOWTO_PANEL_COUNT}%`,
                }}
              >
                <video
                  ref={(el) => {
                    videoRefs.current[i] = el;
                  }}
                  src={clip.src}
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  aria-label={clip.label}
                />
              </figure>
            ))}
          </div>
        </div>

        <div
          className="sd-howto-progress"
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={HOWTO_PROGRESS_STEPS}
          aria-valuenow={activeStep}
          aria-label={`Step ${String(activeStep).padStart(2, '0')}: ${SOLUTION_HOWTO_VIDEOS[activePanel]?.caption ?? ''}`}
        >
          <div className="sd-howto-progress__caption" aria-live="polite">
            <span className="sd-howto-progress__num" aria-hidden="true">
              <span className="sd-howto-progress__num-tens">0</span>
              <span className="sd-howto-progress__num-ones">
                <span
                  className="sd-howto-progress__num-reel"
                  style={{
                    '--sd-howto-reel-i': activeStep - 1,
                  }}
                >
                  {Array.from({ length: HOWTO_PROGRESS_STEPS }, (_, i) => (
                    <span key={i + 1} className="sd-howto-progress__num-digit">
                      {i + 1}
                    </span>
                  ))}
                </span>
              </span>
            </span>
            <span className="sd-howto-progress__sr">
              {String(activeStep).padStart(2, '0')}
            </span>
            <span key={`t-${activeStep}`} className="sd-howto-progress__title">
              {SOLUTION_HOWTO_VIDEOS[activePanel]?.caption}
            </span>
          </div>

          <div className="sd-howto-progress__bar">
            <div className="sd-howto-progress__track" aria-hidden="true">
              <div
                className="sd-howto-progress__fill"
                style={{ width: `${fillPct}%` }}
              />
            </div>
            <ol className="sd-howto-progress__steps">
              {Array.from({ length: HOWTO_PROGRESS_STEPS }, (_, i) => {
                const step = i + 1;
                const done = step < activeStep;
                const current = step === activeStep;
                return (
                  <li
                    key={step}
                    className={[
                      'sd-howto-progress__step',
                      done ? 'is-done' : '',
                      current ? 'is-current' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    <span className="sd-howto-progress__dot" />
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

const WAFFLE_TOTAL = 100;
const WAFFLE_PURPLE = 82;
const WAFFLE_COLS = 20;

function PainWaffle({ onComplete }) {
  const wrapRef = useRef(null);
  const [lit, setLit] = useState(0);
  const startedRef = useRef(false);
  const completedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return undefined;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || startedRef.current) return;
        startedRef.current = true;
        io.disconnect();

        let i = 0;
        const step = () => {
          i += 1;
          setLit(i);
          if (i < WAFFLE_PURPLE) {
            window.setTimeout(step, 38);
          } else if (!completedRef.current) {
            completedRef.current = true;
            window.setTimeout(() => onCompleteRef.current?.(), 280);
          }
        };
        window.setTimeout(step, 220);
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={wrapRef}
      className={`sd-pain-waffle${lit > 0 ? ' sd-pain-waffle--active' : ''}`}
    >
      <div className="sd-pain-waffle__copy">
        <p className="sd-pain-waffle__stat" aria-live="polite">
          {lit}
          <span className="sd-pain-waffle__stat-unit">%</span>
        </p>
        <p className="sd-pain-waffle__desc">
          reported they didn’t have enough time to capture notes during the
          session
        </p>
      </div>

      <div className="sd-pain-waffle__grid" aria-hidden="true">
        {Array.from({ length: WAFFLE_TOTAL }, (_, i) => {
          const isPurple = i < lit;
          return (
            <span
              key={i}
              className={`sd-pain-waffle__dot${isPurple ? ' sd-pain-waffle__dot--purple' : ''}`}
              style={{ '--i': i % WAFFLE_COLS, '--r': Math.floor(i / WAFFLE_COLS) }}
            />
          );
        })}
      </div>
    </div>
  );
}

/** Animated stock-style sparkline — 8 discrete points, no labels/numbers */
const PAIN_SPARK_VALUES = [48, 72, 28, 64, 18, 81, 35, 55];

function PainSparkline({ ready = false, onComplete }) {
  const wrapRef = useRef(null);
  const pathRef = useRef(null);
  const [drawn, setDrawn] = useState(false);
  const [copyReady, setCopyReady] = useState(false);
  const [litDots, setLitDots] = useState(0);
  const [low, setLow] = useState(16);
  const [high, setHigh] = useState(2);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const completedRef = useRef(false);

  const width = 960;
  const height = 240;
  const padX = 22;
  const padY = 22;
  const n = PAIN_SPARK_VALUES.length;
  const min = Math.min(...PAIN_SPARK_VALUES);
  const max = Math.max(...PAIN_SPARK_VALUES);
  const span = max - min || 1;

  const points = PAIN_SPARK_VALUES.map((v, i) => {
    const x = padX + (i / (n - 1)) * (width - padX * 2);
    const y = height - padY - ((v - min) / span) * (height - padY * 2);
    return { x, y };
  });

  const linePath = points
    .map((p, i) => {
      if (i === 0) return `M ${p.x} ${p.y}`;
      const prev = points[i - 1];
      const c1x = prev.x + (p.x - prev.x) / 2;
      return `C ${c1x} ${prev.y}, ${c1x} ${p.y}, ${p.x} ${p.y}`;
    })
    .join(' ');

  const finish = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    onCompleteRef.current?.();
  }, []);

  useEffect(() => {
    if (!ready) return undefined;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      setDrawn(true);
      setLitDots(n);
      setCopyReady(true);
      setLow(2);
      setHigh(16);
      finish();
      return undefined;
    }
    const id = window.requestAnimationFrame(() => setDrawn(true));
    return () => window.cancelAnimationFrame(id);
  }, [ready, n, finish]);

  useEffect(() => {
    const path = pathRef.current;
    if (!path || !drawn) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    path.style.strokeDasharray = '1';
    path.style.strokeDashoffset = '1';
    path.getBoundingClientRect();
    path.style.strokeDashoffset = '0';

    let i = 0;
    const timers = [];
    const startDots = window.setTimeout(() => {
      const step = () => {
        i += 1;
        setLitDots(i);
        if (i < n) timers.push(window.setTimeout(step, 90));
      };
      step();
    }, 550);
    timers.push(startDots);

    const showCopy = window.setTimeout(() => setCopyReady(true), 1150);
    timers.push(showCopy);

    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [drawn, n]);

  useEffect(() => {
    if (!copyReady) return undefined;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      setLow(2);
      setHigh(16);
      finish();
      return undefined;
    }

    const duration = 900;
    const begin = performance.now();
    let raf = 0;
    const tick = (now) => {
      const progress = Math.min((now - begin) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setLow(Math.round(16 - eased * 14));
      setHigh(Math.round(2 + eased * 14));
      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setLow(2);
        setHigh(16);
        window.setTimeout(finish, 150);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [copyReady, finish]);

  return (
    <div
      ref={wrapRef}
      className={`sd-pain-spark${ready ? ' sd-pain-spark--visible' : ''}${drawn ? ' sd-pain-spark--drawn' : ''}`}
    >
      <div
        className={`sd-pain-spark__chart${ready ? ' sd-pain-spark__chart--visible' : ''}`}
      >
        <svg
          className="sd-pain-spark__svg"
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="xMinYMid meet"
          role="presentation"
          aria-hidden="true"
        >
          <path
            ref={pathRef}
            className="sd-pain-spark__line"
            d={linePath}
            fill="none"
            stroke="#31CDC7"
            strokeWidth="3.9"
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength="1"
            style={{ strokeDasharray: 1, strokeDashoffset: 1 }}
          />

          {points.map((p, i) => {
            const isEnd = i === n - 1;
            const isLit = i < litDots || isEnd;
            return (
              <g
                key={i}
                className={`sd-pain-spark__point${isLit ? ' sd-pain-spark__point--lit' : ''}${isEnd ? ' sd-pain-spark__point--end' : ''}`}
                style={{ '--i': i }}
              >
                <circle
                  className={`sd-pain-spark__dot${isLit ? ' sd-pain-spark__dot--purple' : ''}${isEnd ? ' sd-pain-spark__dot--end' : ''}`}
                  cx={p.x}
                  cy={p.y}
                  r={isEnd ? 18 : 16}
                />
              </g>
            );
          })}
        </svg>
      </div>
      <div
        className={`sd-pain-spark__copy${copyReady ? ' sd-pain-spark__copy--visible' : ''}`}
      >
        <p className="sd-pain-spark__stat" aria-live="polite">
          {low}-{high}
        </p>
        <p className="sd-pain-spark__desc">
          reported they didn’t have enough time to capture notes during the
          session
        </p>
      </div>
    </div>
  );
}

function NotetakerPainVisuals({ onSparkComplete }) {
  const [waffleDone, setWaffleDone] = useState(false);
  return (
    <>
      <PainWaffle onComplete={() => setWaffleDone(true)} />
      <PainSparkline ready={waffleDone} onComplete={onSparkComplete} />
    </>
  );
}

const SCRUM_PAIN_STATS = [
  {
    label: 'Timeliness',
    value: 18,
    unit: 'hours',
    desc: 'on average to conduct a thematically grouping for each Scrum UXers.',
  },
  {
    label: 'Manual Effort',
    value: 100,
    suffix: '+',
    desc: 'reported issues awaiting to be manually reviewed and sorted by one Scrum UXer for each Domain.',
  },
  {
    label: 'Focus',
    value: 40,
    suffix: '%',
    desc: 'Checking back to original testing recording because the note is not sufficient to support.',
  },
];

function ScrumPainStatNumber({ active, value, suffix = '', unit = '', duration = 1100 }) {
  const [display, setDisplay] = useState(0);
  const doneRef = useRef(false);

  useEffect(() => {
    if (!active || doneRef.current) return undefined;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      setDisplay(value);
      doneRef.current = true;
      return undefined;
    }

    const begin = performance.now();
    let raf = 0;
    const tick = (now) => {
      const progress = Math.min((now - begin) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setDisplay(value);
        doneRef.current = true;
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, value, duration]);

  return (
    <p className="sd-scrum-pain__stat">
      <span className="sd-scrum-pain__value">
        {display}
        {suffix}
      </span>
      {unit ? <span className="sd-scrum-pain__unit">{unit}</span> : null}
    </p>
  );
}

function ScrumPainStats({ ready = false }) {
  const wrapRef = useRef(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!ready || started) return undefined;
    const el = wrapRef.current;
    if (!el) return undefined;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setStarted(true);
        io.disconnect();
      },
      {
        // Fire a bit earlier than center — as the block enters the upper mid viewport
        rootMargin: '-22% 0px -40% 0px',
        threshold: 0,
      }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ready, started]);

  return (
    <div
      ref={wrapRef}
      className={`sd-scrum-pain${started ? ' sd-scrum-pain--started' : ''}`}
    >
      {SCRUM_PAIN_STATS.map((stat) => (
        <div
          key={stat.label}
          className={`sd-scrum-pain__col${started ? ' sd-scrum-pain__col--visible' : ''}`}
        >
          <p className="sd-scrum-pain__label">{stat.label}</p>
          <ScrumPainStatNumber
            active={started}
            value={stat.value}
            suffix={stat.suffix}
            unit={stat.unit}
          />
          <p className="sd-scrum-pain__desc">{stat.desc}</p>
        </div>
      ))}
    </div>
  );
}

function PainPointBlock() {
  const [sparkDone, setSparkDone] = useState(false);
  return (
    <div className="sd-pain-subsection">
      <p className="pd-section__label">Pain Point</p>
      <h2 className="pd-section__heading">
        <span className="sd-heading-dark">Notetaker&apos;s Painpoint</span>
      </h2>
      <NotetakerPainVisuals onSparkComplete={() => setSparkDone(true)} />
      <h2 className="pd-section__heading">
        <span className="sd-heading-dark">Scrum UXer&apos;s Painpoint</span>
      </h2>
      <ScrumPainStats ready={sparkDone} />
    </div>
  );
}

/* ── Decimal count-up for the 7.5 rushed score ──
   memo() prevents ANY parent re-render from touching this component,
   so direct DOM mutations in the rAF loop are never overwritten by React.
   Imperative: parent calls .start() to begin.
── */
const StatCountUp = memo(forwardRef(function StatCountUp(
  { target = 7.5, decimals = 1, duration = 1800 },
  ref
) {
  const numRef  = useRef(null);
  const denomRef = useRef(null);
  const startedRef = useRef(false);

  useImperativeHandle(ref, () => ({
    start() {
      if (startedRef.current) return;
      startedRef.current = true;
      const begin = performance.now();
      const tick = (now) => {
        const progress = Math.min((now - begin) / duration, 1);
        const eased    = 1 - Math.pow(1 - progress, 3);
        if (numRef.current) {
          numRef.current.textContent = (eased * target).toFixed(decimals);
        }
        if (progress < 1) {
          requestAnimationFrame(tick);
        } else {
          if (numRef.current) numRef.current.textContent = target.toFixed(decimals);
          if (denomRef.current) {
            denomRef.current.style.opacity   = '1';
            denomRef.current.style.transform = 'translateY(0)';
          }
        }
      };
      requestAnimationFrame(tick);
    },
  }));

  return (
    <span className="sd-stat-number-wrap">
      <span ref={numRef} style={{ fontVariantNumeric: 'tabular-nums' }}>
        {'0.' + '0'.repeat(decimals)}
      </span>
      <span
        ref={denomRef}
        className="sd-stat-denom"
        style={{ opacity: 0, transform: 'translateY(4px)', transition: 'opacity 0.4s ease, transform 0.4s ease' }}
      >
        /10
      </span>
    </span>
  );
}));

/* ── SVG Donut Chart ──
   Segments animate in on `animated=true`.
   Hovering a segment reveals its count in the center.
── */
const CIRC = 2 * Math.PI * 40; // ≈ 251.33

const DONUT_SEGS = [
  { color: '#00BFA5', label: 'Referring back to recording', pct: 36, count: 3 },
  { color: '#E91E8C', label: 'Recording Steps to Reproduce', pct: 27, count: 4 },
  { color: '#5C6BC0', label: 'Top Quotes Capturing', pct: 27, count: 3 },
  { color: '#9C27B0', label: 'Other', pct: 9, count: 1 },
];

const DonutChart = memo(function DonutChart({ animated }) {
  const [revealed, setRevealed] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState(null);

  useEffect(() => {
    if (animated && !revealed) {
      const t = setTimeout(() => setRevealed(true), 80);
      return () => clearTimeout(t);
    }
  }, [animated, revealed]);

  // Precompute geometry — normalize so segments fill exactly 100% of the circle.
  // Gap MUST be (CIRC - dash) so pattern length = CIRC exactly; using CIRC as gap
  // makes pattern length = dash+CIRC which breaks the strokeDashoffset position math.
  const totalPct = DONUT_SEGS.reduce((sum, s) => sum + s.pct, 0);
  let cumOffset = 0;
  const segs = DONUT_SEGS.map((s) => {
    const dash   = (s.pct / totalPct) * CIRC;
    const gap    = CIRC - dash;          // pattern length = dash + gap = CIRC ✓
    const offset = cumOffset;
    cumOffset += dash;
    return { ...s, dash, gap, offset };
  });

  return (
    <svg
      viewBox="0 0 100 100"
      style={{ width: '140px', height: '140px', display: 'block', margin: '0 auto', overflow: 'visible' }}
      aria-label="Donut chart showing issue documentation breakdown"
    >
      <g transform="rotate(-90 50 50)">
        {segs.map((seg, i) => (
          <circle
            key={seg.label}
            cx={50}
            cy={50}
            r={40}
            fill="none"
            stroke={seg.color}
            style={{
              // All animated SVG props in style so CSS transitions fire correctly
              strokeWidth:      hoveredIdx === i ? 20 : 16,
              strokeDasharray:  revealed
                ? `${seg.dash} ${seg.gap}`
                : `0 ${CIRC}`,
              strokeDashoffset: CIRC - seg.offset,
              transition:       `stroke-dasharray 0.8s ease ${i * 0.13}s, stroke-width 0.2s ease`,
              cursor:           'pointer',
            }}
            onMouseEnter={() => setHoveredIdx(i)}
            onMouseLeave={() => setHoveredIdx(null)}
          />
        ))}
      </g>
      {/* Center hole — fill via style so CSS var() resolves correctly */}
      <circle
        cx={50} cy={50} r={29}
        style={{ fill: 'var(--color-bg, #F9F7F4)', pointerEvents: 'none' }}
      />
      {/* Hover: count + label in center */}
      {hoveredIdx !== null && (
        <>
          <text
            x={50} y={46}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={15}
            fontWeight="700"
            style={{ fill: segs[hoveredIdx].color, fontFamily: 'Instrument Sans, Helvetica Neue, Arial, sans-serif', pointerEvents: 'none' }}
          >
            {segs[hoveredIdx].count}
          </text>
          <text
            x={50} y={59}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={7}
            style={{ fill: segs[hoveredIdx].color, fontFamily: 'Instrument Sans, Helvetica Neue, Arial, sans-serif', pointerEvents: 'none' }}
          >
            votes
          </text>
        </>
      )}
    </svg>
  );
});

/* ── Main Component ── */
export default function SiemensDetail() {
  // Landing: header + credits animate in; hero slides up on scroll
  const heroRef = useRef(null);
  const [introReady, setIntroReady] = useState(false);
  const [heroInView, setHeroInView] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setIntroReady(true);
      setHeroInView(true);
      return undefined;
    }
    const t = window.setTimeout(() => setIntroReady(true), 40);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setHeroInView(true);
      return undefined;
    }

    const tryReveal = () => {
      // Only after the user has scrolled — keep landing focused on header/credits
      if (window.scrollY < 8) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      if (rect.top < vh * 0.9 && rect.bottom > vh * 0.08) {
        setHeroInView(true);
        window.removeEventListener('scroll', tryReveal);
      }
    };

    window.addEventListener('scroll', tryReveal, { passive: true });
    return () => window.removeEventListener('scroll', tryReveal);
  }, []);

  // Research Findings section — scroll-triggered animations
  const gapSectionRef = useRef(null);
  const statCountUpRef = useRef(null);
  const [gapAnimated, setGapAnimated] = useState(false);

  useEffect(() => {
    const el = gapSectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setGapAnimated(true);
          statCountUpRef.current?.start();
          obs.disconnect();
        }
      },
      {
        // Negative bottom margin shrinks the observable viewport:
        // the section must be at least 30% up from the viewport bottom
        // before animations fire — well within the user's line of sight.
        rootMargin: '0px 0px -30% 0px',
        threshold: 0,
      }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const project = projects.find((p) => p.slug === 'siemens');
  const currentIndex = projects.findIndex((p) => p.slug === 'siemens');
  const prevProject = currentIndex > 0 ? projects[currentIndex - 1] : projects[projects.length - 1];
  const nextProject = projects.find((p) => p.slug === 'rec-o') || projects[(currentIndex + 1) % projects.length];

  return (
    <>
      <Navbar />
      <TableOfContents
        sections={TOC_SECTIONS}
        projectTitle={project.title}
        accent="#31CDC7"
        autoHideAfterId="sd-scale"
      />

      <main className="project-detail siemens-detail">
        <div className="pd-container">

          {/* ── Header ── */}
          <header
            className={`pd-header sd-intro-block${introReady ? ' is-in' : ''}`}
            id="sd-overview"
          >
            <div className="pd-header__meta">
              <Tag label="UX Research" categoryKey="ux" />
              <span className="pd-header__year">2025</span>
            </div>
            <h1 className="pd-header__title">
              <span className="sd-heading-dark">Siemens</span>{' '}
              <span className="sd-heading-mint">× M365 Copilot</span>
            </h1>
            <p className="pd-header__subtitle">
              Redesigning beta testing infrastructure with AI-assisted research tooling
            </p>
          </header>

          {/* ── Credits ── */}
          <div
            className={`pd-credits sd-intro-block sd-intro-block--delay${introReady ? ' is-in' : ''}`}
          >
            <div className="pd-credits__item">
              <span className="pd-credits__label">Role</span>
              <span className="pd-credits__value">UX Design Intern</span>
            </div>
            <div className="pd-credits__item">
              <span className="pd-credits__label">Company</span>
              <span className="pd-credits__value">Siemens Industry Software Inc.</span>
            </div>
            <div className="pd-credits__item">
              <span className="pd-credits__label">Duration</span>
              <span className="pd-credits__value">3 months — 2025</span>
            </div>
          </div>

          {/* ── Tags ── */}
          <div className="pd-tags">
            {['User Research', 'AI Tooling', 'M365 Copilot', 'Testing Strategy', 'Figma', 'Enterprise UX'].map((tag) => (
              <Tag key={tag} label={tag} categoryKey="default" />
            ))}
          </div>

          {/* ── Hero image — slides up on scroll ── */}
          <div
            ref={heroRef}
            className={`pd-hero-image pd-hero-image--inline sd-hero-slide${heroInView ? ' is-in' : ''}`}
          >
            <img
              src="/siemens/notetaker-ui.png"
              alt="Notetaker Assistant UI — AI-assisted research tooling for beta testing"
              className="pd-hero-img"
            />
          </div>

          {/* ──────────────────────────────────────────
              SECTION 1 — The Scale
              ────────────────────────────────────────── */}
          <section id="sd-scale" className="pd-section">
            <p className="pd-section__label">Context</p>
            <h2 className="pd-section__heading">
              <span className="sd-heading-dark">Beta Testing</span>{' '}
              <span className="sd-heading-mint">Week</span>{' '}
              <span className="sd-heading-dark">at a glance</span>
            </h2>

            <HScroll label="Beta Testing Week context — timeline, users, and pain points">
              <figure className="sd-journey-figure sd-slideshow__item">
                <img
                  src="/siemens/beta-testing-week-overview.png"
                  alt="Beta testing week timeline — Week 1 user testing sessions through Week 2 thematic grouping, prioritization, and reporting"
                  loading="lazy"
                />
              </figure>
              <figure className="sd-journey-figure sd-slideshow__item">
                <img
                  src="/siemens/users-overview.png"
                  alt="Two primary users of Beta Testing Week — Notetakers capturing issues during sessions, and Scrum UXers thematically grouping, prioritizing, and reporting"
                  loading="lazy"
                />
              </figure>
            </HScroll>

            <PainPointBlock />

          </section>

          {/* ──────────────────────────────────────────
              SECTION — Opportunity
              Hidden for now
              ────────────────────────────────────────── */}
          {false && (
          <section id="sd-opportunity" className="pd-section">
            <p className="pd-section__label">Opportunity</p>
            <h2 className="pd-section__heading">
              <span className="sd-heading-dark">Scope</span>
            </h2>
            <figure className="sd-journey-figure">
              <img
                src="/siemens/Howmightwe.png"
                alt="How might we — opportunity framing for the Notetaker and Scrum UXer workflow"
                loading="lazy"
              />
            </figure>
          </section>
          )}

          {/* ──────────────────────────────────────────
              SECTION 2 — The Gap
              Hidden for now — not helpful in current narrative
              ────────────────────────────────────────── */}
          {false && (
          <section id="sd-gap" className="pd-section" ref={gapSectionRef}>
            <p className="pd-section__label">Research Finding</p>
            <h2 className="pd-section__heading">
              <span className="sd-heading-dark">23 notetakers.</span>{' '}
              <span className="sd-heading-mint">A 7.5 out of 10</span>{' '}
              <span className="sd-heading-dark">rushed score.</span>
            </h2>
            <p className="pd-section__body">
              Notetakers self-reported feeling consistently rushed. When we mapped where documentation time was actually going, the picture became clear: notetakers were spending more time reviewing recordings after the fact than capturing issues in the moment. The inconsistency wasn't a skill problem — it was a process and tooling problem.
            </p>

            <div className="sd-gap-grid">
              {/* Left — stat callout */}
              <div className="sd-stat-callout">
                <div className="sd-stat-box">
                  <div className="sd-stat-box__title">Issue Documentation</div>
                  <ul className="sd-stat-box__list">
                    <li>Note down specific description for each documented issue</li>
                    <li>Record user's reaction in testing</li>
                  </ul>
                </div>

                <div className="sd-big-number-block">
                  <div className="sd-big-number-label">On a 1–10 Scale, 23 notetakers averaged a</div>
                  <div className="sd-big-number">
                    <StatCountUp ref={statCountUpRef} target={7.5} decimals={1} duration={1800} />
                  </div>
                  <div className="sd-rushed-label">Rushed Score</div>
                </div>
              </div>

              {/* Middle — donut chart */}
              <div className="sd-donut-wrap">
                <div className="sd-donut-title">Issue Documentation Breakdown</div>
                <DonutChart animated={gapAnimated} />
                <div className="sd-donut-legend">
                  {[
                    { color: '#00BFA5', label: 'Referring back to recording', pct: '36%' },
                    { color: '#E91E8C', label: 'Recording Steps to Reproduce', pct: '27%' },
                    { color: '#5C6BC0', label: 'Top Quotes Capturing', pct: '27%' },
                    { color: '#9C27B0', label: 'Other', pct: '9%' },
                  ].map(({ color, label, pct }) => (
                    <div key={label} className="sd-donut-legend__item">
                      <span className="sd-donut-legend__dot" style={{ background: color }} />
                      <span className="sd-donut-legend__label">{label}</span>
                      <span className="sd-donut-legend__pct">{pct}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right — What We Heard */}
              <div className="sd-right-col">
                <div className="sd-right-col__heading">What We Heard:</div>
                <div className="sd-quote-block">
                  "I did notice that sometimes the user <strong>shares feedback very rapidly and jumps between different points</strong>, that time <strong>it is challenging to capture everything accurately</strong> and I might miss some important comments or insights."
                </div>
                <div>
                  <div className="sd-methods-heading">Data Collection Process</div>
                  <div className="sd-methods-list">
                    <div className="sd-method-pill">In-depth 1-1 Interview</div>
                    <div className="sd-method-pill">Open Ended Surveys</div>
                    <div className="sd-method-pill">Shadowing / Observation</div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          )}

          {/* ──────────────────────────────────────────
              SECTION 3 — Notetaker Assistant
              Hidden for now — not helpful in current narrative
              ────────────────────────────────────────── */}
          {false && (
          <section id="sd-solution-legacy" className="pd-section">
            <p className="pd-section__label">Solution Design</p>
            <h2 className="pd-section__heading">
              <span className="sd-heading-dark">Notetaker</span>{' '}
              <span className="sd-heading-mint">Assistant</span>{' '}
              <span className="sd-heading-dark">— an AI agent for research quality</span>
            </h2>
            <p className="sd-assistant-intro">
              The Notetaker Assistant is a Copilot-powered AI agent that helps UX researchers analyze user testing sessions by extracting usability issues and observations from session transcripts, comparing them with notetaker scripts to identify new findings, and generating positive and negative quotes from the session. The goal: mitigate the quality gap between notetakers of different experience levels.
            </p>

            <figure className="sd-solution-figure">
              <img
                src="/notetaker-assistant-flow.png"
                alt="Notetaker Assistant full process flow — from Stand-By prompt through transcript comparison, issue validation, JSON export, and quote generation"
                className="sd-solution-img"
              />
            </figure>
          </section>
          )}

          {/* ──────────────────────────────────────────
              SECTION 4 — Pain-to-Solution Mapping
              Hidden for now — not helpful in current narrative
              ────────────────────────────────────────── */}
          {false && (
          <section id="sd-mapping" className="pd-section">
            <p className="pd-section__label">Design Rationale</p>
            <h2 className="pd-section__heading">
              <span className="sd-heading-dark">Mapping every</span>{' '}
              <span className="sd-heading-mint">pain point</span>{' '}
              <span className="sd-heading-dark">to a system response</span>
            </h2>
            <p className="pd-section__body">
              Each notetaker pain point identified in the research phase mapped directly to a capability built into the assistant. Nothing was built speculatively — the design was grounded entirely in observed friction.
            </p>

            <div className="sd-mapping-outer">
              <div className="sd-axis-labels">
                <div className="sd-axis-label sd-axis-label--pain">Notetaker's Pain Points →</div>
                <div className="sd-axis-label sd-axis-label--solution">AI Assistant Solution →</div>
              </div>

              <div className="sd-mapping-grid">
                {/* Pain row */}
                <div className="sd-map-card">
                  <div className="sd-map-card__title">Missed Capture Issues</div>
                  <div className="sd-map-card__body">
                    Variation in notetakers' experience results in inconsistent identification and capture of issues across domains.
                  </div>
                </div>
                <div className="sd-map-card sd-map-card--highlight">
                  <div className="sd-map-card__title">Detail Documentation</div>
                  <div className="sd-map-card__body">
                    Notetakers have to constantly refer back to the recording to add more detailed description for critical issues.
                  </div>
                </div>
                <div className="sd-map-card">
                  <div className="sd-map-card__title">Top Quotes Collection</div>
                  <div className="sd-map-card__body">
                    Notetakers indicate a hard time gathering effective quotes to demonstrate users' reactions within testing sessions.
                  </div>
                </div>

                <div className="sd-mapping-divider" />

                {/* Solution row */}
                <div className="sd-map-card">
                  <div className="sd-map-card__title">Transcript Analysis</div>
                  <div className="sd-map-card__body">
                    Assistant will compare issues found in the recorded transcript with notetaker's notes to identify uncaptured issues.
                  </div>
                </div>
                <div className="sd-map-card sd-map-card--highlight">
                  <div className="sd-map-card__title">Issue Description</div>
                  <div className="sd-map-card__body">
                    Assistant will summarize the recorded issues in detail and formalize in a table for quick review by notetakers.
                  </div>
                </div>
                <div className="sd-map-card">
                  <div className="sd-map-card__title">Top Quotes Capturing</div>
                  <div className="sd-map-card__body">
                    Assistant will, based on recurring comments users made throughout the session, provide the top 3 positive and negative quotes.
                  </div>
                </div>
              </div>
            </div>
          </section>
          )}

          {/* ──────────────────────────────────────────
              SECTION — Solution
              ────────────────────────────────────────── */}
          <section id="sd-solution" className="pd-section">
            <p className="pd-section__label">Solution</p>
            <h2 className="pd-section__heading">
              <span className="sd-heading-dark">Two Agents one workflow</span>
            </h2>
            <SolutionHowToHScroll />
          </section>

          {/* ──────────────────────────────────────────
              SECTION 5 — Testing Results
              ────────────────────────────────────────── */}
          <section id="sd-results" className="pd-section">
            <p className="pd-section__label">Results</p>
            <h2 className="pd-section__heading">
              <span className="sd-heading-dark">Found</span>{' '}
              <span className="sd-heading-mint">10/14</span>{' '}
              <span className="sd-heading-dark">effective documented usability issues</span>
            </h2>
            <p className="pd-section__body">
              The assistant was validated against a real testing session. Manual note-taking surfaced 2 effective documented usability issues. The Notetaker Assistant surfaced 8 additional validated issues the notetaker had missed. Results were reviewed and verified by the Scrum Master.
            </p>
            <figure className="sd-journey-figure sd-journey-figure--bare sd-results-overview">
              <img
                src="/siemens/results-overview.png"
                alt="Copilot Generated Issues chart with Human Input, Expert Accepted, and Missed series across 8 participants, alongside the validated issues table — Notetaker Assistant found 8 extra effective usability issues"
                loading="lazy"
              />
            </figure>
          </section>

          {/* ──────────────────────────────────────────
              NEW — Findings Through Testing
              ────────────────────────────────────────── */}
          <section id="sd-findings" className="pd-section">
            <p className="pd-section__label">Iteration</p>
            <h2 className="pd-section__heading">
              <span className="sd-heading-dark">Four findings</span>{' '}
              <span className="sd-heading-mint">that shaped</span>{' '}
              <span className="sd-heading-dark">how the assistant evolved</span>
            </h2>
            <p className="pd-section__body">
              By observing how researchers interacted with the tool — where confusion occurred, how outputs were interpreted, what they trusted and what they questioned — four themes emerged. Each one shifted a piece of the design.
            </p>

            <div className="sd-findings-grid">
              <div className="sd-finding-card">
                <span className="sd-finding-card__num">01</span>
                <span className="sd-finding-card__label">Theme 01</span>
                <h3 className="sd-finding-card__title">Contextualization</h3>
                <p className="sd-finding-card__body">
                  The assistant performed best when given <strong>session-specific context</strong> up front — product area, test goal, persona. Without it, outputs were generic; with it, the assistant pattern-matched closer to how a senior notetaker reads a session.
                </p>
              </div>

              <div className="sd-finding-card">
                <span className="sd-finding-card__num">02</span>
                <span className="sd-finding-card__label">Theme 02</span>
                <h3 className="sd-finding-card__title">Specification</h3>
                <p className="sd-finding-card__body">
                  Vague instructions like <em>"summarize issues"</em> produced inconsistent outputs. <strong>Explicit field schemas</strong> — what counts as an issue, what counts as severity, what counts as a quote — turned a fuzzy task into a deterministic one.
                </p>
              </div>

              <div className="sd-finding-card">
                <span className="sd-finding-card__num">03</span>
                <span className="sd-finding-card__label">Theme 03</span>
                <h3 className="sd-finding-card__title">Verification</h3>
                <p className="sd-finding-card__body">
                  Researchers needed to <strong>see the receipt</strong> — what part of the transcript a finding came from. Adding inline citations and timestamps shifted the assistant from a black box to something a UXer could review and defend.
                </p>
              </div>

              <div className="sd-finding-card">
                <span className="sd-finding-card__num">04</span>
                <span className="sd-finding-card__label">Theme 04</span>
                <h3 className="sd-finding-card__title">Comparative Analysis</h3>
                <p className="sd-finding-card__body">
                  The most useful behavior wasn't the assistant working alone — it was the assistant <strong>diffing its own output against the notetaker's script</strong>, surfacing what neither had on their own. That's where the 4× lift came from.
                </p>
              </div>
            </div>
          </section>

          {/* ──────────────────────────────────────────
              NEW — Notetaker Assistant Benchmark
              ────────────────────────────────────────── */}
          <section id="sd-bench-notetaker" className="pd-section">
            <p className="pd-section__label">Benchmark — Notetaker Assistant</p>
            <h2 className="pd-section__heading">
              <span className="sd-heading-dark">Mitigating experience gaps</span>{' '}
              <span className="sd-heading-mint">between Notetaker–Moderator pairs</span>
            </h2>
            <p className="pd-section__body">
              Benchmarked against the original manual notetaking workflow, the assistant cut session-completion time nearly in half, surfaced 31% more validated issues, and aligned 100% with expert review.
            </p>

            <div className="sd-prod-grid">
              <div className="sd-prod-card">
                <span className="sd-prod-card__label">Without Assistant</span>
                <div>
                  <span className="sd-prod-card__metric">~26</span>
                  <span className="sd-prod-card__unit">&nbsp;minutes</span>
                </div>
                <p className="sd-prod-card__caption">
                  <strong>Complete Notetaker's Script</strong><br />
                  Usability issues capturing · top quotes capturing · debrief with moderator · file session issue · issue counts.
                </p>
                <div className="sd-prod-bar"><div className="sd-prod-bar__fill sd-prod-bar__fill--manual" /></div>
              </div>

              <div className="sd-prod-card sd-prod-card--ai">
                <span className="sd-prod-card__label">With Assistant</span>
                <div>
                  <span className="sd-prod-card__metric">&lt;15</span>
                  <span className="sd-prod-card__unit">&nbsp;minutes</span>
                </div>
                <p className="sd-prod-card__caption">
                  <strong>Complete High-Quality Notetaker's Script</strong><br />
                  Detailed issues capturing · relevant top quotes · issue coverage reassurance · accurate issue counts.
                </p>
                <div className="sd-prod-bar"><div className="sd-prod-bar__fill sd-prod-bar__fill--ai" style={{ width: '58%' }} /></div>
              </div>
            </div>

            <div className="sd-bench-stats">
              <div className="sd-bench-stat">
                <div className="sd-bench-stat__num">100%</div>
                <div className="sd-bench-stat__label">Alignment Rate</div>
                <div className="sd-bench-stat__body">Every issue surfaced by the assistant was confirmed valid by expert reviewers.</div>
              </div>
              <div className="sd-bench-stat sd-bench-stat--ai">
                <div className="sd-bench-stat__num">−47%</div>
                <div className="sd-bench-stat__label">Reduction in time</div>
                <div className="sd-bench-stat__body">Session-completion time cut nearly in half compared to the manual workflow.</div>
              </div>
              <div className="sd-bench-stat">
                <div className="sd-bench-stat__num">+31%</div>
                <div className="sd-bench-stat__label">New Issues Found</div>
                <div className="sd-bench-stat__body">Additional validated usability issues surfaced beyond what the notetaker captured alone.</div>
              </div>
            </div>

            <div className="sd-prod-summary">
              <div className="sd-prod-summary__label">Why it matters</div>
              <div className="sd-prod-summary__text">"Mitigate the experience levels between different pairs of Notetaker and Moderator." — junior pairings now produce documentation on par with senior ones.</div>
            </div>
          </section>

          {/* ──────────────────────────────────────────
              NEW — Scrum UXer Assistant Benchmark
              ────────────────────────────────────────── */}
          <section id="sd-bench-scrum" className="pd-section">
            <p className="pd-section__label">Benchmark — Scrum UXer Assistant</p>
            <h2 className="pd-section__heading">
              <span className="sd-heading-dark">From 18 hours of categorization,</span>{' '}
              <span className="sd-heading-mint">to under 1.</span>
            </h2>
            <p className="pd-section__body">
              For the Scrum UXer's cross-domain analysis, the agent reorganized hundreds of issues into browsable themes in a fraction of the time — while preserving full traceability back to source sessions.
            </p>

            <div className="sd-prod-grid">
              <div className="sd-prod-card">
                <span className="sd-prod-card__label">Without Assistant</span>
                <div>
                  <span className="sd-prod-card__metric">~18</span>
                  <span className="sd-prod-card__unit">&nbsp;hours</span>
                </div>
                <p className="sd-prod-card__caption">
                  <strong>Categorization of Issues</strong><br />
                  Review all issues · organize all issues · identify reoccurring themes manually across 10 product domains.
                </p>
                <div className="sd-prod-bar"><div className="sd-prod-bar__fill sd-prod-bar__fill--manual" /></div>
              </div>

              <div className="sd-prod-card sd-prod-card--ai">
                <span className="sd-prod-card__label">With Assistant</span>
                <div>
                  <span className="sd-prod-card__metric">&lt;1</span>
                  <span className="sd-prod-card__unit">&nbsp;hour</span>
                </div>
                <p className="sd-prod-card__caption">
                  <strong>Categorization with Agent</strong><br />
                  Browsable themes · enables fast filtering · maintains full traceability · smart search for issue targeting.
                </p>
                <div className="sd-prod-bar"><div className="sd-prod-bar__fill sd-prod-bar__fill--ai" style={{ width: '6%' }} /></div>
              </div>
            </div>

            <div className="sd-bench-stats">
              <div className="sd-bench-stat">
                <div className="sd-bench-stat__num">100%</div>
                <div className="sd-bench-stat__label">Alignment Rate</div>
                <div className="sd-bench-stat__body">Every theme produced by the agent matched expert thematic groupings.</div>
              </div>
              <div className="sd-bench-stat sd-bench-stat--ai">
                <div className="sd-bench-stat__num">−98%</div>
                <div className="sd-bench-stat__label">Reduction in time</div>
                <div className="sd-bench-stat__body">From a full sprint of categorization work to under an hour of human review.</div>
              </div>
              <div className="sd-bench-stat">
                <div className="sd-bench-stat__num">+5</div>
                <div className="sd-bench-stat__label">New Themes Found</div>
                <div className="sd-bench-stat__body">Cross-domain themes the agent surfaced that human reviewers had originally missed.</div>
              </div>
            </div>
          </section>

          {/* ──────────────────────────────────────────
              NEW — Overall Productivity Gain
              ────────────────────────────────────────── */}
          <section id="sd-overall-gain" className="pd-section">
            <p className="pd-section__label">Overall Productivity Gain</p>
            <h2 className="pd-section__heading">
              <span className="sd-heading-dark">Two weeks of beta testing,</span>{' '}
              <span className="sd-heading-mint">compressed into days.</span>
            </h2>
            <p className="pd-section__body">
              Stitching the two assistants into the full beta-week pipeline — moderation, notetaking, debrief, categorization, and synthesis — collapsed the timeline from a fortnight of dedicated UX work into a few focused days, freeing researchers to return to their primary projects sooner.
            </p>

            <figure className="sd-journey-figure">
              <img src="/journey-comparison.png" alt="Manual and Automated User Journey Comparison — full pipeline matrix across User Testing Session, Session Debrief, Report, Issue Categorization, and Thematic Categorization." />
              <figcaption>Manual and Automated User Journey Comparison — full beta-week pipeline.</figcaption>
            </figure>
          </section>

          {/* ──────────────────────────────────────────
              NEW — Implementation
              ────────────────────────────────────────── */}
          <section id="sd-implementation" className="pd-section">
            <p className="pd-section__label">Implementation</p>
            <h2 className="pd-section__heading">
              <span className="sd-heading-dark">Rewriting the playbook</span>{' '}
              <span className="sd-heading-mint">for AI legibility</span>
            </h2>
            <p className="pd-section__body">
              To make the assistants reliable, I produced a step-by-step guideline alongside two enhanced research scripts — one for Notetakers, one for Moderators — both restructured so the agents could parse, reference, and cross-check each section without ambiguity.
            </p>
            <p className="pd-section__body">
              Every script follows the same skeleton: <strong>Session Metadata</strong> (filled before the session), <strong>Task Instructions</strong> as standardized prompts, and a <strong>Post-Test Survey</strong>. The Moderator version layers in <strong>Preparation</strong> and <strong>Introduction</strong> blocks. Identical structure across all 10 product domains is what lets the agents output comparable JSON every time.
            </p>

            <HScroll label="Playbook figures">
              <figure className="sd-journey-figure sd-slideshow__item">
                <img src="/impl-scripts-overview.png" alt="Enhanced Scrum UXer Playbook + Notetaker & Moderator scripts — uniform structure across every domain." />
                <figcaption>Enhanced Scrum UXer Playbook + Notetaker &amp; Moderator scripts — uniform structure across every domain.</figcaption>
              </figure>

              <figure className="sd-journey-figure sd-slideshow__item">
                <img src="/impl-playbook-detail.png" alt="Inside the playbook: explicit prompts for the UX Notetakers Helper and JSON Search Agent." />
                <figcaption>Inside the playbook: explicit prompts for the UX Notetakers Helper and JSON Search Agent — researchers follow numbered steps, not prose.</figcaption>
              </figure>
            </HScroll>

            <div className="sd-impl-bullets">
              <div className="sd-impl-bullet">
                <div className="sd-impl-bullet__num">01</div>
                <div className="sd-impl-bullet__title">Standardized prompts</div>
                <div className="sd-impl-bullet__body">Every task instruction is written as a reusable prompt — the assistant receives identical phrasing whether the domain is Change Management or Workflow Tasks.</div>
              </div>
              <div className="sd-impl-bullet">
                <div className="sd-impl-bullet__num">02</div>
                <div className="sd-impl-bullet__title">Numbered, prompt-card workflow</div>
                <div className="sd-impl-bullet__body">The playbook walks researchers through Standby → Compare → JSON Translation step by step, so the assistant flow is reproducible without prompt-engineering knowledge.</div>
              </div>
              <div className="sd-impl-bullet">
                <div className="sd-impl-bullet__num">03</div>
                <div className="sd-impl-bullet__title">One template, ten domains</div>
                <div className="sd-impl-bullet__body">A single Notetaker and Moderator template — researchers only swap in the Domain Name and tasks. Output stays comparable across the entire beta cycle.</div>
              </div>
            </div>
          </section>

          {/* ──────────────────────────────────────────
              SECTION 6 — Impact
              ────────────────────────────────────────── */}
          <section id="sd-impact" className="pd-section">
            <p className="pd-section__label">Impact</p>
            <h2 className="pd-section__heading">
              <span className="sd-heading-dark">What this</span>{' '}
              <span className="sd-heading-mint">unlocked</span>
            </h2>

            <ol className="pd-outcomes">
              {[
                'Notetaker Assistant surfaced 4× more actionable usability issues than manual note-taking alone — validated against real session data',
                'Experience gap between junior and senior notetakers measurably mitigated across 23 contributors spanning 10 product domains',
                'AI-verified issue log adopted as standard handoff format for beta testing outputs to Scrum Masters',
                'Established a replicable research operations framework scalable across the full Siemens product domain structure',
              ].map((outcome, i) => (
                <li key={i} className="pd-outcomes__item">
                  <span className="pd-outcomes__num">{String(i + 1).padStart(2, '0')}</span>
                  <span className="pd-outcomes__text">{outcome}</span>
                </li>
              ))}
            </ol>

            <div className="sd-callout">
              <div className="sd-callout__label">Reflection</div>
              <p className="sd-callout__text">
                "The hardest part wasn't designing the tool — it was convincing a team under deadline pressure that slowing down to validate the research process would save time downstream. Earning that buy-in, as an intern, required making the cost of the current system visible. That's the lesson I carry into every research engagement: the data has to speak before the solution can."
              </p>
            </div>
          </section>

          {/* ──────────────────────────────────────────
              NEW — Reflection & Next Steps
              ────────────────────────────────────────── */}
          <section id="sd-reflection" className="pd-section">
            <p className="pd-section__label">Reflection &amp; Next Steps</p>
            <h2 className="pd-section__heading">
              <span className="sd-heading-dark">AI as a tool,</span>{' '}
              <span className="sd-heading-mint">not a substitute</span>
            </h2>
            <p className="pd-section__body">
              This project reinforced for me that the value of AI is not in full automation, but in how it supports human decision-making. The assistant doesn't <em>understand</em> research goals on its own — its effectiveness depends on the clarity, intent, and judgment of the person using it.
            </p>
            <p className="pd-section__body" style={{ marginTop: 'var(--space-4)' }}>
              Keeping humans in the loop was essential throughout — both to guide the system and to validate its outputs. Framing AI as a tool rather than a self-sufficient solution was what kept it complementing existing workflows instead of replacing them.
            </p>

            <div className="sd-next-steps">
              <h3 className="sd-next-steps__heading">Next steps</h3>
              <div className="sd-next-grid">
                <div className="sd-next-card">
                  <div className="sd-next-card__icon">①</div>
                  <div className="sd-next-card__text"><strong>Publish the research paper</strong>Through Siemens' internal White Paper platform — formalizing the assistant's methodology for other research teams.</div>
                </div>
                <div className="sd-next-card">
                  <div className="sd-next-card__icon">②</div>
                  <div className="sd-next-card__text"><strong>Explore Notebook LMs</strong>As a way to support more flexible analysis and iteration beyond fixed Copilot prompts.</div>
                </div>
                <div className="sd-next-card">
                  <div className="sd-next-card__icon">③</div>
                  <div className="sd-next-card__text"><strong>Refine prompt engineering practices</strong>To improve consistency and reliability of the assistant's outputs across product domains.</div>
                </div>
                <div className="sd-next-card">
                  <div className="sd-next-card__icon">④</div>
                  <div className="sd-next-card__text"><strong>Build training &amp; onboarding resources</strong>So researchers across the org can use the assistant effectively without prompt-engineering expertise.</div>
                </div>
              </div>
            </div>
          </section>

        </div>

        {/* ── Next / Prev navigation ── */}
        <NextProjectBanner nextProject={nextProject} prevProject={prevProject} />
      </main>
    </>
  );
}
