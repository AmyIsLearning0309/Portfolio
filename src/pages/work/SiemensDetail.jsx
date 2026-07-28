import { useEffect, useRef, useImperativeHandle, forwardRef, useState, memo } from 'react';
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
  { id: 'sd-scale', label: 'The Scale' },
  { id: 'sd-pain-points', label: 'Pain Points' },
  // { id: 'sd-gap', label: 'The Gap' }, // Hidden for now
  // { id: 'sd-solution', label: 'The Solution' }, // Hidden for now
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

/** Collapsed-by-default detail block — Expand / Show less */
function Expandable({
  children,
  moreLabel = 'Expand to see the full process',
  lessLabel = 'Show less',
  onOpenChange,
}) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);
  const panelId = useRef(`sd-expand-${Math.random().toString(36).slice(2, 9)}`).current;

  useEffect(() => {
    if (!open || !panelRef.current) return undefined;
    // Kick scroll-linked reveals now that the panel has layout
    window.dispatchEvent(new Event('scroll'));
    return undefined;
  }, [open]);

  return (
    <div className={`sd-expand${open ? ' is-open' : ''}`}>
      <div
        id={panelId}
        ref={panelRef}
        className="sd-expand__panel"
        hidden={!open}
      >
        {children}
      </div>
      <button
        type="button"
        className="sd-expand__toggle"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => {
          const next = !open;
          setOpen(next);
          onOpenChange?.(next);
        }}
      >
        <span className="sd-expand__toggle-label">
          {open ? lessLabel : moreLabel}
        </span>
        <span className="sd-expand__chevron" aria-hidden="true" />
      </button>
    </div>
  );
}

/** Side-by-side figures — horizontal swipe OK; vertical wheel always scrolls the page */
function HScroll({ children, label }) {
  const ref = useRef(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    const updateProgress = () => {
      const max = el.scrollWidth - el.clientWidth;
      setProgress(max > 0 ? Math.min(1, Math.max(0, el.scrollLeft / max)) : 0);
    };

    // Overflow-x containers can swallow vertical wheel/trackpad gestures.
    // Forward primarily-vertical input to the page so scroll never feels stuck.
    const onWheel = (e) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      e.preventDefault();
      window.scrollBy(0, e.deltaY);
    };

    updateProgress();
    el.addEventListener('scroll', updateProgress, { passive: true });
    el.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('resize', updateProgress);

    return () => {
      el.removeEventListener('scroll', updateProgress);
      el.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', updateProgress);
    };
  }, []);

  return (
    <div className="sd-hscroll-wrap">
      <div
        ref={ref}
        className="sd-hscroll"
        tabIndex={0}
        aria-label={label}
      >
        <div className="sd-hscroll__track">{children}</div>
      </div>
      <div
        className="sd-hscroll__progress"
        role="progressbar"
        aria-label="Horizontal scroll progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress * 100)}
      >
        <div
          className="sd-hscroll__progress-bar"
          style={{ transform: `scaleX(${Math.max(progress, 0.04)})` }}
        />
      </div>
    </div>
  );
}

/* ── Count-up number component ──
   Imperative: parent calls countUpRef.current.start() to begin.
   Counts 0 → target with ease-out cubic, then crossfades to rangeLabel.
── */
const CountUp = forwardRef(function CountUp(
  { target, suffix = '', duration = 1800, rangeLabel = null },
  ref
) {
  const numRef = useRef(null);
  const rangeRef = useRef(null);
  const startedRef = useRef(false);

  useImperativeHandle(ref, () => ({
    start() {
      if (startedRef.current) return;
      startedRef.current = true;
      const numEl = numRef.current;
      if (!numEl) return;
      const begin = performance.now();
      const tick = (now) => {
        const progress = Math.min((now - begin) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        numEl.textContent = Math.round(eased * target) + suffix;
        if (progress < 1) {
          requestAnimationFrame(tick);
        } else {
          // Count done — crossfade to range label
          if (rangeRef.current) {
            rangeRef.current.style.opacity = '1';
            numEl.style.opacity = '0';
          }
        }
      };
      requestAnimationFrame(tick);
    },
  }));

  return (
    <span style={{ position: 'relative', display: 'inline-block' }}>
      <span ref={numRef} style={{ transition: 'opacity 0.4s ease' }}>
        0{suffix}
      </span>
      {rangeLabel && (
        <span
          ref={rangeRef}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            opacity: 0,
            transition: 'opacity 0.4s ease',
            whiteSpace: 'nowrap',
          }}
        >
          {rangeLabel}
        </span>
      )}
    </span>
  );
});

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

