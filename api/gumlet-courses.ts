const GUMLET_API_BASE = 'https://api.gumlet.com/v1';
const DEFAULT_VIDEO_WORKSPACE_ID = '649378a6fdae81aad3b96497'; // Career Coaching collection
const DEFAULT_LIVE_SOURCE_ID = '6adec52cd8b4449c83d2c8ec'; // Live Demos live source
const DEFAULT_CHAD_PROFILE_ID = '64937b53fdae81aad3b97b01'; // ABR + Auto-Subtitles + Preview Thumbnails

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://wfblxexdqlxeequvywfc.supabase.co';
const SUPABASE_ANON_KEY =
  process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_hF8ABp0OCKLvJha8EokQMw_GG2UNEEE';

const reply = (status: number, body: unknown) =>
  Response.json(body, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });

async function verifyCaller(request: Request) {
  const auth = request.headers.get('authorization') || '';
  if (!auth.toLowerCase().startsWith('bearer ')) return null;
  const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: auth,
    },
  });
  if (!res.ok) return null;
  const user = (await res.json()) as { id?: string; email?: string };
  if (!user?.id) return null;

  // Fetch caller role from profiles using caller's JWT
  const profRes = await fetch(
    `${SUPABASE_URL}/rest/v1/profiles?id=eq.${encodeURIComponent(user.id)}&select=id,role,display_name,is_active`,
    {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: auth,
      },
    }
  );
  const profiles = profRes.ok ? ((await profRes.json()) as Array<{ id: string; role: string; is_active: boolean }>) : [];
  const profile = profiles[0];
  if (!profile?.is_active) return null;
  return { userId: user.id, email: user.email, role: profile.role };
}

