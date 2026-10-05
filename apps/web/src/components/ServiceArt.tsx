// Flat editorial illustrations for the four services. Drawn as inline SVG so
// they use the site palette (light + dark), stay sharp at any size and add no
// image weight. Colours come from the .art-* classes in editorial.css.

type Kind = 'social' | 'video' | 'ads' | 'seo';

export function artKind(slug: string, title = ''): Kind | null {
  const s = `${slug} ${title}`.toLowerCase();
  if (s.includes('social')) return 'social';
  if (s.includes('video') || s.includes('tvc')) return 'video';
  if (s.includes('meta') || s.includes('ads')) return 'ads';
  if (s.includes('seo') || s.includes('search')) return 'seo';
  return null;
}

function Social() {
  return (
    <>
      {/* phone */}
      <rect x="128" y="48" width="144" height="288" rx="22" className="art-white art-edge" />
      <rect x="168" y="58" width="64" height="8" rx="4" className="art-line" />
      {/* post header */}
      <circle cx="154" cy="96" r="12" className="art-accent" />
      <rect x="174" y="88" width="56" height="7" rx="3.5" className="art-ink" />
      <rect x="174" y="100" width="36" height="6" rx="3" className="art-line" />
      {/* post image */}
      <rect x="144" y="120" width="112" height="96" rx="8" className="art-soft" />
      <path d="M144 200 L180 166 L206 190 L232 160 L256 184 V208 a8 8 0 0 1 -8 8 H152 a8 8 0 0 1 -8 -8Z" className="art-accent" opacity="0.85" />
      <circle cx="226" cy="140" r="9" className="art-gold" />
      {/* actions + text */}
      <path d="M154 238 c-8 -7 -2 -17 4 -17 c3 0 5 2 6 4 c1 -2 3 -4 6 -4 c6 0 12 10 4 17 l-10 8Z" className="art-accent" />
      <rect x="192" y="228" width="16" height="14" rx="4" className="art-line" />
      <rect x="144" y="258" width="112" height="7" rx="3.5" className="art-ink" />
      <rect x="144" y="272" width="84" height="7" rx="3.5" className="art-line" />
      <rect x="144" y="296" width="112" height="28" rx="8" className="art-line" />
      {/* floating chips */}
      <g className="art-float">
        <rect x="262" y="104" width="92" height="40" rx="20" className="art-white art-edge" />
        <path d="M284 126 c-8 -7 -2 -17 4 -17 c3 0 5 2 6 4 c1 -2 3 -4 6 -4 c6 0 12 10 4 17 l-10 8Z" className="art-accent" transform="translate(-2 0)" />
        <rect x="312" y="119" width="32" height="7" rx="3.5" className="art-ink" />
      </g>
      <g className="art-float art-float--b">
        <rect x="46" y="204" width="100" height="44" rx="14" className="art-accent" />
        <path d="M70 248 l-6 12 14 -12Z" className="art-accent" />
        <rect x="62" y="218" width="68" height="6" rx="3" className="art-on" />
        <rect x="62" y="230" width="44" height="6" rx="3" className="art-on" opacity="0.6" />
      </g>
    </>
  );
}

function Video() {
  return (
    <>
      {/* screen */}
      <rect x="56" y="104" width="288" height="180" rx="14" className="art-white art-edge" />
      <rect x="72" y="120" width="256" height="148" rx="8" className="art-soft" />
      <path d="M72 252 L140 190 L190 232 L246 176 L328 244 V260 a8 8 0 0 1 -8 8 H80 a8 8 0 0 1 -8 -8Z" className="art-accent" opacity="0.8" />
      <circle cx="200" cy="194" r="34" className="art-white art-edge" />
      <path d="M192 178 L218 194 L192 210Z" className="art-accent" />
      {/* clapper */}
      <g className="art-float">
        <rect x="236" y="48" width="112" height="14" rx="3" className="art-ink" transform="rotate(-10 236 62)" />
        <path d="M244 52 l16 -3 l-6 14 l-16 3Z M274 47 l16 -3 l-6 14 l-16 3Z M304 42 l16 -3 l-6 14 l-16 3Z" className="art-on" transform="translate(0 4)" />
        <rect x="240" y="66" width="108" height="34" rx="4" className="art-accent" />
        <rect x="252" y="78" width="50" height="6" rx="3" className="art-on" />
        <rect x="252" y="88" width="30" height="5" rx="2.5" className="art-on" opacity="0.6" />
      </g>
      {/* timeline */}
      <rect x="56" y="306" width="288" height="10" rx="5" className="art-line" />
      <rect x="56" y="306" width="170" height="10" rx="5" className="art-accent" />
      <circle cx="226" cy="311" r="10" className="art-gold" />
      <rect x="56" y="326" width="40" height="14" rx="3" className="art-soft" />
      <rect x="102" y="326" width="64" height="14" rx="3" className="art-accent" opacity="0.5" />
      <rect x="172" y="326" width="52" height="14" rx="3" className="art-soft" />
    </>
  );
}

