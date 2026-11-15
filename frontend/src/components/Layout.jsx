import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import TriggerDeployModal from './TriggerDeployModal';

export default function Layout({
  children,
  health,
  project,
  onRefresh,
  isRefreshing,
  onDeploySuccess
}) {
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Fixed Left Sidebar */}
      <Sidebar health={health} liveUrl={project?.liveUrl} />

      {/* Main Content Area (offset by 64 = 16rem = w-64) */}
      <div className="flex-1 ml-64 flex flex-col min-w-0">
        <Navbar
          project={project}
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
        defaultBranch={project?.branch || 'main'}
        onDeploySuccess={(res) => {
          if (onDeploySuccess) onDeploySuccess(res);
        }}
      />
    </div>
  );
}
