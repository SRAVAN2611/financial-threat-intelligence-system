import React, { useState, useEffect } from 'react';
import {
  Settings,
  Users,
  ShieldCheck,
  Key,
  Sliders,
  History,
  Activity,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { KPICard } from '../components/common/KPICard';
import { SearchBar } from '../components/common/SearchBar';
import { auditService } from '../services/auditService';
import { AuditLog } from '../types';
import { formatDateTime, truncateHash } from '../utils/formatters';
import { DEMO_USERS } from '../mockData/users';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

export const SettingsGovernance: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useNotification();

  const [activeTab, setActiveTab] = useState<'audit' | 'rbac' | 'model'>('audit');
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [searchLog, setSearchLog] = useState('');
  const [sensitivity, setSensitivity] = useState<number>(85);

  const loadLogs = async () => {
    const list = await auditService.getLogs({ search: searchLog });
    setLogs(list);
  };

  useEffect(() => {
    loadLogs();
  }, [searchLog]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="System Governance, RBAC & Model Drift"
        subtitle="Immutable cryptographic audit trail, role-based access matrix, and Sentinel AI neural network sensitivity parameters."
        breadcrumbs={[{ label: 'System Governance' }]}
      />

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'audit'
              ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Immutable Audit Ledger</span>
        </button>

        <button
          onClick={() => setActiveTab('rbac')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'rbac'
              ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>RBAC Access Control</span>
        </button>

        <button
          onClick={() => setActiveTab('model')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'model'
              ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Model Sensitivity & Drift</span>
        </button>
      </div>

      {/* Tab 1: Audit Log */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="enterprise-card p-4">
            <SearchBar
              value={searchLog}
              onChange={setSearchLog}
              placeholder="Search audit actions, user actors, or hash stamps..."
            />
          </div>

          <div className="enterprise-card p-4 overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="text-slate-400 uppercase tracking-wider border-b border-slate-800 font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Actor / Role</th>
                  <th className="py-2.5 px-3">Action</th>
                  <th className="py-2.5 px-3">Details</th>
                  <th className="py-2.5 px-3 text-right">Immutable Hash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {logs.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400">
                      {formatDateTime(l.timestamp)}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-medium text-slate-200 block">{l.userName}</span>
                      <span className="font-mono text-[10px] text-sky-400">{l.userRole}</span>
                    </td>
                    <td className="py-2.5 px-3 font-mono font-semibold text-slate-200">
                      {l.action}
                    </td>
                    <td className="py-2.5 px-3 text-xs text-slate-300 max-w-md truncate">
                      {l.details}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-[11px] text-sky-400">
                      {truncateHash(l.immutableHash, 6, 6)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: RBAC Matrix */}
      {activeTab === 'rbac' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {DEMO_USERS.map((usr) => (
            <div key={usr.id} className="enterprise-card p-5 space-y-4">
              <div className="flex items-center gap-3">
                <img
                  src={usr.avatar}
                  alt={usr.name}
                  className="w-10 h-10 rounded-full object-cover border border-slate-700"
                />
                <div>
                  <h4 className="font-semibold text-slate-100 text-sm">{usr.name}</h4>
                  <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400">
                    {usr.role}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-xs pt-3 border-t border-slate-800">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Role Permissions:
                </p>
                {Object.entries(usr.permissions).map(([key, val]) => (
                  <div key={key} className="flex items-center justify-between text-slate-300">
                    <span className="text-[11px] capitalize">{key.replace(/can/, '').replace(/([A-Z])/g, ' $1')}</span>
                    <span
                      className={`font-mono text-[10px] px-1.5 py-0.2 rounded font-bold ${
                        val ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-600 bg-slate-900'
                      }`}
                    >
                      {val ? 'GRANTED' : 'DENIED'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Model Drift */}
      {activeTab === 'model' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <KPICard title="Precision" value="98.4%" subtext="False Alarm Rate: 0.3%" icon={Activity} accentColor="emerald" />
            <KPICard title="Recall" value="96.2%" subtext="Zero High-Severity Misses" icon={ShieldCheck} accentColor="sky" />
            <KPICard title="F1 Forensic Score" value="97.3%" subtext="30-day Drift: +0.2%" icon={Activity} accentColor="indigo" />
          </div>

          <div className="enterprise-card p-5 space-y-4">
            <h4 className="text-sm font-semibold text-slate-200">
              Sentinel Anomaly Classifier Sensitivity Tuning
            </h4>
            <p className="text-xs text-slate-400">
              Adjusting the global sensitivity boundary threshold affects automatic quarantine triggers across the entire enterprise financial network.
            </p>

            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-semibold">Classification Threshold:</span>
                <span className="font-mono font-bold text-sky-400">{sensitivity}/100</span>
              </div>
              <input
                type="range"
                min={50}
                max={99}
                value={sensitivity}
                onChange={(e) => setSensitivity(Number(e.target.value))}
                className="w-full accent-sky-500 cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
