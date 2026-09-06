import type { ReactNode } from 'react';

interface Props {
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  as?: 'h1' | 'h2';
}

export function SectionHeader({ eyebrow, title, intro, as = 'h2' }: Props) {
  const Heading = as;
  return (
    <div className="section-header">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <Heading>{title}</Heading>
      {intro && <p className="lead">{intro}</p>}
    </div>
  );
}
