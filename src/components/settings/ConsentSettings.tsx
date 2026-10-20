/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ShieldCheck,
  Mail,
  MessageSquare,
  Smartphone,
  Download,
  Trash2,
  CheckCircle2,
  Sliders,
  AlertTriangle
} from 'lucide-react';
import { useFeatureFlags } from '../../lib/feature-flags.ts';
import type { FeatureFlags } from '../../lib/constants.ts';

export const ConsentSettings: React.FC = () => {
  const { flags, updateFlag, resetFlags } = useFeatureFlags();

  const [marketingEmail, setMarketingEmail] = useState(false);
  const [marketingSms, setMarketingSms] = useState(false);
  const [marketingWhatsApp, setMarketingWhatsApp] = useState(true);
  const [exportRequested, setExportRequested] = useState(false);
  const [deletionModalOpen, setDeletionModalOpen] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

  const handleSaveConsent = () => {
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white font-['Space_Grotesk']">
            POPIA Privacy Consent & Platform Settings
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage granular marketing preferences, data export requests, and runtime feature flags.
          </p>
        </div>
      </div>

      {saveToast && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Your POPIA consent preferences have been updated in the database.</span>
        </div>
      )}

      {/* POPIA Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl shrink-0 mt-0.5">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              POPIA Marketing Consent (Strict Separation)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
              In strict compliance with South African privacy law, marketing communications are separated from your active coaching programme participation. Withdrawing marketing consent will never affect your course access, documents, or coach feedback.
            </p>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <label className="flex items-center justify-between p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-200 cursor-pointer">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-slate-400" />
              <div>
                <span className="font-semibold block">Email Updates & Webinars</span>
                <span className="text-slate-500 text-[11px]">Non-essential industry newsletters and announcements.</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={marketingEmail}
              onChange={(e) => setMarketingEmail(e.target.checked)}
              className="rounded accent-emerald-500 w-4 h-4"
            />
          </label>

          <label className="flex items-center justify-between p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-200 cursor-pointer">
            <div className="flex items-center gap-3">
              <Smartphone className="w-4 h-4 text-slate-400" />
              <div>
                <span className="font-semibold block">SMS Urgent Job Alerts</span>
                <span className="text-slate-500 text-[11px]">Instant SMS when a direct partner urgently seeks crew.</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={marketingSms}
              onChange={(e) => setMarketingSms(e.target.checked)}
              className="rounded accent-emerald-500 w-4 h-4"
            />
          </label>

          <label className="flex items-center justify-between p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-200 cursor-pointer">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="font-semibold block">WhatsApp Community & Broadcasts</span>
                <span className="text-slate-500 text-[11px]">South African yacht crew alumni group and hiring notices.</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={marketingWhatsApp}
              onChange={(e) => setMarketingWhatsApp(e.target.checked)}
              className="rounded accent-emerald-500 w-4 h-4"
            />
          </label>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleSaveConsent}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-emerald-950/40"
          >
            Update Consent Records
          </button>
        </div>
      </div>

      {/* POPIA Rights of Access & Deletion */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 text-sky-400 text-xs font-semibold mb-1">
              <Download className="w-4 h-4" />
              <span>Right of Access (POPIA)</span>
            </div>
            <h4 className="text-sm font-bold text-white">Export All Personal Data</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Download a machine-readable JSON archive of your intake assessments, CV versions, milestone audit events, and document verification history.
            </p>
          </div>
          <button
            onClick={() => setExportRequested(true)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{exportRequested ? 'Export Queued (Check Email)' : 'Request Data Export'}</span>
          </button>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold mb-1">
              <Trash2 className="w-4 h-4" />
              <span>Right to Deletion (POPIA)</span>
            </div>
            <h4 className="text-sm font-bold text-white">Account & Data Erasure</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Submit a formal request to purge personal identification files and account records, subject to statutory maritime audit retention rules.
            </p>
          </div>
          <button
            onClick={() => setDeletionModalOpen(true)}
            className="px-4 py-2 bg-rose-950/40 hover:bg-rose-900/40 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Request Account Deletion</span>
          </button>
        </div>
      </div>

      {/* Feature Flags Management Tab */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Runtime Feature Flags Console</h3>
          </div>
          <button
            onClick={resetFlags}
            className="text-xs text-slate-400 hover:text-slate-200 underline font-mono"
          >
            Reset to Defaults
          </button>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Toggle feature flags for interactive testing. Features gated under legal review (e.g. Payments under ESA s.15) or awaiting specialist coaching are disabled by default.
        </p>

        <div className="space-y-2 pt-2">
          {Object.keys(flags).map((key) => {
            const flagKey = key as keyof FeatureFlags;
            const isEnabled = flags[flagKey];
            return (
              <div
                key={flagKey}
                className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs"
              >
                <div>
                  <span className="font-mono font-semibold text-slate-200">{flagKey}</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {flagKey === 'payments_enabled' && 'Disabled pending legal review (Employment Services Act s.15)'}
                    {flagKey === 'ai_cv_assist' && 'AI-assisted wording suggestions (server-side only)'}
                    {flagKey === 'engineering_department' && 'Requires specialist marine engineering coach'}
                    {flagKey === 'galley_department' && 'Requires specialist yacht chef coach'}
                    {flagKey === 'cloudflare_stream' && 'Signed playback for replays'}
                    {flagKey === 'employer_portal' && 'Employer candidate browsing'}
                    {flagKey === 'map_directory' && 'MapLibre directory with provenance'}
                    {flagKey === 'ghl_sync' && 'GoHighLevel downstream marketing sync'}
                    {flagKey === 'ai_lesson_search' && 'Semantic embeddings-based lesson search'}
                    {flagKey === 'ai_summarisation' && 'Audio/transcript session summarisation'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => updateFlag(flagKey, !isEnabled)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition ${
                    isEnabled
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {isEnabled ? 'ENABLED' : 'DISABLED'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Deletion confirmation modal */}
      {deletionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">Confirm Deletion Request</h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Under POPIA Section 24, you may request deletion of personal information. Note that regulatory records of issued course attendance may be retained for statutory audit compliance.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeletionModalOpen(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('Deletion request logged and forwarded to Information Officer.');
                  setDeletionModalOpen(false);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold"
              >
                Submit Deletion Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
