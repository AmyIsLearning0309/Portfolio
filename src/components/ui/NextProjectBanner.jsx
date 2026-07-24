import { Link } from 'react-router-dom';
import '../../styles/next-project-banner.css';

export default function NextProjectBanner({ nextProject, prevProject }) {
  return (
    <section className="npb-section">

      {/* ── Next project — immersive full-bleed banner ── */}
      {nextProject && (
        <Link to={`/work/${nextProject.slug}`} className="npb-banner">

          {/* Background — hero photo if available, coloured grid pattern as fallback */}
          <div
            className="npb-bg"
            style={
              nextProject.heroImage
                ? {
                    backgroundImage: `url(${nextProject.heroImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }
                : {
                    backgroundColor: nextProject.placeholderColor,
                    backgroundImage: [
                      `repeating-linear-gradient(0deg, transparent, transparent 40px, ${nextProject.placeholderAccent}12 40px, ${nextProject.placeholderAccent}12 41px)`,
                      `repeating-linear-gradient(90deg, transparent, transparent 40px, ${nextProject.placeholderAccent}12 40px, ${nextProject.placeholderAccent}12 41px)`,
                    ].join(', '),
                  }
            }
          />

          {/* Gradient overlay for text legibility */}
          <div className="npb-overlay" />

          {/* Text content — bottom-right */}
          <div className="npb-content">
            <span className="npb-eyebrow">Next Project</span>
            <h2 className="npb-title">{nextProject.title}</h2>
            <p className="npb-subtitle">{nextProject.subtitle}</p>
            <div className="npb-cta">
              <span className="npb-cta-text">View Case Study</span>
              <span className="npb-cta-arrow">→</span>
            </div>
          </div>

        </Link>
      )}

      {/* ── Previous project — slim, understated ── */}
      {prevProject && (
        <div className="npb-prev-bar">
          <Link to={`/work/${prevProject.slug}`} className="npb-prev-link">
            <span className="npb-prev-arrow">←</span>
            <span className="npb-prev-text">
              <span className="npb-prev-label">Previous</span>
              <span className="npb-prev-title">{prevProject.title}</span>
            </span>
          </Link>
        </div>
      )}

    </section>
  );
}
