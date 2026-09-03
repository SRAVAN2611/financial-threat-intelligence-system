import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
      <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mb-4">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <h1 className="text-2xl font-bold text-slate-100">404 - Secure Node Not Found</h1>
      <p className="text-sm text-slate-400 max-w-md mt-2 mb-6">
        The requested financial ledger endpoint does not exist or has been quarantined by Sentinel security policy.
      </p>
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Executive Overview</span>
      </Link>
    </div>
  );
};
