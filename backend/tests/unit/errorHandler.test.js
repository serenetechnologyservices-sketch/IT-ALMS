const errorHandler = require('../../src/middleware/errorHandler');

describe('Error Handler', () => {
  const mockReq = { method: 'GET', originalUrl: '/test' };
  let mockRes;

  beforeEach(() => {
    mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => { console.error.mockRestore(); });

  test('handles SequelizeValidationError', () => {
    const err = { name: 'SequelizeValidationError', errors: [{ message: 'Name required' }] };
    errorHandler(err, mockReq, mockRes, jest.fn());
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ success: false, error: 'Name required' });
  });

  test('handles SequelizeUniqueConstraintError', () => {
    const err = { name: 'SequelizeUniqueConstraintError', message: 'dup' };
    errorHandler(err, mockReq, mockRes, jest.fn());
    expect(mockRes.status).toHaveBeenCalledWith(409);
  });

  test('handles JsonWebTokenError', () => {
    const err = { name: 'JsonWebTokenError', message: 'bad' };
    errorHandler(err, mockReq, mockRes, jest.fn());
    expect(mockRes.status).toHaveBeenCalledWith(401);
  });

  test('handles TokenExpiredError', () => {
    const err = { name: 'TokenExpiredError', message: 'expired' };
    errorHandler(err, mockReq, mockRes, jest.fn());
    expect(mockRes.status).toHaveBeenCalledWith(401);
  });

  test('handles MulterError file size', () => {
    const err = { name: 'MulterError', code: 'LIMIT_FILE_SIZE', message: 'too big' };
    errorHandler(err, mockReq, mockRes, jest.fn());
    expect(mockRes.status).toHaveBeenCalledWith(400);
  });

  test('handles bad JSON', () => {
    const err = { type: 'entity.parse.failed', message: 'bad json' };
    errorHandler(err, mockReq, mockRes, jest.fn());
    expect(mockRes.status).toHaveBeenCalledWith(400);
  });

  test('defaults to 500 for unknown errors', () => {
    const err = { name: 'Error', message: 'something broke' };
    errorHandler(err, mockReq, mockRes, jest.fn());
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({ success: false, error: 'Internal server error' });
  });

  test('uses statusCode if provided', () => {
    const err = { name: 'Error', message: 'not found', statusCode: 404 };
    errorHandler(err, mockReq, mockRes, jest.fn());
    expect(mockRes.status).toHaveBeenCalledWith(404);
  });
});
