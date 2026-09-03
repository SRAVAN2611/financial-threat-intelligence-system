import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  X,
  ShieldAlert,
  PieChart,
  Store,
  Sliders,
  ReceiptText,
  FileCheck2,
  Cpu,
  ArrowRight,
} from 'lucide-react';
import { transactionService } from '../../services/transactionService';
import { vendorService } from '../../services/vendorService';
import { rulesService } from '../../services/rulesService';
import { Transaction, VendorIntelligence, AnomalyRule } from '../../types';
import { formatCurrency, getThreatCategoryLabel } from '../../utils/formatters';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [query, setQuery] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [vendors, setVendors] = useState<VendorIntelligence[]>([]);
  const [rules, setRules] = useState<AnomalyRule[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      return;
    }

    Promise.all([
      transactionService.getTransactions({}),
      vendorService.getVendors(),
      rulesService.getRules(),
    ]).then(([txRes, vList, rList]) => {
      setTransactions(txRes.transactions);
      setVendors(vList);
      setRules(rList);
    });
  }, [isOpen]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  const filteredTx = q
    ? transactions
        .filter(
          (t) =>
            t.referenceNo.toLowerCase().includes(q) ||
            t.vendorName.toLowerCase().includes(q) ||
            t.department.toLowerCase().includes(q) ||
            t.aiForensicSummary.toLowerCase().includes(q)
        )
        .slice(0, 4)
    : [];

  const filteredVendors = q
    ? vendors
        .filter(
          (v) =>
            v.name.toLowerCase().includes(q) ||
            v.taxId.toLowerCase().includes(q) ||
            v.jurisdiction.toLowerCase().includes(q)
        )
        .slice(0, 3)
    : [];

  const filteredRules = q
    ? rules
        .filter(
          (r) =>
            r.name.toLowerCase().includes(q) ||
            r.code.toLowerCase().includes(q) ||
            r.category.toLowerCase().includes(q)
        )
        .slice(0, 3)
    : [];

  const handleSelect = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4">
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/90 rounded-xl shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-800 bg-slate-950/60">
          <Search className="w-5 h-5 text-slate-400 shrink-0 mr-3" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search transactions, phantom vendors, SHA-256 hashes, AI rules..."
            className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
          />
          <kbd className="text-[10px] font-mono bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700 ml-2">
            ESC
          </kbd>
        </div>

        {/* Results Body */}
        <div className="p-3 max-h-[60vh] overflow-y-auto space-y-4">
          {!query && (
            <div className="p-4 text-xs text-slate-400 space-y-3">
              <span className="font-semibold text-slate-300 uppercase tracking-wider text-[10px]">
                Quick Platform Jumps
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleSelect('/threats')}
                  className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-950/60 hover:bg-slate-800 border border-slate-800 text-left transition-colors text-slate-200"
                >
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                  <div>
                    <p className="font-medium">Threat Detection Center</p>
                    <p className="text-[10px] text-slate-500">Live AI anomaly workbench</p>
                  </div>
                </button>
                <button
                  onClick={() => handleSelect('/budgets')}
                  className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-950/60 hover:bg-slate-800 border border-slate-800 text-left transition-colors text-slate-200"
                >
                  <PieChart className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <p className="font-medium">Budget Intelligence</p>
                    <p className="text-[10px] text-slate-500">Run-rate burn forecasts</p>
                  </div>
                </button>
                <button
                  onClick={() => handleSelect('/ledger')}
                  className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-950/60 hover:bg-slate-800 border border-slate-800 text-left transition-colors text-slate-200"
                >
                  <ReceiptText className="w-4 h-4 text-sky-400 shrink-0" />
                  <div>
                    <p className="font-medium">Forensic Ledger</p>
                    <p className="text-[10px] text-slate-500">Searchable crypto records</p>
                  </div>
                </button>
                <button
                  onClick={() => handleSelect('/vendors')}
                  className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-950/60 hover:bg-slate-800 border border-slate-800 text-left transition-colors text-slate-200"
                >
                  <Store className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <p className="font-medium">Vendor Intelligence</p>
                    <p className="text-[10px] text-slate-500">Ghost scorecards & PEP checks</p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Transactions Matches */}
          {filteredTx.length > 0 && (
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2 mb-1 block">
                Transactions ({filteredTx.length})
              </span>
              <div className="space-y-1">
                {filteredTx.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => handleSelect(`/ledger?ref=${t.referenceNo}`)}
                    className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-800/80 cursor-pointer text-xs transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <ReceiptText className="w-4 h-4 text-sky-400 shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium text-slate-200 truncate">
                          {t.referenceNo} • <span className="text-slate-400">{t.vendorName}</span>
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">{t.department}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-mono font-bold text-slate-100 block">
                        {formatCurrency(t.amount)}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">{t.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Vendors Matches */}
          {filteredVendors.length > 0 && (
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2 mb-1 block">
                Vendors ({filteredVendors.length})
              </span>
              <div className="space-y-1">
                {filteredVendors.map((v) => (
                  <div
                    key={v.id}
                    onClick={() => handleSelect(`/vendors?search=${encodeURIComponent(v.name)}`)}
                    className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-800/80 cursor-pointer text-xs transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Store className="w-4 h-4 text-amber-400 shrink-0" />
                      <div>
                        <p className="font-medium text-slate-200">{v.name}</p>
                        <p className="text-[11px] text-slate-400 font-mono">
                          {v.taxId} • {v.jurisdiction}
                        </p>
                      </div>
                    </div>
                    <span className="font-mono text-xs text-rose-400">
                      Risk: {v.riskScore}/100
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rules Matches */}
          {filteredRules.length > 0 && (
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2 mb-1 block">
                Anomaly Rules ({filteredRules.length})
              </span>
              <div className="space-y-1">
                {filteredRules.map((r) => (
                  <div
                    key={r.id}
                    onClick={() => handleSelect('/rules')}
                    className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-800/80 cursor-pointer text-xs transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Sliders className="w-4 h-4 text-emerald-400 shrink-0" />
                      <div>
                        <p className="font-medium text-slate-200">{r.name}</p>
                        <p className="text-[11px] text-slate-400 font-mono">{r.code}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {r.action}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {query &&
            filteredTx.length === 0 &&
            filteredVendors.length === 0 &&
            filteredRules.length === 0 && (
              <div className="p-8 text-center text-xs text-slate-500">
                No matching financial entities found for "{query}".
              </div>
            )}
        </div>
      </div>
    </div>
  );
};
