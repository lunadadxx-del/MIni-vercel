import React from 'react';

export default function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  badge
}) {
  return (
    <div className="bg-white border border-[#E5E5E5] rounded-md p-4 transition-colors hover:border-[#CCCCCC]">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-[#666666]">
          {title}
        </span>
        {Icon && (
          <Icon className="w-4 h-4 text-[#888888]" />
        )}
      </div>

      <div className="flex items-baseline justify-between">
        <div className="text-2xl font-semibold text-[#171717] tracking-tight font-mono">
          {value}
        </div>
        {badge && (
          <div>{badge}</div>
        )}
      </div>

      {subtitle && (
        <p className="mt-1 text-xs text-[#666666] truncate">
          {subtitle}
        </p>
      )}
    </div>
  );
}
