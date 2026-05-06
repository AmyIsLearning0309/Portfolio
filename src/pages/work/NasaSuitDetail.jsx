import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import PlaceholderImage from '../../components/ui/PlaceholderImage';
import Tag from '../../components/ui/Tag';
import TableOfContents from '../../components/ui/TableOfContents';
import NextProjectBanner from '../../components/ui/NextProjectBanner';
import { projects } from '../../data/projects';
import '../../styles/project-detail.css';
import '../../styles/nasa-suit-detail.css';

/* ── TOC sections ── */
const TOC_SECTIONS = [
  { id: 'ns-overview',   label: 'Overview'          },
  { id: 'ns-problem',    label: 'Problem'            },
  { id: 'ns-objectives', label: 'Design Objectives'  },
  { id: 'ns-research',   label: 'Research Insights'  },
  { id: 'ns-features',   label: 'Core Features'      },
  { id: 'ns-iterations', label: 'Iterations'         },
  { id: 'ns-testing',    label: 'Field Testing'      },
  { id: 'ns-system',     label: 'Design System'      },
  { id: 'ns-outcomes',   label: 'Outcomes'           },
  { id: 'ns-future',     label: 'Moving Forward'     },
];

/* ── Iteration data ── */
const ITERATIONS = [
  {
    num: '01',
    title: 'Low-Fidelity Wireframes — Information Architecture',
    description:
      'First-pass wireframes mapping all EVA data types to screen zones. The goal was to inventory what information existed before deciding where it should live — a blank-slate audit of mission data.',
    delta:
      'Established 4-zone HUD layout: top-left telemetry, center-top navigation, bottom-right checklist, bottom-left comms.',
    imageLabel: 'Iteration 01 — Low-fi wireframes, zone mapping',
  },
  {
    num: '02',
    title: 'Typography & Contrast System',
    description:
      'Defined display font sizing, weight, and color contrast ratios against the dark visor overlay. Tested multiple weight and sizing combinations under simulated visor tint conditions.',
    delta:
      'Minimum body size increased from 14pt to 18pt. Adopted all-caps labels with wide tracking for glanceability.',
    imageLabel: 'Iteration 02 — Typography scale and contrast testing',
  },
  {
    num: '03',
    title: 'Interactive Prototype — Navigation Module',
    description:
      'First interactive prototype focused exclusively on navigation: waypoint display, heading arrow, and distance callouts. Tested with team members simulating gloved operation.',
    delta:
      'Simultaneous waypoint markers reduced from 5 to 2. Heading arrow size increased 40%. Waypoint labels moved above markers to avoid FOV overlap.',
    imageLabel: 'Iteration 03 — Navigation prototype, simulated testing',
  },
  {
    num: '04',
    title: 'All Four Modules + Mode-Switching System',
    description:
      'Expanded prototype to include Egress, Geological Sampling, and Rover Commanding alongside Navigation. First time all four modules coexisted and needed a coherent mode-switching language.',
    delta:
      'Full-screen color-wash system introduced: red tint for Egress emergency, blue-cyan tint for nominal operation — mode state communicated without reading any text.',
    imageLabel: 'Iteration 04 — Full module set, mode-switching system',
  },
  {
    num: '05',
    title: 'Pre-HITL Refinement — Density Reduction',
    description:
      'Based on team simulation sessions, aggressively reduced information density across all modules before the NASA field test. Secondary data was hidden behind voice commands rather than shown persistently.',
    delta:
      'Removed 3 persistent data fields. Simplified checklist confirmation from 2-step to 1-step. Added progressive disclosure to Rover Commanding module.',
    imageLabel: 'Iteration 05 — Pre-field-test refinement, density reduction',
  },
  {
    num: '06',
    title: 'Post-HITL Revisions — NASA JSC Feedback',
    description:
      'Final revisions based on structured evaluator feedback from the Johnson Space Center field test. Focused on geological sampling logging speed and egress trigger visibility.',
    delta:
      'Geological sampling entry flow reduced from 4 taps to 2. Egress warning visual size increased 25%. Telemetry alert thresholds tuned to evaluator specifications.',
    imageLabel: 'Iteration 06 — Final design, post-NASA field testing',
  },
];

/* ── CountUp component (imperative, forwardRef) ── */
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

/* ── HUDStat sub-component ── */
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

