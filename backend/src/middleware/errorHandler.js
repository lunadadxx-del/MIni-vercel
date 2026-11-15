/**
 * Centralized error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  // eslint-disable-next-line no-console
  console.error('[Error Handler]:', err.message || err);

  // Handle GitHub API errors specifically if attached
  if (err.isAxiosError && err.response) {
    const status = err.response.status;
    const message = err.response.data?.message || err.message;

    if (status === 403 && message.includes('API rate limit exceeded')) {
      return res.status(429).json({
        success: false,
        error: 'GitHub API rate limit exceeded. Please ensure GITHUB_TOKEN is set for higher quota.',
        details: message
      });
    }

    if (status === 404) {
      return res.status(404).json({
        success: false,
        error: 'GitHub resource not found. Check repository owner and name.',
        details: message
      });
    }

    if (status === 401) {
      return res.status(502).json({
        success: false,
        error: 'GitHub API authentication failed. Verify GITHUB_TOKEN has appropriate permissions.',
        details: message
      });
    }

    return res.status(status).json({
      success: false,
      error: `GitHub API error: ${message}`,
      details: err.response.data
    });
  }

  // Generic fallback
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
};

module.exports = errorHandler;
