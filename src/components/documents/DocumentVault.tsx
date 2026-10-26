/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FileCheck2,
  UploadCloud,
  Shield,
  AlertTriangle,
  Clock,
  CheckCircle,
  FileText,
  Lock,
  Plus
} from 'lucide-react';
import type { DocumentItem } from '../../types/database.ts';
import type { VerificationStatus, DocumentCategory } from '../../lib/constants.ts';

interface DocumentVaultProps {
  documents: DocumentItem[];
  onUploadDocument: (doc: Partial<DocumentItem>, file?: File | null) => void;
  onOpenDocument?: (doc: DocumentItem) => void;
  onUpdateStatus?: (docId: string, status: VerificationStatus) => void;
}

export const DocumentVault: React.FC<DocumentVaultProps> = ({
  documents,
  onUploadDocument,
  onOpenDocument,
}) => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<DocumentCategory>('training');
  const [newAuthority, setNewAuthority] = useState('');
  const [newExpiryDate, setNewExpiryDate] = useState('');
  const [isSensitive, setIsSensitive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const getStatusBadge = (status: VerificationStatus) => {
    switch (status) {
      case 'claimed':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">Claimed (Unverified)</span>;
      case 'uploaded':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-sky-500/20 text-sky-300 border border-sky-500/30">Uploaded</span>;
      case 'reviewed':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">Coach Reviewed</span>;
      case 'verified':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Verified</span>;
    }
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    onUploadDocument(
      {
        title: newTitle.trim(),
        category: newCategory,
        issuingAuthority: newAuthority.trim() || undefined,
        expiryDate: newExpiryDate || undefined,
        verificationStatus: selectedFile ? 'uploaded' : 'claimed',
        fileName: selectedFile ? selectedFile.name : undefined,
        fileSizeBytes: selectedFile ? selectedFile.size : undefined,
        mimeType: selectedFile ? selectedFile.type : undefined,
        isSensitive,
      },
      selectedFile
    );

    setNewTitle('');
    setNewAuthority('');
    setNewExpiryDate('');
    setSelectedFile(null);
    setShowUploadModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Privacy Shield Banner */}
      <div className="p-4 bg-slate-900 border border-emerald-500/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Private Storage Vault (Zero AI Access)</h3>
            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
              Your sensitive medical files and passport scans are encrypted and never sent to external AI models. Only assigned coaches have review access.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shrink-0 transition shadow-lg shadow-emerald-950/40"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload New Evidence</span>
        </button>
      </div>

      {/* Medical Qualification Notice */}
      <div className="p-4 bg-sky-950/30 border border-sky-500/30 rounded-xl text-xs text-sky-200">
        <div className="flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-100 block mb-0.5">Maritime Medical Advisory: ENG1 & Equivalents</span>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Never auto-reject non-ENG1 certificates. While UK MCA vessels require an ENG1 (available from approved doctors in Cape Town and Durban), SAMSA seafarer medicals and mutual flag-state recognitions are valid on numerous international flags. Coach Chad verifies applicable flag acceptance per case.
            </p>
          </div>
        </div>
      </div>

      {/* Documents List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white font-['Space_Grotesk']">
            Stored Documents & Verification Records
          </h3>
          <span className="text-xs text-slate-400 font-mono">{documents.length} files tracked</span>
        </div>

        <div className="divide-y divide-slate-800/80">
          {documents.length === 0 && (
            <div className="p-6 text-center text-xs text-slate-400">
              No document records stored yet. Click <strong>Upload New Evidence</strong> above to upload a certificate, medical, or passport record to your private vault.
            </div>
          )}
          {documents.map((doc) => (
            <div key={doc.id} className="p-4 hover:bg-slate-800/30 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 shrink-0">
                  <FileText className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-white">{doc.title}</h4>
                    {doc.isSensitive && (
                      <span className="text-[10px] text-amber-400 flex items-center gap-1 font-mono" title="Sensitive document, excluded from AI APIs">
                        <Lock className="w-3 h-3" /> PII / Encrypted
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 mt-1">
                    <span className="capitalize">Category: <strong className="text-slate-300">{doc.category}</strong></span>
                    {doc.issuingAuthority && <span>Issuer: <strong className="text-slate-300">{doc.issuingAuthority}</strong></span>}
                    {doc.fileName && (
                      <span className="font-mono text-slate-300">
                        File: {doc.fileName}
                        {doc.fileSizeBytes ? ` (${Math.round(doc.fileSizeBytes / 1024)} KB)` : ''}
                      </span>
                    )}
                    {doc.expiryDate && (
                      <span className="flex items-center gap-1 text-amber-300 font-mono">
                        <Clock className="w-3 h-3" />
                        Expires: {doc.expiryDate}
                      </span>
                    )}
                  </div>
                  {doc.reviewNotes && (
                    <div className="mt-2 text-xs p-2 bg-slate-950/80 rounded-lg border border-slate-800 text-slate-300">
                      <span className="font-semibold text-purple-300">Coach Review ({doc.reviewedBy}): </span>
                      {doc.reviewNotes}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                {doc.filePath && onOpenDocument && (
                  <button
                    type="button"
                    onClick={() => onOpenDocument(doc)}
                    className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-semibold transition"
                  >
                    View / Download
                  </button>
                )}
                {getStatusBadge(doc.verificationStatus)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">Upload Qualification / Evidence</h3>
            <p className="text-xs text-slate-400 mb-4">
              Stored directly to private bucket with SHA-256 hash generation.
            </p>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Document Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. STCW Basic Safety Certificate or ENG1 Medical"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="training">Training</option>
                    <option value="medical">Medical</option>
                    <option value="identity">Identity / Passport</option>
                    <option value="qualification">Qualification</option>
                    <option value="reference">Reference</option>
                    <option value="travel">Travel / Visa</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={newExpiryDate}
                    onChange={(e) => setNewExpiryDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Issuing Authority / Training Provider</label>
                <input
                  type="text"
                  placeholder="e.g. SSTG Cape Town / UK MCA Doctor"
                  value={newAuthority}
                  onChange={(e) => setNewAuthority(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Attach Document File (PDF, JPG, PNG, WEBP — max 15 MB)
                </label>
                <input
                  type="file"
                  accept=".pdf,application/pdf,image/jpeg,image/png,image/webp"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-600 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-white"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  {selectedFile
                    ? `Selected: ${selectedFile.name} (${Math.round(selectedFile.size / 1024)} KB) — will upload to private crew-documents bucket.`
                    : 'Optional: attach a file to upload to private Storage, or leave empty to log a claimed credential record.'}
                </p>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={isSensitive}
                    onChange={(e) => setIsSensitive(e.target.checked)}
                    className="rounded accent-emerald-500"
                  />
                  <span>Mark as sensitive PII (Isolates from any AI text processing)</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold"
                >
                  Confirm Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
