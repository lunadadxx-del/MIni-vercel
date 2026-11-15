import React from 'react';
import { AlertTriangle, Info, CheckCircle2, X } from 'lucide-react';

export default function ErrorAlert({
  type = 'error',
  title,
  message,
  onDismiss,
  action
}) {
  const configs = {
    error: {
      border: 'border-rose-900/60',
      bg: 'bg-rose-950/20',
      text: 'text-rose-200',
      icon: AlertTriangle,
      iconColor: 'text-rose-400'
    },
    warning: {
      border: 'border-amber-900/60',
      bg: 'bg-amber-950/20',
      text: 'text-amber-200',
      icon: AlertTriangle,
      iconColor: 'text-amber-400'
    },
    info: {
      border: 'border-indigo-900/60',
      bg: 'bg-indigo-950/20',
      text: 'text-indigo-200',
      icon: Info,
      iconColor: 'text-indigo-400'
    },
    success: {
      border: 'border-emerald-900/60',
      bg: 'bg-emerald-950/20',
      text: 'text-emerald-200',
      icon: CheckCircle2,
      iconColor: 'text-emerald-400'
    }
  };

  const style = configs[type] || configs.error;
  const Icon = style.icon;

  return (
    <div className={`border ${style.border} ${style.bg} ${style.text} rounded-xl p-4 flex items-start gap-3 shadow-sm`}>
      <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${style.iconColor}`} />
      <div className="flex-1 text-sm">
        {title && <h4 className="font-semibold mb-0.5">{title}</h4>}
        <div className="text-slate-300 leading-relaxed text-xs md:text-sm">{message}</div>
        {action && <div className="mt-3">{action}</div>}
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-slate-400 hover:text-white transition-colors p-1"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
