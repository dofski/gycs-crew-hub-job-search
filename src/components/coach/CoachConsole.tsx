/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Users,
  AlertTriangle,
  Clock,
  ShieldCheck,
  CheckCircle2,
  FileCheck2,
  Calendar,
  Briefcase,
  HelpCircle,
  FileText,
  UserCheck,
  PlusCircle,
  ChevronRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import type { UserProfile, VerifiedOutcome } from '../../types/database.ts';
import type { ReadinessDimension, ReadinessLevel } from '../../lib/constants.ts';
import { summarizeReadinessMatrix } from '../../lib/pathway-rules.ts';
import { SuperadminLiveController } from '../live/SuperadminLiveController.tsx';

interface CoachConsoleProps {
  profiles: UserProfile[];
  readinessMatrix: ReadinessDimension[];
  outcomes: VerifiedOutcome[];
  onUpdateReadinessLevel: (key: string, level: ReadinessLevel) => void;
  onRecordOutcome: (outcome: Partial<VerifiedOutcome>) => void;
}

export const CoachConsole: React.FC<CoachConsoleProps> = ({
  profiles,
  readinessMatrix,
  outcomes,
  onUpdateReadinessLevel,
  onRecordOutcome,
}) => {
  const [activeTab, setActiveTab] = useState<'queue' | 'readiness' | 'outcomes' | 'live'>('queue');
  const [selectedMemberId, setSelectedMemberId] = useState<string>(profiles[0]?.id || 'sarah-vdm');

  // Outcome recording modal
  const [showOutcomeModal, setShowOutcomeModal] = useState(false);
  const [newVessel, setNewVessel] = useState('');
  const [newRole, setNewRole] = useState('Junior Deckhand');
  const [newContractType, setNewContractType] = useState<'seasonal' | 'permanent' | 'daywork'>('seasonal');
  const [newEvidenceType, setNewEvidenceType] = useState<VerifiedOutcome['evidenceType']>('redacted_contract');
  const [newNotes, setNewNotes] = useState('');

  const selectedMember = profiles.find((p) => p.id === selectedMemberId) || profiles[0];
  const readinessSummary = summarizeReadinessMatrix(readinessMatrix);

  const handleCreateOutcome = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVessel) return;

    onRecordOutcome({
      userId: selectedMember.id,
      memberName: selectedMember.displayName,
      roleTitle: newRole,
      vesselName: newVessel,
      employmentType: newContractType,
      startDate: new Date().toISOString().split('T')[0],
      evidenceType: newEvidenceType,
      evidenceNotes: newNotes || 'Redacted contract verified by coach Chad de Wet.',
      consistentWithPathway: true,
      verifiedBy: 'Chad de Wet',
      retentionChecks: [
        { stage: 'week_1', status: 'pending' },
        { stage: 'week_4', status: 'pending' },
        { stage: 'month_3', status: 'pending' },
        { stage: 'season_end', status: 'pending' },
      ],
    });

    setNewVessel('');
    setNewNotes('');
    setShowOutcomeModal(false);
  };

  const getReadinessBadge = (level: ReadinessLevel) => {
    switch (level) {
      case 'not_started':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400">Not Started</span>;
      case 'in_progress':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">In Progress</span>;
      case 'submitted':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-sky-500/20 text-sky-300 border border-sky-500/30">Submitted</span>;
      case 'coach_approved':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">Coach Approved</span>;
      case 'verified':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">Verified</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 bg-gradient-to-r from-purple-950/40 via-slate-900 to-slate-900 border border-purple-500/30 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-400 mb-1">
            <Users className="w-4 h-4" />
            <span>Coach Supervision & Intervention Console</span>
          </div>
          <h1 className="text-xl font-bold text-white font-['Space_Grotesk']">
            Coach Chad de Wet — Case Queue
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Intervention-first operating system: resolve candidate blockers, review evidence, evaluate 7-dimension readiness, and record verified starts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center">
            <button
              onClick={() => setActiveTab('queue')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'queue' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Intervention Queue
            </button>
            <button
              onClick={() => setActiveTab('readiness')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'readiness' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Readiness Matrix
            </button>
            <button
              onClick={() => setActiveTab('outcomes')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'outcomes' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Outcome Recording
            </button>
            <button
              onClick={() => setActiveTab('live')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'live' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-emerald-400 hover:text-emerald-300'
              }`}
            >
              Live Stream Controller
            </button>
          </div>
        </div>
      </div>

      {/* TAB 4: GUMLET LIVE STREAM CONTROLLER */}
      {activeTab === 'live' && <SuperadminLiveController userEmail="mail@chaddewet.com" userRole="superadmin" />}

      {/* TAB 1: INTERVENTION QUEUE */}
      {activeTab === 'queue' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Assigned Candidate List (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
              Active Member Cases ({profiles.filter((p) => p.role === 'member').length})
            </span>
            <div className="space-y-2">
              {profiles
                .filter((p) => p.role === 'member')
                .map((member) => {
                  const isSelected = member.id === selectedMemberId;
                  const hasBlocker = member.blockers && member.blockers.length > 0;
                  return (
                    <button
                      key={member.id}
                      onClick={() => setSelectedMemberId(member.id)}
                      className={`w-full text-left p-3.5 rounded-xl border transition flex items-start gap-3 ${
                        isSelected
                          ? 'bg-purple-500/15 border-purple-500 text-purple-200'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <img
                        src={member.avatarUrl}
                        alt={member.displayName}
                        className="w-9 h-9 rounded-full object-cover border border-slate-700 shrink-0 mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-white truncate">{member.displayName}</h4>
                          <span className="text-[10px] font-mono capitalize px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                            {member.targetDepartment}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 capitalize mt-0.5">
                          Stage: <strong className="text-emerald-400">{member.journeyState.replace('_', ' ')}</strong>
                        </p>
                        {hasBlocker && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-amber-300 mt-1 font-medium">
                            <AlertTriangle className="w-3 h-3" /> 1 Blocker Needs Coach
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>

          {/* Deep Case View (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedMember.avatarUrl}
                    alt={selectedMember.displayName}
                    className="w-12 h-12 rounded-full object-cover border border-slate-700"
                  />
                  <div>
                    <h3 className="text-base font-bold text-white">{selectedMember.displayName}</h3>
                    <p className="text-xs text-slate-400">
                      Target: {selectedMember.targetRole} · {selectedMember.countryCode} ({selectedMember.timezone})
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400">Financial Runway</span>
                  <p className="text-sm font-bold text-emerald-400 font-mono">
                    {selectedMember.runwayMonths} Months Safe
                  </p>
                </div>
              </div>

              {/* Diagnostic Prompts (Investigation Prompts, Never Conclusions) */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <span className="text-[10px] font-mono uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5" />
                  Diagnostic Investigation Prompts (Not Automated Judgments)
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Candidate has {selectedMember.blockers?.length || 0} active blocker flagged. Check if appointment delays in Cape Town Foreshore or Schengen visa wait times are the root impediment before moving to active search.
                </p>
              </div>

              {/* Blockers list */}
              {selectedMember.blockers && selectedMember.blockers.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-200">Active Blockers Requiring Intervention:</span>
                  {selectedMember.blockers.map((b, idx) => (
                    <div key={idx} className="p-3 bg-amber-950/20 border border-amber-500/30 rounded-xl text-xs text-amber-200 flex items-start gap-2.5">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                      <div className="flex-1">
                        <p>{b}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => alert(`Next action assigned for ${selectedMember.displayName}`)}
                            className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded text-[11px] font-semibold"
                          >
                            Assign Coach Next Action
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Fast Action Bar */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setShowOutcomeModal(true)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Record Verified Start</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: READINESS MATRIX (7 DIMENSIONS) */}
      {activeTab === 'readiness' && (
        <div className="space-y-6">
          {/* Guardrail Disclaimer */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300">
              <strong className="text-white block font-bold mb-0.5">
                Multi-Dimensional Readiness Matrix (Anti-Vanity Metric)
              </strong>
              <p className="leading-relaxed text-slate-400">
                Employability cannot be evaluated as a single percentage score. GYCS evaluates candidate readiness across 7 distinct qualitative dimensions. Every dimension must be coach-approved or verified before departure.
              </p>
            </div>
          </div>

          {/* Matrix Tally Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-center">
              <span className="text-[10px] text-slate-400 uppercase block">Verified</span>
              <span className="text-xl font-bold text-emerald-400 font-mono">{readinessSummary.verified}</span>
            </div>
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-center">
              <span className="text-[10px] text-slate-400 uppercase block">Coach Approved</span>
              <span className="text-xl font-bold text-purple-400 font-mono">{readinessSummary.coach_approved}</span>
            </div>
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-center">
              <span className="text-[10px] text-slate-400 uppercase block">Submitted</span>
              <span className="text-xl font-bold text-sky-400 font-mono">{readinessSummary.submitted}</span>
            </div>
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-center">
              <span className="text-[10px] text-slate-400 uppercase block">In Progress</span>
              <span className="text-xl font-bold text-amber-400 font-mono">{readinessSummary.in_progress}</span>
            </div>
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-center">
              <span className="text-[10px] text-slate-400 uppercase block">Not Started</span>
              <span className="text-xl font-bold text-slate-400 font-mono">{readinessSummary.not_started}</span>
            </div>
          </div>

          {/* 7 Dimensions Detail List */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-800/80">
            {readinessMatrix.map((dim) => (
              <div key={dim.key} className="p-4 hover:bg-slate-800/30 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">{dim.label}</h3>
                  </div>
                  <p className="text-xs text-slate-400">
                    Measured by: <strong className="text-slate-300">{dim.measuredBy}</strong>
                  </p>
                  <p className="text-[11px] text-slate-500">Source of truth: {dim.sourceOfTruth}</p>
                  {dim.notes && <p className="text-xs text-emerald-400/90 italic pt-1">{dim.notes}</p>}
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                  <select
                    value={dim.level}
                    onChange={(e) => onUpdateReadinessLevel(dim.key, e.target.value as ReadinessLevel)}
                    aria-label={`Readiness status for ${dim.label}`}
                    className="bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                  >
                    <option value="not_started">Not Started</option>
                    <option value="in_progress">In Progress</option>
                    <option value="submitted">Submitted</option>
                    <option value="coach_approved">Coach Approved</option>
                    <option value="verified">Verified</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: OUTCOME RECORDING */}
      {activeTab === 'outcomes' && (
        <div className="space-y-6">
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-white font-['Space_Grotesk']">
                Verified Employment Starts & First Season Retention
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Primary outcome: verified paid employment consistent with agreed pathway, evidenced by redacted contract or employer confirmation. Daywork reported separately.
              </p>
            </div>
            <button
              onClick={() => setShowOutcomeModal(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shrink-0 transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Record New Verified Start</span>
            </button>
          </div>

          <div className="space-y-4">
            {outcomes.map((out) => (
              <div key={out.id} className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold">
                      {out.employmentType} Contract
                    </span>
                    <h3 className="text-base font-bold text-white mt-1">
                      {out.memberName} — {out.roleTitle}
                    </h3>
                    <p className="text-xs text-emerald-400">{out.vesselName} (Started {out.startDate})</p>
                  </div>

                  <span className="text-xs text-slate-400 font-mono">
                    Verified by {out.verifiedBy} ({out.evidenceType})
                  </span>
                </div>

                <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  {out.evidenceNotes}
                </p>

                {/* Retention Schedule */}
                <div className="pt-2">
                  <span className="text-[11px] font-semibold text-slate-400 block mb-2">
                    First Season Retention Check Schedule:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {out.retentionChecks.map((rc, idx) => (
                      <div key={idx} className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-xs">
                        <span className="font-mono text-slate-400 text-[10px] uppercase block capitalize">
                          {rc.stage.replace('_', ' ')}
                        </span>
                        <span className="text-amber-400 font-semibold text-[11px] capitalize">
                          {rc.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Outcome Modal */}
      {showOutcomeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">Record Verified Employment Start</h3>
            <p className="text-xs text-slate-400 mb-4">
              Requires documented evidence (redacted SEA or employer confirmation).
            </p>

            <form onSubmit={handleCreateOutcome} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Candidate</label>
                <input
                  type="text"
                  disabled
                  value={selectedMember.displayName}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Vessel Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. M/Y Horizon Blue (45m Feadship)"
                  value={newVessel}
                  onChange={(e) => setNewVessel(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Role Title</label>
                  <input
                    type="text"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Contract Type</label>
                  <select
                    value={newContractType}
                    onChange={(e) => setNewContractType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="seasonal">Seasonal</option>
                    <option value="permanent">Permanent</option>
                    <option value="daywork">Daywork</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Evidence Type</label>
                <select
                  value={newEvidenceType}
                  onChange={(e) => setNewEvidenceType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="redacted_contract">Redacted Seafarer Employment Agreement (SEA)</option>
                  <option value="employer_confirmation">Direct Employer / Captain Confirmation</option>
                  <option value="start_confirmation">Onboard Arrival Confirmation</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Verification Commentary</label>
                <textarea
                  rows={3}
                  placeholder="Notes on MLC compliance, contract dates, and pathway alignment..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowOutcomeModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold"
                >
                  Confirm & Schedule Retention
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
