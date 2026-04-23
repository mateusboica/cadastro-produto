const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL

  
type RequestOptions = RequestInit & {
  headers?: HeadersInit
}

type ApiResponse<T> = {
  data: T
  status: number
}

export type ApiError = Error & {
  response?: {
    status: number
    data: unknown
  }
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
    credentials: 'include',
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    const error = new Error(
      (data as { message?: string; detail?: string } | null)?.message ||
        (data as { message?: string; detail?: string } | null)?.detail ||
        `Erro ${response.status}`,
    ) as ApiError

    error.response = {
      status: response.status,
      data,
    }

    throw error
  }

  return {
    data: data as T,
    status: response.status,
  }
}

const api = {
  get: <T>(path: string, options: RequestOptions = {}) =>
    request<T>(path, { ...options, method: 'GET' }),

  post: <T>(path: string, body: unknown, options: RequestOptions = {}) =>
    request<T>(path, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    }),

  put: <T>(path: string, body: unknown, options: RequestOptions = {}) =>
    request<T>(path, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  delete: <T>(path: string, options: RequestOptions = {}) =>
    request<T>(path, { ...options, method: 'DELETE' }),

  patch: <T>(path: string, body: unknown, options: RequestOptions = {}) =>
    request<T>(path, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
}

export default api
