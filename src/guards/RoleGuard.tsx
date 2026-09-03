import React from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { ShieldAlert } from 'lucide-react';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles, children, fallback }) => {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    if (fallback) return <>{fallback}</>;

    return (
      <div className="enterprise-card p-8 text-center max-w-lg mx-auto my-12 border-rose-500/30 bg-rose-950/10">
        <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-4 border border-rose-500/30">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-semibold text-slate-100 mb-2">Restricted Security Enclave</h3>
        <p className="text-sm text-slate-400 mb-4">
          Your current role (<span className="text-rose-400 font-mono font-medium">{user?.role}</span>) does not possess sufficient cryptographic authorization to modify these parameters.
        </p>
        <p className="text-xs text-slate-500">
          Required roles: {allowedRoles.join(', ')}. Switch to an authorized demo profile in the top navigation.
        </p>
      </div>
    );
  }

  return <>{children}</>;
};
