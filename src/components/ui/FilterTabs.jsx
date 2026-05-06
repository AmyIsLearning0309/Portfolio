import '../../styles/filter-tabs.css';

export default function FilterTabs({ categories, active, onChange }) {
  return (
    <div className="filter-tabs" role="group" aria-label="Filter projects by category">
      {categories.map((cat) => (
        <button
          key={cat}
          className="filter-tabs__btn"
          aria-pressed={active === cat}
          onClick={() => onChange(cat)}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
