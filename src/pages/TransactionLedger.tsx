import React, { useState, useEffect } from 'react';
import {
  ReceiptText,
  Search,
  Filter,
  Download,
  Eye,
  Key,
  ShieldCheck,
  Ban,
  CheckCircle2,
  FileSpreadsheet,
  Plus,
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { DataTable, Column } from '../components/common/DataTable';
import { RiskBadge } from '../components/common/RiskBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import { SearchBar } from '../components/common/SearchBar';
import { FilterBar } from '../components/common/FilterBar';
import { ForensicDetailDrawer } from '../components/common/ForensicDetailDrawer';
import { transactionService } from '../services/transactionService';
import { Transaction, RiskLevel, TransactionStatus } from '../types';
import { Modal } from '../components/common/Modal';
import {
  formatCurrency,
  formatDateTime,
  truncateHash,
  exportToCSV,
} from '../utils/formatters';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { useLocation } from 'react-router-dom';


export const TransactionLedger: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useNotification();
  const location = useLocation();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Selected Transaction Drawer
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Expenditure Modal Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Cloud Infrastructure & Compute');
  const [deptCode, setDeptCode] = useState('ENG-01');
  const [description, setDescription] = useState('');
  const [docRef, setDocRef] = useState('');
  const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role === 'DEPARTMENT_HEAD' && user.department) {
      setDeptCode(user.department);
    }
  }, [user]);

  const handleAddExpenditure = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setFormError('Please enter a valid amount greater than 0.');
      return;
    }

    if (!description.trim()) {
      setFormError('Please provide a specific vendor description.');
      return;
    }

    if (!docRef.trim()) {
      setFormError('Please include a statutory document reference key.');
      return;
    }

    setIsSaving(true);
    try {
      const activeDept = user?.role === 'DEPARTMENT_HEAD' ? (user.department || deptCode) : deptCode;
      await transactionService.createExpenditure({
        amount: numAmount,
        category,
        description,
        transactionDate: new Date(txDate).toISOString(),
        documentReference: docRef,
        departmentId: activeDept || 'ENG-01',
      });

      addToast({
        title: 'Expenditure Authorized',
        message: `Authorized purchase ledger entry for ₹${numAmount.toLocaleString()} INR.`,
        type: 'success',
      });

      setIsModalOpen(false);
      // Reset values
      setAmount('');
      setDescription('');
      setDocRef('');
      loadData();
    } catch (e: any) {
      setFormError(e.message || 'Transaction submission denied.');
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const ref = params.get('ref');
    if (ref) {
      setSearch(ref);
    }
  }, [location.search]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await transactionService.getTransactions({
        search,
        department: departmentFilter,
        riskLevel: riskFilter as any,
        status: statusFilter as any,
      });
      setTransactions(res.transactions);
      setTotalCount(res.total);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, departmentFilter, riskFilter, statusFilter]);

  const handleExportCSV = () => {
    const exportData = transactions.map((t) => ({
      Reference: t.referenceNo,
      Timestamp: t.timestamp,
      FiscalYear: t.fiscalYear,
      Department: t.department,
      Vendor: t.vendorName,
      Amount_INR: t.amount,
      Currency: t.currency,
      Status: t.status,
      RiskLevel: t.riskLevel,
      RiskScore: t.riskScore,
      PaymentMethod: t.paymentMethod,
      DestinationAccount: t.destinationAccount,
      SHA256: t.sha256Hash,
      Approver: t.approver,
    }));
    exportToCSV(exportData, `Sentinel_Forensic_Ledger_FY2026_27_${new Date().toISOString().split('T')[0]}`);
    addToast({
      title: 'Ledger Exported',
      message: `Downloaded CSV containing ${transactions.length} verified FY 2026–27 records.`,
      type: 'success',
    });
  };

  const columns: Column<Transaction>[] = [
    {
      key: 'referenceNo',
      header: 'Reference / Hash Stamp',
      render: (row) => (
        <div>
          <span className="font-mono font-semibold text-slate-100 block">{row.referenceNo}</span>
          <span className="font-mono text-[10px] text-sky-400 flex items-center gap-1">
            <Key className="w-2.5 h-2.5" />
            {truncateHash(row.sha256Hash, 5, 5)}
          </span>
        </div>
      ),
      sortable: true,
      width: '190px',
    },
    {
      key: 'timestamp',
      header: 'Timestamp',
      render: (row) => (
        <span className="text-[11px] font-mono text-slate-400">
          {formatDateTime(row.timestamp)}
        </span>
      ),
      sortable: true,
      width: '140px',
    },
    {
      key: 'department',
      header: 'Department',
      render: (row) => (
        <span className="text-slate-300 font-medium">{row.department}</span>
      ),
      sortable: true,
    },
    {
      key: 'vendorName',
      header: 'Vendor / Beneficiary',
      render: (row) => (
        <div>
          <span className="font-medium text-slate-200 block">{row.vendorName}</span>
          <span className="text-[11px] text-slate-500 font-mono">{row.category}</span>
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
      header: 'Details',
      render: (row) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedTx(row);
            setIsDrawerOpen(true);
          }}
          className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          title="Inspect Record"
        >
          <Eye className="w-4 h-4" />
        </button>
      ),
      align: 'right',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Forensic Drawer */}
      <ForensicDetailDrawer
        transaction={selectedTx}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onStatusUpdated={() => loadData()}
      />

      {/* Page Header */}
      <PageHeader
        title="Forensic Financial Ledger"
        subtitle="Immutable, cryptographically stamped transaction ledger with real-time Sentinel AI anomaly tagging for FY 2026–27."
        breadcrumbs={[{ label: 'Forensic Ledger' }]}
        badge={
          <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            FY 2026–27 AUDIT VERIFIED
          </span>
        }
        actions={
          <div className="flex items-center gap-2">
            {(user?.role === 'ADMIN' || user?.role === 'FINANCE_OFFICER' || user?.role === 'DEPARTMENT_HEAD') && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-950/20 border border-emerald-500 transition-colors cursor-pointer animate-pulse-subtle"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Expenditure</span>
              </button>
            )}
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Verified CSV</span>
            </button>
          </div>
        }
      />

      {/* Filter and Search Bar */}
      <div className="enterprise-card p-4 space-y-3">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by reference ID, vendor, department, or SHA-256 stamp..."
        />

        <FilterBar
          filters={[
            {
              key: 'department',
              label: 'Department',
              value: departmentFilter,
              onChange: setDepartmentFilter,
              options: [
                { value: 'ALL', label: 'All Departments' },
                { value: 'ENG-01', label: 'Engineering (ENG-01)' },
                { value: 'FIN-04', label: 'Finance & Treasury (FIN-04)' },
                { value: 'MKT-02', label: 'Marketing (MKT-02)' },
                { value: 'OPS-03', label: 'Operations (OPS-03)' },
                { value: 'SEC-05', label: 'Cybersecurity (SEC-05)' },
                { value: 'HR-06', label: 'Human Resources (HR-06)' },
              ],
            },
            {
              key: 'risk',
              label: 'Risk Level',
              value: riskFilter,
              onChange: setRiskFilter,
              options: [
                { value: 'ALL', label: 'All Risk Levels' },
                { value: 'CRITICAL', label: 'Critical' },
                { value: 'HIGH', label: 'High' },
                { value: 'MEDIUM', label: 'Medium' },
                { value: 'LOW', label: 'Low' },
              ],
            },
            {
              key: 'status',
              label: 'Status',
              value: statusFilter,
              onChange: setStatusFilter,
              options: [
                { value: 'ALL', label: 'All Statuses' },
                { value: 'APPROVED', label: 'Approved' },
                { value: 'QUARANTINED', label: 'Quarantined' },
                { value: 'FLAGGED', label: 'Flagged' },
                { value: 'UNDER_REVIEW', label: 'Under Review' },
                { value: 'WHITELISTED', label: 'Whitelisted' },
              ],
            },
          ]}
          onReset={() => {
            setSearch('');
            setDepartmentFilter('ALL');
            setRiskFilter('ALL');
            setStatusFilter('ALL');
          }}
        />
      </div>

      {/* Main Data Table */}
      <DataTable<Transaction>
        data={transactions}
        columns={columns}
        keyExtractor={(t) => t.id}
        loading={loading}
        onRowClick={(row) => {
          setSelectedTx(row);
          setIsDrawerOpen(true);
        }}
        pageSize={10}
        emptyTitle="No Ledger Entries Found"
        emptyMessage="Try adjusting your search criteria or resetting filters."
      />

      {/* Create Expenditure Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Authorize New Expenditure"
        subtitle="Post a validated financial ledger transaction. System engines will evaluate overspending anomalies and security risk factors post-submission."
        maxWidth="lg"
      >
        <form onSubmit={handleAddExpenditure} className="space-y-4 pt-2">
          {formError && (
            <div className="p-3 bg-red-950/30 border border-red-500/30 rounded-lg text-red-400 text-xs font-mono">
              [VIOLATION ERROR] {formError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider font-mono">
                Transaction Amount (INR) *
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 1500000 (15 Lakhs)"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider font-mono">
                Document Reference No *
              </label>
              <input
                type="text"
                value={docRef}
                onChange={(e) => setDocRef(e.target.value)}
                placeholder="e.g. INV-AWS-88939"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider font-mono">
                Department Code *
              </label>
              <select
                value={deptCode}
                onChange={(e) => setDeptCode(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
                disabled={user?.role === 'DEPARTMENT_HEAD'}
              >
                <option value="ENG-01">Engineering & Infrastructure (ENG-01)</option>
                <option value="MKT-02">Global Marketing & Brand (MKT-02)</option>
                <option value="OPS-03">Corporate Operations (OPS-03)</option>
                <option value="FIN-04">Finance & Treasury (FIN-04)</option>
                <option value="SEC-05">Cybersecurity & Controls (SEC-05)</option>
                <option value="HR-06">People Operations (HR-06)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider font-mono">
                Budget Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
              >
                <option value="Cloud Infrastructure & Compute">Cloud Infrastructure & Compute</option>
                <option value="Global Advertising">Global Advertising</option>
                <option value="Corporate Logistics">Corporate Logistics</option>
                <option value="Enterprise Core Software">Enterprise Core Software</option>
                <option value="IDS/IPS Cybersecurity Retainers">IDS/IPS Cybersecurity Retainers</option>
                <option value="Global Talent Acquisition">Global Talent Acquisition</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider font-mono">
                Vendor Description Details *
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. AWS Compute Engine - Q3 Data Pipeline Ingestion"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider font-mono">
                Transaction Posting Date
              </label>
              <input
                type="date"
                value={txDate}
                onChange={(e) => setTxDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-950/20 border border-emerald-500 disabled:opacity-50 transition-colors cursor-pointer"
            >
              {isSaving ? 'Cryptographic Stamping...' : 'Authorize Transaction'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
