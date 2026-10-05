import { useEffect, useState } from 'react';
import { Film, Play, Smartphone } from 'lucide-react';

// Channel: https://www.youtube.com/@Yuktids
const CHANNEL_ID = 'UCNI8sR2vI4OlmtEeq4D5U1w';
const UPLOADS = 'UUNI8sR2vI4OlmtEeq4D5U1w';
const FEED = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(
  `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`,
)}`;
// Shown until the live list loads (or if it cannot be loaded).
const FALLBACK_ID = 'pDBRBvjOwDo';

/** Phone-style player that opens on the channel's newest upload. */
export function ChannelPlayer() {
  const [active, setActive] = useState<string>(FALLBACK_ID);

  // New uploads appear automatically: the public channel feed is read on every visit.
  useEffect(() => {
    const ctrl = new AbortController();
    fetch(FEED, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((d: { status: string; items?: { guid: string; title: string }[] }) => {
        if (d.status !== 'ok' || !d.items?.length) return;
        setActive(d.items[0].guid.replace('yt:video:', ''));
      })
      .catch(() => {
        /* keep fallback: the embedded playlist still lets viewers skip to other uploads */
      });
    return () => ctrl.abort();
  }, []);

  return (
    <div className="phone-stage">
      <span className="phone-stage__ring" aria-hidden="true" />
      <span className="phone-stage__chip phone-stage__chip--a" aria-hidden="true">
        <Play size={12} /> Motion Graphics
      </span>
      <span className="phone-stage__chip phone-stage__chip--b" aria-hidden="true">
        <Film size={12} /> TVC Ads
      </span>
      <span className="phone-stage__chip phone-stage__chip--c" aria-hidden="true">
        <Smartphone size={12} /> Reels
      </span>

      <div className="phone">
        <span className="phone__notch" aria-hidden="true" />
        <div className="phone__screen">
          <iframe
            key={active}
            src={`https://www.youtube-nocookie.com/embed/${active}?list=${UPLOADS}&rel=0$`}
            title="Yukti Digital Solutions on YouTube"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}
