/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Scale, Briefcase, Cpu, AlertCircle, CheckCircle2 } from 'lucide-react';

interface OpenDecisionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OpenDecisionsModal: React.FC<OpenDecisionsModalProps> = ({ isOpen, onClose }) => {
  const [activeCategory, setActiveCategory] = useState<'legal' | 'business' | 'technical'>('legal');

  if (!isOpen) return null;

  const legalQuestions = [
    {
      id: 'L1',
      title: 'Employment Services Act s.15 (South Africa)',
      question: 'What is the legal position on charging members? Can we charge for coaching (not placement)? What documentation do we need?',
      decisionMaker: 'Legal Advisor',
      guardrailState: 'Payments strictly feature-flagged OFF. Default launch mode is free/sponsored pilot.',
    },
    {
      id: 'L2',
      title: 'POPIA Compliance & Retention Policy',
      question: 'Do we need a registered Information Officer? What is the strict data retention period for member records after completion/withdrawal?',
      decisionMaker: 'Legal Advisor',
      guardrailState: 'Marketing consent records isolated from programme participation. Deletion and export flows provisioned.',
    },
    {
      id: 'L3',
      title: 'ENG1 Medical Equivalents Acceptance',
      question: 'Which non-ENG1 medicals are currently accepted by MCA, SAMSA, and major employers? Must be externally verified, not assumed.',
      decisionMaker: 'Maritime Medical Advisor',
      guardrailState: 'Never auto-reject non-ENG1. Requirements engine flags for human review and authority verification.',
    },
    {
      id: 'L4',
      title: 'STCW Requirement Version Tracking',
      question: 'Are we tracking STCW 2010 Manila Amendments or have there been recent updates affecting entry-level deck/interior?',
      decisionMaker: 'SAMSA / MCA Liaison',
      guardrailState: 'Requirements schema stores source authority, version, last verified date, and verifying person.',
    },
    {
      id: 'L5',
      title: 'Group Coaching Recording Consent (SA Law)',
      question: 'Does South African law apply one-party or all-party consent to group coaching video recordings? Different from POPIA consent?',
      decisionMaker: 'Legal Advisor',
      guardrailState: 'Mandatory explicit recording consent checkbox before accessing live room or recorded broadcasts.',
    },
  ];

  const businessQuestions = [
    {
      id: 'B1',
      title: 'Pilot Pricing Model & Sponsoring',
      question: 'Is the first cohort fully free, sponsored, or deposit-refundable? Affects whether payment module is needed at launch.',
      decisionMaker: 'Chad de Wet (Founder)',
      guardrailState: 'Zero payments active in MVP. Sponsored pilot model default.',
    },
    {
      id: 'B2',
      title: 'Coach Supervision Capacity & Review SLAs',
      question: 'How many members per coach? This affects cohort size caps, assignment review SLAs, and coach console alert thresholds.',
      decisionMaker: 'Chad de Wet (Founder)',
      guardrailState: 'Cohort maximum defaulted to 12 members. 48-hour assignment SLA configured.',
    },
    {
      id: 'B3',
      title: 'Cohort Launch Schedule',
      question: 'What are the target launch dates for the first Deck and Interior cohorts? Affects seed data and calendar UI.',
      decisionMaker: 'Chad de Wet (Founder)',
      guardrailState: 'Inaugural cohort set to Oct-Nov 2026.',
    },
    {
      id: 'B4',
      title: 'External Meeting Provider Confirmation',
      question: 'Confirm Zoom Meeting SDK or alternative (Google Meet, Teams). Affects integration code.',
      decisionMaker: 'Chad de Wet (Founder)',
      guardrailState: 'External meeting join link integrated with in-app agenda and question queue.',
    },
    {
      id: 'B5',
      title: 'Tile Provider for MapLibre',
      question: 'Mapbox, Maptiler, Protomaps, or self-hosted tiles? License and cost implications.',
      decisionMaker: 'Chad de Wet (Founder)',
      guardrailState: 'Map directory feature-flagged; curated location guide with provenance active.',
    },
    {
      id: 'B6',
      title: 'GoHighLevel CRM Downstream Scope',
      question: 'Which fields sync to GHL? Only consented marketing contacts, or journey state changes as well?',
      decisionMaker: 'Chad de Wet (Founder)',
      guardrailState: 'GHL treated strictly as downstream marketing sync; Hub remains student master record.',
    },
    {
      id: 'B7',
      title: 'Outcome Definition Precision (Daywork)',
      question: 'Is daywork counted as an employment outcome or tracked separately? Schema supports both but reporting needs decision.',
      decisionMaker: 'Chad de Wet (Founder)',
      guardrailState: 'Daywork reported separately from seasonal and permanent contracts.',
    },
    {
      id: 'B8',
      title: 'Domain & Hosting Infrastructure',
      question: 'Confirm domain name, Vercel vs self-hosted, Supabase cloud vs self-hosted.',
      decisionMaker: 'Chad de Wet (Founder)',
      guardrailState: 'Production configuration documented.',
    },
    {
      id: 'B9',
      title: 'Employer Verification Protocol',
      question: 'Who verifies employers and what evidence is required? Defines the employers.is_verified workflow.',
      decisionMaker: 'Chad de Wet (Founder)',
      guardrailState: 'Only coach-verified partners listed; no public browsable candidate database.',
    },
  ];

