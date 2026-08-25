export default function Icon({ path, size = 1, color = "currentColor", className = "" }) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      className={className}
      style={{ 
        width: `${size * 1.5}rem`, 
        height: `${size * 1.5}rem`, 
        fill: color, 
        display: 'inline-block', 
        flexShrink: 0 
      }}
    >
      <path d={path} />
    </svg>
  );
}
