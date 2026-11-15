import React from 'react';
import { Link } from 'react-router-dom';
import {
  Rocket,
  GitBranch,
  GitCommit,
  Clock,
  ExternalLink,
  Terminal,
  User,
  RefreshCw,
  Search,
  Filter
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';

export default function Deployments({
  deployments = [],
  projects = [],
  selectedWorkflowFilter = 'all',
  onSelectWorkflowFilter,
  loading,
  error,
  onRefresh,
  onOpenDeploy
}) {
  const filteredDeployments = deployments.filter((run) => {
    if (selectedWorkflowFilter === 'all') return true;
    if (selectedWorkflowFilter === 'demo') {
      return run.name?.toLowerCase().includes('demo') || run.name?.toLowerCase().includes('portfolio');
    }
    if (selectedWorkflowFilter === 'platform') {
      return !run.name?.toLowerCase().includes('demo') && !run.name?.toLowerCase().includes('portfolio');
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-card-border">
        <div>
          <h2 className="text-lg font-bold text-white">Deployments & Workflow Runs</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time GitHub Actions CI/CD workflow executions for the configured repository.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onRefresh}
            className="flex items-center gap-2 px-3 py-2 bg-card hover:bg-slate-800 text-slate-300 text-xs font-medium rounded-xl border border-card-border transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>

          <button
            onClick={onOpenDeploy}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md transition-all"
          >
            <Rocket className="w-3.5 h-3.5" />
            <span>Trigger New Deploy</span>
          </button>
        </div>
      </div>

      {/* Workflow Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onSelectWorkflowFilter && onSelectWorkflowFilter('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
            selectedWorkflowFilter === 'all'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-card text-slate-400 hover:text-white border border-card-border'
          }`}
        >
          All Runs ({deployments.length})
        </button>
        <button
          onClick={() => onSelectWorkflowFilter && onSelectWorkflowFilter('demo')}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
            selectedWorkflowFilter === 'demo'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-card text-slate-400 hover:text-white border border-card-border'
          }`}
        >
          Demo Portfolio Runs
        </button>
        <button
          onClick={() => onSelectWorkflowFilter && onSelectWorkflowFilter('platform')}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
            selectedWorkflowFilter === 'platform'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-card text-slate-400 hover:text-white border border-card-border'
          }`}
        >
          Platform Runs
        </button>
      </div>

      {/* Deployments Table / Card List */}
      <div className="bg-card border border-card-border rounded-2xl overflow-hidden shadow-sm">
        {loading && filteredDeployments.length === 0 ? (
          <div className="p-16 text-center text-xs text-slate-400 animate-pulse">
            Fetching workflow telemetry from GitHub Actions API...
          </div>
        ) : filteredDeployments.length === 0 ? (
          <div className="p-16 text-center text-xs text-slate-400">
            No workflow runs recorded yet. Click "Trigger New Deploy" or push a commit to trigger CI/CD.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-card-border bg-[#0d1326]/60 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-4">Run #</th>
                  <th className="py-3.5 px-4">Commit / Ref</th>
                  <th className="py-3.5 px-4">Trigger Event</th>
                  <th className="py-3.5 px-4">Duration</th>
                  <th className="py-3.5 px-4">Created</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-card-border">
                {filteredDeployments.map((run) => (
                  <tr
                    key={run.id}
                    className="hover:bg-slate-800/30 transition-colors group"
                  >
                    {/* Status Badge */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <StatusBadge status={run.status} conclusion={run.conclusion} size="sm" />
                    </td>

                    {/* Run Number & Name */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="font-semibold text-white">#{run.runNumber}</div>
                      <div className="text-[11px] text-slate-400 line-clamp-1 max-w-[160px]">
                        {run.name}
                      </div>
                    </td>

                    {/* Commit & Branch */}
                    <td className="py-4 px-4">
                      <div className="text-slate-200 font-medium line-clamp-1 max-w-[240px]">
                        {run.commit.message}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400 font-mono">
                        <span className="flex items-center gap-1 text-indigo-400">
                          <GitBranch className="w-3 h-3" />
                          {run.headBranch}
                        </span>
                        <span>•</span>
                        <span>{run.shortSha}</span>
                      </div>
                    </td>

                    {/* Trigger Event & Actor */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="inline-block px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[11px] font-mono text-slate-300">
                        {run.event}
                      </span>
                      <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>{run.actor.login}</span>
                      </div>
                    </td>

                    {/* Duration */}
                    <td className="py-4 px-4 whitespace-nowrap text-slate-300 font-mono">
                      {run.durationSeconds}s
                    </td>

                    {/* Created Time */}
                    <td className="py-4 px-4 whitespace-nowrap text-slate-400">
                      <div>
                        {new Date(run.createdAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {new Date(run.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/logs?runId=${run.id}`}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card border border-card-border hover:border-slate-600 text-slate-300 hover:text-white transition-all text-xs"
                          title="Inspect Job Steps & Logs"
                        >
                          <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Logs</span>
                        </Link>

                        <a
                          href={run.htmlUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          title="View on GitHub Actions"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
