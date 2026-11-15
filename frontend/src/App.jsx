import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Deployments from './pages/Deployments';
import BuildLogs from './pages/BuildLogs';
import Settings from './pages/Settings';
import { api } from './services/api';

export default function App() {
  const [health, setHealth] = useState(null);
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('proj_demo_portfolio');
  const [workflowFilter, setWorkflowFilter] = useState('all');
  const [deployments, setDeployments] = useState([]);
  const [commits, setCommits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [deployTargetProject, setDeployTargetProject] = useState(null);

  const fetchData = useCallback(async (isSilent = false) => {
    if (!isSilent) {
      setIsRefreshing(true);
    }
    setError(null);

    try {
      // 1. Health check
      try {
        const healthData = await api.getHealth();
        setHealth(healthData);
      } catch (err) {
        setHealth({ status: 'error', error: err.message });
      }

      // 2. Project details
      try {
        const projectData = await api.getProjects();
        if (projectData.projects && projectData.projects.length > 0) {
          setProjects(projectData.projects);
        } else {
          setProjects([]);
        }
      } catch (err) {
        // Handled gracefully
      }

      // 3. Deployments (fetch all runs across workflows)
      try {
        const deployData = await api.getDeployments(1, 30);
        setDeployments(deployData.deployments || []);
      } catch (err) {
        // Handled gracefully
      }

      // 4. Commits
      try {
        const commitData = await api.getCommits();
        setCommits(commitData.commits || []);
      } catch (err) {
        // Handled gracefully
      }
    } catch (err) {
      setError(err.message || 'An error occurred fetching dashboard data.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    // Periodic telemetry polling every 25 seconds
    const interval = setInterval(() => {
      fetchData(true);
    }, 25000);

    return () => clearInterval(interval);
  }, [fetchData]);

  const handleDeploySuccess = (res, deployedProjectId) => {
    if (deployedProjectId) {
      setSelectedProjectId(deployedProjectId);
    }
    // Re-sync after short delay so GitHub Actions has time to register queued run
    setTimeout(() => {
      fetchData(true);
    }, 2500);
  };

  const activeProject = projects.find((p) => p.id === selectedProjectId) || projects[0] || null;

  return (
    <Router>
      <Layout
        health={health}
        projects={projects}
        selectedProjectId={selectedProjectId}
        onSelectProject={(id) => setSelectedProjectId(id)}
        activeProject={activeProject}
        onRefresh={() => fetchData(false)}
        isRefreshing={isRefreshing}
        onDeploySuccess={handleDeploySuccess}
      >
        <Routes>
          <Route
            path="/"
            element={
              <Dashboard
                projects={projects}
                selectedProjectId={selectedProjectId}
                onSelectProject={(id) => setSelectedProjectId(id)}
                activeProject={activeProject}
                deployments={deployments}
                commits={commits}
                health={health}
                loading={loading}
                error={error}
              />
            }
          />
          <Route
            path="/projects"
            element={
              <Projects
                projects={projects}
                health={health}
                loading={loading}
                onTriggerDeployProject={(id) => {
                  setSelectedProjectId(id);
                  // Trigger open modal via query or state
                }}
              />
            }
          />
          <Route
            path="/deployments"
            element={
              <Deployments
                deployments={deployments}
                projects={projects}
                selectedWorkflowFilter={workflowFilter}
                onSelectWorkflowFilter={(filter) => setWorkflowFilter(filter)}
                loading={loading}
                error={error}
                onRefresh={() => fetchData(false)}
              />
            }
          />
          <Route
            path="/logs"
            element={
              <BuildLogs
                deployments={deployments}
                loadingRuns={loading}
              />
            }
          />
          <Route
            path="/settings"
            element={
              <Settings
                health={health}
                project={activeProject}
                onRefresh={() => fetchData(false)}
              />
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}
