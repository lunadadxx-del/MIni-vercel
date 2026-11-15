import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  Check
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E5E5E5]">
        <div>
          <h2 className="text-base font-semibold text-[#171717] flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#171717]" />
            <span>Build & Step Logs</span>
          </h2>
          <p className="text-xs text-[#666666] mt-0.5">
            Inspect real GitHub Actions pipeline jobs, individual steps, and console outputs.
          </p>
        </div>

        {/* Run Selector Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-[#666666] font-medium">Run:</label>
          <select
            value={selectedRunId || ''}
            onChange={(e) => setSearchParams({ runId: e.target.value })}
            className="px-2.5 py-1.5 rounded-md bg-white border border-[#E5E5E5] text-xs text-[#171717] focus:outline-none focus:border-[#171717] font-mono cursor-pointer"
          >
            {deployments.map((run) => (
              <option key={run.id} value={run.id}>
                #{run.runNumber} - {run.conclusion || run.status} ({run.headBranch} @ {run.shortSha})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Selected Run Banner */}
      {activeRun && (
        <div className="p-3.5 bg-white border border-[#E5E5E5] rounded-md flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <StatusBadge status={activeRun.status} conclusion={activeRun.conclusion} size="sm" />
            <div>
              <div className="font-semibold text-[#171717]">
                Run #{activeRun.runNumber}: {activeRun.name}
              </div>
              <div className="text-[11px] text-[#666666] font-mono mt-0.5">
                Commit: {activeRun.shortSha} &bull; {activeRun.commit?.message}
              </div>
            </div>
          </div>

          <a
            href={activeRun.htmlUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#FAFAFA] border border-[#E5E5E5] hover:bg-[#F5F5F5] text-xs text-[#171717] transition-colors"
          >
            <span>GitHub Actions</span>
            <ExternalLink className="w-3 h-3 text-[#888888]" />
          </a>
        </div>
      )}

      {/* Main Grid: Left Steps, Right Monospace Terminal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Step Breakdown (Left 5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="bg-white border border-[#E5E5E5] rounded-lg p-4">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#E5E5E5]">
              <h4 className="text-xs font-semibold text-[#171717] uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#666666]" />
                Job Steps
              </h4>
              {activeJob && (
                <span className="text-[11px] font-mono text-[#666666]">
                  {activeJob.durationSeconds}s
                </span>
              )}
            </div>

            {loadingJobs ? (
              <div className="py-8 text-center text-xs text-[#888888]">
                Loading steps...
              </div>
            ) : logError ? (
              <div className="p-3 rounded-md bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#DC2626]">
                {logError}
              </div>
            ) : !activeJob || !activeJob.steps || activeJob.steps.length === 0 ? (
              <div className="py-6 text-center text-xs text-[#888888]">
                No steps available.
              </div>
            ) : (
              <div className="space-y-1.5">
                {activeJob.steps.map((step) => {
                  const isSuccess = step.conclusion === 'success';
                  const isFailure = step.conclusion === 'failure';
                  const isInProgress = step.status === 'in_progress';

                  return (
                    <div
                      key={step.number}
                      className="p-2.5 rounded-md bg-[#FAFAFA] border border-[#E5E5E5] flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {isSuccess ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#15803D] flex-shrink-0" />
                        ) : isFailure ? (
                          <XCircle className="w-3.5 h-3.5 text-[#DC2626] flex-shrink-0" />
                        ) : isInProgress ? (
                          <Loader2 className="w-3.5 h-3.5 text-[#171717] animate-spin flex-shrink-0" />
                        ) : (
                          <Clock className="w-3.5 h-3.5 text-[#888888] flex-shrink-0" />
                        )}
                        <span className="font-medium text-[#171717] truncate">
                          {step.number}. {step.name}
                        </span>
                      </div>

                      <span
                        className={`font-mono text-[11px] capitalize ${
                          isSuccess
                            ? 'text-[#15803D]'
                            : isFailure
                            ? 'text-[#DC2626]'
                            : 'text-[#888888]'
                        }`}
                      >
                        {step.conclusion || step.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Monospace Log Viewer (Right 7 cols) */}
        <div className="lg:col-span-7 bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg flex flex-col overflow-hidden min-h-[440px]">
          {/* Header */}
          <div className="h-10 px-4 bg-white border-b border-[#E5E5E5] flex items-center justify-between text-xs">
            <span className="font-mono text-xs text-[#666666]">
              console.log &bull; {activeJob?.name || 'workflow-job'}
            </span>

            <div className="flex items-center gap-2">
              {logsText && (
                <>
                  <div className="relative hidden sm:block">
                    <Search className="w-3 h-3 text-[#888888] absolute left-2 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Filter lines..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-28 pl-6 pr-2 py-0.5 bg-white border border-[#E5E5E5] rounded text-[11px] text-[#171717] focus:outline-none focus:border-[#171717] font-mono"
                    />
                  </div>

                  <button
                    onClick={handleCopyLogs}
                    className="p-1 rounded text-[#666666] hover:text-[#171717] transition-colors"
                    title="Copy console output"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-[#15803D]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </>
              )}

              {activeJob?.htmlUrl && (
                <a
                  href={activeJob.htmlUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 rounded text-[#888888] hover:text-[#171717] transition-colors"
                  title="Open Job on GitHub"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>

          {/* Body */}
          <div className="p-4 flex-1 overflow-y-auto font-mono text-[11px] leading-relaxed select-text text-[#171717] bg-[#FAFAFA]">
            {loadingLogs ? (
              <div className="flex items-center justify-center h-full text-[#666666] gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#171717]" />
                <span>Loading logs from GitHub API...</span>
              </div>
            ) : logsText ? (
              <pre className="whitespace-pre-wrap break-all">{filteredLogs || logsText}</pre>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-2.5">
                <Terminal className="w-7 h-7 text-[#888888]" />
                <div className="max-w-md">
                  <h5 className="text-xs font-semibold text-[#171717]">
                    Raw Console Stream
                  </h5>
                  <p className="text-[11px] text-[#666666] mt-0.5">
                    GitHub Actions stores raw archives for 90 days. You can inspect live logs directly in GitHub Actions.
                  </p>
                </div>
                {activeJob?.htmlUrl && (
                  <a
                    href={activeJob.htmlUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-[#171717] text-white text-xs font-medium hover:bg-[#262626] transition-colors"
                  >
                    <span>View GitHub Actions Console</span>
                    <ExternalLink className="w-3 h-3" />
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
