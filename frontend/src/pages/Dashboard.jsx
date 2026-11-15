import React from 'react';
import { Link } from 'react-router-dom';
import {
  Rocket,
  CheckCircle2,
  XCircle,
  Clock,
  GitCommit,
  ExternalLink,
  FolderGit2,
  Terminal,
  ChevronRight,
  Server,
  Plus
} from 'lucide-react';
import MetricCard from '../components/MetricCard';
import StatusBadge from '../components/StatusBadge';
import ErrorAlert from '../components/ErrorAlert';

export default function Dashboard({
  projects = [],
  selectedProjectId,
  onSelectProject,
  activeProject,
  deployments = [],
  commits = [],
  health,
  loading,
  error,
  onOpenDeploy,
  onOpenImportModal
}) {
  const project = activeProject || projects[0] || null;
  const latestRun = deployments[0] || null;

  // Real telemetry metrics
  const totalConfiguredProjects = projects.length || (project ? 1 : 0);
  const successfulRuns = deployments.filter((d) => d.conclusion === 'success').length;
  const failedRuns = deployments.filter((d) => d.conclusion === 'failure').length;

  const latestExecutionTime = latestRun
    ? `${latestRun.durationSeconds}s`
    : '—';

  return (
    <div className="space-y-6">
      
      {/* Unconfigured Alert */}
      {health && !health.configuration?.githubRepository && (
        <ErrorAlert
          type="warning"
          title="GitHub Integration Not Configured"
          message="Set GITHUB_OWNER, GITHUB_REPO, and GITHUB_TOKEN in your backend environment variables to enable live CI/CD monitoring."
          action={
            <Link
              to="/settings"
              className="inline-flex items-center gap-1 text-xs font-medium text-[#171717] hover:underline"
            >
              Configure in Settings <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          }
        />
      )}

      {/* Overview Header Card */}
      <div className="bg-white border border-[#E5E5E5] rounded-lg p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#666666]">
                Deployment Platform
              </span>
              <span className="text-[#E5E5E5]">•</span>
              <span className="text-xs text-[#666666]">Vercel-Inspired CI/CD</span>
            </div>
            <h2 className="text-lg font-semibold text-[#171717] tracking-tight">
              {project ? project.fullName : 'College DevOps Demo'}
            </h2>
            <p className="text-xs text-[#666666] mt-0.5 max-w-2xl">
              {project?.description ||
                'Automated deployment platform using Docker containerization, GitHub Actions, and Render cloud hosting.'}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            {onOpenImportModal && (
              <button
                onClick={onOpenImportModal}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#FAFAFA] text-[#171717] text-xs font-medium rounded-md border border-[#E5E5E5] transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Project</span>
              </button>
            )}

            {project?.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#171717] hover:bg-[#262626] text-white text-xs font-medium rounded-md transition-colors"
              >
                <span>Visit Live Site</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            {project?.repoUrl && (
              <a
                href={project.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#FAFAFA] text-[#171717] text-xs font-medium rounded-md border border-[#E5E5E5] transition-colors"
              >
                <FolderGit2 className="w-3.5 h-3.5 text-[#666666]" />
                <span>GitHub Repo</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <MetricCard
          title="Total Projects"
          value={totalConfiguredProjects}
          subtitle={project ? `Active: ${project.name}` : 'No repo connected'}
          icon={FolderGit2}
        />

        <MetricCard
          title="Successful Workflows"
          value={successfulRuns}
          subtitle={`Across recent ${deployments.length} runs`}
          icon={CheckCircle2}
        />

        <MetricCard
          title="Failed Workflows"
          value={failedRuns}
          subtitle="Pipeline error tracking"
          icon={XCircle}
        />

        <MetricCard
          title="Latest Run Duration"
          value={latestExecutionTime}
          subtitle={latestRun ? `Run #${latestRun.runNumber}` : 'Awaiting trigger'}
          icon={Clock}
        />
      </div>

      {/* Grid: Latest Deployment & Backend Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Latest Deployment */}
        <div className="lg:col-span-2 bg-white border border-[#E5E5E5] rounded-lg p-5">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E5E5E5]">
            <h3 className="text-xs font-semibold text-[#171717] uppercase tracking-wider">
              Latest Deployment
            </h3>
            <Link
              to="/deployments"
              className="text-xs text-[#171717] hover:underline flex items-center gap-1 font-medium"
            >
              All Runs <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="py-10 text-center text-xs text-[#888888]">
              Loading deployment telemetry...
            </div>
          ) : latestRun ? (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-md bg-[#FAFAFA] border border-[#E5E5E5]">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-[#171717]">
                      Run #{latestRun.runNumber} — {latestRun.name}
                    </span>
                    <StatusBadge status={latestRun.status} conclusion={latestRun.conclusion} />
                  </div>
                  <p className="text-xs text-[#666666] font-mono">
                    Commit: {latestRun.shortSha} ({latestRun.headBranch}) &bull; {latestRun.commit?.message}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/logs?runId=${latestRun.id}`}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-[#E5E5E5] hover:bg-[#FAFAFA] text-xs text-[#171717] transition-colors"
                  >
                    <Terminal className="w-3 h-3 text-[#666666]" />
                    <span>Logs</span>
                  </Link>

                  <a
                    href={latestRun.htmlUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 rounded text-[#666666] hover:text-[#171717] transition-colors"
                    title="Open on GitHub"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-md bg-[#FAFAFA] border border-[#E5E5E5]">
                  <span className="text-[#888888] block text-[10px] uppercase font-semibold">Event Trigger</span>
                  <span className="text-[#171717] font-mono mt-0.5 block">{latestRun.event}</span>
                </div>
                <div className="p-3 rounded-md bg-[#FAFAFA] border border-[#E5E5E5]">
                  <span className="text-[#888888] block text-[10px] uppercase font-semibold">Actor</span>
                  <span className="text-[#171717] font-mono mt-0.5 block">{latestRun.actor?.login}</span>
                </div>
                <div className="p-3 rounded-md bg-[#FAFAFA] border border-[#E5E5E5]">
                  <span className="text-[#888888] block text-[10px] uppercase font-semibold">Duration</span>
                  <span className="text-[#171717] font-mono mt-0.5 block">{latestRun.durationSeconds}s</span>
                </div>
                <div className="p-3 rounded-md bg-[#FAFAFA] border border-[#E5E5E5]">
                  <span className="text-[#888888] block text-[10px] uppercase font-semibold">Timestamp</span>
                  <span className="text-[#171717] font-mono mt-0.5 block">
                    {new Date(latestRun.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-[#888888]">
              No GitHub Actions runs recorded.
            </div>
          )}
        </div>

        {/* Backend Health Status */}
        <div className="bg-white border border-[#E5E5E5] rounded-lg p-5">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E5E5E5]">
            <h3 className="text-xs font-semibold text-[#171717] uppercase tracking-wider flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-[#666666]" />
              Backend Health
            </h3>
            <span
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                health?.status === 'ok'
                  ? 'bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0]'
                  : 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${health?.status === 'ok' ? 'bg-[#15803D]' : 'bg-[#DC2626]'}`} />
              {health?.status === 'ok' ? 'Healthy' : 'Disconnected'}
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-[#E5E5E5]/60">
              <span className="text-[#666666]">Uptime</span>
              <span className="font-mono text-[#171717]">
                {health?.uptimeSeconds ? `${health.uptimeSeconds}s` : '—'}
              </span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-[#E5E5E5]/60">
              <span className="text-[#666666]">Environment</span>
              <span className="font-mono text-[#171717] uppercase text-[11px]">
                {health?.environment || 'development'}
              </span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-[#E5E5E5]/60">
              <span className="text-[#666666]">GitHub Telemetry</span>
              <span className={`font-mono text-[11px] font-medium ${health?.configuration?.githubRepository ? 'text-[#15803D]' : 'text-[#B45309]'}`}>
                {health?.configuration?.githubRepository ? 'Connected' : 'Missing Env'}
              </span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-[#666666]">Admin Auth</span>
              <span className={`font-mono text-[11px] font-medium ${health?.configuration?.adminSecretConfigured ? 'text-[#15803D]' : 'text-[#DC2626]'}`}>
                {health?.configuration?.adminSecretConfigured ? 'Protected' : 'Missing'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity / Commits */}
      <div className="bg-white border border-[#E5E5E5] rounded-lg p-5">
        <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-[#E5E5E5]">
          <h3 className="text-xs font-semibold text-[#171717] uppercase tracking-wider flex items-center gap-1.5">
            <GitCommit className="w-3.5 h-3.5 text-[#666666]" />
            Recent Repository Commits
          </h3>
          <span className="text-[11px] text-[#666666] font-mono">
            {project?.branch || 'main'} branch
          </span>
        </div>

        {commits.length === 0 ? (
          <div className="py-6 text-center text-xs text-[#888888]">
            No recent commits fetched.
          </div>
        ) : (
          <div className="divide-y divide-[#E5E5E5]">
            {commits.slice(0, 5).map((commit) => (
              <div
                key={commit.sha}
                className="py-2.5 flex items-center justify-between gap-4 text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <GitCommit className="w-3.5 h-3.5 text-[#888888] flex-shrink-0" />
                  <span className="font-medium text-[#171717] truncate">
                    {commit.message}
                  </span>
                  <span className="text-[11px] text-[#888888] flex-shrink-0">
                    by {commit.author?.name || 'Developer'} &bull; {new Date(commit.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </span>
                </div>

                <a
                  href={commit.htmlUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs text-[#171717] hover:underline flex items-center gap-1 flex-shrink-0"
                >
                  {commit.shortSha}
                  <ExternalLink className="w-3 h-3 text-[#888888]" />
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
