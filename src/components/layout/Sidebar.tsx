import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShieldAlert,
  PieChart,
  ReceiptText,
  Store,
  Sliders,
  Cpu,
  FileCheck2,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
  Radio,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { UserRole } from '../../types';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  roles?: UserRole[];
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const { user, logout } = useAuth();
  const { unreadAlertsCount } = useNotification();
  const navigate = useNavigate();

  const navItems: NavItem[] = [
    {
      to: '/dashboard',
      label: 'Executive Overview',
      icon: LayoutDashboard,
    },
    {
      to: '/threats',
      label: 'Threat & Anomaly Center',
      icon: ShieldAlert,
      badge: unreadAlertsCount > 0 ? unreadAlertsCount : undefined,
    },
    {
      to: '/budgets',
      label: 'Budget Intelligence',
      icon: PieChart,
    },
    {
      to: '/ledger',
      label: 'Forensic Ledger',
      icon: ReceiptText,
    },
    {
      to: '/vendors',
      label: 'Vendor Risk Intelligence',
      icon: Store,
    },
    {
      to: '/rules',
      label: 'AI Rules & Policies',
      icon: Sliders,
      roles: ['ADMIN', 'FINANCE_OFFICER'],
    },
    {
      to: '/simulation',
      label: 'Stress Simulation Lab',
      icon: Cpu,
      roles: ['ADMIN', 'FINANCE_OFFICER'],
    },
    {
      to: '/compliance',
      label: 'Compliance & SAR Reports',
      icon: FileCheck2,
      roles: ['ADMIN', 'FINANCE_OFFICER'],
    },
    {
      to: '/settings',
      label: 'Governance & RBAC',
      icon: Settings,
    },
  ];

  const filteredNav = navItems.filter((item) => {
    if (!item.roles) return true;
    if (!user) return false;
    return item.roles.includes(user.role);
  });

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-40 bg-slate-950 border-r border-slate-800/80 transition-all duration-300 flex flex-col ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80">
        <NavLink to="/dashboard" className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-extrabold tracking-wider text-sm text-slate-100 flex items-center gap-1">
                SENTINEL<span className="text-sky-400 font-mono">-FIN</span>
              </span>
              <span className="text-[9px] text-slate-400 tracking-widest font-mono uppercase">
                AI Threat Defense
              </span>
            </div>
          )}
        </NavLink>
        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-colors hidden md:block"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Live System Status Pill */}
      {!collapsed && (
        <div className="mx-4 mt-3 p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="font-mono text-[11px] text-slate-300 font-medium">
              SENTINEL v4.2
            </span>
          </div>
          <span className="text-[10px] text-emerald-400 font-mono font-medium uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
            ARMED
          </span>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        {filteredNav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                isActive
                  ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
              } ${collapsed ? 'justify-center px-2' : ''}`
            }
            title={collapsed ? item.label : undefined}
          >
            <item.icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-105" />
            {!collapsed && <span className="truncate">{item.label}</span>}
            {!collapsed && item.badge !== undefined && (
              <span className="ml-auto px-1.5 py-0.5 text-[10px] font-mono font-bold rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                {item.badge}
              </span>
            )}
            {collapsed && item.badge !== undefined && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500" />
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Section / Role Pill */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/80">
        {!collapsed && user ? (
          <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover border border-slate-700 shrink-0"
              />
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-200 truncate">{user.name}</p>
                <p className="text-[10px] font-mono text-sky-400 truncate">
                  {user.role}
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              className="p-1.5 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={logout}
            className="w-full py-2 flex items-center justify-center text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-900 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </aside>
  );
};
