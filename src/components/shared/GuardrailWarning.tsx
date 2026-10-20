/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, Scale, UserCheck, ChevronDown, ChevronUp } from 'lucide-react';

interface GuardrailWarningProps {
  compact?: boolean;
}

export const GuardrailWarning: React.FC<GuardrailWarningProps> = ({ compact = false }) => {
  const [isOpen, setIsOpen] = useState(!compact);

  return (
    <div className="bg-slate-900/90 border border-amber-500/30 rounded-xl overflow-hidden shadow-lg backdrop-blur mb-6">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-3 bg-gradient-to-r from-amber-950/40 via-slate-900/40 to-slate-900/40 border-b border-amber-500/20 flex items-center justify-between cursor-pointer hover:bg-slate-800/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-amber-200">
              GYCS Responsible Career Architecture Guardrails
            </h4>
            <p className="text-xs text-slate-400">
              Zero employment guarantees · ESA s.15 payment freeze · Versioned maritime compliance
            </p>
          </div>
        </div>
        <button 
          type="button"
          aria-label={isOpen ? "Collapse guardrails notice" : "Expand guardrails notice"}
          className="text-slate-400 hover:text-slate-200 p-1"
        >
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isOpen && (
        <div className="p-4 space-y-3 text-xs text-slate-300">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 flex items-start gap-2.5">
              <Scale className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-200 block mb-0.5">Payment Inactivation (ESA s.15)</span>
                <p className="text-slate-400 leading-relaxed">
                  South Africa's Employment Services Act s.15 restricts charging work-seekers. Pilot cohort is free/sponsored. Billing is feature-flagged OFF.
                </p>
                <span className="inline-block mt-1.5 text-[10px] font-mono uppercase bg-amber-500/10 text-amber-300 px-1.5 py-0.5 rounded">
                  Decision-Maker: Legal Advisor
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-200 block mb-0.5">Zero Employment Guarantees</span>
                <p className="text-slate-400 leading-relaxed">
                  We promise coaching delivery, documented readiness review, and defined employment support. We never guarantee hiring outcomes or timelines.
                </p>
                <span className="inline-block mt-1.5 text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-300 px-1.5 py-0.5 rounded">
                  Decision-Maker: Chad de Wet (Founder)
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 flex items-start gap-2.5">
              <UserCheck className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-200 block mb-0.5">Sourced Medical & Training Advice</span>
                <p className="text-slate-400 leading-relaxed">
                  Advice stems from versioned maritime authorities (IMO STCW / MCA / SAMSA). Never auto-reject non-ENG1 medicals; accredited equivalents exist.
                </p>
                <span className="inline-block mt-1.5 text-[10px] font-mono uppercase bg-sky-500/10 text-sky-300 px-1.5 py-0.5 rounded">
                  Decision-Maker: Maritime Medical Advisor
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
