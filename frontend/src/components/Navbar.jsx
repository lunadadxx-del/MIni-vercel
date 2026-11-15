import React from 'react';
import { useLocation } from 'react-router-dom';
import { Rocket, RefreshCw, GitBranch, Github, ExternalLink } from 'lucide-react';

export default function Navbar({
  project,
  onOpenDeployModal,
  onRefresh,
  isRefreshing
}) {
  const location = useLocation();

  const getPageTitle = (path) => {
    switch (path) {
      case '/':
        return 'Overview Dashboard';
      case '/projects':
        return 'Configured Projects';
      case '/deployments':
        return 'Deployment Runs';
      case '/logs':
        return 'Build & Job Logs';
      case '/settings':
        return 'Project & Service Settings';
      default:
        return 'DeployFlow Platform';
    }
  };

  return (
    <header className="h-16 bg-[#0a0f1d]/80 backdrop-blur-md border-b border-card-border sticky top-0 z-30 px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h1 className="text-sm font-semibold text-white tracking-tight">
          {getPageTitle(location.pathname)}
        </h1>

        {project && (
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-card border border-card-border text-xs text-slate-300">
            <Github className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-mono text-[11px] text-slate-200">{project.fullName || `${project.owner}/${project.name}`}</span>
            <span className="text-slate-600">|</span>
            <span className="flex items-center gap-1 font-mono text-[11px] text-indigo-400">
              <GitBranch className="w-3 h-3" />
              {project.branch || 'main'}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Refresh button */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 border border-transparent hover:border-card-border transition-colors disabled:opacity-50"
          title="Refresh telemetry"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
        </button>

        {/* Trigger Deploy Action */}
        <button
          onClick={onOpenDeployModal}
          className="flex items-center gap-2 px-3.5 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold rounded-lg shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Rocket className="w-3.5 h-3.5" />
          <span>Deploy</span>
        </button>
      </div>
    </header>
  );
}
