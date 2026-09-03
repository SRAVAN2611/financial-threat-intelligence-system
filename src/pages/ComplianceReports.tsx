import React, { useState, useEffect } from 'react';
import {
  Send,
  CheckCircle2,
  Printer,
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { Modal } from '../components/common/Modal';
import { SeverityBadge } from '../components/common/SeverityBadge';
import { complianceService } from '../services/complianceService';
import { ComplianceStandard } from '../types';
import { formatDate } from '../utils/formatters';
import { useNotification } from '../context/NotificationContext';

export const ComplianceReports: React.FC = () => {
  const { addToast } = useNotification();

  const [standards, setStandards] = useState<ComplianceStandard[]>([]);
  const [loading, setLoading] = useState(true);

  // SAR Filing Modal
  const [sarModalOpen, setSarModalOpen] = useState(false);
  const [incidentId, setIncidentId] = useState('TXN-2026-0402-99481 (Kestrel Offshore ₹4,85,00,000)');
  const [narrative, setNarrative] = useState(
    'Sentinel AI intercepted outbound transfer message matching regulatory watchlist criteria. Destination account routed to unverified overseas entity without supporting procurement contracts, triggering internal financial control risk hold.'
  );
  const [sarPacket, setSarPacket] = useState<Record<string, any> | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const list = await complianceService.getStandards();
      setStandards(list || []);
    } catch (e) {
      console.error(e);
      setStandards([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleGenerateSAR = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      const packet = await complianceService.generateSARPacket(incidentId, narrative);
      setSarPacket(packet);
      addToast({
        title: 'Audit Packet Compiled & Signed',
        message: `Filing ${packet.sarFilingId} prepared for internal corporate statutory review.`,
        type: 'success',
      });
    } catch (err: any) {
      addToast({
        title: 'Generation Failed',
        message: err.message,
        type: 'error',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* SAR Filing Generator Modal */}
      <Modal
        isOpen={sarModalOpen}
        onClose={() => {
          setSarModalOpen(false);
          setSarPacket(null);
        }}
        title="Suspicious Activity Investigation Report"
        subtitle="Compliance-Oriented Internal Financial Controls (FY 2026–27)"
        maxWidth="lg"
      >
        {!sarPacket ? (
          <form onSubmit={handleGenerateSAR} className="space-y-4 py-2 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Target Incident Reference
              </label>
              <input
                type="text"
                required
                value={incidentId}
                onChange={(e) => setIncidentId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 font-mono focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Forensic Suspicious Activity Narrative
              </label>
              <textarea
                rows={5}
                required
                value={narrative}
                onChange={(e) => setNarrative(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 font-sans leading-relaxed"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSarModalOpen(false)}
                className="px-3 py-1.5 text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isGenerating}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-semibold transition-colors cursor-pointer"
              >
                {isGenerating ? 'Compiling Cryptographic Packet...' : 'Generate & Stamp Audit Document'}
              </button>
            </div>
          </form>
        ) : (
          <div className="py-2 space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/40 text-emerald-300 flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 shrink-0" />
              <div>
                <p className="font-bold">Audit Packet Generated & Cryptographically Signed</p>
                <p className="text-[11px] font-mono">Filing ID: {sarPacket.sarFilingId}</p>
              </div>
            </div>

            <div className="enterprise-card p-4 space-y-2 font-mono text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500">Timestamp:</span>
                <span className="text-slate-200">{sarPacket.filingTimestamp}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className="text-sky-400 font-bold">{sarPacket.status}</span>
              </div>
              <div>
                <span className="text-slate-500 block mb-0.5">SHA-256 Digital Signature:</span>
                <span className="text-slate-300 break-all bg-slate-950 p-2 rounded block border border-slate-800">
                  {sarPacket.sha256Verification}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Official PDF</span>
              </button>
              <button
                onClick={() => setSarModalOpen(false)}
                className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-semibold cursor-pointer"
              >
                Close Gateway
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Page Header */}
      <PageHeader
        title="Compliance Assurance & Regulatory Reporting"
        subtitle="Continuous Internal Financial Controls (IFC), Companies Act 2013, ISO 27001 ISMS validation, and SOX 404 audit trail frameworks."
        breadcrumbs={[{ label: 'Compliance Reports' }]}
        badge={
          <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            FY 2026–27 AUDIT COMPLIANT
          </span>
        }
        actions={
          <button
            onClick={() => {
              setSarPacket(null);
              setSarModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-950/40 transition-colors cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Generate IFC Incident Packet</span>
          </button>
        }
      />

      {/* Standards List */}
      <div className="space-y-6">
        {standards.map((std) => {
          const findingsList = std.findings || [];
          const auditDateStr = std.lastAuditDate ? formatDate(std.lastAuditDate) : '2026-03-01';
          return (
            <div key={std.id} className="enterprise-card p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-sky-400 uppercase">
                      {std.code}
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="font-semibold text-slate-100 text-sm">{std.name}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Auditor: {std.leadAuditor || 'Internal Audit Committee'} • Last Audit: {auditDateStr}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-bold text-emerald-400">
                    {std.complianceScore || 95}% Score
                  </span>
                  <span
                    className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded border ${
                      std.status === 'COMPLIANT'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    }`}
                  >
                    {(std.status || 'COMPLIANT').replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              {/* Findings List */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider text-[11px]">
                  Active Control Findings & Automated Remediation ({findingsList.length})
                </h4>

                {findingsList.map((fnd) => (
                  <div
                    key={fnd.id}
                    className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/80 space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <SeverityBadge severity={fnd.severity} size="sm" />
                        <span className="font-mono font-semibold text-slate-200">
                          {fnd.controlId}: {fnd.title}
                        </span>
                      </div>
                    </div>
                    <p className="text-slate-400 leading-relaxed">{fnd.description}</p>
                    <div className="pt-1.5 border-t border-slate-800/60 text-[11px] text-emerald-400 font-sans flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>
                        <strong>Remediation: </strong> {fnd.remediation}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
