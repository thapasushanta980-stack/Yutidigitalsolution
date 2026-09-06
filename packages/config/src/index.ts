// Centralised, framework-agnostic design tokens.
// The canonical source is tokens.css (CSS custom properties); these mirror
// the scale for use in TS (e.g. Framer Motion, inline SVG).

export const spacing = [4, 8, 12, 16, 24, 32, 48, 64, 80, 96, 120] as const;

export const breakpoints = {
  mobile: 375,
  mobileLg: 480,
  tablet: 768,
  laptop: 1024,
  desktop: 1200,
  wide: 1440,
} as const;

export const fonts = {
  heading: "'Fraunces', Georgia, 'Times New Roman', serif",
  body: "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif",
} as const;

// Restrained, editorial palette — ink on paper with a single accent.
export const colors = {
  ink: '#14140f',
  paper: '#f6f4ef',
  paperAlt: '#efece4',
  muted: '#6b6b63',
  line: '#d8d4c8',
  accent: '#b4432f', // terracotta — used sparingly
  white: '#ffffff',
} as const;

export const motion = {
  ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
  durationFast: 0.25,
  duration: 0.5,
} as const;
