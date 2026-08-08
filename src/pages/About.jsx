import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import '../styles/about.css';

const photos = [
  { src: '/about/photo-1.jpg', alt: 'Amy with a drum kit', side: 'left' },
  { src: '/about/photo-2.png', alt: 'Green cocktail at a bar', side: 'right' },
  { src: '/about/photo-3.jpg', alt: 'Workshop lathe', side: 'left' },
  { src: '/about/photo-4.jpg', alt: 'Studio shelf with flowers', side: 'right' },
];

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
    dates: 'June 2025 – September 2025',
    desc: 'Designed and prototyped a data-driven AI agent tool that accelerated UX team productivity by 97% during agile workflows.',
  },
  {
    org: 'Good Measure',
    role: 'Creative Designer',
    dates: 'July 2024 – October 2024',
    desc: "Designed brand identity for MBA player Vanderbilt's personal clothing brand Vando.",
  },
  {
    org: 'NASA SUITS',
    role: 'UI/UX Designer',
    dates: 'September 2023 – May 2024',
    desc: 'Designed an AR heads-up display interface for astronaut spacesuit use cases. Reached the national top-10 finals.',
  },
  {
    org: 'Guangzhou Automobile Group, Ltd.',
    role: 'UI/UX Designer',
    dates: 'June 2023 – September 2023',
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
            <p className="about__label">About me</p>
            <p className="about__bio">
              I&apos;m Amy Ai, a product designer who is passionate about crafting
              experiences that connect people with technology in intuitive ways.
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
        <section className="about__experience" aria-labelledby="about-exp-heading">
          <div className="container about__experience-inner">
            <h2 id="about-exp-heading" className="about__experience-heading">
              My Experience
            </h2>
            <ul className="about__exp-list">
              {experience.map((entry) => (
                <li key={entry.org} className="about__exp-item">
                  <p className="about__exp-org">{entry.org}</p>
                  <div className="about__exp-detail">
                    <p className="about__exp-role">{entry.role}</p>
                    <p className="about__exp-dates">{entry.dates}</p>
                    {entry.desc ? (
                      <p className="about__exp-desc">{entry.desc}</p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── Let's Connect ── */}
        <section className="about__connect" aria-labelledby="about-connect-heading">
          <div className="container about__connect-inner">
            <div className="about__connect-copy">
              <h2 id="about-connect-heading" className="about__connect-heading">
                Let&apos;s Connect
              </h2>
              <p className="about__connect-text">
                Have a new project or just say hi?
                <br />
                Feel free to{' '}
                <a href="mailto:amy@example.com" className="about__connect-link">
                  reach out to me
                </a>
                .
              </p>
            </div>
            <div className="about__connect-nav">
              <nav className="about__connect-col" aria-label="Site">
                <Link to="/">Work</Link>
                <Link to="/about">About Me</Link>
                <Link to="/playground">Playground</Link>
                <a href="mailto:amy@example.com">Say hello</a>
              </nav>
              <nav className="about__connect-col" aria-label="Social">
                <a
                  href="https://www.linkedin.com/in/amyai"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  LinkedIn
                </a>
                <a href="mailto:amy@example.com">Email</a>
              </nav>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
