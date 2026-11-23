import { useEffect, useState, type SyntheticEvent } from 'react';
import { Play } from 'lucide-react';

// Channel: https://www.youtube.com/@Yuktids
const CHANNEL_ID = 'UCNI8sR2vI4OlmtEeq4D5U1w';
const FEED = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(
  `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`,
)}`;

interface Video {
  id: string;
  title: string;
  /** e.g. "2:07"; unknown for uploads that only arrive through the live feed. */
  duration?: string;
  /** Short display name and type; otherwise read from the "Name | Type | ..." title. */
  name?: string;
  kind?: string;
  thumbnailAlt?: string;
}

// Shown until the live feed loads (or if it cannot be loaded). Durations and
// display names are not in the feed, so they are kept here and matched by id.
const KNOWN: Video[] = [
  { id: 'XMwzVXAi-mo', title: 'Hotel Ratna | Commercial Video | Yukti Digital Solution', duration: '2:07', thumbnailAlt: 'Breakfast spread with fruit, eggs and sandwiches in the Hotel Ratna commercial by Yukti Digital Solutions' },
  {
    id: 'pDBRBvjOwDo',
    title: 'Motion Graphics Video for Greenleaf Builders, Biratnagar | Yukti Digital Solutions',
    duration: '1:09',
    name: 'Greenleaf Builders',
    kind: 'Motion Graphics',
    thumbnailAlt: 'Illustration of two people discussing a cost estimate for Greenleaf Builders',
  },
];

const thumb = (id: string, size: 'maxresdefault' | 'hqdefault') =>
  id === 'XMwzVXAi-mo'
    ? '/images/video/hotel-ratna-thumbnail.jpg'
    : `https://i.ytimg.com/vi/${id}/${size}.jpg`;

const thumbnailAlt = (video: Video) => video.thumbnailAlt ?? `Video thumbnail: ${video.title}`;

// YouTube serves a 120px grey placeholder (not an error) when a video has no
// HD thumbnail, so swap to the always-present one when that happens.
const fallbackToHq = (id: string) => (e: SyntheticEvent<HTMLImageElement>) => {
  const img = e.currentTarget;
  if (img.naturalWidth <= 120 && !img.src.includes('hqdefault')) img.src = thumb(id, 'hqdefault');
};

// "Hotel Ratna | Commercial Video | Yukti Digital Solution" -> Hotel Ratna, Commercial Video
const splitTitle = (v: Video) => {
  const [name, kind] = v.title.split('|').map((s) => s.trim());
  return {
    name: v.name ?? (name || v.title),
    kind: v.kind ?? (kind && !/yukti/i.test(kind) ? kind : null),
  };
};

/**
 * Cinema-style showcase: the featured video on a large screen with an ambient
 * glow, and an "Up next" playlist beside it. Nothing loads from YouTube until a
 * visitor presses play.
 */
export function ChannelPlayer({ channelUrl }: { channelUrl?: string }) {
  const [videos, setVideos] = useState<Video[]>(KNOWN);
  const [activeId, setActiveId] = useState(KNOWN[0].id);
  const [playing, setPlaying] = useState(false);

  // New uploads appear automatically: the public channel feed is read on every visit.
  useEffect(() => {
    const ctrl = new AbortController();
    fetch(FEED, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((d: { status: string; items?: { guid: string; title: string }[] }) => {
        if (d.status !== 'ok' || !d.items?.length) return;
        const live = d.items.map((item) => {
          const id = item.guid.replace('yt:video:', '');
          return { ...KNOWN.find((v) => v.id === id), id, title: item.title };
        });
        setVideos(live);
        setActiveId((current) => (playing || live.some((v) => v.id === current) ? current : live[0].id));
      })
      .catch(() => {
        /* keep the known list */
      });
    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const active = videos.find((v) => v.id === activeId) ?? videos[0];
  const { name, kind } = splitTitle(active);

  const choose = (id: string) => {
    setActiveId(id);
    setPlaying(true);
  };

  return (
    <div className="cinema__grid">
      <div className="cinema__stage">
        <div className="cinema__ambient" style={{ backgroundImage: `url(${thumb(active.id, 'hqdefault')})` }} aria-hidden="true" />
        <div className="cinema__screen">
          {playing ? (
            <iframe
              key={active.id}
              src={`https://www.youtube-nocookie.com/embed/${active.id}?autoplay=1&rel=0&modestbranding=1`}
              title={active.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          ) : (
            <button type="button" className="cinema__poster" onClick={() => setPlaying(true)} aria-label={`Play: ${active.title}`}>
              <img key={active.id} src={thumb(active.id, 'maxresdefault')} onLoad={fallbackToHq(active.id)} alt={thumbnailAlt(active)} width={1280} height={720} loading="lazy" />
              <span className="cinema__play" aria-hidden="true">
                <Play size={30} />
              </span>
              <span className="cinema__caption">
                <span className="cinema__tag">Featured</span>
                <span className="cinema__name">{name}</span>
                <span className="cinema__meta">
                  {[kind, active.duration].filter(Boolean).join(' · ')}
                </span>
              </span>
            </button>
          )}
        </div>
      </div>

      <aside className="cinema__playlist" aria-label="Videos">
        <header className="cinema__playlist-head">
          <span>Up next</span>
          <span className="cinema__count">
            {videos.length} {videos.length === 1 ? 'video' : 'videos'}
          </span>
        </header>
        <ol className="cinema__list">
          {videos.map((v) => {
            const isActive = v.id === active.id;
            const t = splitTitle(v);
            return (
              <li key={v.id}>
                <button
                  type="button"
                  className={`cinema__item${isActive ? ' is-active' : ''}`}
                  onClick={() => choose(v.id)}
                  aria-current={isActive ? 'true' : undefined}
                >
                  <span className="cinema__item-thumb">
                    <img src={thumb(v.id, 'hqdefault')} alt={thumbnailAlt(v)} width={160} height={90} loading="lazy" />
                    {v.duration && <span className="cinema__duration">{v.duration}</span>}
                  </span>
                  <span className="cinema__item-text">
                    <span className="cinema__item-title">{t.name}</span>
                    {isActive && playing ? (
                      <span className="cinema__item-kind cinema__now">
                        <span className="cinema__eq" aria-hidden="true">
                          <i />
                          <i />
                          <i />
                        </span>
                        Now playing
                      </span>
                    ) : (
                      t.kind && <span className="cinema__item-kind">{t.kind}</span>
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
        {channelUrl && (
          <a className="cinema__channel" href={channelUrl} target="_blank" rel="noopener noreferrer">
            <span className="cinema__yt" aria-hidden="true">
              <Play size={14} />
            </span>
            <span className="cinema__channel-text">
              <strong>Watch more on YouTube</strong>
              <span>@Yuktids</span>
            </span>
            <span className="cinema__subscribe">Subscribe</span>
          </a>
        )}
      </aside>
    </div>
  );
}
