import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import SelectedWorks from '../components/home/SelectedWorks';

export default function Works() {
  return (
    <>
      <Navbar />
      <main>
        <SelectedWorks asPage />
      </main>
      <Footer />
    </>
  );
}
