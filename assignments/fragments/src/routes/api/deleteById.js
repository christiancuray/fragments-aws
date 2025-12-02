const Fragment = require('../../model/fragments');
const logger = require('../../logger');
const { createSuccessResponse, createErrorResponse } = require('../../response');

// DELETE /v1/fragments/:id handler - delete the fragment with the specified ID for the current user
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

    const deleted = await fragment.delete();
    if (deleted) {
      logger.info(`Fragment ${fragment.id} deleted for user ${req.user}`);
      return res
        .status(200)
        .json(createSuccessResponse({ message: 'Fragment deleted successfully' }));
    }
  } catch (error) {
    logger.error(error);
    res.status(500).json(createErrorResponse(500, 'Internal server error'));
  }
};
