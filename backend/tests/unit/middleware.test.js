const jwt = require('jsonwebtoken');
process.env.JWT_SECRET = 'test-secret';

const auth = require('../../src/middleware/auth');
const roleGuard = require('../../src/middleware/roleGuard');
const { requireFields } = require('../../src/middleware/validate');

describe('Auth Middleware', () => {
  const mockRes = () => ({ status: jest.fn().mockReturnThis(), json: jest.fn() });
  const mockNext = jest.fn();

  test('rejects request with no token', () => {
    const res = mockRes();
    auth({ headers: {} }, res, mockNext);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });

  test('rejects invalid token', () => {
    const res = mockRes();
    auth({ headers: { authorization: 'Bearer invalid-token' } }, res, mockNext);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('accepts valid token and sets req.user', () => {
    const token = jwt.sign({ id: 1, role: 'Admin' }, 'test-secret');
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = mockRes();
    const next = jest.fn();
    auth(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user).toBeDefined();
    expect(req.user.id).toBe(1);
    expect(req.user.role).toBe('Admin');
  });
});

describe('Role Guard Middleware', () => {
  const mockRes = () => ({ status: jest.fn().mockReturnThis(), json: jest.fn() });

  test('allows matching role', () => {
    const next = jest.fn();
    const guard = roleGuard('Admin', 'CIO');
    guard({ user: { role: 'Admin' } }, mockRes(), next);
    expect(next).toHaveBeenCalled();
  });

  test('rejects non-matching role', () => {
    const res = mockRes();
    const guard = roleGuard('Admin');
    guard({ user: { role: 'Employee' } }, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(403);
  });

  test('rejects missing user', () => {
    const res = mockRes();
    const guard = roleGuard('Admin');
    guard({}, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(403);
  });
});

describe('requireFields Middleware', () => {
  const mockRes = () => ({ status: jest.fn().mockReturnThis(), json: jest.fn() });

  test('passes when all fields present', () => {
    const next = jest.fn();
    requireFields('name', 'email')({ body: { name: 'John', email: 'j@x.com' } }, mockRes(), next);
    expect(next).toHaveBeenCalled();
  });

  test('rejects when field missing', () => {
    const res = mockRes();
    requireFields('name', 'email')({ body: { name: 'John' } }, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringContaining('email') }));
  });

  test('accepts 0 and false as valid values', () => {
    const next = jest.fn();
    requireFields('count', 'active')({ body: { count: 0, active: false } }, mockRes(), next);
    expect(next).toHaveBeenCalled();
  });
});
