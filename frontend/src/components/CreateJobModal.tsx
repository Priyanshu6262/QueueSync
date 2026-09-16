import React, { useState, useEffect } from 'react';
import { CreateJobInput } from '../types/job';
import { X, Loader2, Sparkles } from 'lucide-react';

interface CreateJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateJobInput) => Promise<boolean>;
}

export const CreateJobModal: React.FC<CreateJobModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('email');
  const [customType, setCustomType] = useState('');
  const [isCustomType, setIsCustomType] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setType('email');
      setCustomType('');
      setIsCustomType(false);
      setValidationError(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalTitle = title.trim();
    const finalType = (isCustomType ? customType : type).trim();

    if (!finalTitle) {
      setValidationError('Job title is required and cannot be blank.');
      return;
    }

    if (!finalType) {
      setValidationError('Job type is required and cannot be blank.');
      return;
    }

    setIsSubmitting(true);
    setValidationError(null);

    const success = await onSubmit({ title: finalTitle, type: finalType });
    setIsSubmitting(false);

    if (success) {
      onClose();
    }
  };

  const quickTypes = ['email', 'data-processing', 'report-generation', 'webhook', 'image-render'];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-slate-200 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 id="modal-title" className="text-base font-bold text-slate-900">
              Create New Job
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {validationError && (
            <div className="p-3 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
              {validationError}
            </div>
          )}

          {/* Title Field */}
          <div>
            <label htmlFor="job-title" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Job Title <span className="text-rose-500">*</span>
            </label>
            <input
              id="job-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Process Monthly Invoices"
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg shadow-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 placeholder-slate-400"
              autoFocus
            />
          </div>

          {/* Type Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Job Type <span className="text-rose-500">*</span>
            </label>

            <div className="flex flex-wrap gap-1.5 mb-2">
              {quickTypes.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setType(t);
                    setIsCustomType(false);
                  }}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-colors ${
                    !isCustomType && type === t
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-300 font-semibold'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {t}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setIsCustomType(true)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-colors ${
                  isCustomType
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-300 font-semibold'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                + Custom
              </button>
            </div>

            {isCustomType && (
              <input
                type="text"
                required
                value={customType}
                onChange={(e) => setCustomType(e.target.value)}
                placeholder="Enter custom type, e.g. billing-sync"
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg shadow-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 placeholder-slate-400"
              />
            )}
          </div>

          {/* Initial Status Info */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
            <span className="font-semibold text-slate-700">Note: </span>
            All newly created jobs enter the queue with status{' '}
            <span className="font-semibold text-amber-700">pending</span> by default.
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Job'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
