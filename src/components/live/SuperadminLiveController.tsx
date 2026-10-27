import React, { useCallback, useEffect, useState } from 'react';
import {
  Radio,
  Play,
  Square,
  Plus,
  RefreshCw,
  Copy,
  Check,
  Eye,
  EyeOff,
  Trash2,
  Edit3,
  Terminal,
  ExternalLink,
  Tv,
  Sliders,
  History,
  Link2,
  ShieldCheck,
  Search,
  Activity,
} from 'lucide-react';

export interface GumletLiveAssetItem {
  live_asset_id: string;
  live_source_id?: string;
  status?: string;
  title?: string;
  stream_url?: string;
  stream_key?: string;
  embed_url?: string;
  vod_asset_id?: string;
  input?: {
    title?: string;
    resolution?: string[];
    orientation?: string;
    mp4_access?: boolean;
  };
  output?: {
    playback_url?: string;
    recording_playback_url?: string;
  };
  created_at?: string | number;
  updated_at?: string | number;
}

export interface CoachingSessionRow {
  id: string;
  title: string;
  scheduled_at: string;
  meeting_url?: string | null;
  gumlet_embed_url?: string | null;
  gumlet_live_asset_id?: string | null;
}

interface SuperadminLiveControllerProps {
  accessToken?: string | null;
  userEmail?: string;
  userRole?: string;
  sessions?: CoachingSessionRow[];
  onBindSessionStream?: (sessionId: string, liveAssetId: string, embedUrl: string) => Promise<void> | void;
  onCreateCoachingSessionWithStream?: (payload: {
    title: string;
    scheduledAt: string;
    liveAssetId: string;
    embedUrl: string;
  }) => Promise<void> | void;
}

const DEFAULT_LIVE_SOURCE_ID = '6adec52cd8b4449c83d2c8ec';
const DEFAULT_LIVE_ASSET_ID = '6adec989e655cfbd8127b254';

export interface GumletMcpToolSpec {
  name: string;
  category: 'Live Streaming' | 'Video Assets' | 'Playlists & Chapters' | 'Webhooks' | 'Analytics' | 'Workspaces & Profiles';
  method: string;
  endpoint: string;
  requiredParams: string[];
  optionalParams: string[];
  description: string;
}

