/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Calendar,
  Video,
  Clock,
  MessageSquare,
  ShieldAlert,
  Send,
  CheckCircle2,
  ExternalLink,
  Users
} from 'lucide-react';
import type { LiveSession } from '../../types/database.ts';
import { GumletLiveEmbed, useGumletLiveStatus } from './GumletLiveStream.tsx';

interface LiveRoomProps {
  sessions: LiveSession[];
  onAddQuestion: (sessionId: string, question: string) => void;
}

export const LiveRoom: React.FC<LiveRoomProps> = ({ sessions, onAddQuestion }) => {
  const [selectedSessionId, setSelectedSessionId] = useState<string>(sessions[0]?.id || 'live-1');
  const [recordingConsent, setRecordingConsent] = useState<boolean>(true);
  const [newQuestion, setNewQuestion] = useState<string>('');
  const { isLive } = useGumletLiveStatus();

  const currentSession = sessions.find((s) => s.id === selectedSessionId) || sessions[0];

  const handleQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim() || !currentSession) return;
    onAddQuestion(currentSession.id, newQuestion);
    setNewQuestion('');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-sky-400 mb-1">
            <Video className="w-4 h-4" />
            <span>Live Interactive Coaching Room</span>
          </div>
          <h2 className="text-xl font-bold text-white font-['Space_Grotesk']">
            Weekly Live Coaching & Strategy Rooms
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Live interactive strategy sessions led by Chad de Wet. Questions answered in real-time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${isLive ? 'bg-emerald-400 animate-pulse' : 'bg-emerald-500/60'}`} />
          <span className={`text-xs font-semibold ${isLive ? 'text-emerald-300' : 'text-slate-300'}`}>
            {isLive ? 'Live Stream Active' : 'Gumlet Stream Player Ready'}
          </span>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <GumletLiveEmbed />
      </div>

      {currentSession ? (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Session Schedule & Join Link (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-400 text-xs font-semibold">
                {currentSession.cohortName}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                <Clock className="w-3.5 h-3.5" />
                {currentSession.durationMins} Minutes
              </span>
            </div>

            <h3 className="text-lg font-bold text-white font-['Space_Grotesk']">
              {currentSession.title}
            </h3>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3 text-xs text-slate-300">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Scheduled Time:</span>
                <strong className="text-slate-100 font-mono">
                  {new Date(currentSession.scheduledAt).toUTCString()}
                </strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Lead Coach:</span>
                <strong className="text-emerald-400">{currentSession.coachName}</strong>
              </div>
            </div>

            {/* Recording Consent Check (Legal L5) */}
            <div className="p-4 bg-slate-950/60 rounded-xl border border-amber-500/30 text-xs space-y-2">
              <div className="flex items-start gap-2 text-amber-300 font-semibold">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span>POPIA / SA Law Recording Consent</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Coaching sessions are recorded for enrolled cohort replay access only. By joining, you consent to being recorded under GYCS privacy guidelines.
              </p>
              <label className="flex items-center gap-2 cursor-pointer pt-1 text-slate-200">
                <input
                  type="checkbox"
                  checked={recordingConsent}
                  onChange={(e) => setRecordingConsent(e.target.checked)}
                  className="rounded accent-emerald-500"
                />
                <span className="text-[11px]">I give recording consent for cohort educational replay.</span>
              </label>
            </div>

            {/* Launch Button */}
            <div className="pt-2">
              <a
                href={recordingConsent ? currentSession.meetingUrl : '#'}
                target="_blank"
                rel="noreferrer"
                className={`w-full py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${
                  recordingConsent
                    ? 'bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white shadow-lg shadow-sky-950/50'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Video className="w-4 h-4" />
                <span>Open Stream / Recording in New Tab</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Right: Live Question Queue (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>Session Question Queue</span>
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                {currentSession.questions.length} Questions
              </span>
            </div>

            {/* Question list */}
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {currentSession.questions.map((q) => (
                <div
                  key={q.id}
                  className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-300">{q.user}</span>
                    {q.answered ? (
                      <span className="text-emerald-400 flex items-center gap-1 font-mono text-[10px]">
                        <CheckCircle2 className="w-3 h-3" /> Answered
                      </span>
                    ) : (
                      <span className="text-amber-400 font-mono text-[10px]">In Queue</span>
                    )}
                  </div>
                  <p className="text-slate-200">{q.text}</p>
                </div>
              ))}
            </div>

            {/* Submit question form */}
            <form onSubmit={handleQuestionSubmit} className="pt-2 border-t border-slate-800 space-y-2">
              <input
                type="text"
                placeholder="Ask coach Chad a question for this session..."
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <button
                type="submit"
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Add Question to Queue</span>
              </button>
            </form>
          </div>
        </div>
      </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-xs text-slate-400">
          No scheduled session metadata is currently attached. You can watch the live coaching stream above.
        </div>
      )}
    </div>
  );
};
