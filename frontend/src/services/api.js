const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

const ADMIN_SECRET_STORAGE_KEY = 'deployflow_admin_secret';

export const getSavedAdminSecret = () => {
  try {
    return sessionStorage.getItem(ADMIN_SECRET_STORAGE_KEY) || '';
  } catch {
    return '';
  }
};

export const saveAdminSecret = (secret) => {
  try {
    if (secret) {
      sessionStorage.setItem(ADMIN_SECRET_STORAGE_KEY, secret);
    } else {
      sessionStorage.removeItem(ADMIN_SECRET_STORAGE_KEY);
    }
  } catch {
    // sessionStorage not available
  }
};

async function handleResponse(response) {
  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
    }
    const message = errorData.error || errorData.message || `Request failed with status ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.details = errorData;
    throw error;
  }
  return response.json();
}

export const api = {
  // Health
  async getHealth() {
    const res = await fetch(`${API_BASE_URL}/api/health`, {
      headers: { Accept: 'application/json' }
    });
    return handleResponse(res);
  },

  // Projects
  async getProjects() {
    const res = await fetch(`${API_BASE_URL}/api/projects`, {
      headers: { Accept: 'application/json' }
    });
    return handleResponse(res);
  },

  // Commits
  async getCommits() {
    const res = await fetch(`${API_BASE_URL}/api/commits`, {
      headers: { Accept: 'application/json' }
    });
    return handleResponse(res);
  },

  // Deployments
  async getDeployments(page = 1, limit = 20, projectId = null) {
    const projectQuery = projectId ? `&projectId=${encodeURIComponent(projectId)}` : '';
    const res = await fetch(`${API_BASE_URL}/api/deployments?page=${page}&limit=${limit}${projectQuery}`, {
      headers: { Accept: 'application/json' }
    });
    return handleResponse(res);
  },

  // Single Deployment
  async getDeployment(runId) {
    const res = await fetch(`${API_BASE_URL}/api/deployments/${runId}`, {
      headers: { Accept: 'application/json' }
    });
    return handleResponse(res);
  },

  // Deployment Jobs & Steps
  async getDeploymentJobs(runId) {
    const res = await fetch(`${API_BASE_URL}/api/deployments/${runId}/jobs`, {
      headers: { Accept: 'application/json' }
    });
    return handleResponse(res);
  },

  // Job Raw Logs
  async getJobLogs(jobId) {
    const res = await fetch(`${API_BASE_URL}/api/jobs/${jobId}/logs`);
    if (!res.ok) {
      let errJson;
      try {
        errJson = await res.json();
      } catch {
        // text
      }
      const err = new Error(errJson?.error || `Unable to fetch logs (${res.status})`);
      err.status = res.status;
      throw err;
    }
    return res.text();
  },

  // Trigger Deployment via workflow_dispatch
  async triggerDeploy(branch = 'main', secret = '', projectId = 'proj_primary', workflowId = null) {
    const token = secret || getSavedAdminSecret();
    const res = await fetch(`${API_BASE_URL}/api/deploy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-secret': token
      },
      body: JSON.stringify({ branch, projectId, workflowId })
    });
    return handleResponse(res);
  }
};
