/** Demo user: Carol User from seed data (created_by on sample tickets). */
export const CURRENT_USER_ID = 3

export const PRIORITIES = ['Low', 'Medium', 'High', 'Critical']

export const STATUSES = ['Open', 'In Progress', 'Resolved', 'Closed', 'Cancelled']

/** Mirrors backend ALLOWED_TRANSITIONS in status.py */
export const ALLOWED_TRANSITIONS = {
  Open: ['In Progress', 'Cancelled'],
  'In Progress': ['Resolved', 'Cancelled'],
  Resolved: ['Closed'],
  Closed: [],
  Cancelled: [],
}

export function getAllowedTransitions(currentStatus) {
  return ALLOWED_TRANSITIONS[currentStatus] ?? []
}
