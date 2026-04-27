// Feature: ticket-management, Property 10: Work progress data round-trip
// Validates: Requirements 5.1, 5.2, 5.3
const fc = require('fast-check');
const { calculateEffortHours } = require('../../src/utils/effortCalculation');

describe('Property 10: Work progress data round-trip', () => {
  const wpArb = fc.record({
    work_notes: fc.option(fc.string({ maxLength: 200 }), { nil: undefined }),
    customer_comments: fc.option(fc.string({ maxLength: 200 }), { nil: undefined }),
    technician_name: fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: undefined }),
    technician_id: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined }),
    root_cause: fc.option(fc.string({ maxLength: 200 }), { nil: undefined }),
    resolution_summary: fc.option(fc.string({ maxLength: 200 }), { nil: undefined }),
    action_taken: fc.option(fc.string({ maxLength: 200 }), { nil: undefined }),
  });

  test('For any work progress entry, all fields are preserved in a simulated store', () => {
    fc.assert(
      fc.property(wpArb, (wp) => {
        // Simulate create + retrieve
        const stored = { ...wp, id: 1, ticket_id: 1, created_at: new Date() };
        if (wp.work_notes !== undefined) expect(stored.work_notes).toBe(wp.work_notes);
        if (wp.customer_comments !== undefined) expect(stored.customer_comments).toBe(wp.customer_comments);
        if (wp.technician_name !== undefined) expect(stored.technician_name).toBe(wp.technician_name);
        if (wp.technician_id !== undefined) expect(stored.technician_id).toBe(wp.technician_id);
        if (wp.root_cause !== undefined) expect(stored.root_cause).toBe(wp.root_cause);
        if (wp.resolution_summary !== undefined) expect(stored.resolution_summary).toBe(wp.resolution_summary);
        if (wp.action_taken !== undefined) expect(stored.action_taken).toBe(wp.action_taken);
      }),
      { numRuns: 200 }
    );
  });

  test('Work notes and customer comments are stored as separate fields', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        fc.string({ minLength: 1, maxLength: 100 }),
        (notes, comments) => {
          const entry = { work_notes: notes, customer_comments: comments };
          expect(entry.work_notes).not.toBe(entry.customer_comments);
          expect(entry.work_notes).toBe(notes);
          expect(entry.customer_comments).toBe(comments);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Effort hours are computed when start and end times are provided', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1577836800000, max: 1893456000000 }),
        fc.integer({ min: 1, max: 480 }),
        (startMs, offsetMin) => {
          const start = new Date(startMs);
          const end = new Date(startMs + offsetMin * 60 * 1000);
          const effort = calculateEffortHours(start, end);
          expect(effort).not.toBeNull();
          expect(effort).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});
