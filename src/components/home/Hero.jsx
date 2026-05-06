import Button from '../ui/Button';
import SplineBlob from '../ui/SplineBlob';
import '../../styles/hero.css';

export default function Hero() {
  const scrollToWork = (e) => {
    e.preventDefault();
    document.getElementById('selected-works')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="hero">
      <SplineBlob />
      <div className="container">
        <div className="hero__inner">
          <p className="eyebrow hero__eyebrow">
            Providence, Rhode Island &nbsp;·&nbsp; UX Design System Intern @ Siemens
          </p>
          <h1 className="hero__heading">
            Hello, I'm <em>Amy Ai.</em>
          </h1>
          <p className="hero__subtitle">
            I craft products, interactions &amp; design systems.
          </p>
          <div className="hero__ctas">
            <Button variant="primary" size="lg" href="#selected-works" onClick={scrollToWork}>
              View My Work
            </Button>
            <Button variant="outline" size="lg" to="/about">
              About Me
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
