import type { ReactNode } from 'react';
import { Spinner } from '@yukti/ui';

interface Props {
  isLoading: boolean;
  isError: boolean;
  isEmpty?: boolean;
  emptyMessage?: string;
  skeleton?: ReactNode;
  children: ReactNode;
}

// Standardised loading / error / empty handling for data-driven sections.
export function QueryState({ isLoading, isError, isEmpty, emptyMessage, skeleton, children }: Props) {
  if (isLoading) {
    return (
      <div className="state">{skeleton ?? <Spinner label="Loading" />}</div>
    );
  }
  if (isError) {
    return (
      <div className="state" role="alert">
        Something went wrong loading this content. Please try again.
      </div>
    );
  }
  if (isEmpty) {
    return <div className="state">{emptyMessage ?? 'Nothing here yet.'}</div>;
  }
  return <>{children}</>;
}
