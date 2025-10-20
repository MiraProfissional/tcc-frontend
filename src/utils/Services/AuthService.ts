import api from './api'
import config from '../../config/api'
import type { TokenDto } from '../Dtos/Token.dto'
import type { GenericDto } from '../Dtos/Generic.dto'

export async function signIn(email: string, password: string): Promise<GenericDto<TokenDto>> {
  const res = await api.post(config.endpoints.signIn, { email, password })
  // return the full wrapped response so callers can rely on GenericDto<T>
  return res.data as GenericDto<TokenDto>
}

export async function refreshToken(refreshToken: string): Promise<GenericDto<TokenDto>> {
  const res = await api.post(config.endpoints.refresh, { refreshToken })
  return res.data as GenericDto<TokenDto>
}

export function signOut() {
  localStorage.removeItem('token')
}

export default { signIn, refreshToken, signOut }
