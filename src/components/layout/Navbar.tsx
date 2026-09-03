import React, { useState, useEffect } from 'react';
import {
  Search,
  Bell,
  Radio,
  Check,
  ChevronDown,
  Lock,
  ExternalLink,
  ShieldAlert,
  Sun,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { DEMO_USERS } from '../../mockData/users';
import { formatTimeAgo } from '../../utils/formatters';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
  onOpenSearch: () => void;
  collapsed: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSearch, collapsed }) => {
  const { user, switchRole, logout } = useAuth();
  const {
    liveFeed,
    unreadAlertsCount,
    markAlertsAsRead,
    isLiveStreamActive,
    toggleLiveStream,
    addToast,
  } = useNotification();
  const navigate = useNavigate();

  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showAlertsDropdown, setShowAlertsDropdown] = useState(false);
  const [isLightMode, setIsLightMode] = useState<boolean>(() => {
    return localStorage.getItem('sentinel_theme') === 'light';
  });

  useEffect(() => {
    if (isLightMode) {
      document.body.classList.add('light-theme');
      localStorage.setItem('sentinel_theme', 'light');
    } else {
      document.body.classList.remove('light-theme');
      localStorage.setItem('sentinel_theme', 'dark');
    }
  }, [isLightMode]);

  const toggleTheme = () => {
    setIsLightMode((prev) => {
      const nextState = !prev;
      addToast({
        title: nextState ? 'Light Mode' : 'Dark Mode',
        message: nextState ? 'Switched to Light theme.' : 'Switched to Dark theme.',
        type: 'info',
      });
      return nextState;
    });
  };

  // Latest live ticker event
  const latestEvent = liveFeed[0];

  return (
    <header
      className={`sticky top-0 z-30 h-16 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 transition-all duration-300 px-4 md:px-6 flex items-center justify-between gap-4`}
    >
      {/* Left: Global Search trigger button */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between px-3.5 py-1.5 text-xs bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 rounded-lg text-slate-400 transition-all group"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300" />
            <span>Search forensic ledgers, rules, shell vendors...</span>
          </div>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono bg-slate-800 text-slate-400 rounded border border-slate-700">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Middle: Live Sentinel Stream Ticker (Desktop only) */}
      <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-slate-900/60 border border-slate-800/80 rounded-full text-xs">
        <button
          onClick={toggleLiveStream}
          className="flex items-center gap-1.5 text-[11px] font-mono font-medium text-slate-300 hover:text-slate-100"
          title={isLiveStreamActive ? 'Pause real-time feed' : 'Resume real-time feed'}
        >
          <Radio
            className={`w-3.5 h-3.5 ${
              isLiveStreamActive ? 'text-emerald-400 animate-pulse' : 'text-slate-500'
            }`}
          />
          <span className="text-slate-400">STREAM:</span>
        </button>

        {latestEvent ? (
          <div
            onClick={() => navigate('/threats')}
            className="cursor-pointer flex items-center gap-2 max-w-[340px] truncate hover:text-sky-400 transition-colors"
          >
            <span
              className={`text-[10px] font-mono uppercase px-1.5 py-0.2 rounded font-semibold ${
                latestEvent.severity === 'CRITICAL'
                  ? 'bg-rose-500/20 text-rose-400'
                  : latestEvent.severity === 'HIGH'
                  ? 'bg-orange-500/20 text-orange-400'
                  : 'bg-amber-500/20 text-amber-400'
              }`}
            >
              {latestEvent.severity}
            </span>
            <span className="text-slate-300 text-xs truncate">
              {latestEvent.title}
            </span>
          </div>
        ) : (
          <span className="text-slate-500 text-[11px] font-mono">No active incidents</span>
        )}
      </div>

      {/* Right: Actions, Notifications, Light & Bright Icon, Role Switcher */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Light & Bright Mode Icon Toggle */}
        <button
          onClick={toggleTheme}
          className={`relative p-2 rounded-lg transition-all duration-300 flex items-center justify-center cursor-pointer group ${
            isLightMode
              ? 'bg-amber-500/20 text-amber-500 border border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.35)]'
              : 'text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 border border-transparent hover:border-amber-500/20'
          }`}
          title={isLightMode ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
          {isLightMode ? (
            <Sun className="w-4 h-4 animate-[spin_10s_linear_infinite] text-amber-500" />
          ) : (
            <div className="relative">
              <Sun className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
              <Sparkles className="w-2.5 h-2.5 text-amber-300 absolute -top-1 -right-1 animate-pulse" />
            </div>
          )}
        </button>

        {/* Alerts Notification Bell */}
        <div className="relative">
          <button
            onClick={() => {
              setShowAlertsDropdown((p) => !p);
              setShowRoleDropdown(false);
              markAlertsAsRead();
            }}
            className="relative p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
            title="Threat Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadAlertsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
            )}
          </button>

          {/* Alerts Dropdown */}
          {showAlertsDropdown && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                <div className="flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  <span className="text-xs font-semibold text-slate-200">
                    Sentinel Live Threats
                  </span>
                </div>
                <button
                  onClick={() => {
                    navigate('/threats');
                    setShowAlertsDropdown(false);
                  }}
                  className="text-[11px] text-sky-400 hover:underline flex items-center gap-0.5"
                >
                  <span>View All</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto">
                {liveFeed.slice(0, 5).map((evt) => (
                  <div
                    key={evt.id}
                    onClick={() => {
                      navigate('/threats');
                      setShowAlertsDropdown(false);
                    }}
                    className="p-2.5 rounded-lg bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/80 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[10px] font-mono uppercase font-bold text-rose-400">
                        {evt.severity}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {formatTimeAgo(evt.timestamp)}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-slate-200 mb-0.5">{evt.title}</p>
                    <p className="text-[11px] text-slate-400 line-clamp-1">{evt.aiExplanation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Role Fast Switcher Badge & Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowRoleDropdown((p) => !p);
              setShowAlertsDropdown(false);
            }}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 transition-all text-xs cursor-pointer"
          >
            <div className="w-6 h-6 rounded-full overflow-hidden border border-slate-700 shrink-0">
              <img
                src={user?.avatar}
                alt={user?.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="font-semibold text-slate-200 text-xs leading-none">
                {user?.name}
              </span>
              <span className="text-[10px] font-mono text-sky-400 leading-tight">
                {user?.role}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Switch Role Dropdown */}
          {showRoleDropdown && (
            <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95">
              <div className="pb-2 mb-2 border-b border-slate-800">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Switch Demo Account (RBAC)
                </p>
                <p className="text-[10px] text-slate-500">
                  Instant 1-click role & permissions simulator
                </p>
              </div>

              <div className="space-y-1.5">
                {DEMO_USERS.map((demo) => {
                  const isCurrent = user?.role === demo.role;

                  return (
                    <button
                      key={demo.id}
                      onClick={() => {
                        switchRole(demo.role);
                        setShowRoleDropdown(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-sky-500/10 border border-sky-500/30 text-sky-300'
                          : 'hover:bg-slate-800 border border-transparent text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src={demo.avatar}
                          alt={demo.name}
                          className="w-7 h-7 rounded-full object-cover border border-slate-700"
                        />
                        <div>
                          <p className="text-xs font-semibold">{demo.name}</p>
                          <p className="text-[10px] font-mono text-slate-400">
                            {demo.role}
                          </p>
                        </div>
                      </div>
                      {isCurrent && <Check className="w-4 h-4 text-sky-400" />}
                    </button>
                  );
                })}
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1 text-emerald-400">
                  <Lock className="w-3 h-3" />
                  <span>2FA Hardware Enclave Active</span>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setShowRoleDropdown(false);
                    navigate('/login');
                  }}
                  className="text-rose-400 hover:underline cursor-pointer"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
