import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Server,
  Shield,
  Key,
  FolderGit2,
  FileCode2,
  Globe,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Copy,
  Check,
  Terminal,
  HelpCircle
} from 'lucide-react';
import { api, getSavedAdminSecret, saveAdminSecret } from '../services/api';

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
    <div className="space-y-8">
      
      {/* Settings Header */}
      <div className="border-b border-card-border pb-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-indigo-400" />
          <span>System & Project Configuration</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Inspect active environment parameters, verify backend connectivity, and manage demo credentials.
        </p>
      </div>

      {/* Backend Environment Variables Inspection (Safe & Masked) */}
      <div className="bg-card border border-card-border rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-card-border">
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Target Parameters & Security Masking</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Production values read securely from the backend environment. Secrets are never transmitted to the browser.
            </p>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
            Read-Only Telemetry
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          
          {/* GitHub Repository Target */}
          <div className="p-4 rounded-xl bg-[#0a0f1d] border border-card-border space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium flex items-center gap-1.5">
                <FolderGit2 className="w-3.5 h-3.5 text-indigo-400" />
                Target GitHub Repository
              </span>
              <span className={`font-mono text-[10px] uppercase font-semibold ${project ? 'text-emerald-400' : 'text-amber-400'}`}>
                {project ? 'Connected' : 'Not Set'}
              </span>
            </div>
            <div className="font-mono text-slate-200 text-sm pt-1">
              {project?.fullName || 'GITHUB_OWNER/GITHUB_REPO'}
            </div>
          </div>

          {/* Workflow ID */}
          <div className="p-4 rounded-xl bg-[#0a0f1d] border border-card-border space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium flex items-center gap-1.5">
                <FileCode2 className="w-3.5 h-3.5 text-purple-400" />
                Workflow Pipeline File
              </span>
              <span className="font-mono text-[10px] uppercase text-emerald-400 font-semibold">
                deploy.yml
              </span>
            </div>
            <div className="font-mono text-slate-200 text-sm pt-1">
              .github/workflows/{project?.workflowId || 'deploy.yml'}
            </div>
          </div>

          {/* GitHub Token Status */}
          <div className="p-4 rounded-xl bg-[#0a0f1d] border border-card-border space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-400" />
                GitHub PAT Token
              </span>
              <span className={`font-mono text-[10px] uppercase font-semibold ${health?.configuration?.githubTokenConfigured ? 'text-emerald-400' : 'text-amber-400'}`}>
                {health?.configuration?.githubTokenConfigured ? 'Configured (Active)' : 'Unconfigured'}
              </span>
            </div>
            <div className="font-mono text-slate-400 text-sm pt-1">
              {health?.configuration?.githubTokenConfigured ? 'ghp_••••••••••••••••••••••••••••' : 'Missing GITHUB_TOKEN'}
            </div>
          </div>

          {/* Backend Admin Secret Status */}
          <div className="p-4 rounded-xl bg-[#0a0f1d] border border-card-border space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-rose-400" />
                Server Admin Secret Key
              </span>
              <span className={`font-mono text-[10px] uppercase font-semibold ${health?.configuration?.adminSecretConfigured ? 'text-emerald-400' : 'text-rose-400'}`}>
                {health?.configuration?.adminSecretConfigured ? 'Protected' : 'Missing'}
              </span>
            </div>
            <div className="font-mono text-slate-400 text-sm pt-1">
              {health?.configuration?.adminSecretConfigured ? '••••••••••••••••••••••••••••••••' : 'Missing ADMIN_SECRET'}
            </div>
          </div>

          {/* Live App URL */}
          <div className="p-4 rounded-xl bg-[#0a0f1d] border border-card-border space-y-1 md:col-span-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-blue-400" />
                Render Live Application URL
              </span>
              {project?.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  Visit <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
            <div className="font-mono text-slate-200 text-sm pt-1">
              {project?.liveUrl || 'LIVE_APP_URL not configured'}
            </div>
          </div>

        </div>
      </div>

      {/* Browser Demo Session Authentication */}
      <div className="bg-card border border-card-border rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-1">
          <Key className="w-4 h-4 text-indigo-400" />
          <span>Demo Session Authentication</span>
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Store your admin secret key in your browser's session storage. This enables 1-click deployment dispatch without re-typing credentials each time.
        </p>

        <form onSubmit={handleSaveSecret} className="flex flex-col sm:flex-row gap-3">
          <input
            type="password"
            value={sessionSecret}
            onChange={(e) => setSessionSecret(e.target.value)}
            placeholder="Enter ADMIN_SECRET for this session"
            className="flex-1 px-4 py-2.5 rounded-xl bg-[#0a0f1d] border border-card-border text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all whitespace-nowrap"
          >
            {savedSuccess ? 'Saved in Session!' : 'Save for Session'}
          </button>
        </form>
      </div>

      {/* DevOps Architecture Reference & Guide */}
      <div className="bg-card border border-card-border rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2 pb-3 border-b border-card-border">
          <Terminal className="w-4 h-4 text-purple-400" />
          <span>College DevOps Architecture Reference</span>
        </h3>

        <div className="space-y-4 text-xs text-slate-300">
          <div>
            <h4 className="font-semibold text-white mb-1">1. Local Docker Build & Run</h4>
            <div className="relative group">
              <pre className="p-3 bg-[#0a0f1d] border border-card-border rounded-xl font-mono text-[11px] text-slate-200 overflow-x-auto">
{`# Build the backend Docker image locally
docker build -t deployflow-backend ./backend

# Run the container locally binding port 5000
docker run -p 5000:5000 --env-file backend/.env deployflow-backend`}
              </pre>
              <button
                onClick={() => copyToClipboard('docker build -t deployflow-backend ./backend && docker run -p 5000:5000 deployflow-backend', 'docker')}
                className="absolute right-3 top-3 p-1.5 rounded-lg bg-card border border-card-border text-slate-400 hover:text-white"
                title="Copy commands"
              >
                {copiedKey === 'docker' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-1">2. Render Deployment Mapping</h4>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li><strong>Frontend:</strong> Render Static Site &bull; Root: <code className="text-indigo-300">frontend</code> &bull; Build: <code className="text-indigo-300">npm ci && npm run build</code> &bull; Publish: <code className="text-indigo-300">dist</code></li>
              <li><strong>Backend:</strong> Render Web Service &bull; Runtime: <code className="text-indigo-300">Docker</code> &bull; Root: <code className="text-indigo-300">backend</code> &bull; Health Check: <code className="text-indigo-300">/api/health</code></li>
            </ul>
          </div>
        </div>
      </div>

    </div>
  );
}
