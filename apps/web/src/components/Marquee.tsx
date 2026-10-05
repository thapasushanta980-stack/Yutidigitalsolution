import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  /** Seconds for one full loop. */
  speed?: number;
  reverse?: boolean;
  className?: string;
}

/** Infinite horizontal ticker. Content is duplicated for a seamless loop. */
export function Marquee({ children, speed = 40, reverse = false, className = '' }: Props) {
  return (
    <div className={`marquee ${className}`.trim()}>
      <div
        className={`marquee__track ${reverse ? 'marquee__track--reverse' : ''}`}
        style={{ animationDuration: `${speed}s` }}
      >
        <div className="marquee__group">{children}</div>
        <div className="marquee__group" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}
