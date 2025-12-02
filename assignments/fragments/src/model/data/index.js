// If the environment sets an AWS Region, we will use AWS backend services.
// ( S3, DynamoDB ); otherwise, we will use in-memory db,

module.exports = process.env.AWS_REGION ? require('./aws') : require('./memory');
