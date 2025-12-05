const MarkdownIt = require('markdown-it');
const Fragment = require('../../model/fragments');
const logger = require('../../logger');
const { createErrorResponse } = require('../../response');
const md = new MarkdownIt();

// GET /v1/fragments/:id.ext handler
module.exports = async (req, res) => {
  try {
    // get the fragment id and extension from the req params
    const { ext } = req.params;

    // get the fragment by id
    const fragment = await Fragment.byId(req.user, req.params.id);

    // return if not found
    if (!fragment) {
      return res.status(404).json(createErrorResponse(404, 'Fragment not found'));
    }

    const type = fragment.type;
    logger.info(
      `Fragment ${fragment.id} of type ${type} retrieved for user ${req.user} with conversion to .${ext}`
    );

    // get the fragment data
    const data = await fragment.getData();

    // NOTE: Assignment 2 tasK only!
    if (ext === 'html') {
      if (!type.startsWith('text/markdown')) {
        return res
          .status(415)
          .json(createErrorResponse(415, 'Can only convert Markdown (.md) to HTML'));
      }

      const html = md.render(data.toString());

      // Set the Content-Type header to text/html and return the HTML
      res.setHeader('Content-Type', 'text/html');
      fragment.type = 'text/html';
      await fragment.save();

      return res.status(200).send(html);
    }
  } catch (error) {
    logger.error(error);
    res.status(500).json(createErrorResponse(500, 'Internal server error'));
  }
};
