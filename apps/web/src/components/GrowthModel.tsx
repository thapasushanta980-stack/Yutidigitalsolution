// Editorial growth-model diagram — Organic + Paid → Compounding growth.
// Implemented as responsive inline SVG (no image). Respects reduced motion via CSS.
export function GrowthModel() {
  return (
    <figure className="growth-model">
      <svg
        viewBox="0 0 640 380"
        role="img"
        aria-labelledby="gm-title gm-desc"
        preserveAspectRatio="xMidYMid meet"
      >
        <title id="gm-title">Yukti growth model</title>
        <desc id="gm-desc">
          Organic and paid channels combine and compound into measurable growth.
        </desc>

        {/* Compounding node (top) */}
        <g>
          <rect x="230" y="24" width="180" height="52" rx="3" className="gm-box gm-box--accent" />
          <text x="320" y="55" className="gm-text gm-text--light" textAnchor="middle">
            Compounding
          </text>
        </g>

        {/* Connectors up */}
        <path d="M180 200 C 180 130, 320 120, 320 80" className="gm-line" fill="none" />
        <path d="M460 200 C 460 130, 320 120, 320 80" className="gm-line" fill="none" />

        {/* Organic + Paid */}
        <g>
          <rect x="90" y="200" width="180" height="52" rx="3" className="gm-box" />
          <text x="180" y="231" className="gm-text" textAnchor="middle">
            Organic
          </text>
        </g>
        <g>
          <rect x="370" y="200" width="180" height="52" rx="3" className="gm-box" />
          <text x="460" y="231" className="gm-text" textAnchor="middle">
            Paid
          </text>
        </g>

        {/* Connectors down to growth */}
        <path d="M180 252 C 180 300, 320 300, 320 320" className="gm-line" fill="none" />
        <path d="M460 252 C 460 300, 320 300, 320 320" className="gm-line" fill="none" />

        {/* Growth node (bottom) */}
        <g>
          <rect x="230" y="320" width="180" height="48" rx="3" className="gm-box gm-box--ink" />
          <text x="320" y="349" className="gm-text gm-text--light" textAnchor="middle">
            Growth
          </text>
        </g>
      </svg>
      <figcaption className="fig-label">Fig. 01 — Growth model</figcaption>
    </figure>
  );
}
