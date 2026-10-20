/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  HelpCircle,
  ShieldCheck,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import type { IntakeAssessmentData } from './IntakeWizard.tsx';

interface IntakeResultProps {
  data: IntakeAssessmentData;
  onProceedToPathway: () => void;
}

export const IntakeResult: React.FC<IntakeResultProps> = ({ data, onProceedToPathway }) => {
  const isDeck = data.department === 'deck';
  const roleTitle = isDeck ? 'Junior Deckhand / Tender Driver' : 'Junior Steward / Stewardess';

  return (
    <div className="max-w-3xl mx-auto py-6 space-y-6">
      {/* Header Banner */}
      <div className="p-6 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/40 rounded-2xl">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-2">
          <ShieldCheck className="w-4 h-4" />
          <span>Preliminary Pathway Assessment Completed</span>
        </div>
        <h1 className="text-2xl font-bold text-white font-['Space_Grotesk']">
          Recommended Route: {roleTitle}
        </h1>
        <p className="text-xs text-slate-300 mt-1 leading-relaxed">
          Based on your intake submission, coach Chad de Wet has structured a personalized 8-week pathway. Below is the full breakdown of why this pathway fits, what is verified, what remains uncertain, and what courses to avoid spending money on right now.
        </p>
      </div>

      {/* 4 Core Feedback Quadrants */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. WHY THIS PATHWAY FITS */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
            <CheckCircle className="w-4 h-4" />
            <h3>Why This Pathway Fits You</h3>
          </div>
          <ul className="text-xs text-slate-300 space-y-2 leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold">•</span>
              <span>
                <strong>Strong Foundation:</strong> Your experience in {data.previousExperience.slice(0, 2).join(' & ')} gives you immediate transferable practical skills.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold">•</span>
              <span>
                <strong>Water Discipline:</strong> High swimming confidence ({data.swimmingConfidence.replace('_', ' ')}) is an essential prerequisite for safety duties onboard.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold">•</span>
              <span>
                <strong>Financial Runway:</strong> Your {data.runwayMonths}-month runway (approx. R{data.runwayZar.toLocaleString()}) provides adequate cushion for a 60-day European search window.
              </span>
            </li>
          </ul>
        </div>

        {/* 2. SUPPORTING EVIDENCE */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
          <div className="flex items-center gap-2 text-sky-400 text-sm font-semibold">
            <Layers className="w-4 h-4" />
            <h3>Supporting Evidence Status</h3>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800/80">
              <span className="text-slate-300">Biometric Passport</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300">
                {data.hasPassport ? `Valid until ${data.passportExpiryYear}` : 'Action Required'}
              </span>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800/80">
              <span className="text-slate-300">Medical Fitness Assessment</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300">
                Pending maritime doctor appointment
              </span>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800/80">
              <span className="text-slate-300">Prior Hospitality / Seamanship</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/20 text-purple-300">
                Claimed ({data.previousExperience.length} skills selected)
              </span>
            </div>
          </div>
        </div>

        {/* 3. WHAT REMAINS UNCERTAIN */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
          <div className="flex items-center gap-2 text-amber-400 text-sm font-semibold">
            <HelpCircle className="w-4 h-4" />
            <h3>What Remains Uncertain (Action Items)</h3>
          </div>
          <ul className="text-xs text-slate-300 space-y-2 leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="text-amber-400 font-bold">•</span>
              <span>
                <strong>ENG1 Physical / Eyesight:</strong> You must complete an in-person seafarer medical with an MCA-approved or SAMSA doctor before departing South Africa.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 font-bold">•</span>
              <span>
                <strong>Schengen Transit Strategy:</strong> Visa appointment lead times in Cape Town and Pretoria fluctuate between 3 and 8 weeks; scheduling early is crucial.
              </span>
            </li>
          </ul>
        </div>

        {/* 4. WHAT NOT TO SPEND MONEY ON YET */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
          <div className="flex items-center gap-2 text-rose-400 text-sm font-semibold">
            <XCircle className="w-4 h-4" />
            <h3>What NOT To Spend Money On Yet</h3>
          </div>
          <ul className="text-xs text-slate-300 space-y-2 leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="text-rose-400 font-bold">•</span>
              <span>
                <strong>DO NOT buy Yachtmaster Offshore:</strong> Many flight schools in SA try to sell R45,000+ Yachtmaster packages to beginners. Captains only want basic safety, PB2, and positive attitude on your first contract.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-400 font-bold">•</span>
              <span>
                <strong>DO NOT pay crew placement agencies:</strong> In South Africa (ESA s.15) and under international MLC regulations, legitimate recruitment agencies NEVER charge work seekers.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-400 font-bold">•</span>
              <span>
                <strong>DO NOT book flights until CV & medical are reviewed:</strong> Wait until your profile readiness status reaches "Coach Approved".
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Action to proceed */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-white">Ready to lock in your pathway milestones?</h4>
          <p className="text-xs text-slate-400">
            View your step-by-step milestone timeline, upload certificates, and join the cohort live room.
          </p>
        </div>
        <button
          onClick={onProceedToPathway}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shrink-0 transition"
        >
          <span>View My Pathway</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
