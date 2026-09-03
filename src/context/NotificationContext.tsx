import React, { createContext, useContext, useState, useEffect } from 'react';
import { LiveThreatEvent, RiskLevel } from '../types';
import { threatService } from '../services/threatService';
import { formatCurrency } from '../utils/formatters';

export interface ToastItem {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
  timestamp: string;
  duration?: number;
}

interface NotificationContextType {
  liveFeed: LiveThreatEvent[];
  unreadAlertsCount: number;
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, 'id' | 'timestamp'>) => void;
  removeToast: (id: string) => void;
  markAlertsAsRead: () => void;
  isLiveStreamActive: boolean;
  toggleLiveStream: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [liveFeed, setLiveFeed] = useState<LiveThreatEvent[]>([]);
  const [unreadAlertsCount, setUnreadAlertsCount] = useState<number>(3);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [isLiveStreamActive, setIsLiveStreamActive] = useState<boolean>(true);

  // Initial load
  useEffect(() => {
    threatService.getLiveThreatFeed().then((feed) => {
      setLiveFeed(feed);
    });
  }, []);

  // Periodic threat stream simulator
  useEffect(() => {
    if (!isLiveStreamActive) return;

    const interval = setInterval(() => {
      const simulatedEvents: Array<{
        title: string;
        category: LiveThreatEvent['category'];
        severity: RiskLevel;
        amount: number;
        dept: string;
        explanation: string;
      }> = [
        {
          title: 'Benford Leading Digit Divergence Detected',
          category: 'BENFORD_ANOMALY',
          severity: 'MEDIUM',
          amount: 1420000, // ₹14.20 L
          dept: 'Global Marketing & Brand Growth',
          explanation: 'Statistical variance detected in digital advertising performance reports.',
        },
        {
          title: 'Velocity Frequency Anomaly Intercepted',
          category: 'VELOCITY_SPIKE',
          severity: 'HIGH',
          amount: 6850000, // ₹68.50 L
          dept: 'Engineering & Infrastructure',
          explanation: '3 consecutive invoices submitted in < 12 minutes to same foreign vendor node.',
        },
        {
          title: 'Regulatory Watchlist Verification Cleared',
          category: 'SANCTIONS_MATCH',
          severity: 'LOW',
          amount: 18500000, // ₹1.85 Cr
          dept: 'Corporate Operations',
          explanation: 'Vendor verified against latest consolidated statutory screening registries.',
        },
      ];

      const pick = simulatedEvents[Math.floor(Math.random() * simulatedEvents.length)];
      const newEvent: LiveThreatEvent = {
        id: `stream_${Date.now()}`,
        timestamp: new Date().toISOString(),
        title: pick.title,
        category: pick.category,
        severity: pick.severity,
        amount: pick.amount,
        department: pick.dept,
        referenceNo: `TXN-2026-${Math.floor(10000 + Math.random() * 90000)}`,
        status: pick.severity === 'CRITICAL' ? 'QUARANTINED' : pick.severity === 'HIGH' ? 'FLAGGED' : 'APPROVED',
        aiExplanation: pick.explanation,
      };

      setLiveFeed((prev) => [newEvent, ...prev.slice(0, 19)]);
      setUnreadAlertsCount((c) => c + 1);

      if (pick.severity === 'CRITICAL' || pick.severity === 'HIGH') {
        addToast({
          title: `Sentinel Sentinel Alert: ${pick.title}`,
          message: `${pick.dept} • ${formatCurrency(pick.amount)}`,
          type: pick.severity === 'CRITICAL' ? 'error' : 'warning',
          duration: 6000,
        });
      }
    }, 45000);

    return () => clearInterval(interval);
  }, [isLiveStreamActive]);

  const addToast = (toast: Omit<ToastItem, 'id' | 'timestamp'>) => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    const newToast: ToastItem = {
      ...toast,
      id,
      timestamp: new Date().toISOString(),
    };
    setToasts((prev) => [newToast, ...prev]);

    const duration = toast.duration || 4500;
    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const markAlertsAsRead = () => {
    setUnreadAlertsCount(0);
  };

  const toggleLiveStream = () => {
    setIsLiveStreamActive((prev) => !prev);
  };

  return (
    <NotificationContext.Provider
      value={{
        liveFeed,
        unreadAlertsCount,
        toasts,
        addToast,
        removeToast,
        markAlertsAsRead,
        isLiveStreamActive,
        toggleLiveStream,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};
