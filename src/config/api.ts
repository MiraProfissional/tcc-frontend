const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000'

export const endpoints = {
  signIn: '/auth/sign-in',
  refresh: '/auth/refresh-tokens',
  students: '/students',
  teachers: '/teachers',
  disciplines: '/disciplines',
  disciplinesByUser: '/disciplines/by/user',
}

export default {
  baseURL: API_BASE,
  endpoints,
}
