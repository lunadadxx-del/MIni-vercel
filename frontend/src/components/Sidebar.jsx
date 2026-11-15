import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderGit2,
  Rocket,
  Terminal,
  Settings,
  ExternalLink,
  Layers,
  Activity,
  Server
} from 'lucide-react';

export default function Sidebar({ health, liveUrl }) {
  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/projects', label: 'Projects', icon: FolderGit2 },
    { to: '/deployments', label: 'Deployments', icon: Rocket },
    { to: '/logs', label: 'Build Logs', icon: Terminal },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  const isBackendHealthy = health?.status === 'ok';

  return (
    <aside className="w-64 bg-[#0a0f1d] border-r border-card-border flex flex-col h-screen fixed left-0 top-0 z-40 select-none">
      
      {/* Brand Header */}
      <div className="h-16 px-6 flex items-center gap-3 border-b border-card-border">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-600/30">
          <Layers className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-sm tracking-tight text-white">DeployFlow</span>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold">
              Mini Vercel
            </span>
          </div>
          <span className="text-[11px] text-slate-400">DevOps Automation</span>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
          Platform Menu
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/20 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}

        {/* Live Application External Link */}
        {liveUrl && (
          <div className="pt-6">
            <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
              Production Host
            </div>
            <a
              href={liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/40 border border-transparent transition-all"
            >
              <div className="flex items-center gap-3">
                <ExternalLink className="w-4 h-4 text-emerald-400" />
                <span>Live App URL</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono">
                Render
              </span>
            </a>
          </div>
        )}
      </div>

      {/* System Status & Demo Badge Footer */}
      <div className="p-4 border-t border-card-border bg-[#0d1326]/60">
        <div className="p-3 rounded-xl bg-card border border-card-border/80">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-slate-500" />
              API Service
            </span>
            <span className="flex items-center gap-1 text-[11px]">
              <span
                className={`w-2 h-2 rounded-full ${
                  isBackendHealthy ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
                }`}
              />
              <span className={isBackendHealthy ? 'text-emerald-400' : 'text-rose-400'}>
                {isBackendHealthy ? 'Online' : 'Offline'}
              </span>
            </span>
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            Docker • Actions • Render
          </div>
        </div>
      </div>
    </aside>
  );
}
