import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { supabase } from '@/lib/db'
import type { User, Session, AuthError } from '@supabase/supabase-js'

// Auth context type
interface AuthContextType {
  user: User | null
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean
  signInWithGithub: () => Promise<{ error: AuthError | null }>
  signInWithGoogle: () => Promise<{ error: AuthError | null }>
  signOut: () => Promise<{ error: AuthError | null }>
}

const AuthContext = createContext<AuthContextType | null>(null)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize auth state
  useEffect(() => {
    if (!supabase) {
      setIsLoading(false)
      return
    }

    const client = supabase // Capture for closure

    // Get initial session
    const initAuth = async () => {
      try {
        const { data: { session } } = await client.auth.getSession()
        setSession(session)
        setUser(session?.user ?? null)
      } catch (error) {
        console.error('Failed to get session:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()

    // Listen for auth changes
    const { data: { subscription } } = client.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setIsLoading(false)

        // Handle specific auth events
        if (event === 'SIGNED_IN') {
          console.log('User signed in:', session?.user?.email)
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out')
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Sign in with GitHub
  const signInWithGithub = useCallback(async () => {
    if (!supabase) {
      return { error: { message: 'Supabase not configured' } as AuthError }
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/timeline`,
      },
    })

    return { error }
  }, [])

  // Sign in with Google
  const signInWithGoogle = useCallback(async () => {
    if (!supabase) {
      return { error: { message: 'Supabase not configured' } as AuthError }
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/timeline`,
      },
    })

    return { error }
  }, [])

  // Sign out
  const signOut = useCallback(async () => {
    if (!supabase) {
      return { error: { message: 'Supabase not configured' } as AuthError }
    }

    const { error } = await supabase.auth.signOut()
    return { error }
  }, [])

  const value: AuthContextType = {
    user,
    session,
    isLoading,
    isAuthenticated: !!user,
    signInWithGithub,
    signInWithGoogle,
    signOut,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Hook to require authentication (shows login modal if not authenticated)
export function useRequireAuth() {
  const auth = useAuth()
  return {
    ...auth,
    requireAuth: (callback: () => void) => {
      if (auth.isAuthenticated) {
        callback()
      } else {
        // Dispatch custom event to open login modal
        window.dispatchEvent(new CustomEvent('open-login-modal'))
      }
    },
  }
}
