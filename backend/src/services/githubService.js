const axios = require('axios');
const config = require('../config/env');

class GitHubService {
  constructor() {
    this.baseURL = 'https://api.github.com';
  }

  /**
   * Helper to get an axios client with current config
   */
  getClient() {
    const headers = {
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'DeployFlow-MiniVercel/1.0.0'
    };

    if (config.github.token) {
      headers.Authorization = `Bearer ${config.github.token}`;
    }

    return axios.create({
      baseURL: this.baseURL,
      headers,
      timeout: 12000
    });
  }

  checkConfiguration() {
    if (!config.github.owner || !config.github.repo) {
      const error = new Error('GitHub repository is not configured. Set GITHUB_OWNER and GITHUB_REPO in backend environment variables.');
      error.status = 503;
      error.isConfigError = true;
      throw error;
    }
  }

  async getRepository() {
    this.checkConfiguration();
    const client = this.getClient();
    const { owner, repo } = config.github;

    const response = await client.get(`/repos/${owner}/${repo}`);
    const data = response.data;

    return {
      name: data.name,
      fullName: data.full_name,
      owner: data.owner?.login,
      ownerAvatar: data.owner?.avatar_url,
      description: data.description || 'Automated Web Application Deployment Platform with Docker & GitHub Actions',
      htmlUrl: data.html_url,
      defaultBranch: data.default_branch || 'main',
      stars: data.stargazers_count,
      forks: data.forks_count,
      openIssues: data.open_issues_count,
      isPrivate: data.private,
      updatedAt: data.updated_at,
      pushedAt: data.pushed_at,
      workflowId: config.github.workflowId,
      liveAppUrl: config.liveAppUrl,
      isConfigured: true
    };
  }

  async getWorkflowRuns(page = 1, perPage = 20, targetWorkflowId = null) {
    this.checkConfiguration();
    const client = this.getClient();
    const { owner, repo } = config.github;
    const workflowId = targetWorkflowId || config.github.workflowId;

    let runsResponse;
    let usedWorkflowId = true;

    try {
      if (workflowId) {
        runsResponse = await client.get(`/repos/${owner}/${repo}/actions/workflows/${workflowId}/runs`, {
          params: { page, per_page: perPage }
        });
      }
    } catch (err) {
      // If specific workflow is not found (e.g. 404), fall back to general repo runs
      if (err.response && err.response.status === 404) {
        usedWorkflowId = false;
      } else {
        throw err;
      }
    }

    if (!runsResponse) {
      runsResponse = await client.get(`/repos/${owner}/${repo}/actions/runs`, {
        params: { page, per_page: perPage }
      });
    }

    const { total_count, workflow_runs } = runsResponse.data;

    const runs = (workflow_runs || []).map((run) => {
      const started = new Date(run.run_started_at || run.created_at).getTime();
      const updated = new Date(run.updated_at).getTime();
      const durationSeconds = Math.max(0, Math.round((updated - started) / 1000));

      return {
        id: run.id,
        name: run.name,
        headBranch: run.head_branch,
        headSha: run.head_sha,
        shortSha: run.head_sha ? run.head_sha.substring(0, 7) : 'unknown',
        status: run.status, // queued, in_progress, completed
        conclusion: run.conclusion, // success, failure, neutral, cancelled, timed_out, action_required
        event: run.event, // push, workflow_dispatch, pull_request
        runNumber: run.run_number,
        htmlUrl: run.html_url,
        createdAt: run.created_at,
        updatedAt: run.updated_at,
        runStartedAt: run.run_started_at,
        durationSeconds,
        actor: {
          login: run.actor?.login || 'github-actions[bot]',
          avatarUrl: run.actor?.avatar_url || ''
        },
        commit: {
          message: run.head_commit?.message || 'Manual trigger or commit',
          author: run.head_commit?.author?.name || run.actor?.login || 'Developer',
          timestamp: run.head_commit?.timestamp || run.created_at
        }
      };
    });

    return {
      totalCount: total_count,
      page,
      perPage,
      filteredByWorkflow: usedWorkflowId ? workflowId : null,
      runs
    };
  }

