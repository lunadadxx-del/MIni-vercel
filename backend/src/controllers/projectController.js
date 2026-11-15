const githubService = require('../services/githubService');
const renderService = require('../services/renderService');
const projectStorage = require('../services/projectStorage');
const config = require('../config/env');

const parseGitHubUrl = (rawUrl) => {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  const clean = rawUrl.trim();
  const match = clean.match(/github\.com[/:]([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+?)(?:\.git|\/)?$/);
  if (!match) return null;
  return {
    owner: match[1],
    repo: match[2].replace(/\.git$/, ''),
    cleanUrl: `https://github.com/${match[1]}/${match[2].replace(/\.git$/, '')}`
  };
};

const getProjects = async (req, res, next) => {
  try {
    const builtinProjects = [];

    // Built-in primary project & demo portfolio
    if (config.isConfigured.github) {
      try {
        const repoInfo = await githubService.getRepository();
        builtinProjects.push({
          id: 'proj_primary',
          name: 'DeployFlow Platform',
          fullName: repoInfo.fullName,
          owner: repoInfo.owner,
          ownerAvatar: repoInfo.ownerAvatar,
          description: repoInfo.description || 'Core deployment dashboard and Docker backend API',
          rootDirectory: 'backend & frontend',
          branch: repoInfo.defaultBranch,
          repoUrl: repoInfo.htmlUrl,
          liveUrl: repoInfo.liveAppUrl,
          stars: repoInfo.stars,
          forks: repoInfo.forks,
          openIssues: repoInfo.openIssues,
          visibility: repoInfo.isPrivate ? 'private' : 'public',
          updatedAt: repoInfo.updatedAt,
          workflowId: config.github.workflowId || 'deploy.yml',
          runtime: 'Docker Web Service (Backend) + Static Site (Frontend)',
          deploymentType: 'github_actions',
          status: 'active'
        });

        builtinProjects.push({
          id: 'proj_demo_portfolio',
          name: 'DeployFlow Demo Portfolio',
          fullName: `${repoInfo.fullName}/demo-portfolio`,
          owner: repoInfo.owner,
          ownerAvatar: repoInfo.ownerAvatar,
          description: 'Modern developer portfolio deployed end-to-end through Mini Vercel platform via automated CI/CD',
          rootDirectory: 'demo-portfolio',
          branch: repoInfo.defaultBranch,
          repoUrl: `${repoInfo.htmlUrl}/tree/${repoInfo.defaultBranch}/demo-portfolio`,
          liveUrl: config.demoPortfolioLiveUrl,
          stars: repoInfo.stars,
          forks: repoInfo.forks,
          openIssues: repoInfo.openIssues,
          visibility: repoInfo.isPrivate ? 'private' : 'public',
          updatedAt: repoInfo.updatedAt,
          workflowId: config.github.demoWorkflowId || 'demo-portfolio-deploy.yml',
          runtime: 'Render Static Site',
          deploymentType: 'github_actions',
          status: 'active'
        });
      } catch (err) {
        // Fallback for primary projects if GitHub API fails
        builtinProjects.push({
          id: 'proj_primary',
          name: 'DeployFlow Platform',
          fullName: `${config.github.owner}/${config.github.repo}`,
          owner: config.github.owner,
          description: 'Core deployment dashboard and Docker backend API',
          branch: 'main',
          repoUrl: `https://github.com/${config.github.owner}/${config.github.repo}`,
          liveUrl: config.liveAppUrl,
          workflowId: config.github.workflowId || 'deploy.yml',
          runtime: 'Docker Web Service (Backend) + Static Site (Frontend)',
          deploymentType: 'github_actions',
          status: 'active'
        });
      }
    }

    // Get imported projects from persistent store
    const importedProjects = projectStorage.getImportedProjects();

    const allProjects = [...builtinProjects, ...importedProjects];

    res.status(200).json({
      configured: config.isConfigured.github || allProjects.length > 0,
      renderApiConfigured: config.isConfigured.render,
      projects: allProjects
    });
  } catch (error) {
    next(error);
  }
};

const importProject = async (req, res, next) => {
  try {
    const { repoUrl, projectName, branch = 'main', publishDir = '.', buildCommand = '' } = req.body || {};

    if (!repoUrl) {
      return res.status(400).json({
        success: false,
        error: 'GitHub repository URL is required.'
      });
    }

    const parsed = parseGitHubUrl(repoUrl);
    if (!parsed) {
      return res.status(400).json({
        success: false,
        error: 'Invalid GitHub repository URL format. Example: https://github.com/lunadadxx-del/html-live'
      });
    }

    if (!config.isConfigured.render) {
      return res.status(503).json({
        success: false,
        error: 'Render API key is not configured on the backend. Please define RENDER_API_KEY in your environment variables to enable auto-deployment.'
      });
    }

    const targetName = (projectName && projectName.trim()) || parsed.repo;
    const targetBranch = (branch && branch.trim()) || 'main';
    const targetPublish = (publishDir && publishDir.trim()) || '.';
    const targetBuild = buildCommand ? buildCommand.trim() : '';

    // Create Static Site on Render via official REST API
    const renderServiceData = await renderService.createStaticSite({
      name: targetName,
      repoUrl: parsed.cleanUrl,
      branch: targetBranch,
      publishPath: targetPublish,
      buildCommand: targetBuild
    });

    const newProject = {
      id: `proj_render_${renderServiceData.id}`,
      renderServiceId: renderServiceData.id,
      name: targetName,
      fullName: `${parsed.owner}/${parsed.repo}`,
      owner: parsed.owner,
      description: `Render Static Site auto-deployed from ${parsed.cleanUrl}`,
      rootDirectory: targetPublish,
      branch: targetBranch,
      repoUrl: parsed.cleanUrl,
      liveUrl: renderServiceData.liveUrl,
      workflowId: 'Render REST API',
      runtime: 'Render Static Site (Auto-Deploy)',
      deploymentType: 'render_api',
      buildCommand: targetBuild,
      publishPath: targetPublish,
      status: 'building',
      createdAt: new Date().toISOString()
    };

    // Save to persistent storage
    const saved = projectStorage.addProject(newProject);

    res.status(201).json({
      success: true,
      message: `Project "${targetName}" created successfully and deployment initiated on Render.`,
      project: saved
    });
  } catch (error) {
    next(error);
  }
};

const getProjectStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const project = projectStorage.getProjectById(id);

    if (!project) {
      // Check if it's a built-in project
      if (id === 'proj_primary' || id === 'proj_demo_portfolio') {
        if (!config.isConfigured.github) {
          return res.status(200).json({
            success: true,
            projectId: id,
            deploymentType: 'github_actions',
            status: 'active',
            conclusion: 'success',
            message: 'GitHub repository not configured on backend.'
          });
        }
        const targetWorkflow = id === 'proj_demo_portfolio' ? config.github.demoWorkflowId : config.github.workflowId;
        const runs = await githubService.getWorkflowRuns(1, 1, targetWorkflow);
        const latestRun = runs.runs && runs.runs.length > 0 ? runs.runs[0] : null;
        return res.status(200).json({
          success: true,
          projectId: id,
          deploymentType: 'github_actions',
          status: latestRun ? latestRun.status : 'active',
          conclusion: latestRun ? latestRun.conclusion : 'success',
          latestRun
        });
      }

      return res.status(404).json({
        success: false,
        error: `Project with id "${id}" not found.`
      });
    }

    if (project.deploymentType === 'render_api' && project.renderServiceId) {
      if (!config.isConfigured.render) {
        return res.status(200).json({
          success: true,
          projectId: id,
          status: project.status || 'unknown',
          liveUrl: project.liveUrl,
          message: 'Render API key not configured on backend to fetch live deploy updates.'
        });
      }

      const service = await renderService.getService(project.renderServiceId);
      const deploys = await renderService.getDeployments(project.renderServiceId, 5);
      const latestDeploy = deploys && deploys.length > 0 ? deploys[0] : null;

      let calculatedStatus = 'building';
      if (latestDeploy) {
        if (latestDeploy.status === 'live') calculatedStatus = 'live';
        else if (latestDeploy.status === 'build_failed' || latestDeploy.status === 'canceled') calculatedStatus = 'failed';
        else calculatedStatus = 'building';
      }

      // Update storage with fresh liveUrl and status
      const updated = projectStorage.updateProject(id, {
        liveUrl: service.liveUrl || project.liveUrl,
        status: calculatedStatus,
        latestDeployId: latestDeploy?.id
      });

      return res.status(200).json({
        success: true,
        projectId: id,
        deploymentType: 'render_api',
        status: calculatedStatus,
        service,
        latestDeploy,
        deploys,
        liveUrl: service.liveUrl || project.liveUrl,
        project: updated
      });
    }

    res.status(200).json({
      success: true,
      project
    });
  } catch (error) {
    next(error);
  }
};

const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (id === 'proj_primary' || id === 'proj_demo_portfolio') {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete primary built-in system project.'
      });
    }

    const removed = projectStorage.deleteProject(id);
    if (!removed) {
      return res.status(404).json({
        success: false,
        error: `Project with id "${id}" not found in imported list.`
      });
    }

    res.status(200).json({
      success: true,
      message: `Project "${id}" successfully removed from Mini Vercel.`
    });
  } catch (error) {
    next(error);
  }
};

const getCommits = async (req, res, next) => {
  try {
    if (!config.isConfigured.github) {
      return res.status(200).json({
        configured: false,
        message: 'GitHub repository not configured.',
        commits: []
      });
    }

    const commits = await githubService.getCommits(10);
    res.status(200).json({
      configured: true,
      commits
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjects,
  importProject,
  getProjectStatus,
  deleteProject,
  getCommits
};
