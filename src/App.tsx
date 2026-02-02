import './index.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ComponentsPage } from '@/pages/ComponentsPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ComponentsPage />} />
        <Route path="/components" element={<ComponentsPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
