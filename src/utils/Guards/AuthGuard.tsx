import { Navigate } from 'react-router-dom'
import { useAuth } from '../useAuth'

import React from 'react'

type Props = {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: Props) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/" />
  return children
}