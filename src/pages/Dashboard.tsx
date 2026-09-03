import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  PieChart,
  Activity,
  Receipt,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  AlertOctagon,
  TrendingDown,
  TrendingUp,
  Cpu,
  Lock,
  Layers,
  Radio,
  ExternalLink,
  Sparkles,
  Zap,
} from 'lucide-react';
import { KPICard } from '../components/common/KPICard';
import { RiskGauge } from '../components/common/RiskGauge';
import { ChartCard } from '../components/common/ChartCard';
import { RiskBadge } from '../components/common/RiskBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import { BudgetProgress } from '../components/common/BudgetProgress';
import { AlertCard } from '../components/common/AlertCard';
import { ForensicDetailDrawer } from '../components/common/ForensicDetailDrawer';
import { PageHeader } from '../components/common/PageHeader';
import { threatService } from '../services/threatService';
import { budgetService } from '../services/budgetService';
import { transactionService } from '../services/transactionService';
import { GlobalThreatMetrics, DepartmentBudget, Transaction, LiveThreatEvent } from '../types';
import { formatCurrency, formatPercent, getThreatCategoryLabel } from '../utils/formatters';
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  CartesianGrid,
} from 'recharts';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useNotification();
  const navigate = useNavigate();

  const [metrics, setMetrics] = useState<GlobalThreatMetrics | null>(null);
  const [departments, setDepartments] = useState<DepartmentBudget[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [radarData, setRadarData] = useState<any[]>([]);
  const [liveEvents, setLiveEvents] = useState<LiveThreatEvent[]>([]);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [m, depts, txRes, radar, live] = await Promise.all([
        threatService.getMetrics(),
        budgetService.getDepartments(),
        transactionService.getTransactions({ pageSize: 5 }),
        threatService.getThreatRadarData(),
        threatService.getLiveThreatFeed(),
      ]);
      setMetrics(m);
      setDepartments(depts);
      setRecentTransactions(txRes.transactions);
      setRadarData(radar);
      setLiveEvents(live.slice(0, 3));
    } catch (e) {
      console.error('Failed to load dashboard data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalAllocated = departments.reduce((acc, d) => acc + d.allocated, 0);
  const totalSpent = departments.reduce((acc, d) => acc + d.spent, 0);
  const totalCommitted = departments.reduce((acc, d) => acc + d.committed, 0);
  const globalBurnRate = totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0;

  // Chart data formatting for Departmental comparison (in ₹ Crores)
  const departmentChartData = departments.map((d) => ({
    name: d.code,
    fullName: d.name,
    allocatedCr: d.allocated / 10000000,
    spentCr: d.spent / 10000000,
    committedCr: d.committed / 10000000,
    burnRate: d.burnRatePercent,
  }));

  const handleOpenTransaction = (tx: Transaction) => {
    setSelectedTx(tx);
    setIsDrawerOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Forensic Drawer */}
      <ForensicDetailDrawer
        transaction={selectedTx}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onStatusUpdated={(updated) => {
          setRecentTransactions((prev) =>
            prev.map((t) => (t.id === updated.id ? updated : t))
          );
        }}
      />

      {/* Page Header */}
      <PageHeader
        title="Executive Financial Threat & Budget Intelligence"
        subtitle={`FY 2026–27 Financial Year • Welcome back, ${user?.name}. Sentinel AI v4.2 is actively monitoring 6 corporate ledger nodes in real-time.`}
        badge={
          <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>FY 2026–27 LIVE MONITORING</span>
          </span>
        }
        actions={
          <>
            <button
              onClick={() => navigate('/threats')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-950/40 transition-colors cursor-pointer"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Forensic Workbench</span>
            </button>
            <button
              onClick={() => navigate('/simulation')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
            >
              <Cpu className="w-3.5 h-3.5 text-sky-400" />
              <span>Stress Simulation Lab</span>
            </button>
          </>
        }
      />

      {/* Top Threat KPI Cluster */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Overall Threat Index"
          value={`${metrics?.overallThreatScore || 78}/100`}
          trend={{ value: -4.2, isPositiveGood: true, label: 'vs last 24h' }}
          icon={AlertOctagon}
          riskBadge={metrics?.threatLevel || 'HIGH'}
          accentColor="rose"
        />
        <KPICard
          title="Total Capital At Risk"
          value={formatCurrency(metrics?.totalAtRiskAmount || 89840000)}
          trend={{ value: 12.5, isPositiveGood: false, label: '3 active transfers' }}
          icon={Receipt}
          accentColor="orange"
          subtext={`Quarantined: ${formatCurrency(metrics?.quarantinedAmount || 62780000)}`}
        />
        <KPICard
          title="Enterprise Budget Burn (FY 26-27)"
          value={formatPercent(globalBurnRate)}
          trend={{ value: 8.4, isPositiveGood: false, label: 'pace vs Q1 target' }}
          icon={PieChart}
          accentColor="amber"
          subtext={`Total Cap: ${formatCurrency(totalAllocated)}`}
        />
        <KPICard
          title="AI Anomaly Interceptions"
          value={`${metrics?.anomaliesDetected24h || 17} Events`}
          trend={{ value: 98.4, isPositiveGood: true, label: 'Precision Rating' }}
          icon={Activity}
          accentColor="emerald"
          subtext="Avg Response: 1.4s"
        />
      </div>

      {/* Main Grid: Threat Gauge & Global Burn Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Sentinel Threat Matrix Gauge */}
        <div className="enterprise-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>Financial Threat Meter</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-400 uppercase">
                Ensemble AI v4.2
              </span>
            </div>

            <div className="py-2">
              <RiskGauge
                score={metrics?.overallThreatScore || 78}
                size={220}
                label="Global Threat Probability"
                sublabel="Statistical Vector Deviation Index"
              />
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400">Active High-Risk Outliers:</span>
              <span className="font-mono font-bold text-rose-400">3 Transfers on Hold</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400">Unverified Entity Watch:</span>
              <span className="font-mono font-bold text-amber-400">2 Under Review</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400">Automated Triage Rate:</span>
              <span className="font-mono font-bold text-emerald-400">94.2%</span>
            </div>
          </div>
        </div>

        {/* Right 2 cols: Departmental Burn vs Run-Rate Bar Chart */}
        <div className="lg:col-span-2">
          <ChartCard
            title="FY 2026–27 Departmental Expenditure vs Allocated Cap (₹ Crores)"
            subtitle="Real-time multi-department burn comparison & committed requisitions in Indian Rupees"
            onRefresh={loadData}
          >
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={departmentChartData}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="name"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                  tickFormatter={(val) => `₹${val} Cr`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#1e293b',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#f8fafc',
                  }}
                  formatter={(val: any, name: any) => [
                    `₹${Number(val).toFixed(2)} Cr`,
                    name === 'spentCr' ? 'Actual Spent' : name === 'allocatedCr' ? 'Total Cap' : 'Committed In-Flight',
                  ]}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                  formatter={(value) =>
                    value === 'allocatedCr' ? 'Budget Cap' : value === 'spentCr' ? 'Actual Spent' : 'Committed Requisitions'
                  }
                />
                <Bar dataKey="allocatedCr" fill="#1e293b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="spentCr" fill="#0284c7" radius={[4, 4, 0, 0]} />
                <Bar dataKey="committedCr" fill="#38bdf8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>

      {/* Middle Grid: Threat Vector Radar + Live Threat Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Radar Chart */}
        <ChartCard
          title="AI Threat Vector Distribution Matrix"
          subtitle="Severity breakdown across 7 behavioral financial risk vectors"
        >
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
              <PolarGrid stroke="#334155" />
              <PolarAngleAxis dataKey="category" stroke="#94a3b8" fontSize={9} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" fontSize={9} />
              <Radar
                name="Threat Index"
                dataKey="threatScore"
                stroke="#f43f5e"
                fill="#f43f5e"
                fillOpacity={0.35}
              />
              <Radar
                name="Benchmark Baseline"
                dataKey="benchmark"
                stroke="#38bdf8"
                fill="#38bdf8"
                fillOpacity={0.15}
              />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#1e293b',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Live Anomaly Alert Ticker Feed */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>High-Priority Sentinel Incident Stream</span>
            </h3>
            <button
              onClick={() => navigate('/threats')}
              className="text-xs text-sky-400 hover:text-sky-300 font-medium flex items-center gap-1 cursor-pointer"
            >
              <span>Threat Center</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {liveEvents.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onInvestigate={() => {
                  const matched = recentTransactions.find((t) => t.referenceNo === alert.referenceNo);
                  if (matched) handleOpenTransaction(matched);
                  else navigate('/threats');
                }}
                onQuarantine={(a) => {
                  addToast({
                    title: 'Quarantine Action Dispatched',
                    message: `${a.referenceNo} transfer placed on hold at banking gateway.`,
                    type: 'error',
                  });
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* High-Risk Transaction Forensic Table */}
      <div className="enterprise-card p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-sky-400" />
              <span>High-Risk Transaction Outliers Under Active Sentinel Surveillance</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Flagged by heuristic rules, Benford statistical deviation, or regulatory watchlist alignment (FY 2026–27)
            </p>
          </div>
          <button
            onClick={() => navigate('/ledger')}
            className="text-xs text-sky-400 hover:text-sky-300 font-medium flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            <span>View Full Ledger (FY 26–27)</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Reference / Date</th>
                <th className="py-2.5 px-3">Department</th>
                <th className="py-2.5 px-3">Vendor / Beneficiary</th>
                <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                <th className="py-2.5 px-3 text-center">Threat Risk</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {recentTransactions.map((tx) => (
                <tr
                  key={tx.id}
                  onClick={() => handleOpenTransaction(tx)}
                  className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-3">
                    <p className="font-mono font-medium text-slate-200">{tx.referenceNo}</p>
                    <p className="text-[11px] text-slate-500 font-mono">
                      {new Date(tx.timestamp).toLocaleDateString()} {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </td>
                  <td className="py-3 px-3 text-slate-300">{tx.department}</td>
                  <td className="py-3 px-3">
                    <p className="font-medium text-slate-200">{tx.vendorName}</p>
                    <p className="text-[11px] text-slate-400">{tx.category}</p>
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-100">
                    {formatCurrency(tx.amount)}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <RiskBadge level={tx.riskLevel} score={tx.riskScore} size="sm" />
                  </td>
                  <td className="py-3 px-3">
                    <StatusBadge status={tx.status} size="sm" />
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenTransaction(tx);
                      }}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors cursor-pointer"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
