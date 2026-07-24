import { Link } from 'react-router-dom';
import Logo from '../ui/Logo';
import '../../styles/footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__inner">
          <div>
            <div className="footer__brand">
              <Logo className="footer__logo" title="Amy Ai" />
              <p className="footer__brand-name">Amy Ai</p>
            </div>
            <p className="footer__brand-tagline">UX Designer · Providence, RI</p>
          </div>
          <nav className="footer__nav" aria-label="Footer navigation">
            <Link to="/#selected-works" className="footer__nav-link">Work</Link>
            <Link to="/about" className="footer__nav-link">About Me</Link>
            <Link to="/playground" className="footer__nav-link">Playground</Link>
          </nav>
        </div>
        <div className="footer__bottom">
          <p className="footer__copy">© {new Date().getFullYear()} Amy Ai. All rights reserved.</p>
          <div className="footer__socials">
            <a
              href="https://www.linkedin.com/in/amyai"
              target="_blank"
              rel="noopener noreferrer"
              className="footer__social-link"
            >
              LinkedIn
            </a>
            <a href="mailto:amy@example.com" className="footer__social-link">
              Email
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
