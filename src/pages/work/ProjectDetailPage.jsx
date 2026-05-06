import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import PlaceholderImage from '../../components/ui/PlaceholderImage';
import Tag from '../../components/ui/Tag';
import TableOfContents from '../../components/ui/TableOfContents';
import NextProjectBanner from '../../components/ui/NextProjectBanner';
import { projects } from '../../data/projects';
import '../../styles/project-detail.css';

const TOC_SECTIONS = [
  { id: 'pd-overview', label: 'Overview' },
  { id: 'pd-problem', label: 'The Problem' },
  { id: 'pd-approach', label: 'How I Worked' },
  { id: 'pd-gallery', label: 'Gallery' },
  { id: 'pd-outcomes', label: 'Outcomes' },
];

export default function ProjectDetailPage({ slug }) {
  const project = projects.find((p) => p.slug === slug);
  const currentIndex = projects.findIndex((p) => p.slug === slug);
  const prevProject = currentIndex > 0 ? projects[currentIndex - 1] : projects[projects.length - 1];
  const nextProject = currentIndex < projects.length - 1 ? projects[currentIndex + 1] : projects[0];

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
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <TableOfContents sections={TOC_SECTIONS} projectTitle={project.title} />

      <main className="project-detail">
        <div className="pd-container">

          {/* ── Hero image ── */}
          <div className="pd-hero-image">
            <PlaceholderImage
              color={project.placeholderColor}
              accentColor={project.placeholderAccent}
              aspect="16/9"
              label={project.title}
            />
          </div>

          {/* ── Title block ── */}
          <header className="pd-header" id="pd-overview">
            <div className="pd-header__meta">
              <Tag label={project.category} categoryKey={project.categoryKey} />
              <span className="pd-header__year">{project.year}</span>
            </div>
            <h1 className="pd-header__title">{project.title}</h1>
            <p className="pd-header__subtitle">{project.subtitle}</p>
          </header>

          {/* ── Credits row ── */}
          <div className="pd-credits">
            <div className="pd-credits__item">
              <span className="pd-credits__label">Role</span>
              <span className="pd-credits__value">{project.role}</span>
            </div>
            <div className="pd-credits__item">
              <span className="pd-credits__label">Company</span>
              <span className="pd-credits__value">{project.company}</span>
            </div>
            <div className="pd-credits__item">
              <span className="pd-credits__label">Duration</span>
              <span className="pd-credits__value">{project.duration}</span>
            </div>
          </div>

          {/* ── Summary ── */}
          <p className="pd-summary">{project.summary}</p>

          {/* ── Tags ── */}
          <div className="pd-tags">
            {project.tags.map((tag) => (
              <Tag key={tag} label={tag} categoryKey="default" />
            ))}
          </div>

          {/* ── The Problem ── */}
          <section id="pd-problem" className="pd-section">
            <p className="pd-section__label">Challenge</p>
            <h2 className="pd-section__heading">The Problem</h2>
            <p className="pd-section__body">{project.challenge}</p>
          </section>

          {/* ── How I Worked ── */}
          <section id="pd-approach" className="pd-section">
            <p className="pd-section__label">Approach</p>
            <h2 className="pd-section__heading">How I Worked</h2>
            <p className="pd-section__body">{project.approach}</p>
          </section>

          {/* ── Gallery ── */}
          <section id="pd-gallery" className="pd-section pd-section--gallery">
            <p className="pd-section__label">Gallery</p>
            <div className="pd-gallery">
              {project.images.map((img) => (
                <PlaceholderImage
                  key={img.label}
                  color={project.placeholderColor}
                  accentColor={project.placeholderAccent}
                  aspect={img.aspect}
                  label={img.label}
                />
              ))}
            </div>
          </section>

          {/* ── Outcomes ── */}
          <section id="pd-outcomes" className="pd-section">
            <p className="pd-section__label">Results</p>
            <h2 className="pd-section__heading">Outcomes</h2>
            <ol className="pd-outcomes">
              {project.outcomes.map((outcome, i) => (
                <li key={outcome} className="pd-outcomes__item">
                  <span className="pd-outcomes__num">{String(i + 1).padStart(2, '0')}</span>
                  <span className="pd-outcomes__text">{outcome}</span>
                </li>
              ))}
            </ol>
          </section>

        </div>

        {/* ── Next / Prev navigation ── */}
        <NextProjectBanner nextProject={nextProject} prevProject={prevProject} />
      </main>

      <Footer />
    </>
  );
}
