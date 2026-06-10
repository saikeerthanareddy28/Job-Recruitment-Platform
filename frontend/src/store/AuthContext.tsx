import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import type { User, AuthResponse } from '../types'

interface AuthState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

interface AuthContextValue extends AuthState {
  login: (authResponse: AuthResponse) => void
  logout: () => void
  updateUser: (user: User) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isLoading: true,
  })

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    const userRaw = localStorage.getItem('user')
    if (token && userRaw) {
      try {
        const user = JSON.parse(userRaw) as User
        setState({ user, accessToken: token, isAuthenticated: true, isLoading: false })
      } catch {
        localStorage.clear()
        setState(s => ({ ...s, isLoading: false }))
      }
    } else {
      setState(s => ({ ...s, isLoading: false }))
    }
  }, [])

  const login = useCallback((authResponse: AuthResponse) => {
    localStorage.setItem('accessToken', authResponse.accessToken)
    localStorage.setItem('refreshToken', authResponse.refreshToken)
    localStorage.setItem('user', JSON.stringify(authResponse.user))
    setState({
      user: authResponse.user,
      accessToken: authResponse.accessToken,
      isAuthenticated: true,
      isLoading: false,
    })
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    setState({ user: null, accessToken: null, isAuthenticated: false, isLoading: false })
  }, [])

  const updateUser = useCallback((user: User) => {
    localStorage.setItem('user', JSON.stringify(user))
    setState(s => ({ ...s, user }))
  }, [])

  return (
    <AuthContext.Provider value={{ ...state, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
