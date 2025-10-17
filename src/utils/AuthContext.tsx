import React, { createContext, useEffect, useState, useRef } from 'react'
import type { TokenDto } from './Dtos/Token.dto'
import { signIn as signInService, refreshToken as refreshTokenService, signOut as signOutService } from './Services/AuthService'
import { jwtDecode } from 'jwt-decode'
import toast from 'react-hot-toast'

type AuthContextType = {
  token: TokenDto | null
  isAuthenticated: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigateToLogin = () => {
    try {
      window.location.href = '/'
    } catch {
      // ignore
    }
  }
  const [token, setToken] = useState<TokenDto | null>(() => {
    try {
      const raw = localStorage.getItem('token')
      return raw ? (JSON.parse(raw) as TokenDto) : null
    } catch {
      return null
    }
  })

  const refreshTimer = useRef<number | null>(null)

  function clearRefreshTimer() {
    if (refreshTimer.current) {
      window.clearTimeout(refreshTimer.current)
      refreshTimer.current = null
    }
  }

  // scheduleRefresh will run inside useEffect to avoid hook dependency issues

  async function signIn(email: string, password: string) {
    const t = await signInService(email, password)
    setToken(t)
  }

  function signOut() {
    clearRefreshTimer()
    signOutService()
    setToken(null)
  }

  useEffect(() => {
    if (token) localStorage.setItem('token', JSON.stringify(token))
    else localStorage.removeItem('token')

    clearRefreshTimer()
    ;(async () => {
      if (!token) return
      try {
        const decoded = jwtDecode<{ exp?: number }>(token.accessToken)
        if (!decoded?.exp) return
        const expiresAt = decoded.exp * 1000
        const now = Date.now()
        const msBefore = expiresAt - now - 30_000
        if (msBefore <= 0) {
          try {
            const newToken = await refreshTokenService(token.refreshToken)
            setToken(newToken)
          } catch {
            // sign out and redirect to login
            signOutService()
            setToken(null)
            toast.error('Sessão expirada. Faça login novamente.')
            navigateToLogin()
          }
          return
        }
        refreshTimer.current = window.setTimeout(async () => {
          try {
            const newToken = await refreshTokenService(token.refreshToken)
            setToken(newToken)
          } catch {
            // sign out and redirect to login
            signOutService()
            setToken(null)
            toast.error('Sessão expirada. Faça login novamente.')
            navigateToLogin()
          }
        }, msBefore)
      } catch {
        // ignore invalid jwt
      }
    })()

    return () => clearRefreshTimer()
  }, [token])

  return (
    <AuthContext.Provider value={{ token, isAuthenticated: !!token, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext
