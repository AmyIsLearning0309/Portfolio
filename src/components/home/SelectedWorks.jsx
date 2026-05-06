import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { projects, CATEGORIES } from '../../data/projects';
import ProjectCard from '../ui/ProjectCard';
import FilterTabs from '../ui/FilterTabs';
import SectionHeading from '../ui/SectionHeading';
import '../../styles/selected-works.css';

export default function SelectedWorks({ asPage = false }) {
  const [activeFilter, setActiveFilter] = useState('All');
  const [filtering, setFiltering] = useState(false);
  const location = useLocation();

  // Scroll into view if hash is present
  useEffect(() => {
    if (location.hash === '#selected-works') {
      setTimeout(() => {
        document.getElementById('selected-works')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [location]);

  const handleFilter = (cat) => {
    setFiltering(true);
    setTimeout(() => {
      setActiveFilter(cat);
      setFiltering(false);
    }, 150);
  };

  const filtered =
    activeFilter === 'All'
      ? projects
      : projects.filter((p) => p.category === activeFilter);

  return (
    <section className={`selected-works${asPage ? ' selected-works--page' : ''}`} id="selected-works">
      <div className="container">
        <div className="selected-works__header">
          <SectionHeading eyebrow="Portfolio" heading="Selected Works" />
          <FilterTabs
            categories={CATEGORIES}
            active={activeFilter}
            onChange={handleFilter}
          />
        </div>
        <div className={`selected-works__grid ${filtering ? 'is-filtering' : ''}`}>
          {filtered.length > 0 ? (
            filtered.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))
          ) : (
            <p className="selected-works__empty">No projects in this category yet.</p>
          )}
        </div>
      </div>
    </section>
  );
}
