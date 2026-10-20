/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';

export const ConsentBanner: React.FC = () => {
  const [hasConsented, setHasConsented] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);

  useEffect(() => {
    const saved = localStorage.getItem('gycs_popia_consent');
    if (!saved) {
      setHasConsented(false);
    }
  }, []);

  const handleGrant = () => {
    localStorage.setItem('gycs_popia_consent', 'granted');
    setHasConsented(true);
    setShowModal(false);
  };

  if (hasConsented && !showModal) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 p-4 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg shrink-0 mt-0.5">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="text-xs text-slate-300">
          <h4 className="font-semibold text-slate-100 text-sm mb-1">POPIA Privacy & Data Consent</h4>
          <p className="text-slate-400 mb-3 leading-relaxed">
            In accordance with South Africa's POPIA, your sensitive qualification evidence is stored in private encrypted storage. Marketing channels (Email/SMS/WhatsApp) are strictly isolated from your programme participation.
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={handleGrant}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Acknowledge & Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
