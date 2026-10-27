/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  SOURCED_REQUIREMENTS,
  type Milestone,
  type Requirement,
  type Department,
} from '../../lib/constants.ts';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  BookOpen,
  UserCheck,
  Filter,
  ArrowRight,
  Target,
  Wrench,
  Sparkles,
} from 'lucide-react';

interface MilestoneTimelineProps {
  milestones: Milestone[];
  requirements?: Requirement[];
  department: Department;
  targetRole: string;
  pathwaySummary?: string;
  coachingProgrammeLabel?: string;
  isCoachMode: boolean;
  onUpdateMilestoneStatus: (id: string, status: Milestone['status']) => void;
  onSyncLaunchpadPathway?: () => void;
  syncingPathway?: boolean;
}

export const MilestoneTimeline: React.FC<MilestoneTimelineProps> = ({
  milestones,
  requirements,
  department,
  targetRole,
  pathwaySummary,
  coachingProgrammeLabel,
  isCoachMode,
  onUpdateMilestoneStatus,
  onSyncLaunchpadPathway,
  syncingPathway = false,
}) => {
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<Department | 'all'>(department);
  const [activeSubTab, setActiveSubTab] = useState<'milestones' | 'requirements'>('milestones');

  const activeRequirements = requirements && requirements.length > 0 ? requirements : SOURCED_REQUIREMENTS;

  const filteredRequirements = activeRequirements.filter(
    (r) => selectedDeptFilter === 'all' || r.applicableDepartments.includes(selectedDeptFilter)
  );

  const getClassificationBadge = (classification: Requirement['classification']) => {
    switch (classification) {
      case 'required_for_context':
        return {
          label: 'Statutory / Mandatory for Context',
          classes: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
        };
      case 'employer_preference':
        return {
          label: 'High Employer Preference',
          classes: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        };
      case 'useful_development':
        return {
          label: 'Useful Progression',
          classes: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
        };
      case 'defer':
        return {
          label: 'Defer (Do Not Spend Yet!)',
          classes: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
        };
      case 'requires_professional_confirmation':
        return {
          label: 'Requires Medical/Legal Confirmation',
          classes: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
        };
    }
  };

  const completedCount = milestones.filter((m) => m.status === 'approved' || m.status === 'submitted').length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Agreed Career Pathway • {department.toUpperCase()} DEPARTMENT</span>
            {coachingProgrammeLabel && (
              <span className="px-2 py-0.5 rounded bg-teal-500/10 border border-teal-500/25 text-teal-300">
                {coachingProgrammeLabel}
              </span>
            )}
          </div>
          <h2 className="text-xl font-bold text-white">Target Role: {targetRole}</h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            {pathwaySummary ||
              '8-Week Superyacht Career Launchpad pathway structured around Phase 1: KNOW (Weeks 1–2), Phase 2: PREPARE (Weeks 3–5), and Phase 3: EXECUTE (Weeks 6–8). Every statutory requirement is linked to its official maritime authority.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onSyncLaunchpadPathway && (
            <button
              onClick={onSyncLaunchpadPathway}
              disabled={syncingPathway}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-950 hover:bg-slate-800 text-teal-300 border border-teal-500/30 transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {syncingPathway ? 'Syncing Pathway...' : 'Sync 8-Week Launchpad Milestones'}
            </button>
          )}
          <div className="flex items-center gap-2 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveSubTab('milestones')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeSubTab === 'milestones'
                  ? 'bg-teal-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              8-Week Milestones ({completedCount}/{milestones.length})
            </button>
            <button
              onClick={() => setActiveSubTab('requirements')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeSubTab === 'requirements'
                  ? 'bg-teal-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sourced Requirements ({activeRequirements.length})
            </button>
          </div>
        </div>
      </div>

      {activeSubTab === 'milestones' ? (
        <div className="space-y-4">
          {milestones.map((m, idx) => {
            const linkedReq = activeRequirements.find(
              (r) => r.id === m.requirementId || r.code === m.requirementId
            );

            return (
              <div
                key={m.id}
                className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 flex flex-col md:flex-row md:items-start justify-between gap-4 hover:border-slate-700/80 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border ${
                        m.status === 'approved'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : m.status === 'submitted'
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                          : m.status === 'in_progress'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {m.status === 'approved' ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {m.phase && (
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-teal-500/15 text-teal-300 border border-teal-500/30">
                          {m.phase}
                        </span>
                      )}
                      <h3 className="text-base font-bold text-white">{m.title}</h3>
                      <span
                        className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border uppercase tracking-wide ${
                          m.status === 'approved'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : m.status === 'submitted'
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                            : m.status === 'in_progress'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {m.status.replace('_', ' ')}
                      </span>
                    </div>

                    <p className="text-sm text-slate-300">{m.description}</p>

                    {(m.growAnchor || m.platformTool || m.primaryOutput) && (
                      <div className="flex flex-wrap items-center gap-2 pt-0.5">
                        {m.growAnchor && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                            <Target className="w-3 h-3" /> GROW: {m.growAnchor}
                          </span>
                        )}
                        {m.platformTool && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-teal-300 bg-slate-950 border border-slate-800 px-2 py-0.5 rounded">
                            <Wrench className="w-3 h-3" /> Tool: {m.platformTool}
                          </span>
                        )}
                        {m.primaryOutput && (
                          <span className="text-[11px] text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                            Output: {m.primaryOutput}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1">
                      <span className="bg-slate-950/70 px-2.5 py-1 rounded border border-slate-800">
                        <strong className="text-slate-300">Evidence Required:</strong> {m.evidenceRequired}
                      </span>
                      {m.notes && (
                        <span className="text-amber-300/90 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> {m.notes}
                        </span>
                      )}
                    </div>

                    {linkedReq && (
                      <div className="mt-2 bg-slate-950/60 border border-slate-800/80 rounded-lg p-3 text-xs space-y-1">
                        <div className="flex items-center justify-between text-slate-300 font-medium">
                          <span className="flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5 text-teal-400" />
                            Sourced Requirement: {linkedReq.code}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            Authority: {linkedReq.sourceAuthority} ({linkedReq.sourceVersion})
                          </span>
                        </div>
                        {linkedReq.notes && (
                          <p className="text-slate-400 text-[11px]">{linkedReq.notes}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Member & Coach Controls */}
                <div className="flex flex-wrap items-center gap-2 shrink-0 self-end md:self-center">
                  {m.status === 'pending' && (
                    <button
                      onClick={() => onUpdateMilestoneStatus(m.id, 'in_progress')}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors flex items-center gap-1"
                    >
                      Start Milestone <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {m.status === 'in_progress' && (
                    <button
                      onClick={() => onUpdateMilestoneStatus(m.id, 'submitted')}
                      className="px-3 py-1.5 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/30 text-xs font-semibold transition-colors"
                    >
                      Submit for Coach Review
                    </button>
                  )}
                  {m.status !== 'deferred' && m.status !== 'approved' && (
                    <button
                      onClick={() => onUpdateMilestoneStatus(m.id, 'deferred')}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 border border-slate-800 text-xs font-medium transition-colors"
                    >
                      Defer
                    </button>
                  )}
                  {m.status === 'deferred' && (
                    <button
                      onClick={() => onUpdateMilestoneStatus(m.id, 'in_progress')}
                      className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-medium transition-colors"
                    >
                      Resume
                    </button>
                  )}
                  {isCoachMode && m.status !== 'approved' && (
                    <button
                      onClick={() => onUpdateMilestoneStatus(m.id, 'approved')}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-colors flex items-center gap-1"
                    >
                      <UserCheck className="w-3.5 h-3.5" /> Coach Approve
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/50 border border-slate-800/80 rounded-xl p-4">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <Filter className="w-4 h-4 text-teal-400" />
              <span>Filter by Department:</span>
              {(['all', 'deck', 'interior', 'engineering', 'galley'] as const).map((dept) => (
                <button
                  key={dept}
                  onClick={() => setSelectedDeptFilter(dept)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium capitalize transition-all ${
                    selectedDeptFilter === dept
                      ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>
            <div className="text-[11px] text-slate-400">
              Never hardcode legal claims — every rule displays source authority & verification date.
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredRequirements.map((req) => {
              const badge = getClassificationBadge(req.classification);
              return (
                <div
                  key={req.id}
                  className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 space-y-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-mono text-teal-400">{req.code}</span>
                      <h3 className="text-base font-bold text-white mt-0.5">{req.title}</h3>
                    </div>
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full border ${badge.classes}`}
                    >
                      {badge.label}
                    </span>
                  </div>

                  <p className="text-sm text-slate-300">{req.description}</p>

                  {req.notes && (
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-xs text-amber-200 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>{req.notes}</span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-400">
                    <div>
                      <span className="text-slate-500 block">Source Authority & Version</span>
                      <span className="text-slate-200 font-medium">
                        {req.sourceAuthority} ({req.sourceVersion})
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Applicable Flags / Roles</span>
                      <span className="text-slate-200">
                        {req.applicableFlags.join(', ')} • {req.applicableRoles.join(', ')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-3">
                      <div className="text-right">
                        <span className="text-slate-500 block">Last Verified</span>
                        <span className="text-emerald-400 font-medium">
                          {req.lastVerifiedDate} by {req.verifiedBy}
                        </span>
                      </div>
                      {req.sourceUrl && (
                        <a
                          href={req.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-300"
                          title="View Official Authority Source"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
