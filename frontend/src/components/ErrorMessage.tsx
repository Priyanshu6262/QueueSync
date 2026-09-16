import React from 'react';
import { AlertCircle, AlertTriangle, X, RefreshCw } from 'lucide-react';

interface ErrorMessageProps {
  error: string | null;
  conflictMessage: string | null;
  onDismissError: () => void;
  onDismissConflict: () => void;
  onRetry?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  error,
  conflictMessage,
  onDismissError,
  onDismissConflict,
  onRetry,
}) => {
  if (!error && !conflictMessage) return null;

  return (
    <div className="space-y-3">
      {/* 409 Concurrency Conflict Notification */}
      {conflictMessage && (
        <div className="flex items-start justify-between p-4 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 shadow-sm animate-in fade-in">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800">
                Concurrency Conflict Detected
              </h4>
              <p className="text-sm mt-0.5 text-amber-900 font-medium">
                {conflictMessage}
              </p>
            </div>
          </div>
          <button
            onClick={onDismissConflict}
            className="text-amber-600 hover:text-amber-800 p-1 rounded-md hover:bg-amber-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* General API / Network Error Notification */}
      {error && (
        <div className="flex items-start justify-between p-4 bg-rose-50 border border-rose-300 rounded-xl text-rose-900 shadow-sm animate-in fade-in">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-800">
                Request Failed
              </h4>
              <p className="text-sm mt-0.5 text-rose-900">{error}</p>
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-rose-700 hover:text-rose-900 underline"
                >
                  <RefreshCw className="w-3 h-3" /> Retry request
                </button>
              )}
            </div>
          </div>
          <button
            onClick={onDismissError}
            className="text-rose-600 hover:text-rose-800 p-1 rounded-md hover:bg-rose-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
