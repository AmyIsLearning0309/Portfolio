import Navbar from '../components/layout/Navbar';
import HorizontalProjects from '../components/home/HorizontalProjects';

export default function Home() {
  return (
    <div className="home-page">
      <Navbar />
      <main>
        <HorizontalProjects />
      </main>
    </div>
  );
}
