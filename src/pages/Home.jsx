import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import HeroStage from '../components/home/HeroStage';

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <HeroStage />
      </main>
      <Footer />
    </>
  );
}
