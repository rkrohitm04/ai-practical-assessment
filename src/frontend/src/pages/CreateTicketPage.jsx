import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createTicket } from '../api/tickets'
import { ApiError } from '../api/client'
import { CURRENT_USER_ID, PRIORITIES } from '../constants'
import AlertBanner from '../components/AlertBanner'
import {
  validateOptionalPositiveInt,
  validatePositiveInt,
  validatePriority,
  validateRequiredString,
} from '../utils/validation'

export default function CreateTicketPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    created_by: String(CURRENT_USER_ID),
    assigned_to: '',
  })
  const [fieldErrors, setFieldErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  function validateForm() {
    const errors = {}
    const titleErr = validateRequiredString(form.title, 'Title', { max: 255 })
    if (titleErr) errors.title = titleErr
    const descErr = validateRequiredString(form.description, 'Description')
    if (descErr) errors.description = descErr
    const priorityErr = validatePriority(form.priority)
    if (priorityErr) errors.priority = priorityErr
    const createdErr = validatePositiveInt(form.created_by, 'Created by')
    if (createdErr) errors.created_by = createdErr
    const assignedErr = validateOptionalPositiveInt(form.assigned_to, 'Assigned to')
    if (assignedErr) errors.assigned_to = assignedErr
    return errors
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitError('')
    const errors = validateForm()
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }
    setFieldErrors({})
    setSubmitting(true)
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        priority: form.priority,
        created_by: Number(form.created_by),
        assigned_to: form.assigned_to ? Number(form.assigned_to) : null,
      }
      const ticket = await createTicket(payload)
      navigate(`/tickets/${ticket.id}`)
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.detail : 'Failed to create ticket.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page page-narrow">
      <div className="page-header">
        <div>
          <h1>Create ticket</h1>
          <p className="page-subtitle">Open a new support request</p>
        </div>
        <Link to="/" className="btn btn-ghost">
          Back to list
        </Link>
      </div>

      <AlertBanner message={submitError} onDismiss={() => setSubmitError('')} />

      <form className="card form-stack" onSubmit={handleSubmit} noValidate>
        <label className="field">
          <span>Title</span>
          <input
            name="title"
            type="text"
            maxLength={255}
            value={form.title}
            onChange={handleChange}
            aria-invalid={Boolean(fieldErrors.title)}
          />
          {fieldErrors.title && <span className="field-error">{fieldErrors.title}</span>}
        </label>

        <label className="field">
          <span>Description</span>
          <textarea
            name="description"
            rows={5}
            value={form.description}
            onChange={handleChange}
            aria-invalid={Boolean(fieldErrors.description)}
          />
          {fieldErrors.description && (
            <span className="field-error">{fieldErrors.description}</span>
          )}
        </label>

        <label className="field">
          <span>Priority</span>
          <select
            name="priority"
            value={form.priority}
            onChange={handleChange}
            aria-invalid={Boolean(fieldErrors.priority)}
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          {fieldErrors.priority && <span className="field-error">{fieldErrors.priority}</span>}
        </label>

        <label className="field">
          <span>Created by (user ID)</span>
          <input
            name="created_by"
            type="number"
            min="1"
            value={form.created_by}
            onChange={handleChange}
            aria-invalid={Boolean(fieldErrors.created_by)}
          />
          {fieldErrors.created_by && (
            <span className="field-error">{fieldErrors.created_by}</span>
          )}
        </label>

        <label className="field">
          <span>Assigned to (user ID, optional)</span>
          <input
            name="assigned_to"
            type="number"
            min="1"
            value={form.assigned_to}
            onChange={handleChange}
            placeholder="Leave empty for unassigned"
            aria-invalid={Boolean(fieldErrors.assigned_to)}
          />
          {fieldErrors.assigned_to && (
            <span className="field-error">{fieldErrors.assigned_to}</span>
          )}
        </label>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Creating…' : 'Create ticket'}
          </button>
        </div>
      </form>
    </div>
  )
}
