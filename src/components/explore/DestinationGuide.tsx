/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  MapPin,
  ShieldAlert,
  Building,
  Anchor,
  HeartPulse,
  Home,
  CheckCircle,
  ExternalLink,
  Calendar
} from 'lucide-react';

interface DestinationPin {
  id: string;
  name: string;
  hub: 'Antibes' | 'Palma' | 'Fort Lauderdale' | 'Cape Town';
  category: 'port' | 'medical' | 'crew_house' | 'agency' | 'training';
  address: string;
  provenance: string;
  lastReviewedDate: string;
  notes: string;
  regulationsWarning?: string;
}

const DESTINATION_PINS: DestinationPin[] = [
  {
    id: 'pin-1',
    name: 'Port Vauban (Quai des Milliardaires)',
    hub: 'Antibes',
    category: 'port',
    address: 'Avenue de Verdun, 06600 Antibes, France',
    provenance: 'Port Vauban Capitainerie Public Maritime Guide',
    lastReviewedDate: '2026-09-20',
    notes: 'Major European Mediterranean superyacht refit and embarkation hub. High security gates.',
    regulationsWarning: 'STRICT NOTICE: Having a pin here DOES NOT grant permission to enter secure marina docks or board vessels without captain invitation.',
  },
  {
    id: 'pin-2',
    name: 'Dr. Rosendorff & Partners (MCA / SAMSA Approved Doctor)',
    hub: 'Cape Town',
    category: 'medical',
    address: 'Suite 201, Foreshore Medical Centre, Cape Town, South Africa',
    provenance: 'UK Maritime & Coastguard Agency (MCA) Approved Doctors List (MSN 1815)',
    lastReviewedDate: '2026-10-01',
    notes: 'Authorized for statutory ENG1 seafarer medical fitness examinations and SAMSA compliance.',
  },
  {
    id: 'pin-3',
    name: 'The Glamorgan Crew House',
    hub: 'Antibes',
    category: 'crew_house',
    address: 'Rue de la République, Old Town, Antibes, France',
    provenance: 'GYCS Alumni Verified Partner Accommodation',
    lastReviewedDate: '2026-08-15',
    notes: 'Popular crew house with shared dorms (€30–€45/night). Prime networking hub for daywork leads.',
  },
  {
    id: 'pin-4',
    name: 'STP Shipyard & Marina de Mallorca',
    hub: 'Palma',
    category: 'port',
    address: 'Muelle Viejo, 07012 Palma, Balearic Islands, Spain',
    provenance: 'Autoritat Portuària de Balears Regulations',
    lastReviewedDate: '2026-09-10',
    notes: 'Key Balearic winter refit and spring commissioning shipyard.',
    regulationsWarning: 'STP requires PPE (hard hat, safety boots, high-vis vest) and pass approval for shipyard gate entry.',
  },
  {
    id: 'pin-5',
    name: 'SSTG Seafarer Safety Training Center',
    hub: 'Cape Town',
    category: 'training',
    address: 'V&A Waterfront Maritime Quarter, Cape Town',
    provenance: 'SAMSA Accredited Training Provider Directory 2026',
    lastReviewedDate: '2026-09-01',
    notes: 'Accredited provider for STCW 95/2010 Basic Safety Training and PDSD modules.',
  },
];

export const DestinationGuide: React.FC = () => {
  const [selectedHub, setSelectedHub] = useState<string>('All');

  const filteredPins = selectedHub === 'All'
    ? DESTINATION_PINS
    : DESTINATION_PINS.filter((p) => p.hub === selectedHub);

  return (
    <div className="space-y-6">
      {/* Non-negotiable Port Permission Guardrail Banner */}
      <div className="p-4 bg-amber-950/40 border border-amber-500/40 rounded-2xl flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300">
          <strong className="text-amber-200 block mb-0.5 font-bold">
            Legal & Port Entry Guardrail Notice
          </strong>
          <p className="leading-relaxed text-slate-400">
            A location pin in this directory provides verified geographical and contact provenance only. A pin does NEVER imply legal permission to enter restricted marina zones, bypass ISPS port security gates, or work without proper local maritime transit compliance. Respect all posted notices and captain privacy.
          </p>
        </div>
      </div>

      {/* Hub Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2 bg-slate-900 border border-slate-800 rounded-xl">
        <div className="flex items-center gap-1 overflow-x-auto">
          {['All', 'Antibes', 'Palma', 'Fort Lauderdale', 'Cape Town'].map((hub) => (
            <button
              key={hub}
              onClick={() => setSelectedHub(hub)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                selectedHub === hub
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {hub}
            </button>
          ))}
        </div>
        <span className="text-xs text-slate-400 font-mono pr-2">
          {filteredPins.length} Verified Facilities
        </span>
      </div>

      {/* Pins Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPins.map((pin) => (
          <div
            key={pin.id}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 hover:border-slate-700 transition"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-slate-800 text-emerald-400 font-bold">
                  {pin.hub} · {pin.category.replace('_', ' ')}
                </span>
                <h3 className="text-base font-bold text-white mt-1 font-['Space_Grotesk']">
                  {pin.name}
                </h3>
              </div>
            </div>

            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>{pin.address}</span>
            </p>

            <p className="text-xs text-slate-300 leading-relaxed">
              {pin.notes}
            </p>

            {pin.regulationsWarning && (
              <div className="p-2.5 bg-rose-950/30 border border-rose-500/30 rounded-xl text-[11px] text-rose-300 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span>{pin.regulationsWarning}</span>
              </div>
            )}

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
              <span title="Provenance source authority">Source: {pin.provenance}</span>
              <span>Reviewed: {pin.lastReviewedDate}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
