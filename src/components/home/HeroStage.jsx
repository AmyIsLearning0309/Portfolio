import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import SplineBlob from '../ui/SplineBlob';
import { projects } from '../../data/projects.js';
import '../../styles/hero-stage.css';

const TOTAL_CARDS = projects.length;
const TYPING_TEXT = "Hello, I'm Amy Ai.";
const TYPING_SPEED = 60; // ms per character

// Threshold to reach first card (intentionally higher — feels more deliberate)
const ENTRY_THRESHOLD = 180;
// Threshold between subsequent cards (snappier once inside)
const STEP_THRESHOLD = 120;

export default function HeroStage() {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState('up'); // 'up' | 'down' — drives animation
  const [typedText, setTypedText] = useState('');
  const [typingDone, setTypingDone] = useState(false);
  const stageRef = useRef(null);

  const stepRef = useRef(0);
  const lockedRef = useRef(true);
  const accRef = useRef(0);
  const lastWheelTime = useRef(0);
  const isSteppingRef = useRef(false);

  const setStepSynced = (val, dir = 'up') => {
    stepRef.current = val;
    setDirection(dir);
    setStep(val);
  };

  // ── Typing animation on mount ──
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setTypedText(TYPING_TEXT.slice(0, i));
      if (i >= TYPING_TEXT.length) {
        clearInterval(interval);
        setTypingDone(true);
      }
    }, TYPING_SPEED);
    return () => clearInterval(interval);
  }, []);

  // ── Wheel handler ──
  useEffect(() => {
    const handler = (e) => {
      if (!lockedRef.current) return;
      if (window.scrollY > 50) return;

      e.preventDefault();
      e.stopPropagation();

      const now = Date.now();
      if (now - lastWheelTime.current > 600) accRef.current = 0;
      lastWheelTime.current = now;
      accRef.current += e.deltaY;

      // Use a higher threshold to enter from step 0 → 1
      const threshold = stepRef.current === 0 ? ENTRY_THRESHOLD : STEP_THRESHOLD;

      if (accRef.current > threshold && !isSteppingRef.current) {
        accRef.current = 0;
        isSteppingRef.current = true;
        setTimeout(() => { isSteppingRef.current = false; }, 700);

        const next = stepRef.current + 1;
        if (next > TOTAL_CARDS) {
          lockedRef.current = false;
        } else {
          setStepSynced(next, 'up'); // new card slides up from bottom
        }
      } else if (accRef.current < -threshold && !isSteppingRef.current) {
        accRef.current = 0;
        isSteppingRef.current = true;
        setTimeout(() => { isSteppingRef.current = false; }, 700);

        const next = stepRef.current - 1;
        setStepSynced(Math.max(0, next), 'down'); // card slides down (reverse)
      }
    };

    window.addEventListener('wheel', handler, { passive: false, capture: true });
    return () => window.removeEventListener('wheel', handler, { capture: true });
  }, []);

  // ── Re-lock on scroll back to top ──
  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY < 10 && !lockedRef.current) {
        lockedRef.current = true;
        setStepSynced(0, 'down');
        accRef.current = 0;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isShowingWork = step >= 1;
  const activeProject = isShowingWork ? projects[step - 1] : null;

  return (
    <section className="hs" ref={stageRef} aria-label="Hero and selected works">

      {/* Spline background */}
      <div className={`hs__spline ${isShowingWork ? 'hs__spline--dim' : ''}`}>
        <SplineBlob />
      </div>

      {/* LEFT PANEL */}
      <div className={`hs__left ${isShowingWork ? 'hs__left--shrunk' : ''}`}>
        <div className="hs__left-inner">

          <p className="hs__eyebrow">
            {isShowingWork
              ? `${step} / ${TOTAL_CARDS}`
              : 'Providence, RI · UX Design System Intern @ Siemens'}
          </p>

          <h1 className={`hs__heading ${isShowingWork ? 'hs__heading--small' : ''}`}>
            {isShowingWork
              ? activeProject.title
              : (
                <>
                  {typedText}
                  {!typingDone && <span className="hs__cursor" aria-hidden="true">|</span>}
                </>
              )}
          </h1>

          <p className="hs__subtitle">
            {isShowingWork
              ? activeProject.subtitle
              : 'I craft products, interactions & design systems.'}
          </p>

          {/* Work meta — only when showing a card */}
          {isShowingWork && (
            <div className="hs__work-meta">
              <div className="hs__tags">
                {activeProject.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="hs__tag">{tag}</span>
                ))}
              </div>
              <Link to={`/work/${activeProject.slug}`} className="hs__case-link">
                View case study
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>
          )}

          {/* Progress dots */}
          <div className="hs__dots">
            {projects.map((_, i) => (
              <button
                key={i}
                className={`hs__dot ${step === i + 1 ? 'hs__dot--active' : ''} ${step === 0 ? 'hs__dot--idle' : ''}`}
                onClick={() => {
                  const dir = i + 1 > stepRef.current ? 'up' : 'down';
                  setStepSynced(i + 1, dir);
                  lockedRef.current = true;
                }}
                aria-label={`View project ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className={`hs__right ${isShowingWork ? 'hs__right--visible' : ''}`}>
        {projects.map((project, i) => {
          const isActive = step === i + 1;
          const isPrev = step > i + 1;  // already passed — sits above (exited up)
          const isNext = step < i + 1;  // not yet reached — sits below

          return (
            <div
              key={project.id}
              className={[
                'hs__card',
                isActive ? 'hs__card--active' : '',
                isPrev  ? 'hs__card--prev'   : '',
                isNext  ? 'hs__card--next'   : '',
              ].filter(Boolean).join(' ')}
              aria-hidden={!isActive}
            >
              {/* Clickable cover image → case study page */}
              <Link
                to={`/work/${project.slug}`}
                className="hs__card-image-link"
                tabIndex={isActive ? 0 : -1}
                aria-label={`Open ${project.title} case study`}
              >
                <div
                  className="hs__card-image"
                  style={{ background: project.placeholderColor }}
                >
                  <div
                    className="hs__card-image-wash"
                    style={{ background: project.placeholderAccent }}
                  />
                  <span className="hs__card-image-label">{project.images[0]?.label}</span>
                  {/* Hover overlay */}
                  <div className="hs__card-image-overlay" aria-hidden="true">
                    <span>View case study →</span>
                  </div>
                </div>
              </Link>

              <div className="hs__card-foot">
                <span className="hs__card-category">{project.category} · {project.year}</span>
              </div>
            </div>
          );
        })}

        <p className="hs__scroll-hint" aria-hidden="true">
          {step < TOTAL_CARDS ? 'scroll for next' : 'scroll to continue'}
        </p>
      </div>

      {/* Scroll cue — step 0 only */}
      {!isShowingWork && (
        <div className="hs__scroll-cue" aria-hidden="true">
          <span>scroll to view works</span>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 3v10M4 9l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}
    </section>
  );
}
