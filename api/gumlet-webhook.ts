const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://wfblxexdqlxeequvywfc.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const GUMLET_WEBHOOK_SECRET = process.env.GUMLET_WEBHOOK_SECRET || 'gycs_gumlet_wh_2026';
const EDGE_WEBHOOK_URL = `${SUPABASE_URL.replace(/\/$/, '')}/functions/v1/gumlet-webhook`;

const VIDEO_STATUS_EVENTS = new Set([
  'video.status.created',
  'video.status.downloaded',
  'video.status.stream_ready',
  'video.status.optimized',
  'video.status.ready',
  'video.status.repackaged',
  'video.status.errored',
  'video.status.deleted',
]);

const LIVE_STATUS_EVENTS = new Set([
  'live.video.status.created',
  'live.video.status.preparing',
  'live.video.status.ready',
  'live.video.status.connected',
  'live.video.status.active',
  'live.video.status.disconnected',
  'live.video.status.complete',
]);

const PRODUCT_EVENTS = new Set([
  'event.video.uploaded',
  'event.video.updated',
  'event.video.analytics',
  'event.image.analytics',
  'event.embed.viewed',
  'event.embed.cta_clicked',
  'event.embed.form_submitted',
  'event.playlist.created',
  'event.playlist.asset',
  'event.playlist.deleted',
  'event.comment.all',
  'event.channel.member_joined',
]);

const reply = (status: number, body: unknown) =>
  Response.json(body, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });

async function supabaseRest(path: string, method: string, body?: unknown, prefer = 'return=minimal') {
  if (!SUPABASE_SERVICE_ROLE_KEY) return null;
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method,
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: prefer,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  return res;
}

