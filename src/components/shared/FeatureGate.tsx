/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Lock, AlertCircle } from 'lucide-react';
import { useFeatureFlags } from '../../lib/feature-flags.ts';
import type { FeatureFlags } from '../../lib/constants.ts';

interface FeatureGateProps {
  flag: keyof FeatureFlags;
  fallbackTitle: string;
  fallbackReason: string;
  responsibleRole?: string;
  children: React.ReactNode;
}

export const FeatureGate: React.FC<FeatureGateProps> = ({
  flag,
  fallbackTitle,
  fallbackReason,
  responsibleRole = 'Chad de Wet / Legal Advisor',
  children,
}) => {
  const { flags } = useFeatureFlags();

  if (flags[flag]) {
    return <>{children}</>;
  }

  return (
    <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-xl text-center max-w-xl mx-auto my-6">
      <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
        <Lock className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-slate-200 mb-1">{fallbackTitle}</h3>
      <p className="text-sm text-slate-400 mb-4 max-w-md mx-auto leading-relaxed">
        {fallbackReason}
      </p>
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
        <AlertCircle className="w-3.5 h-3.5" />
        <span>Gated feature: <code className="font-mono">{flag}</code></span>
        <span className="text-slate-500">·</span>
        <span className="text-slate-400">Decision: {responsibleRole}</span>
      </div>
    </div>
  );
};
