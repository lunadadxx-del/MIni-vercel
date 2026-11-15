import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Shield,
  Key,
  FolderGit2,
  FileCode2,
  Globe,
  ExternalLink,
  Copy,
  Check,
  Terminal
} from 'lucide-react';
import { getSavedAdminSecret, saveAdminSecret } from '../services/api';

export default function Settings({ health, project, onRefresh }) {
  const [sessionSecret, setSessionSecret] = useState(getSavedAdminSecret());
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);

  const handleSaveSecret = (e) => {
    e.preventDefault();
    saveAdminSecret(sessionSecret.trim());
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Settings Header */}
      <div className="border-b border-[#E5E5E5] pb-4">
        <h2 className="text-base font-semibold text-[#171717] flex items-center gap-2">
          <SettingsIcon className="w-4 h-4 text-[#171717]" />
          <span>System & Project Configuration</span>
        </h2>
        <p className="text-xs text-[#666666] mt-0.5">
          Inspect active environment parameters, verify backend connectivity, and manage demo credentials.
        </p>
      </div>

      {/* Backend Environment Variables Inspection */}
      <div className="bg-white border border-[#E5E5E5] rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E5]">
          <div>
            <h3 className="text-xs font-semibold text-[#171717] uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-[#15803D]" />
              <span>Target Parameters & Security Masking</span>
            </h3>
            <p className="text-xs text-[#666666] mt-0.5">
              Production values read securely from the backend environment.
            </p>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#FAFAFA] text-[#666666] border border-[#E5E5E5]">
            Telemetry
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
          
          {/* Target GitHub Repository */}
          <div className="p-3.5 rounded-md bg-[#FAFAFA] border border-[#E5E5E5] space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[#666666] font-medium flex items-center gap-1.5">
                <FolderGit2 className="w-3.5 h-3.5 text-[#888888]" />
                Target GitHub Repository
              </span>
              <span className={`font-mono text-[10px] uppercase font-semibold ${project ? 'text-[#15803D]' : 'text-[#B45309]'}`}>
                {project ? 'Connected' : 'Not Set'}
              </span>
            </div>
            <div className="font-mono text-[#171717] text-xs pt-0.5">
              {project?.fullName || 'GITHUB_OWNER/GITHUB_REPO'}
            </div>
          </div>

          {/* Workflow File */}
          <div className="p-3.5 rounded-md bg-[#FAFAFA] border border-[#E5E5E5] space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[#666666] font-medium flex items-center gap-1.5">
                <FileCode2 className="w-3.5 h-3.5 text-[#888888]" />
                Primary Workflow Pipeline
              </span>
              <span className="font-mono text-[10px] uppercase text-[#15803D] font-semibold">
                deploy.yml
              </span>
            </div>
            <div className="font-mono text-[#171717] text-xs pt-0.5">
              .github/workflows/{project?.workflowId || 'deploy.yml'}
            </div>
          </div>

          {/* GitHub Token Status */}
          <div className="p-3.5 rounded-md bg-[#FAFAFA] border border-[#E5E5E5] space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[#666666] font-medium flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-[#888888]" />
                GitHub PAT Token
              </span>
              <span className={`font-mono text-[10px] uppercase font-semibold ${health?.configuration?.githubTokenConfigured ? 'text-[#15803D]' : 'text-[#B45309]'}`}>
                {health?.configuration?.githubTokenConfigured ? 'Configured' : 'Unconfigured'}
              </span>
            </div>
            <div className="font-mono text-[#888888] text-xs pt-0.5">
              {health?.configuration?.githubTokenConfigured ? 'ghp_••••••••••••••••••••••••••••' : 'Missing GITHUB_TOKEN'}
            </div>
          </div>

          {/* Server Admin Secret */}
          <div className="p-3.5 rounded-md bg-[#FAFAFA] border border-[#E5E5E5] space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[#666666] font-medium flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[#888888]" />
                Server Admin Secret Key
              </span>
              <span className={`font-mono text-[10px] uppercase font-semibold ${health?.configuration?.adminSecretConfigured ? 'text-[#15803D]' : 'text-[#DC2626]'}`}>
                {health?.configuration?.adminSecretConfigured ? 'Protected' : 'Missing'}
              </span>
            </div>
            <div className="font-mono text-[#888888] text-xs pt-0.5">
              {health?.configuration?.adminSecretConfigured ? '••••••••••••••••••••••••••••••••' : 'Missing ADMIN_SECRET'}
            </div>
          </div>

          {/* Live App URL */}
          <div className="p-3.5 rounded-md bg-[#FAFAFA] border border-[#E5E5E5] space-y-1 md:col-span-2">
            <div className="flex items-center justify-between">
              <span className="text-[#666666] font-medium flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-[#888888]" />
                Live Application URL
              </span>
              {project?.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#171717] hover:underline flex items-center gap-1 font-medium"
                >
                  Visit <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
            <div className="font-mono text-[#171717] text-xs pt-0.5">
              {project?.liveUrl || 'LIVE_APP_URL not configured'}
            </div>
          </div>

        </div>
      </div>

      {/* Session Secret Form */}
      <div className="bg-white border border-[#E5E5E5] rounded-lg p-5">
        <h3 className="text-xs font-semibold text-[#171717] uppercase tracking-wider flex items-center gap-1.5 mb-1">
          <Key className="w-3.5 h-3.5 text-[#171717]" />
          <span>Demo Session Authentication</span>
        </h3>
        <p className="text-xs text-[#666666] mb-4">
          Save your admin secret key in browser session storage for 1-click deployment dispatch.
        </p>

        <form onSubmit={handleSaveSecret} className="flex flex-col sm:flex-row gap-2.5">
          <input
            type="password"
            value={sessionSecret}
            onChange={(e) => setSessionSecret(e.target.value)}
            placeholder="Enter ADMIN_SECRET for this session"
            className="flex-1 px-3.5 py-1.5 rounded-md bg-white border border-[#E5E5E5] text-xs text-[#171717] placeholder-[#888888] focus:outline-none focus:border-[#171717] focus:ring-1 focus:ring-[#171717]"
          />
          <button
            type="submit"
            className="px-4 py-1.5 rounded-md bg-[#171717] hover:bg-[#262626] text-white text-xs font-medium transition-colors whitespace-nowrap"
          >
            {savedSuccess ? 'Saved in Session' : 'Save for Session'}
          </button>
        </form>
      </div>

      {/* Architecture Reference */}
      <div className="bg-white border border-[#E5E5E5] rounded-lg p-5 space-y-3">
        <h3 className="text-xs font-semibold text-[#171717] uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-[#E5E5E5]">
          <Terminal className="w-3.5 h-3.5 text-[#171717]" />
          <span>DevOps Architecture Reference</span>
        </h3>

        <div className="space-y-3 text-xs text-[#666666]">
          <div>
            <span className="font-semibold text-[#171717] block mb-1">Local Docker Build & Run:</span>
            <div className="relative group">
              <pre className="p-3 bg-[#FAFAFA] border border-[#E5E5E5] rounded-md font-mono text-[11px] text-[#171717] overflow-x-auto">
{`docker build -t deployflow-backend ./backend
docker run -p 5000:5000 --env-file backend/.env deployflow-backend`}
              </pre>
              <button
                onClick={() => copyToClipboard('docker build -t deployflow-backend ./backend && docker run -p 5000:5000 deployflow-backend', 'docker')}
                className="absolute right-2 top-2 p-1 rounded bg-white border border-[#E5E5E5] text-[#666666] hover:text-[#171717]"
                title="Copy commands"
              >
                {copiedKey === 'docker' ? <Check className="w-3 h-3 text-[#15803D]" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
