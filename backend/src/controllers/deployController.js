const githubService = require('../services/githubService');
const renderService = require('../services/renderService');
const projectStorage = require('../services/projectStorage');
const config = require('../config/env');

const getDeployments = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '20', 10);
    const projectId = req.query.projectId;

    // Check if querying for an imported Render project
    if (projectId && (projectId.startsWith('proj_render_') || projectId.startsWith('srv-'))) {
      const project = projectStorage.getProjectById(projectId);
      if (project && project.renderServiceId && config.isConfigured.render) {
        try {
          const renderDeploys = await renderService.getDeployments(project.renderServiceId, limit);
          const mapped = (renderDeploys || []).map((dep, idx) => {
            const isCompleted = dep.status === 'live' || dep.status === 'build_failed' || dep.status === 'canceled';
            const isSuccess = dep.status === 'live';
            const isFailed = dep.status === 'build_failed' || dep.status === 'canceled';

            return {
              id: dep.id,
              name: `Render Build & Deploy`,
              headBranch: project.branch || 'main',
              headSha: dep.commit?.id || '',
              shortSha: dep.commit?.shortId || 'render',
              status: isCompleted ? 'completed' : (dep.status === 'build_in_progress' ? 'in_progress' : 'queued'),
              conclusion: isSuccess ? 'success' : (isFailed ? 'failure' : null),
              event: dep.trigger || 'api',
              runNumber: (renderDeploys.length - idx),
              htmlUrl: project.liveUrl,
              createdAt: dep.createdAt,
              updatedAt: dep.updatedAt || dep.createdAt,
              runStartedAt: dep.createdAt,
              durationSeconds: dep.finishedAt && dep.createdAt
                ? Math.max(0, Math.round((new Date(dep.finishedAt).getTime() - new Date(dep.createdAt).getTime()) / 1000))
                : 0,
              actor: {
                login: 'Render Auto-Deploy',
                avatarUrl: ''
              },
              commit: {
                message: dep.commit?.message || 'Automatic deployment from GitHub repository',
                author: 'DeployFlow API',
                timestamp: dep.createdAt
              }
            };
          });

          return res.status(200).json({
            configured: true,
            totalCount: mapped.length,
            page: 1,
            perPage: limit,
            filteredByWorkflow: 'Render REST API',
            deployments: mapped
          });
        } catch (err) {
          // Fall through to standard handling
        }
      }
    }

    if (!config.isConfigured.github) {
      return res.status(200).json({
        configured: false,
        message: 'GitHub repository not configured. Set GITHUB_OWNER and GITHUB_REPO to monitor deployments.',
        totalCount: 0,
        deployments: []
      });
    }

    let targetWorkflow = req.query.workflowId || null;
    if (req.query.projectId === 'proj_demo_portfolio') {
      targetWorkflow = config.github.demoWorkflowId || 'demo-portfolio-deploy.yml';
    } else if (req.query.projectId === 'proj_primary') {
      targetWorkflow = config.github.workflowId || 'deploy.yml';
    }

    const result = await githubService.getWorkflowRuns(page, limit, targetWorkflow);

    res.status(200).json({
      configured: true,
      totalCount: result.totalCount,
      page: result.page,
      perPage: result.perPage,
      filteredByWorkflow: result.filteredByWorkflow,
      deployments: result.runs
    });
  } catch (error) {
    next(error);
  }
};

const getDeploymentById = async (req, res, next) => {
  try {
    const { runId } = req.params;
    if (!runId || isNaN(runId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid runId parameter. Must be an integer.'
      });
    }

    const deployment = await githubService.getWorkflowRun(runId);
    res.status(200).json({
      success: true,
      deployment
    });
  } catch (error) {
    next(error);
  }
};

const getDeploymentJobs = async (req, res, next) => {
  try {
    const { runId } = req.params;
    if (!runId || isNaN(runId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid runId parameter. Must be an integer.'
      });
    }

    const jobsData = await githubService.getWorkflowRunJobs(runId);
    res.status(200).json({
      success: true,
      ...jobsData
    });
  } catch (error) {
    next(error);
  }
};

const getJobLogs = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    if (!jobId || isNaN(jobId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid jobId parameter. Must be an integer.'
      });
    }

    if (!config.github.token) {
      return res.status(503).json({
        success: false,
        error: 'GitHub token required to download raw execution logs. Configure GITHUB_TOKEN on backend.'
      });
    }

    const logs = await githubService.getJobLogs(jobId);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send(logs);
  } catch (error) {
    // If logs are expired or not accessible
    if (error.response && error.response.status === 404) {
      return res.status(404).json({
        success: false,
        error: 'Logs for this job are no longer available or job does not exist.'
      });
    }
    next(error);
  }
};

const triggerDeploy = async (req, res, next) => {
  try {
    const { branch, ref, projectId, workflowId } = req.body || {};
    const targetRef = branch || ref || 'main';

    // Handle Render API project deployment
    if (projectId && (projectId.startsWith('proj_render_') || projectId.startsWith('srv-'))) {
      const project = projectStorage.getProjectById(projectId);
      if (!project || !project.renderServiceId) {
        return res.status(404).json({
          success: false,
          error: `Project with ID "${projectId}" not found in storage.`
        });
      }

      if (!config.isConfigured.render) {
        return res.status(503).json({
          success: false,
          error: 'Render API key is not configured on the backend.'
        });
      }

      const result = await renderService.triggerDeploy(project.renderServiceId);
      return res.status(202).json({
        success: true,
        message: `Deployment triggered successfully on Render for "${project.name}".`,
        data: result
      });
    }

    let targetWorkflow = workflowId || null;
    if (projectId === 'proj_demo_portfolio') {
      targetWorkflow = config.github.demoWorkflowId || 'demo-portfolio-deploy.yml';
    } else if (projectId === 'proj_primary') {
      targetWorkflow = config.github.workflowId || 'deploy.yml';
    }

    const dispatchResult = await githubService.triggerWorkflowDispatch(targetRef, {}, targetWorkflow);

    res.status(202).json({
      success: true,
      message: `Deployment triggered successfully via GitHub Actions workflow_dispatch on branch "${targetRef}" (workflow: ${dispatchResult.workflow || 'default'}).`,
      data: dispatchResult
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDeployments,
  getDeploymentById,
  getDeploymentJobs,
  getJobLogs,
  triggerDeploy
};
