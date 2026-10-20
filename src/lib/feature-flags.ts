/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { FeatureFlags, DEFAULT_FEATURE_FLAGS } from './constants.ts';

const STORAGE_KEY = 'gycs_feature_flags';

export function getStoredFeatureFlags(): FeatureFlags {
  if (typeof window === 'undefined') return DEFAULT_FEATURE_FLAGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_FEATURE_FLAGS;
    return { ...DEFAULT_FEATURE_FLAGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_FEATURE_FLAGS;
  }
}

export function setStoredFeatureFlags(flags: FeatureFlags): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(flags));
  } catch {
    // ignore
  }
}

export function useFeatureFlags() {
  const [flags, setFlags] = useState<FeatureFlags>(getStoredFeatureFlags());

  useEffect(() => {
    const handleStorage = () => {
      setFlags(getStoredFeatureFlags());
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const updateFlag = (key: keyof FeatureFlags, enabled: boolean) => {
    const updated = { ...flags, [key]: enabled };
    setFlags(updated);
    setStoredFeatureFlags(updated);
  };

  const resetFlags = () => {
    setFlags(DEFAULT_FEATURE_FLAGS);
    setStoredFeatureFlags(DEFAULT_FEATURE_FLAGS);
  };

  return { flags, updateFlag, resetFlags };
}
