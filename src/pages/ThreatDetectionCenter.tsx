import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Search,
  Filter,
  Ban,
  ShieldCheck,
  Eye,
  BrainCircuit,
  Fingerprint,
  RotateCcw,
  Download,
  AlertOctagon,
  Layers,
  Sparkles,
  Zap,
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { DataTable, Column } from '../components/common/DataTable';
import { RiskBadge } from '../components/common/RiskBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import { SeverityBadge } from '../components/common/SeverityBadge';
import { SearchBar } from '../components/common/SearchBar';
import { FilterBar } from '../components/common/FilterBar';
import { ForensicDetailDrawer } from '../components/common/ForensicDetailDrawer';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { KPICard } from '../components/common/KPICard';
import { transactionService } from '../services/transactionService';
import { Transaction, RiskLevel, TransactionStatus, ThreatCategory } from '../types';
import { formatCurrency, formatDateTime, getThreatCategoryLabel } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

export const ThreatDetectionCenter: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const { addToast } = useNotification();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [confirmQuarantineOpen, setConfirmQuarantineOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await transactionService.getTransactions({
        search,
        riskLevel: riskFilter as any,
        status: statusFilter as any,
        threatCategory: categoryFilter,
      });
      setTransactions(res.transactions);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, riskFilter, statusFilter, categoryFilter]);

  const handleOpenTransaction = (tx: Transaction) => {
    setSelectedTx(tx);
    setIsDrawerOpen(true);
  };

  const handleBatchQuarantine = async () => {
    if (!user || selectedIds.length === 0) return;
    try {
      const count = await transactionService.batchQuarantine(
        selectedIds,
        'Batch quarantine executed by Sentinel Forensic Officer',
        user.name
      );
      addToast({
        title: 'Batch Quarantine Enforced',
        message: `${count} high-risk outbound transfers isolated and placed on hold.`,
        type: 'error',
      });
      setSelectedIds([]);
      setConfirmQuarantineOpen(false);
      loadData();
    } catch (e: any) {
      addToast({
        title: 'Action Failed',
        message: e.message,
        type: 'error',
      });
    }
  };

  const columns: Column<Transaction>[] = [
    {
      key: 'referenceNo',
      header: 'Reference / Timestamp',
      render: (row) => (
        <div>
          <span className="font-mono font-medium text-slate-100 block">{row.referenceNo}</span>
          <span className="text-[11px] font-mono text-slate-500">
            {formatDateTime(row.timestamp)}
          </span>
        </div>
      ),
      sortable: true,
      width: '180px',
    },
    {
      key: 'threatCategory',
      header: 'Anomaly Vector / Flag',
      render: (row) => (
        <div className="space-y-1">
          <span className="font-medium text-slate-200 block">
            {row.threatCategory ? getThreatCategoryLabel(row.threatCategory) : 'Standard Outlier'}
          </span>
          {row.threatFlags && row.threatFlags.length > 0 && (
            <span className="text-[10px] text-rose-400 font-mono line-clamp-1">
              🚨 {row.threatFlags[0]}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'vendorName',
      header: 'Vendor & Department',
      render: (row) => (
        <div>
          <span className="font-medium text-slate-200 block">{row.vendorName}</span>
          <span className="text-[11px] text-slate-400">{row.department}</span>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'amount',
      header: 'Amount (₹)',
      render: (row) => (
        <span className="font-mono font-bold text-slate-100">
          {formatCurrency(row.amount)}
        </span>
      ),
      sortable: true,
      align: 'right',
    },
    {
      key: 'riskScore',
      header: 'Threat Score',
      render: (row) => (
        <div className="flex justify-center">
          <RiskBadge level={row.riskLevel} score={row.riskScore} size="sm" />
        </div>
      ),
      sortable: true,
      align: 'center',
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} size="sm" />,
      sortable: true,
    },
    {
      key: 'actions',
      header: 'Forensic Actions',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => handleOpenTransaction(row)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-sky-400" />
            <span>Forensics</span>
          </button>
        </div>
      ),
      align: 'right',
    },
  ];

  const totalFlaggedAmount = transactions
    .filter((t) => t.status === 'FLAGGED' || t.status === 'QUARANTINED')
    .reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-6">
      {/* Forensic Detail Drawer */}
      <ForensicDetailDrawer
        transaction={selectedTx}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onStatusUpdated={() => loadData()}
      />

      {/* Confirm Quarantine Dialog */}
      <ConfirmDialog
        isOpen={confirmQuarantineOpen}
        onClose={() => setConfirmQuarantineOpen(false)}
        onConfirm={handleBatchQuarantine}
        title={`Enforce Batch Quarantine on ${selectedIds.length} Transfers?`}
        message="This action will immediately halt outbound wire processing at the banking gateway and dispatch high-priority internal forensic review tickets."
        confirmText="Confirm Immediate Quarantine"
        isDestructive={true}
      />

      {/* Page Header */}
      <PageHeader
        title="AI Anomaly & Threat Detection Center"
        subtitle="Forensic triage workbench for statistical outliers, high-risk vendors, duplicate invoices, and smurfing patterns (FY 2026–27)."
        badge={
          <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-rose-500/10 text-rose-400 border border-rose-500/30">
            {transactions.filter((t) => t.status === 'QUARANTINED').length} ACTIVE QUARANTINES
          </span>
        }
        actions={
          <>
            {selectedIds.length > 0 && hasPermission('canQuarantineTransactions') && (
              <button
                onClick={() => setConfirmQuarantineOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-950/50 transition-colors cursor-pointer"
              >
                <Ban className="w-3.5 h-3.5" />
                <span>Quarantine Selected ({selectedIds.length})</span>
              </button>
            )}
            <button
              onClick={loadData}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Refresh Workbench</span>
            </button>
          </>
        }
      />

      {/* Forensic Top KPI Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard
          title="Active Interceptions"
          value={`${transactions.filter((t) => t.isFlaggedBySentinel).length} Incidents`}
          subtext="Under active Sentinel quarantine"
          icon={ShieldAlert}
          accentColor="rose"
        />
        <KPICard
          title="Flagged Capital Exposure"
          value={formatCurrency(totalFlaggedAmount)}
          subtext="Aggregate value of suspicious transfers"
          icon={AlertOctagon}
          accentColor="orange"
        />
        <KPICard
          title="Ensemble Confidence"
          value="96.4%"
          subtext="Explainable Risk Analysis Classifier"
          icon={BrainCircuit}
          accentColor="emerald"
        />
      </div>

      {/* Controls & Filter Bar */}
      <div className="enterprise-card p-4 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search reference #, vendor name, department, or AI forensic rationale..."
          />
        </div>

        <FilterBar
          filters={[
            {
              key: 'risk',
              label: 'Risk Level',
              value: riskFilter,
              onChange: setRiskFilter,
              options: [
                { value: 'ALL', label: 'All Levels' },
                { value: 'CRITICAL', label: 'Critical (>85)' },
                { value: 'HIGH', label: 'High (65-84)' },
                { value: 'MEDIUM', label: 'Medium (35-64)' },
                { value: 'LOW', label: 'Low (<35)' },
              ],
            },
            {
              key: 'status',
              label: 'Status',
              value: statusFilter,
              onChange: setStatusFilter,
              options: [
                { value: 'ALL', label: 'All Statuses' },
                { value: 'QUARANTINED', label: 'Quarantined' },
                { value: 'FLAGGED', label: 'Flagged' },
                { value: 'UNDER_REVIEW', label: 'Under Review' },
                { value: 'APPROVED', label: 'Approved' },
                { value: 'WHITELISTED', label: 'Whitelisted' },
              ],
            },
            {
              key: 'category',
              label: 'Threat Vector',
              value: categoryFilter,
              onChange: setCategoryFilter,
              options: [
                { value: 'ALL', label: 'All Vectors' },
                { value: 'SANCTIONS_MATCH', label: 'Regulatory Watchlist' },
                { value: 'SPLIT_TRANSACTION_SMURFING', label: 'Approval Smurfing' },
                { value: 'OFF_HOURS_TRANSFER', label: 'Off-Hours Transfer' },
                { value: 'DUPLICATE_INVOICE', label: 'Duplicate Invoice' },
                { value: 'BENFORD_ANOMALY', label: "Benford's Law Deviation" },
              ],
            },
          ]}
          onReset={() => {
            setSearch('');
            setRiskFilter('ALL');
            setStatusFilter('ALL');
            setCategoryFilter('ALL');
          }}
        />
      </div>

      {/* Main Table */}
      <DataTable<Transaction>
        data={transactions}
        columns={columns}
        keyExtractor={(t) => t.id}
        loading={loading}
        selectable={hasPermission('canQuarantineTransactions')}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        onRowClick={handleOpenTransaction}
        pageSize={8}
        emptyTitle="No Threat Outliers Found"
        emptyMessage="No financial transactions match your current search and threat filter criteria."
      />
    </div>
  );
};
