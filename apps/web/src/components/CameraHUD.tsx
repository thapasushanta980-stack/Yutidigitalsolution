import { useEffect, useRef } from 'react';

/** Viewfinder HUD + lens overlaid on the hero. Pure decoration. */
export function CameraHUD() {
  const tc = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    let last = 0;
    const tick = (now: number) => {
      if (now - last > 40 && tc.current) {
        last = now;
        const ms = now - start;
        const f = Math.floor((ms / 1000) * 24) % 24;
        const s = Math.floor(ms / 1000) % 60;
        const m = Math.floor(ms / 60000) % 60;
        const p = (n: number) => String(n).padStart(2, '0');
        tc.current.textContent = `00:${p(m)}:${p(s)}:${p(f)}`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="cam" aria-hidden="true">
      <span className="cam__corner cam__corner--tl" />
      <span className="cam__corner cam__corner--tr" />
      <span className="cam__corner cam__corner--bl" />
      <span className="cam__corner cam__corner--br" />

      <div className="cam__rec">
        <i /> REC <span ref={tc}>00:00:00:00</span>
      </div>
      <div className="cam__meta cam__meta--tr">
        <span>4K</span>
        <span>24 FPS</span>
        <span>ISO 800</span>
      </div>
      <div className="cam__meta cam__meta--bl">
        <span>f/2.8</span>
        <span>1/50</span>
        <span className="cam__batt">
          <b />
        </span>
      </div>
      <div className="cam__af">
        <span />
        <em>AF · LOCKED</em>
      </div>
      <div className="cam__flash" />
    </div>
  );
}
