import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Terminal,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Loader2,
  Clock,
  Layers,
  Search,
  Copy,
  Check,
  AlertTriangle,
  ChevronRight
} from 'lucide-react';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge';

export default function BuildLogs({ deployments = [], loadingRuns }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedRunId = searchParams.get('runId') || (deployments[0] ? String(deployments[0].id) : null);

  const [jobsData, setJobsData] = useState(null);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [logsText, setLogsText] = useState(null);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [logError, setLogError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch jobs when selectedRunId changes
  useEffect(() => {
    if (!selectedRunId) return;

    let isMounted = true;
    setLoadingJobs(true);
    setJobsData(null);
    setLogsText(null);
    setLogError(null);

    api
      .getDeploymentJobs(selectedRunId)
      .then((data) => {
        if (!isMounted) return;
        setJobsData(data);
        if (data.jobs && data.jobs.length > 0) {
          setSelectedJobId(data.jobs[0].id);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setLogError(err.message || 'Failed to fetch job steps.');
      })
      .finally(() => {
        if (isMounted) setLoadingJobs(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedRunId]);

  // Fetch logs when selectedJobId changes
  useEffect(() => {
    if (!selectedJobId) return;

    let isMounted = true;
    setLoadingLogs(true);
    setLogsText(null);

    api
      .getJobLogs(selectedJobId)
      .then((logs) => {
        if (!isMounted) return;
        setLogsText(logs);
      })
      .catch((err) => {
        if (!isMounted) return;
        // Not all jobs have direct downloadable logs without tokens or if expired
        setLogsText(null);
      })
      .finally(() => {
        if (isMounted) setLoadingLogs(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedJobId]);

  const activeRun = deployments.find((d) => String(d.id) === String(selectedRunId));
  const activeJob = jobsData?.jobs?.find((j) => j.id === selectedJobId) || jobsData?.jobs?.[0];

  const handleCopyLogs = () => {
    if (!logsText) return;
    navigator.clipboard.writeText(logsText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredLogs = logsText
    ? logsText
        .split('\n')
        .filter((line) => line.toLowerCase().includes(searchTerm.toLowerCase()))
        .join('\n')
    : '';

  return (
    <div className="space-y-6">
      
      {/* Header & Run Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-card-border">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Terminal className="w-5 h-5 text-indigo-400" />
            <span>CI/CD Build & Step Logs</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Inspect real GitHub Actions workflow jobs, step-by-step executions, and build outputs.
          </p>
        </div>

        {/* Run Selector Dropdown */}
        <div className="flex items-center gap-3">
          <label className="text-xs text-slate-400 font-medium">Workflow Run:</label>
          <select
            value={selectedRunId || ''}
            onChange={(e) => setSearchParams({ runId: e.target.value })}
            className="px-3 py-1.5 rounded-xl bg-card border border-card-border text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
          >
            {deployments.map((run) => (
              <option key={run.id} value={run.id}>
                #{run.runNumber} - {run.conclusion || run.status} ({run.headBranch} @ {run.shortSha})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Selected Run Metadata Banner */}
      {activeRun && (
        <div className="p-4 bg-card border border-card-border rounded-xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <StatusBadge status={activeRun.status} conclusion={activeRun.conclusion} size="md" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-white">
                  Run #{activeRun.runNumber}: {activeRun.name}
                </h3>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Commit: {activeRun.shortSha} &bull; {activeRun.commit.message}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={activeRun.htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0b101d] border border-card-border hover:border-slate-600 text-xs text-slate-300 hover:text-white transition-all"
            >
              <span>View in GitHub Actions</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}

      {/* Main Grid: Left Steps Hierarchy, Right Raw Terminal View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Step Breakdown (Left 4 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-card border border-card-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-card-border">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                Pipeline Steps
              </h4>
              {activeJob && (
                <span className="text-[11px] font-mono text-slate-400">
                  Job Duration: {activeJob.durationSeconds}s
                </span>
              )}
            </div>

            {loadingJobs ? (
              <div className="py-12 text-center text-xs text-slate-500 animate-pulse">
                Loading job steps...
              </div>
            ) : logError ? (
              <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-900/40 text-xs text-rose-300">
                {logError}
              </div>
            ) : !activeJob || !activeJob.steps || activeJob.steps.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                No step details recorded for this workflow run.
              </div>
            ) : (
              <div className="space-y-2">
                {activeJob.steps.map((step) => {
                  const isSuccess = step.conclusion === 'success';
                  const isFailure = step.conclusion === 'failure';
                  const isSkipped = step.conclusion === 'skipped';
                  const isInProgress = step.status === 'in_progress';

                  return (
                    <div
                      key={step.number}
                      className="p-3 rounded-lg bg-[#0b101c] border border-card-border/80 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {isSuccess ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        ) : isFailure ? (
                          <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                        ) : isInProgress ? (
                          <Loader2 className="w-4 h-4 text-indigo-400 animate-spin flex-shrink-0" />
                        ) : (
                          <Clock className="w-4 h-4 text-slate-500 flex-shrink-0" />
                        )}
                        <span className="font-medium text-slate-200 truncate">
                          {step.number}. {step.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0 font-mono text-[11px]">
                        <span
                          className={`capitalize ${
                            isSuccess
                              ? 'text-emerald-400'
                              : isFailure
                              ? 'text-rose-400'
                              : 'text-slate-500'
                          }`}
                        >
                          {step.conclusion || step.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Terminal Raw Console Output (Right 7 cols) */}
        <div className="lg:col-span-7 bg-[#070b12] border border-card-border rounded-xl flex flex-col overflow-hidden min-h-[460px]">
          {/* Terminal Header */}
          <div className="h-11 px-4 bg-[#0d1322] border-b border-card-border flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              </div>
              <span className="font-mono text-slate-400 text-[11px] ml-2">
                console.log &bull; {activeJob?.name || 'workflow-job'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {logsText && (
                <>
                  <div className="relative hidden sm:block">
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Filter lines..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-32 pl-7 pr-2 py-0.5 bg-black/40 border border-slate-700 rounded text-[11px] text-white focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>

                  <button
                    onClick={handleCopyLogs}
                    className="p-1 rounded text-slate-400 hover:text-white transition-colors"
                    title="Copy console output"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </>
              )}

              {activeJob?.htmlUrl && (
                <a
                  href={activeJob.htmlUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 rounded text-slate-400 hover:text-white transition-colors"
                  title="Open Job in GitHub"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Terminal Body */}
          <div className="p-4 flex-1 overflow-y-auto font-mono text-[11px] leading-relaxed select-text text-slate-300">
            {loadingLogs ? (
              <div className="flex items-center justify-center h-full text-slate-500 gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                <span>Streaming live job logs from GitHub API...</span>
              </div>
            ) : logsText ? (
              <pre className="whitespace-pre-wrap break-all">{filteredLogs || logsText}</pre>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-3">
                <Terminal className="w-8 h-8 text-slate-600" />
                <div className="max-w-md">
                  <h5 className="text-xs font-semibold text-slate-300">
                    Raw Log Stream Unavailable or Archive Expired
                  </h5>
                  <p className="text-[11px] text-slate-500 mt-1">
                    GitHub Actions requires authenticated GITHUB_TOKEN permissions to stream raw archive logs, and logs are automatically purged after 90 days.
                  </p>
                </div>
                {activeJob?.htmlUrl && (
                  <a
                    href={activeJob.htmlUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 text-xs font-semibold hover:bg-indigo-600/30 transition-all"
                  >
                    <span>View Official GitHub Actions Logs</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
