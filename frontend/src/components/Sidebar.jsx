import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderGit2,
  Rocket,
  Terminal,
  Settings,
  ExternalLink,
  Server
} from 'lucide-react';

export default function Sidebar({ health, liveUrl }) {
  const navItems = [
    { to: '/', label: 'Overview', icon: LayoutDashboard },
    { to: '/projects', label: 'Projects', icon: FolderGit2 },
    { to: '/deployments', label: 'Deployments', icon: Rocket },
    { to: '/logs', label: 'Build Logs', icon: Terminal },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  const isBackendHealthy = health?.status === 'ok';

  return (
    <aside className="w-60 bg-white border-r border-[#E5E5E5] flex flex-col h-screen fixed left-0 top-0 z-40 select-none">
      
      {/* Brand Header */}
      <div className="h-14 px-5 flex items-center justify-between border-b border-[#E5E5E5]">
        <div className="flex items-center gap-2.5">
          {/* Minimalist Vercel Triangle Logo */}
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
            <path d="M12 3L22 20H2L12 3Z" fill="#171717" />
          </svg>
          <span className="font-semibold text-sm tracking-tight text-[#171717]">
            Mini Vercel
          </span>
        </div>
        <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#FAFAFA] text-[#666666] border border-[#E5E5E5] font-medium">
          v1.0
        </span>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-2 pb-2 text-[11px] font-medium tracking-wider text-[#888888] uppercase">
          Platform
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs transition-colors ${
                  isActive
                    ? 'bg-[#F5F5F5] text-[#171717] font-semibold'
                    : 'text-[#666666] hover:text-[#171717] hover:bg-[#FAFAFA] font-medium'
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}

        {/* Live Application External Link */}
        {liveUrl && (
          <div className="pt-5">
            <div className="px-2 pb-2 text-[11px] font-medium tracking-wider text-[#888888] uppercase">
              Production Host
            </div>
            <a
              href={liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-2.5 py-2 rounded-md text-xs font-medium text-[#666666] hover:text-[#171717] hover:bg-[#FAFAFA] transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <ExternalLink className="w-4 h-4 text-[#888888]" />
                <span className="truncate">Live Site</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#FAFAFA] text-[#666666] border border-[#E5E5E5] font-mono">
                Render
              </span>
            </a>
          </div>
        )}
      </div>

      {/* System Status Footer */}
      <div className="p-3 border-t border-[#E5E5E5] bg-[#FAFAFA]">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[#666666] font-medium flex items-center gap-1.5 text-[11px]">
            <Server className="w-3.5 h-3.5 text-[#888888]" />
            API Service
          </span>
          <span className="flex items-center gap-1.5 text-[11px] font-medium">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isBackendHealthy ? 'bg-[#15803D]' : 'bg-[#DC2626]'
              }`}
            />
            <span className={isBackendHealthy ? 'text-[#15803D]' : 'text-[#DC2626]'}>
              {isBackendHealthy ? 'Online' : 'Offline'}
            </span>
          </span>
        </div>
        <div className="text-[10px] text-[#888888] font-mono mt-1">
          Docker • GitHub Actions • Render
        </div>
      </div>
    </aside>
  );
}
