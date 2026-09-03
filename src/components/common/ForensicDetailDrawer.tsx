import React, { useState } from 'react';
import { Transaction } from '../../types';
import { Drawer } from './Drawer';
import { RiskBadge } from './RiskBadge';
import { StatusBadge } from './StatusBadge';
import { SeverityBadge } from './SeverityBadge';
import { Timeline } from './Timeline';
import {
  formatCurrencyDetailed,
  formatDateTime,
  getThreatCategoryLabel,
  truncateHash,
} from '../../utils/formatters';
import {
  ShieldAlert,
  ShieldCheck,
  Ban,
  BrainCircuit,
  Fingerprint,
  Building,
  CreditCard,
  FileText,
  Send,
  Lock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { transactionService } from '../../services/transactionService';

interface ForensicDetailDrawerProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdated?: (updated: Transaction) => void;
}

export const ForensicDetailDrawer: React.FC<ForensicDetailDrawerProps> = ({
  transaction,
  isOpen,
  onClose,
  onStatusUpdated,
}) => {
  const { user, hasPermission } = useAuth();
  const { addToast } = useNotification();
  const [newNote, setNewNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!transaction) return null;

  const handleAction = async (newStatus: Transaction['status'], reason: string) => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      const updated = await transactionService.updateTransactionStatus(
        transaction.id,
        newStatus,
        reason,
        user.name
      );
      addToast({
        title: `Transaction ${newStatus}`,
        message: `${transaction.referenceNo} updated by ${user.name}`,
        type: newStatus === 'QUARANTINED' ? 'error' : 'success',
      });
      if (onStatusUpdated) onStatusUpdated(updated);
    } catch (e: any) {
      addToast({
        title: 'Action Failed',
        message: e.message || 'Error modifying transaction',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim() || !user) return;
    try {
      const updated = await transactionService.addForensicNote(
        transaction.id,
        newNote,
        user.name
      );
      setNewNote('');
      addToast({
        title: 'Forensic Note Recorded',
        message: 'Cryptographic hash logged in audit trail',
        type: 'info',
      });
      if (onStatusUpdated) onStatusUpdated(updated);
    } catch (e: any) {
      addToast({
        title: 'Note Failed',
        message: e.message,
        type: 'error',
      });
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Forensic Transaction Inspection"
      subtitle={transaction.referenceNo}
      width="2xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <span className="text-[11px] text-slate-500 font-mono">
            SHA256: {truncateHash(transaction.sha256Hash, 6, 6)}
          </span>
          <div className="flex items-center gap-2">
            {hasPermission('canQuarantineTransactions') && (
              <>
                {transaction.status !== 'WHITELISTED' && (
                  <button
                    onClick={() => handleAction('WHITELISTED', 'Cleared by Forensic Investigator')}
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-medium transition-colors"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Whitelist</span>
                  </button>
                )}
                {transaction.status !== 'QUARANTINED' && (
                  <button
                    onClick={() => handleAction('QUARANTINED', 'Immediate Quarantine Enforced by Sentinel User')}
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium transition-colors shadow-lg shadow-rose-950/40"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    <span>Enforce Quarantine</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      }
    >
      {/* Risk Header Strip */}
      <div className="enterprise-card p-4 bg-slate-900/90 flex items-center justify-between gap-4">
        <div>
          <div className="text-xs text-slate-400 mb-1">Total Transaction Amount</div>
          <div className="text-2xl font-bold font-mono text-slate-100">
            {formatCurrencyDetailed(transaction.amount, transaction.currency)}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <div className="flex items-center gap-2">
            <RiskBadge level={transaction.riskLevel} score={transaction.riskScore} size="lg" />
            <StatusBadge status={transaction.status} size="md" />
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            {formatDateTime(transaction.timestamp)}
          </span>
        </div>
      </div>

      {/* AI Forensic Summary */}
      <div className="enterprise-card p-4 border-sky-500/30 bg-sky-950/10">
        <div className="flex items-center gap-2 mb-2">
          <BrainCircuit className="w-4 h-4 text-sky-400" />
          <h4 className="text-xs font-semibold text-sky-400 uppercase tracking-wider">
            SENTINEL AI Forensic Rationale ({transaction.confidenceScore}% Model Confidence)
          </h4>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          {transaction.aiForensicSummary}
        </p>

        {/* Threat Flags */}
        {transaction.threatFlags && transaction.threatFlags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {transaction.threatFlags.map((flag, idx) => (
              <span
                key={idx}
                className="text-[11px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20"
              >
                🚨 {flag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* SHAP / Explainable AI Feature Attribution */}
      {transaction.shapFactors && transaction.shapFactors.length > 0 && (
        <div className="enterprise-card p-4">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Fingerprint className="w-3.5 h-3.5 text-slate-400" />
            <span>Explainable AI (XAI) Attribution Weights</span>
          </h4>
          <div className="space-y-2.5">
            {transaction.shapFactors.map((factor, idx) => {
              const isPositive = factor.weight > 0;
              const barPercent = Math.min(100, Math.abs(factor.weight) * 100);

              return (
                <div key={idx} className="text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-slate-300 font-medium">{factor.feature}</span>
                    <span className="font-mono text-slate-400 text-[11px]">{factor.value}</span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden flex">
                    <div
                      style={{ width: `${barPercent}%` }}
                      className={`h-full ${isPositive ? 'bg-rose-500' : 'bg-emerald-500'}`}
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    {factor.description} (Impact: {isPositive ? '+' : ''}
                    {(factor.weight * 100).toFixed(0)}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Banking & Routing Metadata */}
      <div className="enterprise-card p-4 space-y-3 text-xs">
        <h4 className="font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Building className="w-3.5 h-3.5 text-slate-400" />
          <span>Payment Routing & Beneficiary Details</span>
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <span className="text-slate-500">Department:</span>
            <p className="font-medium text-slate-200">{transaction.department}</p>
          </div>
          <div>
            <span className="text-slate-500">Vendor:</span>
            <p className="font-medium text-slate-200">{transaction.vendorName}</p>
          </div>
          <div>
            <span className="text-slate-500">Payment Protocol:</span>
            <p className="font-mono text-slate-300">{transaction.paymentMethod}</p>
          </div>
          <div>
            <span className="text-slate-500">Approver / Signatory:</span>
            <p className="text-slate-300">{transaction.approver}</p>
          </div>
          <div>
            <span className="text-slate-500">Destination Account / IBAN:</span>
            <p className="font-mono text-slate-300 break-all">{transaction.destinationAccount}</p>
          </div>
          <div>
            <span className="text-slate-500">Originating Account:</span>
            <p className="font-mono text-slate-300 break-all">{transaction.originatingAccount}</p>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-400">
          <span className="text-slate-500">SHA-256 Stamp: </span>
          <span className="text-sky-400 break-all">{transaction.sha256Hash}</span>
        </div>
      </div>

      {/* Forensic Investigator Notes */}
      <div className="enterprise-card p-4 space-y-3">
        <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-slate-400" />
          <span>Forensic Investigator Notes</span>
        </h4>

        {transaction.forensicNotes && transaction.forensicNotes.length > 0 ? (
          <div className="space-y-1.5">
            {transaction.forensicNotes.map((note, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300 font-sans"
              >
                {note}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic">No investigator notes attached yet.</p>
        )}

        {/* Add Note Form */}
        <form onSubmit={handleAddNote} className="flex gap-2 pt-2">
          <input
            type="text"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add signed forensic note..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
          <button
            type="submit"
            disabled={!newNote.trim()}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium disabled:opacity-40 flex items-center gap-1 transition-colors"
          >
            <Send className="w-3 h-3" />
            <span>Add</span>
          </button>
        </form>
      </div>

      {/* Audit Trail */}
      <div className="enterprise-card p-4">
        <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-slate-400" />
          <span>Cryptographic Audit Trail</span>
        </h4>
        <Timeline events={transaction.auditTrail || []} />
      </div>
    </Drawer>
  );
};
