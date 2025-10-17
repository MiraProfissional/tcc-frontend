import api from './api'
import config from '../../config/api'
import type { TokenDto } from '../Dtos/Token.dto'

export async function signIn(email: string, password: string): Promise<TokenDto> {
  const res = await api.post(config.endpoints.signIn, { email, password })
  const token = res?.data?.data ?? res?.data
  if (!token || typeof token !== 'object' || !('accessToken' in token)) {
    throw new Error('Resposta inválida do servidor')
  }
  return token as TokenDto
}

export async function refreshToken(refreshToken: string): Promise<TokenDto> {
  const res = await api.post(config.endpoints.refresh, { refreshToken })
  const token = res?.data?.data ?? res?.data
  if (!token || typeof token !== 'object' || !('accessToken' in token)) {
    throw new Error('Resposta inválida ao renovar token')
  }
  return token as TokenDto
}

export function signOut() {
  localStorage.removeItem('token')
}

export default { signIn, refreshToken, signOut }
