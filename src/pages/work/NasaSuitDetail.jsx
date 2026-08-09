import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import Navbar from '../../components/layout/Navbar';
import Tag from '../../components/ui/Tag';
import TableOfContents from '../../components/ui/TableOfContents';
import NextProjectBanner from '../../components/ui/NextProjectBanner';
import { projects } from '../../data/projects';
import '../../styles/project-detail.css';
import '../../styles/nasa-suit-detail.css';

/* Live Figma prototype — Interactive Prototype starting frame */
const FIGMA_PROTO_EMBED =
  'https://www.figma.com/embed?embed_host=share&url=' +
  encodeURIComponent(
    'https://www.figma.com/proto/hzuEfUNYRULsOA9Q2uTvWl/RISD-x-NASA-SUITS-Challenge-2024?page-id=1436%3A1422&node-id=6230-77434&starting-point-node-id=6230-77434&scaling=scale-down&content-scaling=fixed'
  );

const TOC_SECTIONS = [
  { id: 'ns-overview', label: 'Overview' },
  { id: 'ns-prototype', label: 'Prototype' },
  { id: 'ns-problem', label: 'Problem' },
  { id: 'ns-research', label: 'Research' },
  { id: 'ns-solution', label: 'Solution' },
  { id: 'ns-process', label: 'Process' },
  { id: 'ns-testing', label: 'Validation' },
  { id: 'ns-outcomes', label: 'Outcomes' },
];

function CaseImage({ src, alt, caption, wide }) {
  return (
    <figure className={`ns-media ns-reveal${wide ? ' ns-media--wide' : ''}`}>
      <div className="ns-media__frame">
        <img src={src} alt={alt} loading="lazy" />
      </div>
      {caption && <figcaption className="ns-media__caption">{caption}</figcaption>}
    </figure>
  );
}

const CountUp = forwardRef(function CountUp(
  { target, suffix = '', duration = 1800 },
  ref
) {
  const numRef = useRef(null);
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
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    },
  }));

  return (
    <span ref={numRef} style={{ display: 'inline' }}>
      0{suffix}
    </span>
  );
});

function HUDStat({ countUpRef, target, suffix, label }) {
  return (
    <div className="ns-stat-card ns-hud-bracket">
      <div className="ns-stat-pulse" aria-hidden="true" />
      <div className="ns-stat-number">
        <CountUp ref={countUpRef} target={target} suffix={suffix} duration={1400} />
      </div>
      <div className="ns-stat-label">{label}</div>
    </div>
  );
}

