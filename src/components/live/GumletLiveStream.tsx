import React, { useEffect, useState } from 'react';

export const GUMLET_LIVE_EMBED_SRC = 'https://play.gumlet.io/embed/live/6adec989e655cfbd8127b254';
const GUMLET_HLS_URL =
  'https://stream.gumlet.io/6adec52cd8b4449c83d2c8ec/6adec989e655cfbd8127b254/main.m3u8';

export interface GumletLiveStatus {
  isLive: boolean;
  checked: boolean;
  status: string;
}

export async function checkGumletStreamActive(): Promise<GumletLiveStatus> {
  // 1. Check server-side endpoint (/api/live-status) which inspects both the Gumlet embed state and HLS manifest
  try {
    const apiRes = await fetch('/api/live-status', {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
    if (apiRes.ok) {
      const contentType = apiRes.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await apiRes.json();
        if (typeof data?.isLive === 'boolean') {
          return {
            isLive: data.isLive,
            checked: true,
            status: String(data.status || (data.isLive ? 'live' : 'offline')),
          };
        }
      }
    }
  } catch {
    // Fall back to direct HLS manifest probe below
  }

  // 2. Fallback: direct CORS probe against Gumlet's CloudFront HLS stream manifest (matches Gumlet module 27727)
  try {
    const hlsRes = await fetch(GUMLET_HLS_URL, {
      method: 'GET',
      cache: 'no-store',
    });
    if (hlsRes.status === 200) {
      const text = await hlsRes.text();
      const active = text.includes('#EXTM3U') && !text.includes('#EXT-X-ENDLIST');
      return {
        isLive: active,
        checked: true,
        status: active ? 'live' : 'ended',
      };
    }
  } catch {
    // Offline or blocked
  }

  return {
    isLive: false,
    checked: true,
    status: 'offline',
  };
}

export function useGumletLiveStatus(pollIntervalMs = 15000): GumletLiveStatus {
  const [state, setState] = useState<GumletLiveStatus>({
    isLive: false,
    checked: false,
    status: 'checking',
  });

  useEffect(() => {
    let active = true;

    async function poll() {
      const next = await checkGumletStreamActive();
      if (active) {
        setState(next);
      }
    }

    void poll();
    const timer = window.setInterval(() => {
      if (document.visibilityState !== 'hidden') {
        void poll();
      }
    }, pollIntervalMs);

    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [pollIntervalMs]);

  return state;
}

/**
 * Exact Gumlet live player embed requested for GYCS Live Coaching and Landing pages.
 */
export function GumletLiveEmbed() {
  return (
    <div style={{ position: 'relative', aspectRatio: '16/9' }}>
      <iframe
        loading="lazy"
        title="Gumlet video player"
        src={GUMLET_LIVE_EMBED_SRC}
        style={{
          border: 'none',
          position: 'absolute',
          top: 0,
          left: 0,
          height: '100%',
          width: '100%',
        }}
        referrerPolicy="origin"
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen;clipboard-write;"
      />
    </div>
  );
}
