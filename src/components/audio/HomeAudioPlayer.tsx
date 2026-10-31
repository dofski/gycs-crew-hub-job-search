import React, {useEffect, useRef, useState} from 'react';

const DEFAULT_DURATION_SECONDS = 1142.6; // 19:02
const AUDIO_FILENAME = 'audio/How_Tech_Funnels_Bypass_Superyacht_Gatekeepers.m4a';
const NOTEBOOKLM_SHARE_URL =
  'https://notebook.google.com/notebook/4ddffeab-0e5c-4390-abf6-4b064d6f7655/artifact/02585495-79ba-4831-a1f5-604e8ec1a656?utm_source=nlm_web_share&utm_medium=google_oo&utm_campaign=art_share_1&utm_content=&utm_smc=nlm_web_share_google_oo_art_share_1_';

const SPEED_OPTIONS = [1, 1.25, 1.5, 2] as const;

function formatAudioTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const totalSeconds = Math.floor(seconds);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export function HomeAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(DEFAULT_DURATION_SECONDS);
  const [isMuted, setIsMuted] = useState(false);
  const [speedIndex, setSpeedIndex] = useState(0);
  const [audioError, setAudioError] = useState('');

  const playbackRate = SPEED_OPTIONS[speedIndex];
  const baseUrl = import.meta.env.BASE_URL || './';
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  const primarySrc = `${normalizedBase}${AUDIO_FILENAME}`;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.playbackRate = playbackRate;
  }, [playbackRate]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    setAudioError('');
    if (audio.paused) {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
        setAudioError('Unable to start playback automatically. Please press play again.');
      }
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextTime = Number(e.target.value);
    setCurrentTime(nextTime);
    if (audioRef.current && Number.isFinite(nextTime)) {
      audioRef.current.currentTime = nextTime;
    }
  };

  const skipBy = (deltaSeconds: number) => {
    const audio = audioRef.current;
    const maxTime = duration > 0 ? duration : DEFAULT_DURATION_SECONDS;
    const nextTime = Math.min(Math.max(0, (audio ? audio.currentTime : currentTime) + deltaSeconds), maxTime);
    setCurrentTime(nextTime);
    if (audio) {
      audio.currentTime = nextTime;
    }
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (audio) {
      audio.muted = nextMuted;
    }
  };

  const cycleSpeed = () => {
    const nextIndex = (speedIndex + 1) % SPEED_OPTIONS.length;
    setSpeedIndex(nextIndex);
    if (audioRef.current) {
      audioRef.current.playbackRate = SPEED_OPTIONS[nextIndex];
    }
  };

  const effectiveDuration = duration > 0 ? duration : DEFAULT_DURATION_SECONDS;
  const progressPercent = Math.min(100, Math.max(0, (currentTime / effectiveDuration) * 100));

  return (
    <aside
      className={`gy-audio-player${isPlaying ? ' is-playing' : ''}`}
      aria-label="Featured audio overview player"
    >
      <audio
        ref={audioRef}
        preload="metadata"
        onLoadedMetadata={e => {
          const d = e.currentTarget.duration;
          if (Number.isFinite(d) && d > 0) setDuration(d);
        }}
        onDurationChange={e => {
          const d = e.currentTarget.duration;
          if (Number.isFinite(d) && d > 0) setDuration(d);
        }}
        onTimeUpdate={e => {
          setCurrentTime(e.currentTarget.currentTime);
        }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(0);
        }}
      >
        <source src={primarySrc} type="audio/mp4" />
        <source src={`/${AUDIO_FILENAME}`} type="audio/mp4" />
      </audio>

      <div className="gy-audio-main">
        <button
          type="button"
          className="gy-audio-play-btn"
          onClick={togglePlay}
          aria-pressed={isPlaying ? 'true' : 'false'}
          aria-label={
            isPlaying
              ? 'Pause audio: How Tech Funnels Bypass Superyacht Gatekeepers'
              : 'Play audio: How Tech Funnels Bypass Superyacht Gatekeepers'
          }
        >
          {isPlaying ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <rect x="6" y="5" width="4" height="14" rx="1.2" />
              <rect x="14" y="5" width="4" height="14" rx="1.2" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M8 5.14v13.72a1 1 0 0 0 1.52.85l11-6.86a1 1 0 0 0 0-1.7l-11-6.86A1 1 0 0 0 8 5.14z" />
            </svg>
          )}
        </button>

        <div className="gy-audio-info">
          <div className="gy-audio-meta-row">
            <span className="gy-audio-badge">
              <span className="gy-audio-eq" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              AUDIO OVERVIEW
            </span>
            <span className="gy-audio-time" aria-live="off">
              {formatAudioTime(currentTime)} / {formatAudioTime(effectiveDuration)}
            </span>
          </div>

          <p className="gy-audio-title" title="How Tech Funnels Bypass Superyacht Gatekeepers">
            How Tech Funnels Bypass Superyacht Gatekeepers
          </p>

          <div className="gy-audio-controls-row">
            <input
              type="range"
              className="gy-audio-seek"
              aria-label="Seek audio position"
              min={0}
              max={effectiveDuration}
              step={0.1}
              value={currentTime}
              onChange={handleSeek}
              style={{'--audio-progress': `${progressPercent}%`} as React.CSSProperties}
            />

            <div className="gy-audio-MiniActions">
              <button
                type="button"
                className="gy-audio-chip"
                onClick={() => skipBy(-15)}
                aria-label="Rewind 15 seconds"
                title="Rewind 15 seconds"
              >
                -15s
              </button>
              <button
                type="button"
                className="gy-audio-chip"
                onClick={() => skipBy(15)}
                aria-label="Forward 15 seconds"
                title="Forward 15 seconds"
              >
                +15s
              </button>
              <button
                type="button"
                className="gy-audio-chip"
                onClick={cycleSpeed}
                aria-label={`Playback speed ${playbackRate}x, click to change`}
                title="Change playback speed"
              >
                {playbackRate}x
              </button>
              <button
                type="button"
                className="gy-audio-chip"
                onClick={toggleMute}
                aria-pressed={isMuted ? 'true' : 'false'}
                aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
                title={isMuted ? 'Unmute audio' : 'Mute audio'}
              >
                {isMuted ? 'Unmute' : 'Mute'}
              </button>
              <a
                href={NOTEBOOKLM_SHARE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="gy-audio-source-link"
                aria-label="Open Audio Overview in NotebookLM (opens in new tab)"
              >
                NotebookLM ↗
              </a>
            </div>
          </div>
          {audioError && (
            <p className="gy-audio-error" role="status">
              {audioError}
            </p>
          )}
        </div>
      </div>
    </aside>
  );
}
export default HomeAudioPlayer;
