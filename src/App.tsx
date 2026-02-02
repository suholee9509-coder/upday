import './index.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { ComponentsPage } from '@/pages/ComponentsPage'
import { TimelinePage } from '@/pages/TimelinePage'
import { LandingPage } from '@/pages/LandingPage'

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/timeline" element={<TimelinePage />} />
          <Route path="/components" element={<ComponentsPage />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
