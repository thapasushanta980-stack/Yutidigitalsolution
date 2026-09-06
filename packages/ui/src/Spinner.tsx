export function Spinner({ label = 'Loading' }: { label?: string }) {
  return (
    <span className="yk-spinner" role="status" aria-live="polite">
      <span className="yk-spinner__dot" aria-hidden="true" />
      <span className="yk-sr-only">{label}</span>
    </span>
  );
}
