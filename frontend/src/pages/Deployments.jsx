import React from 'react';
import { Link } from 'react-router-dom';
import {
  Rocket,
  GitBranch,
  ExternalLink,
  Terminal,
  RefreshCw,
  User
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E5E5]">
        <div>
          <h2 className="text-base font-semibold text-[#171717]">Deployments</h2>
          <p className="text-xs text-[#666666] mt-0.5">
            Real-time GitHub Actions CI/CD pipeline runs and build history.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white hover:bg-[#FAFAFA] text-[#171717] text-xs font-medium rounded-md border border-[#E5E5E5] transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : 'text-[#666666]'}`} />
            <span>Sync</span>
          </button>

          <button
            onClick={onOpenDeploy}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#171717] hover:bg-[#262626] text-white text-xs font-medium rounded-md transition-colors"
          >
            <Rocket className="w-3.5 h-3.5" />
            <span>Deploy</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onSelectWorkflowFilter && onSelectWorkflowFilter('all')}
          className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
            selectedWorkflowFilter === 'all'
              ? 'bg-[#171717] text-white'
              : 'bg-white text-[#666666] hover:text-[#171717] border border-[#E5E5E5]'
          }`}
        >
          All Runs ({deployments.length})
        </button>
        <button
          onClick={() => onSelectWorkflowFilter && onSelectWorkflowFilter('demo')}
          className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
            selectedWorkflowFilter === 'demo'
              ? 'bg-[#171717] text-white'
              : 'bg-white text-[#666666] hover:text-[#171717] border border-[#E5E5E5]'
          }`}
        >
          Demo Portfolio Runs
        </button>
        <button
          onClick={() => onSelectWorkflowFilter && onSelectWorkflowFilter('platform')}
          className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
            selectedWorkflowFilter === 'platform'
              ? 'bg-[#171717] text-white'
              : 'bg-white text-[#666666] hover:text-[#171717] border border-[#E5E5E5]'
          }`}
        >
          Platform Runs
        </button>
      </div>

      {/* Deployments Table */}
      <div className="bg-white border border-[#E5E5E5] rounded-lg overflow-hidden shadow-none">
        {loading && filteredDeployments.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#888888]">
            Loading workflow telemetry from GitHub Actions API...
          </div>
        ) : filteredDeployments.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#888888]">
            No workflow runs recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#E5E5E5] bg-[#FAFAFA] text-[#666666] font-medium text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-4">Run #</th>
                  <th className="py-3 px-4">Commit / Message</th>
                  <th className="py-3 px-4">Trigger</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Created</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5]">
                {filteredDeployments.map((run) => (
                  <tr key={run.id} className="hover:bg-[#FAFAFA] transition-colors">
                    {/* Status */}
                    <td className="py-3 px-5 whitespace-nowrap">
                      <StatusBadge status={run.status} conclusion={run.conclusion} size="xs" />
                    </td>

                    {/* Run Number */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-semibold text-[#171717]">#{run.runNumber}</span>
                      <div className="text-[11px] text-[#666666] truncate max-w-[140px]">{run.name}</div>
                    </td>

                    {/* Commit Message & Branch */}
                    <td className="py-3 px-4">
                      <div className="font-medium text-[#171717] line-clamp-1 max-w-[280px]">
                        {run.commit?.message}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[#666666] font-mono">
                        <span className="flex items-center gap-1 text-[#171717]">
                          <GitBranch className="w-3 h-3 text-[#888888]" />
                          {run.headBranch}
                        </span>
                        <span>&bull;</span>
                        <span>{run.shortSha}</span>
                      </div>
                    </td>

                    {/* Trigger Event */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-1.5 py-0.5 rounded bg-[#FAFAFA] border border-[#E5E5E5] text-[11px] font-mono text-[#171717]">
                        {run.event}
                      </span>
                      <div className="text-[11px] text-[#888888] mt-0.5 flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>{run.actor?.login}</span>
                      </div>
                    </td>

                    {/* Duration */}
                    <td className="py-3 px-4 whitespace-nowrap font-mono text-[#666666]">
                      {run.durationSeconds}s
                    </td>

                    {/* Created */}
                    <td className="py-3 px-4 whitespace-nowrap text-[#666666]">
                      <div>{new Date(run.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</div>
                      <div className="text-[11px] text-[#888888]">{new Date(run.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-5 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/logs?runId=${run.id}`}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-[#E5E5E5] hover:bg-[#FAFAFA] text-xs font-medium text-[#171717] transition-colors"
                        >
                          <Terminal className="w-3 h-3 text-[#666666]" />
                          <span>Logs</span>
                        </Link>

                        <a
                          href={run.htmlUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 rounded text-[#888888] hover:text-[#171717] transition-colors"
                          title="View on GitHub Actions"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
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
