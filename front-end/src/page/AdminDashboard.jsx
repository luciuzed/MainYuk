import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Cookies from 'js-cookie'
import { FiBarChart2, FiGrid, FiPlus, FiEdit2, FiTrash2, FiX, FiCheck, FiTrendingUp, FiCalendar } from 'react-icons/fi'
import LoadingOverlay from '../components/LoadingOverlay'
import Sidebar from '../components/Sidebar'
import SuccessMessage from '../components/SuccessMessage'

const AdminDashboard = () => {
  const navigate = useNavigate()
  const [adminId, setAdminId] = useState(null)
  const [adminName, setAdminName] = useState('')
  const [adminEmail, setAdminEmail] = useState('')
  const [fields, setFields] = useState([])
  const [bookings, setBookings] = useState([])
  const [weeklyPerformance, setWeeklyPerformance] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(null)

  // Check admin session on mount
  useEffect(() => {
    const adminCookie = Cookies.get('admin_session')
    const adminSession = JSON.parse(localStorage.getItem('adminId') || 'null')

    if (!adminSession && !adminCookie) {
      navigate('/login')
      return
    }

    // Always prefer cookie data as it has all the info
    if (adminCookie) {
      const sessionData = JSON.parse(adminCookie)
      setAdminId(sessionData.adminId)
      setAdminName(sessionData.adminName)
      setAdminEmail(sessionData.email)
      localStorage.setItem('adminId', sessionData.adminId)
    } else if (adminSession) {
      setAdminId(adminSession)
    }
  }, [navigate])

  // Fetch fields and bookings when adminId is set
  useEffect(() => {
    if (adminId) {
      fetchFields()
      fetchBookings()
      fetchWeeklyPerformance()
    }
  }, [adminId])

  const fetchFields = async () => {
    try {
      setLoading(true)
      const response = await fetch(`http://localhost:5000/api/fields/${adminId}`)
      if (response.ok) {
        const data = await response.json()
        setFields(data)
      } else {
        setError('Failed to fetch fields')
      }
    } catch (err) {
      setError('Cannot connect to server')
    } finally {
      setLoading(false)
    }
  }

  const fetchBookings = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/bookings/admin/${adminId}`)
      if (response.ok) {
        const data = await response.json()
        setBookings(data)
        console.log('Fetched bookings:', data)
      } else {
        console.error('Failed to fetch bookings:', response.status)
      }
    } catch (err) {
      console.error('Failed to fetch bookings:', err)
    }
  }

  const fetchWeeklyPerformance = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/bookings/admin/${adminId}/performance`)
      if (response.ok) {
        const data = await response.json()
        const counts = Array.isArray(data.daily)
          ? data.daily.map((item) => Number(item.bookedSlots) || 0)
          : []
        setWeeklyPerformance(counts)
      } else {
        console.error('Failed to fetch weekly performance:', response.status)
      }
    } catch (err) {
      console.error('Failed to fetch weekly performance:', err)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('adminId')
    Cookies.remove('admin_session')
    navigate('/login')
  }

  const stats = {
    totalFields: fields.length,
    pendingBookings: bookings.filter((b) => b.status === 'pending').length,
    confirmedBookings: bookings.filter((b) => b.status === 'confirmed').length,
  }

  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const weeklySlotCounts = dayLabels.map((_, index) => weeklyPerformance[index] || 0)

  const highestDayCount = Math.max(...weeklySlotCounts, 0)
  const chartMax = Math.max(1, highestDayCount)

  const tabItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FiBarChart2, path: '/dashboard' },
    { id: 'fields', label: 'Manage Fields', icon: FiGrid, path: '/field' },
    { id: 'bookings', label: 'Bookings', icon: FiCalendar, path: '/booking' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900 flex">
      <SuccessMessage
        message={success?.message}
        triggerKey={success?.id}
        onClose={() => setSuccess(null)}
      />
      <Sidebar
        activeTabId="dashboard"
        adminName={adminName}
        adminEmail={adminEmail}
        handleLogout={handleLogout}
        tabItems={tabItems}
      />

        {/* MAIN CONTENT */}
        <main className="flex-1 p-8 md:p-10 overflow-y-auto">
          {/* Alerts */}
          {error && (
            <div className="mb-6 rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm font-medium">
              {error}
            </div>
          )}

          {/* DASHBOARD CONTENT */}
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold mb-8 tracking-tight">Dashboard</h1>
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="rounded-2xl bg-white px-6 py-8 shadow-sm border border-gray-100 hover:shadow-md transition">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                      Your Venues
                    </p>
                    <FiGrid className="text-primary/40 h-5 w-5" />
                  </div>
                  <p className="text-4xl font-bold text-primary">
                    {stats.totalFields}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">Active & Inactive</p>
                </div>
                <div className="rounded-2xl bg-white px-6 py-8 shadow-sm border border-gray-100 hover:shadow-md transition">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                      Pending Bookings
                    </p>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="text-primary/40 h-5 w-5"
                      aria-hidden="true"
                    >
                      <path d="M5 22h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M5 2h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M17 22c0-4-3-6-5-8-2 2-5 4-5 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M17 2c0 4-3 6-5 8-2-2-5-4-5-8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <p className="text-4xl font-bold text-primary">
                    {stats.pendingBookings}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">Awaiting confirmation</p>
                </div>
                <div className="rounded-2xl bg-white px-6 py-8 shadow-sm border border-gray-100 hover:shadow-md transition">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                      Confirmed Bookings
                    </p>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="text-primary/40 h-5 w-5"
                      aria-hidden="true"
                    >
                      <path
                        d="M5 13l4 4L19 7"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <p className="text-4xl font-bold text-primary">
                    {stats.confirmedBookings}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">Completed bookings</p>
                </div>
              </div>
            </div>

            {/* Additional Dashboard Sections */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Performance Overview */}
              <div className="rounded-2xl bg-white p-6 border border-gray-100 shadow-sm min-h-128 flex flex-col">
                <div className="flex items-center gap-2 mb-4">
                  <FiBarChart2 className="text-primary" />
                  <h3 className="text-lg font-bold text-gray-900">Performance</h3>
                </div>
                <div className="flex-1 flex flex-col min-h-0">
                  <div className="mb-4">
                    <span className="text-xs text-gray-400">Booked Slots This Week</span>
                  </div>
                  <div className="flex-1 min-h-0 rounded-xl bg-gray-50 border border-gray-100 p-4">
                    <div className="h-full flex">
                      <div className="w-10 relative shrink-0 mr-2">
                        <div className="absolute top-2 bottom-6 right-0 w-px bg-gray-300" />
                        <span className="absolute top-0 right-2 text-[10px] text-gray-400 font-semibold">{chartMax}</span>
                        <span className="absolute top-1/2 -translate-y-1/2 right-2 text-[10px] text-gray-400 font-semibold">{Math.round(chartMax / 2)}</span>
                        <span className="absolute bottom-5 right-2 text-[10px] text-gray-400 font-semibold">0</span>
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col">
                        <div className="grid grid-cols-7 gap-2 flex-1">
                          {weeklySlotCounts.map((count, index) => {
                            const heightPercent = (count / chartMax) * 100
                            const barHeight = count === 0 ? 0 : Math.max(6, heightPercent)

                            return (
                              <div key={dayLabels[index]} className="h-full flex items-end">
                                <div
                                  className="w-full rounded-md bg-primary transition-all"
                                  style={{ height: `${barHeight}%` }}
                                  aria-label={`${dayLabels[index]} bookings ${count}`}
                                />
                              </div>
                            )
                          })}
                        </div>

                        <div className="h-px bg-gray-300" />

                        <div className="grid grid-cols-7 gap-2 pt-2">
                          {weeklySlotCounts.map((count, index) => (
                            <div key={`${dayLabels[index]}-label`} className="flex flex-col items-center">
                              <span className="text-[10px] text-gray-500 font-bold leading-none">{dayLabels[index]}</span>
                              <span className="text-[10px] text-gray-500 font-semibold leading-none mt-1">{count}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="rounded-2xl bg-white p-6 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <FiPlus className="text-primary" />
                  <h3 className="text-lg font-bold text-gray-900">Quick Actions</h3>
                </div>
                <div className="space-y-2">
                  <button
                    onClick={() => navigate('/field')}
                    className="w-full text-left px-4 py-3 rounded-lg bg-white hover:bg-primary/5 transition border border-gray-100 text-sm font-medium text-gray-900"
                  >
                    Add New Venue
                  </button>
                  <button
                    onClick={() => navigate('/field')}
                    className="w-full text-left px-4 py-3 rounded-lg bg-white hover:bg-primary/5 transition border border-gray-100 text-sm font-medium text-gray-900"
                  >
                    View All Venues
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Venues */}
            {fields.length > 0 && (
              <div className="rounded-2xl bg-white p-6 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Recent Venues</h3>
                </div>
                <div className="space-y-2">
                  {fields.slice(0, 3).map((field) => (
                    <div key={field.id} className="flex justify-between items-center p-3 rounded-lg bg-gray-50 border border-gray-100">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-14 w-14 shrink-0 bg-linear-to-br from-gray-200 to-gray-300 overflow-hidden rounded-lg">
                          {field.image_url ? (
                            <img src={field.image_url} alt={field.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-gray-100">
                              <FiGrid className="h-6 w-6 text-gray-300" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 text-sm truncate">{field.name}</p>
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            <span className="inline-block bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full text-[11px] font-medium">
                              {field.category || 'Uncategorized'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${field.is_active === 1 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {field.is_active === 1 ? (
                          <span className="inline-flex items-center gap-1">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              className="w-3.5 h-3.5"
                              aria-hidden="true"
                            >
                              <path
                                d="M5 13l4 4L19 7"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            <span>Open</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              className="w-3.5 h-3.5"
                              aria-hidden="true"
                            >
                              <path
                                d="M6 6l12 12M18 6l-12 12"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            <span>Closed</span>
                          </span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>

      {/* LOADING OVERLAY */}
      <LoadingOverlay show={loading} />
    </div>
  )
}

export default AdminDashboard
