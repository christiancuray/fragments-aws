const Fragment = require('../../model/fragments');
const logger = require('../../logger');
const { createSuccessResponse, createErrorResponse } = require('../../response');

// GET /v1/fragments/:id/info
module.exports = async (req, res) => {
  try {
    const fragment = await Fragment.byId(req.params.id);

    if (!fragment) {
      return res.status(404).json(createErrorResponse(404, 'Fragment not found'));
    }

    // Check if the fragment belongs to the authenticated user
    if (fragment.ownerId !== req.user) {
      return res.status(404).json(createErrorResponse(404, 'Fragment not found'));
    }

    logger.info(`Fragment info for ${fragment.id} retrieved for user ${req.user}`);

    // Return the fragment metadata without the data
    res.status(200).json(
      createSuccessResponse({
        fragment: {
          id: fragment.id,
          ownerId: fragment.ownerId,
          created: fragment.created,
          updated: fragment.updated,
          type: fragment.type,
          size: fragment.size,
        },
      })
    );
  } catch (error) {
    logger.error(error);
    res.status(500).json(createErrorResponse(500, 'Internal server error'));
  }
};
