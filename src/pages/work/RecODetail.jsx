import { useEffect, useRef, useState } from 'react';
import Navbar from '../../components/layout/Navbar';
import Tag from '../../components/ui/Tag';
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
  { id: 'ro-method', label: 'Approach' },
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

/** Scroll reveal still — left→right wipe when the figure enters view */
function FeatureFlowImage({ src, alt, variant = 'flow' }) {
  const ref = useRef(null);

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
      className={`ro-media reco-feature-flow reco-feature-flow--${variant}`}
    >
      <div className="ro-media__frame ro-media__frame--white">
        <img src={src} alt={alt} loading="lazy" />
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
        Click to see Form Inspiration &amp; Iterations
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

const REC_FEATURE_CLIPS = [
  { src: '/rec-o/reco2.0-contact.mp4', label: 'Rec contact session looping preview' },
  { src: '/rec-o/Reco2.0-followup.mp4', label: 'Rec Highlight tab looping preview' },
  { src: '/rec-o/Reco2.0-participant.mp4', label: 'Rec Transcript tab looping preview' },
];

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
            <LoopClip
              src="/rec-o/reco2.0-recording.mp4"
              label="REC-O wearable pin and coaching app"
              phone
            />
            <a
              className="ro-try-link"
              href={LIVE_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Try it <span className="ro-try-link__arrow" aria-hidden="true">↗</span>
            </a>
          </div>

          {/* ── Header + credits ── */}
          <div className="ro-intro" id="ro-overview">
            <header className="pd-header">
              <div className="pd-header__meta">
                <Tag label="Shipped" categoryKey="ux" />
                <Tag label="0-1 Product" categoryKey="ux" />
                <span className="pd-header__year">{project.year}</span>
              </div>
              <h1 className="pd-header__title">
                <a
                  className="ro-title-link"
                  href={LIVE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  REC-O
                </a>
              </h1>
              <p className="pd-header__subtitle">
                Pairs with a wearable clip that turns casual, in{'\u2011'}person
                conversations into relationships you actually keep tracks and take
                actions follow through on.
              </p>
            </header>

            <div className="pd-credits">
              <div className="pd-credits__item">
                <span className="pd-credits__label">Role</span>
                <span className="pd-credits__value">
                  Journey Owner · UX Researcher · UI Designer · Developer
                </span>
              </div>
              <div className="pd-credits__item">
                <span className="pd-credits__label">Tools</span>
                <span className="pd-credits__value">Claude · Figma · VS Code</span>
              </div>
              <div className="pd-credits__item">
                <span className="pd-credits__label">Deliverables</span>
                <span className="pd-credits__value">
                  Audio Recording Hardware · iOS App (WIP)
                </span>
              </div>
            </div>
          </div>

          {/* ── Approach / Method ── */}
          <section id="ro-method" className="pd-section ro-reveal">
            <p className="pd-section__label">Approach</p>
            <h2 className="pd-section__heading">Method</h2>
            <MethodLoop />
          </section>

          {/* ── REC Software ── */}
          <section id="ro-rec" className="pd-section ro-reveal">
            <p className="pd-section__label">REC · Software</p>
            <h2 className="pd-section__heading">Tailored to every conversation</h2>
            <div className="ro-gif-row">
              {REC_FEATURE_CLIPS.map((clip) => (
                <LoopClip key={clip.src} src={clip.src} label={clip.label} />
              ))}
            </div>
          </section>

          {/* ── O Hardware ── */}
          <section id="ro-hardware" className="pd-section ro-reveal">
            <p className="pd-section__label">O · Hardware</p>
            <h2 className="pd-section__heading">Paired up with hardware, record anytime</h2>
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
                <FeatureFlowImage
                  src="/rec-o/reco-featurepage.png"
                  alt="REC feature pages across Capture, Structure, and Note"
                />
              </div>
              <RecoFollowUpGraph />
            </div>
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
            <p className="pd-section__label">Developement</p>
            <h2 className="pd-section__heading">Iterations</h2>
            <div className="ro-pair ro-pair--stack">
              <CaseImage
                src="/rec-o/reco-ui-iteration.png"
                alt="REC UI iterations — wireframe to high-fidelity home screen"
                frame="white"
              />
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

          {/* ── Form Inspiration + Iterations (collapsed) ── */}
          <FormIterationsDisclosure>
            <section id="ro-form" className="pd-section">
              <p className="pd-section__label">Form Inspiration</p>
              <h2 className="pd-section__heading">Technology as Accessory</h2>
              <CaseImage
                src="/rec-o/form-inspiration.jpg"
                alt="Form studies and material inspiration for the REC-O pin"
                wide
              />
            </section>

            <section id="ro-prototypes" className="pd-section">
              <CaseImage
                src="/rec-o/prototypes-1.png"
                alt="Hardware prototype iterations — size and layout studies"
                wide
              />
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
