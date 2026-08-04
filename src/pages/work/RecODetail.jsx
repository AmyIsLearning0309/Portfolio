import { useEffect, useRef } from 'react';
import Navbar from '../../components/layout/Navbar';
import Tag from '../../components/ui/Tag';
import TableOfContents from '../../components/ui/TableOfContents';
import NextProjectBanner from '../../components/ui/NextProjectBanner';
import { projects } from '../../data/projects';
import '../../styles/project-detail.css';
import '../../styles/reco-detail.css';

const LIVE_URL = 'https://rec-o-production.up.railway.app/';

const TOC_SECTIONS = [
  { id: 'ro-overview', label: 'Overview' },
  { id: 'ro-rec', label: 'REC (Software)' },
  { id: 'ro-hardware', label: 'O (Hardware)' },
  { id: 'ro-performance', label: 'Performance Analysis' },
  { id: 'ro-architecture', label: 'System Architecture' },
  { id: 'ro-form', label: 'Form Inspiration' },
  { id: 'ro-prototypes', label: 'Iterations' },
];

function CaseImage({ src, alt, caption, wide }) {
  return (
    <figure className={`ro-media${wide ? ' ro-media--wide' : ''}`}>
      <div className="ro-media__frame">
        <img src={src} alt={alt} loading="lazy" />
      </div>
      {caption && <figcaption className="ro-media__caption">{caption}</figcaption>}
    </figure>
  );
}

/** Muted autoplaying loop — behaves like a GIF */
function LoopClip({ src, label }) {
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

  return (
    <figure className="ro-media ro-media--gif-left">
      <div className="ro-media__frame ro-media__frame--gif">
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
  { src: '/rec-o/f-insight.mp4', label: 'Rec Insights tab looping preview' },
  { src: '/rec-o/f-highlight.mp4', label: 'Rec Highlight tab looping preview' },
  { src: '/rec-o/f-transcript.mp4', label: 'Rec Transcript tab looping preview' },
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
  const prevProject = projects.find((p) => p.slug === 'siemens') || (currentIndex > 0 ? projects[currentIndex - 1] : projects[projects.length - 1]);
  const nextProject =
    projects.find((p) => p.slug === 'nasa-suit') ||
    (currentIndex < projects.length - 1 ? projects[currentIndex + 1] : projects[0]);

  return (
    <>
      <Navbar />
      <TableOfContents
        sections={TOC_SECTIONS}
        projectTitle={project.title}
        accent="#111111"
        autoHideAfterId="ro-rec"
      />

      <main className="project-detail reco-detail">
        <div className="pd-container">
          {/* ── Header ── */}
          <header className="pd-header" id="ro-overview">
            <div className="pd-header__meta">
              <Tag label="Interaction Design" categoryKey="ux" />
              <Tag label="Accessibility" categoryKey="ux" />
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
              An LLM-backed coaching system that helps young professionals improve
              communication skills at high-stakes moments.
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
                Audio Recording Hardware · LLM-Backed Website
              </span>
            </div>
          </div>

          <CaseImage
            src="/rec-o/reco-hero.png"
            alt="REC-O wearable pin and coaching app on concrete"
            wide
          />

          {/* ── REC Software ── */}
          <section id="ro-rec" className="pd-section ro-reveal">
            <p className="pd-section__label">REC · Software</p>
            <h2 className="pd-section__heading">Before and after the conversation</h2>
            <p className="pd-section__body">
              <strong>Rec</strong> supports young professionals before and after
              networking moments. It helps users prepare introductions, explore
              conversation strategies, reflect on interactions, and identify specific
              areas for improvement. It also keeps a record of past conversations and
              personalized growth insights.
            </p>
            <div className="ro-gif-row">
              {REC_FEATURE_CLIPS.map((clip) => (
                <LoopClip key={clip.src} src={clip.src} label={clip.label} />
              ))}
            </div>
          </section>

          {/* ── O Hardware ── */}
          <section id="ro-hardware" className="pd-section ro-reveal">
            <p className="pd-section__label">O · Hardware</p>
            <h2 className="pd-section__heading">Your closest listener</h2>
            <p className="pd-section__body">
              <strong>O</strong> is a wearable voice-recording pin worn during networking
              events. Acting as the user’s closest listener, O captures real-time speech
              data and sends it to Rec for transcription and detailed analysis, providing
              an unobtrusive way to understand communication patterns and accelerate
              growth.
            </p>
            <CaseImage
              src="/rec-o/hardware-strip.jpg"
              alt="REC-O wearable pin worn on a jacket lapel"
              caption="O worn during networking — compact, discreet, always listening"
              wide
            />
          </section>

          {/* ── Performance Analysis ── */}
          <section id="ro-performance" className="pd-section ro-reveal">
            <p className="pd-section__label">Performance Analysis</p>
            <h2 className="pd-section__heading">Reflect after every session</h2>
            <p className="pd-section__body">
              After recording, O automatically sends recording details to REC for session
              analysis. The user can reflect on their session for future improvements.
            </p>
          </section>

          {/* ── Architecture ── */}
          <section id="ro-architecture" className="pd-section ro-reveal">
            <p className="pd-section__label">Development · System Architecture</p>
            <h2 className="pd-section__heading">How information moves through the system</h2>
            <p className="pd-section__body">
              This graph indicates how the software system receives and processes
              information — from capture on O through transcription, LLM analysis, and
              feedback surfaced in Rec.
            </p>
            <div className="ro-pair ro-pair--stack">
              <CaseImage
                src="/rec-o/architecture-detail-1.jpg"
                alt="Architecture detail — data processing pipeline"
              />
              <CaseImage
                src="/rec-o/architecture-detail-2.jpg"
                alt="Architecture detail — feedback delivery"
              />
            </div>
          </section>

          {/* ── Form Inspiration ── */}
          <section id="ro-form" className="pd-section ro-reveal">
            <p className="pd-section__label">Form Inspiration</p>
            <h2 className="pd-section__heading">Accessory, not apparatus</h2>
            <p className="pd-section__body">
              Exploring natural hand-held shape form factors, while considering the
              aesthetic as something that can become an accessory that doesn’t catch a
              lot of attention while wearing it.
            </p>
            <CaseImage
              src="/rec-o/form-inspiration.jpg"
              alt="Form studies and material inspiration for the REC-O pin"
              caption="Form studies — natural shapes that read as jewelry, not gear"
              wide
            />
          </section>

          {/* ── Prototypes ── */}
          <section id="ro-prototypes" className="pd-section ro-reveal">
            <p className="pd-section__label">Iterations · Prototypes</p>
            <h2 className="pd-section__heading">Fitting the stack into something small</h2>
            <p className="pd-section__body">
              Exploring different size, shape, and interior arrangements to ensure all of
              the hardware components fit within the most compact way possible.
            </p>
            <CaseImage
              src="/rec-o/prototypes-1.png"
              alt="Hardware prototype iterations — size and layout studies"
              caption="Prototype iterations — size, shape, and component layout"
              wide
            />
          </section>
        </div>

        <NextProjectBanner nextProject={nextProject} prevProject={prevProject} />
      </main>
    </>
  );
}