async function gumletRequest(path: string, method = 'GET', body?: unknown) {
  const apiKey = process.env.GUMLET_API_KEY?.trim();
  if (!apiKey) {
    throw new Error('GUMLET_API_KEY is not configured on the server.');
  }
  const res = await fetch(`${GUMLET_API_BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: 'application/json',
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(15000),
  });
  const text = await res.text();
  let data: any = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }
  if (!res.ok) {
    throw new Error(data?.error?.message || `Gumlet API HTTP ${res.status}`);
  }
  return data;
}

export default {
  async fetch(request: Request) {
    const caller = await verifyCaller(request);
    if (!caller) {
      return reply(401, { error: 'Sign in with an active GYCS Crew Hub account is required.' });
    }

    try {
      if (request.method === 'GET') {
        const url = new URL(request.url);
        const workspaceId = url.searchParams.get('workspace_id') || DEFAULT_VIDEO_WORKSPACE_ID;
        const playlistId = url.searchParams.get('playlist_id');

        if (playlistId) {
          const playlistAssets = await gumletRequest(
            `/video/playlist/${encodeURIComponent(playlistId)}/assets?sort_order=asc&page_number=1&page_size=100`
          );
          return reply(200, { playlistId, ...playlistAssets });
        }

        const [playlists, assets, liveAssets] = await Promise.all([
          gumletRequest(`/video/playlist?collection_id=${encodeURIComponent(workspaceId)}`),
          gumletRequest(`/video/assets/list/${encodeURIComponent(workspaceId)}`),
          gumletRequest(`/video/live/assets/list/${encodeURIComponent(DEFAULT_LIVE_SOURCE_ID)}`),
        ]);

        return reply(200, {
          workspaceId,
          liveSourceId: DEFAULT_LIVE_SOURCE_ID,
          playlists,
          assets: assets?.all_assets || [],
          liveAssets: liveAssets?.all_live_assets || [],
        });
      }

      if (request.method !== 'POST') {
        return reply(405, { error: 'GET or POST required' });
      }

      const body = (await request.json().catch(() => ({}))) as Record<string, any>;
      const action = String(body.action || '');

      // Member-accessible action: direct upload URL for practical video assignments (e.g. Week 3 knot demo)
      if (action === 'create_practical_upload') {
        const assignmentId = String(body.assignmentId || '').trim();
        const submissionId = String(body.submissionId || '').trim();
        const title = String(body.title || `Practical Submission - ${caller.userId.slice(0, 8)}`).trim();
        if (!assignmentId) {
          return reply(400, { error: 'assignmentId is required' });
        }

        const uploadAsset = await gumletRequest('/video/assets/upload', 'POST', {
          collection_id: DEFAULT_VIDEO_WORKSPACE_ID,
          format: 'ABR',
          resolution: '360p,480p,720p,1080p',
          title,
          description: `Practical video assignment submission by ${caller.userId}`,
          tag: ['practical-submission', assignmentId],
          generate_subtitles: {
            audio_language: 'en',
            subtitle_languages: ['en'],
          },
          metadata: {
            user_id: caller.userId,
            assignment_id: assignmentId,
            submission_id: submissionId || undefined,
            source: 'gycs_crew_hub_practical',
          },
        });

        return reply(200, {
          assetId: uploadAsset.asset_id,
          uploadUrl: uploadAsset.upload_url,
          embedUrl: `https://play.gumlet.io/embed/${uploadAsset.asset_id}`,
          status: uploadAsset.status,
        });
      }

      // All course authoring & live stream creation actions require coach, admin, or superadmin role
      if (!['coach', 'admin', 'superadmin'].includes(caller.role)) {
        return reply(403, { error: 'Coach, administrator, or superadmin permissions required for course authoring.' });
      }

      if (action === 'create_course_playlist') {
        const title = String(body.title || '').trim();
        const description = String(body.description || '').trim();
        const collectionId = String(body.collectionId || DEFAULT_VIDEO_WORKSPACE_ID).trim();
        if (!title) return reply(400, { error: 'Course playlist title is required.' });

        const created = await gumletRequest('/video/playlist', 'POST', {
          collection_id: collectionId,
          title,
          description,
        });
        return reply(200, created);
      }

      if (action === 'create_lesson_video') {
        const title = String(body.title || '').trim();
        const description = String(body.description || '').trim();
        const inputUrl = body.inputUrl ? String(body.inputUrl).trim() : '';
        const playlistId = body.playlistId ? String(body.playlistId).trim() : undefined;
        const lessonId = body.lessonId ? String(body.lessonId).trim() : undefined;
        const programmeId = body.programmeId ? String(body.programmeId).trim() : undefined;
        const week = body.week ? Number(body.week) : undefined;
        const workspaceId = String(body.workspaceId || DEFAULT_VIDEO_WORKSPACE_ID).trim();

        if (!title) return reply(400, { error: 'Lesson video title is required.' });

        const commonPayload = {
          profile_id: body.profileId || DEFAULT_CHAD_PROFILE_ID,
          format: 'ABR',
          title,
          description,
          tag: Array.isArray(body.tags) ? body.tags : ['course-lesson', ...(week ? [`week-${week}`] : [])],
          playlist_id: playlistId,
          generate_subtitles: {
            audio_language: 'en',
            subtitle_languages: ['en'],
          },
          call_to_actions: Array.isArray(body.callToActions) ? body.callToActions : undefined,
          metadata: {
            lesson_id: lessonId,
            programme_id: programmeId,
            week,
            playlist_id: playlistId,
          },
        };

        // If inputUrl is provided, Gumlet ingests from URL (/video/assets); otherwise returns presigned PUT upload_url (/video/assets/upload)
        const result = inputUrl
          ? await gumletRequest('/video/assets', 'POST', {
              ...commonPayload,
              workspace_id: workspaceId,
              input: inputUrl,
            })
          : await gumletRequest('/video/assets/upload', 'POST', {
              ...commonPayload,
              collection_id: workspaceId,
            });

        // If playlistId was supplied and asset was created, ensure it is attached to the playlist
        if (playlistId && result?.asset_id) {
          await gumletRequest(`/video/playlist/${encodeURIComponent(playlistId)}/asset`, 'POST', {
            asset_list: [{ asset_id: result.asset_id, ...(typeof body.position === 'number' ? { position: body.position } : {}) }],
          }).catch(() => null);
        }

        return reply(200, {
          ...result,
          embed_url: `https://play.gumlet.io/embed/${result.asset_id}`,
        });
      }

      if (action === 'update_lesson_chapters') {
        const assetId = String(body.assetId || '').trim();
        const chapters = Array.isArray(body.chapters) ? body.chapters : [];
        if (!assetId || !chapters.length) {
          return reply(400, { error: 'assetId and non-empty chapters array are required.' });
        }
        const res = await gumletRequest(`/video/assets/${encodeURIComponent(assetId)}/chapters`, 'POST', {
          chapters,
        });
        return reply(200, res);
      }

      if (action === 'create_live_session_stream') {
        const title = String(body.title || 'GYCS Weekly Live Coaching').trim();
        const liveAsset = await gumletRequest('/video/live/assets', 'POST', {
          live_source_id: String(body.liveSourceId || DEFAULT_LIVE_SOURCE_ID),
          resolution: ['360p', '480p', '720p', '1080p'],
          title,
          orientation: 'landscape',
          mp4_access: true,
        });
        return reply(200, {
          ...liveAsset,
          embed_url: `https://play.gumlet.io/embed/live/${liveAsset.live_asset_id}`,
        });
      }

      return reply(400, { error: `Unsupported action: ${action}` });
    } catch (err) {
      return reply(502, {
        error: err instanceof Error ? err.message : 'Gumlet API request failed.',
      });
    }
  },
};