/* ── Scroll-step hook for iteration timeline ── */
function useNasaScrollSteps(wrapRef, countUpRefs) {
  const doneRef = useRef(false);
  const countUpFiredRef = useRef(false);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const TOTAL_STEPS = 7;

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

      if (step >= 6 && !countUpFiredRef.current) {
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

/* ── Main component ── */
export default function NasaSuitDetail() {
  const timelineRef = useRef(null);
  const countRef1   = useRef(null);
  const countRef2   = useRef(null);
  const countRef3   = useRef(null);

  useNasaScrollSteps(timelineRef, [countRef1, countRef2, countRef3]);

  /* IntersectionObserver for all .ns-reveal elements */
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

  const project = projects.find((p) => p.slug === 'nasa-suit');
  const currentIndex = projects.findIndex((p) => p.slug === 'nasa-suit');
  const prevProject =
    currentIndex > 0 ? projects[currentIndex - 1] : projects[projects.length - 1];
  const nextProject =
    currentIndex < projects.length - 1 ? projects[currentIndex + 1] : projects[0];

  return (
    <>
      <Navbar />
      <TableOfContents sections={TOC_SECTIONS} projectTitle={project.title} />

      <main className="project-detail nasa-suit-detail">
        <div className="pd-container">

          {/* ══════════════════════════════════════════
              HERO + OVERVIEW
          ══════════════════════════════════════════ */}
          <div className="ns-hero-image ns-scanline">
            <PlaceholderImage
              color="#080C14"
              accentColor="#00D4FF"
              aspect="21/9"
              label="NASA SUIT — AR HUD interface overview"
            />
          </div>

          <header className="pd-header" id="ns-overview">
            <div className="pd-header__meta">
              <Tag label="AR Interface" categoryKey="ux" />
              <Tag label="UX Research" categoryKey="ux" />
              <span className="pd-header__year">2024</span>
            </div>
            <h1 className="pd-header__title">
              <span className="ns-heading-cyan">NASA</span>{' '}
              <span className="ns-heading-white">SUITS Challenge</span>
            </h1>
            <p className="pd-header__subtitle">
              Designing an augmented-reality heads-up display for astronaut
              extravehicular activity — entered as a national finalist in the
              NASA SUITS academic challenge.
            </p>
          </header>

          <div className="pd-credits">
            <div className="pd-credits__item">
              <span className="pd-credits__label">Role</span>
              <span className="pd-credits__value">UX Researcher & Designer</span>
            </div>
            <div className="pd-credits__item">
              <span className="pd-credits__label">Team</span>
              <span className="pd-credits__value">Interdisciplinary team of 8</span>
            </div>
            <div className="pd-credits__item">
              <span className="pd-credits__label">Timeline</span>
              <span className="pd-credits__value">5 months — 2024</span>
            </div>
            <div className="pd-credits__item">
              <span className="pd-credits__label">Testing Site</span>
              <span className="pd-credits__value">NASA JSC, Houston TX</span>
            </div>
          </div>

          <p className="pd-summary">
            The NASA SUITS (Spacesuit User Interface Technologies for Students)
            Challenge invited university teams to design an AR heads-up display
            for astronauts conducting extravehicular activities on the lunar
            surface. Our team designed a four-module HUD that surfaces
            mission-critical data — egress routing, navigation, rover
            commanding, and geological sampling — without adding cognitive load
            to an already overloaded operator. We were selected as top-10
            national finalists and traveled to NASA Johnson Space Center for a
            Human-In-The-Loop field evaluation.
          </p>

          <div className="pd-tags">
            {[
              'AR Interface',
              'UX Research',
              'Wearable UI',
              'Space Tech',
              'HUD Design',
              'Accessibility',
              'Figma',
              'Field Testing',
            ].map((tag) => (
              <Tag key={tag} label={tag} categoryKey="default" />
            ))}
          </div>

          {/* ══════════════════════════════════════════
              PROBLEM
          ══════════════════════════════════════════ */}
          <section id="ns-problem" className="pd-section">
            <p className="pd-section__label">Problem Space</p>
            <h2 className="pd-section__heading">
              <span className="ns-heading-white">Extravehicular activity is</span>{' '}
              <span className="ns-heading-cyan">the most cognitively hostile UX environment imaginable</span>
            </h2>
            <p className="pd-section__body">
              Astronauts on EVA must simultaneously execute precise, multi-step
              procedures while managing suit telemetry, spatial navigation,
              geological data collection, and rover commanding — in a
              pressurized suit, with minimal hand dexterity, under potential
              communication lag, and with zero margin for error. Any interface
              that adds cognitive load is not a tool, it's a hazard.
            </p>

            <div className="ns-hmw-card ns-hud-bracket ns-reveal">
              <span className="ns-hmw-label">How Might We</span>
              <p className="ns-hmw-text">
                Design an AR HUD that surfaces mission-critical information at
                the right moment and the right fidelity, without adding
                cognitive load to an already overloaded operator?
              </p>
            </div>

            <div className="ns-constraint-grid">
              {[
                {
                  icon: '🧤',
                  title: 'Gloved Interaction',
                  body: 'Pressurized gloves eliminate fine motor control. No small tap targets, no precise gestures — every interaction must be executable with a closed fist or a gross arm movement.',
                },
                {
                  icon: '🪖',
                  title: 'Helmet Visor FOV',
                  body: "Peripheral vision is reduced and the visor creates reflection and distortion. Critical data must live in the astronaut's central visual field without obscuring the task they're performing.",
                },
                {
                  icon: '⚡',
                  title: 'Cognitive Overload',
                  body: 'Astronauts track suit health, navigation, procedure steps, and communications simultaneously. Every element of the HUD must earn its place — anything non-essential creates risk.',
                },
              ].map(({ icon, title, body }) => (
                <div key={title} className="ns-constraint-card ns-reveal">
                  <div className="ns-constraint-icon">{icon}</div>
                  <div className="ns-constraint-title">{title}</div>
                  <p>{body}</p>
                </div>
              ))}
            </div>

            <div className="ns-section-image">
              <PlaceholderImage
                color="#080C14"
                accentColor="#00D4FF"
                aspect="16/9"
                label="EVA context — astronaut operating environment constraints diagram"
              />
            </div>
          </section>

          {/* ══════════════════════════════════════════
              DESIGN OBJECTIVES
          ══════════════════════════════════════════ */}
          <section id="ns-objectives" className="pd-section">
            <p className="pd-section__label">Design Direction</p>
            <h2 className="pd-section__heading">
              <span className="ns-heading-white">Three objectives.</span>{' '}
              <span className="ns-heading-cyan">One constraint: space.</span>
            </h2>
            <p className="pd-section__body">
              Early research surfaced a single meta-finding: every usability
              failure in existing EVA interfaces traced back to one of three
              root causes. Our design objectives mapped directly to those
              causes — and every design decision was evaluated against all
              three before it moved forward.
            </p>

            <div className="ns-objectives-stack">
              <div className="ns-objective-card ns-reveal">
                <span className="ns-objective-num">01</span>
                <div className="ns-objective-body">
                  <h3 className="ns-objective-title ns-heading-cyan">Visual Accessibility</h3>
                  <p>
                    Ensure all HUD elements remain legible under variable
                    lighting — direct lunar sunlight (1,350 W/m²), deep shadow,
                    and visor tint — using high-contrast iconography and a
                    minimum 4.5:1 WCAG contrast ratio on the dark visor overlay
                    at all times.
                  </p>
                </div>
              </div>

              <div className="ns-objective-card ns-objective-card--orange ns-reveal">
                <span className="ns-objective-num">02</span>
                <div className="ns-objective-body">
                  <h3 className="ns-objective-title ns-heading-orange">Tactile Accessibility</h3>
                  <p>
                    Design all interactive controls for gloved use: minimum
                    touch regions of 44×44mm equivalent on the visor display,
                    palm-flip gesture navigation for primary actions, and
                    voice-command fallback for every interaction that requires
                    precision.
                  </p>
                </div>
              </div>

              <div className="ns-objective-card ns-reveal">
                <span className="ns-objective-num">03</span>
                <div className="ns-objective-body">
                  <h3 className="ns-objective-title ns-heading-cyan">Clarity</h3>
                  <p>
                    Cap information density at 5 concurrent data elements per
                    view. Secondary data is never shown proactively — it is
                    always behind a deliberate gesture or voice trigger. The
                    HUD should feel like having the right answer ready, not
                    like reading a dashboard.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════
              RESEARCH INSIGHTS
          ══════════════════════════════════════════ */}
          <section id="ns-research" className="pd-section">
            <p className="pd-section__label">Research Phase</p>
            <h2 className="pd-section__heading">
              <span className="ns-heading-white">Expert interviews surface</span>{' '}
              <span className="ns-heading-cyan">three sharp findings</span>
            </h2>
            <p className="pd-section__body">
              We conducted structured interviews with EVA trainers, human
              factors researchers, and professionals operating heads-up
              displays in analogous high-stress environments (aerospace,
              surgical, and military contexts). Three patterns repeated across
              every conversation, regardless of domain.
            </p>

            <div className="ns-section-image ns-reveal">
              <PlaceholderImage
                color="#0A1020"
                accentColor="#00D4FF"
                aspect="3/1"
                label="Research artifacts — expert interview synthesis and affinity map"
              />
            </div>

            <div className="ns-insight-grid">
              {[
                {
                  num: '01',
                  quote:
                    '"When you\'re on EVA, your brain is at full capacity before you even start. The interface needs to do the thinking for you, not add to what you\'re already managing."',
                  source: 'EVA Trainer, NASA Analog Environment',
                  insight:
                    'Progressive disclosure is not a nice-to-have — it is the baseline requirement for any EVA HUD. Information must be contextual, not persistent.',
                  accent: 'cyan',
                },
                {
                  num: '02',
                  quote:
                    '"Aviation HUDs specify 12pt minimum symbol sizes. Pressurized gloves make haptic feedback near-zero and reduce reach accuracy by 30%. Fewer, bigger elements is the only safe design choice."',
                  source: 'Human Factors Researcher, Aerospace Industry',
                  insight:
                    'Icon density and minimum touch regions must be derived from gloved-hand anthropometrics, not desktop conventions. Standard UI targets are 3–4× too small.',
                  accent: 'orange',
                },
                {
                  num: '03',
                  quote:
                    '"The checklist cannot fail. Everything else on the display is secondary. If I had to choose between navigation and my procedure list, I\'m choosing the list every time."',
                  source: 'Astronaut Trainer, EVA Procedures',
                  insight:
                    'The procedure/checklist module must have guaranteed visual priority and zero failure modes. It anchors the entire information hierarchy of the HUD.',
                  accent: 'cyan',
                },
              ].map(({ num, quote, source, insight, accent }, i) => (
                <div
                  key={num}
                  className={`ns-insight-card ns-insight-card--${accent} ns-reveal`}
                  style={{ transitionDelay: `${i * 90}ms` }}
                >
                  <span className="ns-insight-num">{num}</span>
                  <blockquote className="ns-insight-quote">{quote}</blockquote>
                  <span className="ns-insight-source">{source}</span>
                  <p className="ns-insight-implication">{insight}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ══════════════════════════════════════════
              CORE FEATURES
          ══════════════════════════════════════════ */}
          <section id="ns-features" className="pd-section">
            <p className="pd-section__label">Core Features</p>
            <h2 className="pd-section__heading">
              <span className="ns-heading-cyan">Four modules.</span>{' '}
              <span className="ns-heading-white">One cohesive HUD.</span>
            </h2>
            <p className="pd-section__body">
              Each module was designed as a self-contained mission capability
              that could be independently activated, without disrupting the
              state of any other module. The HUD operates as a layered system
              — astronauts see only what they asked to see.
            </p>

            <div className="ns-features-stack">

              {/* Feature 01 — Egress */}
              <div className="ns-feature-panel ns-feature-panel--orange ns-reveal">
                <div className="ns-feature-meta">
                  <span className="ns-feature-num">01 / 04</span>
                  <span className="ns-feature-tag">Egress</span>
                </div>
                <div className="ns-feature-layout">
                  <div className="ns-feature-copy">
                    <h3 className="ns-feature-title">Emergency Exit Navigation</h3>
                    <p className="ns-feature-body">
                      The highest-priority safety module. Egress activates
                      automatically when suit telemetry detects a critical
                      threshold breach, or manually at any time. It overlays
                      the fastest confirmed path back to the airlock directly
                      on the astronaut's field of view — no menu navigation,
                      no mode-switching. Orange coloring signals the emergency
                      state at a glance without any text.
                    </p>
                    <div className="ns-feature-specs">
                      <div className="ns-spec-item">
                        <span className="ns-spec-label">Trigger</span>
                        <span className="ns-spec-value">Automatic (O₂, pressure, temp) + palm-flip manual override</span>
                      </div>
                      <div className="ns-spec-item">
                        <span className="ns-spec-label">Data Shown</span>
                        <span className="ns-spec-value">Heading arrow, distance, estimated time, O₂ remaining, terrain path</span>
                      </div>
                      <div className="ns-spec-item">
                        <span className="ns-spec-label">Interaction</span>
                        <span className="ns-spec-value">Voice-confirmed acknowledgement. Zero tap required.</span>
                      </div>
                    </div>
                  </div>
                  <div className="ns-feature-image">
                    <PlaceholderImage
                      color="#080C14"
                      accentColor="#FF6B35"
                      aspect="4/3"
                      label="Egress module — emergency exit HUD overlay"
                    />
                  </div>
                </div>
              </div>

              {/* Feature 02 — Navigation (flipped) */}
              <div className="ns-feature-panel ns-feature-panel--flip ns-reveal">
                <div className="ns-feature-meta">
                  <span className="ns-feature-num">02 / 04</span>
                  <span className="ns-feature-tag">Navigation</span>
                </div>
                <div className="ns-feature-layout">
                  <div className="ns-feature-copy">
                    <h3 className="ns-feature-title">Waypoint Map & Heading Compass</h3>
                    <p className="ns-feature-body">
                      The navigation module provides persistent, minimal
                      orientation data without dominating the visual field. A
                      compact compass arc sits at the bottom of the visor
                      overlay, while a top-down mini-map appears on voice
                      command. Active waypoints are shown with a single arrow
                      and distance — secondary waypoints are hidden until
                      requested, reducing clutter during active traversal.
                    </p>
                    <div className="ns-feature-specs">
                      <div className="ns-spec-item">
                        <span className="ns-spec-label">Persistent</span>
                        <span className="ns-spec-value">Heading compass arc, active waypoint arrow, distance</span>
                      </div>
                      <div className="ns-spec-item">
                        <span className="ns-spec-label">On Command</span>
                        <span className="ns-spec-value">Full mini-map, secondary waypoints, terrain overlay</span>
                      </div>
                      <div className="ns-spec-item">
                        <span className="ns-spec-label">Interaction</span>
                        <span className="ns-spec-value">Palm-flip to cycle waypoints. Voice to show/hide map.</span>
                      </div>
                    </div>
                  </div>
                  <div className="ns-feature-image">
                    <PlaceholderImage
                      color="#080C14"
                      accentColor="#00D4FF"
                      aspect="4/3"
                      label="Navigation module — waypoint and heading compass HUD"
                    />
                  </div>
                </div>
              </div>

              {/* Feature 03 — Rover Commanding */}
              <div className="ns-feature-panel ns-reveal">
                <div className="ns-feature-meta">
                  <span className="ns-feature-num">03 / 04</span>
                  <span className="ns-feature-tag">Rover Commanding</span>
                </div>
                <div className="ns-feature-layout">
                  <div className="ns-feature-copy">
                    <h3 className="ns-feature-title">Autonomous Rover Control</h3>
                    <p className="ns-feature-body">
                      Rover Commanding allows astronauts to designate waypoints
                      for the autonomous surface rover directly through the HUD
                      — without removing attention from the EVA task at hand.
                      Waypoints are set by a dwell-gaze selection on the
                      mini-map or by voice coordinates. The rover's current
                      position and status are overlaid as a persistent indicator
                      at the edge of the compass.
                    </p>
                    <div className="ns-feature-specs">
                      <div className="ns-spec-item">
                        <span className="ns-spec-label">Waypoint Set</span>
                        <span className="ns-spec-value">Dwell-gaze on mini-map (1.5s) or voice coordinate input</span>
                      </div>
                      <div className="ns-spec-item">
                        <span className="ns-spec-label">Status</span>
                        <span className="ns-spec-value">Persistent rover position indicator + arrival notification</span>
                      </div>
                      <div className="ns-spec-item">
                        <span className="ns-spec-label">Interaction</span>
                        <span className="ns-spec-value">No primary-hand interaction required during active navigation.</span>
                      </div>
                    </div>
                  </div>
                  <div className="ns-feature-image">
                    <PlaceholderImage
                      color="#080C14"
                      accentColor="#00D4FF"
                      aspect="4/3"
                      label="Rover commanding — remote waypoint control overlay"
                    />
                  </div>
                </div>
              </div>

              {/* Feature 04 — Geological Sampling (flipped) */}
              <div className="ns-feature-panel ns-feature-panel--flip ns-reveal">
                <div className="ns-feature-meta">
                  <span className="ns-feature-num">04 / 04</span>
                  <span className="ns-feature-tag">Geological Sampling</span>
                </div>
                <div className="ns-feature-layout">
                  <div className="ns-feature-copy">
                    <h3 className="ns-feature-title">Sample Logging Interface</h3>
                    <p className="ns-feature-body">
                      The geological sampling module streamlines specimen data
                      capture from collection to log entry. Upon initiating a
                      sample (via RFID scanner or palm trigger), the HUD
                      surfaces a minimal entry form: sample ID, GPS coordinates
                      (auto-populated), a classification selector, and a
                      voice-to-text notation field. Confirmation requires one
                      gesture — the logged sample immediately appears in the
                      mission data feed.
                    </p>
                    <div className="ns-feature-specs">
                      <div className="ns-spec-item">
                        <span className="ns-spec-label">Trigger</span>
                        <span className="ns-spec-value">RFID scan event or manual palm-hold gesture</span>
                      </div>
                      <div className="ns-spec-item">
                        <span className="ns-spec-label">Auto-filled</span>
                        <span className="ns-spec-value">GPS coordinates, timestamp, sample sequence number</span>
                      </div>
                      <div className="ns-spec-item">
                        <span className="ns-spec-label">Entry Time</span>
                        <span className="ns-spec-value">Target: &lt;8 seconds from trigger to confirmed log.</span>
                      </div>
                    </div>
                  </div>
                  <div className="ns-feature-image">
                    <PlaceholderImage
                      color="#080C14"
                      accentColor="#7B8CAA"
                      aspect="4/3"
                      label="Geological sampling module — specimen logging interface"
                    />
                  </div>
                </div>
              </div>

            </div>
          </section>

          {/* ══════════════════════════════════════════
              ITERATIONS TIMELINE
          ══════════════════════════════════════════ */}
          <section id="ns-iterations" className="pd-section">
            <p className="pd-section__label">Design Process</p>
            <h2 className="pd-section__heading">
              <span className="ns-heading-white">Six iterations.</span>{' '}
              <span className="ns-heading-cyan">Each one grounded in testing.</span>
            </h2>
            <p className="pd-section__body">
              No iteration was driven by aesthetic preference alone. Every
              round was prompted by a specific failure mode observed in
              simulation or testing — from typography illegibility under visor
              conditions to evaluator feedback from inside the NASA JSC
              facility.
            </p>

            <div
              className="ns-timeline-wrap"
              ref={timelineRef}
              data-step="-1"
            >
              <div className="ns-timeline-spine" aria-hidden="true" />

              {ITERATIONS.map((iter, i) => (
                <div
                  key={iter.num}
                  className="ns-iteration-row"
                  data-show-at={String(i)}
                >
                  <div className="ns-iter-badge" aria-hidden="true">
                    {iter.num}
                  </div>
                  <div className="ns-iter-content">
                    <div className="ns-iter-card">
                      <h3 className="ns-iter-title">{iter.title}</h3>
                      <p className="ns-iter-body">{iter.description}</p>
                      <div className="ns-iter-delta">
                        <span className="ns-iter-delta-label">Key Change</span>
                        <span className="ns-iter-delta-value">{iter.delta}</span>
                      </div>
                    </div>
                    <div className="ns-iter-image">
                      <PlaceholderImage
                        color="#0A1020"
                        accentColor="#00D4FF"
                        aspect="4/3"
                        label={iter.imageLabel}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ══════════════════════════════════════════
              FIELD TESTING
          ══════════════════════════════════════════ */}
          <section id="ns-testing" className="pd-section">
            <p className="pd-section__label">HITL Field Testing</p>
            <h2 className="pd-section__heading">
              <span className="ns-heading-cyan">NASA Johnson Space Center.</span>{' '}
              <span className="ns-heading-white">Houston, Texas.</span>
            </h2>
            <p className="pd-section__body">
              As a top-10 national finalist, our team traveled to NASA JSC for
              a full Human-In-The-Loop test day. Our HUD was evaluated by NASA
              engineers and astronaut trainers using the SUITS AR platform
              under simulated EVA mission conditions — the first time any
              version of our design was tested by someone other than our own
              team.
            </p>

            <div className="ns-section-image ns-reveal ns-wide">
              <PlaceholderImage
                color="#050810"
                accentColor="#00D4FF"
                aspect="21/9"
                label="NASA JSC field test — team at Johnson Space Center"
              />
            </div>

            <div className="ns-phase-grid">
              {[
                {
                  num: 'Phase 01',
                  title: 'Briefing',
                  body: "NASA evaluators walked all teams through the test protocol, EVA scenario parameters, and scoring criteria. We reviewed our module priority order, confirmed role assignments, and walked the evaluator through the palm-flip gesture system before beginning.",
                  accentColor: '#00D4FF',
                },
                {
                  num: 'Phase 02',
                  title: 'Testing',
                  body: 'Evaluators operated our HUD under simulated EVA conditions: executing geological sampling runs, navigation waypoint routing across a defined course, rover waypoint commands, and a triggered emergency egress scenario. All sessions were timed and observed.',
                  accentColor: '#FF6B35',
                },
                {
                  num: 'Phase 03',
                  title: 'Debrief',
                  body: 'Structured debrief with NASA evaluators surfaced 7 actionable feedback items. Navigation and Egress modules received the highest usability scores. Geological sampling logging speed was flagged as the primary area requiring improvement before any future testing.',
                  accentColor: '#00D4FF',
                },
                {
                  num: 'Phase 04',
                  title: 'Revisions',
                  body: 'A dedicated post-HITL design session within 48 hours of returning. All 7 feedback items were triaged and mapped to specific design changes. Five of seven were implemented in the final submission. Two were scoped to the "Moving Forward" roadmap.',
                  accentColor: '#00D4FF',
                },
              ].map(({ num, title, body, accentColor }, i) => (
                <div
                  key={title}
                  className="ns-phase-card ns-reveal"
                  style={{ transitionDelay: `${i * 80}ms` }}
                >
                  <span className="ns-phase-num">{num}</span>
                  <h3 className="ns-phase-title">{title}</h3>
                  <p>{body}</p>
                  <div className="ns-phase-image">
                    <PlaceholderImage
                      color="#0A1020"
                      accentColor={accentColor}
                      aspect="4/3"
                      label={`Field test — ${title.toLowerCase()} session`}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="ns-field-quote ns-hud-bracket ns-reveal">
              <p>
                "The evaluators told us our Egress module was the clearest
                emergency exit interface they had seen across all tested teams
                that day. That clarity came entirely from cutting — not from
                adding."
              </p>
              <span>— Team reflection, post-HITL debrief</span>
            </div>
          </section>

          {/* ══════════════════════════════════════════
              DESIGN SYSTEM
          ══════════════════════════════════════════ */}
          <section id="ns-system" className="pd-section">
            <p className="pd-section__label">Design System</p>
            <h2 className="pd-section__heading">
              <span className="ns-heading-white">A system built for</span>{' '}
              <span className="ns-heading-cyan">200ms glance time</span>
            </h2>
            <p className="pd-section__body">
              Every token in the HUD design system was chosen with a single
              question in mind: can an astronaut under EVA-level cognitive
              stress extract the meaning of this element in a single glance?
              If not, it was redesigned.
            </p>

            {/* Typography */}
            <div className="ns-system-block ns-reveal">
              <div className="ns-system-block-title">Typography</div>
              <div className="ns-type-scale">
                <div className="ns-type-row">
                  <span className="ns-type-sample ns-type-sample--hero">EVA STATUS</span>
                  <span className="ns-type-meta">Display — 32px / Exo 2 Bold / ALL CAPS / Wide tracking / HUD Cyan</span>
                </div>
                <div className="ns-type-row">
                  <span className="ns-type-sample ns-type-sample--heading">Navigation</span>
                  <span className="ns-type-meta">Module Label — 20px / Exo 2 SemiBold / Title Case / Visor White</span>
                </div>
                <div className="ns-type-row">
                  <span className="ns-type-sample ns-type-sample--body">O₂: 82% / 4h 12m</span>
                  <span className="ns-type-meta">Telemetry Data — 16px / Inter Medium / Tabular nums / Telemetry Grey</span>
                </div>
              </div>
            </div>

            {/* Color language */}
            <div className="ns-system-block ns-reveal">
              <div className="ns-system-block-title">Color Language</div>
              <div className="ns-color-row">
                {[
                  { hex: '#080C14', name: 'Deep Space',     role: 'Overlay background, card surfaces' },
                  { hex: '#00D4FF', name: 'HUD Cyan',       role: 'Primary — nominal state, active elements, confirmations' },
                  { hex: '#FF6B35', name: 'Mission Orange', role: 'Warning — Egress trigger, caution states, critical alerts' },
                  { hex: '#E8EDF5', name: 'Visor White',    role: 'Primary text, icons, module headings' },
                  { hex: '#7B8CAA', name: 'Telemetry Grey', role: 'Secondary data, metadata labels, inactive states' },
                ].map(({ hex, name, role }) => (
                  <div key={hex} className="ns-color-chip">
                    <div className="ns-color-chip__swatch" style={{ background: hex }} />
                    <span className="ns-color-chip__hex">{hex}</span>
                    <span className="ns-color-chip__name">{name}</span>
                    <span className="ns-color-chip__role">{role}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Component library screenshot */}
            <div className="ns-section-image ns-reveal">
              <PlaceholderImage
                color="#080C14"
                accentColor="#00D4FF"
                aspect="16/9"
                label="Design system — full component library, icon set, and UI kit"
              />
            </div>
          </section>

          {/* ══════════════════════════════════════════
              OUTCOMES
          ══════════════════════════════════════════ */}
          <section id="ns-outcomes" className="pd-section">
            <p className="pd-section__label">Results</p>
            <h2 className="pd-section__heading">
              <span className="ns-heading-white">Top 10 nationally.</span>{' '}
              <span className="ns-heading-cyan">Four lessons that rewired how I design.</span>
            </h2>

            <div className="ns-stat-row">
              <HUDStat
                countUpRef={countRef1}
                target={10}
                suffix="th"
                label="National ranking among competing university teams"
              />
              <HUDStat
                countUpRef={countRef2}
                target={4}
                suffix=" modules"
                label="Fully tested at NASA JSC with evaluator feedback"
              />
              <HUDStat
                countUpRef={countRef3}
                target={6}
                suffix=" rounds"
                label="Design iterations from wireframe to NASA field test"
              />
            </div>

            <ol className="pd-outcomes">
              {[
                'Navigation and checklist modules scored highest in NASA evaluator usability sessions, with zero critical failure incidents across the full HITL test.',
                'Egress module identified by evaluators as the clearest emergency exit interface tested across all teams — attributed to mode-state color signaling and progressive disclosure eliminating all non-essential elements from the emergency view.',
                'Team selected as a top-10 national finalist in the NASA SUITS Challenge, earning the opportunity to test at Johnson Space Center in Houston, Texas.',
                'Established a replicable HUD design methodology — constraint-first architecture, progressive disclosure, voice-command fallback — directly applicable to any interface designed for high cognitive load environments.',
              ].map((outcome, i) => (
                <li key={i} className="pd-outcomes__item">
                  <span className="pd-outcomes__num">{String(i + 1).padStart(2, '0')}</span>
                  <span className="pd-outcomes__text">{outcome}</span>
                </li>
              ))}
            </ol>

            <div className="ns-reflection-callout ns-hud-bracket ns-reveal">
              <div className="ns-reflection-callout__label">Reflection</div>
              <p className="ns-reflection-callout__text">
                "Designing for astronauts taught me the most important lesson
                in interface design: the best interface is the one the user
                never has to think about. In a context where thinking costs
                lives, that's not a principle — it's a requirement. I apply
                that discipline to every screen I design now, regardless of
                context."
              </p>
            </div>
          </section>

          {/* ══════════════════════════════════════════
              FUTURE FEATURES
          ══════════════════════════════════════════ */}
          <section id="ns-future" className="pd-section">
            <p className="pd-section__label">Moving Forward</p>
            <h2 className="pd-section__heading">
              <span className="ns-heading-white">What comes next</span>{' '}
              <span className="ns-heading-cyan">for the HUD</span>
            </h2>
            <p className="pd-section__body">
              Two of the seven HITL feedback items and several concepts that
              emerged during the design process were scoped out of the
              competition submission due to time constraints. These represent
              the clearest next steps for a production version of the system.
            </p>

            <div className="ns-future-grid">
              {[
                {
                  icon: '🤝',
                  title: 'Multi-Astronaut Crew Sync',
                  body: 'Real-time shared HUD state between crew members — each astronaut sees a lightweight overlay of their partner\'s position, suit status, and critical alerts without HUD collision or information overload.',
                },
                {
                  icon: '🧠',
                  title: 'Adaptive Cognitive Load',
                  body: 'HUD density that adapts based on biometric signals (heart rate variance, gaze dwell patterns) — automatically collapsing secondary data when the operator enters peak cognitive load.',
                },
                {
                  icon: '🗺',
                  title: '3D Terrain Mapping',
                  body: 'Integration with real-time terrain scan data to project traversal path suggestions and hazard zones directly onto the lunar surface through the visor — turn-by-turn navigation on actual terrain.',
                },
              ].map(({ icon, title, body }, i) => (
                <div
                  key={title}
                  className="ns-future-card ns-reveal"
                  style={{ transitionDelay: `${i * 80}ms` }}
                >
                  <span className="ns-future-icon">{icon}</span>
                  <h3 className="ns-future-title">{title}</h3>
                  <p>{body}</p>
                </div>
              ))}
            </div>
          </section>

        </div>{/* /pd-container */}

        {/* ── Next / Prev navigation ── */}
        <NextProjectBanner nextProject={nextProject} prevProject={prevProject} />

      </main>

      <Footer />
    </>
  );
}
