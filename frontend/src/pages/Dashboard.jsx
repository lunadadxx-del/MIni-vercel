import React from 'react';
import { Link } from 'react-router-dom';
import {
  Rocket,
  CheckCircle2,
  XCircle,
  Clock,
  Activity,
  GitCommit,
  ExternalLink,
  FolderGit2,
  Terminal,
  ShieldCheck,
  ChevronRight,
  Server
} from 'lucide-react';
import MetricCard from '../components/MetricCard';
import StatusBadge from '../components/StatusBadge';
import ErrorAlert from '../components/ErrorAlert';

export default function Dashboard({
  project,
  deployments = [],
  commits = [],
  health,
  loading,
  error,
  onOpenDeploy
}) {
  const latestRun = deployments[0] || null;

  // Compute metrics from actual fetched GitHub data
  const totalConfiguredProjects = project ? 1 : 0;
  const successfulRuns = deployments.filter((d) => d.conclusion === 'success').length;
  const failedRuns = deployments.filter((d) => d.conclusion === 'failure').length;

  const latestStatus = latestRun
    ? latestRun.status === 'completed'
      ? latestRun.conclusion
      : latestRun.status
    : 'No runs yet';

  const latestExecutionTime = latestRun
    ? `${latestRun.durationSeconds}s`
    : '—';

  return (
    <div className="space-y-6">
      
      {/* Configuration notice if not fully set up */}
      {health && !health.configuration?.githubRepository && (
        <ErrorAlert
          type="warning"
          title="GitHub Integration Not Configured"
          message="Set GITHUB_OWNER, GITHUB_REPO, and GITHUB_TOKEN in your backend environment variables to enable live CI/CD monitoring and automated deployments."
          action={
            <Link
              to="/settings"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-300 hover:text-white underline underline-offset-4"
            >
              Configure in Settings <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          }
        />
      )}

      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-[#12192c] via-[#101524] to-[#0d121f] border border-card-border rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                DeployFlow Platform
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-xs text-slate-400">Automated Web Application Deployment</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              {project ? project.fullName : 'College DevOps Demo'}
            </h2>
            <p className="text-xs md:text-sm text-slate-400 mt-1 max-w-2xl">
              {project?.description ||
                'Full-stack demonstration featuring Docker containerization, GitHub Actions automated CI/CD pipeline, and Render cloud hosting.'}
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-center">
            {project?.liveUrl ? (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 bg-card hover:bg-slate-800 text-slate-200 text-xs font-medium rounded-xl border border-card-border transition-all hover:border-slate-600"
              >
                <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                <span>Visit Live App</span>
              </a>
            ) : null}

            {project?.repoUrl && (
              <a
                href={project.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 bg-card hover:bg-slate-800 text-slate-200 text-xs font-medium rounded-xl border border-card-border transition-all hover:border-slate-600"
              >
                <FolderGit2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>GitHub Repo</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Configured Projects"
          value={totalConfiguredProjects}
          subtitle={project ? `Target: ${project.name}` : 'No repo connected'}
          icon={FolderGit2}
          color="indigo"
        />

        <MetricCard
          title="Successful Runs"
          value={successfulRuns}
          subtitle={`Across recent ${deployments.length} runs`}
          icon={CheckCircle2}
          color="emerald"
        />

        <MetricCard
          title="Failed Runs"
          value={failedRuns}
          subtitle="Pipeline errors detected"
          icon={XCircle}
          color="rose"
        />

        <MetricCard
          title="Latest Run Duration"
          value={latestExecutionTime}
          subtitle={latestRun ? `Run #${latestRun.runNumber}` : 'Awaiting trigger'}
          icon={Clock}
          color="blue"
        />
      </div>

      {/* Secondary Status Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Latest Deployment Status Card */}
        <div className="lg:col-span-2 bg-card border border-card-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-card-border">
            <div className="flex items-center gap-2.5">
              <Rocket className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-semibold text-white">Latest Deployment Status</h3>
            </div>
            <Link
              to="/deployments"
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
            >
              All Runs <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-slate-500 animate-pulse">
              Querying GitHub Actions telemetry...
            </div>
          ) : latestRun ? (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#0b101c] border border-card-border">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-white">
                      Run #{latestRun.runNumber} — {latestRun.name}
                    </span>
                    <StatusBadge status={latestRun.status} conclusion={latestRun.conclusion} />
                  </div>
                  <p className="text-xs text-slate-400 font-mono">
                    Commit: {latestRun.shortSha} ({latestRun.headBranch})
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/logs?runId=${latestRun.id}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card border border-card-border hover:border-slate-600 text-xs text-slate-300 hover:text-white transition-all"
                  >
                    <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Inspect Logs</span>
                  </Link>

                  <a
                    href={latestRun.htmlUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    title="Open in GitHub Actions"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-[#0a0f1d] border border-card-border">
                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">Event Trigger</span>
                  <span className="text-slate-200 font-mono mt-0.5 block">{latestRun.event}</span>
                </div>
                <div className="p-3 rounded-lg bg-[#0a0f1d] border border-card-border">
                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">Actor</span>
                  <span className="text-slate-200 font-mono mt-0.5 block">{latestRun.actor.login}</span>
                </div>
                <div className="p-3 rounded-lg bg-[#0a0f1d] border border-card-border">
                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">Duration</span>
                  <span className="text-slate-200 font-mono mt-0.5 block">{latestRun.durationSeconds}s</span>
                </div>
                <div className="p-3 rounded-lg bg-[#0a0f1d] border border-card-border">
                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">Timestamp</span>
                  <span className="text-slate-200 font-mono mt-0.5 block">
                    {new Date(latestRun.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-400">
              No GitHub Actions workflow runs found. Push code or trigger a deployment to begin.
            </div>
          )}
        </div>

        {/* Backend Health & Connectivity Card */}
        <div className="bg-card border border-card-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-card-border">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-white">Backend Health</h3>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
                health?.status === 'ok'
                  ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/50'
                  : 'bg-rose-950/40 text-rose-300 border border-rose-800/50'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${health?.status === 'ok' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
              {health?.status === 'ok' ? 'Healthy' : 'Disconnected'}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-1.5 border-b border-card-border/50">
              <span className="text-slate-400">Uptime</span>
              <span className="font-mono text-slate-200">
                {health?.uptimeSeconds ? `${health.uptimeSeconds} seconds` : '—'}
              </span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-card-border/50">
              <span className="text-slate-400">Environment</span>
              <span className="font-mono text-indigo-300 uppercase text-[11px]">
                {health?.environment || 'development'}
              </span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-card-border/50">
              <span className="text-slate-400">GitHub API Status</span>
              <span className={`font-mono text-[11px] ${health?.configuration?.githubRepository ? 'text-emerald-400' : 'text-amber-400'}`}>
                {health?.configuration?.githubRepository ? 'Configured' : 'Missing Env'}
              </span>
            </div>
            <div className="flex items-center justify-between py-1.5">
              <span className="text-slate-400">Admin Secret Auth</span>
              <span className={`font-mono text-[11px] ${health?.configuration?.adminSecretConfigured ? 'text-emerald-400' : 'text-rose-400'}`}>
                {health?.configuration?.adminSecretConfigured ? 'Protected' : 'Missing'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent GitHub Commits Feed */}
      <div className="bg-card border border-card-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-card-border">
          <div className="flex items-center gap-2">
            <GitCommit className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-semibold text-white">Recent Git Commits</h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {project?.branch || 'main'} branch
          </span>
        </div>

        {commits.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500">
            {health?.configuration?.githubRepository
              ? 'No commits found or awaiting GitHub API response.'
              : 'Configure GitHub repository in Settings to view commits.'}
          </div>
        ) : (
          <div className="space-y-3">
            {commits.slice(0, 5).map((commit) => (
              <div
                key={commit.sha}
                className="flex items-start justify-between gap-4 p-3 rounded-lg hover:bg-slate-800/40 border border-transparent hover:border-card-border transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 mt-0.5">
                    <GitCommit className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-200 line-clamp-1">
                      {commit.message}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                      <span>{commit.author.name}</span>
                      <span>•</span>
                      <span>
                        {new Date(commit.date).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <a
                  href={commit.htmlUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 hover:underline"
                >
                  {commit.shortSha}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
