import { Link } from 'react-router-dom';
import PlaceholderImage from './PlaceholderImage';
import Tag from './Tag';
import '../../styles/project-card.css';

export default function ProjectCard({ project }) {
  return (
    <Link to={`/work/${project.slug}`} className="project-card">
      <div className="project-card__image-wrap">
        <PlaceholderImage
          color={project.placeholderColor}
          accentColor={project.placeholderAccent}
          aspect="4/3"
        />
        <div className="project-card__overlay">
          <span className="project-card__overlay-text">View Project</span>
        </div>
      </div>
      <div className="project-card__body">
        <div className="project-card__meta">
          <Tag label={project.category} categoryKey={project.categoryKey} />
          <span className="project-card__year">{project.year}</span>
        </div>
        <h3 className="project-card__title">{project.title}</h3>
        <p className="project-card__subtitle">{project.subtitle}</p>
        <p className="project-card__summary">{project.summary}</p>
      </div>
    </Link>
  );
}
