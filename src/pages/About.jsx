import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import '../styles/about.css';

const photos = [
  { src: '/about/photo-1.jpg', alt: 'Amy with a drum kit', side: 'left' },
  { src: '/about/photo-2.png', alt: 'Green cocktail at a bar', side: 'right' },
  { src: '/about/photo-3.jpg', alt: 'Workshop lathe', side: 'left' },
  { src: '/about/photo-4.jpg', alt: 'Studio shelf with flowers', side: 'right' },
];

/* Paste Google Drive resume URL when ready */
const RESUME_URL = '#';

const experience = [
  {
    org: 'Mochi Health',
    role: 'Associate Designer',
    dates: 'May 2026 – Present',
    desc: '',
  },
  {
    org: 'Siemens Industry Software Inc.',
    role: 'UX-Design System Intern',
    dates: 'Jun 2025 – Sep 2025',
    desc: 'Designed and prototyped a data-driven AI agent tool that accelerated UX team productivity by 97% during agile workflows.',
  },
  {
    org: 'Good Measure',
    role: 'Creative Designer',
    dates: 'Jul 2024 – Oct 2024',
    desc: "Designed brand identity for MBA player Vanderbilt's personal clothing brand Vando.",
  },
  {
    org: 'NASA SUITS',
    role: 'UI/UX Designer',
    dates: 'Sep 2023 – May 2024',
    desc: 'Designed an AR heads-up display interface for astronaut spacesuit use cases. Reached the national top-10 finals.',
  },
  {
    org: 'Guangzhou Automobile Group, Ltd.',
    role: 'UI/UX Designer',
    dates: 'Jun 2023 – Sep 2023',
    desc: 'Designed UI dashboard and carbon fibre seating for the R&D Engineering team.',
  },
];

export default function About() {
  return (
    <>
      <Navbar />
      <main className="about">
        {/* ── Sticky bio + floating photo collage ── */}
        <section className="about__story" aria-label="About Amy">
          <div className="about__story-sticky">
            <p className="about__bio">
              I&apos;m Amy Ai, a product designer who is passionate about crafting
              experiences that connect people with technology in intuitive ways.
              <br />
              <br />
              When I&apos;m not heads down at working on pixels,
              you&apos;ll catch me running outdoor with the sunset, trying to find
              the best speakeasy bar in town, or making random analog sounds with
              ARP2500.
            </p>
          </div>

          <div className="about__collage" aria-hidden="true">
            {photos.map((photo) => (
              <figure
                key={photo.src}
                className={`about__collage-item about__collage-item--${photo.side}`}
              >
                <img
                  src={photo.src}
                  alt=""
                  className="about__collage-img"
                  loading="lazy"
                />
              </figure>
            ))}
          </div>
        </section>

        {/* ── Experience ── */}
        <section className="about__experience" aria-label="Experience">
          <div className="container about__experience-inner">
            <a
              className="about__exp-dates about__exp-resume"
              href={RESUME_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View resume (opens in a new tab)"
            >
              Resume
              <span className="about__exp-resume-arrow" aria-hidden="true">
                ↗
              </span>
            </a>
            <ul className="about__exp-list">
              {experience.map((entry) => (
                <li key={entry.org} className="about__exp-item">
                  <div className="about__exp-company">
                    <p className="about__exp-org">{entry.org}</p>
                    <p className="about__exp-dates">{entry.dates}</p>
                  </div>
                  <div className="about__exp-detail">
                    <p className="about__exp-role">{entry.role}</p>
                    {entry.desc ? (
                      <p className="about__exp-desc">{entry.desc}</p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── Connect ── */}
        <section className="about__connect" aria-label="Connect">
          <div className="container about__connect-inner">
            <nav className="about__connect-col about__connect-col--site" aria-label="Site">
              <Link to="/">Work</Link>
            </nav>
            <div className="about__connect-contact">
              <nav className="about__connect-col about__connect-col--contact" aria-label="Contact">
                <a
                  href="tel:+18182556234"
                  aria-label="Call +1 (818) 255-6234"
                  title="+1 (818) 255-6234"
                >
                  Phone
                </a>
                <a
                  href="mailto:aiamy0309@gmail.com"
                  aria-label="Email aiamy0309@gmail.com"
                  title="aiamy0309@gmail.com"
                >
                  Email
                </a>
                <a
                  href="/resume.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="View resume (PDF)"
                  title="View resume"
                >
                  Resume
                </a>
                <a
                  href="https://www.linkedin.com/in/amyai"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  LinkedIn
                </a>
              </nav>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
