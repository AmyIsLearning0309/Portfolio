import { Routes, Route, Navigate } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import CursorCircle from './components/ui/CursorCircle';
import ScrollToTop from './components/ui/ScrollToTop';
import Home from './pages/Home';
import About from './pages/About';
import Playground from './pages/Playground';
import Siemens from './pages/work/Siemens';
import NasaSuit from './pages/work/NasaSuit';
import RecO from './pages/work/RecO';
import MochiHealth from './pages/work/MochiHealth';

function App() {
  return (
    <>
      <ScrollToTop />
      <CursorCircle />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/works" element={<Navigate to="/" replace />} />
        <Route path="/playground" element={<Playground />} />
        <Route path="/work/siemens" element={<Siemens />} />
        <Route path="/work/nasa-suit" element={<NasaSuit />} />
        <Route path="/work/rec-o" element={<RecO />} />
        <Route path="/work/mochi-health-brand" element={<MochiHealth />} />
      </Routes>
      <Analytics />
    </>
  );
}

export default App;
