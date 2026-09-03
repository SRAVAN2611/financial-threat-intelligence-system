import React, { useState, useEffect } from 'react';
import {
  PieChart,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  DollarSign,
  PlusCircle,
  Sliders,
  RotateCcw,
  CheckCircle2,
  Users,
  Building,
  Info,
  Calendar,
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { KPICard } from '../components/common/KPICard';
import { ChartCard } from '../components/common/ChartCard';
import { BudgetProgress } from '../components/common/BudgetProgress';
import { RiskBadge } from '../components/common/RiskBadge';
import { Modal } from '../components/common/Modal';
import { Drawer } from '../components/common/Drawer';
import { budgetService } from '../services/budgetService';
import { DepartmentBudget } from '../types';
import { formatCurrency, formatPercent } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';

export const BudgetIntelligence: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const { addToast } = useNotification();

  const [departments, setDepartments] = useState<DepartmentBudget[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Rebalance modal state
  const [selectedDept, setSelectedDept] = useState<DepartmentBudget | null>(null);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [newAllocValue, setNewAllocValue] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Department Drill-down Drawer
  const [drilldownDept, setDrilldownDept] = useState<DepartmentBudget | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [deptList, sum] = await Promise.all([
        budgetService.getDepartments(),
        budgetService.getBudgetSummary(),
      ]);
      setDepartments(deptList);
      setSummary(sum);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdjust = (dept: DepartmentBudget, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedDept(dept);
    setNewAllocValue(dept.allocated);
    setAdjustReason('');
    setIsAdjustModalOpen(true);
  };

  const handleSaveAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDept || !user) return;
    setIsSubmitting(true);
    try {
      await budgetService.adjustBudget(
        selectedDept.id,
        newAllocValue,
        adjustReason || 'Routine FY 2026–27 Q1 Rebalancing',
        user.name
      );
      addToast({
        title: 'Budget Allocation Adjusted',
        message: `${selectedDept.name} updated to ${formatCurrency(newAllocValue)}.`,
        type: 'success',
      });
      setIsAdjustModalOpen(false);
      loadData();
    } catch (err: any) {
      addToast({
        title: 'Adjustment Failed',
        message: err.message,
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const COLORS = ['#0284c7', '#38bdf8', '#10b981', '#f59e0b', '#f97316', '#8b5cf6'];

  return (
    <div className="space-y-6">
      {/* Department Drill-down Drawer */}
      <Drawer
        isOpen={!!drilldownDept}
        onClose={() => setDrilldownDept(null)}
        title={drilldownDept?.name || 'Department Details'}
        subtitle={`Code: ${drilldownDept?.code} • Head: ${drilldownDept?.head} • FY 2026–27`}
        width="xl"
      >
        {drilldownDept && (
          <div className="space-y-6">
            {/* Header Progress */}
            <div className="enterprise-card p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                  Allocation Health (₹)
                </span>
                <RiskBadge level={drilldownDept.riskLevel} size="sm" />
              </div>
              <BudgetProgress
                allocated={drilldownDept.allocated}
                spent={drilldownDept.spent}
                committed={drilldownDept.committed}
                projectedOverspend={drilldownDept.projectedOverspend}
              />
            </div>

            {/* Category Breakdown Table */}
            <div className="enterprise-card p-4 space-y-3">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Category Expenditure Breakdown
              </h4>
              <div className="space-y-2">
                {drilldownDept.categoryBreakdown.map((cat, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded bg-slate-950/60 border border-slate-800/80 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                      />
                      <span className="text-slate-200 font-medium">{cat.category}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-slate-100 font-bold">
                        {formatCurrency(cat.amount)}
                      </span>
                      <span className="font-mono text-slate-400 text-[11px] w-12 text-right">
                        {cat.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Monthly Trend in Drawer */}
            <div className="enterprise-card p-4">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
                6-Month Burn vs Forecast (FY 2026–27)
              </h4>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={drilldownDept.monthlyHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickFormatter={(v) => `₹${(v / 10000000).toFixed(1)} Cr`}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '11px' }}
                    formatter={(v: any) => formatCurrency(Number(v))}
                  />
                  <Line type="monotone" dataKey="actual" stroke="#0284c7" strokeWidth={2} name="Actual Spend" />
                  <Line type="monotone" dataKey="forecast" stroke="#f59e0b" strokeWidth={2} strokeDasharray="4 4" name="Forecast" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </Drawer>

      {/* Adjust Budget Modal */}
      <Modal
        isOpen={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
        title={`Reallocate Budget Cap: ${selectedDept?.name}`}
        subtitle={`Department Code: ${selectedDept?.code} • FY 2026–27`}
        maxWidth="md"
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsAdjustModalOpen(false)}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveAdjustment}
              disabled={isSubmitting}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold shadow-lg transition-colors cursor-pointer"
            >
              {isSubmitting ? 'Saving...' : 'Apply Rebalance'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSaveAdjustment} className="space-y-4 py-2 text-xs">
          <div>
            <span className="text-slate-400 block mb-1">Current Allocated Cap:</span>
            <span className="text-lg font-mono font-bold text-slate-100">
              {formatCurrency(selectedDept?.allocated || 0)}
            </span>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              New Annual Allocated Budget (₹ INR)
            </label>
            <input
              type="number"
              step={1000000} // Steps of ₹10 Lakhs
              required
              value={newAllocValue}
              onChange={(e) => setNewAllocValue(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg font-mono text-sm text-slate-100 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Internal Financial Controls (IFC) Justification / Rationale
            </label>
            <textarea
              rows={3}
              required
              value={adjustReason}
              onChange={(e) => setAdjustReason(e.target.value)}
              placeholder="e.g. Q2 GPU Compute infrastructure capacity expansion approved by Board Audit Committee."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>
        </form>
      </Modal>

      {/* Page Header */}
      <PageHeader
        title="Departmental Budget Intelligence & Burn Velocity"
        subtitle="FY 2026–27 real-time multi-department run-rate tracking, committed capital analysis, and automated cap overdraft risk modeling."
        breadcrumbs={[{ label: 'Budget Intelligence' }]}
        badge={
          <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-sky-500/10 text-sky-400 border border-sky-500/30">
            FY 2026–27
          </span>
        }
        actions={
          <button
            onClick={loadData}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Sync ERP Ledger</span>
          </button>
        }
      />

      {/* KPI Cluster */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Allocated Cap"
          value={formatCurrency(summary?.totalAllocated || 430000000)}
          icon={Calendar}
          subtext="6 Corporate Departments"
          accentColor="sky"
        />
        <KPICard
          title="Total Capital Spent"
          value={formatCurrency(summary?.totalSpent || 317200000)}
          trend={{ value: 73.8, isPositiveGood: true, label: 'Burn Rate %' }}
          icon={PieChart}
          accentColor="emerald"
        />
        <KPICard
          title="Committed In-Flight"
          value={formatCurrency(summary?.totalCommitted || 62000000)}
          subtext="Pending POs & SOWs"
          icon={TrendingUp}
          accentColor="amber"
        />
        <KPICard
          title="Projected Overspend"
          value={formatCurrency(summary?.totalProjectedOverspend || 8900000)}
          icon={AlertTriangle}
          riskBadge="HIGH"
          accentColor="rose"
          subtext="Engineering & Treasury"
        />
      </div>

      {/* Departmental Allocation List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {departments.map((dept) => (
          <div
            key={dept.id}
            onClick={() => setDrilldownDept(dept)}
            className="enterprise-card p-5 cursor-pointer hover:border-slate-700 hover:bg-slate-900/60 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <span className="text-[10px] font-mono font-bold text-sky-400 uppercase tracking-wider">
                    {dept.code}
                  </span>
                  <h3 className="text-sm font-semibold text-slate-100">{dept.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Head: {dept.head}</p>
                </div>
                <RiskBadge level={dept.riskLevel} size="sm" />
              </div>

              <div className="py-2">
                <BudgetProgress
                  allocated={dept.allocated}
                  spent={dept.spent}
                  committed={dept.committed}
                  projectedOverspend={dept.projectedOverspend}
                />
              </div>
            </div>

            <div className="pt-4 mt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px]">
                {dept.activeAnomaliesCount > 0 ? (
                  <span className="text-rose-400 font-medium">
                    🚨 {dept.activeAnomaliesCount} Anomaly Flags
                  </span>
                ) : (
                  <span className="text-emerald-400 font-medium">✓ Clean Baseline</span>
                )}
              </span>

              {hasPermission('canApproveBudgets') && (
                <button
                  onClick={(e) => handleOpenAdjust(dept, e)}
                  className="p-1.5 rounded text-slate-400 hover:text-sky-400 hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Rebalance Cap"
                >
                  <Sliders className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
