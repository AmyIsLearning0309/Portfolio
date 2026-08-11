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
  { id: 'ro-architecture', label: 'System Architecture' },
  { id: 'ro-form-collapse', label: 'Form & Iterations' },
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

/** Animated expand/collapse for Form Inspiration + Iterations */
function FormIterationsDisclosure({ children }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      id="ro-form-collapse"
      className={`pd-section ro-disclosure${open ? ' is-open' : ''}`}
    >
      <button
        type="button"
        className="ro-disclosure__summary"
        aria-expanded={open}
        aria-controls="ro-form-collapse-panel"
        onClick={() => setOpen((v) => !v)}
      >
        More Iterations &amp; testing
      </button>
      <div
        id="ro-form-collapse-panel"
        className="ro-disclosure__clip"
        role="region"
        aria-hidden={!open}
      >
        <div className="ro-disclosure__body">{children}</div>
      </div>
    </div>
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
    index: '02 Review Insights',
    body:
      'See highlights, names mentioned, and questions left unanswered from the conversation.',
  },
  {
    src: '/rec-o/Reco2.0-followup.mp4',
    label: 'Rec Highlight tab looping preview',
    index: '03 Collaborate on a Follow-up',
    body:
      'Work with the agent to write a follow-up that feels personal and helps maintain the connection.',
  },
  {
    src: '/rec-o/Reco2.0-participant.mp4',
    label: 'Rec Transcript tab looping preview',
    index: '04 Save the Contact',
    body:
      'Add the connection to your contacts so the next conversation can happen.',
  },
];

function StickyInsightClips({ clips }) {
  const [active, setActive] = useState(0);
  const [inView, setInView] = useState(true);
  const stackRef = useRef(null);
  const clipRefs = useRef([]);

  useEffect(() => {
    const stack = stackRef.current;
    if (!stack) return undefined;

    const updateActive = () => {
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
          </div>
        ))}
      </div>
      <div className="ro-gif-feature-stack__rail" aria-hidden={!showCopy}>
        <aside
          className={`ro-gif-feature-stack__copy${showCopy ? '' : ' ro-gif-feature-stack__copy--hidden'}`}
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

          <section id="ro-rec" className="pd-section ro-reveal">
            <p className="pd-section__label">REC · Software</p>
          </section>

          <div className="ro-gif-row">
            <StickyInsightClips clips={REC_INSIGHT_CLIPS} />
          </div>

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
            <h2 className="pd-section__heading reco-feature-flow__heading">
              Your network, organized your way
            </h2>
            <div className="ro-pair ro-pair--equal ro-pair--contact">
              <LoopClip
                src="/rec-o/reco2.0-contact.mp4"
                label="Rec contact session looping preview"
                plain
              />
              <CaseImage
                src="/rec-o/frequent.png"
                alt="Frequent contacts from conversations you can follow up with later"
                frame="white"
              />
            </div>
          </section>

          {/* ── Architecture ── */}
          <section id="ro-architecture" className="pd-section ro-reveal">
            <p className="pd-section__label">Developement</p>
            <h2 className="pd-section__heading">Iterations</h2>
            <div className="ro-pair ro-pair--stack">
              <CaseImage
                src="/rec-o/reco-ui-iteration.png"
                alt="REC UI iterations — wireframe to high-fidelity home screen"
                frame="white"
              />
            </div>
          </section>

          {/* ── Form Inspiration + Iterations (collapsed) ── */}
          <FormIterationsDisclosure>
            <section id="ro-form" className="pd-section">
              <p className="pd-section__label">Form Inspiration</p>
              <h2 className="pd-section__heading">Technology as Accessory</h2>
            </section>

            <section id="ro-flow-iterations" className="pd-section">
              <div className="ro-pair ro-pair--stack">
                <CaseImage
                  src="/rec-o/reco-iteration-home.png"
                  alt="Iterating user flow — REC app screens across design iterations"
                />
                <CaseImage
                  src="/rec-o/reco-userflow.png"
                  alt="REC user flow diagram across screens"
                  frame="white"
                  wide
                />
              </div>
            </section>
          </FormIterationsDisclosure>

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
