import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'text';
type Size = 'sm' | 'md' | 'lg';

interface BaseProps {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}

type ButtonAsButton = BaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps> & { as?: 'button' };
type ButtonAsAnchor = BaseProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseProps> & { as: 'a'; href: string };

export type ButtonProps = ButtonAsButton | ButtonAsAnchor;

export function Button(props: ButtonProps) {
  const { variant = 'primary', size = 'md', children, ...rest } = props as BaseProps & {
    as?: 'button' | 'a';
  } & Record<string, unknown>;
  const className = `yk-btn yk-btn--${variant} yk-btn--${size} ${
    (rest.className as string) ?? ''
  }`.trim();

  if ((props as ButtonAsAnchor).as === 'a') {
    const { as: _as, ...anchorRest } = rest as Record<string, unknown>;
    void _as;
    return (
      <a {...(anchorRest as AnchorHTMLAttributes<HTMLAnchorElement>)} className={className}>
        {children}
      </a>
    );
  }
  const { as: _as, ...buttonRest } = rest as Record<string, unknown>;
  void _as;
  return (
    <button {...(buttonRest as ButtonHTMLAttributes<HTMLButtonElement>)} className={className}>
      {children}
    </button>
  );
}
