/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const BANNED_COPY_PATTERNS = [
  /100%\s*(placement|job|employment|hire)\s*(guarantee|guaranteed)?/i,
  /guaranteed\s*(job|placement|hire|contract|employment)/i,
  /instant\s*(yacht\s*)?(job|hire|placement)/i,
  /we\s*guarantee\s*you\s*(will\s*get|a\s*job)/i,
  /guaranteed\s*salary/i,
  /automatic\s*qualification/i,
];

export interface CopyValidationResult {
  isValid: boolean;
  violations: string[];
}

/**
 * Validates user-facing or marketing copy to ensure compliance with non-negotiable guardrails.
 */
export function validateCopy(text: string): CopyValidationResult {
  const violations: string[] = [];

  for (const pattern of BANNED_COPY_PATTERNS) {
    if (pattern.test(text)) {
      violations.push(`Text contains prohibited guarantee language matching ${pattern.source}`);
    }
  }

  return {
    isValid: violations.length === 0,
    violations,
  };
}

export const THREE_PROMISES = {
  delivery: {
    title: '1. Delivery Promise',
    detail: 'Coaching syllabus, 8 weekly live strategy sessions, personalized document reviews, and CV critique delivered per schedule.',
    isCredential: false,
  },
  readiness: {
    title: '2. Readiness Review',
    detail: 'Documented, evidence-based review by coach Chad de Wet across 7 distinct operational dimensions. Not a government credential.',
    isCredential: false,
  },
  support: {
    title: '3. Employment Support',
    detail: 'Defined 90-day post-training search mentorship, dockwalking strategy, interview debriefs, and partner referrals. We do not charge work-seekers for placement.',
    isCredential: false,
  },
};
