import React, { useState, useEffect } from 'react';
import {
  Store,
  Search,
  ShieldCheck,
  AlertTriangle,
  Ban,
  Building2,
  Globe,
  RotateCcw,
  ExternalLink,
  History,
  CheckCircle2,
  AlertOctagon,
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { DataTable, Column } from '../components/common/DataTable';
import { RiskBadge } from '../components/common/RiskBadge';
import { SearchBar } from '../components/common/SearchBar';
import { Modal } from '../components/common/Modal';
import { Drawer } from '../components/common/Drawer';
import { vendorService } from '../services/vendorService';
import { VendorIntelligence } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { useLocation } from 'react-router-dom';

export const VendorIntelligencePage: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const { addToast } = useNotification();
  const location = useLocation();

  const [vendors, setVendors] = useState<VendorIntelligence[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Selected Vendor Detail Drawer
  const [selectedVendor, setSelectedVendor] = useState<VendorIntelligence | null>(null);

  // Status Change Modal
  const [statusModalVendor, setStatusModalVendor] = useState<VendorIntelligence | null>(null);
  const [newStatus, setNewStatus] = useState<VendorIntelligence['status']>('VERIFIED');
  const [statusReason, setStatusReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const s = params.get('search');
    if (s) setSearch(s);
  }, [location.search]);

  const loadData = async () => {
    setLoading(true);
    try {
      const list = await vendorService.getVendors(search, statusFilter);
      setVendors(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, statusFilter]);

  const handleOpenStatusModal = (vendor: VendorIntelligence, e: React.MouseEvent) => {
    e.stopPropagation();
    setStatusModalVendor(vendor);
    setNewStatus(vendor.status);
    setStatusReason('');
  };

  const handleSaveStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusModalVendor || !user) return;
    setIsSubmitting(true);
    try {
      await vendorService.updateVendorStatus(
        statusModalVendor.id,
        newStatus,
        statusReason || 'Corporate statutory compliance review',
        user.name
      );
      addToast({
        title: 'Vendor Status Updated',
        message: `${statusModalVendor.name} adjusted to ${newStatus}.`,
        type: newStatus === 'SUSPENDED' ? 'error' : 'success',
      });
      setStatusModalVendor(null);
      loadData();
    } catch (err: any) {
      addToast({
        title: 'Update Failed',
        message: err.message,
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: Column<VendorIntelligence>[] = [
    {
      key: 'name',
      header: 'Vendor Name & Category',
      render: (row) => (
        <div>
          <span className="font-semibold text-slate-100 block">{row.name}</span>
          <span className="text-[11px] text-slate-400">{row.category}</span>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'jurisdiction',
      header: 'Tax ID & Jurisdiction',
      render: (row) => (
        <div>
          <span className="font-mono text-xs text-slate-300 block">{row.taxId}</span>
          <span className="text-[11px] text-slate-500">{row.jurisdiction}</span>
        </div>
      ),
    },
    {
      key: 'ghostCompanyProbability',
      header: 'Vendor Risk Index',
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              style={{ width: `${row.ghostCompanyProbability}%` }}
              className={`h-full ${
                row.ghostCompanyProbability > 70
                  ? 'bg-rose-500'
                  : row.ghostCompanyProbability > 30
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
            />
          </div>
          <span
            className={`font-mono text-xs font-bold ${
              row.ghostCompanyProbability > 70
                ? 'text-rose-400'
                : row.ghostCompanyProbability > 30
                ? 'text-amber-400'
                : 'text-emerald-400'
            }`}
          >
            {row.ghostCompanyProbability}%
          </span>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'sanctionsCheckStatus',
      header: 'Regulatory Watch / PEP',
      render: (row) => (
        <div className="space-y-0.5">
          <span
            className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
              row.sanctionsCheckStatus === 'SANCTIONED'
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                : row.sanctionsCheckStatus === 'POTENTIAL_MATCH'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
            }`}
          >
            {row.sanctionsCheckStatus}
          </span>
          {row.pepMatch && (
            <span className="block text-[10px] text-rose-400 font-mono">⚠️ PEP Match</span>
          )}
        </div>
      ),
    },
    {
      key: 'totalVolumeYTD',
      header: 'Volume YTD (₹)',
      render: (row) => (
        <span className="font-mono font-bold text-slate-100">
          {formatCurrency(row.totalVolumeYTD)}
        </span>
      ),
      sortable: true,
      align: 'right',
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <span
          className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded border ${
            row.status === 'VERIFIED'
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : row.status === 'FLAGGED'
              ? 'bg-orange-500/15 text-orange-400 border-orange-500/40'
              : row.status === 'SUSPENDED'
              ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
          }`}
        >
          {row.status}
        </span>
      ),
      sortable: true,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setSelectedVendor(row)}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors cursor-pointer"
          >
            Scorecard
          </button>
          {hasPermission('canQuarantineTransactions') && (
            <button
              onClick={(e) => handleOpenStatusModal(row, e)}
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              title="Change Status"
            >
              <ShieldCheck className="w-4 h-4 text-sky-400" />
            </button>
          )}
        </div>
      ),
      align: 'right',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Status Change Modal */}
      <Modal
        isOpen={!!statusModalVendor}
        onClose={() => setStatusModalVendor(null)}
        title={`Modify Risk Status: ${statusModalVendor?.name}`}
        subtitle="Vendor Integrity Verification Enforcement (FY 2026–27)"
        maxWidth="md"
        footer={
          <>
            <button
              type="button"
              onClick={() => setStatusModalVendor(null)}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveStatus}
              disabled={isSubmitting}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold shadow-lg transition-colors cursor-pointer"
            >
              {isSubmitting ? 'Updating...' : 'Commit Status'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSaveStatus} className="space-y-4 py-2 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              New Vendor Compliance Status
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-sky-500"
            >
              <option value="VERIFIED">VERIFIED (Cleared for automated payments)</option>
              <option value="WATCHLIST">WATCHLIST (Requires dual sign-off)</option>
              <option value="FLAGGED">FLAGGED (AI Anomaly Under Review)</option>
              <option value="SUSPENDED">SUSPENDED (Immediate Treasury Wire Hold)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Audit Reason & Justification
            </label>
            <textarea
              rows={3}
              required
              value={statusReason}
              onChange={(e) => setStatusReason(e.target.value)}
              placeholder="e.g. Beneficiary altered to foreign non-FATF jurisdiction with suspicious documentation."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>
        </form>
      </Modal>

      {/* Vendor Detail Drawer */}
      <Drawer
        isOpen={!!selectedVendor}
        onClose={() => setSelectedVendor(null)}
        title={selectedVendor?.name || 'Vendor Profile'}
        subtitle={`Tax ID: ${selectedVendor?.taxId} • FY 2026–27`}
        width="xl"
      >
        {selectedVendor && (
          <div className="space-y-6 text-xs">
            {/* Risk Card */}
            <div className="enterprise-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-300 uppercase tracking-wider text-[11px]">
                  Vendor Threat Scorecard
                </span>
                <RiskBadge level={selectedVendor.riskLevel} score={selectedVendor.riskScore} />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                <div>
                  <span className="text-slate-500">Unverified Shell Likelihood:</span>
                  <p className="font-mono font-bold text-slate-200">
                    {selectedVendor.ghostCompanyProbability}%
                  </p>
                </div>
                <div>
                  <span className="text-slate-500">Regulatory Watch Status:</span>
                  <p className="font-mono text-slate-200">{selectedVendor.sanctionsCheckStatus}</p>
                </div>
                <div>
                  <span className="text-slate-500">Incorporation Date:</span>
                  <p className="text-slate-200">{formatDate(selectedVendor.incorporationDate)}</p>
                </div>
                <div>
                  <span className="text-slate-500">Last Verified Audit:</span>
                  <p className="text-slate-200">{formatDate(selectedVendor.lastAuditDate)}</p>
                </div>
              </div>
            </div>

            {/* Banking Alteration History */}
            <div className="enterprise-card p-4 space-y-3">
              <h4 className="font-semibold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-sky-400" />
                <span>Recent Beneficiary / Routing Alterations</span>
              </h4>

              {selectedVendor.recentAlterations && selectedVendor.recentAlterations.length > 0 ? (
                <div className="space-y-2">
                  {selectedVendor.recentAlterations.map((alt, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded bg-slate-950 border border-slate-800 space-y-1 font-mono text-[11px]"
                    >
                      <div className="flex items-center justify-between text-rose-400 font-bold">
                        <span>🚨 {alt.field}</span>
                        <span>{formatDate(alt.date)}</span>
                      </div>
                      <div className="text-slate-400">
                        Old: <span className="text-slate-300 line-through">{alt.oldValue}</span>
                      </div>
                      <div className="text-slate-200">
                        New: <span className="text-sky-400 font-bold">{alt.newValue}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 italic">No alterations in the last 180 days.</p>
              )}
            </div>
          </div>
        )}
      </Drawer>

      {/* Page Header */}
      <PageHeader
        title="Vendor Risk & Entity Verification Intelligence"
        subtitle="Continuous screening for unverified shell entities, bank routing alterations, and PEP exposure for FY 2026–27."
        breadcrumbs={[{ label: 'Vendor Intelligence' }]}
        badge={
          <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-sky-500/10 text-sky-400 border border-sky-500/30">
            FY 2026–27 REGISTRY
          </span>
        }
      />

      {/* Controls */}
      <div className="enterprise-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search vendor name, tax ID (GSTIN/PAN), or jurisdiction..."
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-xs bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 cursor-pointer"
        >
          <option value="ALL">All Vendor Statuses</option>
          <option value="VERIFIED">Verified</option>
          <option value="WATCHLIST">Watchlist</option>
          <option value="FLAGGED">Flagged</option>
          <option value="SUSPENDED">Suspended</option>
        </select>
      </div>

      {/* Table */}
      <DataTable<VendorIntelligence>
        data={vendors}
        columns={columns}
        keyExtractor={(v) => v.id}
        loading={loading}
        onRowClick={(row) => setSelectedVendor(row)}
        pageSize={8}
        emptyTitle="No Vendors Found"
      />
    </div>
  );
};
