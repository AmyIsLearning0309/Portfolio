import '../../styles/hero.css';

export default function Hero() {
  return (
    <section className="hero" aria-label="Introduction">
      <div className="hero__bg" aria-hidden="true" />
      <div className="container">
        <div className="hero__inner">
          <p className="eyebrow hero__eyebrow">
            Providence, RI · UX Design System Intern @ Siemens
          </p>
          <h1 className="hero__heading">
            Hello, I&apos;m <em>Amy Ai.</em>
          </h1>
          <p className="hero__subtitle">
            I craft products, interactions &amp; design systems.
          </p>
          <p className="hero__scroll-cue" aria-hidden="true">
            <span>Scroll to explore work</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M8 3v10M4 9l4 4 4-4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </p>
        </div>
      </div>
    </section>
  );
}
