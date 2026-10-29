import { useEffect, useRef, useState } from 'react';
import { Pause, Play, Volume2, VolumeX } from 'lucide-react';

interface Props {
  clips: { src: string; poster: string }[];
  /** Called when no clip can load, so the page can fall back. */
  onError: () => void;
}

// Background videos behind the hero copy, played one after another in a loop.
// They start muted (browsers only autoplay muted video); the sound button
// unmutes, and the choice carries over to the next clip. Playback pauses while
// the hero is off screen, starts paused (poster only) for reduced-motion
// visitors, and always offers a pause/play control.
export function HeroVideo({ clips, onError }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const [index, setIndex] = useState(0);
  const failures = useRef(0);
  const clip = clips[index];
  const next = () => setIndex((i) => (i + 1) % clips.length);
  const [muted, setMuted] = useState(true);
  const [paused, setPaused] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    // NotAllowedError: autoplay blocked (e.g. iOS Low Power Mode). An AbortError
    // only means the next clip's load interrupted this play() call.
    const play = () => video.play().catch((e: DOMException) => e.name === 'NotAllowedError' && setPaused(true));
    if (paused) {
      video.pause();
      return;
    }
    const io = new IntersectionObserver(([entry]) => (entry.isIntersecting ? play() : video.pause()));
    io.observe(video);
    return () => io.disconnect();
  }, [paused, index]);

  // React does not keep the `muted` attribute in sync, so set the property.
  useEffect(() => {
    if (ref.current) ref.current.muted = muted;
  }, [muted, index]);

  return (
    <>
      <video
        ref={ref}
        className="hero-video"
        src={clip.src}
        poster={clip.poster}
        muted
        loop={clips.length === 1}
        playsInline
        preload="auto"
        aria-hidden="true"
        tabIndex={-1}
        onPlaying={() => (failures.current = 0)}
        onEnded={next}
        onError={() => (++failures.current >= clips.length ? onError() : next())}
      />
      <div className="hero-video__shade" aria-hidden="true" />
      <div className="hero-video__controls">
        <button
          type="button"
          className="hero-video__toggle"
          onClick={() => setMuted((m) => !m)}
          aria-label={muted ? 'Turn video sound on' : 'Turn video sound off'}
        >
          {muted ? <VolumeX size={16} aria-hidden="true" /> : <Volume2 size={16} aria-hidden="true" />}
        </button>
        <button
          type="button"
          className="hero-video__toggle"
          onClick={() => setPaused((p) => !p)}
          aria-label={paused ? 'Play background video' : 'Pause background video'}
        >
          {paused ? <Play size={16} aria-hidden="true" /> : <Pause size={16} aria-hidden="true" />}
        </button>
      </div>
    </>
  );
}
