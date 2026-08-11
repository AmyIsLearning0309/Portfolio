import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { projects } from '../../data/projects.js';
import '../../styles/horizontal-projects.css';

/** True when the media box sits fully inside the viewport. */
function isThumbnailFullyVisible(mediaEl) {
  if (!mediaEl) return false;
  const rect = mediaEl.getBoundingClientRect();
  if (rect.width < 2 || rect.height < 2) return false;

  const tol = 2;
  return (
    rect.left >= -tol &&
    rect.right <= window.innerWidth + tol &&
    rect.top >= -tol &&
    rect.bottom <= window.innerHeight + tol
  );
}

const GIF_FADE_MS = 450;
const GIF_HOVER_DELAY_MS = 1000;

/**
 * Intro + project cards in a vertical stack (native page scroll).
 */
export default function HorizontalProjects() {
  const introRef = useRef(null);
  const mediaRefs = useRef({});
  const [gifState, setGifState] = useState(null); // { id, key, visible }
  const hoveredIdRef = useRef(null);
  const gifPlayIdRef = useRef(null);
  const gifFadeTimerRef = useRef(null);
  const gifHoverTimerRef = useRef(null);

  const clearGifFadeTimer = () => {
    if (gifFadeTimerRef.current != null) {
      window.clearTimeout(gifFadeTimerRef.current);
      gifFadeTimerRef.current = null;
    }
  };

  const clearGifHoverTimer = () => {
    if (gifHoverTimerRef.current != null) {
      window.clearTimeout(gifHoverTimerRef.current);
      gifHoverTimerRef.current = null;
    }
  };

  const hideGif = (id, { immediate = false } = {}) => {
    clearGifFadeTimer();
    clearGifHoverTimer();

    if (immediate) {
      if (gifPlayIdRef.current === id) gifPlayIdRef.current = null;
      setGifState((prev) => (prev?.id === id ? null : prev));
      return;
    }

    setGifState((prev) => {
      if (!prev || prev.id !== id) return prev;
      return { ...prev, visible: false };
    });

    gifFadeTimerRef.current = window.setTimeout(() => {
      gifFadeTimerRef.current = null;
      setGifState((prev) => (prev?.id === id && !prev.visible ? null : prev));
      if (gifPlayIdRef.current === id) gifPlayIdRef.current = null;
    }, GIF_FADE_MS);
  };

  const showGif = (project) => {
    if (!project.hoverImage) return;
    if (hoveredIdRef.current !== project.id) return;

    const mediaEl = mediaRefs.current[project.id];
    if (!isThumbnailFullyVisible(mediaEl)) return;

    clearGifFadeTimer();
    clearGifHoverTimer();
    gifPlayIdRef.current = project.id;

    setGifState((prev) => {
      if (prev?.id === project.id) {
        return { ...prev, visible: true };
      }
      return { id: project.id, key: Date.now(), visible: false };
    });

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setGifState((prev) =>
          prev?.id === project.id ? { ...prev, visible: true } : prev,
        );
      });
    });
  };

  const scheduleGifStart = (project) => {
    if (!project.hoverImage) return;
    if (gifHoverTimerRef.current != null) return;

    if (gifPlayIdRef.current === project.id) {
      showGif(project);
      return;
    }

    gifHoverTimerRef.current = window.setTimeout(() => {
      gifHoverTimerRef.current = null;
      if (hoveredIdRef.current !== project.id) return;
      showGif(project);
      if (gifPlayIdRef.current !== project.id && hoveredIdRef.current === project.id) {
        scheduleGifStart(project);
      }
    }, GIF_HOVER_DELAY_MS);
  };

  const handleCardEnter = (project) => {
    hoveredIdRef.current = project.id;
    scheduleGifStart(project);
  };

  const handleCardLeave = (project) => {
    if (hoveredIdRef.current === project.id) {
      hoveredIdRef.current = null;
    }
    clearGifHoverTimer();
    if (gifPlayIdRef.current === project.id) hideGif(project.id);
  };

  // Pause hover GIFs when the thumbnail scrolls out of view
  useEffect(() => {
    const onScroll = () => {
      const id = hoveredIdRef.current;
      if (!id) return;
      const project = projects.find((p) => p.id === id);
      if (!project?.hoverImage) return;

      const mediaEl = mediaRefs.current[id];
      if (!isThumbnailFullyVisible(mediaEl)) {
        clearGifHoverTimer();
        if (gifPlayIdRef.current === id) hideGif(id);
        return;
      }
      if (gifPlayIdRef.current !== id && gifHoverTimerRef.current == null) {
        scheduleGifStart(project);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      clearGifFadeTimer();
      clearGifHoverTimer();
    };
  }, []);

  return (
    <section
      className="hx hx--stacked"
      id="selected-works"
      aria-label="Introduction and selected works"
    >
      <div className="hx__stage">
        <div className="hx__track">
          <article className="hx__intro" ref={introRef} aria-label="Introduction">
            <div className="hx__intro-inner">
              <h1 className="hx__intro-heading">
                <span className="hx__intro-name">Amy Ai</span>
                <a
                  className="hx__intro-photo-link"
                  href="https://www.linkedin.com/in/amy-ai-a1b466229/"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor-label="Linkedin?"
                  aria-label="Amy Ai on LinkedIn"
                >
                  <img
                    className="hx__intro-photo"
                    src="/about/linkedin-profile.jpg"
                    alt="Amy Ai"
                    width={200}
                    height={200}
                  />
                </a>
              </h1>
              <p className="hx__intro-tagline">
                Product Designer
              </p>
            </div>

            <div className="hx__intro-foot">
              <p className="hx__intro-subtitle">
                <span className="hx__intro-role">
                  Current{' '}
                  <a
                    href="https://joinmochi.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hx__intro-link"
                  >
                    <span className="hx__intro-at" aria-hidden="true">@</span>
                    <img
                      className="hx__intro-favicon"
                      src="/brands/mochi-icon.webp"
                      alt=""
                      width={14}
                      height={14}
                      decoding="async"
                    />
                    <span className="hx__intro-brand">Mochi Health</span>
                  </a>
                </span>
                <span className="hx__intro-role">
                  Prev.{' '}
                  <a
                    href="https://www.sw.siemens.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hx__intro-link"
                  >
                    <span className="hx__intro-at" aria-hidden="true">@</span>
                    <img
                      className="hx__intro-favicon"
                      src="/brands/siemens-icon.svg"
                      alt=""
                      width={14}
                      height={14}
                      decoding="async"
                    />
                    <span className="hx__intro-brand">
                      Siemens Industrial Digital Software Inc.
                    </span>
                  </a>
                </span>
              </p>
            </div>
          </article>

          <div className="hx__projects">
            {projects.map((project) => {
              const isGifMounted = gifState?.id === project.id;
              const isGifVisible = isGifMounted && gifState.visible;
              const isExternal = Boolean(project.externalUrl);
              const isPreviewOnly = Boolean(project.previewOnly) && !isExternal;
              const CardTag = isExternal ? 'a' : isPreviewOnly ? 'div' : Link;
              const cardProps = isExternal
                ? {
                    href: project.externalUrl,
                    target: '_blank',
                    rel: 'noopener noreferrer',
                    'aria-label': `Open ${project.title} (opens in a new tab)`,
                  }
                : isPreviewOnly
                  ? {
                      'aria-label': project.title,
                    }
                  : {
                      to: `/work/${project.slug}`,
                      'aria-label': `Open ${project.title} case study`,
                      onClick: () => {
                        document.documentElement.classList.remove('hx-scroll-snap');
                        document.documentElement.classList.remove('sd-howto-scroll-snap');
                        const html = document.documentElement;
                        const prev = html.style.scrollBehavior;
                        html.style.scrollBehavior = 'auto';
                        window.scrollTo(0, 0);
                        document.scrollingElement && (document.scrollingElement.scrollTop = 0);
                        html.scrollTop = 0;
                        document.body.scrollTop = 0;
                        html.style.scrollBehavior = prev;
                      },
                    };

              return (
                <CardTag
                  key={project.id}
                  {...cardProps}
                  className={`hx__card${isGifVisible ? ' hx__card--gif-playing' : ''}${
                    isExternal ? ' hx__card--external' : isPreviewOnly ? ' hx__card--preview' : ''
                  }`}
                >
                  <div
                    className="hx__card-media"
                    ref={(el) => {
                      if (el) mediaRefs.current[project.id] = el;
                      else delete mediaRefs.current[project.id];
                    }}
                    style={{ background: project.placeholderColor }}
                    onMouseEnter={() => handleCardEnter(project)}
                    onMouseLeave={() => handleCardLeave(project)}
                    onFocus={() => handleCardEnter(project)}
                    onBlur={() => handleCardLeave(project)}
                    {...(project.externalUrl
                      ? { 'data-cursor-label': project.externalUrl.replace(/^https?:\/\//, '').replace(/\/$/, '') }
                      : {})}
                  >
                    {project.heroImage ? (
                      <>
                        <img
                          src={project.heroImage}
                          alt=""
                          className={`hx__card-img${project.slug === 'rec-o' ? ' hx__card-img--rec-o' : ''}`}
                        />
                        {project.hoverImage && isGifMounted && (
                          <img
                            key={gifState.key}
                            src={`${project.hoverImage}?restart=${gifState.key}`}
                            alt=""
                            className={`hx__card-img hx__card-img--hover${
                              isGifVisible ? ' hx__card-img--hover-visible' : ''
                            }`}
                            aria-hidden="true"
                          />
                        )}
                      </>
                    ) : (
                      <div
                        className="hx__card-wash"
                        style={{ background: project.placeholderAccent }}
                      />
                    )}
                  </div>
                </CardTag>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
