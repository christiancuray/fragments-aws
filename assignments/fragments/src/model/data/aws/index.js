const s3Client = require('./s3Client');
const ddbDocClient = require('./ddbDocClient');
const { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { PutCommand, GetCommand, QueryCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');
const logger = require('../../../logger');

// write fragment metadata to DynamoDB
async function writeFragment(id, fragment) {
  if (!id || !fragment) {
    throw new Error('ID and fragment object are required');
  }

  const params = {
    TableName: process.env.AWS_DYNAMODB_TABLE_NAME,
    Item: fragment,
  };
  // create a PUT command to send to DynamoDb
  const command = new PutCommand(params);

  try {
    logger.debug({ id }, 'Writing fragment metadata to DynamoDB successfully');
    return await ddbDocClient.send(command);
  } catch (err) {
    logger.error({ err, id }, 'Error writing fragment metadata to DynamoDB');
    throw new Error('unable to write fragment metadata');
  }
}

// read fragment metadata from DynamoDB
async function readFragment(ownerId, id) {
  if (!id) {
    throw new Error('ID is required');
  }
  if (!ownerId) {
    throw new Error('Owner ID is required');
  }

  // Create the GET API params from our details
  const params = {
    TableName: process.env.AWS_DYNAMODB_TABLE_NAME,
    Key: { ownerId, id },
  };

  // create a GET command to send to DynamoDb
  const command = new GetCommand(params);

  try {
    const data = await ddbDocClient.send(command);
    logger.debug({ id }, 'Reading fragment metadata from DynamoDB successfully');
    // return the item if found, else null
    return data.Item || null;
  } catch (err) {
    logger.error({ err, id }, 'Error reading fragment metadata from DynamoDB');
    throw new Error({ id }, 'unable to read fragment metadata');
  }
}

// write fragment data to a S3 Object in a Bucket using the AWS SDK
async function writeFragmentData(ownerId, id, data) {
  // Create the PUT API params from our details
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    // Our key will be a mix of the ownerID and fragment id, written as a path
    Key: `${ownerId}/${id}`,
    Body: data,
  };

  // Create a PUT Object command to send to S3
  const command = new PutObjectCommand(params);

  try {
    // Use our client to send the command
    await s3Client.send(command);
    logger.info({ ownerId, id }, 'Fragment data written to S3');
  } catch (err) {
    // If anything goes wrong, log enough info that we can debug
    const { Bucket, Key } = params;
    logger.error({ err, Bucket, Key }, 'Error uploading fragment data to S3');
    throw new Error('unable to upload fragment data');
  }
}

// Convert a stream of data into a Buffer, by collecting
// chunks of data until finished, then assembling them together.
// We wrap the whole thing in a Promise so it's easier to consume.
const streamToBuffer = (stream) =>
  new Promise((resolve, reject) => {
    // As the data streams in, we'll collect it into an array.
    const chunks = [];

    // Streams have events that we can listen for and run
    // code.  We need to know when new `data` is available,
    // if there's an `error`, and when we're at the `end`
    // of the stream.

    // When there's data, add the chunk to our chunks list
    stream.on('data', (chunk) => chunks.push(chunk));
    // When there's an error, reject the Promise
    stream.on('error', reject);
    // When the stream is done, resolve with a new Buffer of our chunks
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });

// read fragment data from S3 and returns (Promise<Buffer>)
async function readFragmentData(ownerId, id) {
  // Create the PUT API params from our details
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    // Our key will be a mix of the ownerID and fragment id, written as a path
    Key: `${ownerId}/${id}`,
  };

  // Create a GET Object command to send to S3
  const command = new GetObjectCommand(params);

  try {
    // Get the object from the Amazon S3 bucket. It is returned as a ReadableStream.
    const data = await s3Client.send(command);
    logger.info({ data, id }, 'Read fragment data from S3');
    // Convert the ReadableStream to a Buffer
    return streamToBuffer(data.Body);
  } catch (err) {
    const { Bucket, Key } = params;
    logger.error({ err, Bucket, Key }, 'Error streaming fragment data from S3');
    throw new Error('unable to read fragment data');
  }
}

// list all fragment IDs for a given ownerId
async function listFragments(ownerId, expand = false) {
  if (!ownerId) {
    throw new Error('Owner ID is required');
  }

  const params = {
    TableName: process.env.AWS_DYNAMODB_TABLE_NAME,
    // Specify that we want to get all items where the ownerId is equal to the
    // `:ownerId` that we'll define below in the ExpressionAttributeValues.
    KeyConditionExpression: 'ownerId = :ownerId',
    // Use the `ownerId` value to do the query
    ExpressionAttributeValues: {
      ':ownerId': ownerId,
    },
  };

  // Limit to only `id` if we aren't supposed to expand. Without doing this
  // we'll get back every attribute.  The projection expression defines a list
  // of attributes to return.
  if (!expand) {
    params.ProjectionExpression = 'id';
  }

  // create a QUERY command to send to DynamoDb
  const command = new QueryCommand(params);

  try {
    const data = await ddbDocClient.send(command);
    logger.debug({ ownerId }, 'Listing fragment IDs from DynamoDB successfully');

    // If we are expanding, return the full items, else just the IDs
    return !expand ? data?.Items.map((item) => item.id) : data?.Items;
  } catch (err) {
    logger.error({ err, ownerId }, 'Error listing fragment IDs from DynamoDB');
    throw new Error('unable to list fragment IDs');
  }
}

// update fragment data in S3 and metadata in DynamoDB
//async function updateFragment(ownerId, id, data) {};

// delete fragment and its data from S3 object in a Bucket and from DynamoDB
async function deleteFragment(ownerId, id) {
  // Create the DELETE API params from our details
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    // Our key will be a mix of the ownerID and fragment id, written as a path
    Key: `${ownerId}/${id}`,
  };

  // Create a DELETE Object command to send to S3
  const command = new DeleteObjectCommand(params);

  try {
    // Use our client to send the command
    await s3Client.send(command);
    logger.debug({ ownerId, id }, 'Deleted fragment data from S3');
  } catch (err) {
    // If anything goes wrong, log enough info that we can debug
    const { Bucket, Key } = params;
    logger.error({ err, Bucket, Key }, 'Error deleting fragment data from S3');
    throw new Error('unable to delete fragment data');
  }

  // create params to delete fragment metadata from DynamoDB
  const dbParams = {
    TableName: process.env.AWS_DYNAMODB_TABLE_NAME,
    Key: { ownerId, id },
  };

  // create a DELETE command to send to DynamoDb
  const dbCommand = new DeleteCommand(dbParams);

  try {
    await ddbDocClient.send(dbCommand);
    logger.debug({ ownerId, id }, 'Deleted fragment metadata from DynamoDB successfully');
  } catch (err) {
    logger.error({ err, ownerId, id }, 'Error deleting fragment metadata from DynamoDB');
    throw new Error('unable to delete fragment metadata');
  }

  // return true if deletion was successful for both S3 and DynamoDB
  return true;
}

module.exports = {
  writeFragment,
  readFragment,
  writeFragmentData,
  readFragmentData,
  listFragments,
  deleteFragment,
};
