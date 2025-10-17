import React, { createContext, useEffect, useState } from 'react'
import type { TokenDto } from './Dtos/Token.dto'
import { signIn as signInService } from './Services/AuthService'

type AuthContextType = {
  token: TokenDto | null
  isAuthenticated: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<TokenDto | null>(() => {
    try {
      const raw = localStorage.getItem('token')
      return raw ? (JSON.parse(raw) as TokenDto) : null
    } catch {
      return null
    }
  })

  useEffect(() => {
    if (token) localStorage.setItem('token', JSON.stringify(token))
    else localStorage.removeItem('token')
  }, [token])

  async function signIn(email: string, password: string) {
    const t = await signInService(email, password)
    setToken(t)
  }

  function signOut() {
    setToken(null)
  }

  return (
    <AuthContext.Provider value={{ token, isAuthenticated: !!token, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext
