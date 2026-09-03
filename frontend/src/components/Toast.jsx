import React from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose }) => {
  if (!message) return null;

  const isSuccess = type === 'success';

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl backdrop-blur-md animate-bounce-short bg-[#0f172a]/95 text-white border-slate-700">
      {isSuccess ? (
        <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
      ) : (
        <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
      )}
      <p className="text-sm font-medium">{message}</p>
      {onClose && (
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default Toast;
