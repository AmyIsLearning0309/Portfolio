export default function SectionHeading({ eyebrow, heading, align = 'left' }) {
  return (
    <div style={{ textAlign: align }}>
      {eyebrow && <p className="eyebrow" style={{ marginBottom: 'var(--space-3)' }}>{eyebrow}</p>}
      <h2>{heading}</h2>
    </div>
  );
}
