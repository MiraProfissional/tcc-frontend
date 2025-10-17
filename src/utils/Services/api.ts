import axios, { AxiosError } from 'axios'
import type { AxiosRequestConfig } from 'axios'
import config from '../../config/api'
const api = axios.create({
  baseURL: config.baseURL,
})

type QueueItem = {
  resolve: (value?: void | PromiseLike<void>) => void
  reject: (reason?: unknown) => void
  config: AxiosRequestConfig
}

let isRefreshing = false
let failedQueue: QueueItem[] = []

const processQueue = (error: unknown) => {
  failedQueue.forEach((p) => {
    if (error) p.reject(error)
    else p.resolve(undefined)
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
        ;(config.headers as Record<string, string>)['Authorization'] = `Bearer ${parsed.accessToken}`
      }
    } catch {
      // ignore
    }
  }
  return config
})

api.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    const originalRequest = error.config
    if (!originalRequest) return Promise.reject(error)

    const is401 = error.response?.status === 401
    const retryFlag = (originalRequest as AxiosRequestConfig & { _retry?: boolean })._retry

    if (is401 && !retryFlag) {
      if (isRefreshing) {
        return new Promise<void>((resolve, reject) => {
          failedQueue.push({ resolve, reject, config: originalRequest })
        }).then(() => api(originalRequest))
      }

  ;(originalRequest as AxiosRequestConfig & { _retry?: boolean })._retry = true
      isRefreshing = true

      try {
        const raw = localStorage.getItem('token')
        const parsed = raw ? JSON.parse(raw) : null
        // Call refresh endpoint directly with plain axios to avoid circular imports
        const refreshRes = await axios.post(`${config.baseURL}${config.endpoints.refresh}`, { refreshToken: parsed?.refreshToken })
        const newToken = refreshRes?.data?.data ?? refreshRes?.data
        if (!newToken || typeof newToken !== 'object' || !('accessToken' in newToken)) {
          throw new Error('Resposta inválida ao renovar token')
        }
        localStorage.setItem('token', JSON.stringify(newToken))
        processQueue(undefined)
        return api(originalRequest)
      } catch (err) {
        processQueue(err)
        // When refresh fails, clear token so AuthContext can handle redirect/signout
        localStorage.removeItem('token')
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default api
