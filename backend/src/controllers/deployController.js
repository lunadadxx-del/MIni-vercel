const githubService = require('../services/githubService');
const config = require('../config/env');

const getDeployments = async (req, res, next) => {
  try {
    if (!config.isConfigured.github) {
      return res.status(200).json({
        configured: false,
        message: 'GitHub repository not configured. Set GITHUB_OWNER and GITHUB_REPO to monitor deployments.',
        totalCount: 0,
        deployments: []
      });
    }

    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '20', 10);

    const result = await githubService.getWorkflowRuns(page, limit);

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
    const { branch, ref } = req.body || {};
    const targetRef = branch || ref || 'main';

    const dispatchResult = await githubService.triggerWorkflowDispatch(targetRef);

    res.status(202).json({
      success: true,
      message: `Deployment triggered successfully via GitHub Actions workflow_dispatch on branch "${targetRef}".`,
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
