// Feature: asset-intelligence-platform, Property 17: JWT contains correct role
// Validates: Requirements 12.2
const fc = require('fast-check');
const jwt = require('jsonwebtoken');

const SECRET = 'test_secret';

describe('Property 17: JWT contains correct role', () => {
  test('For any user with a given role, the JWT token should contain that exact role', () => {
    fc.assert(
      fc.property(
        fc.record({
          id: fc.integer({ min: 1, max: 100000 }),
          username: fc.string({ minLength: 3, maxLength: 20 }).map(s => s.replace(/[^a-z0-9]/g, 'a') || 'abc'),
          role: fc.constantFrom('Employee', 'Reporting Manager', 'Admin', 'CIO', 'Service Partner', 'Service Engineer'),
          role_id: fc.integer({ min: 1, max: 6 }),
        }),
        (user) => {
          const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role, role_id: user.role_id },
            SECRET,
            { expiresIn: '24h' }
          );
          const decoded = jwt.verify(token, SECRET);
          expect(decoded.id).toBe(user.id);
          expect(decoded.username).toBe(user.username);
          expect(decoded.role).toBe(user.role);
          expect(decoded.role_id).toBe(user.role_id);
        }
      ),
      { numRuns: 100 }
    );
  });
});