/* ── Scroll-speed-linked flow animation hook ──
   Maps scroll progress → step index 0–8.
   At step 8, fires countUpRefs to start count-up animations.
   `enabled` gates listening so collapsed expand panels don't
   complete the sequence while display:none (zero height).
── */
function useScrollFlow(wrapRef, countUpRefs, enabled = true) {
  const doneRef = useRef(false);
  const countUpFiredRef = useRef(false);

  useEffect(() => {
    if (!enabled) return undefined;

    const wrap = wrapRef.current;
    if (!wrap) return undefined;

    doneRef.current = false;
    countUpFiredRef.current = false;
    wrap.dataset.step = '-1';

    const TOTAL_STEPS = 9;

    const onScroll = () => {
      if (doneRef.current) return;

      const rect = wrap.getBoundingClientRect();
      // Ignore while collapsed / not laid out
      if (rect.height < 8) return;

      const vh = window.innerHeight;

      const progress = Math.max(
        0,
        Math.min(1, (vh - rect.top) / (rect.height + vh * 0.4))
      );

      const step = Math.floor(progress * TOTAL_STEPS);
      wrap.dataset.step = step;

      // Fire count-ups the moment step 8 is reached
      if (step >= 8 && !countUpFiredRef.current) {
        countUpFiredRef.current = true;
        countUpRefs.forEach((r) => r.current?.start());
      }

      if (step >= TOTAL_STEPS - 1) {
        doneRef.current = true;
        wrap.dataset.step = TOTAL_STEPS - 1;
        window.removeEventListener('scroll', onScroll, { passive: true });
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll, { passive: true });
  }, [wrapRef, countUpRefs, enabled]);
}

/* ── Main Component ── */
export default function SiemensDetail() {
  const flowRef = useRef(null);
  const countUpTopRef = useRef(null);
  const countUpBottomRef = useRef(null);
  const flowCountUpRefs = useRef([countUpTopRef, countUpBottomRef]);
  const [flowExpanded, setFlowExpanded] = useState(false);
  useScrollFlow(flowRef, flowCountUpRefs.current, flowExpanded);

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
  const nextProject = currentIndex < projects.length - 1 ? projects[currentIndex + 1] : projects[0];

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
              <span className="sd-heading-dark">— at enterprise scale</span>
            </h2>

            <HScroll label="Beta Testing Week context — scroll horizontally for timeline and users">
              <figure className="sd-journey-figure sd-hscroll__item">
                <img
                  src="/siemens/beta-testing-week-overview.png"
                  alt="Beta testing week timeline — Week 1 user testing sessions through Week 2 thematic grouping, prioritization, and reporting"
                  loading="lazy"
                />
              </figure>
              <figure className="sd-journey-figure sd-hscroll__item">
                <img
                  src="/siemens/users-overview.png"
                  alt="Two primary users of Beta Testing Week — Notetakers capturing issues during sessions, and Scrum UXers thematically grouping, prioritizing, and reporting"
                  loading="lazy"
                />
              </figure>
            </HScroll>

            <p className="pd-section__body">
              Each beta testing week spanned 10 product domains with 6–8 user testing sessions per domain. Every session required a moderator and a dedicated notetaker. Across both weeks the coordinated effort totaled between <strong>346–433 hours</strong> — a significant investment that depended entirely on the quality of what notetakers documented.
            </p>

            <Expandable onOpenChange={setFlowExpanded}>
              {/* Animated process flow — scroll-speed linked */}
              <div className="sd-card-wrap sd-flow-wrap" ref={flowRef} data-step="-1">

                {/* Top hour callout — appears at step 8 */}
                <div className="sd-hour-callout sd-step" data-show-at="8">
                  Total of <strong><CountUp ref={countUpTopRef} target={433} suffix=" hrs" duration={1600} rangeLabel="346–433 hrs" /></strong>
                </div>

                {/* Row 1 */}
                <div className="sd-process-week">
                  <div className="sd-week-label">1st Week</div>
                  <div className="sd-flow-row">
                    {/* Box 1 — step 0 */}
                    <div className="sd-flow-box sd-step" data-show-at="0">
                      <div className="sd-flow-box__title">User Testing Sessions</div>
                      <ul className="sd-flow-box__list">
                        <li>10 Domains</li>
                        <li>6–8 testing sessions for each Domain</li>
                        <li>Each session requires a moderator and a notetaker</li>
                      </ul>
                    </div>
                    <div className="sd-flow-arrow sd-step" data-show-at="0">→</div>
                    {/* Box 2 (highlight) — step 1 */}
                    <div className="sd-flow-box sd-flow-box--highlight sd-step sd-step--highlight" data-show-at="1">
                      <div className="sd-flow-box__title">Issue Documentation</div>
                      <ul className="sd-flow-box__list">
                        <li>Note down specific description for each documented issue</li>
                        <li>Record user's reaction in testing</li>
                      </ul>
                    </div>
                    <div className="sd-flow-arrow sd-step" data-show-at="1">→</div>
                    {/* Box 3 — step 2 */}
                    <div className="sd-flow-box sd-step" data-show-at="2">
                      <div className="sd-flow-box__title">Issue Severity Level</div>
                      <ul className="sd-flow-box__list">
                        <li>Assign severity levels to each of the issues</li>
                        <li>Record Issues on shared document for issue overview</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Right-side ↓ connector — step 3 */}
                <div className="sd-row-connector sd-step" data-show-at="3" aria-hidden="true">
                  <div className="sd-row-connector__inner">↓</div>
                </div>

                {/* Row 2 — reversed flow, reveals right-to-left (Transfer first = step 4) */}
                <div className="sd-process-week" style={{ marginTop: 0 }}>
                  <div className="sd-week-label sd-week-label--dashed">2nd Week</div>
                  <div className="sd-flow-row">
                    {/* Box 4 (Report to PM) — step 6, leftmost = last to appear */}
                    <div className="sd-flow-box sd-step" data-show-at="6">
                      <div className="sd-flow-box__title">Report to PM</div>
                      <ul className="sd-flow-box__list">
                        <li>Report all reoccurring themes of issue</li>
                      </ul>
                    </div>
                    <div className="sd-flow-arrow sd-flow-arrow--left sd-step" data-show-at="6">→</div>
                    {/* Box 5 (highlight) — step 5 */}
                    <div className="sd-flow-box sd-flow-box--highlight sd-step sd-step--highlight" data-show-at="5">
                      <div className="sd-flow-box__title">Thematically Grouping Domain Issues</div>
                      <ul className="sd-flow-box__list">
                        <li>Categorize similar issues under same themes</li>
                        <li>Prioritize reoccurring issues</li>
                        <li>Report thematically on to Horizon</li>
                      </ul>
                    </div>
                    <div className="sd-flow-arrow sd-flow-arrow--left sd-step" data-show-at="5">→</div>
                    {/* Box 6 (Transfer of Issues) — step 4, rightmost = first to appear */}
                    <div className="sd-flow-box sd-step" data-show-at="4">
                      <div className="sd-flow-box__title">Transfer of Issues</div>
                      <ul className="sd-flow-box__list">
                        <li>Identify issues that fall under other Domains</li>
                        <li>Report to responsible Scrum UXers</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Bottom hour callout — step 8 */}
                <div className="sd-hour-callout sd-hour-callout--bottom sd-step" data-show-at="8">
                  Total of <strong><CountUp ref={countUpBottomRef} target={216} suffix=" hrs" duration={1400} rangeLabel="180–216 hrs" /></strong>
                </div>

              </div>
            </Expandable>
          </section>

          {/* ──────────────────────────────────────────
              SECTION — Pain Points
              Figma: Presentation → Slide 16:9 - 58 (2588:307) Notetakers
                                    Slide 16:9 - 82 (2593:1092) Scrum UXers
              ────────────────────────────────────────── */}
          <section id="sd-pain-points" className="pd-section">
            <p className="pd-section__label">Pain Points</p>
            <h2 className="pd-section__heading">
              <span className="sd-heading-dark">Notetakers and</span>{' '}
              <span className="sd-heading-mint">Scrum UXers</span>{' '}
              <span className="sd-heading-dark">— different roles, shared friction</span>
            </h2>

            <p className="pd-section__body">
              Notetakers felt the squeeze in-session: <strong>19 of 23</strong> lacked time to capture notes, spent <strong>+26 minutes</strong> after each hour filling blanks, and logged anywhere from <strong>2–16</strong> issues per session. Scrum UXers absorbed the downstream cost — <strong>18 hours</strong> of thematic grouping, <strong>100+</strong> issues awaiting manual review, and <strong>40%</strong> of focus spent checking recordings when notes weren’t enough.
            </p>

            <HScroll label="Pain points — scroll horizontally for Notetakers and Scrum UXers">
              <figure className="sd-journey-figure sd-hscroll__item">
                <img
                  src="/siemens/pain-points-notetakers.png"
                  alt="Notetaker pain points — Time Pressure (19 of 23 lacked time to capture notes), The Workaround (+26 minutes after each hour-long session), and The Payoff Gap (2–16 issues captured per session)"
                  loading="lazy"
                />
              </figure>
              <figure className="sd-journey-figure sd-hscroll__item">
                <img
                  src="/siemens/pain-points-overview.png"
                  alt="Scrum UXer pain points — Timeliness (18 hours for thematic grouping), Manual Effort (100+ issues awaiting review), and Focus (40% checking recordings because notes were insufficient)"
                  loading="lazy"
                />
              </figure>
            </HScroll>
          </section>

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
          <section id="sd-solution" className="pd-section">
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
              SECTION 5 — Testing Results
              ────────────────────────────────────────── */}
          <section id="sd-results" className="pd-section">
            <p className="pd-section__label">Validation</p>
            <h2 className="pd-section__heading">
              <span className="sd-heading-dark">Found</span>{' '}
              <span className="sd-heading-mint">10/14</span>{' '}
              <span className="sd-heading-dark">effective documented usability issues</span>
            </h2>
            <p className="pd-section__body">
              The assistant was validated against a real testing session. Manual note-taking surfaced 2 effective documented usability issues. The Notetaker Assistant surfaced 8 additional validated issues the notetaker had missed. Results were reviewed and verified by the Scrum Master.
            </p>

            <figure className="sd-journey-figure sd-results-overview">
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

            <HScroll label="Playbook figures — scroll horizontally">
              <figure className="sd-journey-figure sd-hscroll__item">
                <img src="/impl-scripts-overview.png" alt="Enhanced Scrum UXer Playbook + Notetaker & Moderator scripts — uniform structure across every domain." />
                <figcaption>Enhanced Scrum UXer Playbook + Notetaker &amp; Moderator scripts — uniform structure across every domain.</figcaption>
              </figure>

              <figure className="sd-journey-figure sd-hscroll__item">
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
