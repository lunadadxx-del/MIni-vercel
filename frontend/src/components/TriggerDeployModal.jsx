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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]">
      <div className="relative w-full max-w-md bg-white border border-[#E5E5E5] rounded-lg shadow-xl overflow-hidden animate-in fade-in duration-150">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E5E5E5] bg-[#FAFAFA]">
          <div className="flex items-center gap-2">
            <Rocket className="w-4 h-4 text-[#171717]" />
            <div>
              <h3 className="text-xs font-semibold text-[#171717]">Trigger Deployment</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#888888] hover:text-[#171717] p-1 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-md text-xs text-[#DC2626] flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-[#DC2626] flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successResult ? (
            <div className="p-4 bg-[#F0FDF4] border border-[#BBF7D0] rounded-md text-center space-y-2.5">
              <CheckCircle2 className="w-6 h-6 text-[#15803D] mx-auto" />
              <div>
                <h4 className="text-xs font-semibold text-[#15803D]">Workflow Dispatched</h4>
                <p className="text-xs text-[#666666] mt-1">
                  Queued deployment for <strong className="text-[#171717]">{currentProject?.name}</strong> on branch <code className="text-[#171717] font-mono font-medium">{branch}</code>.
                </p>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-1.5 px-3 rounded-md bg-[#171717] hover:bg-[#262626] text-white text-xs font-medium transition-colors"
                >
                  Close & View Runs
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Target Project Selection */}
              {projects.length > 1 && (
                <div>
                  <label className="block text-xs font-medium text-[#171717] mb-1.5">
                    Target Project
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {projects.map((proj) => {
                      const isSelected = selectedProjectId === proj.id;
                      return (
                        <button
                          type="button"
                          key={proj.id}
                          onClick={() => setSelectedProjectId(proj.id)}
                          className={`p-2.5 rounded-md border text-left transition-colors flex flex-col justify-between ${
                            isSelected
                              ? 'bg-[#171717] text-white border-[#171717]'
                              : 'bg-[#FAFAFA] border-[#E5E5E5] text-[#171717] hover:border-[#CCCCCC]'
                          }`}
                        >
                          <span className="text-xs font-medium truncate">{proj.name}</span>
                          <span className={`text-[10px] font-mono mt-1 ${isSelected ? 'text-white/70' : 'text-[#888888]'}`}>
                            {proj.workflowId}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-[#171717] mb-1">
                  Target Branch
                </label>
                <div className="relative">
                  <GitBranch className="w-3.5 h-3.5 text-[#888888] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    required
                    placeholder="main"
                    className="w-full pl-9 pr-3 py-1.5 bg-white border border-[#E5E5E5] rounded-md text-xs text-[#171717] placeholder-[#888888] focus:outline-none focus:border-[#171717] focus:ring-1 focus:ring-[#171717] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#171717] mb-1">
                  Admin Secret Key
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-[#888888] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={adminSecret}
                    onChange={(e) => setAdminSecret(e.target.value)}
                    required
                    placeholder="Enter backend ADMIN_SECRET"
                    className="w-full pl-9 pr-3 py-1.5 bg-white border border-[#E5E5E5] rounded-md text-xs text-[#171717] placeholder-[#888888] focus:outline-none focus:border-[#171717] focus:ring-1 focus:ring-[#171717]"
                  />
                </div>
                <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-[#666666] mt-1.5">
                  <input
                    type="checkbox"
                    checked={rememberSecret}
                    onChange={(e) => setRememberSecret(e.target.checked)}
                    className="rounded border-[#E5E5E5] text-[#171717] focus:ring-[#171717]"
                  />
                  Remember in this browser session
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E5E5E5]">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="px-3 py-1.5 text-xs font-medium text-[#666666] hover:text-[#171717] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#171717] hover:bg-[#262626] disabled:bg-[#888888] disabled:cursor-not-allowed text-white text-xs font-medium rounded-md transition-colors"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Dispatching...
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