export const GUMLET_MCP_LIVE_TOOLS: GumletMcpToolSpec[] = [
  {
    name: 'create_live_asset',
    category: 'Live Streaming',
    method: 'POST',
    endpoint: 'https://api.gumlet.com/v1/video/live/assets',
    requiredParams: ['live_source_id'],
    optionalParams: ['title', 'resolution', 'orientation', 'mp4_access', 'start_at'],
    description:
      'Creates a live streaming asset on Gumlet and returns the RTMP stream_url, stream_key, live_asset_id, and HLS playback_url.',
  },
  {
    name: 'start_live',
    category: 'Live Streaming',
    method: 'POST',
    endpoint: 'https://api.gumlet.com/v1/video/live/assets/{live_asset_id}/start',
    requiredParams: ['live_asset_id'],
    optionalParams: [],
    description: 'Starts and provisions a created Gumlet live stream asset so it is ready to accept RTMP encoder input.',
  },
  {
    name: 'get_live_asset_status',
    category: 'Live Streaming',
    method: 'GET',
    endpoint: 'https://api.gumlet.com/v1/video/live/assets/{live_asset_id}',
    requiredParams: ['live_asset_id'],
    optionalParams: [],
    description:
      'Retrieves real-time status (created, preparing, ready, connected, active, disconnected, complete), stream credentials, and playback URLs for a live asset.',
  },
  {
    name: 'complete_live_stream',
    category: 'Live Streaming',
    method: 'POST',
    endpoint: 'https://api.gumlet.com/v1/video/live/assets/{live_asset_id}/complete',
    requiredParams: ['live_asset_id'],
    optionalParams: [],
    description:
      'Marks a live stream asset complete, closing RTMP ingest and finalizing the recorded VOD asset when mp4_access is enabled.',
  },
  {
    name: 'update_live_asset',
    category: 'Live Streaming',
    method: 'POST',
    endpoint: 'https://api.gumlet.com/v1/video/live/assets/update',
    requiredParams: ['live_asset_id'],
    optionalParams: ['title', 'start_at'],
    description: 'Updates the title or scheduled start timestamp of an existing Gumlet live streaming asset.',
  },
  {
    name: 'delete_live_asset',
    category: 'Live Streaming',
    method: 'DELETE',
    endpoint: 'https://api.gumlet.com/v1/video/live/assets/{live_asset_id}',
    requiredParams: ['live_asset_id'],
    optionalParams: [],
    description: 'Permanently removes a live asset from Gumlet storage and invalidates its associated playback URLs.',
  },
  {
    name: 'filter_live_assets',
    category: 'Live Streaming',
    method: 'GET',
    endpoint: 'https://api.gumlet.com/v1/video/live/assets/list/{live_source_id}',
    requiredParams: ['live_source_id'],
    optionalParams: ['status', 'size', 'offset'],
    description: 'Lists live assets for a given live_source_id with optional filtering by stream status and pagination.',
  },
  {
    name: 'asset_status_history',
    category: 'Live Streaming',
    method: 'GET',
    endpoint: 'https://api.gumlet.com/v1/video/live/assets/{live_asset_id}/history',
    requiredParams: ['live_asset_id'],
    optionalParams: [],
    description: 'Retrieves the chronological state transition history for a live stream asset.',
  },
  {
    name: 'thumbnail_upload_live',
    category: 'Live Streaming',
    method: 'POST',
    endpoint: 'https://api.gumlet.com/v1/video/live/assets/thumbnail/upload',
    requiredParams: ['live_asset_id', 'statuses'],
    optionalParams: [],
    description:
      'Generates presigned upload URLs for custom live stream state thumbnails (preparing, disconnected, end).',
  },
  {
    name: 'list_live_workspaces',
    category: 'Live Streaming',
    method: 'GET',
    endpoint: 'https://api.gumlet.com/v1/video/live/workspace',
    requiredParams: [],
    optionalParams: [],
    description: 'Lists all live stream workspaces / live sources configured in the Gumlet organization.',
  },
  {
    name: 'live_workspace_create',
    category: 'Live Streaming',
    method: 'POST',
    endpoint: 'https://api.gumlet.com/v1/video/live/workspace',
    requiredParams: ['name'],
    optionalParams: [],
    description: 'Creates a new live stream workspace (live_source_id) in Gumlet.',
  },
  {
    name: 'live_workspace_update',
    category: 'Live Streaming',
    method: 'POST',
    endpoint: 'https://api.gumlet.com/v1/video/live/workspace/{live_workspace_id}',
    requiredParams: ['live_workspace_id'],
    optionalParams: ['name', 'video_source_id'],
    description: 'Updates a live stream workspace name or linked VOD video_source_id.',
  },
  {
    name: 'live_workspace_delete',
    category: 'Live Streaming',
    method: 'DELETE',
    endpoint: 'https://api.gumlet.com/v1/video/live/workspace/{live_workspace_id}',
    requiredParams: ['live_workspace_id'],
    optionalParams: [],
    description: 'Deletes a live stream workspace from Gumlet.',
  },
  {
    name: 'live_usage_analytics',
    category: 'Live Streaming',
    method: 'POST',
    endpoint: 'https://api.gumlet.com/v1/video/live/analytics',
    requiredParams: [],
    optionalParams: ['date_range', 'group_by', 'metrics'],
    description: 'Retrieves live streaming bandwidth, duration, and viewer usage analytics across date ranges.',
  },
  {
    name: 'create_asset',
    category: 'Video Assets',
    method: 'POST',
    endpoint: 'https://api.gumlet.com/v1/video/assets',
    requiredParams: ['workspace_id', 'input', 'format'],
    optionalParams: ['title', 'description', 'playlist_id', 'tag', 'generate_subtitles', 'metadata'],
    description: 'Ingests a VOD video asset from a remote URL with ABR transcoding and auto-subtitles.',
  },
  {
    name: 'create_asset_direct_upload',
    category: 'Video Assets',
    method: 'POST',
    endpoint: 'https://api.gumlet.com/v1/video/assets/upload',
    requiredParams: ['collection_id', 'format'],
    optionalParams: ['title', 'description', 'resolution', 'tag', 'generate_subtitles', 'metadata'],
    description: 'Creates a direct-upload video asset and returns a presigned PUT upload_url.',
  },
  {
    name: 'get_all_playlists',
    category: 'Playlists & Chapters',
    method: 'GET',
    endpoint: 'https://api.gumlet.com/v1/video/playlist',
    requiredParams: ['collection_id'],
    optionalParams: [],
    description: 'Lists all course playlists in a Gumlet video workspace.',
  },
  {
    name: 'create_update_chapter',
    category: 'Playlists & Chapters',
    method: 'POST',
    endpoint: 'https://api.gumlet.com/v1/video/assets/{asset_id}/chapters',
    requiredParams: ['asset_id', 'chapters'],
    optionalParams: [],
    description: 'Creates or updates interactive timestamp chapters on a Gumlet video asset.',
  },
  {
    name: 'list_webhooks',
    category: 'Webhooks',
    method: 'GET',
    endpoint: 'https://api.gumlet.com/v1/org/webhooks',
    requiredParams: [],
    optionalParams: [],
    description: 'Lists configured Gumlet webhooks for video.status, live.video.status, and product events.',
  },
  {
    name: 'create_webhook',
    category: 'Webhooks',
    method: 'POST',
    endpoint: 'https://api.gumlet.com/v1/org/webhooks',
    requiredParams: ['url', 'triggers', 'sources'],
    optionalParams: ['secret_token'],
    description: 'Registers a webhook endpoint for Gumlet live and VOD lifecycle notifications.',
  },
  {
    name: 'viewer_analytics_data',
    category: 'Analytics',
    method: 'POST',
    endpoint: 'https://api.gumlet.com/v1/video/analytics',
    requiredParams: ['workspace_id'],
    optionalParams: ['date_range', 'metrics', 'filters'],
    description: 'Queries viewer engagement, completion rate, and playback telemetry for a workspace.',
  },
  {
    name: 'list_workspaces',
    category: 'Workspaces & Profiles',
    method: 'GET',
    endpoint: 'https://api.gumlet.com/v1/video/workspaces',
    requiredParams: [],
    optionalParams: [],
    description: 'Lists all video workspaces (collections) in the authenticated Gumlet organization.',
  },
];

