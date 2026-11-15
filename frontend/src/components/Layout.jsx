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
  onDeploySuccess
}) {
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Fixed Left Sidebar */}
      <Sidebar health={health} liveUrl={activeProject?.liveUrl} />

      {/* Main Content Area (offset by 64 = 16rem = w-64) */}
      <div className="flex-1 ml-64 flex flex-col min-w-0">
        <Navbar
          projects={projects}
          selectedProjectId={selectedProjectId}
          onSelectProject={onSelectProject}
          activeProject={activeProject}
          onOpenDeployModal={() => setIsDeployModalOpen(true)}
          onRefresh={onRefresh}
          isRefreshing={isRefreshing}
        />

        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Deployment Modal */}
      <TriggerDeployModal
        isOpen={isDeployModalOpen}
        onClose={() => setIsDeployModalOpen(false)}
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
