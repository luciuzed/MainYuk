import { Routes, Route, useLocation, Navigate } from "react-router-dom"
import { useState, useEffect } from "react"
import Navbar from "./components/Navbar"
import { fetchServerSession } from './utils/session'

import LoginPage from "./page/LoginPage"
import BookingPage from "./page/BookingPage"
import BookingDetailPage from "./page/BookingDetailPage"
import AdminDashboard from "./page/AdminDashboard"
import AdminManageField from "./page/AdminManageField"
import AdminManageSlot from "./page/AdminManageSlot"
import AdminBooking from "./page/AdminBooking"
import AdminSecurityInfo from "./page/AdminSecurityInfo"
import UserBooking from "./page/UserBooking"
import UserSecurityInfo from "./page/UserSecurityInfo"
import Payment from "./page/Payment"
import Home from "./page/Home"
import About from "./page/About"
import Contact from "./page/Contact"


// Protected route wrapper to redirect users based on role
const ProtectedRoute = ({ children, allowedRole }) => {
  const location = useLocation()
  const [isAuthorized, setIsAuthorized] = useState(null)

  useEffect(() => {
    let isMounted = true

    const checkAuthorization = async () => {
      try {
        const currentSession = await fetchServerSession()

        if (!currentSession) {
          if (isMounted) setIsAuthorized(false)
          return
        }

        if (allowedRole === 'admin') {
          if (isMounted) setIsAuthorized(currentSession.role === 'Business')
          return
        }

        if (allowedRole === 'user') {
          if (isMounted) setIsAuthorized(currentSession.role === 'User')
          return
        }

        if (isMounted) setIsAuthorized(true)
      } catch {
        if (isMounted) setIsAuthorized(false)
      }
    }

    checkAuthorization()

    return () => {
      isMounted = false
    }
  }, [allowedRole, location.pathname])

  if (isAuthorized === null) {
    return null // Loading
  }

  if (!isAuthorized) {
    return <Navigate to="/login" replace />
  }

  return children
}

// Login guard - prevent logged-in users from accessing login page
const LoginGuard = ({ children }) => {
  const location = useLocation()
  const [canAccess, setCanAccess] = useState(null)
  const [redirectPath, setRedirectPath] = useState('/venue')

  useEffect(() => {
    let isMounted = true

    const checkLoginAccess = async () => {
      try {
        const serverSession = await fetchServerSession()
        if (!isMounted) return

        if (serverSession?.role === 'Business') {
          setRedirectPath('/admin/dashboard')
        } else {
          setRedirectPath('/venue')
        }

        setCanAccess(!serverSession)
      } catch {
        if (isMounted) setCanAccess(true)
      }
    }

    checkLoginAccess()

    return () => {
      isMounted = false
    }
  }, [location.pathname])

  if (canAccess === null) {
    return null // Loading
  }

  if (!canAccess) {
    return <Navigate to={redirectPath} replace />
  }

  return children
}

function App() {
  const location = useLocation()
  const fullWidthPages = ["/admin/dashboard", "/bookings", "/user/security-info", "/admin/manage-field", "/admin/manage-booking", "/admin/security-info", "/", "/contact"]
  const paymentPages = location.pathname.match(/^\/payment\//)
  const fieldManagePages = location.pathname.match(/^\/admin\/manage-field\/courts\/[^/]+$/)
  const showNavbar = !fullWidthPages.includes(location.pathname) && !paymentPages && !fieldManagePages
  const isHome = location.pathname === "/"
  const isContact = location.pathname === "/contact"
  const finalShowNavbar = showNavbar || isHome || isContact
  const isFullWidth = fullWidthPages.includes(location.pathname) || Boolean(fieldManagePages)
  const wrapperClass = isFullWidth ? "min-h-screen" : "container mx-auto px-10"

  return (
    <div className={wrapperClass}>
      {finalShowNavbar && (
        <div className={isFullWidth ? "container mx-auto px-10" : ""}>
            <Navbar />
        </div>
      )}   
      
      <Routes>
        <Route path="/" element={<Home />} />
        {/* <Route path="/about" element={<About />} /> */}
        <Route path="/contact" element={<Contact />} />
        <Route path="/venue" element={<BookingPage />} 
        />
        <Route 
          path="/venues" 
          element={<BookingPage />} 
        />
        <Route path="/login" element={<LoginGuard><LoginPage /></LoginGuard>} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRole="admin">
              <Navigate to="/admin/dashboard" replace />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/manage-field" 
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminManageField />
            </ProtectedRoute>
          } 
        />
        <Route
          path="/admin/manage-field/courts/:fieldId"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminManageSlot />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/admin/manage-booking" 
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminBooking />
            </ProtectedRoute>
          } 
        />
        <Route
          path="/admin/payment-method"
          element={
            <ProtectedRoute allowedRole="admin">
              <Navigate to="/admin/manage-field" replace />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/security-info"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminSecurityInfo />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bookings"
          element={
            <ProtectedRoute allowedRole="user">
              <UserBooking />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/security-info"
          element={
            <ProtectedRoute allowedRole="user">
              <UserSecurityInfo />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/venue/:id" 
          element={<BookingDetailPage />} 
        />
        <Route 
          path="/venues/:id" 
          element={<BookingDetailPage />} 
        />
        <Route 
          path="/payment" 
          element={<Navigate to="/venue" replace />} 
        />
        <Route 
          path="/payment/:paymentId" 
          element={
            <ProtectedRoute allowedRole="user">
              <Payment />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </div>
  )
}

export default App