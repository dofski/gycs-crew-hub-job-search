/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { History, CheckCircle2, FileText, User } from 'lucide-react';

interface AuditItem {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  resource: string;
  details?: string;
}

interface AuditTrailProps {
  items?: AuditItem[];
}

export const AuditTrail: React.FC<AuditTrailProps> = ({ items }) => {
  const defaultItems: AuditItem[] = items || [
    {
      id: 'aud-1',
      timestamp: '2026-10-19 14:22 SAST',
      actor: 'Chad de Wet (Coach)',
      action: 'Reviewed STCW BST Certificate',
      resource: 'Documents / stcw_certificate_sarah.pdf',
      details: 'Verified accreditation number with SAMSA registrar. Status moved to reviewed.',
    },
    {
      id: 'aud-2',
      timestamp: '2026-10-18 10:15 SAST',
      actor: 'Sarah van der Merwe (Member)',
      action: 'Uploaded Document',
      resource: 'Documents / stcw_certificate_sarah.pdf',
      details: 'PDF uploaded to private storage bucket.',
    },
    {
      id: 'aud-3',
      timestamp: '2026-09-01 11:30 SAST',
      actor: 'Chad de Wet (Coach)',
      action: 'Agreed Pathway Transition',
      resource: 'Journey State: Exploring → Pathway Agreed',
      details: 'Reviewed 6-step intake assessment. Pathway set to Junior Deckhand.',
    },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4 text-slate-200">
        <History className="w-5 h-5 text-emerald-400" />
        <h3 className="font-semibold text-sm">Immutable Verification & Audit Trail</h3>
      </div>
      <div className="space-y-4 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
        {defaultItems.map((item) => (
          <div key={item.id} className="relative flex items-start gap-3 pl-8">
            <div className="absolute left-1.5 top-1 w-4 h-4 rounded-full bg-slate-900 border-2 border-emerald-500 flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
            </div>
            <div className="flex-1 bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  {item.actor}
                </span>
                <span className="text-slate-500 font-mono text-[11px]">{item.timestamp}</span>
              </div>
              <p className="text-emerald-400 font-medium mb-1">{item.action}</p>
              <p className="text-slate-400 flex items-center gap-1.5 mb-1">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                {item.resource}
              </p>
              {item.details && <p className="text-slate-300 italic">{item.details}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
