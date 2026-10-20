/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FileText,
  CheckCircle,
  Clock,
  Printer,
  Sparkles,
  AlertTriangle,
  User,
  ShieldCheck,
  Plus,
  Trash2,
  Lock
} from 'lucide-react';
import type { CVData, VerificationStatus } from '../../types/database.ts';
import { validateCopy } from '../../lib/guardrails.ts';
import { useFeatureFlags } from '../../lib/feature-flags.ts';

interface CVStudioProps {
  cvData: CVData;
  onSaveCV: (data: CVData) => void;
}

export const CVStudio: React.FC<CVStudioProps> = ({ cvData, onSaveCV }) => {
  const { flags } = useFeatureFlags();
  const [data, setData] = useState<CVData>(cvData);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Run guardrail validator on bio/objective
  const objectiveCheck = validateCopy(data.objective.text);

  const getStatusBadge = (status: VerificationStatus) => {
    switch (status) {
      case 'claimed':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">Claimed</span>;
      case 'uploaded':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-sky-500/20 text-sky-300 border border-sky-500/30">Uploaded</span>;
      case 'reviewed':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">Coach Reviewed</span>;
      case 'verified':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Verified</span>;
    }
  };

  const handleSave = () => {
    onSaveCV(data);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white font-['Space_Grotesk']">
              Structured Maritime CV Studio
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Version {data.version}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Every certification, date, and sea-time entry is labeled with provenance (claimed / uploaded / reviewed / verified).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center">
            <button
              onClick={() => setActiveTab('editor')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'editor' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Structured Editor
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'preview' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Maritime Preview / PDF
            </button>
          </div>

          <button
            onClick={handleSave}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-emerald-950/40"
          >
            {saveSuccess ? 'Changes Saved!' : 'Save CV Version'}
          </button>
        </div>
      </div>

      {/* Coach Commentary Bar */}
      {data.coachComments && (
        <div className="p-4 bg-purple-950/30 border border-purple-500/30 rounded-xl text-xs text-purple-200 flex items-start gap-3">
          <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-purple-100 block mb-0.5">Coach Review Note (Chad de Wet):</span>
            <p className="text-purple-300 leading-relaxed">{data.coachComments}</p>
          </div>
        </div>
      )}

      {/* Guardrail Violation Warning */}
      {!objectiveCheck.isValid && (
        <div className="p-4 bg-rose-950/40 border border-rose-500/40 rounded-xl text-xs text-rose-200 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block mb-0.5">Copy Guardrail Rule Triggered:</span>
            <p className="text-rose-300">
              Your profile statement contains prohibited guarantee or placement language. Superyacht captains seek humility and discipline; please remove promotional claims.
            </p>
          </div>
        </div>
      )}

      {/* EDITOR TAB */}
      {activeTab === 'editor' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Personal Info & Objective */}
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-400" />
                Personal Details & Seafarer Status
              </h3>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    value={data.personalInfo.fullName}
                    onChange={(e) =>
                      setData({
                        ...data,
                        personalInfo: { ...data.personalInfo, fullName: e.target.value },
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Nationality</label>
                  <input
                    type="text"
                    value={data.personalInfo.nationality}
                    onChange={(e) =>
                      setData({
                        ...data,
                        personalInfo: { ...data.personalInfo, nationality: e.target.value },
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="text-xs">
                <label className="block text-slate-400 mb-1">Current Base & Relocation Plan</label>
                <input
                  type="text"
                  value={data.personalInfo.location}
                  onChange={(e) =>
                    setData({
                      ...data,
                      personalInfo: { ...data.personalInfo, location: e.target.value },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Tattoo Visibility</label>
                  <input
                    type="text"
                    value={data.personalInfo.tattoos}
                    onChange={(e) =>
                      setData({
                        ...data,
                        personalInfo: { ...data.personalInfo, tattoos: e.target.value },
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Smoking Policy</label>
                  <select
                    value={data.personalInfo.smoker ? 'yes' : 'no'}
                    onChange={(e) =>
                      setData({
                        ...data,
                        personalInfo: { ...data.personalInfo, smoker: e.target.value === 'yes' },
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="no">Strict Non-Smoker</option>
                    <option value="yes">Smoker</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Objective */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  Maritime Objective
                </h3>
                {getStatusBadge(data.objective.label)}
              </div>
              <textarea
                rows={4}
                value={data.objective.text}
                onChange={(e) =>
                  setData({
                    ...data,
                    objective: { ...data.objective, text: e.target.value },
                  })
                }
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>Keep objective under 60 words. Focus on safety, work ethic, and guest service.</span>
                {!flags.ai_cv_assist && (
                  <span className="text-slate-400 font-mono text-[10px]">AI Assist: Disabled</span>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Qualifications & Experience */}
          <div className="space-y-6">
            {/* Qualifications list */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Maritime & Safety Qualifications
                </h3>
                <span className="text-[10px] font-mono text-slate-400">Strict Provenance</span>
              </div>

              <div className="space-y-2">
                {data.qualifications.map((q, idx) => (
                  <div key={idx} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-start justify-between gap-3 text-xs">
                    <div>
                      <h4 className="font-semibold text-slate-200">{q.name}</h4>
                      <p className="text-[11px] text-slate-400">{q.issuer} · {q.date}</p>
                    </div>
                    {getStatusBadge(q.label)}
                  </div>
                ))}
              </div>
            </div>

            {/* Practical Experience */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-white">
                Relevant Seamanship & Hospitality Experience
              </h3>
              <div className="space-y-3">
                {data.experience.map((exp) => (
                  <div key={exp.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-semibold text-slate-100">{exp.role}</h4>
                        <p className="text-[11px] text-emerald-400">{exp.employerOrVessel} ({exp.dates})</p>
                      </div>
                      {getStatusBadge(exp.label)}
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed pt-1">
                      {exp.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PREVIEW / PDF TAB */}
      {activeTab === 'preview' && (
        <div className="bg-white text-slate-900 rounded-2xl p-8 sm:p-12 shadow-2xl max-w-3xl mx-auto border border-slate-300 font-sans print:p-0">
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-6 mb-6 flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-extrabold uppercase tracking-tight text-slate-950">
                {data.personalInfo.fullName}
              </h1>
              <p className="text-sm font-bold text-emerald-700 uppercase tracking-widest mt-1">
                Junior Deckhand / Tender Driver
              </p>
              <div className="text-xs text-slate-600 mt-2 space-y-0.5">
                <p>Nationality: {data.personalInfo.nationality} · Location: {data.personalInfo.location}</p>
                <p>Non-Smoker: {data.personalInfo.smoker ? 'No' : 'Yes'} · Tattoos: {data.personalInfo.tattoos}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono uppercase bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200">
                GYCS Verified Profile
              </span>
            </div>
          </div>

          {/* Objective */}
          <div className="mb-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-1 mb-2">
              Professional Profile
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed">
              {data.objective.text}
            </p>
          </div>

          {/* Qualifications */}
          <div className="mb-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-1 mb-2">
              Maritime Qualifications & Certifications
            </h3>
            <div className="space-y-2 text-xs">
              {data.qualifications.map((q, idx) => (
                <div key={idx} className="flex justify-between items-baseline">
                  <div>
                    <span className="font-bold text-slate-900">{q.name}</span>
                    <span className="text-slate-600"> — {q.issuer}</span>
                  </div>
                  <span className="text-slate-500 font-mono text-[11px] shrink-0 ml-2">[{q.label}]</span>
                </div>
              ))}
            </div>
          </div>

          {/* Experience */}
          <div className="mb-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-1 mb-2">
              Seamanship & Practical Experience
            </h3>
            <div className="space-y-4 text-xs">
              {data.experience.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-slate-900">{exp.role} · {exp.employerOrVessel}</span>
                    <span className="text-slate-500 text-[11px] font-mono">{exp.dates}</span>
                  </div>
                  <p className="text-slate-700 text-[11px] mt-1 leading-relaxed">
                    {exp.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* References */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-1 mb-2">
              Verifiable Professional References
            </h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              {data.references.map((r, idx) => (
                <div key={idx} className="p-2 bg-slate-50 rounded border border-slate-200">
                  <span className="font-bold text-slate-900 block">{r.name}</span>
                  <span className="text-slate-600 text-[11px]">{r.role}</span>
                  <span className="text-[10px] text-emerald-700 block mt-1 font-mono">Contact shared upon captain request</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer print action */}
          <div className="mt-8 pt-4 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-400">
            <span>Prepared via Green Yacht Crew Solutions · Document ID: GYCS-CV-{data.version}</span>
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
