import React from 'react';
import { useLocation } from 'react-router-dom';
import { Rocket, RefreshCw, GitBranch, Plus, Layers } from 'lucide-react';

export default function Navbar({
  projects = [],
  selectedProjectId,
  onSelectProject,
  activeProject,
  onOpenDeployModal,
  onOpenImportModal,
  onRefresh,
  isRefreshing
}) {
  const location = useLocation();

  const getPageTitle = (path) => {
    switch (path) {
      case '/':
        return 'Overview';
      case '/projects':
        return 'Projects';
      case '/deployments':
        return 'Deployments';
      case '/logs':
        return 'Build Logs';
      case '/settings':
        return 'Settings';
      default:
        return 'Platform';
    }
  };

  return (
    <header className="h-14 bg-white border-b border-[#E5E5E5] sticky top-0 z-30 px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h1 className="text-xs font-semibold text-[#171717] tracking-tight">
          {getPageTitle(location.pathname)}
        </h1>

        {/* Project Selector dropdown in Navbar */}
        {projects.length > 0 && (
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-[#E5E5E5]">/</span>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#FAFAFA] border border-[#E5E5E5] text-xs">
              <Layers className="w-3.5 h-3.5 text-[#666666]" />
              <select
                value={selectedProjectId || projects[0]?.id}
                onChange={(e) => onSelectProject && onSelectProject(e.target.value)}
                className="bg-transparent text-[#171717] font-medium focus:outline-none cursor-pointer text-xs"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id} className="bg-white text-[#171717]">
                    {p.name}
                  </option>
                ))}
              </select>
              {activeProject && (
                <span className="flex items-center gap-1 text-[11px] text-[#666666] font-mono ml-1 border-l border-[#E5E5E5] pl-2">
                  <GitBranch className="w-3 h-3 text-[#888888]" />
                  {activeProject.branch || 'main'}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2.5">
        {/* Refresh button */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="p-1.5 text-[#666666] hover:text-[#171717] rounded-md hover:bg-[#F5F5F5] border border-transparent hover:border-[#E5E5E5] transition-colors disabled:opacity-50"
          title="Refresh telemetry"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#171717]' : ''}`} />
        </button>

        {/* New Project / Import Git Repo button */}
        {onOpenImportModal && (
          <button
            onClick={onOpenImportModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#FAFAFA] text-[#171717] border border-[#E5E5E5] text-xs font-medium rounded-md transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Project</span>
          </button>
        )}

        {/* Deploy Action Button (Vercel Style: Solid Black, White Text) */}
        <button
          onClick={onOpenDeployModal}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#171717] hover:bg-[#262626] text-white text-xs font-medium rounded-md transition-colors"
        >
          <Rocket className="w-3.5 h-3.5" />
          <span>Deploy</span>
        </button>
      </div>
    </header>
  );
}
