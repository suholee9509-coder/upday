import './index.css'
import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { SkipLink } from '@/components/SkipLink'

// Code splitting - lazy load pages
const LandingPage = lazy(() => import('@/pages/LandingPage').then(m => ({ default: m.LandingPage })))
const TimelinePage = lazy(() => import('@/pages/TimelinePage').then(m => ({ default: m.TimelinePage })))
const ComponentsPage = lazy(() => import('@/pages/ComponentsPage').then(m => ({ default: m.ComponentsPage })))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })))
const AboutPage = lazy(() => import('@/pages/AboutPage').then(m => ({ default: m.AboutPage })))
const FeedbackPage = lazy(() => import('@/pages/FeedbackPage').then(m => ({ default: m.FeedbackPage })))
const DiversityPage = lazy(() => import('@/pages/DiversityPage').then(m => ({ default: m.DiversityPage })))
const EthicsPage = lazy(() => import('@/pages/EthicsPage').then(m => ({ default: m.EthicsPage })))

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
        <Route path="/about" element={<AboutPage />} />
        <Route path="/feedback" element={<FeedbackPage />} />
        <Route path="/diversity" element={<DiversityPage />} />
        <Route path="/ethics" element={<EthicsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <SkipLink />
        <AppRoutes />
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
