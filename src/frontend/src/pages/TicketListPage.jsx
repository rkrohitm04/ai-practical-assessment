import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { downloadTicketsCsv, listTickets } from '../api/tickets'
import { ApiError } from '../api/client'
import { CURRENT_USER_ID, PRIORITIES, STATUSES } from '../constants'
import AlertBanner from '../components/AlertBanner'

const emptyFilters = {
  q: '',
  status: '',
  priority: '',
  assigned_to: '',
  created_by: '',
}

function statusClass(status) {
  return `badge badge-status badge-${status.replace(/\s+/g, '-').toLowerCase()}`
}

function priorityClass(priority) {
  return `badge badge-priority badge-${priority.toLowerCase()}`
}

export default function TicketListPage() {
  const [filters, setFilters] = useState(emptyFilters)
  const [applied, setApplied] = useState(emptyFilters)
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [exportError, setExportError] = useState('')
  const [exporting, setExporting] = useState(false)

  const loadTickets = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = {
        q: applied.q.trim() || undefined,
        status: applied.status || undefined,
        priority: applied.priority || undefined,
        assigned_to: applied.assigned_to ? Number(applied.assigned_to) : undefined,
        created_by: applied.created_by ? Number(applied.created_by) : undefined,
        limit: 200,
      }
      const data = await listTickets(params)
      setTickets(data)
    } catch (err) {
      setError(err instanceof ApiError ? err.detail : 'Failed to load tickets.')
    } finally {
      setLoading(false)
    }
  }, [applied])

  useEffect(() => {
    loadTickets()
  }, [loadTickets])

  function handleFilterChange(event) {
    const { name, value } = event.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  function handleApplyFilters(event) {
    event.preventDefault()
    setApplied({ ...filters })
  }

  function handleResetFilters() {
    setFilters(emptyFilters)
    setApplied(emptyFilters)
  }

  async function handleExportCsv() {
    setExportError('')
    setExporting(true)
    try {
      await downloadTicketsCsv(CURRENT_USER_ID)
    } catch (err) {
      setExportError(
        err instanceof ApiError ? err.detail : 'Could not download CSV export.',
      )
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Tickets</h1>
          <p className="page-subtitle">Search and filter support requests</p>
        </div>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleExportCsv}
          disabled={exporting}
        >
          {exporting ? 'Downloading…' : 'Download My Tickets (CSV)'}
        </button>
      </div>

      <AlertBanner
        title="Export failed"
        message={exportError}
        onDismiss={() => setExportError('')}
      />

      <form className="card filter-form" onSubmit={handleApplyFilters}>
        <div className="filter-grid">
          <label className="field">
            <span>Search</span>
            <input
              name="q"
              type="search"
              placeholder="Title or description…"
              value={filters.q}
              onChange={handleFilterChange}
            />
          </label>
          <label className="field">
            <span>Status</span>
            <select name="status" value={filters.status} onChange={handleFilterChange}>
              <option value="">Any</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Priority</span>
            <select name="priority" value={filters.priority} onChange={handleFilterChange}>
              <option value="">Any</option>
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
              placeholder="e.g. 2"
              value={filters.assigned_to}
              onChange={handleFilterChange}
            />
          </label>
          <label className="field">
            <span>Created by (user ID)</span>
            <input
              name="created_by"
              type="number"
              min="1"
              placeholder="e.g. 3"
              value={filters.created_by}
              onChange={handleFilterChange}
            />
          </label>
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            Apply filters
          </button>
          <button type="button" className="btn btn-ghost" onClick={handleResetFilters}>
            Reset
          </button>
        </div>
      </form>

      <AlertBanner message={error} onDismiss={() => setError('')} />

      {loading ? (
        <p className="muted">Loading tickets…</p>
      ) : tickets.length === 0 ? (
        <p className="muted">No tickets match your filters.</p>
      ) : (
        <div className="table-wrap card">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Assigned</th>
                <th>Created</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => (
                <tr key={ticket.id}>
                  <td>{ticket.id}</td>
                  <td>
                    <Link to={`/tickets/${ticket.id}`} className="link-title">
                      {ticket.title}
                    </Link>
                  </td>
                  <td>
                    <span className={priorityClass(ticket.priority)}>{ticket.priority}</span>
                  </td>
                  <td>
                    <span className={statusClass(ticket.status)}>{ticket.status}</span>
                  </td>
                  <td>{ticket.assigned_to ?? '—'}</td>
                  <td>{new Date(ticket.created_at).toLocaleString()}</td>
                  <td>
                    <Link to={`/tickets/${ticket.id}`} className="btn btn-sm btn-ghost">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
