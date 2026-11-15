import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';

export default function ErrorAlert({
  type = 'error',
  title,
  message,
  onDismiss,
  action
}) {
  const configs = {
    error: {
      border: 'border-[#FECACA]',
      bg: 'bg-[#FEF2F2]',
      text: 'text-[#DC2626]',
      icon: AlertCircle,
      iconColor: 'text-[#DC2626]'
    },
    warning: {
      border: 'border-[#FDE68A]',
      bg: 'bg-[#FFFBEB]',
      text: 'text-[#B45309]',
      icon: AlertTriangle,
      iconColor: 'text-[#B45309]'
    },
    info: {
      border: 'border-[#E5E5E5]',
      bg: 'bg-[#FAFAFA]',
      text: 'text-[#171717]',
      icon: Info,
      iconColor: 'text-[#666666]'
    },
    success: {
      border: 'border-[#BBF7D0]',
      bg: 'bg-[#F0FDF4]',
      text: 'text-[#15803D]',
      icon: CheckCircle2,
      iconColor: 'text-[#15803D]'
    }
  };

  const style = configs[type] || configs.error;
  const Icon = style.icon;

  return (
    <div className={`border ${style.border} ${style.bg} rounded-md p-3.5 flex items-start gap-3`}>
      <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${style.iconColor}`} />
      <div className="flex-1 text-xs">
        {title && <h4 className={`font-semibold mb-0.5 ${style.text}`}>{title}</h4>}
        <div className="text-[#666666] leading-relaxed">{message}</div>
        {action && <div className="mt-2.5">{action}</div>}
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-[#888888] hover:text-[#171717] transition-colors p-0.5"
          title="Dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
