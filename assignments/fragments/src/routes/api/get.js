const logger = require('../../logger');
const Fragment = require('../../model/fragments');
const { createSuccessResponse, createErrorResponse } = require('../../response');

// GET /v1/fragments handler - return the list of fragments for the current user
module.exports = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json(createErrorResponse(401, 'Unauthorized'));
    }

    // get the list of fragments for the user from the model
    const fragments = await Fragment.byUser(req.user);

    // take the ids from the fragments
    const fragmentIds = fragments.map((f) => f.id);

    logger.info(`User ${req.user} has ${fragmentIds.length} fragments`);
    // this is a placeholder response. To get something working, return an empty array.
    res.status(200).json(
      createSuccessResponse({
        fragments: fragmentIds,
        message: 'fragments retrieved successfully',
      })
    );
  } catch (err) {
    logger.error(err);
    res.status(500).json(createErrorResponse(500, 'Internal server error'));
  }
};
