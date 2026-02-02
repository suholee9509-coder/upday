import './index.css'
import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { ErrorBoundary } from '@/components/ErrorBoundary'

// Code splitting - lazy load pages
const LandingPage = lazy(() => import('@/pages/LandingPage').then(m => ({ default: m.LandingPage })))
const TimelinePage = lazy(() => import('@/pages/TimelinePage').then(m => ({ default: m.TimelinePage })))
const ComponentsPage = lazy(() => import('@/pages/ComponentsPage').then(m => ({ default: m.ComponentsPage })))

// Prefetch timeline page when on landing page (improves navigation speed)
function usePrefetchRoutes() {
  const location = useLocation()

  useEffect(() => {
    if (location.pathname === '/') {
      // Prefetch timeline after initial render
      const timer = setTimeout(() => {
        import('@/pages/TimelinePage')
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [location.pathname])
}

// Loading fallback with spinner
function PageLoader() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-muted-foreground/20 border-t-primary" />
      <div className="text-sm text-muted-foreground">Loading...</div>
    </div>
  )
}

function AppRoutes() {
  usePrefetchRoutes()

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/timeline" element={<TimelinePage />} />
        <Route path="/components" element={<ComponentsPage />} />
      </Routes>
    </Suspense>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
