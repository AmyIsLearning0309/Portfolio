import Navbar from '../components/layout/Navbar';
import SelectedWorks from '../components/home/SelectedWorks';

export default function Works() {
  return (
    <>
      <Navbar />
      <main>
        <SelectedWorks asPage />
      </main>
    </>
  );
}
