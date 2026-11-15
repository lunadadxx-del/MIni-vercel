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
          status: 'active'
        },
        {
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
