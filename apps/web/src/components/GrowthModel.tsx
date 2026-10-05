import { motion, useReducedMotion, type Variants } from 'framer-motion';

// Editorial growth-model diagram — Organic + Paid → Compounding growth.
// Responsive inline SVG (no image). Animates in on scroll; static when the
// visitor prefers reduced motion.
const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};
const node: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};
const line: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: { pathLength: 1, opacity: 1, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

export function GrowthModel() {
  const reduced = useReducedMotion();
  const anim = reduced
    ? {}
    : { variants: container, initial: 'hidden' as const, whileInView: 'visible' as const, viewport: { once: true, margin: '-80px' } };
  const nodeAnim = reduced ? {} : { variants: node };
  const lineAnim = reduced ? {} : { variants: line };

  return (
    <figure className="growth-model">
      <motion.svg
        viewBox="0 0 640 380"
        role="img"
        aria-labelledby="gm-title gm-desc"
        preserveAspectRatio="xMidYMid meet"
        {...anim}
      >
        <title id="gm-title">Yukti growth model</title>
        <desc id="gm-desc">Organic and paid channels combine and compound into measurable growth.</desc>

        {/* Compounding node (top) */}
        <motion.g {...nodeAnim}>
          <rect x="230" y="24" width="180" height="52" rx="3" className="gm-box gm-box--gold gm-pulse" />
          <text x="320" y="55" className="gm-text gm-text--ink" textAnchor="middle">
            Compounding
          </text>
        </motion.g>

        {/* Connectors up */}
        <motion.path d="M180 200 C 180 130, 320 120, 320 80" className="gm-line" fill="none" {...lineAnim} />
        <motion.path d="M460 200 C 460 130, 320 120, 320 80" className="gm-line" fill="none" {...lineAnim} />

        {/* Organic + Paid */}
        <motion.g {...nodeAnim}>
          <rect x="90" y="200" width="180" height="52" rx="3" className="gm-box gm-box--node" />
          <text x="180" y="231" className="gm-text" textAnchor="middle">
            Organic
          </text>
        </motion.g>
        <motion.g {...nodeAnim}>
          <rect x="370" y="200" width="180" height="52" rx="3" className="gm-box gm-box--node" />
          <text x="460" y="231" className="gm-text" textAnchor="middle">
            Paid
          </text>
        </motion.g>

        {/* Connectors down to growth */}
        <motion.path d="M180 252 C 180 300, 320 300, 320 320" className="gm-line" fill="none" {...lineAnim} />
        <motion.path d="M460 252 C 460 300, 320 300, 320 320" className="gm-line" fill="none" {...lineAnim} />


        {/* Live flow: dashes travelling along every connector + glowing particles */}
        {!reduced && (
          <g aria-hidden="true">
            <path id="p1" d="M180 200 C 180 130, 320 120, 320 80" className="gm-flow gm-flow--up" fill="none" />
            <circle r="5" fill="#ffc300" className="gm-dot">
              <animateMotion dur="2.6s" begin="0.0s" repeatCount="indefinite" keyTimes="0;1" keySplines="0.4 0 0.2 1" calcMode="spline">
                <mpath href="#p1" />
              </animateMotion>
            </circle>
            <path id="p2" d="M460 200 C 460 130, 320 120, 320 80" className="gm-flow gm-flow--up" fill="none" />
            <circle r="5" fill="#ffc300" className="gm-dot">
              <animateMotion dur="3.0s" begin="0.5s" repeatCount="indefinite" keyTimes="0;1" keySplines="0.4 0 0.2 1" calcMode="spline">
                <mpath href="#p2" />
              </animateMotion>
            </circle>
            <path id="p3" d="M180 252 C 180 300, 320 300, 320 320" className="gm-flow gm-flow--down" fill="none" />
            <circle r="5" fill="#7c7cff" className="gm-dot">
              <animateMotion dur="3.4000000000000004s" begin="1.0s" repeatCount="indefinite" keyTimes="0;1" keySplines="0.4 0 0.2 1" calcMode="spline">
                <mpath href="#p3" />
              </animateMotion>
            </circle>
            <path id="p4" d="M460 252 C 460 300, 320 300, 320 320" className="gm-flow gm-flow--down" fill="none" />
            <circle r="5" fill="#7c7cff" className="gm-dot">
              <animateMotion dur="3.8000000000000003s" begin="1.5s" repeatCount="indefinite" keyTimes="0;1" keySplines="0.4 0 0.2 1" calcMode="spline">
                <mpath href="#p4" />
              </animateMotion>
            </circle>
          </g>
        )}

        {/* Growth node (bottom) */}
        <motion.g {...nodeAnim}>
          <rect x="230" y="320" width="180" height="48" rx="3" className="gm-box gm-box--ink gm-pulse gm-pulse--blue" />
          <text x="320" y="349" className="gm-text gm-text--light" textAnchor="middle">
            Growth
          </text>
        </motion.g>
      </motion.svg>
    </figure>
  );
}
