import { useEffect, useRef, useState } from 'react';
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

function CaseVideo({ src, poster, caption, wide, zoom }) {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const formatTime = (secs) => {
    if (!Number.isFinite(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const togglePlay = () => {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) el.play();
    else el.pause();
  };

  const onSeek = (e) => {
    const el = videoRef.current;
    if (!el || !duration) return;
    const next = Number(e.target.value) * duration;
    el.currentTime = next;
    setCurrentTime(next);
  };

  const progress = duration > 0 ? currentTime / duration : 0;

  return (
    <figure className={`ro-media${wide ? ' ro-media--wide' : ''}`}>
      <div
        className={`ro-media__frame ro-media__frame--video${
          zoom ? ' ro-media__frame--zoom' : ''
        }`}
      >
        {zoom ? (
          <>
            <div className="ro-media__zoom-clip">
              <video
                ref={videoRef}
                src={src}
                poster={poster}
                playsInline
                preload="metadata"
                loop
                onClick={togglePlay}
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)}
                onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime || 0)}
              />
            </div>
            <div className="ro-media__controls">
              <button
                type="button"
                className="ro-media__controls-play"
                onClick={togglePlay}
                aria-label={playing ? 'Pause' : 'Play'}
              >
                {playing ? '❚❚' : '▶'}
              </button>
              <span className="ro-media__controls-time">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
              <input
                className="ro-media__controls-seek"
                type="range"
                min="0"
                max="1"
                step="0.001"
                value={progress || 0}
                onChange={onSeek}
                aria-label="Seek"
              />
            </div>
          </>
        ) : (
          <video
            src={src}
            poster={poster}
            controls
            playsInline
            preload="metadata"
            loop
          />
        )}
      </div>
      {caption && <figcaption className="ro-media__caption">{caption}</figcaption>}
    </figure>
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
  const prevProject = projects.find((p) => p.slug === 'siemens') || (currentIndex > 0 ? projects[currentIndex - 1] : projects[projects.length - 1]);
  const nextProject =
    currentIndex < projects.length - 1 ? projects[currentIndex + 1] : projects[0];

  return (
    <>
      <Navbar />
      <TableOfContents
        sections={TOC_SECTIONS}
        projectTitle={project.title}
        accent="#C45C6A"
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
            <p className="ro-live-cue">
              <a href={LIVE_URL} target="_blank" rel="noopener noreferrer">
                Click to view the functional website →
              </a>
            </p>
          </header>

          <div className="pd-credits">
            <div className="pd-credits__item">
              <span className="pd-credits__label">Company</span>
              <span className="pd-credits__value">Rhode Island School of Design</span>
            </div>
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

          <CaseVideo
            src="/rec-o/hero-demo.mp4"
            poster="/rec-o/hero-ui.png"
            caption="REC-O product demo — software + wearable coaching system"
            wide
            zoom
          />

          {/* ── Overview ── */}
          <section className="pd-section ro-reveal">
            <p className="pd-section__label">Overview</p>
            <h2 className="pd-section__heading">A coach that grows with you</h2>
            <p className="pd-section__body">
              <strong>Rec-O</strong> is a communication-coaching system designed to help
              young professionals speak with clarity and confidence in professional
              settings. The system combines a digital application powered by an LLM
              backend (<em>Rec</em>) with a wearable voice-recording accessory (<em>O</em>).
            </p>
            <p className="pd-section__body">
              Together, they create a personalized communication coach that grows with
              the user by tracking progress, offering insights, and delivering actionable
              feedback to strengthen communication skills over time.
            </p>

            <div className="ro-pair">
              <CaseImage
                src="/rec-o/overview-product.jpg"
                alt="REC-O hardware pin and phone app on concrete blocks"
                caption="Hardware pin (O) alongside the Rec coaching interface"
              />
              <CaseImage
                src="/rec-o/overview-device.png"
                alt="Close-up of the REC-O wearable recording pin"
                caption="O — wearable voice-recording pin"
              />
            </div>

            <div className="ro-split">
              <div className="ro-split__card">
                <h3 className="ro-split__title">Rec (Software)</h3>
                <p>
                  Supports young professionals before and after networking moments. It
                  helps users prepare introductions, explore conversation strategies,
                  reflect on interactions, and identify specific areas for improvement.
                  It also keeps a record of past conversations and personalized growth
                  insights.
                </p>
              </div>
              <div className="ro-split__card">
                <h3 className="ro-split__title">O (Hardware)</h3>
                <p>
                  A wearable voice-recording pin worn during networking events. Acting as
                  the user’s closest listener, O captures real-time speech data and sends
                  it to Rec for transcription and detailed analysis — an unobtrusive way
                  to understand communication patterns and accelerate growth.
                </p>
              </div>
            </div>
          </section>

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
            <CaseVideo
              src="/rec-o/rec-software.mp4"
              poster="/rec-o/hero-ui.png"
              caption="Rec software walkthrough — preparation, reflection, and growth insights"
              wide
            />
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
            <CaseVideo
              src="/rec-o/performance-analysis.mp4"
              caption="Session analysis flow — from recording to actionable feedback"
              wide
            />
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
            <CaseImage
              src="/rec-o/architecture.png"
              alt="REC-O system architecture diagram"
              caption="System architecture — capture, process, and coach loop"
              wide
            />
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
            <CaseImage
              src="/rec-o/prototypes-2.png"
              alt="Final hardware prototype assemblies"
              caption="Refined assemblies — packing the recording stack tightly"
              wide
            />
          </section>
        </div>

        <NextProjectBanner nextProject={nextProject} prevProject={prevProject} />
      </main>
    </>
  );
}