  async getWorkflowRun(runId) {
    this.checkConfiguration();
    const client = this.getClient();
    const { owner, repo } = config.github;

    const response = await client.get(`/repos/${owner}/${repo}/actions/runs/${runId}`);
    const run = response.data;

    const started = new Date(run.run_started_at || run.created_at).getTime();
    const updated = new Date(run.updated_at).getTime();
    const durationSeconds = Math.max(0, Math.round((updated - started) / 1000));

    return {
      id: run.id,
      name: run.name,
      headBranch: run.head_branch,
      headSha: run.head_sha,
      shortSha: run.head_sha ? run.head_sha.substring(0, 7) : 'unknown',
      status: run.status,
      conclusion: run.conclusion,
      event: run.event,
      runNumber: run.run_number,
      htmlUrl: run.html_url,
      createdAt: run.created_at,
      updatedAt: run.updated_at,
      runStartedAt: run.run_started_at,
      durationSeconds,
      actor: {
        login: run.actor?.login,
        avatarUrl: run.actor?.avatar_url
      },
      commit: {
        message: run.head_commit?.message || 'Workflow run commit',
        author: run.head_commit?.author?.name || run.actor?.login,
        timestamp: run.head_commit?.timestamp || run.created_at
      }
    };
  }

  async getWorkflowRunJobs(runId) {
    this.checkConfiguration();
    const client = this.getClient();
    const { owner, repo } = config.github;

    const response = await client.get(`/repos/${owner}/${repo}/actions/runs/${runId}/jobs`);
    const { total_count, jobs } = response.data;

    const formattedJobs = (jobs || []).map((job) => {
      const started = job.started_at ? new Date(job.started_at).getTime() : 0;
      const completed = job.completed_at ? new Date(job.completed_at).getTime() : 0;
      const durationSeconds = started && completed ? Math.max(0, Math.round((completed - started) / 1000)) : 0;

      return {
        id: job.id,
        runId: job.run_id,
        name: job.name,
        status: job.status,
        conclusion: job.conclusion,
        startedAt: job.started_at,
        completedAt: job.completed_at,
        durationSeconds,
        htmlUrl: job.html_url,
        steps: (job.steps || []).map((step) => ({
          name: step.name,
          status: step.status,
          conclusion: step.conclusion,
          number: step.number,
          startedAt: step.started_at,
          completedAt: step.completed_at
        }))
      };
    });

    return {
      totalCount: total_count,
      runId: parseInt(runId, 10),
      jobs: formattedJobs
    };
  }

  async getJobLogs(jobId) {
    this.checkConfiguration();
    const client = this.getClient();
    const { owner, repo } = config.github;

    // GitHub returns 302 redirect for raw log download
    const response = await client.get(`/repos/${owner}/${repo}/actions/jobs/${jobId}/logs`, {
      responseType: 'text',
      maxRedirects: 5
    });

    return response.data;
  }

  async getCommits(perPage = 10) {
    this.checkConfiguration();
    const client = this.getClient();
    const { owner, repo } = config.github;

    const response = await client.get(`/repos/${owner}/${repo}/commits`, {
      params: { per_page: perPage }
    });

    return (response.data || []).map((item) => ({
      sha: item.sha,
      shortSha: item.sha ? item.sha.substring(0, 7) : '',
      message: item.commit?.message?.split('\n')[0] || 'No commit message',
      fullMessage: item.commit?.message || '',
      author: {
        name: item.commit?.author?.name || item.author?.login || 'Developer',
        login: item.author?.login,
        avatarUrl: item.author?.avatar_url
      },
      date: item.commit?.author?.date || item.commit?.committer?.date,
      htmlUrl: item.html_url
    }));
  }

  async triggerWorkflowDispatch(ref = 'main', inputs = {}, targetWorkflowId = null) {
    this.checkConfiguration();

    if (!config.github.token) {
      const error = new Error('GITHUB_TOKEN is required to trigger workflow_dispatch. Please configure GITHUB_TOKEN on backend.');
      error.status = 503;
      throw error;
    }

    const client = this.getClient();
    const { owner, repo } = config.github;
    const workflowId = targetWorkflowId || config.github.workflowId;

    // Validate ref to prevent command injection / invalid format
    const cleanRef = typeof ref === 'string' && ref.trim() ? ref.trim() : 'main';
    if (!/^[a-zA-Z0-9_.\-\/]+$/.test(cleanRef)) {
      const error = new Error('Invalid branch name provided.');
      error.status = 400;
      throw error;
    }

    const payload = {
      ref: cleanRef,
      inputs: inputs && typeof inputs === 'object' ? inputs : {}
    };

    const response = await client.post(
      `/repos/${owner}/${repo}/actions/workflows/${workflowId}/dispatches`,
      payload
    );

    return {
      success: true,
      statusCode: response.status,
      ref: cleanRef,
      workflow: workflowId,
      dispatchedAt: new Date().toISOString()
    };
  }
}

module.exports = new GitHubService();
