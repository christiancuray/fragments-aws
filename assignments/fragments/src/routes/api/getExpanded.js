const Fragment = require('../../model/fragments');
const logger = require('../../logger');
const { createSuccessResponse, createErrorResponse } = require('../../response');

// GET /v1/fragments/?expand=1 handler - return the list of fragments with extended metadata for the current user
module.exports = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json(createErrorResponse(401, 'Unauthorized'));
    }
    const fragmentList = await Fragment.byUser(req.user);

    if (!fragmentList || fragmentList.length === 0) {
      return res.status(404).json(createErrorResponse(404, 'No fragments found'));
    }
    logger.info(`User ${req.user} has ${fragmentList.length} fragments`);

    const extendedFragments = fragmentList.map((f) => ({
      id: f.id,
      ownerId: f.ownerId,
      type: f.type,
      size: f.size,
      created: f.created,
      updated: f.updated,
    }));

    // return the full fragment objects
    res.status(200).json(
      createSuccessResponse({
        fragments: extendedFragments,
        message: 'fragments extended retrieved successfully',
      })
    );
  } catch (err) {
    logger.error(err);
    res.status(500).json(createErrorResponse(500, 'Internal server error'));
  }
};
