import { Link } from 'react-router-dom';
import '../../styles/next-project-banner.css';

function scrollPageToTop() {
  document.documentElement.classList.remove('hx-scroll-snap');
  document.documentElement.classList.remove('sd-howto-scroll-snap');
  const html = document.documentElement;
  const prev = html.style.scrollBehavior;
  html.style.scrollBehavior = 'auto';
  window.scrollTo(0, 0);
  if (document.scrollingElement) document.scrollingElement.scrollTop = 0;
  html.scrollTop = 0;
  document.body.scrollTop = 0;
  html.style.scrollBehavior = prev;
}

export default function NextProjectBanner({ nextProject, prevProject }) {
  return (
    <section className="npb-section">
      {/* ── Previous project — slim strip above next banner ── */}
      {prevProject && (
        <div className="npb-prev-bar">
          <Link
            to={`/work/${prevProject.slug}`}
            className="npb-prev-link"
            onClick={scrollPageToTop}
          >
            <span className="npb-prev-text">
              <span className="npb-prev-label">Previous</span>
              <span className="npb-prev-title">{prevProject.title}</span>
            </span>
          </Link>
        </div>
      )}

      {/* ── Next project — text-height banner with cover image ── */}
      {nextProject && (
        <Link
          to={`/work/${nextProject.slug}`}
          className="npb-banner"
          onClick={scrollPageToTop}
        >
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

          <div className="npb-overlay" />

          <div className="npb-content">
            <span className="npb-eyebrow">Next Project</span>
            <h2 className="npb-title">{nextProject.title}</h2>
          </div>
        </Link>
      )}
    </section>
  );
}
