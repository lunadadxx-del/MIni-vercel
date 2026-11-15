import React from 'react';
import {
  FolderGit2,
  ExternalLink,
  GitBranch,
  Star,
  GitFork,
  AlertCircle,
  CheckCircle2,
  Globe,
  FileCode2,
  Info,
  Server,
  Layers
} from 'lucide-react';
import ErrorAlert from '../components/ErrorAlert';

export default function Projects({ project, health, loading }) {
  return (
    <div className="space-y-6">
      
      {/* Header Info Banner */}
      <div className="border border-card-border bg-card rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white">Configured Projects</h2>
            <p className="text-xs text-slate-400 mt-1">
              Active repository configured for continuous integration, Docker containerization, and Render hosting.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300">
            <Info className="w-3.5 h-3.5 text-indigo-400" />
            <span>Single-Repository Demo Mode (Preconfigured)</span>
          </div>
        </div>
      </div>

      {/* Scope Disclaimer / College Demonstration Note */}
      <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl text-xs text-slate-400 flex items-start gap-3">
        <Info className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
        <p>
          <strong className="text-slate-200">DevOps Architecture Notice:</strong> In this college demonstration project, DeployFlow is wired to manage and monitor a single preconfigured repository. Deployments are orchestrated through GitHub Actions and containerized with Docker for Render deployment. Deploying arbitrary untrusted repositories is disabled by design for security.
        </p>
      </div>

      {/* Project Card */}
      {project ? (
        <div className="bg-card border border-card-border rounded-2xl p-6 shadow-sm hover:border-slate-700 transition-all">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-card-border">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-600/15 border border-indigo-500/20 text-indigo-400">
                  <FolderGit2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white font-mono">{project.fullName}</h3>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {project.visibility}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{project.description}</p>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-3">
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-md transition-all"
                >
                  <Globe className="w-4 h-4" />
                  <span>Open Live Application</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
                </a>
              )}

              {project.repoUrl && (
                <a
                  href={project.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl border border-card-border transition-all"
                >
                  <FolderGit2 className="w-4 h-4 text-indigo-400" />
                  <span>View on GitHub</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
                </a>
              )}
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-6 text-xs">
            <div className="p-3.5 rounded-xl bg-[#0a0f1d] border border-card-border">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block mb-1">
                Monitored Branch
              </span>
              <div className="flex items-center gap-1.5 text-slate-200 font-mono font-semibold">
                <GitBranch className="w-3.5 h-3.5 text-indigo-400" />
                <span>{project.branch || 'main'}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0a0f1d] border border-card-border">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block mb-1">
                CI/CD Workflow
              </span>
              <div className="flex items-center gap-1.5 text-slate-200 font-mono font-semibold">
                <FileCode2 className="w-3.5 h-3.5 text-purple-400" />
                <span>.github/workflows/{project.workflowId || 'deploy.yml'}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0a0f1d] border border-card-border">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block mb-1">
                Deployment Target
              </span>
              <div className="flex items-center gap-1.5 text-slate-200 font-mono font-semibold">
                <Server className="w-3.5 h-3.5 text-emerald-400" />
                <span>Render (Docker Web Service)</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0a0f1d] border border-card-border">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block mb-1">
                GitHub Repository Stats
              </span>
              <div className="flex items-center gap-3 text-slate-200 font-mono">
                <span className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-400" /> {project.stars ?? 0}
                </span>
                <span className="flex items-center gap-1">
                  <GitFork className="w-3.5 h-3.5 text-blue-400" /> {project.forks ?? 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center bg-card border border-card-border rounded-2xl">
          <FolderGit2 className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-white">No Repository Configured</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            Configure your target repository by setting GITHUB_OWNER and GITHUB_REPO in the backend .env configuration.
          </p>
        </div>
      )}
    </div>
  );
}
