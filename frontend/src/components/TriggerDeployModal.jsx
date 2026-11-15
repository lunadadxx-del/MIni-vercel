import React, { useState, useEffect } from 'react';
import { Rocket, X, Lock, GitBranch, Loader2, CheckCircle2, AlertCircle, FolderGit2 } from 'lucide-react';
import { api, getSavedAdminSecret, saveAdminSecret } from '../services/api';

export default function TriggerDeployModal({
  isOpen,
  onClose,
  onDeploySuccess,
  projects = [],
  initialProjectId = null,
  defaultBranch = 'main'
}) {
  const [selectedProjectId, setSelectedProjectId] = useState(initialProjectId || (projects[0]?.id || 'proj_demo_portfolio'));
  const [branch, setBranch] = useState(defaultBranch);
  const [adminSecret, setAdminSecret] = useState('');
  const [rememberSecret, setRememberSecret] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successResult, setSuccessResult] = useState(null);

  useEffect(() => {
    if (isOpen) {
      if (initialProjectId) {
        setSelectedProjectId(initialProjectId);
      } else if (projects.length > 0) {
        setSelectedProjectId(projects[0].id);
      }
      setBranch(defaultBranch || 'main');
      const saved = getSavedAdminSecret();
      if (saved) {
        setAdminSecret(saved);
      }
      setError(null);
      setSuccessResult(null);
    }
  }, [isOpen, initialProjectId, defaultBranch, projects]);

  if (!isOpen) return null;

  const currentProject = projects.find((p) => p.id === selectedProjectId) || projects[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!adminSecret.trim()) {
      setError('Admin secret key is required to trigger deployment.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessResult(null);

    try {
      if (rememberSecret) {
        saveAdminSecret(adminSecret.trim());
      }

      const res = await api.triggerDeploy(
        branch.trim(),
        adminSecret.trim(),
        selectedProjectId,
        currentProject?.workflowId
      );
      setSuccessResult(res);

      if (onDeploySuccess) {
        onDeploySuccess(res, selectedProjectId);
      }
    } catch (err) {
      setError(err.message || 'Failed to dispatch workflow run.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-[#0e1422] border border-card-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-card-border bg-[#131b2e]/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Rocket className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Trigger Deployment</h3>
              <p className="text-xs text-slate-400">Dispatch GitHub Actions CI/CD workflow</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3.5 bg-rose-950/30 border border-rose-900/50 rounded-xl text-xs text-rose-300 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successResult ? (
            <div className="p-4 bg-emerald-950/30 border border-emerald-900/50 rounded-xl text-center space-y-3">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <div>
                <h4 className="text-sm font-semibold text-emerald-200">Workflow Dispatched!</h4>
                <p className="text-xs text-slate-300 mt-1">
                  GitHub Actions queued a new run for <strong className="text-white">{currentProject?.name}</strong> on branch <code className="text-emerald-300 font-mono font-bold">{branch}</code>.
                </p>
                <p className="text-[11px] text-slate-400 font-mono mt-1">
                  Workflow: {currentProject?.workflowId}
                </p>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-all"
                >
                  View in Deployments
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Project Target Selector */}
              {projects.length > 1 && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Target Project
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {projects.map((proj) => (
                      <button
                        type="button"
                        key={proj.id}
                        onClick={() => setSelectedProjectId(proj.id)}
                        className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-1.5 ${
                          selectedProjectId === proj.id
                            ? 'bg-indigo-600/15 border-indigo-500 text-white ring-1 ring-indigo-500'
                            : 'bg-[#0a0f1d] border-card-border text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-xs font-semibold line-clamp-1">{proj.name}</span>
                          <FolderGit2 className={`w-3.5 h-3.5 ${selectedProjectId === proj.id ? 'text-indigo-400' : 'text-slate-600'}`} />
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">
                          {proj.workflowId}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Target Branch
                </label>
                <div className="relative">
                  <GitBranch className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    required
                    placeholder="main"
                    className="w-full pl-10 pr-4 py-2.5 bg-card border border-card-border rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono"
                  />
                </div>
                <p className="mt-1 text-[11px] text-slate-400">
                  Target workflow: <code className="text-indigo-300 font-mono">{currentProject?.workflowId || 'deploy.yml'}</code>
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Admin Secret Key
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={adminSecret}
                    onChange={(e) => setAdminSecret(e.target.value)}
                    required
                    placeholder="Enter backend ADMIN_SECRET"
                    className="w-full pl-10 pr-4 py-2.5 bg-card border border-card-border rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-400 hover:text-slate-300">
                    <input
                      type="checkbox"
                      checked={rememberSecret}
                      onChange={(e) => setRememberSecret(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                    />
                    Save secret for this browser session
                  </label>
                </div>
              </div>

              <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl text-[11px] text-slate-400 space-y-1">
                <span className="font-semibold text-slate-300">Security Note:</span>
                <p>
                  Deployments are authenticated server-side. Your secret is verified against the backend's environment variables and never logged or exposed.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800/60 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/20 transition-all"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Triggering...
                    </>
                  ) : (
                    <>
                      <Rocket className="w-3.5 h-3.5" />
                      Dispatch Workflow
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
