import type { HTMLAttributes, ReactNode } from 'react';

export function Container({
  children,
  className = '',
  ...rest
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div className={`yk-container ${className}`.trim()} {...rest}>
      {children}
    </div>
  );
}
