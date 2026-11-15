import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import TriggerDeployModal from './TriggerDeployModal';
import ImportProjectModal from './ImportProjectModal';

export default function Layout({
  children,
  health,
  projects = [],
  selectedProjectId,
  onSelectProject,
  activeProject,
  onRefresh,
  isRefreshing,
  onDeploySuccess,
  isDeployModalOpen,
  setIsDeployModalOpen,
  isImportModalOpen,
  setIsImportModalOpen,
  onProjectImported
}) {
  const [internalDeployModalOpen, setInternalDeployModalOpen] = useState(false);
  const [internalImportModalOpen, setInternalImportModalOpen] = useState(false);

  const deployModalOpen = isDeployModalOpen !== undefined ? isDeployModalOpen : internalDeployModalOpen;
  const setDeployModalOpen = setIsDeployModalOpen || setInternalDeployModalOpen;

  const importModalOpen = isImportModalOpen !== undefined ? isImportModalOpen : internalImportModalOpen;
  const setImportModalOpen = setIsImportModalOpen || setInternalImportModalOpen;

  return (
    <div className="flex min-h-screen bg-white">
      {/* Fixed Left Sidebar */}
      <Sidebar health={health} liveUrl={activeProject?.liveUrl} />

      {/* Main Content Area */}
      <div className="flex-1 ml-60 flex flex-col min-w-0 bg-[#FAFAFA]">
        <Navbar
          projects={projects}
          selectedProjectId={selectedProjectId}
          onSelectProject={onSelectProject}
          activeProject={activeProject}
          onOpenDeployModal={() => setDeployModalOpen(true)}
          onOpenImportModal={() => setImportModalOpen(true)}
          onRefresh={onRefresh}
          isRefreshing={isRefreshing}
        />

        <main className="flex-1 p-6 lg:p-8 max-w-6xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Trigger Deployment Modal */}
      <TriggerDeployModal
        isOpen={deployModalOpen}
        onClose={() => setDeployModalOpen(false)}
        projects={projects}
        initialProjectId={selectedProjectId}
        defaultBranch={activeProject?.branch || 'main'}
        onDeploySuccess={(res, deployedProjectId) => {
          if (onDeploySuccess) onDeploySuccess(res, deployedProjectId);
        }}
      />

      {/* Import Project Modal (Render API) */}
      <ImportProjectModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onProjectImported={(project) => {
          if (onProjectImported) onProjectImported(project);
        }}
      />
    </div>
  );
}
