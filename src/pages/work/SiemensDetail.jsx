import { useEffect, useRef, useImperativeHandle, forwardRef, useState, memo } from 'react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
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
  { id: 'sd-gap', label: 'The Gap' },
  { id: 'sd-solution', label: 'The Solution' },
  { id: 'sd-mapping', label: 'Pain Mapping' },
  { id: 'sd-results', label: 'Results' },
  { id: 'sd-impact', label: 'Impact' },
];

/* ── SVG Line Chart ── */
function ResultsChart() {
  const W = 480;
  const H = 260;
  const padLeft = 48;
  const padRight = 20;
  const padTop = 20;
  const padBottom = 40;
  const chartW = W - padLeft - padRight;
  const chartH = H - padTop - padBottom;

  const participants = [1, 2, 3, 4, 5, 6, 7, 8];
  const humanInput =     [23, 20, 15, 10, 14, 12, 11, 9];
  const expertAccepted = [20, 18, 10, 14,  5, 12, 10, 9];
  const missed =         [ 0,  0,  0,  0,  0,  0,  0, 0];

  const maxY = 25;
  const yTicks = [0, 5, 10, 15, 20, 25];

  const xPos = (i) => padLeft + (i / (participants.length - 1)) * chartW;
  const yPos = (v) => padTop + chartH - (v / maxY) * chartH;

  const toPoints = (data) =>
    data.map((v, i) => `${xPos(i)},${yPos(v)}`).join(' ');

  /* annotation box helper */
  const Annotation = ({ x, y, width, children, color }) => (
    <foreignObject x={x} y={y} width={width} height={60}>
      <div
        xmlns="http://www.w3.org/1999/xhtml"
        style={{
          fontSize: '9px',
          lineHeight: 1.4,
          color: '#1d1d1f',
          background: 'rgba(255,255,255,0.92)',
          border: `1.5px solid ${color}`,
          borderRadius: '6px',
          padding: '5px 7px',
        }}
      >
        {children}
      </div>
    </foreignObject>
  );

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      style={{ width: '100%', height: 'auto', overflow: 'visible' }}
      aria-label="Line chart: Copilot Generated Issues per participant"
    >
      {/* Y axis lines */}
      {yTicks.map((tick) => (
        <g key={tick}>
          <line
            x1={padLeft}
            x2={W - padRight}
            y1={yPos(tick)}
            y2={yPos(tick)}
            stroke="rgba(0,0,0,0.07)"
            strokeWidth="1"
          />
          <text
            x={padLeft - 6}
            y={yPos(tick) + 4}
            textAnchor="end"
            fontSize="10"
            fill="#86868b"
          >
            {tick}
          </text>
        </g>
      ))}

      {/* X axis labels */}
      {participants.map((p, i) => (
        <text
          key={p}
          x={xPos(i)}
          y={padTop + chartH + 20}
          textAnchor="middle"
          fontSize="10"
          fill="#86868b"
        >
          {p}
        </text>
      ))}

      {/* Axis titles */}
      <text
        x={padLeft - 36}
        y={padTop + chartH / 2}
        textAnchor="middle"
        fontSize="9"
        fill="#86868b"
        transform={`rotate(-90, ${padLeft - 36}, ${padTop + chartH / 2})`}
      >
        Count of Issues
      </text>
      <text
        x={padLeft + chartW / 2}
        y={H - 4}
        textAnchor="middle"
        fontSize="9"
        fill="#86868b"
      >
        Participants
      </text>

      {/* Missed line (red/pink, flat at 0) */}
      <polyline
        points={toPoints(missed)}
        fill="none"
        stroke="#D0368A"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {missed.map((v, i) => (
        <circle key={i} cx={xPos(i)} cy={yPos(v)} r="3" fill="#D0368A" />
      ))}

      {/* Human Input line (dashed grey) */}
      <polyline
        points={toPoints(humanInput)}
        fill="none"
        stroke="#888888"
        strokeWidth="2"
        strokeDasharray="6 4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {humanInput.map((v, i) => (
        <circle key={i} cx={xPos(i)} cy={yPos(v)} r="3" fill="#888888" />
      ))}

      {/* Expert Accepted line (dark green — matches slide) */}
      <polyline
        points={toPoints(expertAccepted)}
        fill="none"
        stroke="#2C8B5E"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {expertAccepted.map((v, i) => (
        <circle key={i} cx={xPos(i)} cy={yPos(v)} r="3.5" fill="#2C8B5E" />
      ))}

      {/* Annotations */}
      <Annotation x={xPos(4)} y={yPos(14) - 72} width={165} color="#2C8B5E">
        <span>Notetaker Assistant found <strong>8 extra</strong> effective documented usability issues</span>
      </Annotation>
      <Annotation x={xPos(4)} y={yPos(3) + 8} width={165} color="#888888">
        <span>Manual note taking found <strong>2</strong> effective documented usability issues</span>
      </Annotation>

      {/* Leader lines */}
      <line
        x1={xPos(6)} y1={yPos(12)} x2={xPos(6)} y2={yPos(12) - 10}
        stroke="#2C8B5E" strokeWidth="1" strokeDasharray="3 2"
      />
    </svg>
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
            style={{ fill: segs[hoveredIdx].color, fontFamily: 'Inter, sans-serif', pointerEvents: 'none' }}
          >
            {segs[hoveredIdx].count}
          </text>
          <text
            x={50} y={59}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={7}
            style={{ fill: segs[hoveredIdx].color, fontFamily: 'Inter, sans-serif', pointerEvents: 'none' }}
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
── */
function useScrollFlow(wrapRef, countUpRefs) {
  const doneRef = useRef(false);
  const countUpFiredRef = useRef(false);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const TOTAL_STEPS = 9;

    const onScroll = () => {
      if (doneRef.current) return;

      const rect = wrap.getBoundingClientRect();
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
  }, [wrapRef, countUpRefs]);
}

