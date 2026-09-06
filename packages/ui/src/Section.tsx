import type { HTMLAttributes, ReactNode } from 'react';

interface SectionProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  tone?: 'paper' | 'alt' | 'ink';
}

export function Section({ children, tone = 'paper', className = '', ...rest }: SectionProps) {
  return (
    <section className={`yk-section yk-section--${tone} ${className}`.trim()} {...rest}>
      {children}
    </section>
  );
}
