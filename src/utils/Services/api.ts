import axios, { AxiosError } from 'axios'
import type { AxiosRequestConfig } from 'axios'
import { refreshToken as refreshTokenService } from './AuthService'

const api = axios.create({
  baseURL: 'http://localhost:3000',
})

let isRefreshing = false
let failedQueue: Array<{ resolve: (value?: unknown) => void; reject: (err: unknown) => void; config: AxiosRequestConfig }> = []

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(p => {
    if (error) p.reject(error)
    else p.resolve(token)
  })
  failedQueue = []
}

api.interceptors.request.use((config) => {
  const raw = localStorage.getItem('token')
  if (raw) {
    try {
      const parsed = JSON.parse(raw)
      if (parsed?.accessToken) {
        config.headers = config.headers ?? {}
        config.headers['Authorization'] = `Bearer ${parsed.accessToken}`
      }
    } catch {
      // ignore
    }
  }
  return config
})

api.interceptors.response.use(
  r => r,
  async (error: AxiosError) => {
    const originalRequest = error.config
    if (!originalRequest) return Promise.reject(error)

  if (error.response?.status === 401 && !((originalRequest as AxiosRequestConfig) as Record<string, unknown>)['_retry']) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, config: originalRequest })
        }).then((token) => {
          if (token && originalRequest.headers) originalRequest.headers['Authorization'] = `Bearer ${token}`
          return api(originalRequest)
        })
      }

  ;(((originalRequest as AxiosRequestConfig) as Record<string, unknown>)['_retry'] as boolean) = true
      isRefreshing = true

      try {
        const raw = localStorage.getItem('token')
        const parsed = raw ? JSON.parse(raw) : null
        const newToken = await refreshTokenService(parsed?.refreshToken)
        localStorage.setItem('token', JSON.stringify(newToken))
        processQueue(null, newToken.accessToken)
        return api(originalRequest)
      } catch (err) {
        processQueue(err, null)
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default api
