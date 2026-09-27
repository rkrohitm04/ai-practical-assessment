import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  addComment,
  getTicket,
  updateTicket,
  updateTicketStatus,
} from '../api/tickets'
import { ApiError } from '../api/client'
import { CURRENT_USER_ID, getAllowedTransitions, PRIORITIES } from '../constants'
import AlertBanner from '../components/AlertBanner'
import {
  validateOptionalPositiveInt,
  validatePositiveInt,
  validatePriority,
  validateRequiredString,
} from '../utils/validation'

export default function TicketDetailPage() {
  const { ticketId } = useParams()
  const [ticket, setTicket] = useState(null)
  const [editForm, setEditForm] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})
  const [loadError, setLoadError] = useState('')
  const [saveError, setSaveError] = useState('')
  const [saveSuccess, setSaveSuccess] = useState('')
  const [transitionError, setTransitionError] = useState('')
  const [commentForm, setCommentForm] = useState({
    message: '',
    created_by: String(CURRENT_USER_ID),
  })
  const [commentErrors, setCommentErrors] = useState({})
  const [commentError, setCommentError] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [transitioning, setTransitioning] = useState(false)
  const [commentSubmitting, setCommentSubmitting] = useState(false)

  const loadTicket = useCallback(async () => {
    setLoading(true)
    setLoadError('')
    try {
      const data = await getTicket(ticketId)
      setTicket(data)
      setEditForm({
        title: data.title,
        description: data.description,
        priority: data.priority,
        assigned_to: data.assigned_to != null ? String(data.assigned_to) : '',
      })
    } catch (err) {
      setTicket(null)
      setLoadError(err instanceof ApiError ? err.detail : 'Failed to load ticket.')
    } finally {
      setLoading(false)
    }
  }, [ticketId])

  useEffect(() => {
    loadTicket()
  }, [loadTicket])

  function handleEditChange(event) {
    const { name, value } = event.target
    setEditForm((prev) => ({ ...prev, [name]: value }))
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  function validateEditForm() {
    const errors = {}
    const titleErr = validateRequiredString(editForm.title, 'Title', { max: 255 })
    if (titleErr) errors.title = titleErr
    const descErr = validateRequiredString(editForm.description, 'Description')
    if (descErr) errors.description = descErr
    const priorityErr = validatePriority(editForm.priority)
    if (priorityErr) errors.priority = priorityErr
    const assignedErr = validateOptionalPositiveInt(editForm.assigned_to, 'Assigned to')
    if (assignedErr) errors.assigned_to = assignedErr
    return errors
  }

  async function handleSave(event) {
    event.preventDefault()
    setSaveError('')
    setSaveSuccess('')
    const errors = validateEditForm()
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }
    setFieldErrors({})
    setSaving(true)
    try {
      const payload = {
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        priority: editForm.priority,
        assigned_to: editForm.assigned_to ? Number(editForm.assigned_to) : null,
      }
      const updated = await updateTicket(ticketId, payload)
      setTicket((prev) => ({ ...prev, ...updated, comments: prev?.comments ?? [] }))
      setSaveSuccess('Ticket updated successfully.')
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.detail : 'Failed to update ticket.')
    } finally {
      setSaving(false)
    }
  }

  async function handleStatusTransition(newStatus) {
    setTransitionError('')
    setTransitioning(true)
    try {
      const updated = await updateTicketStatus(ticketId, newStatus)
      setTicket((prev) => ({ ...prev, ...updated, comments: prev?.comments ?? [] }))
    } catch (err) {
      const detail =
        err instanceof ApiError
          ? err.detail
          : 'The status change could not be completed.'
      setTransitionError(detail)
    } finally {
      setTransitioning(false)
    }
  }

  function handleCommentChange(event) {
    const { name, value } = event.target
    setCommentForm((prev) => ({ ...prev, [name]: value }))
    setCommentErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  function validateCommentForm() {
    const errors = {}
    const msgErr = validateRequiredString(commentForm.message, 'Comment')
    if (msgErr) errors.message = msgErr
    const userErr = validatePositiveInt(commentForm.created_by, 'Author')
    if (userErr) errors.created_by = userErr
    return errors
  }

  async function handleCommentSubmit(event) {
    event.preventDefault()
    setCommentError('')
    const errors = validateCommentForm()
    if (Object.keys(errors).length > 0) {
      setCommentErrors(errors)
      return
    }
    setCommentErrors({})
    setCommentSubmitting(true)
    try {
      const comment = await addComment(ticketId, {
        message: commentForm.message.trim(),
        created_by: Number(commentForm.created_by),
      })
      setTicket((prev) => ({
        ...prev,
        comments: [...(prev.comments ?? []), comment],
      }))
      setCommentForm((prev) => ({ ...prev, message: '' }))
    } catch (err) {
      setCommentError(err instanceof ApiError ? err.detail : 'Failed to add comment.')
    } finally {
      setCommentSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="page">
        <p className="muted">Loading ticket…</p>
      </div>
    )
  }

  if (loadError || !ticket || !editForm) {
    return (
      <div className="page">
        <AlertBanner title="Ticket unavailable" message={loadError || 'Not found.'} />
        <Link to="/" className="btn btn-primary">
          Back to list
        </Link>
      </div>
    )
  }

  const allowedTransitions = getAllowedTransitions(ticket.status)
  const sortedComments = [...(ticket.comments ?? [])].sort(
    (a, b) => new Date(a.created_at) - new Date(b.created_at),
  )

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="breadcrumb">
            <Link to="/">Tickets</Link> / #{ticket.id}
          </p>
          <h1>{ticket.title}</h1>
          <p className="page-subtitle">
            Status: <strong>{ticket.status}</strong> · Priority: {ticket.priority}
          </p>
        </div>
        <Link to="/" className="btn btn-ghost">
          Back to list
        </Link>
      </div>

      <AlertBanner
        variant="error"
        title="Invalid status change"
        message={transitionError}
        onDismiss={() => setTransitionError('')}
      />

      <section className="card section">
        <h2>Status actions</h2>
        <p className="section-help">
          Changes follow the ticket workflow. Invalid moves are rejected by the server.
        </p>
        {allowedTransitions.length === 0 ? (
          <p className="muted">No further status transitions are available.</p>
        ) : (
          <div className="button-row">
            {allowedTransitions.map((status) => (
              <button
                key={status}
                type="button"
                className="btn btn-secondary"
                disabled={transitioning}
                onClick={() => handleStatusTransition(status)}
              >
                Move to {status}
              </button>
            ))}
          </div>
        )}
      </section>

      <AlertBanner variant="success" message={saveSuccess} onDismiss={() => setSaveSuccess('')} />
      <AlertBanner message={saveError} onDismiss={() => setSaveError('')} />

      <form className="card form-stack section" onSubmit={handleSave} noValidate>
        <h2>Ticket details</h2>
        <label className="field">
          <span>Title</span>
          <input
            name="title"
            type="text"
            maxLength={255}
            value={editForm.title}
            onChange={handleEditChange}
            aria-invalid={Boolean(fieldErrors.title)}
          />
          {fieldErrors.title && <span className="field-error">{fieldErrors.title}</span>}
        </label>
        <label className="field">
          <span>Description</span>
          <textarea
            name="description"
            rows={6}
            value={editForm.description}
            onChange={handleEditChange}
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
            value={editForm.priority}
            onChange={handleEditChange}
            aria-invalid={Boolean(fieldErrors.priority)}
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Assigned to (user ID)</span>
          <input
            name="assigned_to"
            type="number"
            min="1"
            value={editForm.assigned_to}
            onChange={handleEditChange}
            placeholder="Empty for unassigned"
            aria-invalid={Boolean(fieldErrors.assigned_to)}
          />
          {fieldErrors.assigned_to && (
            <span className="field-error">{fieldErrors.assigned_to}</span>
          )}
        </label>
        <p className="meta-line">
          Created by user {ticket.created_by} · Updated{' '}
          {new Date(ticket.updated_at).toLocaleString()}
        </p>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>

      <section className="card section">
        <h2>Comments</h2>
        <AlertBanner message={commentError} onDismiss={() => setCommentError('')} />
        {sortedComments.length === 0 ? (
          <p className="muted">No comments yet.</p>
        ) : (
          <ul className="comment-list">
            {sortedComments.map((c) => (
              <li key={c.id} className="comment-item">
                <div className="comment-meta">
                  User {c.created_by} · {new Date(c.created_at).toLocaleString()}
                </div>
                <p>{c.message}</p>
              </li>
            ))}
          </ul>
        )}

        <form className="form-stack comment-form" onSubmit={handleCommentSubmit} noValidate>
          <label className="field">
            <span>Add comment</span>
            <textarea
              name="message"
              rows={3}
              value={commentForm.message}
              onChange={handleCommentChange}
              placeholder="Write an update…"
              aria-invalid={Boolean(commentErrors.message)}
            />
            {commentErrors.message && (
              <span className="field-error">{commentErrors.message}</span>
            )}
          </label>
          <label className="field">
            <span>Author (user ID)</span>
            <input
              name="created_by"
              type="number"
              min="1"
              value={commentForm.created_by}
              onChange={handleCommentChange}
              aria-invalid={Boolean(commentErrors.created_by)}
            />
            {commentErrors.created_by && (
              <span className="field-error">{commentErrors.created_by}</span>
            )}
          </label>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={commentSubmitting}>
              {commentSubmitting ? 'Posting…' : 'Post comment'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
