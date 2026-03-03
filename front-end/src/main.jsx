import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Navbar from './components/navbar.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <div className="container mx-auto px-10">
      <Navbar />
      <App />
    </div>
  </StrictMode>,
)