/* ── Main Component ── */
export default function SiemensDetail() {
  const flowRef = useRef(null);
  const countUpTopRef = useRef(null);
  const countUpBottomRef = useRef(null);
  useScrollFlow(flowRef, [countUpTopRef, countUpBottomRef]);

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
      <TableOfContents sections={TOC_SECTIONS} projectTitle={project.title} />

      <main className="project-detail siemens-detail">
        <div className="pd-container">

          {/* ── Hero ── */}
          <div className="pd-hero-image">
            <img
              src="/siemens-hero.jpg"
              alt="Siemens × M365 Copilot — Where Workflows meet Intelligence"
              className="pd-hero-img"
            />
          </div>

          {/* ── Header ── */}
          <header className="pd-header" id="sd-overview">
            <div className="pd-header__meta">
              <Tag label="UX Research" categoryKey="ux" />
              <span className="pd-header__year">2024</span>
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
          <div className="pd-credits">
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
              <span className="pd-credits__value">3 months — 2024</span>
            </div>
          </div>

          {/* ── Summary ── */}
          <p className="pd-summary">
            Siemens' beta testing program ran at significant scale — 10 product domains, dozens of sessions per week, each requiring a moderator and a notetaker. But the quality of what those notetakers captured varied enormously. The system was creating blind spots, and no one had measured how wide they were. This project quantified the gap, then closed it.
          </p>

          {/* ── Tags ── */}
          <div className="pd-tags">
            {['User Research', 'AI Tooling', 'M365 Copilot', 'Testing Strategy', 'Figma', 'Enterprise UX'].map((tag) => (
              <Tag key={tag} label={tag} categoryKey="default" />
            ))}
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
            <p className="pd-section__body">
              Each beta testing week spanned 10 product domains with 6–8 user testing sessions per domain. Every session required a moderator and a dedicated notetaker. Across both weeks the coordinated effort totaled between <strong>346–433 hours</strong> — a significant investment that depended entirely on the quality of what notetakers documented.
            </p>

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
          </section>

          {/* ──────────────────────────────────────────
              SECTION 2 — The Gap
              ────────────────────────────────────────── */}
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

          {/* ──────────────────────────────────────────
              SECTION 3 — Notetaker Assistant
              ────────────────────────────────────────── */}
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

          {/* ──────────────────────────────────────────
              SECTION 4 — Pain-to-Solution Mapping
              ────────────────────────────────────────── */}
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

            <div className="sd-results-grid">
              {/* Left — Line chart */}
              <div className="sd-chart-wrap">
                <div className="sd-chart-title">Copilot Generated Issues</div>
                <ResultsChart />
                <div className="sd-chart-legend">
                  <div className="sd-chart-legend__item">
                    <span className="sd-chart-legend__line sd-chart-legend__line--dashed" />
                    Human Input
                  </div>
                  <div className="sd-chart-legend__item">
                    <span className="sd-chart-legend__line" style={{ background: '#2C8B5E' }} />
                    Expert Accepted
                  </div>
                  <div className="sd-chart-legend__item">
                    <span className="sd-chart-legend__line" style={{ background: '#D0368A' }} />
                    Missed
                  </div>
                </div>
              </div>

              {/* Right — Results summary */}
              <div className="sd-results-callout">
                <div className="sd-results-headline">
                  <p>Found 10/14 effective documented usability issues.</p>
                  <div className="sd-results-verified">Result reviewed and verified by Scrum Master.</div>
                </div>

                <div className="sd-results-table-wrap">
                  <table className="sd-results-table">
                    <thead>
                      <tr>
                        <th>Issue Description</th>
                        <th>Severity</th>
                        <th>Reason It's New</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Participant expected team tasks to appear under "My Changes"</td>
                        <td><span className="sd-severity-major">Major</span></td>
                        <td>Not captured in notetaker script</td>
                      </tr>
                      <tr>
                        <td>Difficulty identifying the correct task due to vague identifiers</td>
                        <td><span className="sd-severity-irritant">Irritant</span></td>
                        <td>Not mentioned in notetaker script</td>
                      </tr>
                      <tr>
                        <td>Could not identify concurrent changes from impacted items view</td>
                        <td><span className="sd-severity-major">Major</span></td>
                        <td>Script only logs missing warning message (bug)</td>
                      </tr>
                      <tr>
                        <td>Concurrent change indicator in impacted items table was not obvious</td>
                        <td><span className="sd-severity-major">Major</span></td>
                        <td>Script does not mention this visual discoverability issue</td>
                      </tr>
                      <tr>
                        <td>Scrolling required to view 7 property changes; not efficient</td>
                        <td><span className="sd-severity-irritant">Irritant</span></td>
                        <td>Script mentions button request but not scrolling inefficiency</td>
                      </tr>
                      <tr>
                        <td>Visual indicators for property changes were not intuitive</td>
                        <td><span className="sd-severity-major">Major</span></td>
                        <td>Script notes user needed hint but not icon intuitiveness issue</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
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

        </div>

        {/* ── Next / Prev navigation ── */}
        <NextProjectBanner nextProject={nextProject} prevProject={prevProject} />
      </main>

      <Footer />
    </>
  );
}
