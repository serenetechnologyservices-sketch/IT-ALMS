// Feature: ticket-management, Property 1: Ticket creation rejects missing mandatory fields
// Validates: Requirements 1.1
// Feature: ticket-management, Property 2: New tickets always have status open
// Validates: Requirements 1.6
const fc = require('fast-check');
const { validateTicketCreate } = require('../../src/utils/ticketValidation');

describe('Property 1: Ticket creation rejects missing mandatory fields', () => {
  test('For any payload missing at least one of asset_id/issue_type/description, validation returns error', () => {
    const mandatoryField = fc.constantFrom('asset_id', 'issue_type', 'description');
    const validPayload = fc.record({
      asset_id: fc.integer({ min: 1 }),
      issue_type: fc.string({ minLength: 1, maxLength: 50 }),
      description: fc.string({ minLength: 1, maxLength: 200 }),
    });

    fc.assert(
      fc.property(validPayload, mandatoryField, (payload, fieldToRemove) => {
        const broken = { ...payload, [fieldToRemove]: undefined };
        const err = validateTicketCreate(broken);
        expect(err).not.toBeNull();
      }),
      { numRuns: 200 }
    );
  });

  test('For any payload with all mandatory fields present, validation passes', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1 }),
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.string({ minLength: 1, maxLength: 200 }),
        (asset_id, issue_type, description) => {
          const err = validateTicketCreate({ asset_id, issue_type, description });
          expect(err).toBeNull();
        }
      ),
      { numRuns: 200 }
    );
  });
});

describe('Property 2: New tickets always have status open', () => {
  test('Default status in Ticket model definition is open', () => {
    const Ticket = require('../../src/models/Ticket');
    const statusAttr = Ticket.rawAttributes.status;
    expect(statusAttr.defaultValue).toBe('open');
  });

  test('Default reopen_count is 0', () => {
    const Ticket = require('../../src/models/Ticket');
    const attr = Ticket.rawAttributes.reopen_count;
    expect(attr.defaultValue).toBe(0);
  });
});
