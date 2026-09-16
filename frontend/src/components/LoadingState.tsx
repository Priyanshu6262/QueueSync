import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingState: React.FC = () => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 mb-3">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
      <h3 className="text-sm font-semibold text-slate-900">Loading jobs...</h3>
      <p className="text-xs text-slate-500 mt-1">Connecting to backend service</p>
    </div>
  );
};
