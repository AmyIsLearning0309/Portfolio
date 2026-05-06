import '../../styles/placeholder-image.css';

export default function PlaceholderImage({ color = '#E8EAF6', accentColor = '#5C6BC0', label = '', aspect = '16/9' }) {
  return (
    <div
      className="placeholder-image"
      style={{
        aspectRatio: aspect,
        backgroundColor: color,
        backgroundImage: `
          repeating-linear-gradient(
            0deg,
            transparent,
            transparent 28px,
            ${accentColor}18 28px,
            ${accentColor}18 29px
          ),
          repeating-linear-gradient(
            90deg,
            transparent,
            transparent 28px,
            ${accentColor}18 28px,
            ${accentColor}18 29px
          )
        `,
      }}
    >
      {label && (
        <span className="placeholder-image__label" style={{ color: accentColor }}>
          {label}
        </span>
      )}
    </div>
  );
}
