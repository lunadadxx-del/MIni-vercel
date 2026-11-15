const githubService = require('../services/githubService');
const config = require('../config/env');

const getProjects = async (req, res, next) => {
  try {
    if (!config.isConfigured.github) {
      return res.status(200).json({
        configured: false,
        message: 'GitHub repository is not configured on the backend. Please define GITHUB_OWNER and GITHUB_REPO.',
        projects: []
      });
    }

    const repoInfo = await githubService.getRepository();

    res.status(200).json({
      configured: true,
      projects: [
        {
          id: 'proj_primary',
          name: repoInfo.name,
          fullName: repoInfo.fullName,
          owner: repoInfo.owner,
          ownerAvatar: repoInfo.ownerAvatar,
          description: repoInfo.description,
          branch: repoInfo.defaultBranch,
          repoUrl: repoInfo.htmlUrl,
          liveUrl: repoInfo.liveAppUrl,
          stars: repoInfo.stars,
          forks: repoInfo.forks,
          openIssues: repoInfo.openIssues,
          visibility: repoInfo.isPrivate ? 'private' : 'public',
          updatedAt: repoInfo.updatedAt,
          workflowId: repoInfo.workflowId,
          status: 'active'
        }
      ]
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
  getCommits
};
