const { validateTicketCreate, isValidFeedbackRating, isAllowedFileType } = require('../../src/utils/ticketValidation');
const { calculateEffortHours } = require('../../src/utils/effortCalculation');
const { isValidTicketTransition, TICKET_TRANSITIONS, VALID_TICKET_STATUSES } = require('../../src/utils/stateMachine');

describe('Ticket Validation', () => {
  test('rejects missing asset_id', () => {
    expect(validateTicketCreate({ issue_type: 'x', description: 'y' })).not.toBeNull();
  });
  test('rejects missing description', () => {
    expect(validateTicketCreate({ asset_id: 1, issue_type: 'x' })).not.toBeNull();
  });
  test('rejects missing issue_type', () => {
    expect(validateTicketCreate({ asset_id: 1, description: 'y' })).not.toBeNull();
  });
  test('accepts valid payload', () => {
    expect(validateTicketCreate({ asset_id: 1, issue_type: 'x', description: 'y' })).toBeNull();
  });
  test('rejects empty body', () => {
    expect(validateTicketCreate({})).not.toBeNull();
  });
});

describe('Feedback Rating', () => {
  test('valid ratings 1-5', () => {
    for (let i = 1; i <= 5; i++) expect(isValidFeedbackRating(i)).toBe(true);
  });
  test('invalid ratings', () => {
    expect(isValidFeedbackRating(0)).toBe(false);
    expect(isValidFeedbackRating(6)).toBe(false);
    expect(isValidFeedbackRating(-1)).toBe(false);
  });
  test('null/undefined is valid (optional)', () => {
    expect(isValidFeedbackRating(null)).toBe(true);
    expect(isValidFeedbackRating(undefined)).toBe(true);
  });
});

describe('File Type Validation', () => {
  test('allows images', () => {
    expect(isAllowedFileType('image/jpeg')).toBe(true);
    expect(isAllowedFileType('image/png')).toBe(true);
  });
  test('allows PDF', () => {
    expect(isAllowedFileType('application/pdf')).toBe(true);
  });
  test('rejects scripts', () => {
    expect(isAllowedFileType('application/javascript')).toBe(false);
    expect(isAllowedFileType('text/html')).toBe(false);
  });
});

describe('Effort Calculation', () => {
  test('2 hours difference', () => {
    const start = new Date('2024-01-01T10:00:00');
    const end = new Date('2024-01-01T12:00:00');
    expect(calculateEffortHours(start, end)).toBe(2);
  });
  test('30 minutes = 0.5 hours', () => {
    const start = new Date('2024-01-01T10:00:00');
    const end = new Date('2024-01-01T10:30:00');
    expect(calculateEffortHours(start, end)).toBe(0.5);
  });
  test('null when end <= start', () => {
    const t = new Date('2024-01-01T10:00:00');
    expect(calculateEffortHours(t, t)).toBeNull();
    expect(calculateEffortHours(new Date('2024-01-02'), new Date('2024-01-01'))).toBeNull();
  });
  test('null when missing args', () => {
    expect(calculateEffortHours(null, new Date())).toBeNull();
    expect(calculateEffortHours(new Date(), null)).toBeNull();
  });
});

describe('State Machine', () => {
  test('all statuses are defined', () => {
    expect(VALID_TICKET_STATUSES).toContain('open');
    expect(VALID_TICKET_STATUSES).toContain('on_hold');
    expect(VALID_TICKET_STATUSES).toContain('awaiting_parts');
    expect(VALID_TICKET_STATUSES).toContain('completed');
    expect(VALID_TICKET_STATUSES.length).toBe(9);
  });
  test('valid transitions', () => {
    expect(isValidTicketTransition('open', 'assigned')).toBe(true);
    expect(isValidTicketTransition('in_progress', 'on_hold')).toBe(true);
    expect(isValidTicketTransition('closed', 'open')).toBe(true);
  });
  test('invalid transitions', () => {
    expect(isValidTicketTransition('open', 'closed')).toBe(false);
    expect(isValidTicketTransition('open', 'in_progress')).toBe(false);
    expect(isValidTicketTransition('closed', 'resolved')).toBe(false);
  });
  test('every status has defined transitions', () => {
    for (const s of VALID_TICKET_STATUSES) {
      expect(TICKET_TRANSITIONS[s]).toBeDefined();
      expect(Array.isArray(TICKET_TRANSITIONS[s])).toBe(true);
    }
  });
});
