import Navbar from '../components/layout/Navbar';
import HorizontalProjects from '../components/home/HorizontalProjects';

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <HorizontalProjects />
      </main>
    </>
  );
}
