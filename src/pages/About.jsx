import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Contact from '../components/home/Contact';
import PlaceholderImage from '../components/ui/PlaceholderImage';
import SectionHeading from '../components/ui/SectionHeading';
import '../styles/about.css';

const skills = [
  {
    icon: '🔍',
    title: 'UX Research',
    items: ['User interviews', 'Usability testing', 'Affinity mapping', 'Journey mapping'],
  },
  {
    icon: '✦',
    title: 'Interaction Design',
    items: ['Wireframing', 'Prototyping', 'Micro-interactions', 'Information architecture'],
  },
  {
    icon: '⬡',
    title: 'Design Systems',
    items: ['Component libraries', 'Token architecture', 'Design–dev handoff', 'Documentation'],
  },
  {
    icon: '◈',
    title: 'Visual / UI Design',
    items: ['Typography', 'Color systems', 'Responsive layouts', 'Accessibility (WCAG)'],
  },
];

const experience = [
  {
    years: '2024',
    role: 'UX Design System Intern',
    org: 'Siemens Industry Software Inc.',
    desc: 'Extended the enterprise design system to support Microsoft 365 Copilot AI interactions. Delivered 18 net-new components adopted by multiple product teams.',
  },
  {
    years: '2024',
    role: 'UX Researcher & Designer',
    org: 'NASA SUITS Challenge',
    desc: 'Designed an AR heads-up display interface for astronaut spacesuit use cases. Reached the national top-10 finals.',
  },
  {
    years: '2023',
    role: 'UX Designer & Researcher',
    org: 'REC-O — Academic Project',
    desc: 'Led end-to-end design of a communication coaching system through two rounds of user testing and iterative prototyping.',
  },
  {
    years: '2021–Present',
    role: 'B.Sc. Industrial Design',
    org: 'RISD / Brown University Area',
    desc: 'Studying at the intersection of design, technology, and human behavior in Providence, Rhode Island.',
  },
];

export default function About() {
  return (
    <>
      <Navbar />
      <main>
        {/* Intro: white */}
        <section className="about__intro-section">
          <div className="container">
            <div className="about__intro">
              <div>
                <h1 className="about__intro-heading">
                  Designer, researcher,<br />curious human.
                </h1>
                <p className="about__intro-text">
                  I'm Amy Ai — a UX and product designer based in Providence, Rhode Island.
                  I believe good design solves real problems while feeling effortless to use.
                </p>
                <p className="about__intro-text">
                  My work lives at the intersection of systems thinking and human empathy.
                  Whether I'm building component libraries for enterprise software or designing
                  AR interfaces for astronauts, I bring the same approach: understand deeply,
                  test honestly, and iterate until it's right.
                </p>
                <p className="about__intro-text">
                  Most recently, I completed a UX Design System internship at Siemens Industry
                  Software, where I helped extend the design system to accommodate emerging
                  AI interaction patterns with Microsoft 365 Copilot.
                </p>
              </div>
              <div className="about__intro-image">
                <PlaceholderImage
                  color="#F5F5F7"
                  accentColor="#1D1D1F"
                  aspect="3/4"
                  label="Amy Ai"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Skills: Apple grey */}
        <section className="about__skills-section">
          <div className="container">
            <SectionHeading eyebrow="Capabilities" heading="What I do" />
            <div className="about__skills-grid">
              {skills.map((skill) => (
                <div key={skill.title} className="about__skill-card">
                  <div className="about__skill-icon">{skill.icon}</div>
                  <h3 className="about__skill-title">{skill.title}</h3>
                  <ul className="about__skill-list">
                    {skill.items.map((item) => (
                      <li key={item} className="about__skill-item">{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Experience: white */}
        <section className="about__experience-section">
          <div className="container">
            <SectionHeading eyebrow="Resume" heading="Experience &amp; Education" />
            <div className="about__timeline">
              {experience.map((entry) => (
                <div key={entry.role} className="about__timeline-item">
                  <span className="about__timeline-years">{entry.years}</span>
                  <div>
                    <p className="about__timeline-role">{entry.role}</p>
                    <p className="about__timeline-org">{entry.org}</p>
                    <p className="about__timeline-desc">{entry.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Contact />
      <Footer />
    </>
  );
}
