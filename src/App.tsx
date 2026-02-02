import './index.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ComponentsPage } from '@/pages/ComponentsPage'
import { TimelinePage } from '@/pages/TimelinePage'
import { LandingPage } from '@/pages/LandingPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/timeline" element={<TimelinePage />} />
        <Route path="/components" element={<ComponentsPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
