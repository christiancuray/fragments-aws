const { createErrorResponse, createSuccessResponse } = require('../../src/response.js');

describe('API responses', () => {
  // test case calling the createSuccessResponse function
  test('createErrorResponse()', () => {
    const errorRes = createErrorResponse(404, 'Not found');

    expect(errorRes).toEqual({
      status: 'error',
      error: {
        code: 404,
        message: 'Not found',
      },
    });
  });

  // test case calling the createSuccessResponse function
  test('createSuccessResponse()', () => {
    const successRes = createSuccessResponse();

    expect(successRes).toEqual({
      status: 'ok',
    });
  });

  // test fot calling createSuccessResponse with args
  test('createSuccessResponse(data)', () => {
    const data = { a: 1, b: 2 };
    const successRes = createSuccessResponse(data);

    expect(successRes).toEqual({
      status: 'ok',
      a: 1,
      b: 2,
    });
  });
});
