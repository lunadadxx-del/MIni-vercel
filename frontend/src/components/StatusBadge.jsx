import React from 'react';
import { CheckCircle2, XCircle, Clock, Loader2, Slash, AlertCircle } from 'lucide-react';

export default function StatusBadge({ status, conclusion, size = 'sm' }) {
  let label = 'Unknown';
  let Icon = AlertCircle;
  let badgeClasses = 'bg-[#FAFAFA] text-[#666666] border-[#E5E5E5]';
  let dotColor = 'bg-[#666666]';
  let isSpinning = false;

  if (status === 'queued') {
    label = 'Queued';
    Icon = Clock;
    badgeClasses = 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]';
    dotColor = 'bg-[#B45309]';
  } else if (status === 'in_progress') {
    label = 'Building';
    Icon = Loader2;
    badgeClasses = 'bg-[#F5F5F5] text-[#171717] border-[#E5E5E5]';
    dotColor = 'bg-[#171717]';
    isSpinning = true;
  } else if (status === 'completed') {
    if (conclusion === 'success') {
      label = 'Ready';
      Icon = CheckCircle2;
      badgeClasses = 'bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0]';
      dotColor = 'bg-[#15803D]';
    } else if (conclusion === 'failure') {
      label = 'Failed';
      Icon = XCircle;
      badgeClasses = 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]';
      dotColor = 'bg-[#DC2626]';
    } else if (conclusion === 'cancelled') {
      label = 'Cancelled';
      Icon = Slash;
      badgeClasses = 'bg-[#FAFAFA] text-[#666666] border-[#E5E5E5]';
      dotColor = 'bg-[#666666]';
    } else if (conclusion === 'timed_out') {
      label = 'Timed Out';
      Icon = AlertCircle;
      badgeClasses = 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]';
      dotColor = 'bg-[#B45309]';
    } else {
      label = conclusion || 'Completed';
      Icon = CheckCircle2;
      badgeClasses = 'bg-[#FAFAFA] text-[#171717] border-[#E5E5E5]';
      dotColor = 'bg-[#171717]';
    }
  }

  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4'
  };

  const textSizes = {
    xs: 'text-[11px] px-2 py-0.5 gap-1.5',
    sm: 'text-xs px-2.5 py-0.5 gap-1.5',
    md: 'text-xs px-3 py-1 gap-2'
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${badgeClasses} ${textSizes[size] || textSizes.sm}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor} ${isSpinning ? 'animate-ping' : ''}`} />
      <span className="capitalize">{label}</span>
    </span>
  );
}
