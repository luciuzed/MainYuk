import { Routes, Route, useLocation } from "react-router-dom"
import Navbar from "./components/Navbar"
import LoginPage from "./page/LoginPage"
import Dashboard from "./page/Dashboard"
import HomePage from "./page/HomePage"

function App() {
  const location = useLocation()
  const hideNavbarOn = ["/dashboard"]
  const showNavbar = !hideNavbarOn.includes(location.pathname)
  const isDashboard = location.pathname === "/dashboard"
  const wrapperClass = isDashboard ? "min-h-screen" : "container mx-auto px-10"

  return (
    <div className={wrapperClass}>
      {showNavbar && <Navbar />}

      <Routes>
        <Route path="/" element={<></>} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </div>
  )
}

export default App