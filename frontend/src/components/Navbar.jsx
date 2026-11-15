import React from 'react';
import { useLocation } from 'react-router-dom';
import { Rocket, RefreshCw, GitBranch, Github, Layers } from 'lucide-react';

export default function Navbar({
  projects = [],
  selectedProjectId,
  onSelectProject,
  activeProject,
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

        {/* Project Selector dropdown in Navbar */}
        {projects.length > 0 && (
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-slate-600">/</span>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-card border border-card-border text-xs">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <select
                value={selectedProjectId || projects[0]?.id}
                onChange={(e) => onSelectProject && onSelectProject(e.target.value)}
                className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer text-xs"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id} className="bg-[#0e1422] text-slate-200">
                    {p.name}
                  </option>
                ))}
              </select>
              {activeProject && (
                <span className="flex items-center gap-1 text-[11px] text-slate-400 font-mono ml-1 border-l border-slate-700 pl-2">
                  <GitBranch className="w-3 h-3 text-indigo-400" />
                  {activeProject.branch || 'main'}
                </span>
              )}
            </div>
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