export const SuperadminLiveController: React.FC<SuperadminLiveControllerProps> = ({
  accessToken,
  userEmail = 'mail@chaddewet.com',
  userRole = 'superadmin',
  sessions = [],
  onBindSessionStream,
  onCreateCoachingSessionWithStream,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'controller' | 'assets' | 'mcp'>('controller');
  const [liveSourceId, setLiveSourceId] = useState(DEFAULT_LIVE_SOURCE_ID);
  const [selectedAssetId, setSelectedAssetId] = useState(DEFAULT_LIVE_ASSET_ID);
  const [liveAssets, setLiveAssets] = useState<GumletLiveAssetItem[]>([
    {
      live_asset_id: DEFAULT_LIVE_ASSET_ID,
      live_source_id: DEFAULT_LIVE_SOURCE_ID,
      status: 'standby',
      title: 'GYCS Live Coaching Broadcast Room',
      embed_url: `https://play.gumlet.io/embed/live/${DEFAULT_LIVE_ASSET_ID}`,
      output: {
        playback_url: `https://stream.gumlet.io/${DEFAULT_LIVE_SOURCE_ID}/${DEFAULT_LIVE_ASSET_ID}/main.m3u8`,
      },
    },
  ]);
  const [activeAssetDetail, setActiveAssetDetail] = useState<GumletLiveAssetItem | null>(null);
  const [assetHistory, setAssetHistory] = useState<Array<{ status?: string; created_at?: string | number }>>([]);
  const [liveProbe, setLiveProbe] = useState<{
    isLive: boolean;
    status: string;
    playbackUrl: string;
    embedUrl: string;
    checkedAt: string;
  }>({
    isLive: false,
    status: 'checking',
    playbackUrl: `https://stream.gumlet.io/${DEFAULT_LIVE_SOURCE_ID}/${DEFAULT_LIVE_ASSET_ID}/main.m3u8`,
    embedUrl: `https://play.gumlet.io/embed/live/${DEFAULT_LIVE_ASSET_ID}`,
    checkedAt: '—',
  });

  // New stream form state
  const [newStreamTitle, setNewStreamTitle] = useState('GYCS Superyacht Career Live Coaching');
  const [newStreamOrientation, setNewStreamOrientation] = useState<'landscape' | 'portrait'>('landscape');
  const [newStreamResolutions, setNewStreamResolutions] = useState<string[]>(['360p', '480p', '720p', '1080p']);
  const [newStreamMp4, setNewStreamMp4] = useState(true);
  const [renameTitle, setRenameTitle] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Session binding state
  const [targetSessionId, setTargetSessionId] = useState<string>(sessions[0]?.id || '');
  const [newSessionScheduledAt, setNewSessionScheduledAt] = useState<string>(() => {
    const d = new Date(Date.now() + 86_400_000);
    return d.toISOString().slice(0, 16);
  });

  // UI feedback states
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [banner, setBanner] = useState<{ tone: 'ok' | 'err' | 'info'; text: string } | null>(null);
  const [showStreamKey, setShowStreamKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [mcpFilter, setMcpFilter] = useState('');
  const [mcpCategory, setMcpCategory] = useState<string>('all');

  const copyText = (key: string, value: string) => {
    void navigator.clipboard.writeText(value);
    setCopiedKey(key);
    window.setTimeout(() => setCopiedKey(prev => (prev === key ? null : prev)), 2000);
  };

  const probeStatus = useCallback(async (assetId: string) => {
    try {
      const res = await fetch(`/api/live-status?live_asset_id=${encodeURIComponent(assetId)}`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        setLiveProbe({
          isLive: Boolean(data.isLive),
          status: String(data.status || (data.isLive ? 'active' : 'standby')),
          playbackUrl:
            data.playbackUrl || `https://stream.gumlet.io/${DEFAULT_LIVE_SOURCE_ID}/${assetId}/main.m3u8`,
          embedUrl: data.embedUrl || `https://play.gumlet.io/embed/live/${assetId}`,
          checkedAt: new Date().toLocaleTimeString(),
        });
        if (data.title) {
          setRenameTitle(prev => prev || data.title);
        }
      }
    } catch {
      setLiveProbe(prev => ({ ...prev, checkedAt: new Date().toLocaleTimeString() }));
    }
  }, []);

  const loadGumletOverview = useCallback(async () => {
    if (!accessToken) return;
    setBusyAction('refresh');
    try {
      const [overviewRes, detailRes] = await Promise.all([
        fetch(`/api/gumlet-courses?live_source_id=${encodeURIComponent(liveSourceId)}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
        fetch(`/api/gumlet-courses?live_asset_id=${encodeURIComponent(selectedAssetId)}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      ]);

      if (overviewRes.ok) {
        const data = await overviewRes.json();
        if (Array.isArray(data.liveAssets) && data.liveAssets.length > 0) {
          setLiveAssets(data.liveAssets);
        }
      }

      if (detailRes.ok) {
        const detailData = await detailRes.json();
        if (detailData.liveAsset) {
          setActiveAssetDetail(detailData.liveAsset);
          const resolvedTitle =
            detailData.liveAsset.title || detailData.liveAsset.input?.title || 'GYCS Live Coaching Broadcast';
          setRenameTitle(resolvedTitle);
        }
        if (Array.isArray(detailData.history)) {
          setAssetHistory(detailData.history);
        }
      }
    } catch {
      // Keep fallback local state if GUMLET_API_KEY is not yet set in environment
    } finally {
      setBusyAction(null);
    }
  }, [accessToken, liveSourceId, selectedAssetId]);

  useEffect(() => {
    void probeStatus(selectedAssetId);
    void loadGumletOverview();
    const timer = window.setInterval(() => {
      if (document.visibilityState !== 'hidden') {
        void probeStatus(selectedAssetId);
      }
    }, 15000);
    return () => window.clearInterval(timer);
  }, [selectedAssetId, probeStatus, loadGumletOverview]);

  const callGumletAction = async (action: string, payload: Record<string, unknown>, successMsg: string) => {
    if (!accessToken) {
      setBanner({
        tone: 'err',
        text: 'Sign in with your Superadmin account to execute authenticated Gumlet API actions.',
      });
      return null;
    }
    setBusyAction(action);
    setBanner(null);
    try {
      const res = await fetch('/api/gumlet-courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ action, ...payload }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || `Gumlet request failed with HTTP ${res.status}`);
      }
      setBanner({ tone: 'ok', text: successMsg });
      return data;
    } catch (err) {
      setBanner({
        tone: 'err',
        text: err instanceof Error ? err.message : 'Gumlet API call failed.',
      });
      return null;
    } finally {
      setBusyAction(null);
    }
  };

  const handleCreateLiveStream = async (e: React.FormEvent) => {
    e.preventDefault();
    const created = await callGumletAction(
      'create_live_asset',
      {
        liveSourceId,
        title: newStreamTitle.trim() || 'GYCS Live Broadcast',
        orientation: newStreamOrientation,
        resolution: newStreamResolutions,
        mp4Access: newStreamMp4,
      },
      `Created Gumlet live stream asset "${newStreamTitle.trim()}".`
    );
    if (created?.live_asset_id) {
      const newItem: GumletLiveAssetItem = {
        ...created,
        title: newStreamTitle.trim(),
      };
      setLiveAssets(prev => [newItem, ...prev.filter(x => x.live_asset_id !== created.live_asset_id)]);
      setSelectedAssetId(created.live_asset_id);
      setActiveAssetDetail(newItem);
      void probeStatus(created.live_asset_id);
    }
  };

  const handleStartStream = async (assetId = selectedAssetId) => {
    const res = await callGumletAction(
      'start_live_stream',
      { liveAssetId: assetId },
      `Started Gumlet live stream asset ${assetId}. Encoder ingest is now active.`
    );
    if (res) {
      setActiveAssetDetail(prev => ({ ...(prev || {}), ...res, live_asset_id: assetId }));
      void probeStatus(assetId);
      void loadGumletOverview();
    }
  };

  const handleCompleteStream = async (assetId = selectedAssetId) => {
    const res = await callGumletAction(
      'complete_live_stream',
      { liveAssetId: assetId },
      `Completed Gumlet live stream asset ${assetId}. RTMP ingest closed and VOD recording finalized.`
    );
    if (res) {
      setActiveAssetDetail(prev => ({ ...(prev || {}), ...res, live_asset_id: assetId }));
      void probeStatus(assetId);
      void loadGumletOverview();
    }
  };

  const handleUpdateTitle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renameTitle.trim()) return;
    const res = await callGumletAction(
      'update_live_asset',
      { liveAssetId: selectedAssetId, title: renameTitle.trim() },
      `Updated stream title to "${renameTitle.trim()}".`
    );
    if (res) {
      setActiveAssetDetail(prev => (prev ? { ...prev, title: renameTitle.trim() } : prev));
      void loadGumletOverview();
    }
  };

  const handleDeleteStream = async (assetId: string) => {
    const res = await callGumletAction(
      'delete_live_asset',
      { liveAssetId: assetId },
      `Deleted Gumlet live asset ${assetId}.`
    );
    if (res?.deleted) {
      setLiveAssets(prev => prev.filter(item => item.live_asset_id !== assetId));
      if (selectedAssetId === assetId) {
        setSelectedAssetId(DEFAULT_LIVE_ASSET_ID);
      }
    }
  };

  const handleFilterAssets = async (status: string) => {
    setStatusFilter(status);
    if (!accessToken) return;
    const res = await callGumletAction(
      'filter_live_assets',
      {
        liveSourceId,
        ...(status !== 'all' ? { status } : {}),
      },
      `Loaded live assets (${status}).`
    );
    if (res?.liveAssets) {
      setLiveAssets(res.liveAssets);
    }
  };

  const toggleResolution = (res: string) => {
    setNewStreamResolutions(prev =>
      prev.includes(res) ? (prev.length > 1 ? prev.filter(r => r !== res) : prev) : [...prev, res]
    );
  };

  const currentAsset: GumletLiveAssetItem = activeAssetDetail && activeAssetDetail.live_asset_id === selectedAssetId
    ? activeAssetDetail
    : liveAssets.find(a => a.live_asset_id === selectedAssetId) || {
        live_asset_id: selectedAssetId,
        live_source_id: liveSourceId,
        status: liveProbe.status,
        title: 'GYCS Live Coaching Broadcast Room',
        embed_url: `https://play.gumlet.io/embed/live/${selectedAssetId}`,
        output: {
          playback_url: liveProbe.playbackUrl,
        },
      };

  const rtmpUrl = currentAsset.stream_url || 'rtmps://live.gumlet.com:443/app';
  const streamKey = currentAsset.stream_key || `gumlet_${selectedAssetId}_stream_key`;
  const embedUrl = currentAsset.embed_url || `https://play.gumlet.io/embed/live/${selectedAssetId}`;
  const playbackUrl =
    currentAsset.output?.playback_url ||
    liveProbe.playbackUrl ||
    `https://stream.gumlet.io/${liveSourceId}/${selectedAssetId}/main.m3u8`;

  const mcpClaudeConfig = JSON.stringify(
    {
      mcpServers: {
        gumlet: {
          type: 'http',
          url: 'https://mcp.gumlet.com/mcp/v1',
          headers: {
            Authorization: 'Bearer <YOUR_GUMLET_API_KEY>',
          },
        },
      },
    },
    null,
    2
  );

  const filteredMcpTools = GUMLET_MCP_LIVE_TOOLS.filter(tool => {
    const matchesCategory = mcpCategory === 'all' || tool.category === mcpCategory;
    const q = mcpFilter.trim().toLowerCase();
    const matchesQuery =
      !q ||
      tool.name.toLowerCase().includes(q) ||
      tool.description.toLowerCase().includes(q) ||
      tool.endpoint.toLowerCase().includes(q);
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="rounded-2xl border border-emerald-500/30 bg-slate-950/95 p-5 shadow-2xl space-y-6">
      {/* Top Controller Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-emerald-400">
            <Radio className="w-4 h-4 animate-pulse" />
            <span>SUPERADMIN GUMLET LIVE STREAM CONTROLLER</span>
            <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[11px] font-mono text-emerald-300">
              {userRole.toUpperCase()} · {userEmail}
            </span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">
            Broadcast Control Room & Gumlet MCP Integration
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Provision RTMP streams, start/complete broadcasts, monitor the live HLS player, bind streams to coaching
            cohorts, and connect AI agents via Gumlet’s official MCP server.
          </p>
        </div>

        {/* Sub-navigation tabs */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveSubTab('controller')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              activeSubTab === 'controller'
                ? 'bg-emerald-500 text-slate-950'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            Live Controller
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('assets')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              activeSubTab === 'assets'
                ? 'bg-emerald-500 text-slate-950'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            Live Assets ({liveAssets.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('mcp')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              activeSubTab === 'mcp'
                ? 'bg-emerald-500 text-slate-950'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            Gumlet MCP Server (94 Tools)
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {banner && (
        <div
          className={`rounded-xl border px-4 py-3 text-xs font-medium flex items-center justify-between gap-3 ${
            banner.tone === 'ok'
              ? 'border-emerald-500/40 bg-emerald-950/50 text-emerald-200'
              : banner.tone === 'err'
                ? 'border-rose-500/40 bg-rose-950/50 text-rose-200'
                : 'border-sky-500/40 bg-sky-950/50 text-sky-200'
          }`}
        >
          <span>{banner.text}</span>
          <button
            type="button"
            onClick={() => setBanner(null)}
            className="text-[11px] underline opacity-80 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Status Bar */}
      <div className="grid gap-3 sm:grid-cols-4 bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 text-xs">
        <div className="flex items-center gap-2.5">
          <span
            className={`h-3 w-3 rounded-full ${
              liveProbe.isLive ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'
            }`}
          />
          <div>
            <p className="text-slate-400 text-[11px]">Broadcast State</p>
            <p className="font-bold text-white uppercase">
              {liveProbe.isLive ? 'LIVE ON AIR' : `STANDBY (${liveProbe.status})`}
            </p>
          </div>
        </div>
        <div>
          <p className="text-slate-400 text-[11px]">Active Live Asset ID</p>
          <p className="font-mono text-emerald-300 truncate">{selectedAssetId}</p>
        </div>
        <div>
          <p className="text-slate-400 text-[11px]">Gumlet Live Source ID</p>
          <p className="font-mono text-slate-200 truncate">{liveSourceId}</p>
        </div>
        <div className="flex items-center justify-between sm:justify-end gap-2">
          <span className="text-[11px] text-slate-400">Checked: {liveProbe.checkedAt}</span>
          <button
            type="button"
            onClick={() => {
              void probeStatus(selectedAssetId);
              void loadGumletOverview();
            }}
            disabled={busyAction === 'refresh'}
            className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-slate-700 flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${busyAction === 'refresh' ? 'animate-spin' : ''}`} />
            Sync
          </button>
        </div>
      </div>

      {/* TAB 1: LIVE CONTROLLER */}
      {activeSubTab === 'controller' && (
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Left Column: Monitor + Lifecycle Controls + RTMP Credentials */}
          <div className="lg:col-span-7 space-y-5">
            {/* Live Player Preview */}
            <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800 bg-slate-950/60">
                <div className="flex items-center gap-2 text-xs font-semibold text-white">
                  <Tv className="w-4 h-4 text-emerald-400" />
                  <span>Live Program Monitor ({currentAsset.title || currentAsset.input?.title || selectedAssetId})</span>
                </div>
                <a
                  href={embedUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1"
                >
                  Open Embed <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div style={{ position: 'relative', aspectRatio: '16/9' }} className="bg-black">
                <iframe
                  key={selectedAssetId}
                  loading="lazy"
                  title="Gumlet Superadmin Monitor"
                  src={embedUrl}
                  style={{
                    border: 'none',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    height: '100%',
                    width: '100%',
                  }}
                  referrerPolicy="origin"
                  allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen; clipboard-write;"
                />
              </div>
              {/* Primary Action Deck */}
              <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => void handleStartStream(selectedAssetId)}
                    disabled={busyAction !== null}
                    className="rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400 disabled:opacity-50 flex items-center gap-1.5 shadow-lg shadow-emerald-500/10"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    {busyAction === 'start_live_stream' ? 'Starting Stream…' : 'Start Live Stream'}
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleCompleteStream(selectedAssetId)}
                    disabled={busyAction !== null}
                    className="rounded-xl bg-amber-500/20 border border-amber-500/40 px-4 py-2 text-xs font-bold text-amber-200 hover:bg-amber-500/30 disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />
                    {busyAction === 'complete_live_stream' ? 'Completing…' : 'Complete / Stop Stream'}
                  </button>
                </div>

                {selectedAssetId !== DEFAULT_LIVE_ASSET_ID && (
                  <button
                    type="button"
                    onClick={() => void handleDeleteStream(selectedAssetId)}
                    disabled={busyAction !== null}
                    className="rounded-xl bg-rose-500/15 border border-rose-500/30 px-3 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-500/25 flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete Asset
                  </button>
                )}
              </div>
            </div>

            {/* RTMP Encoder Ingest & Playback Credentials */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  OBS / Hardware Encoder RTMP Ingest & Playback Endpoints
                </h3>
                <span className="text-[11px] font-mono text-slate-400">ABR 1080p / 720p / 480p / 360p</span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span>RTMP Server / Ingest URL</span>
                    <button
                      type="button"
                      onClick={() => copyText('rtmp', rtmpUrl)}
                      className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                    >
                      {copiedKey === 'rtmp' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copiedKey === 'rtmp' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <p className="font-mono text-xs text-white truncate">{rtmpUrl}</p>
                </div>

                <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span>RTMP Stream Key</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowStreamKey(v => !v)}
                        className="text-slate-400 hover:text-white flex items-center gap-1"
                      >
                        {showStreamKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        {showStreamKey ? 'Hide' : 'Reveal'}
                      </button>
                      <button
                        type="button"
                        onClick={() => copyText('key', streamKey)}
                        className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                      >
                        {copiedKey === 'key' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        {copiedKey === 'key' ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>
                  <p className="font-mono text-xs text-white truncate">
                    {showStreamKey ? streamKey : '••••••••••••••••••••••••••••••••'}
                  </p>
                </div>

                <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span>Player Embed URL</span>
                    <button
                      type="button"
                      onClick={() => copyText('embed', embedUrl)}
                      className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                    >
                      {copiedKey === 'embed' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copiedKey === 'embed' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <p className="font-mono text-xs text-emerald-300 truncate">{embedUrl}</p>
                </div>

                <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span>HLS Manifest (.m3u8)</span>
                    <button
                      type="button"
                      onClick={() => copyText('hls', playbackUrl)}
                      className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                    >
                      {copiedKey === 'hls' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copiedKey === 'hls' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <p className="font-mono text-xs text-slate-200 truncate">{playbackUrl}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Provision New Stream + Rename + Bind to Coaching Session + History */}
          <div className="lg:col-span-5 space-y-5">
            {/* Create / Provision New Live Stream Asset */}
            <form
              onSubmit={e => void handleCreateLiveStream(e)}
              className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 space-y-3.5"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-emerald-400" />
                  Provision New Gumlet Live Stream
                </h3>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 rounded">
                  POST /v1/video/live/assets
                </span>
              </div>

              <label className="block text-xs text-slate-300">
                Broadcast Title
                <input
                  type="text"
                  value={newStreamTitle}
                  onChange={e => setNewStreamTitle(e.target.value)}
                  placeholder="e.g., Week 4 Superyacht Deck & Bridge Operations Q&A"
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
                  required
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block text-xs text-slate-300">
                  Live Source ID
                  <input
                    type="text"
                    value={liveSourceId}
                    onChange={e => setLiveSourceId(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-xs text-white"
                  />
                </label>

                <label className="block text-xs text-slate-300">
                  Orientation
                  <select
                    value={newStreamOrientation}
                    onChange={e => setNewStreamOrientation(e.target.value as 'landscape' | 'portrait')}
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
                  >
                    <option value="landscape">Landscape (16:9)</option>
                    <option value="portrait">Portrait (9:16)</option>
                  </select>
                </label>
              </div>

              <div>
                <p className="text-xs text-slate-300 mb-1.5">ABR Transcoding Ladder</p>
                <div className="flex flex-wrap gap-2">
                  {(['360p', '480p', '720p', '1080p'] as const).map(res => {
                    const active = newStreamResolutions.includes(res);
                    return (
                      <button
                        key={res}
                        type="button"
                        onClick={() => toggleResolution(res)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono border transition ${
                          active
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        {res}
                      </button>
                    );
                  })}
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newStreamMp4}
                  onChange={e => setNewStreamMp4(e.target.checked)}
                  className="rounded border-slate-700"
                />
                Enable MP4 Recording & Automatic VOD Replay (`mp4_access: true`)
              </label>

              <button
                type="submit"
                disabled={busyAction !== null}
                className="w-full rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                {busyAction === 'create_live_asset' ? 'Provisioning on Gumlet…' : 'Create Live Stream Asset'}
              </button>
            </form>

            {/* Update Active Stream Title */}
            <form
              onSubmit={e => void handleUpdateTitle(e)}
              className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 space-y-3"
            >
              <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
                Update Active Stream Metadata ({selectedAssetId.slice(0, 10)}…)
              </h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={renameTitle}
                  onChange={e => setRenameTitle(e.target.value)}
                  placeholder="Stream title"
                  className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
                />
                <button
                  type="submit"
                  disabled={busyAction !== null || !renameTitle.trim()}
                  className="rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-700 disabled:opacity-50"
                >
                  Save Title
                </button>
              </div>
            </form>

            {/* Bind Active Stream to GYCS Coaching Session */}
            {(onBindSessionStream || onCreateCoachingSessionWithStream) && (
              <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                  <Link2 className="w-3.5 h-3.5 text-emerald-400" />
                  Bind Stream to Crew Hub Coaching Session
                </h3>
                {sessions.length > 0 && onBindSessionStream && (
                  <div className="space-y-2">
                    <select
                      value={targetSessionId}
                      onChange={e => setTargetSessionId(e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
                    >
                      {sessions.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.title} ({new Date(s.scheduled_at).toLocaleDateString()})
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => {
                        if (!targetSessionId) return;
                        void onBindSessionStream(targetSessionId, selectedAssetId, embedUrl);
                        setBanner({
                          tone: 'ok',
                          text: `Bound Gumlet live asset ${selectedAssetId} to coaching session.`,
                        });
                      }}
                      className="w-full rounded-lg bg-emerald-500/20 border border-emerald-500/40 px-3 py-2 text-xs font-semibold text-emerald-200 hover:bg-emerald-500/30"
                    >
                      Attach Active Stream to Selected Session
                    </button>
                  </div>
                )}

                {onCreateCoachingSessionWithStream && (
                  <div className="pt-2 border-t border-slate-800 space-y-2">
                    <p className="text-[11px] text-slate-400">Or schedule a new Live Coaching Session with this stream:</p>
                    <input
                      type="datetime-local"
                      value={newSessionScheduledAt}
                      onChange={e => setNewSessionScheduledAt(e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        void onCreateCoachingSessionWithStream({
                          title: renameTitle.trim() || newStreamTitle.trim() || 'GYCS Live Coaching Broadcast',
                          scheduledAt: new Date(newSessionScheduledAt).toISOString(),
                          liveAssetId: selectedAssetId,
                          embedUrl,
                        });
                      }}
                      className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-700"
                    >
                      Create Scheduled Session with Active Stream
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Asset Status History */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-emerald-400" />
                Stream Lifecycle History
              </h3>
              {assetHistory.length === 0 ? (
                <p className="text-xs text-slate-400">
                  Status transitions (`created` → `preparing` → `ready` → `connected` → `active` → `complete`) appear
                  here and via `/api/gumlet-webhook`.
                </p>
              ) : (
                <ul className="space-y-1.5 max-h-36 overflow-y-auto text-xs">
                  {assetHistory.map((h, idx) => (
                    <li
                      key={idx}
                      className="flex items-center justify-between rounded bg-slate-950 px-2.5 py-1.5 border border-slate-800"
                    >
                      <span className="font-mono text-emerald-300">{h.status || 'event'}</span>
                      <span className="text-slate-400 text-[11px]">
                        {h.created_at ? new Date(h.created_at).toLocaleString() : '—'}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ALL LIVE ASSETS */}
      {activeSubTab === 'assets' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              {(['all', 'active', 'ready', 'created', 'complete', 'disconnected'] as const).map(st => (
                <button
                  key={st}
                  type="button"
                  onClick={() => void handleFilterAssets(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase transition ${
                    statusFilter === st
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => void loadGumletOverview()}
              className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh Asset List
            </button>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {liveAssets.map(asset => {
              const id = asset.live_asset_id;
              const isSelected = id === selectedAssetId;
              const title = asset.title || asset.input?.title || `Live Stream ${id.slice(0, 8)}`;
              return (
                <div
                  key={id}
                  className={`rounded-xl border p-4 space-y-3 transition ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-950/20'
                      : 'border-slate-800 bg-slate-900/70 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-sm text-white">{title}</p>
                      <p className="font-mono text-xs text-slate-400 mt-0.5">ID: {id}</p>
                    </div>
                    <span className="rounded-full bg-slate-800 border border-slate-700 px-2.5 py-0.5 text-[11px] font-mono uppercase text-emerald-300">
                      {asset.status || 'ready'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedAssetId(id);
                        setActiveAssetDetail(asset);
                        setActiveSubTab('controller');
                      }}
                      className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-emerald-400"
                    >
                      {isSelected ? 'Active in Controller' : 'Load in Controller'}
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleStartStream(id)}
                      className="rounded-lg bg-slate-800 border border-slate-700 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-slate-700"
                    >
                      Start
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleCompleteStream(id)}
                      className="rounded-lg bg-slate-800 border border-slate-700 px-2.5 py-1.5 text-xs font-semibold text-amber-300 hover:bg-slate-700"
                    >
                      Complete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: OFFICIAL GUMLET MCP SERVER & TOOLS */}
      {activeSubTab === 'mcp' && (
        <div className="space-y-5">
          <div className="rounded-xl border border-emerald-500/30 bg-slate-900/90 p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[11px] font-mono uppercase text-emerald-400">
                  Official Remote Streamable HTTP MCP Server · v3.4.7
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  Gumlet MCP Server (`https://mcp.gumlet.com/mcp/v1`)
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Gumlet provides a hosted Model Context Protocol server exposing 94 tools (including 14 Live Streaming
                  tools) over Streamable HTTP. Authenticate with your `GUMLET_API_KEY` Bearer token.
                </p>
              </div>
              <a
                href="https://docs.gumlet.com/resources/mcp"
                target="_blank"
                rel="noreferrer"
                className="shrink-0 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20 flex items-center gap-1.5"
              >
                Gumlet MCP Docs <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="grid gap-3 lg:grid-cols-2">
              <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                  <span className="font-semibold text-slate-200">
                    Claude Desktop / Cursor / VS Code (`mcp.json`)
                  </span>
                  <button
                    type="button"
                    onClick={() => copyText('mcp-json', mcpClaudeConfig)}
                    className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                  >
                    {copiedKey === 'mcp-json' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedKey === 'mcp-json' ? 'Copied' : 'Copy JSON'}
                  </button>
                </div>
                <pre className="text-[11px] font-mono text-emerald-300 overflow-x-auto">{mcpClaudeConfig}</pre>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-950 p-3 space-y-2 text-xs">
                <p className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  Pre-Configured GYCS Gumlet Identifiers
                </p>
                <div className="space-y-1.5 font-mono text-[11px]">
                  <div className="flex items-center justify-between bg-slate-900 px-2.5 py-1.5 rounded">
                    <span className="text-slate-400">MCP Endpoint:</span>
                    <span className="text-white">https://mcp.gumlet.com/mcp/v1</span>
                  </div>
                  <div className="flex items-center justify-between bg-slate-900 px-2.5 py-1.5 rounded">
                    <span className="text-slate-400">Live Source ID (`live_source_id`):</span>
                    <span className="text-emerald-300">{DEFAULT_LIVE_SOURCE_ID}</span>
                  </div>
                  <div className="flex items-center justify-between bg-slate-900 px-2.5 py-1.5 rounded">
                    <span className="text-slate-400">Default Live Asset (`live_asset_id`):</span>
                    <span className="text-emerald-300">{DEFAULT_LIVE_ASSET_ID}</span>
                  </div>
                  <div className="flex items-center justify-between bg-slate-900 px-2.5 py-1.5 rounded">
                    <span className="text-slate-400">Video Collection (`workspace_id`):</span>
                    <span className="text-slate-200">649378a6fdae81aad3b96497</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Search & Category Filter for MCP Tools */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={mcpFilter}
                onChange={e => setMcpFilter(e.target.value)}
                placeholder="Search Gumlet MCP tools (e.g. create_live_asset, start_live, complete_live_stream)…"
                className="w-full rounded-xl border border-slate-800 bg-slate-900 pl-9 pr-3 py-2 text-xs text-white"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(['all', 'Live Streaming', 'Video Assets', 'Playlists & Chapters', 'Webhooks', 'Analytics'] as const).map(
                cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setMcpCategory(cat)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                      mcpCategory === cat
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    {cat}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Tools Grid */}
          <div className="grid gap-3 md:grid-cols-2">
            {filteredMcpTools.map(tool => (
              <div
                key={tool.name}
                className="rounded-xl border border-slate-800 bg-slate-900/80 p-3.5 space-y-2 hover:border-slate-700 transition"
              >
                <div className="flex items-center justify-between gap-2">
                  <code className="text-xs font-bold text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
                    {tool.name}
                  </code>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {tool.category}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{tool.description}</p>
                <p className="text-[11px] font-mono text-slate-400 truncate">
                  <strong className="text-slate-200">{tool.method}</strong> {tool.endpoint}
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1 text-[11px]">
                  {tool.requiredParams.map(param => (
                    <span
                      key={param}
                      className="rounded bg-rose-500/15 border border-rose-500/30 px-1.5 py-0.5 font-mono text-rose-200"
                    >
                      {param}*
                    </span>
                  ))}
                  {tool.optionalParams.map(param => (
                    <span
                      key={param}
                      className="rounded bg-slate-800 border border-slate-700 px-1.5 py-0.5 font-mono text-slate-300"
                    >
                      {param}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
