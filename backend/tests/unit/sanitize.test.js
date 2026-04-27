const { sanitizeBody } = require('../../src/middleware/validate');

describe('Input Sanitization', () => {
  const mockNext = jest.fn();

  test('strips HTML tags from strings', () => {
    const req = { body: { name: '<script>alert("xss")</script>Hello', desc: '<b>Bold</b> text' } };
    sanitizeBody(req, {}, mockNext);
    expect(req.body.name).toBe('alert("xss")Hello');
    expect(req.body.desc).toBe('Bold text');
    expect(mockNext).toHaveBeenCalled();
  });

  test('trims whitespace', () => {
    const req = { body: { name: '  hello  ' } };
    sanitizeBody(req, {}, mockNext);
    expect(req.body.name).toBe('hello');
  });

  test('leaves numbers and booleans untouched', () => {
    const req = { body: { count: 5, active: true } };
    sanitizeBody(req, {}, mockNext);
    expect(req.body.count).toBe(5);
    expect(req.body.active).toBe(true);
  });

  test('handles null body', () => {
    const req = { body: null };
    expect(() => sanitizeBody(req, {}, mockNext)).not.toThrow();
  });
});
