const GUMLET_LIVE_ASSET_ID = '6adec989e655cfbd8127b254';
const GUMLET_EMBED_URL = `https://play.gumlet.io/embed/live/${GUMLET_LIVE_ASSET_ID}`;
const DEFAULT_PLAYBACK_URL = `https://stream.gumlet.io/6adec52cd8b4449c83d2c8ec/${GUMLET_LIVE_ASSET_ID}/main.m3u8`;

const reply = (status: number, body: unknown) =>
  Response.json(body, {
    status,
    headers: {
      'Cache-Control': 'no-store, max-age=0',
      'X-Content-Type-Options': 'nosniff',
    },
  });

export default {
  async fetch(request: Request) {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return reply(405, { error: 'GET required' });
    }

    try {
      const embedRes = await fetch(GUMLET_EMBED_URL, {
        method: 'GET',
        headers: {
          Accept: 'text/html',
          'User-Agent': 'GYCS-Crew-Hub-LiveCheck/1.0',
        },
        signal: AbortSignal.timeout(8000),
      });

      if (!embedRes.ok) {
        return reply(200, {
          isLive: false,
          status: 'unavailable',
          assetId: GUMLET_LIVE_ASSET_ID,
          embedUrl: GUMLET_EMBED_URL,
        });
      }

      const html = await embedRes.text();

      // Extract status and playBackUrl from Gumlet embed payload
      const statusMatch = html.match(/\\"status\\":\\"([^"\\]+)\\"/) || html.match(/"status":"([^"]+)"/);
      const playbackMatch =
        html.match(/\\"playBackUrl\\":\\"(https:\/\/stream\.gumlet\.io\/[^"\\]+\.m3u8)\\"/) ||
        html.match(/"playBackUrl":"(https:\/\/stream\.gumlet\.io\/[^"]+\.m3u8)"/);
      const isLiveBroadcastMatch =
        html.match(/\\"isLiveBroadcast\\":(true|false)/) ||
        html.match(/"isLiveBroadcast":(true|false)/);

      const streamStatus = statusMatch?.[1] || 'unknown';
      const playbackUrl = playbackMatch?.[1] || DEFAULT_PLAYBACK_URL;
      const ldIsLive = isLiveBroadcastMatch?.[1] === 'true';

      if (streamStatus === 'complete') {
        return reply(200, {
          isLive: false,
          status: streamStatus,
          assetId: GUMLET_LIVE_ASSET_ID,
          embedUrl: GUMLET_EMBED_URL,
        });
      }

      // Check the live HLS manifest just like Gumlet's own player (module 27727)
      const hlsRes = await fetch(playbackUrl, {
        method: 'GET',
        headers: { Accept: 'application/vnd.apple.mpegurl,application/x-mpegURL,*/*' },
        signal: AbortSignal.timeout(6000),
      });

      let hlsActive = false;
      if (hlsRes.status === 200) {
        const manifest = await hlsRes.text();
        // A live HLS stream starts with #EXTM3U and has not reached #EXT-X-ENDLIST
        hlsActive = manifest.includes('#EXTM3U') && !manifest.includes('#EXT-X-ENDLIST');
      }

      const isLive =
        streamStatus !== 'complete' &&
        (hlsActive || streamStatus === 'active' || streamStatus === 'live' || (ldIsLive && hlsRes.status === 200));

      return reply(200, {
        isLive,
        status: streamStatus,
        assetId: GUMLET_LIVE_ASSET_ID,
        embedUrl: GUMLET_EMBED_URL,
      });
    } catch {
      return reply(200, {
        isLive: false,
        status: 'error',
        assetId: GUMLET_LIVE_ASSET_ID,
        embedUrl: GUMLET_EMBED_URL,
      });
    }
  },
};
