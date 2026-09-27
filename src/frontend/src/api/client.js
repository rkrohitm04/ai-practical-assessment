export class ApiError extends Error {
  constructor(message, status, detail) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.detail = detail
  }
}

async function parseErrorResponse(response) {
  let detail = response.statusText
  try {
    const body = await response.json()
    if (typeof body.detail === 'string') {
      detail = body.detail
    } else if (Array.isArray(body.detail)) {
      detail = body.detail.map((d) => d.msg ?? JSON.stringify(d)).join('; ')
    } else if (body.detail) {
      detail = String(body.detail)
    }
  } catch {
    // keep statusText
  }
  return detail
}

export async function apiRequest(path, options = {}) {
  const response = await fetch(path, {
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    const detail = await parseErrorResponse(response)
    throw new ApiError(detail, response.status, detail)
  }

  if (response.status === 204) {
    return null
  }

  const contentType = response.headers.get('content-type') ?? ''
  if (contentType.includes('application/json')) {
    return response.json()
  }

  return response
}
