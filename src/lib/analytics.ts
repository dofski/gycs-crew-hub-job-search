/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CtaEventContext {
  source: string;
  pathway?: string;
  department?: string;
  programme?: string;
}

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: Array<Record<string, any>>;
    _paq?: Array<any[]>;
  }
}

function emitConversionEvent(
  eventName: 'book_a_call' | 'start_your_application',
  labelTitle: 'Book a Call' | 'Start Your Application',
  ctx: CtaEventContext
) {
  if (typeof window === 'undefined') return;

  const payload = {
    event: eventName,
    event_category: 'sales_landing_cta',
    event_label: ctx.source,
    pathway: ctx.pathway || 'general',
    department: ctx.department || 'undecided',
    coaching_programme: ctx.programme || 'undecided',
    timestamp: new Date().toISOString(),
  };

  try {
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, payload);
    } else if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push(payload);
    }
  } catch {
    // Ignore third-party blocker errors
  }

  try {
    if (Array.isArray(window._paq)) {
      const detail = [ctx.source, ctx.pathway, ctx.programme].filter(Boolean).join(':');
      window._paq.push(['trackEvent', 'Landing CTA', labelTitle, detail]);
    }
  } catch {
    // Ignore Matomo blocker errors
  }

  try {
    window.dispatchEvent(new CustomEvent('gycs:cta-event', { detail: payload }));
  } catch {
    // Ignore CustomEvent errors
  }
}

export function trackBookCallEvent(ctx: CtaEventContext): void {
  emitConversionEvent('book_a_call', 'Book a Call', ctx);
}

export function trackStartApplicationEvent(ctx: CtaEventContext): void {
  emitConversionEvent('start_your_application', 'Start Your Application', ctx);
}
