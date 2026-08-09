import { Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import PlaceholderImage from '../../components/ui/PlaceholderImage';
import Tag from '../../components/ui/Tag';
import TableOfContents from '../../components/ui/TableOfContents';
import NextProjectBanner from '../../components/ui/NextProjectBanner';
import { projects } from '../../data/projects';
import '../../styles/project-detail.css';

const TOC_SECTIONS = [
  { id: 'pd-overview', label: 'Overview' },
  { id: 'pd-gallery', label: 'Gallery' },
  { id: 'pd-outcomes', label: 'Play!' },
];

export default function ProjectDetailPage({ slug }) {
  const project = projects.find((p) => p.slug === slug);
  const currentIndex = projects.findIndex((p) => p.slug === slug);
  const prevProject =
    slug === 'memento'
      ? projects.find((p) => p.slug === 'siemens')
      : currentIndex > 0
        ? projects[currentIndex - 1]
        : projects[projects.length - 1];
  const nextProject =
    currentIndex < projects.length - 1 ? projects[currentIndex + 1] : projects[0];
  const hasGallery = Boolean(project?.images?.length);
  const tocSections = TOC_SECTIONS.filter(
    (section) => section.id !== 'pd-gallery' || hasGallery
  );

  if (!project) {
    return (
      <>
        <Navbar />
        <main style={{ padding: 'var(--space-32) 0', textAlign: 'center' }}>
          <div className="container">
            <h1>Project not found</h1>
            <Link to="/">Back home</Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <TableOfContents
        sections={tocSections}
        projectTitle={project.title}
        accent={project.placeholderAccent}
        autoHideAfterId={hasGallery ? 'pd-gallery' : 'pd-overview'}
      />

      <main className={`project-detail${slug === 'memento' ? ' project-detail--memento' : ''}`}>
        <div className="pd-container">

          {project.detailHeroImage && (
            <div className="pd-hero-image pd-hero-image--inline">
              <img
                src={project.detailHeroImage}
                alt={`${project.title} product`}
                className="pd-hero-img"
              />
            </div>
          )}

          {/* ── Title + credits ── */}
          <div className="pd-intro" id="pd-overview">
            <header className="pd-header">
              <div className="pd-header__meta">
                <Tag label={project.category} categoryKey={project.categoryKey} />
                <span className="pd-header__year">{project.year}</span>
              </div>
              <h1 className="pd-header__title">{project.title}</h1>
              <p className="pd-header__subtitle">{project.subtitle}</p>
            </header>

            <div className="pd-credits">
              <div className="pd-credits__item">
                <span className="pd-credits__label">Role</span>
                <span className="pd-credits__value">{project.role}</span>
              </div>
              <div className="pd-credits__item">
                <span className="pd-credits__label">
                  {slug === 'memento' ? 'Team' : 'Company'}
                </span>
                <span className="pd-credits__value pd-credits__value--multiline">
                  {project.company}
                </span>
              </div>
              <div className="pd-credits__item">
                <span className="pd-credits__label">Duration</span>
                <span className="pd-credits__value">{project.duration}</span>
              </div>
            </div>
          </div>

          {/* ── Summary ── */}
          {project.summaryImage && (
            <div className="pd-hero-image pd-hero-image--inline pd-summary-image">
              <img
                src={project.summaryImage}
                alt={`${project.title} hero`}
                className="pd-hero-img"
              />
            </div>
          )}
          <p className="pd-summary">{project.summary}</p>

          {/* ── The Problem ── */}
          {slug !== 'memento' && (
            <section id="pd-problem" className="pd-section">
              <p className="pd-section__label">Challenge</p>
              <h2 className="pd-section__heading">The Problem</h2>
              <p className="pd-section__body">{project.challenge}</p>
            </section>
          )}

          {/* ── How I Worked ── */}
          {slug !== 'memento' && (
            <section id="pd-approach" className="pd-section">
              <p className="pd-section__label">Approach</p>
              <h2 className="pd-section__heading">How I Worked</h2>
              <p className="pd-section__body">{project.approach}</p>
            </section>
          )}

          {/* ── Gallery ── */}
          {hasGallery && (
            <section id="pd-gallery" className="pd-section pd-section--gallery">
              <p className="pd-section__label">Gallery</p>
              <div className="pd-gallery">
                {project.images.map((img) =>
                  img.src ? (
                    <figure
                      key={img.label}
                      className="pd-gallery__item"
                      style={img.aspect ? { aspectRatio: img.aspect } : undefined}
                    >
                      <img
                        src={img.src}
                        alt={img.label}
                        className="pd-gallery__img"
                        loading="lazy"
                      />
                    </figure>
                  ) : (
                    <PlaceholderImage
                      key={img.label}
                      color={project.placeholderColor}
                      accentColor={project.placeholderAccent}
                      aspect={img.aspect}
                      label={img.label}
                    />
                  )
                )}
              </div>
            </section>
          )}

          {/* ── Outcomes / Play ── */}
          <section id="pd-outcomes" className="pd-section">
            <p className="pd-section__label">
              {slug === 'memento' ? 'Play!' : 'Results'}
            </p>
            {slug === 'memento' ? (
              <>
                <div className="pd-play-video">
                  <video
                    src="/memento/testing.mp4"
                    autoPlay
                    muted
                    loop
                    playsInline
                    aria-label="Memento device in use"
                  />
                </div>
                <p className="pd-play-note">More process are coming...</p>
              </>
            ) : (
              <>
                <h2 className="pd-section__heading">Outcomes</h2>
                <ol className="pd-outcomes">
                  {project.outcomes.map((outcome, i) => (
                    <li key={outcome} className="pd-outcomes__item">
                      <span className="pd-outcomes__num">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="pd-outcomes__text">{outcome}</span>
                    </li>
                  ))}
                </ol>
              </>
            )}
          </section>

        </div>

        {/* ── Next / Prev navigation ── */}
        <NextProjectBanner nextProject={nextProject} prevProject={prevProject} />
      </main>
    </>
  );
}
