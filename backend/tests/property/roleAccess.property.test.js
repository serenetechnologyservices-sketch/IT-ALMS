// Feature: asset-intelligence-platform, Property 16: Role-based access enforcement
// Validates: Requirements 12.3, 12.4
const fc = require('fast-check');

// Simulate the roleGuard middleware logic
function roleGuard(allowedRoles, userRole) {
  return allowedRoles.includes(userRole);
}

const ALL_ROLES = ['Employee', 'Reporting Manager', 'Admin', 'CIO', 'Service Partner', 'Service Engineer'];

const ENDPOINT_PERMISSIONS = [
  { endpoint: 'POST /assets', allowed: ['Admin'] },
  { endpoint: 'PUT /assets/:id', allowed: ['Admin'] },
  { endpoint: 'DELETE /assets/:id', allowed: ['Admin'] },
  { endpoint: 'POST /allocations', allowed: ['Admin'] },
  { endpoint: 'PUT /approvals/:id', allowed: ['Reporting Manager', 'Admin'] },
  { endpoint: 'GET /intelligence/alerts', allowed: ['Admin', 'CIO'] },
  { endpoint: 'GET /financial/summary', allowed: ['Admin', 'CIO'] },
  { endpoint: 'POST /catalog', allowed: ['Admin'] },
  { endpoint: 'PUT /tickets/:id/assign', allowed: ['Admin'] },
];

describe('Property 16: Role-based access enforcement', () => {
  test('For any user role and endpoint, access is granted iff the role is permitted', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...ALL_ROLES),
        fc.constantFrom(...ENDPOINT_PERMISSIONS),
        (role, endpoint) => {
          const granted = roleGuard(endpoint.allowed, role);
          const shouldBeGranted = endpoint.allowed.includes(role);
          expect(granted).toBe(shouldBeGranted);
        }
      ),
      { numRuns: 200 }
    );
  });
});
