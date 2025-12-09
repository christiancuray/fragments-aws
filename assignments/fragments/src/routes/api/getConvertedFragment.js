const MarkdownIt = require('markdown-it');
const Fragment = require('../../model/fragments');
const logger = require('../../logger');
const { createErrorResponse } = require('../../response');
const md = new MarkdownIt();

// Helper function to get content type based on extension
function getContentType(ext) {
  const contentTypeMap = {
    txt: 'text/plain; charset=utf-8',
    html: 'text/html; charset=utf-8',
    md: 'text/markdown; charset=utf-8',
    csv: 'text/csv; charset=utf-8',
    json: 'application/json',
    yaml: 'application/yaml; charset=utf-8',
    yml: 'application/yaml; charset=utf-8',
    png: 'image/png',
    jpg: 'image/jpeg',
    webp: 'image/webp',
    gif: 'image/gif',
    avif: 'image/avif',
  };
  return contentTypeMap[ext] || 'not/available';
}

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

    // Check if the requested extension is valid for this fragment type
    const validExtensions = Fragment.getConversionExtensions(type);
    if (!validExtensions.includes(ext)) {
      return res
        .status(415)
        .json(
          createErrorResponse(
            415,
            `Cannot convert ${type} to .${ext}. Valid conversions: ${validExtensions.join(', ')}`
          )
        );
    }

    // get the fragment data
    const data = await fragment.getData();

    // Handle text/markdown to HTML conversion
    if (type === 'text/markdown' && ext === 'html') {
      const html = md.render(data.toString());
      const contentType = getContentType(ext);
      res.setHeader('Content-Type', contentType);
      logger.info(`Successfully converted fragment ${fragment.id} from ${type} to .${ext}`);
      return res.status(200).send(html);
    }

    // Handle text/markdown to plain text conversion
    if (type === 'text/markdown' && ext === 'txt') {
      const contentType = getContentType(ext);
      res.setHeader('Content-Type', contentType);
      logger.info(`Successfully converted fragment ${fragment.id} from ${type} to .${ext}`);
      return res.status(200).send(data.toString());
    }

    // Handle markdown identity conversion (markdown to markdown)
    if (type === 'text/markdown' && ext === 'md') {
      const contentType = getContentType(ext);
      res.setHeader('Content-Type', contentType);
      logger.info(`Successfully converted fragment ${fragment.id} from ${type} to .${ext}`);
      return res.status(200).send(data.toString());
    }

    // Handle JSON to YAML conversion
    if (type === 'application/json' && (ext === 'yaml' || ext === 'yml')) {
      try {
        const json = JSON.parse(data.toString());
        // Simple YAML representation
        const yaml = jsonToYaml(json);
        const contentType = getContentType(ext);
        res.setHeader('Content-Type', contentType);
        logger.info(`Successfully converted fragment ${fragment.id} from ${type} to .${ext}`);
        return res.status(200).send(yaml);
      } catch (err) {
        return res.status(400).json(createErrorResponse(400, 'Invalid JSON data', err));
      }
    }

    // Handle JSON identity conversion (JSON to JSON)
    if (type === 'application/json' && ext === 'json') {
      const contentType = getContentType(ext);
      res.setHeader('Content-Type', contentType);
      logger.info(`Successfully converted fragment ${fragment.id} from ${type} to .${ext}`);
      return res.status(200).send(data.toString());
    }

    // Handle plain text conversions (HTML, JSON, CSV, YAML to text)
    if (
      (type === 'text/plain' && ext === 'txt') ||
      (type === 'text/html' && ext === 'txt') ||
      (type === 'text/csv' && ext === 'txt') ||
      (type === 'application/json' && ext === 'txt') ||
      (type === 'application/yaml' && ext === 'txt')
    ) {
      const contentType = getContentType(ext);
      res.setHeader('Content-Type', contentType);
      logger.info(`Successfully converted fragment ${fragment.id} from ${type} to .${ext}`);
      return res.status(200).send(data.toString());
    }

    // Handle HTML identity conversion (HTML to HTML)
    if (type === 'text/html' && ext === 'html') {
      const contentType = getContentType(ext);
      res.setHeader('Content-Type', contentType);
      logger.info(`Successfully converted fragment ${fragment.id} from ${type} to .${ext}`);
      return res.status(200).send(data.toString());
    }

    // Handle YAML identity conversions (YAML to YAML or YML)
    if (type === 'application/yaml' && (ext === 'yaml' || ext === 'yml')) {
      const contentType = getContentType(ext);
      res.setHeader('Content-Type', contentType);
      logger.info(`Successfully converted fragment ${fragment.id} from ${type} to .${ext}`);
      return res.status(200).send(data.toString());
    }

    // Handle CSV identity conversion (CSV to CSV)
    if (type === 'text/csv' && ext === 'csv') {
      const contentType = getContentType(ext);
      res.setHeader('Content-Type', contentType);
      logger.info(`Successfully converted fragment ${fragment.id} from ${type} to .${ext}`);
      return res.status(200).send(data.toString());
    }

    // Handle CSV to JSON conversion
    if (type === 'text/csv' && ext === 'json') {
      try {
        const csv = data.toString();
        const lines = csv.split('\n').filter((line) => line.trim());
        if (lines.length === 0) {
          return res.status(400).json(createErrorResponse(400, 'Invalid CSV data'));
        }
        const headers = lines[0].split(',').map((h) => h.trim());
        const records = lines.slice(1).map((line) => {
          const values = line.split(',').map((v) => v.trim());
          const obj = {};
          headers.forEach((header, i) => {
            obj[header] = values[i] || '';
          });
          return obj;
        });
        const contentType = getContentType(ext);
        res.setHeader('Content-Type', contentType);
        logger.info(`Successfully converted fragment ${fragment.id} from ${type} to .${ext}`);
        return res.status(200).json(records);
      } catch (err) {
        return res.status(400).json(createErrorResponse(400, 'Invalid CSV data', err));
      }
    }

    // Handle image conversions (return as-is with appropriate MIME type)
    const imageTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/avif', 'image/gif'];
    if (imageTypes.includes(type)) {
      const contentType = getContentType(ext);
      res.setHeader('Content-Type', contentType);
      logger.info(`Successfully converted fragment ${fragment.id} from ${type} to .${ext}`);
      return res.status(200).send(data);
    }

    // If we get here, the conversion is not implemented
    return res
      .status(415)
      .json(createErrorResponse(415, `Conversion from ${type} to .${ext} is not supported`));
  } catch (error) {
    logger.error(error);
    res.status(500).json(createErrorResponse(500, 'Internal server error'));
  }
};

// Helper function to convert JSON to YAML-like format
function jsonToYaml(obj, indent = '') {
  let yaml = '';
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      yaml += `${indent}${key}:\n${jsonToYaml(value, indent + '  ')}`;
    } else if (Array.isArray(value)) {
      yaml += `${indent}${key}:\n`;
      value.forEach((item) => {
        if (typeof item === 'object' && item !== null) {
          yaml += `${indent}  -\n${jsonToYaml(item, indent + '    ')}`;
        } else {
          yaml += `${indent}  - ${item}\n`;
        }
      });
    } else if (typeof value === 'string') {
      yaml += `${indent}${key}: '${value}'\n`;
    } else {
      yaml += `${indent}${key}: ${value}\n`;
    }
  }
  return yaml;
}
