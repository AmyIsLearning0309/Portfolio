import '../../styles/tag.css';

export default function Tag({ label, categoryKey }) {
  return (
    <span className="tag" data-category={categoryKey || 'default'}>
      {label}
    </span>
  );
}
