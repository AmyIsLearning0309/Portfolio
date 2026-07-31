import '../../styles/hero.css';

export default function Hero() {
  return (
    <section className="hero" aria-label="Introduction">
      <div className="hero__wash" aria-hidden="true" />
      <div className="hero__frame">
        <p className="eyebrow hero__eyebrow">
          San Francisco, CA · UX Design System Intern @ Siemens
        </p>

        <h1 className="hero__heading">
          <span className="hero__greeting">Hello, I&apos;m</span>
          <span className="hero__name">Amy Ai.</span>
        </h1>

        <p className="hero__subtitle">
          I craft products, interactions &amp; design systems.
        </p>

        <p className="hero__scroll-cue" aria-hidden="true">
          <span className="hero__scroll-dot" />
          <span>Scroll to explore work</span>
        </p>
      </div>
    </section>
  );
}