  const technicalQuestions = [
    {
      id: 'T1',
      title: 'Supabase Project Provisioning',
      question: 'Create a new Supabase cloud project now, or develop against local Supabase CLI first?',
      decisionMaker: 'Chad de Wet / Lead Eng',
      guardrailState: 'Migrations 00001-00009 authored and ready for cloud apply or local CLI.',
    },
    {
      id: 'T2',
      title: 'AI Provider for CV Assist',
      question: 'Gemini vs alternatives. Affects API integration and cost. Server-side only, no PII sent.',
      decisionMaker: 'Chad de Wet / Lead Eng',
      guardrailState: 'Feature-flagged ai_cv_assist; client guardrail filter rejects false claims.',
    },
    {
      id: 'T3',
      title: 'PDF Generation Engine',
      question: 'Server-side headless browser vs client-side print layout.',
      decisionMaker: 'Engineering (with Chad)',
      guardrailState: 'Structured client-side print engine with verified provenance badges.',
    },
  ];

  const questions =
    activeCategory === 'legal'
      ? legalQuestions
      : activeCategory === 'business'
      ? businessQuestions
      : technicalQuestions;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-['Space_Grotesk']">
                Open Decisions Requiring a Human
              </h2>
              <p className="text-xs text-slate-400">
                Architectural items requiring business, legal, or medical owner resolution — never assumed.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close open decisions dialog"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="px-5 pt-3 border-b border-slate-800 flex gap-2">
          <button
            onClick={() => setActiveCategory('legal')}
            className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition flex items-center gap-1.5 ${
              activeCategory === 'legal'
                ? 'bg-slate-800 text-amber-300 border-b-2 border-amber-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Legal / Regulatory ({legalQuestions.length})</span>
          </button>
          <button
            onClick={() => setActiveCategory('business')}
            className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition flex items-center gap-1.5 ${
              activeCategory === 'business'
                ? 'bg-slate-800 text-emerald-300 border-b-2 border-emerald-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Business / Product ({businessQuestions.length})</span>
          </button>
          <button
            onClick={() => setActiveCategory('technical')}
            className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition flex items-center gap-1.5 ${
              activeCategory === 'technical'
                ? 'bg-slate-800 text-sky-300 border-b-2 border-sky-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Technical ({technicalQuestions.length})</span>
          </button>
        </div>

        {/* Content list */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {questions.map((item) => (
            <div key={item.id} className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-bold text-slate-200">
                  <span className="text-amber-400 font-mono mr-1.5">[{item.id}]</span>
                  {item.title}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
                  Decision-Maker: {item.decisionMaker}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{item.question}</p>
              <div className="pt-2 text-[11px] text-emerald-400 flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>
                  <strong>Responsible Engineering State:</strong> {item.guardrailState}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
