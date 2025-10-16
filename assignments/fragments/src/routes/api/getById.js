const Fragment = require('../../model/fragments');
const logger = require('../../logger');
const { createSuccessResponse, createErrorResponse } = require('../../response');

// GET /v1/fragments/:id handler - return the fragment with the specified ID for the current user
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

    const data = await fragment.getData();
    logger.info(`Fragment ${fragment.id} retrieved for user ${req.user}`);

    // Set the Location header to the fragment URL
    const location = `${req.protocol}://${req.get('host')}/v1/fragments/${fragment.id}`;
    res.setHeader('Location', location);

    // Return the fragment data with metadata
    res.status(200).json(
      createSuccessResponse({
        fragment: {
          id: fragment.id,
          ownerId: fragment.ownerId,
          created: fragment.created,
          updated: fragment.updated,
          type: fragment.type,
          size: fragment.size,
          data: data ? data.toString('utf8') : null,
        },
      })
    );
  } catch (error) {
    logger.error(error);
    res.status(500).json(createErrorResponse(500, 'Internal server error'));
  }
};