export default function NasaSuitDetail() {
  const countRef1 = useRef(null);
  const countRef2 = useRef(null);
  const countRef3 = useRef(null);
  const statsFired = useRef(false);

  useEffect(() => {
    const els = document.querySelectorAll('.ns-reveal');
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('ns-reveal--visible');
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const row = document.querySelector('.ns-stat-row');
    if (!row) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || statsFired.current) return;
        statsFired.current = true;
        [countRef1, countRef2, countRef3].forEach((r) => r.current?.start());
        io.disconnect();
      },
      { threshold: 0.3 }
    );
    io.observe(row);
    return () => io.disconnect();
  }, []);

  const project = projects.find((p) => p.slug === 'nasa-suit');
  const prevProject = projects.find((p) => p.slug === 'memento');
  const currentIndex = projects.findIndex((p) => p.slug === 'nasa-suit');
  const nextProject =
    currentIndex < projects.length - 1 ? projects[currentIndex + 1] : projects[0];

  return (
    <>
      <Navbar />
      <TableOfContents
        sections={TOC_SECTIONS}
        projectTitle={project.title}
        accent="#00D4FF"
        autoHideAfterId="ns-prototype"
        variant="nasa"
      />

      <main className="project-detail nasa-suit-detail">
        <div className="pd-container">

          {/* ── OVERVIEW ── */}
          <header className="pd-header" id="ns-overview">
            <div className="pd-header__meta">
              <Tag label="Product Design" categoryKey="ux" />
              <Tag label="AR Interface" categoryKey="ux" />
              <span className="pd-header__year">2023–24</span>
            </div>
            <h1 className="pd-header__title">
              <span className="ns-heading-cyan">NASA</span>{' '}
              <span className="ns-heading-white">SUITS Challenge</span>
            </h1>
            <p className="pd-header__subtitle">
              AR display for astronauts + LMCC console for mission control.
              Two-time national finalist — HITL at Johnson Space Center.
            </p>
          </header>

          <div className="pd-credits">
            <div className="pd-credits__item">
              <span className="pd-credits__label">Role</span>
              <span className="pd-credits__value">UI/UX Designer — LMCC, Map & Rover</span>
            </div>
            <div className="pd-credits__item">
              <span className="pd-credits__label">Duration</span>
              <span className="pd-credits__value">Sep 2023 – May 2024</span>
            </div>
            <div className="pd-credits__item">
              <span className="pd-credits__label">Tools</span>
              <span className="pd-credits__value">Figma · Unity · HoloLens 2</span>
            </div>
            <div className="pd-credits__item">
              <span className="pd-credits__label">HITL</span>
              <span className="pd-credits__value">NASA JSC · May 18–23</span>
            </div>
          </div>

          <CaseImage
            src="/nasa/framer/hero.jpg"
            alt="HoloLens demo — AR Display for Astronauts title card"
            caption="In-headset testing — HoloLens 2 with custom high-beam hardware"
            wide
          />

          {/* ── LIVE PROTOTYPE ── */}
          <section id="ns-prototype" className="pd-section">
            <p className="pd-section__label">Interactive Prototype</p>
            <h2 className="pd-section__heading">
              <span className="ns-heading-white">Click through the</span>{' '}
              <span className="ns-heading-cyan">live Figma prototype</span>
            </h2>
            <p className="pd-section__body">
              Shared map, tasks, and rover flows between the Design Evaluator
              and LMCC.
            </p>

            <div className="ns-proto ns-reveal">
              <iframe
                title="NASA SUITS interactive prototype"
                src={FIGMA_PROTO_EMBED}
                allowFullScreen
                loading="lazy"
              />
            </div>
            <p className="ns-proto__hint">
              If the embed is blank,{' '}
              <a
                href="https://www.figma.com/proto/hzuEfUNYRULsOA9Q2uTvWl/RISD-x-NASA-SUITS-Challenge-2024?page-id=1436%3A1422&node-id=6230-77434&starting-point-node-id=6230-77434"
                target="_blank"
                rel="noopener noreferrer"
              >
                open the prototype in Figma
              </a>
              .
            </p>

            <div className="ns-gif-grid ns-reveal">
              <CaseImage
                src="/nasa/framer/proto-gif-2.gif"
                alt="Egress checklist and navigation wrist menu on Mars terrain"
                caption="Egress task progression · Navigation wrist menu"
              />
              <CaseImage
                src="/nasa/framer/proto-gif-8.gif"
                alt="LMCC dual-monitor console interface"
                caption="LMCC console — telemetry, map, cameras, tasks"
              />
            </div>
          </section>

          {/* ── PROBLEM ── */}
          <section id="ns-problem" className="pd-section">
            <p className="pd-section__label">Problem</p>
            <h2 className="pd-section__heading">
              <span className="ns-heading-white">Physical constraints first.</span>{' '}
              <span className="ns-heading-cyan">Then the interface.</span>
            </h2>
            <p className="pd-section__body">
              How might we design an AR system for NASA astronauts and engineers
              exploring the lunar surface — without adding cognitive load in a
              suit that already limits mobility?
            </p>
              <CaseImage
                src="/nasa/framer/photo-2.jpg"
                alt="Physical greater than virtual — spacesuit X-ray and HoloLens constraints"
                caption="PHYSICAL → VIRTUAL — design had to complement bodily action under lunar gravity"
                wide
              />

              <div className="ns-constraint-grid">
                {[
                  {
                    title: 'Homogenous terrain',
                    body: 'Almost no landmarks. Spatial tools must assist awareness.',
                  },
                  {
                    title: 'Cognitive overload',
                    body: 'Attention is limited. Secondary data stays on demand.',
                  },
                  {
                    title: 'Limited mobility',
                    body: 'Bulky gloves → large targets, palm menu, voice fallbacks.',
                  },
                ].map(({ title, body }) => (
                  <div key={title} className="ns-constraint-card ns-reveal">
                    <div className="ns-constraint-title">{title}</div>
                    <p>{body}</p>
                  </div>
                ))}
              </div>
          </section>

          {/* ── RESEARCH ── */}
          <section id="ns-research" className="pd-section">
            <p className="pd-section__label">Research</p>
            <h2 className="pd-section__heading">
              <span className="ns-heading-cyan">Experts + professors</span>{' '}
              <span className="ns-heading-white">before pixels</span>
            </h2>
            <p className="pd-section__body">
              Preference testing with RISD faculty on clickable wireframes —
              think-aloud sessions that taught us briefing matters. Specialist
              interviews from the prior challenge year set confidence as the
              primary decision metric.
            </p>
              <CaseImage
                src="/nasa/framer/photo-3.jpg"
                alt="Eight specialist interviews including former NASA astronauts"
                caption="Empathize with experts — astronauts, geologists, cartographers, UX specialists"
                wide
              />

              <div className="ns-gif-grid">
                <CaseImage
                  src="/nasa/framer/photo-5.jpg"
                  alt="Professor insights on icon clarity and contrast"
                  caption="Professor critique — icon clarity & visibility contrast"
                />
                <CaseImage
                  src="/nasa/framer/banner-1.jpg"
                  alt="Feature consolidation quotes from professors"
                  caption="Actionable feedback — merge rover into nav; consistent icons/words"
                />
              </div>

              <CaseImage
                src="/nasa/framer/thumb-a.jpg"
                alt="Persona card for NASA evaluator Kelly Mann"
                caption="Evaluator persona — reachability & backup options surfaced as critical failures"
              />
          </section>

          {/* ── SOLUTION ── */}
          <section id="ns-solution" className="pd-section">
            <p className="pd-section__label">Solution</p>
            <h2 className="pd-section__heading">
              <span className="ns-heading-cyan">Five procedures.</span>{' '}
              <span className="ns-heading-white">One coordinated system.</span>
            </h2>
            <p className="pd-section__body">
              Egress, Navigation, Rover Commanding, Geological Sampling, and
              Local Mission Control. I designed the LMCC procedure and owned
              shared map / rover commanding — including Allow/Deny with a 10s
              cooldown so the field operator keeps final say.
            </p>
              <CaseImage
                src="/nasa/framer/photo-1.jpg"
                alt="Five sequential procedures including LMCC"
                caption="Five sequential procedures — LMCC was my primary ownership"
                wide
              />

              <CaseImage
                src="/nasa/framer/wide-1.jpg"
                alt="Less information more confirmation UI redesign"
                caption="LESS INFORMATION, MORE CONFIRMATION — prior year’s density problem, revised hierarchy"
                wide
              />

              <div className="ns-feature-strip">
                {[
                  {
                    img: '/nasa/framer/proto-gif-5.gif',
                    title: 'Palm menu',
                    body: 'Show palm in FOV → Map, Tasks, Geo Sampling, Repair, Shortcuts.',
                  },
                  {
                    img: '/nasa/ar-sample-scan.png',
                    title: 'Science loop',
                    body: 'DE scans → XRF to LMCC → LMCC ranks interest → DE completes collection.',
                  },
                  {
                    img: '/nasa/lmcc-console.png',
                    title: 'LMCC console',
                    body: 'Telemetry, dual cams, map tools, files, abort — built for dual operators.',
                  },
                ].map(({ img, title, body }) => (
                  <article key={title} className="ns-feature-tile ns-reveal">
                    <div className="ns-feature-tile__img">
                      <img src={img} alt="" loading="lazy" />
                    </div>
                    <h3 className="ns-feature-tile__title">{title}</h3>
                    <p>{body}</p>
                  </article>
                ))}
              </div>
          </section>

          {/* ── PROCESS ── */}
          <section id="ns-process" className="pd-section">
            <p className="pd-section__label">Process</p>
            <h2 className="pd-section__heading">
              <span className="ns-heading-white">Design system →</span>{' '}
              <span className="ns-heading-cyan">Unity / MRTK3</span>
            </h2>
              <ol className="ns-process-list ns-reveal">
                <li>
                  <strong>Frame</strong> — Requirements + expert interviews +
                  dual personas (DE / LMCC).
                </li>
                <li>
                  <strong>Design</strong> — Unified AR + LMCC system; Figma
                  callouts for developers; weekly sync with Unity.
                </li>
                <li>
                  <strong>Simulate</strong> — Faculty wireframe walkthroughs +
                  local park HITL before Houston.
                </li>
                <li>
                  <strong>Ship</strong> — Hi-fi into MRTK3 on HoloLens 2; iterate
                  from test-week feedback.
                </li>
              </ol>

              <CaseImage
                src="/nasa/framer/wide-3.jpg"
                alt="Unified design board with AR library and V4 Mission Control"
                caption="Unified design — AR component library, flows, V4 Mission Control for development"
                wide
              />

              <div className="ns-gif-grid">
                <CaseImage
                  src="/nasa/framer/photo-6.jpg"
                  alt="Design system tokens applied to AR mockups"
                  caption="Design system — type, color, icons → rock-yard + Mars FOV"
                />
                <CaseImage
                  src="/nasa/framer/photo-8.jpg"
                  alt="Team developing in Unity with MRTK3"
                  caption="Development — Unity + MRTK3 for spatial mapping & gestures"
                />
              </div>
          </section>

          {/* ── VALIDATION ── */}
          <section id="ns-testing" className="pd-section">
            <p className="pd-section__label">Validation</p>
            <h2 className="pd-section__heading">
              <span className="ns-heading-cyan">JSC Rock Yard.</span>{' '}
              <span className="ns-heading-white">Brief → test → debrief.</span>
            </h2>
            <p className="pd-section__body">
              Invited to Houston (May 18–23) for Human-In-The-Loop evaluation.
              Pain points from debrief: confirmation affordances, button/info
              differentiation, and backup options for vital actions.
            </p>
              <CaseImage
                src="/nasa/framer/ui-compare.png"
                alt="JSC testing timeline from briefing through debriefing"
                caption="HITL at Johnson Space Center — briefing, HoloLens testing, debrief pain points"
                wide
              />

              <div className="ns-phase-grid ns-phase-grid--compact">
                {[
                  { num: '01', title: 'Brief', body: 'Teach palm menu · connect telemetry · prep exit pitch' },
                  { num: '02', title: 'Test', body: 'Rock Yard procedures on HoloLens with NASA evaluators' },
                  { num: '03', title: 'Debrief', body: 'Confirmations, differentiation, backup paths' },
                  { num: '04', title: 'Revise', body: 'Ship prioritized fixes from test-week notes' },
                ].map(({ num, title, body }) => (
                  <div key={title} className="ns-phase-card ns-reveal">
                    <span className="ns-phase-num">{num}</span>
                    <h3 className="ns-phase-title">{title}</h3>
                    <p>{body}</p>
                  </div>
                ))}
              </div>
          </section>

          {/* ── OUTCOMES ── */}
          <section id="ns-outcomes" className="pd-section">
            <p className="pd-section__label">Outcomes</p>
            <h2 className="pd-section__heading">
              <span className="ns-heading-white">National finalist.</span>{' '}
              <span className="ns-heading-cyan">Field-proven system.</span>
            </h2>

            <CaseImage
              src="/nasa/framer/photo-9.jpg"
              alt="Final design — HoloLens user interacting with AR map and procedures"
              caption="Final design — AR procedures + map in live HoloLens use"
              wide
            />

            <div className="ns-stat-row">
              <HUDStat
                countUpRef={countRef1}
                target={2}
                suffix="×"
                label="National finalist (SUITS Challenge)"
              />
              <HUDStat
                countUpRef={countRef2}
                target={5}
                suffix=""
                label="Procedures in the coordinated system"
              />
              <HUDStat
                countUpRef={countRef3}
                target={10}
                suffix="s"
                label="Rover deny cooldown — DE final say"
              />
            </div>
              <ul className="ns-outcome-bullets ns-reveal">
                <li>Designed LMCC + shared map/rover commanding across AR and console</li>
                <li>Validated via faculty sims → local park HITL → NASA JSC Rock Yard</li>
                <li>Shipped hi-fi into Unity/MRTK3 for HoloLens 2 evaluation</li>
              </ul>

              <div className="ns-reflection-callout ns-hud-bracket ns-reveal">
                <div className="ns-reflection-callout__label">Takeaway</div>
                <p className="ns-reflection-callout__text">
                  Design for operators who share state under constraint: decide
                  what is persistent, what is on-demand, and who has final say —
                  then prove it on hardware before the high-stakes test.
                </p>
              </div>
          </section>

        </div>

        <NextProjectBanner nextProject={nextProject} prevProject={prevProject} />
      </main>
    </>
  );
}
