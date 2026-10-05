import { useEffect, useState } from 'react';

// Channel: https://www.youtube.com/@Yuktids
const CHANNEL_ID = 'UCNI8sR2vI4OlmtEeq4D5U1w';
const UPLOADS = 'UUNI8sR2vI4OlmtEeq4D5U1w';
const FEED = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(
  `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`,
)}`;
// Shown until the live list loads (or if it cannot be loaded).
const FALLBACK_ID = 'pDBRBvjOwDo';

/** Portrait player that opens on the channel's newest upload. */
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
      <div className="phone">
        <div className="phone__screen">
          <iframe
            key={active}
            src={`https://www.youtube-nocookie.com/embed/${active}?list=${UPLOADS}&rel=0`}
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