function Ads() {
  return (
    <>
      {/* target */}
      <circle cx="170" cy="190" r="118" className="art-white art-edge" />
      <circle cx="170" cy="190" r="88" className="art-soft" />
      <circle cx="170" cy="190" r="58" className="art-white art-edge" />
      <circle cx="170" cy="190" r="30" className="art-accent" />
      <circle cx="170" cy="190" r="10" className="art-white" />
      {/* dart */}
      <g className="art-float">
        <path d="M172 188 L286 84" className="art-stroke-accent" />
        <path d="M286 84 l2 -26 l24 -4 l-8 24 l-24 8Z" className="art-gold" transform="translate(0 0)" />
      </g>
      {/* ad performance card */}
      <g className="art-float art-float--b">
        <rect x="236" y="214" width="124" height="116" rx="12" className="art-white art-edge" />
        <rect x="250" y="228" width="48" height="7" rx="3.5" className="art-line" />
        <rect x="250" y="242" width="64" height="12" rx="4" className="art-ink" />
        <rect x="252" y="296" width="14" height="22" rx="3" className="art-soft" />
        <rect x="274" y="284" width="14" height="34" rx="3" className="art-accent" opacity="0.6" />
        <rect x="296" y="270" width="14" height="48" rx="3" className="art-accent" opacity="0.8" />
        <rect x="318" y="258" width="14" height="60" rx="3" className="art-accent" />
      </g>
    </>
  );
}

function Seo() {
  return (
    <>
      {/* results page */}
      <rect x="44" y="52" width="244" height="276" rx="14" className="art-white art-edge" />
      <rect x="62" y="70" width="208" height="32" rx="16" className="art-soft" />
      <rect x="82" y="82" width="90" height="8" rx="4" className="art-accent" opacity="0.7" />
      {/* ranked results */}
      <g>
        <rect x="62" y="122" width="208" height="64" rx="8" className="art-soft" />
        <rect x="76" y="136" width="86" height="8" rx="4" className="art-accent" />
        <rect x="76" y="152" width="170" height="6" rx="3" className="art-ink" opacity="0.7" />
        <rect x="76" y="164" width="136" height="6" rx="3" className="art-line" />
        <circle cx="248" cy="142" r="14" className="art-gold" />
        <rect x="244" y="134" width="3" height="16" rx="1" className="art-white" />
        <path d="M244 136 l-4 3" className="art-stroke-white" />
      </g>
      <rect x="62" y="200" width="150" height="8" rx="4" className="art-line" />
      <rect x="62" y="216" width="190" height="6" rx="3" className="art-line" />
      <rect x="62" y="236" width="150" height="8" rx="4" className="art-line" />
      <rect x="62" y="252" width="170" height="6" rx="3" className="art-line" />
      <rect x="62" y="280" width="120" height="8" rx="4" className="art-line" />
      {/* magnifier */}
      <g className="art-float">
        <circle cx="272" cy="236" r="56" className="art-white art-edge" fillOpacity="0.9" />
        <circle cx="272" cy="236" r="56" className="art-stroke-accent" fill="none" />
        <path d="M312 276 L352 316" className="art-stroke-accent art-thick" />
        <path d="M244 256 L262 234 L276 246 L300 212" className="art-stroke-accent" fill="none" />
        <path d="M290 210 h12 v12" className="art-stroke-accent" fill="none" />
      </g>
    </>
  );
}

export function ServiceArt({ kind }: { kind: Kind }) {
  return (
    <svg className="art" viewBox="0 0 400 380" role="presentation" aria-hidden="true" focusable="false">
      {kind === 'social' && <Social />}
      {kind === 'video' && <Video />}
      {kind === 'ads' && <Ads />}
      {kind === 'seo' && <Seo />}
    </svg>
  );
}
