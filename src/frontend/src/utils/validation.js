export function validateRequiredString(value, fieldLabel, { min = 1, max } = {}) {
  const trimmed = (value ?? '').trim()
  if (trimmed.length < min) {
    return `${fieldLabel} is required (minimum ${min} character${min === 1 ? '' : 's'}).`
  }
  if (max !== undefined && trimmed.length > max) {
    return `${fieldLabel} must be at most ${max} characters.`
  }
  return null
}

export function validatePositiveInt(value, fieldLabel, { required = true } = {}) {
  if (value === '' || value === null || value === undefined) {
    return required ? `${fieldLabel} is required.` : null
  }
  const num = Number(value)
  if (!Number.isInteger(num) || num < 1) {
    return `${fieldLabel} must be a positive whole number.`
  }
  return null
}

export function validateOptionalPositiveInt(value, fieldLabel) {
  if (value === '' || value === null || value === undefined) {
    return null
  }
  return validatePositiveInt(value, fieldLabel, { required: true })
}

export function validatePriority(value) {
  const priorities = ['Low', 'Medium', 'High', 'Critical']
  if (!priorities.includes(value)) {
    return 'Please select a valid priority.'
  }
  return null
}
