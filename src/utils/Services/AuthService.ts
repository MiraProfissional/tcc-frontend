import axios from 'axios'
import type { TokenDto } from '../Dtos/Token.dto'

export async function signIn(email: string, password: string): Promise<TokenDto> {
  const res = await axios.post('http://localhost:3000/auth/sign-in', { email, password })

  // Suporte aos formatos res.data.data (se seu backend encapsula em data) ou res.data
  const token = res?.data?.data ?? res?.data

  if (!token || typeof token !== 'object' || !('accessToken' in token)) {
    throw new Error('Resposta inválida do servidor')
  }

  return token as TokenDto
}

export default { signIn }
