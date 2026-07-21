import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Hero from '../components/home/Hero';
import HorizontalProjects from '../components/home/HorizontalProjects';

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <HorizontalProjects />
      </main>
      <Footer />
    </>
  );
}
