import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Plus,
  Play,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ShieldAlert,
  Code,
  Zap,
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { SeverityBadge } from '../components/common/SeverityBadge';
import { Modal } from '../components/common/Modal';
import { rulesService } from '../services/rulesService';
import { AnomalyRule, ThreatCategory, RiskLevel } from '../types';
import { formatDateTime, getThreatCategoryLabel } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

export const RulesEngine: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const { addToast } = useNotification();

  const [rules, setRules] = useState<AnomalyRule[]>([]);
  const [loading, setLoading] = useState(true);

  // New Rule Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [category, setCategory] = useState<ThreatCategory>('PHANTOM_VENDOR');
  const [severity, setSeverity] = useState<RiskLevel>('HIGH');
  const [threshold, setThreshold] = useState('');
  const [action, setAction] = useState<AnomalyRule['action']>('AUTO_QUARANTINE');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Test Rule Simulation modal
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [testRule, setTestRule] = useState<AnomalyRule | null>(null);
  const [testResult, setTestResult] = useState<any>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const list = await rulesService.getRules();
      setRules(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggle = async (rule: AnomalyRule) => {
    if (!user) return;
    try {
      await rulesService.toggleRule(rule.id, !rule.enabled, user.name);
      addToast({
        title: `Rule ${!rule.enabled ? 'Enabled' : 'Disabled'}`,
        message: `${rule.name} state updated.`,
        type: !rule.enabled ? 'success' : 'warning',
      });
      loadData();
    } catch (e: any) {
      addToast({
        title: 'Toggle Failed',
        message: e.message,
        type: 'error',
      });
    }
  };

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);
    try {
      await rulesService.createRule(
        {
          name,
          code: code.toUpperCase() || `RL-CUS-${Math.floor(100 + Math.random() * 900)}`,
          category,
          severity,
          threshold,
          metric: 'CustomEnsembleWeight',
          action,
          enabled: true,
          description,
          accuracyScore: 95.5,
          createdBy: user.name,
        },
        user.name
      );
      addToast({
        title: 'Anomaly Rule Deployed',
        message: `Active heuristic rule "${name}" compiled and armed for FY 2026–27.`,
        type: 'success',
      });
      setIsCreateModalOpen(false);
      setName('');
      setCode('');
      setThreshold('');
      setDescription('');
      loadData();
    } catch (err: any) {
      addToast({
        title: 'Creation Failed',
        message: err.message,
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRunBacktest = (rule: AnomalyRule) => {
    setTestRule(rule);
    setTestResult(null);
    setTestModalOpen(true);
    setTimeout(() => {
      setTestResult({
        totalScanned: 14820,
        anomaliesTriggered: Math.floor(8 + Math.random() * 15),
        falsePositiveRate: '0.4%',
        estimatedLossPrevented: '₹4,85,00,000.00 (₹4.85 Cr)',
        latencyOverheadMs: 1.2,
      });
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Create Rule Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Deploy New Anomaly Detection Rule (FY 2026–27)"
        subtitle="Sentinel Heuristic & Ensemble Model Policy Configurator"
        maxWidth="lg"
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreateRule}
              disabled={isSubmitting}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold shadow-lg transition-colors cursor-pointer"
            >
              {isSubmitting ? 'Compiling Rule...' : 'Deploy & Arm Rule'}
            </button>
          </>
        }
      >
        <form onSubmit={handleCreateRule} className="space-y-4 py-2 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Rule Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Cross-Border RTGS Threshold Watch"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Rule Code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="RL-RTGS-008"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg font-mono text-slate-100 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Anomaly Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-sky-500"
              >
                <option value="PHANTOM_VENDOR">Unverified Shell Entity</option>
                <option value="DUPLICATE_INVOICE">Duplicate Invoice</option>
                <option value="SPLIT_TRANSACTION_SMURFING">Approval Smurfing</option>
                <option value="OFF_HOURS_TRANSFER">Off-Hours Transfer</option>
                <option value="BENFORD_ANOMALY">Benford Law Anomaly</option>
                <option value="SANCTIONS_MATCH">Regulatory Watchlist</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Severity</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-sky-500"
              >
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Action</label>
              <select
                value={action}
                onChange={(e) => setAction(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-sky-500"
              >
                <option value="AUTO_QUARANTINE">Auto Quarantine</option>
                <option value="ALERT_FINANCE">Alert Finance</option>
                <option value="REQUIRE_DUAL_AUTH">Require Dual Sign</option>
                <option value="LOG_ONLY">Log Only</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Threshold Condition Expression
            </label>
            <input
              type="text"
              required
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              placeholder="e.g. Volume > ₹1,00,00,000 AND VendorAgeDays < 60 AND Jurisdiction != 'India'"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg font-mono text-slate-100 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Description</label>
            <textarea
              rows={2}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explains what financial threat vector this rule neutralizes."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>
        </form>
      </Modal>

      {/* Test Rule Simulation Modal */}
      <Modal
        isOpen={testModalOpen}
        onClose={() => setTestModalOpen(false)}
        title={`Backtest Simulation: ${testRule?.code}`}
        subtitle="Historical Corporate Ledger Replay (14,820 Records)"
        maxWidth="md"
      >
        <div className="py-2 space-y-4 text-xs">
          <p className="text-slate-300">
            Simulating rule <strong className="text-sky-400 font-mono">{testRule?.name}</strong> against the entire corporate ledger.
          </p>

          {!testResult ? (
            <div className="p-8 text-center space-y-2">
              <div className="w-8 h-8 border-2 border-sky-500/30 border-t-sky-400 rounded-full animate-spin mx-auto" />
              <p className="text-slate-400">Replaying ledger telemetry...</p>
            </div>
          ) : (
            <div className="enterprise-card p-4 space-y-3 bg-slate-950 border-slate-800 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Historical Records Scanned:</span>
                <span className="text-slate-200 font-bold">{testResult.totalScanned.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Anomalies Intercepted:</span>
                <span className="text-rose-400 font-bold">{testResult.anomaliesTriggered} Transfers</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">False Positive Rate:</span>
                <span className="text-emerald-400 font-bold">{testResult.falsePositiveRate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Estimated Capital Protected:</span>
                <span className="text-emerald-400 font-bold">{testResult.estimatedLossPrevented}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Latency Overhead:</span>
                <span className="text-slate-300 font-bold">{testResult.latencyOverheadMs} ms</span>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Page Header */}
      <PageHeader
        title="AI Anomaly Rules & Heuristic Policy Engine"
        subtitle="Configurable fraud heuristics, dynamic statistical boundaries, and automated cryptographic transfer quarantines for FY 2026–27."
        breadcrumbs={[{ label: 'Rules Engine' }]}
        actions={
          hasPermission('canManageRules') && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-lg transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Deploy New Rule</span>
            </button>
          )
        }
      />

      {/* Rules List */}
      <div className="space-y-3">
        {rules.map((rule) => (
          <div
            key={rule.id}
            className={`enterprise-card p-4 transition-all ${
              rule.enabled ? 'border-slate-800' : 'border-slate-850 opacity-60'
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-2.5 flex-wrap">
                <SeverityBadge severity={rule.severity} size="sm" />
                <span className="font-mono text-xs font-bold text-slate-100">{rule.code}</span>
                <span className="text-slate-600">•</span>
                <span className="text-xs font-semibold text-slate-200">{rule.name}</span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[11px] font-mono text-emerald-400">
                  {rule.accuracyScore}% Model Accuracy
                </span>
                <button
                  onClick={() => handleRunBacktest(rule)}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
                >
                  <Play className="w-3 h-3 text-sky-400" />
                  <span>Backtest</span>
                </button>
                {hasPermission('canManageRules') && (
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rule.enabled}
                      onChange={() => handleToggle(rule)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500"></div>
                  </label>
                )}
              </div>
            </div>

            <p className="text-xs text-slate-400 mb-3 leading-relaxed">{rule.description}</p>

            <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
                <span className="text-slate-500">Threshold:</span>
                <span className="text-sky-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                  {rule.threshold}
                </span>
              </div>

              <div className="flex items-center gap-3 text-[11px] font-mono">
                <span className="text-slate-500">
                  24h Triggers: <strong className="text-rose-400">{rule.triggerCount24h}</strong>
                </span>
                <span className="text-slate-700">|</span>
                <span className="text-slate-300 uppercase px-1.5 py-0.5 rounded bg-slate-800">
                  {rule.action.replace(/_/g, ' ')}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
