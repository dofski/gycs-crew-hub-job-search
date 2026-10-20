/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  CheckSquare,
  Clock,
  MessageSquare,
  Calendar,
  AlertCircle,
  Plus,
  ArrowRight,
  UserCheck
} from 'lucide-react';
import type { Application } from '../../types/database.ts';

interface ApplicationTrackerProps {
  applications: Application[];
  onUpdateStatus: (id: string, newStatus: Application['status']) => void;
  onAddInterview: (id: string, date: string, notes: string) => void;
}

export const ApplicationTracker: React.FC<ApplicationTrackerProps> = ({
  applications,
  onUpdateStatus,
  onAddInterview,
}) => {
  const [selectedAppId, setSelectedAppId] = useState<string>(applications[0]?.id || '');
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewNotes, setInterviewNotes] = useState('');

  const selectedApp = applications.find((a) => a.id === selectedAppId);

  const getStatusColor = (status: Application['status']) => {
    switch (status) {
      case 'saved':
      case 'preparing':
        return 'bg-slate-800 text-slate-300 border-slate-700';
      case 'submitted':
      case 'acknowledged':
        return 'bg-sky-500/20 text-sky-300 border-sky-500/30';
      case 'interview_scheduled':
      case 'interviewed':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'offered':
      case 'accepted':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'declined':
      case 'rejected':
      case 'withdrawn':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
    }
  };

  const handleAddInterview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp || !interviewDate) return;
    onAddInterview(selectedApp.id, interviewDate, interviewNotes);
    setInterviewDate('');
    setInterviewNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white font-['Space_Grotesk']">
            Applications & Interview Pipeline
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Track your partner submissions, dockwalking leads, captain interviews, and offer debriefs.
          </p>
        </div>
        <div className="text-xs font-mono text-emerald-400">
          {applications.length} Active Applications
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Applications List (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          {applications.map((app) => (
            <div
              key={app.id}
              onClick={() => setSelectedAppId(app.id)}
              className={`p-4 rounded-xl border cursor-pointer transition ${
                selectedAppId === app.id
                  ? 'bg-slate-800/80 border-emerald-500 shadow-lg'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h3 className="text-sm font-bold text-white">{app.title}</h3>
                  <p className="text-xs text-slate-400">{app.employer} · {app.location}</p>
                </div>

                <select
                  value={app.status}
                  onChange={(e) => onUpdateStatus(app.id, e.target.value as any)}
                  onClick={(e) => e.stopPropagation()}
                  aria-label={`Status for ${app.title}`}
                  className={`text-xs px-2.5 py-1 rounded-lg border font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500 ${getStatusColor(app.status)}`}
                >
                  <option value="saved">Saved</option>
                  <option value="preparing">Preparing</option>
                  <option value="submitted">Submitted</option>
                  <option value="interview_scheduled">Interview Scheduled</option>
                  <option value="interviewed">Interviewed</option>
                  <option value="offered">Offer Received</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                  <option value="withdrawn">Withdrawn</option>
                </select>
              </div>

              {app.notes && (
                <p className="text-xs text-slate-300 mt-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                  {app.notes}
                </p>
              )}

              {app.interviews && app.interviews.length > 0 && (
                <div className="mt-3 pt-2 border-t border-slate-800 flex items-center gap-2 text-xs text-purple-300">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Interview logged for {new Date(app.interviews[0].scheduledAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Right Column: Selected App Detail & Interview Debrief (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {selectedApp ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div>
                <span className="text-[10px] font-mono uppercase text-emerald-400">
                  Application Detail
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  {selectedApp.title}
                </h3>
                <p className="text-xs text-slate-400">{selectedApp.employer}</p>
              </div>

              {/* Interviews list */}
              <div>
                <span className="text-xs font-semibold text-slate-300 block mb-2">
                  Interviews & Coach Debriefs
                </span>
                {selectedApp.interviews && selectedApp.interviews.length > 0 ? (
                  <div className="space-y-2">
                    {selectedApp.interviews.map((int) => (
                      <div key={int.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1">
                        <div className="flex justify-between font-medium text-slate-200">
                          <span>{new Date(int.scheduledAt).toLocaleString()}</span>
                          <span className="capitalize text-purple-300">{int.format}</span>
                        </div>
                        <p className="text-slate-400 text-[11px]">{int.notes}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">No interviews scheduled yet.</p>
                )}
              </div>

              {/* Log an interview form */}
              <form onSubmit={handleAddInterview} className="pt-3 border-t border-slate-800 space-y-3">
                <span className="text-xs font-bold text-white block">Log an Interview & Prep Request</span>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Interview Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={interviewDate}
                    onChange={(e) => setInterviewDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Notes / Location / Captain Name</label>
                  <input
                    type="text"
                    placeholder="e.g. In-person at Port Vauban or Zoom video call"
                    value={interviewNotes}
                    onChange={(e) => setInterviewNotes(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Save Interview & Alert Coach</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="p-8 bg-slate-900 border border-slate-800 rounded-2xl text-center text-xs text-slate-400">
              Select an application on the left to view details and log interviews.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
