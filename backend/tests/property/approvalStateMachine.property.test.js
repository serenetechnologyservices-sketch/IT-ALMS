// Feature: asset-intelligence-platform, Property 12: Approval workflow state machine
// Validates: Requirements 9.1, 9.2, 9.3, 9.4, 9.5, 9.6
const fc = require('fast-check');
const { isValidApprovalTransition, getApprovalNextStatus } = require('../../src/utils/stateMachine');

const ALL_STATUSES = ['pending_manager', 'pending_admin', 'approved', 'rejected'];
const ALL_ACTIONS = ['approved', 'rejected'];

describe('Property 12: Approval workflow state machine', () => {
  test('For any status and action, only valid transitions succeed', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...ALL_STATUSES),
        fc.constantFrom(...ALL_ACTIONS),
        (status, action) => {
          const valid = isValidApprovalTransition(status, action);
          const next = getApprovalNextStatus(status, action);

          if (status === 'pending_manager' && action === 'approved') {
            expect(valid).toBe(true);
            expect(next).toBe('pending_admin');
          } else if (status === 'pending_manager' && action === 'rejected') {
            expect(valid).toBe(true);
            expect(next).toBe('rejected');
          } else if (status === 'pending_admin' && action === 'approved') {
            expect(valid).toBe(true);
            expect(next).toBe('approved');
          } else if (status === 'pending_admin' && action === 'rejected') {
            expect(valid).toBe(true);
            expect(next).toBe('rejected');
          } else {
            expect(valid).toBe(false);
            expect(next).toBeNull();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Terminal states (approved, rejected) cannot transition further', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('approved', 'rejected'),
        fc.constantFrom(...ALL_ACTIONS),
        (status, action) => {
          expect(isValidApprovalTransition(status, action)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });
});
