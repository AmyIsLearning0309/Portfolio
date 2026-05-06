import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Works from './pages/Works';
import Playground from './pages/Playground';
import Siemens from './pages/work/Siemens';
import NasaSuit from './pages/work/NasaSuit';
import RecO from './pages/work/RecO';
import EmergencyOnDemand from './pages/work/EmergencyOnDemand';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/works" element={<Works />} />
      <Route path="/playground" element={<Playground />} />
      <Route path="/work/siemens" element={<Siemens />} />
      <Route path="/work/nasa-suit" element={<NasaSuit />} />
      <Route path="/work/rec-o" element={<RecO />} />
      <Route path="/work/emergency-on-demand" element={<EmergencyOnDemand />} />
    </Routes>
  );
}

export default App;
