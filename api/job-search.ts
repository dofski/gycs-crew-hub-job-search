import process from 'node:process';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wfblxexdqlxeequvywfc.supabase.co';
const edgeProxyUrl = `${supabaseUrl}/functions/v1/job-search-proxy`;
const jsearchHost = 'jsearch.p.rapidapi.com';

class SafeError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

const reply = (status: number, body: unknown) =>
  Response.json(body, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });

async function bodyJSON(request: Request) {
  const reader = request.body?.getReader();
  if (!reader) throw new SafeError(400, 'Request body required');
  let size = 0;
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > 20000) {
      await reader.cancel();
      throw new SafeError(413, 'Request too large');
    }
    chunks.push(value);
  }
  const data = new Uint8Array(size);
  let offset = 0;
  for (const c of chunks) {
    data.set(c, offset);
    offset += c.length;
  }
  try {
    return JSON.parse(new TextDecoder().decode(data));
  } catch {
    throw new SafeError(400, 'Invalid JSON');
  }
}

export default {
  async fetch(request: Request) {
    try {
      if (request.method !== 'POST') return reply(405, { error: 'POST required' });
      if (!(request.headers.get('content-type') || '').includes('application/json')) {
        return reply(415, { error: 'JSON required' });
      }

      const origin = request.headers.get('origin');
      const allowed = [
        'https://hub.chaddewet.com',
        'https://gycs-crew-hub-job-search.vercel.app',
        ...(process.env.VERCEL_URL ? ['https://' + process.env.VERCEL_URL] : []),
      ];
      if (origin && !allowed.includes(origin)) {
        return reply(403, { error: 'Origin not permitted' });
      }

      const token = request.headers.get('authorization')?.match(/^Bearer (.+)$/i)?.[1]?.trim();
      if (!token) {
        return reply(401, { error: 'Sign in with an active GYCS member account to search jobs.' });
      }

      const anon =
        process.env.VITE_SUPABASE_ANON_KEY?.trim() ||
        'sb_publishable_hF8ABp0OCKLvJha8EokQMw_GG2UNEEE';

      const db = createClient(supabaseUrl, anon, {
        global: { headers: { Authorization: 'Bearer ' + token } },
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      });

      const { data: auth, error: authError } = await db.auth.getUser(token);
      if (authError || !auth.user) {
        return reply(401, { error: 'Your session expired. Sign in again.' });
      }

      const { data: profile, error: profileError } = await db
        .from('profiles')
        .select('is_active')
        .eq('id', auth.user.id)
        .single();

      if (profileError || !profile?.is_active) {
        return reply(403, { error: 'An active GYCS account is required.' });
      }

      const body = await bodyJSON(request);
      const action = typeof body?.action === 'string' ? body.action : '';

      if (action === 'search_jobs') {
        const jsearchKey = process.env.JSEARCH_API_KEY?.trim();
        if (!jsearchKey) {
          const edgeRes = await fetch(edgeProxyUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
              apikey: anon,
            },
            body: JSON.stringify(body),
            signal: AbortSignal.timeout(18000),
          });
          const edgeData = await edgeRes.json().catch(() => ({ error: 'Job search proxy failed.' }));
          return reply(edgeRes.status, edgeData);
        }

        const query =
          typeof body.query === 'string' && body.query.trim()
            ? body.query.trim().slice(0, 200)
            : 'yacht deckhand';
        const country = typeof body.country === 'string' ? body.country.trim().slice(0, 10) : '';
        const datePosted =
          typeof body.date_posted === 'string' && body.date_posted.trim()
            ? body.date_posted.trim().slice(0, 20)
            : 'all';

        const upstreamUrl = new URL('https://jsearch.p.rapidapi.com/search-v2');
        upstreamUrl.searchParams.set('query', query);
        upstreamUrl.searchParams.set('num_pages', '1');
        upstreamUrl.searchParams.set('date_posted', datePosted);
        if (country) upstreamUrl.searchParams.set('country', country);

        const upstream = await fetch(upstreamUrl.toString(), {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-rapidapi-host': jsearchHost,
            'x-rapidapi-key': jsearchKey,
          },
          signal: AbortSignal.timeout(15000),
          redirect: 'error',
        });

        if (!upstream.ok) {
          throw new SafeError(
            upstream.status === 429 ? 429 : 502,
            `Job search provider returned HTTP ${upstream.status}.`
          );
        }

        const result = await upstream.json();
        return reply(200, result);
      }

      if (action === 'employer_contacts') {
        const outscraperKey = process.env.OUTSCRAPER_API_KEY?.trim();
        if (!outscraperKey) {
          const edgeRes = await fetch(edgeProxyUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
              apikey: anon,
            },
            body: JSON.stringify(body),
            signal: AbortSignal.timeout(18000),
          });
          const edgeData = await edgeRes.json().catch(() => ({ error: 'Employer contacts proxy failed.' }));
          return reply(edgeRes.status, edgeData);
        }

        const rawDomain = typeof body.domain === 'string' ? body.domain.trim() : '';
        const cleanDomain = rawDomain
          .replace(/^https?:\/\//i, '')
          .replace(/^www\./i, '')
          .split('/')[0]
          .trim()
          .slice(0, 160);

        if (!cleanDomain || !/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(cleanDomain)) {
          return reply(400, { error: 'Enter a valid employer domain.' });
        }

        const upstreamUrl = new URL('https://api.outscraper.cloud/emails-and-contacts');
        upstreamUrl.searchParams.set('query', cleanDomain);
        upstreamUrl.searchParams.set('async', 'false');
        upstreamUrl.searchParams.set('ui', 'false');

        const upstream = await fetch(upstreamUrl.toString(), {
          method: 'GET',
          headers: {
            'x-api-key': outscraperKey,
          },
          signal: AbortSignal.timeout(15000),
          redirect: 'error',
        });

        if (!upstream.ok) {
          throw new SafeError(
            upstream.status === 429 ? 429 : 502,
            `Employer contact provider returned HTTP ${upstream.status}.`
          );
        }

        const result = await upstream.json();
        return reply(200, result);
      }

      return reply(400, { error: 'Invalid action. Supported actions: search_jobs, employer_contacts.' });
    } catch (e) {
      if (e instanceof SafeError) return reply(e.status, { error: e.message });
      return reply(502, { error: 'The search proxy request failed or timed out. Please retry.' });
    }
  },
};
