const logger = require('../../logger');
const Fragment = require('../../model/fragments');
const { createSuccessResponse, createErrorResponse } = require('../../response');

// PUT /v1/fragments/:id handler - update a fragment by id for the current user
module.exports = async (req, res) => {
  try {
    // Get the fragment
    const fragment = await Fragment.byId(req.user, req.params.id);

    if (!fragment) {
      logger.warn(`Fragment ${req.params.id} not found for user ${req.user}`);
      return res.status(404).json(createErrorResponse(404, 'Fragment not found'));
    }

    // Check if the fragment belongs to the authenticated user
    if (fragment.ownerId !== req.user) {
      return res.status(404).json(createErrorResponse(404, 'Fragment not found'));
    }

    // Get the Content-Type from the request
    const contentType = req.get('Content-Type');

    // Validate that the Content-Type matches the existing fragment's type
    if (contentType !== fragment.type) {
      return res
        .status(400)
        .json(
          createErrorResponse(
            400,
            `Cannot change fragment type. Expected ${fragment.type}, got ${contentType}`
          )
        );
    }

    // Update the fragment's data with the request body
    await fragment.setData(req.body);

    logger.info(`Fragment ${fragment.id} updated for user ${req.user}`);

    res.Header('Location', `${req.protocol}://${req.get('host')}/v1/fragments/${fragment.id}`);
    // Return the updated fragment with metadata
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
