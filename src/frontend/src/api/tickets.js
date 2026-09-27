import { apiRequest, ApiError } from './client'

function buildQuery(params) {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== '' && value !== null && value !== undefined) {
      search.set(key, String(value))
    }
  })
  const qs = search.toString()
  return qs ? `?${qs}` : ''
}

export function listTickets(filters = {}) {
  return apiRequest(`/tickets${buildQuery(filters)}`)
}

export function getTicket(ticketId) {
  return apiRequest(`/tickets/${ticketId}`)
}

export function createTicket(payload) {
  return apiRequest('/tickets', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateTicket(ticketId, payload) {
  return apiRequest(`/tickets/${ticketId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export function updateTicketStatus(ticketId, status) {
  return apiRequest(`/tickets/${ticketId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
}

export function addComment(ticketId, payload) {
  return apiRequest(`/tickets/${ticketId}/comments`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function downloadTicketsCsv(userId) {
  const response = await fetch(`/tickets/export/${userId}`)
  if (!response.ok) {
    let detail = response.statusText
    try {
      const body = await response.json()
      if (body.detail) detail = String(body.detail)
    } catch {
      /* csv or empty body */
    }
    throw new ApiError(detail, response.status, detail)
  }
  const blob = await response.blob()
  const disposition = response.headers.get('Content-Disposition') ?? ''
  const match = disposition.match(/filename="([^"]+)"/)
  const filename = match?.[1] ?? `tickets_user_${userId}.csv`
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}
