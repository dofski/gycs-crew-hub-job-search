const DEFAULT_LIVE_ASSET_ID = '6adec989e655cfbd8127b254';
const DEFAULT_LIVE_SOURCE_ID = '6adec52cd8b4449c83d2c8ec';

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

    const reqUrl = new URL(request.url);
    const liveAssetId = (reqUrl.searchParams.get('live_asset_id') || DEFAULT_LIVE_ASSET_ID).trim();
    const embedUrl = `https://play.gumlet.io/embed/live/${liveAssetId}`;
    const defaultPlaybackUrl = `https://stream.gumlet.io/${DEFAULT_LIVE_SOURCE_ID}/${liveAssetId}/main.m3u8`;
    const apiKey = process.env.GUMLET_API_KEY?.trim();

    // 1. Authoritative check via Gumlet Live Asset Status API (/v1/video/live/assets/{live_asset_id}) when GUMLET_API_KEY is configured
    if (apiKey) {
      try {
        const apiRes = await fetch(`https://api.gumlet.com/v1/video/live/assets/${encodeURIComponent(liveAssetId)}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            Accept: 'application/json',
          },
          signal: AbortSignal.timeout(6000),
        });
        if (apiRes.ok) {
          const data = (await apiRes.json()) as {
            status?: string;
            live_asset_id?: string;
            vod_asset_id?: string;
            output?: { playback_url?: string; recording_playback_url?: string };
            input?: { title?: string };
          };
          const status = String(data.status || 'unknown');
          const isLive = status === 'active' || status === 'connected';
          return reply(200, {
            isLive,
            status,
            assetId: liveAssetId,
            embedUrl,
            playbackUrl: data.output?.playback_url || defaultPlaybackUrl,
            recordingAssetId: data.vod_asset_id || null,
            recordingPlaybackUrl: data.output?.recording_playback_url || null,
            title: data.input?.title || null,
            source: 'gumlet_api',
          });
        }
      } catch {
        // Fall back to embed + HLS probe below
      }
    }

    // 2. Public fallback: inspect Gumlet embed state + HLS manifest
    try {
      const embedRes = await fetch(embedUrl, {
        method: 'GET',
        headers: {
          Accept: 'text/html',
          'User-Agent': 'GYCS-Crew-Hub-LiveCheck/1.1',
        },
        signal: AbortSignal.timeout(8000),
      });

      if (!embedRes.ok) {
        return reply(200, {
          isLive: false,
          status: 'unavailable',
          assetId: liveAssetId,
          embedUrl,
        });
      }

      const html = await embedRes.text();
      const statusMatch = html.match(/\\"status\\":\\"([^"\\]+)\\"/) || html.match(/"status":"([^"]+)"/);
      const playbackMatch =
        html.match(/\\"playBackUrl\\":\\"(https:\/\/stream\.gumlet\.io\/[^"\\]+\.m3u8)\\"/) ||
        html.match(/"playBackUrl":"(https:\/\/stream\.gumlet\.io\/[^"]+\.m3u8)"/);
      const isLiveBroadcastMatch =
        html.match(/\\"isLiveBroadcast\\":(true|false)/) ||
        html.match(/"isLiveBroadcast":(true|false)/);

      const streamStatus = statusMatch?.[1] || 'unknown';
      const playbackUrl = playbackMatch?.[1] || defaultPlaybackUrl;
      const ldIsLive = isLiveBroadcastMatch?.[1] === 'true';

      if (streamStatus === 'complete' || streamStatus === 'deleted' || streamStatus === 'disconnected') {
        return reply(200, {
          isLive: false,
          status: streamStatus,
          assetId: liveAssetId,
          embedUrl,
        });
      }

      const hlsRes = await fetch(playbackUrl, {
        method: 'GET',
        headers: { Accept: 'application/vnd.apple.mpegurl,application/x-mpegURL,*/*' },
        signal: AbortSignal.timeout(6000),
      });

      let hlsActive = false;
      if (hlsRes.status === 200) {
        const manifest = await hlsRes.text();
        hlsActive = manifest.includes('#EXTM3U') && !manifest.includes('#EXT-X-ENDLIST');
      }

      const isLive =
        streamStatus !== 'complete' &&
        (hlsActive || streamStatus === 'active' || streamStatus === 'live' || (ldIsLive && hlsRes.status === 200));

      return reply(200, {
        isLive,
        status: streamStatus,
        assetId: liveAssetId,
        embedUrl,
      });
    } catch {
      return reply(200, {
        isLive: false,
        status: 'error',
        assetId: liveAssetId,
        embedUrl,
      });
    }
  },
};
