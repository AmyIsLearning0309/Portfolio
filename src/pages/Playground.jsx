import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import SectionHeading from '../components/ui/SectionHeading';
import '../styles/playground.css';

const cards = [
  { title: 'Motion Experiments', color: '#E8EAF6', accent: '#5C6BC0' },
  { title: 'Type Studies', color: '#E3F2FD', accent: '#1565C0' },
  { title: 'Color Exploration', color: '#F3E5F5', accent: '#7B1FA2' },
  { title: 'Grid Systems', color: '#E8F5E9', accent: '#2E7D32' },
  { title: 'Icon Design', color: '#FFF3E0', accent: '#E65100' },
  { title: 'Data Visualization', color: '#F9F7F4', accent: '#3949AB' },
];

export default function Playground() {
  return (
    <>
      <Navbar />
      <main className="playground">
        <div className="container">
          <div className="playground__header">
            <SectionHeading eyebrow="Experiments" heading="Playground" />
            <p className="playground__tagline">
              Explorations, side projects, and things made for fun.
              This space is where I experiment without constraints.
            </p>
          </div>
          <div className="playground__grid">
            {cards.map((card) => (
              <div key={card.title} className="playground__card">
                <div
                  className="playground__card-image"
                  style={{
                    backgroundColor: card.color,
                    backgroundImage: `repeating-linear-gradient(45deg, ${card.accent}14 0px, ${card.accent}14 1px, transparent 1px, transparent 12px)`,
                  }}
                />
                <div className="playground__card-body">
                  <p className="playground__card-title">{card.title}</p>
                  <p className="playground__card-status">Coming Soon</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
