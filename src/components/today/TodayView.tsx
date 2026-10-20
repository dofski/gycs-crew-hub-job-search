/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Calendar,
  AlertTriangle,
  FileCheck2,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Video,
  FileText,
  User,
  Sparkles
} from 'lucide-react';
import type { UserProfile } from '../../types/database.ts';
import { JOURNEY_STAGE_CONFIG } from '../../lib/constants.ts';

interface TodayViewProps {
  profile: UserProfile;
  onNavigate: (tab: string) => void;
  onOpenIntake: () => void;
}

export const TodayView: React.FC<TodayViewProps> = ({
  profile,
  onNavigate,
  onOpenIntake,
}) => {
  const currentStage = JOURNEY_STAGE_CONFIG[profile.journeyState as keyof typeof JOURNEY_STAGE_CONFIG] || JOURNEY_STAGE_CONFIG.exploring;

  return (
    <div className="space-y-6">
      {/* Journey State Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border uppercase tracking-wider ${currentStage.color}`}>
                Stage: {currentStage.title}
              </span>
              <span className="text-xs text-slate-400">
                Department: <strong className="text-slate-200 capitalize">{profile.targetDepartment}</strong>
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white font-['Space_Grotesk']">
              Welcome back, {profile.displayName.split(' ')[0]}
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              {currentStage.description}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onNavigate('pathway')}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <span>View Milestones</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenIntake}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-lg shadow-emerald-950/40"
            >
              <span>Retake Route Intake</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Immediate Action, Coach Session & Blockers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Next Immediate Action */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Immediate Next Action
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/20">
                Action Required
              </span>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              Upload ENG1 Medical Receipt or Confirmation
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Your appointment with Dr. Rosendorff & Partners (Cape Town Foreshore) is scheduled. Once you receive your certificate, upload it to the Documents Vault for coach Chad's verification.
            </p>
          </div>
          <button
            onClick={() => onNavigate('documents')}
            className="w-full py-2.5 px-4 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition"
          >
            <FileCheck2 className="w-4 h-4" />
            Go to Documents Vault
          </button>
        </div>

        {/* Upcoming Live Coaching Session */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Upcoming Live Session
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-sky-500/10 text-sky-300 border border-sky-500/20">
                Weekly Group
              </span>
            </div>
            <h3 className="text-lg font-bold text-white mb-1">
              Dockwalking Strategy & Crew House Survival
            </h3>
            <p className="text-xs text-slate-400 mb-3 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" />
              <span>Thursday, 17:00 SAST (75 mins)</span>
            </p>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Live with <strong className="text-slate-100">Chad de Wet</strong>. Reviewing Antibes port access protocols, French maritime visas, and captain intro templates.
            </p>
          </div>
          <button
            onClick={() => onNavigate('live')}
            className="w-full py-2.5 px-4 bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/30 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition"
          >
            <Video className="w-4 h-4" />
            Open Live Room & Questions
          </button>
        </div>

        {/* Unresolved Blockers & Reviews */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                Active Blockers
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300">
                1 Flagged
              </span>
            </div>
            {profile.blockers && profile.blockers.length > 0 ? (
              <div className="space-y-3 mb-4">
                {profile.blockers.map((b, idx) => (
                  <div key={idx} className="p-3 bg-amber-950/30 border border-amber-500/30 rounded-xl text-xs text-amber-200">
                    <p className="font-semibold mb-1">Coach Note:</p>
                    <p className="text-slate-300 text-[11px] leading-relaxed">{b}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-emerald-950/20 border border-emerald-500/20 rounded-xl text-xs text-emerald-300 mb-4">
                No active blockers detected. Pathway progressing smoothly.
              </div>
            )}
          </div>
          <button
            onClick={() => onNavigate('cv')}
            className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition"
          >
            <FileText className="w-4 h-4" />
            Open CV Studio Draft
          </button>
        </div>
      </div>

      {/* 3 Pillars Summary Bar */}
      <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          Your Supervised Career Pathway
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80">
            <span className="font-semibold text-emerald-400 block mb-1">1. Delivery</span>
            <p className="text-slate-400">8-week curriculum, weekly live sessions, and practical assignment reviews.</p>
          </div>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80">
            <span className="font-semibold text-sky-400 block mb-1">2. Readiness</span>
            <p className="text-slate-400">7-dimension qualitative audit before active dockwalking (no fake percentages).</p>
          </div>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80">
            <span className="font-semibold text-purple-400 block mb-1">3. Employment Support</span>
            <p className="text-slate-400">90-day search support, interview debriefs, and verified partner opportunities.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
