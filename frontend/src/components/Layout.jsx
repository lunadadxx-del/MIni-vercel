import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import TriggerDeployModal from './TriggerDeployModal';

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
  setIsDeployModalOpen
}) {
  const [internalModalOpen, setInternalModalOpen] = useState(false);
  const modalOpen = isDeployModalOpen !== undefined ? isDeployModalOpen : internalModalOpen;
  const setModalOpen = setIsDeployModalOpen || setInternalModalOpen;

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
          onOpenDeployModal={() => setModalOpen(true)}
          onRefresh={onRefresh}
          isRefreshing={isRefreshing}
        />

        <main className="flex-1 p-6 lg:p-8 max-w-6xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Deployment Modal */}
      <TriggerDeployModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        projects={projects}
        initialProjectId={selectedProjectId}
        defaultBranch={activeProject?.branch || 'main'}
        onDeploySuccess={(res, deployedProjectId) => {
          if (onDeploySuccess) onDeploySuccess(res, deployedProjectId);
        }}
      />
    </div>
  );
}