export default {
  async fetch(request: Request) {
    if (request.method === 'GET') {
      return reply(200, {
        ok: true,
        service: 'gycs-gumlet-webhook',
        supportedTriggers: [
          'status',
          'live-video-status',
          ...Array.from(VIDEO_STATUS_EVENTS),
          ...Array.from(LIVE_STATUS_EVENTS),
          ...Array.from(PRODUCT_EVENTS),
        ],
      });
    }

    if (request.method !== 'POST') {
      return reply(405, { error: 'POST required' });
    }

    const tokenHeader = request.headers.get('x-gumlet-token') || '';
    const validSecrets = new Set([GUMLET_WEBHOOK_SECRET, 'gycs_gumlet_wh_2026', 'webhook_1'].filter(Boolean));
    const tokenVerified = Boolean(tokenHeader && validSecrets.has(tokenHeader));

    if (tokenHeader && !validSecrets.has(tokenHeader)) {
      return reply(401, { error: 'Invalid x-gumlet-token' });
    }

    let payload: Record<string, any>;
    try {
      payload = (await request.json()) as Record<string, any>;
    } catch {
      return reply(400, { error: 'Invalid JSON body' });
    }

    // If SUPABASE_SERVICE_ROLE_KEY is not present in Vercel env, delegate persistence to the Supabase Edge Function
    if (!SUPABASE_SERVICE_ROLE_KEY) {
      const edgeRes = await fetch(EDGE_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(tokenHeader ? { 'x-gumlet-token': tokenHeader } : {}),
        },
        body: JSON.stringify(payload),
      });
      const edgeBody = await edgeRes.json().catch(() => ({ received: edgeRes.ok }));
      return reply(edgeRes.status, edgeBody);
    }

    const eventType = String(payload.type || '');
    if (!eventType) {
      return reply(400, { error: 'Missing webhook event type' });
    }

    const category = VIDEO_STATUS_EVENTS.has(eventType)
      ? 'video_status'
      : LIVE_STATUS_EVENTS.has(eventType)
        ? 'live_status'
        : PRODUCT_EVENTS.has(eventType)
          ? 'product_event'
          : 'unknown';

    const assetId = payload.asset_id ? String(payload.asset_id) : null;
    const liveAssetId = payload.live_asset_id ? String(payload.live_asset_id) : null;
    const playlistId = payload.playlist_id || payload.id ? String(payload.playlist_id || payload.id) : null;
    const status = payload.status ? String(payload.status) : null;
    const notes: string[] = [];

    try {
      // 1. Handle Video Asset Lifecycle Events (video.status.* and event.video.uploaded / updated)
      if (category === 'video_status' || eventType === 'event.video.uploaded' || eventType === 'event.video.updated') {
        const input = (payload.input || {}) as Record<string, any>;
        const output = (payload.output || {}) as Record<string, any>;
        const metadata = (input.metadata && typeof input.metadata === 'object' ? input.metadata : {}) as Record<string, any>;
        const lessonId = typeof metadata.lesson_id === 'string' ? metadata.lesson_id : null;
        const submissionId = typeof metadata.submission_id === 'string' ? metadata.submission_id : null;
        const embedUrl = assetId ? `https://play.gumlet.io/embed/${assetId}` : null;
        const thumbnails = Array.isArray(output.thumbnail_url) ? output.thumbnail_url : [];
        const primaryThumb = typeof thumbnails[0] === 'string' ? thumbnails[0] : null;
        const durationSecs = typeof input.duration === 'number' ? input.duration : null;

        if (assetId) {
          await supabaseRest(
            'gumlet_video_assets?on_conflict=asset_id',
            'POST',
            {
              asset_id: assetId,
              workspace_id: payload.workspace_id || payload.collection_id || input.collection_id || null,
              playlist_id: metadata.playlist_id || null,
              lesson_id: lessonId,
              submission_id: submissionId,
              title: payload.title || input.title || null,
              description: payload.description || input.description || null,
              status: status || eventType.replace('video.status.', ''),
              duration_seconds: durationSecs,
              aspect_ratio: input.aspect_ratio || null,
              width: typeof input.width === 'number' ? input.width : null,
              height: typeof input.height === 'number' ? input.height : null,
              playback_url: output.playback_url || null,
              dash_playback_url: output.dash_playback_url || null,
              embed_url: embedUrl,
              download_url: output.download_url || null,
              thumbnail_urls: thumbnails,
              preview_thumbnails_url: output.preview_thumbnails_url || null,
              animated_gif_url: output.animated_gif_url || null,
              tags: Array.isArray(payload.tag) ? payload.tag : [],
              metadata,
              transformations: input.transformations || {},
              error_code: payload.error?.code || null,
              error_message: payload.error?.message || null,
              warning: payload.warning || null,
              gumlet_created_at: typeof payload.created_at === 'number' ? new Date(payload.created_at).toISOString() : null,
              updated_at: new Date().toISOString(),
            },
            'resolution=merge-duplicates,return=minimal'
          );
          notes.push(`Upserted gumlet_video_assets(${assetId})`);

          // Sync linked course lesson (by metadata.lesson_id or gumlet_asset_id)
          const lessonPatch: Record<string, any> = {
            gumlet_asset_id: assetId,
            gumlet_status: status || eventType.replace('video.status.', ''),
            gumlet_embed_url: embedUrl,
            updated_at: new Date().toISOString(),
          };
          if (output.playback_url) {
            lessonPatch.gumlet_playback_url = output.playback_url;
            lessonPatch.video_url = embedUrl;
          }
          if (output.dash_playback_url) lessonPatch.gumlet_dash_url = output.dash_playback_url;
          if (primaryThumb) lessonPatch.gumlet_thumbnail_url = primaryThumb;
          if (output.preview_thumbnails_url) lessonPatch.gumlet_preview_thumbnails_url = output.preview_thumbnails_url;
          if (durationSecs && durationSecs > 0) {
            lessonPatch.duration_mins = Math.max(1, Math.round(durationSecs / 60));
          }

          if (lessonId) {
            await supabaseRest(`lessons?id=eq.${encodeURIComponent(lessonId)}`, 'PATCH', lessonPatch);
            notes.push(`Synced lesson(${lessonId})`);
          } else {
            await supabaseRest(`lessons?gumlet_asset_id=eq.${encodeURIComponent(assetId)}`, 'PATCH', lessonPatch);
          }

          // Sync linked practical video assignment submission if applicable
          if (submissionId) {
            await supabaseRest(`assignment_submissions?id=eq.${encodeURIComponent(submissionId)}`, 'PATCH', {
              gumlet_asset_id: assetId,
              gumlet_status: status || eventType.replace('video.status.', ''),
              gumlet_embed_url: embedUrl,
              gumlet_playback_url: output.playback_url || null,
            });
            notes.push(`Synced assignment_submission(${submissionId})`);
          }
        }
      }

      // 2. Handle Live Video Stream Lifecycle Events (live.video.status.*)
      if (category === 'live_status' && liveAssetId) {
        const input = (payload.input || {}) as Record<string, any>;
        const output = (payload.output || {}) as Record<string, any>;
        const isActive = status === 'active' || eventType === 'live.video.status.active';
        const embedUrl = output.embed_url || `https://play.gumlet.io/embed/live/${liveAssetId}`;
        const recordingAssetId = payload.recording_asset_id ? String(payload.recording_asset_id) : null;
        const vodCollectionId = payload.vod_collection_id ? String(payload.vod_collection_id) : null;
        const recordingPlaybackUrl =
          output.recording_playback_url ||
          (vodCollectionId && recordingAssetId
            ? `https://video.gumlet.io/${vodCollectionId}/${recordingAssetId}/main.m3u8`
            : null);

        await supabaseRest(
          'gumlet_live_assets?on_conflict=live_asset_id',
          'POST',
          {
            live_asset_id: liveAssetId,
            live_source_id: input.live_video_source_id || null,
            title: input.title || null,
            status: status || eventType.replace('live.video.status.', ''),
            is_active: isActive,
            embed_url: embedUrl,
            playback_url: output.playback_url || null,
            recording_asset_id: recordingAssetId,
            vod_collection_id: vodCollectionId,
            recording_playback_url: recordingPlaybackUrl,
            duration_seconds: typeof output.duration === 'number' ? output.duration : null,
            storage_size: typeof output.storage_size === 'number' ? output.storage_size : null,
            width: typeof input.width === 'number' ? input.width : null,
            height: typeof input.height === 'number' ? input.height : null,
            aspect_ratio: input.aspect_ratio || null,
            resolution: Array.isArray(input.resolution) ? input.resolution : [],
            error_code: payload.error?.code || null,
            error_message: payload.error?.message || null,
            gumlet_created_at: typeof payload.created_at === 'number' ? new Date(payload.created_at).toISOString() : null,
            updated_at: new Date().toISOString(),
          },
          'resolution=merge-duplicates,return=minimal'
        );
        notes.push(`Upserted gumlet_live_assets(${liveAssetId}, is_active=${isActive})`);

        // Sync linked live_sessions row (including automatic VOD replay URL when stream completes)
        const sessionPatch: Record<string, any> = {
          gumlet_status: status || eventType.replace('live.video.status.', ''),
          gumlet_embed_url: embedUrl,
        };
        if (output.playback_url) sessionPatch.gumlet_playback_url = output.playback_url;
        if (recordingAssetId) {
          sessionPatch.gumlet_recording_asset_id = recordingAssetId;
          sessionPatch.recording_url = `https://play.gumlet.io/embed/${recordingAssetId}`;
        }
        await supabaseRest(
          `live_sessions?gumlet_live_asset_id=eq.${encodeURIComponent(liveAssetId)}`,
          'PATCH',
          sessionPatch
        );
      }

      // 3. Handle Playlist / Course Events (event.playlist.*)
      if (
        eventType === 'event.playlist.created' ||
        eventType === 'event.playlist.asset' ||
        eventType === 'event.playlist.deleted'
      ) {
        const plId = String(payload.playlist_id || payload.id || '');
        if (plId) {
          await supabaseRest(
            'gumlet_playlists?on_conflict=playlist_id',
            'POST',
            {
              playlist_id: plId,
              collection_id: String(payload.collection_id || payload.workspace_id || '649378a6fdae81aad3b96497'),
              title: String(payload.title || 'Gumlet Course Playlist'),
              description: payload.description ? String(payload.description) : null,
              is_deleted: eventType === 'event.playlist.deleted',
              updated_at: new Date().toISOString(),
            },
            'resolution=merge-duplicates,return=minimal'
          );
          notes.push(`Synced gumlet_playlists(${plId})`);
        }
      }

      // 4. Append immutable audit log to gumlet_webhook_events
      await supabaseRest('gumlet_webhook_events', 'POST', {
        event_type: eventType,
        category,
        asset_id: assetId,
        live_asset_id: liveAssetId,
        playlist_id: playlistId,
        status,
        token_verified: tokenVerified,
        payload,
        processed: true,
        processing_notes: notes.join('; ') || 'Recorded event',
      });
    } catch (err) {
      return reply(200, {
        received: true,
        eventType,
        category,
        warning: err instanceof Error ? err.message : 'Partial database sync',
      });
    }

    return reply(200, {
      received: true,
      eventType,
      category,
      assetId,
      liveAssetId,
      status,
      tokenVerified,
      notes,
    });
  },
};
