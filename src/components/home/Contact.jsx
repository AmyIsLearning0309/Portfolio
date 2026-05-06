import Button from '../ui/Button';
import '../../styles/contact.css';

export default function Contact() {
  return (
    <section className="contact">
      <div className="container">
        <div className="contact__inner">
          <p className="eyebrow contact__eyebrow">Get in touch</p>
          <h2 className="contact__heading">Let's work together.</h2>
          <p className="contact__body">
            Have a new project or just want to say hi?<br />
            Feel free to reach out to me.
          </p>
          <div className="contact__ctas">
            <Button
              variant="primary"
              size="lg"
              href="mailto:amy@example.com"
            >
              Email Amy
            </Button>
            <Button
              variant="outline"
              size="lg"
              href="https://www.linkedin.com/in/amyai"
            >
              LinkedIn
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
