import { useLayoutEffect, useRef } from 'react';
import { gsap, whenMotionOK } from '../lib/motion.js';

// "Growth" composition built from the YUKTI logo's language: quarter-round
// blocks, squares and a golden accent. It behaves like a live dashboard:
// the bars rise and fall as if data were streaming in, the trend line is
// re-drawn through their tops with flowing dashes, a dot travels along it, the
// sun pulses and rides the tallest bar, and the chip numbers tick.
// Static (base heights) when the visitor prefers reduced motion.

const BASE = [110, 172, 244, 314]; // bar heights at rest
const X = [96, 188, 280, 372]; // bar left edges
const W = 74;
const R = 37; // logo-style top-left radius
const FLOOR = 410;
const LIFT = 16; // trend line floats above bar tops

const bar = (i: number, h: number) => {
  const r = Math.min(R, h);
  const x = X[i];
  const y = FLOOR - h;
  return `M${x} ${FLOOR}V${y + r}A${r} ${r} 0 0 1 ${x + r} ${y}H${x + W}V${FLOOR}Z`;
};

// Smooth curve through points (Catmull-Rom to cubic Bezier).
function curve(p: [number, number][]) {
  let d = `M${p[0][0]} ${p[0][1]}`;
  for (let i = 0; i < p.length - 1; i += 1) {
    const p0 = p[i - 1] ?? p[i];
    const p1 = p[i];
    const p2 = p[i + 1];
    const p3 = p[i + 2] ?? p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0]} ${p2[1]}`;
  }
  return d;
}

const trend = (h: number[]): [number, number][] => [
  [64, FLOOR - 70],
  ...h.map((v, i) => [X[i] + W / 2, FLOOR - v - LIFT] as [number, number]),
];

export function HeroArt() {
  const root = useRef<SVGSVGElement>(null);

  useLayoutEffect(
    () =>
      whenMotionOK(() => {
        const q = gsap.utils.selector(root);
        const bars = q('.hv-bar') as unknown as SVGPathElement[];
        const line = q('.hv-line')[0] as unknown as SVGPathElement;
        const dot = q('.hv-dot')[0];
        const sun = q('.hv-sun')[0];
        const halo = q('.hv-halo')[0];
        const pct = q('.hv-pct')[0];
        const leads = q('.hv-leads')[0];

        // grow: 0 to 1 per bar for the intro; the idle wave is layered on top.
        const grow = BASE.map(() => ({ v: 0 }));
        const sway = [14, 18, 22, 26];
        const speed = [0.9, 0.7, 1.0, 0.8];
        let t = 0;
        let intro = 0;

        const frame = (_time: number, dt: number) => {
          t += dt / 1000;
          const h = BASE.map((b, i) => {
            const wave = Math.sin(t * speed[i] + i * 1.3) * sway[i] * intro;
            return Math.max(8, (b + wave) * grow[i].v);
          });
          bars.forEach((el, i) => el.setAttribute('d', bar(i, h[i])));
          line.setAttribute('d', curve(trend(h)));

          // sun rides the tallest bar
          const sx = X[3] + W / 2;
          const sy = FLOOR - h[3] - LIFT - 40;
          sun.setAttribute('cx', String(sx));
          sun.setAttribute('cy', String(sy));
          halo.setAttribute('cx', String(sx));
          halo.setAttribute('cy', String(sy));

          // dot travelling along the trend line
          const len = line.getTotalLength();
          const p = line.getPointAtLength(len * ((t * 0.16) % 1));
          dot.setAttribute('cx', p.x.toFixed(1));
          dot.setAttribute('cy', p.y.toFixed(1));

          // live numbers
          pct.textContent = `+${Math.round(120 + (h[3] / BASE[3]) * 128)}%`;
          leads.textContent = Math.round(1200 + t * 7 + Math.sin(t) * 3).toLocaleString();
        };
        gsap.ticker.add(frame);
        frame(0, 0);

        // Intro: bars rise in sequence, then the idle wave fades in.
        const ramp = { v: 0 };
        const tl = gsap.timeline({ delay: 0.4, defaults: { ease: 'power4.out' } });
        grow.forEach((g, i) => tl.to(g, { v: 1, duration: 1.3 }, i * 0.14));
        tl.to(ramp, { v: 1, duration: 1.6, ease: 'none', onUpdate: () => { intro = ramp.v; } }, 0.8)
          .from(sun, { attr: { r: 0 }, duration: 0.9, ease: 'back.out(2.4)' }, 0.9)
          .from(q('.hv-chip'), { opacity: 0, y: 16, scale: 0.9, stagger: 0.12, duration: 0.7 }, 1.1);

        // Flowing dashes on the trend line, pulsing halo, drifting loose pieces
        gsap.to(line, { strokeDashoffset: -48, duration: 2.2, ease: 'none', repeat: -1 });
        gsap.fromTo(
          halo,
          { attr: { r: 28 }, opacity: 0.7 },
          { attr: { r: 64 }, opacity: 0, duration: 2.4, ease: 'power1.out', repeat: -1, delay: 1.6 },
        );
        gsap.to(q('.hv-spin'), { rotate: 360, duration: 60, ease: 'none', repeat: -1, svgOrigin: '250 250' });
        gsap.to(q('.hv-float'), {
          y: (i) => (i % 2 ? -10 : 10),
          rotate: (i) => (i % 2 ? 8 : -8),
          duration: 3.4,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
          stagger: 0.4,
          transformOrigin: '50% 50%',
        });

        // Pointer parallax, deeper layers move further
        const layers = q('[data-depth]') as unknown as SVGElement[];
        const movers = layers.map((el) => ({
          x: gsap.quickTo(el, 'x', { duration: 0.9, ease: 'power3.out' }),
          y: gsap.quickTo(el, 'y', { duration: 0.9, ease: 'power3.out' }),
          d: Number(el.dataset.depth),
        }));
        const onMove = (e: PointerEvent) => {
          const nx = e.clientX / window.innerWidth - 0.5;
          const ny = e.clientY / window.innerHeight - 0.5;
          movers.forEach((m) => {
            m.x(nx * m.d);
            m.y(ny * m.d);
          });
        };
        window.addEventListener('pointermove', onMove, { passive: true });

        return () => {
          gsap.ticker.remove(frame);
          window.removeEventListener('pointermove', onMove);
        };
      }),
    [],
  );

  const top = FLOOR - BASE[3] - LIFT;

  return (
    <svg ref={root} className="hero-art" viewBox="0 0 480 480" role="presentation" aria-hidden="true" focusable="false">
      {/* backdrop rings (slowly rotating dashed outer ring) */}
      <g data-depth="10">
        <circle cx="250" cy="250" r="210" className="hv-ring hv-spin" strokeDasharray="3 9" />
        <circle cx="250" cy="250" r="150" className="hv-ring" />
      </g>

      {/* data bars */}
      <g data-depth="22">
        <path className="hv-bar hv-blue" d={bar(0, BASE[0])} />
        <path className="hv-bar hv-ink" d={bar(1, BASE[1])} />
        <path className="hv-bar hv-blue" d={bar(2, BASE[2])} />
        <path className="hv-bar hv-yellow" d={bar(3, BASE[3])} />
      </g>

      {/* trend line, travelling dot, sun */}
      <g data-depth="34">
        <path className="hv-line" d={curve(trend(BASE))} />
        <circle className="hv-halo" cx={X[3] + W / 2} cy={top - 40} r="28" />
        <circle className="hv-sun hv-yellow" cx={X[3] + W / 2} cy={top - 40} r="28" />
        <circle className="hv-dot" cx="64" cy={FLOOR - 70} r="7" />
      </g>

      {/* loose logo-style pieces */}
      <g data-depth="48">
        <rect className="hv-float hv-yellow" x="62" y="104" width="34" height="34" />
        <rect className="hv-float hv-blue" x="404" y="402" width="28" height="28" />
        <path className="hv-float hv-blue" d="M40 220a30 30 0 0 1 30 -30v30Z" />
        <circle className="hv-float hv-ink" cx="438" cy="238" r="9" />
      </g>

      {/* live metric chips */}
      <g data-depth="60">
        <g className="hv-chip" transform="translate(30 392)">
          <rect width="148" height="52" rx="10" className="hv-card" />
          <rect x="12" y="13" width="26" height="26" rx="6" className="hv-yellow" />
          <text x="48" y="23" className="hv-label">
            New leads
          </text>
          <text x="48" y="41" className="hv-value hv-leads">
            1,200
          </text>
        </g>
        <g className="hv-chip" transform="translate(120 20)">
          <rect width="150" height="54" rx="10" className="hv-card" />
          <path d="M14 36 L24 26 L31 32 L43 18" className="hv-trend" />
          <text x="56" y="22" className="hv-label">
            Growth
          </text>
          <text x="56" y="43" className="hv-value hv-pct">
            +248%
          </text>
        </g>
      </g>
    </svg>
  );
}
