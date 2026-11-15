import React from 'react';
import {
  FolderGit2,
  ExternalLink,
  GitBranch,
  Globe,
  FileCode2,
  Rocket,
  FolderCode
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';

export default function Projects({ projects = [], health, onTriggerDeployProject }) {
  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E5E5]">
        <div>
          <h2 className="text-base font-semibold text-[#171717]">Projects</h2>
          <p className="text-xs text-[#666666] mt-0.5">
            Configured projects connected to GitHub Actions and Render cloud deployment.
          </p>
        </div>
      </div>

      {/* Projects List in Clean Vercel Table */}
      <div className="bg-white border border-[#E5E5E5] rounded-lg overflow-hidden shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#E5E5E5] bg-[#FAFAFA] text-[#666666] font-medium text-[11px] uppercase tracking-wider">
                <th className="py-3 px-5">Project Name</th>
                <th className="py-3 px-4">Repository</th>
                <th className="py-3 px-4">Framework / Runtime</th>
                <th className="py-3 px-4">Workflow</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5]">
              {projects.map((proj) => (
                <tr key={proj.id} className="hover:bg-[#FAFAFA] transition-colors">
                  {/* Name & Desc */}
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-md bg-[#FAFAFA] border border-[#E5E5E5] text-[#171717]">
                        {proj.id === 'proj_demo_portfolio' ? <FolderCode className="w-4 h-4" /> : <FolderGit2 className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="font-semibold text-[#171717]">{proj.name}</div>
                        <div className="text-[11px] text-[#666666] line-clamp-1">{proj.description}</div>
                      </div>
                    </div>
                  </td>

                  {/* Repo & Branch */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <a
                      href={proj.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-xs text-[#171717] hover:underline flex items-center gap-1"
                    >
                      <span>{proj.fullName || 'Repository'}</span>
                      <ExternalLink className="w-3 h-3 text-[#888888]" />
                    </a>
                    <div className="flex items-center gap-1 text-[11px] text-[#666666] font-mono mt-0.5">
                      <GitBranch className="w-3 h-3 text-[#888888]" />
                      <span>{proj.branch || 'main'}</span>
                    </div>
                  </td>

                  {/* Runtime */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-[#666666]">
                    <span className="px-2 py-0.5 rounded bg-[#FAFAFA] border border-[#E5E5E5] text-[11px] font-mono text-[#171717]">
                      {proj.id === 'proj_demo_portfolio' ? 'Vite + React (Static)' : 'Docker (Alpine) + Node.js'}
                    </span>
                  </td>

                  {/* Workflow */}
                  <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[11px] text-[#666666]">
                    <div className="flex items-center gap-1">
                      <FileCode2 className="w-3 h-3 text-[#888888]" />
                      <span>{proj.workflowId}</span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <StatusBadge status="completed" conclusion="success" size="xs" />
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-5 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      {proj.liveUrl && (
                        <a
                          href={proj.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-[#FAFAFA] text-[#171717] text-xs font-medium rounded-md border border-[#E5E5E5] transition-colors"
                        >
                          <Globe className="w-3 h-3 text-[#666666]" />
                          <span>Visit</span>
                        </a>
                      )}

                      {onTriggerDeployProject && (
                        <button
                          onClick={() => onTriggerDeployProject(proj.id)}
                          className="flex items-center gap-1 px-2.5 py-1 bg-[#171717] hover:bg-[#262626] text-white text-xs font-medium rounded-md transition-colors"
                        >
                          <Rocket className="w-3 h-3" />
                          <span>Deploy</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
