const common = { width: 28, height: 28, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true };

export function CatIcon(props) {
  return (
    <svg {...common} {...props}>
      <circle cx="12" cy="14" r="7" />
      <path d="M5.6 9.5 5 3.5l5 3M18.4 9.5 19 3.5l-5 3" />
      <circle cx="9.5" cy="13" r=".6" fill="currentColor" />
      <circle cx="14.5" cy="13" r=".6" fill="currentColor" />
      <path d="M11 16.2h2M12 16.2v1M10 18c.8.5 3.2.5 4 0" />
    </svg>
  );
}
export function DogIcon(props) {
  return (
    <svg {...common} {...props}>
      <circle cx="12" cy="13" r="6" />
      <path d="M6.6 8.4C4.6 7.6 3 9.6 3.2 13c.1 2 1.2 3.4 2.6 3.4M17.4 8.4c2-.8 3.6 1.2 3.4 4.6-.1 2-1.2 3.4-2.6 3.4" />
      <circle cx="9.7" cy="11.6" r=".6" fill="currentColor" />
      <circle cx="14.3" cy="11.6" r=".6" fill="currentColor" />
      <ellipse cx="12" cy="15" rx="1.6" ry="1.1" fill="currentColor" />
      <path d="M12 16.2v1.5M10.2 18.3c1 .8 2.6.8 3.6 0" />
    </svg>
  );
}
export function BirdIcon(props) {
  return (
    <svg {...common} {...props}>
      <path d="M4 15c0-4.4 3.4-8 7.6-8 2 0 3.4.8 4.4 2l4 1.5-3.8 1.4C15.8 17.6 12.6 20 9 20c-3 0-5-2-5-5z" />
      <circle cx="14.6" cy="10.6" r=".7" fill="currentColor" />
      <path d="M8 14.5c1.6 1.4 3.6 1.4 5-.2M4.6 17.5 2.5 20" />
    </svg>
  );
}
export function PawMark(props) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <ellipse cx="12" cy="16" rx="5" ry="4.2" />
      <ellipse cx="5.2" cy="11" rx="2" ry="2.6" />
      <ellipse cx="9.2" cy="6.6" rx="2" ry="2.7" />
      <ellipse cx="14.8" cy="6.6" rx="2" ry="2.7" />
      <ellipse cx="18.8" cy="11" rx="2" ry="2.6" />
    </svg>
  );
}

export const ICONS = { cat: CatIcon, dog: DogIcon, bird: BirdIcon };
export const COLORS = { cat: "#E8590C", dog: "#2F43E6", bird: "#0A8F7F" };
export const pretty = (label) => label.charAt(0).toUpperCase() + label.slice(1).toLowerCase();
export const colorFor = (label) => COLORS[label.toLowerCase()] || "#17143A";
