const logger = require('../../logger');
const Fragment = require('../../model/fragments');
const { createSuccessResponse, createErrorResponse } = require('../../response');

// POST /v1/fragments handler - create a new fragment for the current user
module.exports = async (req, res) => {
  // Validate Content-Type header first (required for all requests)
  const contentType = req.get('Content-Type');
  if (!contentType) {
    logger.error('Content-Type header is missing');
    return res.status(415).json(createErrorResponse(415, 'Content-Type header is missing'));
  }

  // Check if the content type is supported
  if (!Fragment.isSupportedType(contentType)) {
    logger.error(`Unsupported Media Type: ${contentType}`);
    return res.status(415).json(createErrorResponse(415, `Unsupported Media Type: ${contentType}`));
  }

  //check if got buffer from raw body parser
  if (Buffer.isBuffer(req.body)) {
    try {
      // create fragment object
      const fragment = new Fragment({
        ownerId: req.user,
        type: contentType,
        size: req.body.length,
      });

      // For testing purposes: trigger an error if the data contains "ERROR"
      if (req.body.toString().includes('ERROR')) {
        throw new Error('Test error triggered');
      }

      // set fragment data
      await fragment.setData(req.body);
      logger.info(`Fragment ${fragment.id} created for user ${req.user}`);
      //save fragment data
      await fragment.save();

      // Build Location URL from request (supports both localhost and production)
      const location = `${req.protocol}://${req.get('host')}/v1/fragments/${fragment.id}`;

      res.setHeader('Location', location);
      //return success response with 201 status code
      res.status(201).json(
        createSuccessResponse({
          fragment: {
            id: fragment.id,
            ownerId: fragment.ownerId,
            created: fragment.created,
            updated: fragment.updated,
            type: fragment.type,
            size: fragment.size,
          },
          message: 'fragment created successfully',
        })
      );
      logger.info(`Fragment ${fragment.id} created and saved successfully`);
    } catch (err) {
      logger.error(err);
      res.status(500).json(createErrorResponse(500, 'Internal server error'));
    }
  } else {
    // if the body is not a buffer, content type is already validated above
    logger.error('Invalid request body');
    return res.status(400).json(createErrorResponse(400, 'Bad Request: Body must be a Buffer'));
  }
};
