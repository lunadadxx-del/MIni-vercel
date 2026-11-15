import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Github,
  Globe,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  Sparkles,
  ArrowRight,
  FolderGit2,
  Check
} from 'lucide-react';
import { api } from '../services/api';

export default function ImportProjectModal({ isOpen, onClose, onProjectImported }) {
  const [repoUrl, setRepoUrl] = useState('');
  const [projectName, setProjectName] = useState('');
  const [branch, setBranch] = useState('main');
  const [frameworkPreset, setFrameworkPreset] = useState('static');
  const [publishDir, setPublishDir] = useState('.');
  const [buildCommand, setBuildCommand] = useState('');

  // Status & steps state
  const [currentStep, setCurrentStep] = useState('form'); // 'form' | 'submitting' | 'polling' | 'success' | 'error'
  const [stepIndex, setStepIndex] = useState(0); // 0: init, 1: repo validated, 2: render service created, 3: building, 4: live
  const [createdProject, setCreatedProject] = useState(null);
  const [latestDeploy, setLatestDeploy] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [pollingSeconds, setPollingSeconds] = useState(0);

  const pollIntervalRef = useRef(null);

  // Clear state on modal open / close
  useEffect(() => {
    if (!isOpen) {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      setCurrentStep('form');
      setStepIndex(0);
      setCreatedProject(null);
      setLatestDeploy(null);
      setErrorMessage('');
      setPollingSeconds(0);
    }
  }, [isOpen]);

  // Clean up poll on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  // Auto-detect project name and framework defaults from repo URL
  const handleRepoUrlChange = (value) => {
    setRepoUrl(value);
    setErrorMessage('');

    // Extract repo name from URL e.g. https://github.com/lunadadxx-del/html-live
    const match = value.match(/github\.com[/:]([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+?)(?:\.git|\/)?$/);
    if (match && match[2]) {
      const detectedName = match[2].replace(/\.git$/, '');
      if (!projectName || projectName === 'my-app' || projectName === 'devpulse' || projectName === 'html-live') {
        setProjectName(detectedName);
      }
    }
  };

  const handlePresetChange = (preset) => {
    setFrameworkPreset(preset);
    if (preset === 'static') {
      setPublishDir('.');
      setBuildCommand('');
    } else if (preset === 'vite') {
      setPublishDir('dist');
      setBuildCommand('npm run build');
    } else if (preset === 'cra') {
      setPublishDir('build');
      setBuildCommand('npm run build');
    } else {
      setPublishDir('.');
      setBuildCommand('');
    }
  };

  const handleUseDemoRepo = () => {
    const demoUrl = 'https://github.com/lunadadxx-del/html-live';
    setRepoUrl(demoUrl);
    setProjectName('devpulse-live');
    setBranch('main');
    handlePresetChange('static');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!repoUrl.trim()) {
      setErrorMessage('Please enter a valid public GitHub repository URL.');
      return;
    }

    try {
      setCurrentStep('submitting');
      setStepIndex(1); // 1: Validating repository
      setErrorMessage('');

      // Create static site service on Render via backend
      const finalBuildCommand = frameworkPreset === 'static' ? '' : buildCommand.trim();
      const finalPublishDir = frameworkPreset === 'static' ? '.' : (publishDir.trim() || '.');

      const res = await api.importProject({
        repoUrl: repoUrl.trim(),
        projectName: projectName.trim() || 'static-site',
        branch: branch.trim() || 'main',
        publishDir: finalPublishDir,
        buildCommand: finalBuildCommand
      });

      if (!res.success || !res.project) {
        throw new Error(res.message || 'Failed to create project on Render.');
      }

      const project = res.project;
      setCreatedProject(project);
      setStepIndex(2); // 2: Render Static Site Created
      setCurrentStep('polling');

      // Notify parent to refresh list immediately
      if (onProjectImported) {
        onProjectImported(project);
      }

      // Start polling deployment status
      startPolling(project.id);
    } catch (err) {
      setCurrentStep('error');
      setErrorMessage(err.message || 'Failed to import repository.');
    }
  };

  const startPolling = (projectId) => {
    let elapsed = 0;
    setPollingSeconds(0);

    pollIntervalRef.current = setInterval(async () => {
      elapsed += 3;
      setPollingSeconds(elapsed);

      try {
        const statusData = await api.getProjectStatus(projectId);

        if (statusData && statusData.success) {
          if (statusData.latestDeploy) {
            setLatestDeploy(statusData.latestDeploy);
          }

          if (statusData.status === 'live') {
            setStepIndex(4); // 4: Live!
            setCurrentStep('success');
            clearInterval(pollIntervalRef.current);

            if (onProjectImported && statusData.project) {
              onProjectImported(statusData.project);
            }
          } else if (statusData.status === 'failed') {
            setStepIndex(3);
            setCurrentStep('error');
            setErrorMessage('Render build failed. Please verify your repository files or build configuration.');
            clearInterval(pollIntervalRef.current);
          } else {
            setStepIndex(3); // 3: Building & Deploying
          }
        }
      } catch (err) {
        // Continue polling unless error repeats
      }

      // Safety timeout after 2.5 minutes
      if (elapsed > 150) {
        clearInterval(pollIntervalRef.current);
      }
    }, 3500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-[#E5E5E5] rounded-lg shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E5E5E5] flex items-center justify-between bg-[#FAFAFA]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-white border border-[#E5E5E5] text-[#171717]">
              <FolderGit2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-[#171717] uppercase tracking-wider">
                Import Git Repository
              </h3>
              <p className="text-[11px] text-[#666666] mt-0.5">
                Deploy an external public GitHub repository directly through Render REST API
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-[#666666] hover:text-[#171717] hover:bg-[#E5E5E5]/50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          
          {/* Quick Demo Pre-fill Pill */}
          {currentStep === 'form' && (
            <div className="p-3 bg-[#FAFAFA] border border-[#E5E5E5] rounded-md flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-[#171717]">
                <Sparkles className="w-3.5 h-3.5 text-[#15803D]" />
                <span className="font-medium">Test Repository: DevPulse HTML Demo</span>
              </div>
              <button
                type="button"
                onClick={handleUseDemoRepo}
                className="px-2.5 py-1 text-[11px] font-medium bg-white hover:bg-[#F5F5F5] border border-[#E5E5E5] text-[#171717] rounded transition-colors"
              >
                Auto-fill html-live
              </button>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 rounded-md bg-[#FAFAFA] border border-[#DC2626] text-xs flex items-start gap-2.5 text-[#DC2626]">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block">Deployment Notice</span>
                <span className="text-[11px] text-[#666666]">{errorMessage}</span>
              </div>
            </div>
          )}

          {/* Form Step */}
          {currentStep === 'form' && (
            <form id="import-repo-form" onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              
              {/* GitHub Repo URL */}
              <div>
                <label className="block text-[#171717] font-medium mb-1">
                  GitHub Repository URL <span className="text-[#DC2626]">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#888888]">
                    <Github className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="url"
                    required
                    value={repoUrl}
                    onChange={(e) => handleRepoUrlChange(e.target.value)}
                    placeholder="https://github.com/lunadadxx-del/html-live"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-[#E5E5E5] rounded-md text-xs text-[#171717] placeholder-[#888888] focus:outline-none focus:border-[#171717] focus:ring-1 focus:ring-[#171717] font-mono"
                  />
                </div>
                <p className="text-[11px] text-[#666666] mt-1">
                  Must be a public GitHub repository with an <span className="font-mono">index.html</span> file.
                </p>
              </div>

              {/* Project Name & Branch */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#171717] font-medium mb-1">
                    Project Name
                  </label>
                  <input
                    type="text"
                    required
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="devpulse-live"
                    className="w-full px-3 py-2 bg-white border border-[#E5E5E5] rounded-md text-xs text-[#171717] placeholder-[#888888] focus:outline-none focus:border-[#171717] focus:ring-1 focus:ring-[#171717]"
                  />
                </div>
                <div>
                  <label className="block text-[#171717] font-medium mb-1">
                    Branch
                  </label>
                  <input
                    type="text"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    placeholder="main"
                    className="w-full px-3 py-2 bg-white border border-[#E5E5E5] rounded-md text-xs text-[#171717] placeholder-[#888888] focus:outline-none focus:border-[#171717] focus:ring-1 focus:ring-[#171717] font-mono"
                  />
                </div>
              </div>

              {/* Framework Preset */}
              <div>
                <label className="block text-[#171717] font-medium mb-1">
                  Framework Preset
                </label>
                <select
                  value={frameworkPreset}
                  onChange={(e) => handlePresetChange(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#E5E5E5] rounded-md text-xs text-[#171717] focus:outline-none focus:border-[#171717]"
                >
                  <option value="static">Plain HTML / CSS / JavaScript (Publish Directory: .)</option>
                  <option value="vite">Vite + React / Vue (Publish Directory: dist)</option>
                  <option value="cra">Create React App (Publish Directory: build)</option>
                  <option value="custom">Custom Configuration</option>
                </select>
              </div>

              {/* Publish Directory & Build Command */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#171717] font-medium mb-1">
                    Publish Directory
                  </label>
                  <input
                    type="text"
                    value={publishDir}
                    onChange={(e) => setPublishDir(e.target.value)}
                    placeholder="."
                    className="w-full px-3 py-2 bg-white border border-[#E5E5E5] rounded-md text-xs text-[#171717] placeholder-[#888888] focus:outline-none focus:border-[#171717] focus:ring-1 focus:ring-[#171717] font-mono"
                  />
                  <p className="text-[10px] text-[#666666] mt-0.5">
                    {frameworkPreset === 'static' ? 'Root directory (.) containing index.html' : 'Output directory after build (e.g. dist)'}
                  </p>
                </div>
                <div>
                  <label className="block text-[#171717] font-medium mb-1">
                    Build Command <span className="text-[#888888] font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    disabled={frameworkPreset === 'static'}
                    value={frameworkPreset === 'static' ? '' : buildCommand}
                    onChange={(e) => setBuildCommand(e.target.value)}
                    placeholder={frameworkPreset === 'static' ? 'None (plain HTML needs no build)' : 'e.g. npm run build'}
                    className={`w-full px-3 py-2 border border-[#E5E5E5] rounded-md text-xs font-mono focus:outline-none ${
                      frameworkPreset === 'static' ? 'bg-[#FAFAFA] text-[#888888] cursor-not-allowed' : 'bg-white text-[#171717] focus:border-[#171717]'
                    }`}
                  />
                  <p className="text-[10px] text-[#666666] mt-0.5">
                    {frameworkPreset === 'static' ? 'Pure static sites do not need compilation.' : 'Command to compile project assets.'}
                  </p>
                </div>
              </div>

              <div className="p-3 bg-[#FAFAFA] rounded-md border border-[#E5E5E5] text-[11px] text-[#666666] space-y-1">
                <div className="font-semibold text-[#171717]">Automatic Pipeline Execution:</div>
                <div>1. Validates repository structure and branch on GitHub.</div>
                <div>2. Issues authenticated Render REST API request to provision a Static Site.</div>
                <div>3. Render pulls latest commit, serves assets globally, and provides a secure HTTPS URL.</div>
              </div>
            </form>
          )}

          {/* Deployment Stepper Progress (during submitting, polling, success) */}
          {(currentStep === 'submitting' || currentStep === 'polling' || currentStep === 'success' || (currentStep === 'error' && stepIndex > 0)) && (
            <div className="space-y-4 py-2">
              <div className="space-y-3">
                
                {/* Step 1: Validate */}
                <div className="flex items-center gap-3 text-xs">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[11px] font-mono ${
                    stepIndex > 1 ? 'bg-[#15803D] text-white' : (stepIndex === 1 ? 'bg-[#171717] text-white' : 'bg-[#E5E5E5] text-[#666666]')
                  }`}>
                    {stepIndex > 1 ? <Check className="w-3.5 h-3.5" /> : (stepIndex === 1 ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : '1')}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-[#171717]">Repository Validation</div>
                    <div className="text-[11px] text-[#666666]">
                      {stepIndex > 1 ? `Verified ${repoUrl}` : 'Inspecting GitHub repository and branch target...'}
                    </div>
                  </div>
                </div>

                {/* Step 2: Render Service Provisioning */}
                <div className="flex items-center gap-3 text-xs">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[11px] font-mono ${
                    stepIndex > 2 ? 'bg-[#15803D] text-white' : (stepIndex === 2 ? 'bg-[#171717] text-white' : 'bg-[#E5E5E5] text-[#666666]')
                  }`}>
                    {stepIndex > 2 ? <Check className="w-3.5 h-3.5" /> : (stepIndex === 2 ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : '2')}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-[#171717]">Render Static Site Service</div>
                    <div className="text-[11px] text-[#666666]">
                      {stepIndex > 2 ? `Service created (${createdProject?.name || 'Render Site'})` : 'Sending request to Render REST API...'}
                    </div>
                  </div>
                </div>

                {/* Step 3: Build & Deploy */}
                <div className="flex items-center gap-3 text-xs">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[11px] font-mono ${
                    stepIndex > 3 ? 'bg-[#15803D] text-white' : (stepIndex === 3 ? 'bg-[#171717] text-white' : 'bg-[#E5E5E5] text-[#666666]')
                  }`}>
                    {stepIndex > 3 ? <Check className="w-3.5 h-3.5" /> : (stepIndex === 3 ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : '3')}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-[#171717]">Building & Deploying Assets</div>
                    <div className="text-[11px] text-[#666666]">
                      {stepIndex > 3 ? 'Assets processed and published' : `Render building static site (${pollingSeconds}s elapsed)...`}
                    </div>
                  </div>
                </div>

                {/* Step 4: Live URL */}
                <div className="flex items-center gap-3 text-xs">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[11px] font-mono ${
                    stepIndex >= 4 ? 'bg-[#15803D] text-white' : 'bg-[#E5E5E5] text-[#666666]'
                  }`}>
                    {stepIndex >= 4 ? <Check className="w-3.5 h-3.5" /> : '4'}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-[#171717]">Live HTTPS Deployment</div>
                    <div className="text-[11px] text-[#666666]">
                      {stepIndex >= 4 ? 'Website is live and reachable globally' : 'Waiting for CDN edge distribution...'}
                    </div>
                  </div>
                </div>

              </div>

              {/* Success Box */}
              {currentStep === 'success' && createdProject && (
                <div className="p-4 bg-white border border-[#15803D] rounded-lg space-y-3">
                  <div className="flex items-center gap-2 text-[#15803D]">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="font-semibold text-xs">Deployment Complete!</span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] text-[#666666] block">Live Website URL:</span>
                    <a
                      href={createdProject.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-xs font-semibold text-[#171717] hover:underline flex items-center gap-1.5 break-all"
                    >
                      <Globe className="w-3.5 h-3.5 text-[#15803D] shrink-0" />
                      <span>{createdProject.liveUrl}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-[#888888] shrink-0" />
                    </a>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <a
                      href={createdProject.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-1.5 bg-[#171717] hover:bg-[#262626] text-white text-xs font-medium rounded text-center transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>Visit Live Application</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-3 py-1.5 bg-white hover:bg-[#FAFAFA] border border-[#E5E5E5] text-[#171717] text-xs font-medium rounded transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 border-t border-[#E5E5E5] flex items-center justify-between bg-[#FAFAFA]">
          <span className="text-[11px] text-[#666666] font-mono">
            {currentStep === 'form' ? 'Render REST API' : (currentStep === 'polling' ? `Polling Render API (${pollingSeconds}s)` : 'DeployFlow Engine')}
          </span>

          <div className="flex items-center gap-2">
            {currentStep === 'form' && (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 bg-white hover:bg-[#F5F5F5] border border-[#E5E5E5] text-[#171717] text-xs font-medium rounded transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="import-repo-form"
                  className="px-4 py-1.5 bg-[#171717] hover:bg-[#262626] text-white text-xs font-medium rounded transition-colors flex items-center gap-1.5 shadow-none"
                >
                  <span>Deploy</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}

            {currentStep === 'error' && (
              <>
                <button
                  type="button"
                  onClick={() => setCurrentStep('form')}
                  className="px-3 py-1.5 bg-white hover:bg-[#F5F5F5] border border-[#E5E5E5] text-[#171717] text-xs font-medium rounded transition-colors"
                >
                  Back to Form
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 bg-[#171717] hover:bg-[#262626] text-white text-xs font-medium rounded transition-colors"
                >
                  Close
                </button>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
