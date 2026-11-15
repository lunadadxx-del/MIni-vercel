import React from 'react';
import { CheckCircle2, XCircle, Clock, Loader2, Slash, AlertCircle } from 'lucide-react';

export default function StatusBadge({ status, conclusion, size = 'sm' }) {
  // Normalize GitHub status & conclusion
  let state = 'unknown';
  let label = 'Unknown';
  let Icon = AlertCircle;
  let colorClasses = 'bg-slate-800/80 text-slate-300 border-slate-700';

  if (status === 'queued') {
    state = 'queued';
    label = 'Queued';
    Icon = Clock;
    colorClasses = 'bg-amber-950/40 text-amber-300 border-amber-800/50';
  } else if (status === 'in_progress') {
    state = 'in_progress';
    label = 'Building';
    Icon = Loader2;
    colorClasses = 'bg-blue-950/40 text-blue-300 border-blue-800/50 animate-pulse';
  } else if (status === 'completed') {
    if (conclusion === 'success') {
      state = 'success';
      label = 'Ready';
      Icon = CheckCircle2;
      colorClasses = 'bg-emerald-950/40 text-emerald-300 border-emerald-800/50';
    } else if (conclusion === 'failure') {
      state = 'failure';
      label = 'Failed';
      Icon = XCircle;
      colorClasses = 'bg-rose-950/40 text-rose-300 border-rose-800/50';
    } else if (conclusion === 'cancelled') {
      state = 'cancelled';
      label = 'Cancelled';
      Icon = Slash;
      colorClasses = 'bg-zinc-800/60 text-zinc-400 border-zinc-700/60';
    } else if (conclusion === 'timed_out') {
      state = 'timed_out';
      label = 'Timed Out';
      Icon = AlertCircle;
      colorClasses = 'bg-amber-950/40 text-amber-300 border-amber-800/50';
    } else {
      label = conclusion || 'Completed';
      Icon = CheckCircle2;
      colorClasses = 'bg-slate-800 text-slate-300 border-slate-700';
    }
  }

  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4'
  };

  const textSizes = {
    xs: 'text-xs px-2 py-0.5 gap-1',
    sm: 'text-xs px-2.5 py-1 gap-1.5',
    md: 'text-sm px-3 py-1.5 gap-2'
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border shadow-sm ${colorClasses} ${textSizes[size] || textSizes.sm}`}
    >
      <Icon className={`${iconSizes[size] || iconSizes.sm} ${state === 'in_progress' ? 'animate-spin' : ''}`} />
      <span className="capitalize">{label}</span>
    </span>
  );
}
