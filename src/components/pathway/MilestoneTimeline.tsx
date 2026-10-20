/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  BookOpen,
  Filter
} from 'lucide-react';
import type { Milestone, Requirement, JourneyState } from '../../lib/constants.ts';
import { SOURCED_REQUIREMENTS, JOURNEY_STAGE_CONFIG } from '../../lib/constants.ts';
import { isAllowedStateTransition } from '../../lib/pathway-rules.ts';

interface MilestoneTimelineProps {
  milestones: Milestone[];
  currentJourneyState: JourneyState;
  onUpdateJourneyState: (newState: JourneyState) => void;
  onUpdateMilestoneStatus: (milestoneId: string, status: Milestone['status']) => void;
}

export const MilestoneTimeline: React.FC<MilestoneTimelineProps> = ({
  milestones,
  currentJourneyState,
  onUpdateJourneyState,
  onUpdateMilestoneStatus,
}) => {
  const [selectedRequirement, setSelectedRequirement] = useState<Requirement | null>(SOURCED_REQUIREMENTS[0]);
  const [transitionError, setTransitionError] = useState<string | null>(null);

  const handleStateChange = (targetState: JourneyState) => {
    const result = isAllowedStateTransition(currentJourneyState, targetState);
    if (!result.allowed) {
      setTransitionError(result.reason || 'Invalid state transition');
      return;
    }
    setTransitionError(null);
    onUpdateJourneyState(targetState);
  };

  const getClassificationBadge = (classification: Requirement['classification']) => {
    switch (classification) {
      case 'required_for_context':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30">Required for this context</span>;
      case 'employer_preference':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-500/15 text-sky-300 border border-sky-500/30">Employer preference</span>;
      case 'useful_development':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">Useful development</span>;
      case 'defer':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">Defer (Save funds)</span>;
      case 'requires_professional_confirmation':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30">Requires confirmation</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Journey State Transition Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Current Journey Stage
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border uppercase ${JOURNEY_STAGE_CONFIG[currentJourneyState].color}`}>
                {JOURNEY_STAGE_CONFIG[currentJourneyState].title}
              </span>
              <span className="text-xs text-slate-400">
                {JOURNEY_STAGE_CONFIG[currentJourneyState].description}
              </span>
            </div>
          </div>

          {/* Quick Transition Selector */}
          <div className="flex items-center gap-2">
            <label htmlFor="stage-transition-select" className="text-xs text-slate-400 font-medium">Transition to:</label>
            <select
              id="stage-transition-select"
              value={currentJourneyState}
              onChange={(e) => handleStateChange(e.target.value as JourneyState)}
              className="bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
            >
              {Object.keys(JOURNEY_STAGE_CONFIG).map((k) => (
                <option key={k} value={k}>
                  {JOURNEY_STAGE_CONFIG[k as JourneyState].title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {transitionError && (
          <div className="p-3 bg-rose-950/50 border border-rose-500/50 rounded-lg text-xs text-rose-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{transitionError}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: Milestones Timeline (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white font-['Space_Grotesk']">
              Pathway Milestones & Evidence Requirements
            </h2>
            <span className="text-xs text-slate-400">{milestones.length} milestones active</span>
          </div>

          <div className="space-y-3">
            {milestones.map((m, idx) => {
              const req = SOURCED_REQUIREMENTS.find((r) => r.id === m.requirementId);
              return (
                <div
                  key={m.id}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-4 transition hover:border-slate-700"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-start gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-slate-800 text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <div>
                        <h3 className="text-sm font-semibold text-white">{m.title}</h3>
                        <p className="text-xs text-slate-400 mt-0.5">{m.description}</p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <select
                      value={m.status}
                      onChange={(e) => onUpdateMilestoneStatus(m.id, e.target.value as any)}
                      aria-label={`Milestone status for ${m.title}`}
                      className="text-xs bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="submitted">Submitted</option>
                      <option value="approved">Coach Approved</option>
                      <option value="deferred">Deferred</option>
                    </select>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="text-slate-400">
                      Evidence required: <strong className="text-slate-300">{m.evidenceRequired}</strong>
                    </span>
                    {req && (
                      <button
                        onClick={() => setSelectedRequirement(req)}
                        className="text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>View Verified Source</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column: Sourced Requirements Engine (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white font-['Space_Grotesk']">
              Requirements Engine (Sourced)
            </h2>
            <span className="text-[11px] text-emerald-400 font-mono">No hardcoded truths</span>
          </div>

          {selectedRequirement ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                    CODE: {selectedRequirement.code}
                  </span>
                  <h3 className="text-sm font-bold text-white mt-0.5">
                    {selectedRequirement.title}
                  </h3>
                </div>
                {getClassificationBadge(selectedRequirement.classification)}
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {selectedRequirement.description}
              </p>

              <div className="space-y-2 text-xs bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Source Authority:</span>
                  <strong className="text-slate-200">{selectedRequirement.sourceAuthority}</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Regulation Version:</span>
                  <span className="font-mono text-slate-300">{selectedRequirement.sourceVersion}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Last Verified Date:</span>
                  <span className="font-mono text-emerald-400">{selectedRequirement.lastVerifiedDate}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Verified By:</span>
                  <span className="text-slate-300">{selectedRequirement.verifiedBy}</span>
                </div>
              </div>

              {selectedRequirement.notes && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-200">
                  <span className="font-semibold block mb-1">Compliance & Practical Note:</span>
                  <p className="text-slate-300 text-[11px] leading-relaxed">{selectedRequirement.notes}</p>
                </div>
              )}

              {/* Sourced list buttons */}
              <div>
                <span className="text-[11px] font-semibold text-slate-400 block mb-2">
                  Browse All Sourced Maritime Requirements:
                </span>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {SOURCED_REQUIREMENTS.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setSelectedRequirement(r)}
                      className={`w-full text-left p-2 rounded-lg text-xs transition flex items-center justify-between ${
                        selectedRequirement.id === r.id
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-slate-950/60 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      <span className="truncate pr-2">{r.title}</span>
                      <ChevronRight className="w-3.5 h-3.5 shrink-0 text-slate-500" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
