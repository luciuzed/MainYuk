import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { FiBarChart2, FiBriefcase, FiGrid, FiLogOut, FiPlus, FiEdit2, FiTrash2, FiX, FiCheck, FiTrendingUp, FiAward, FiUsers, FiUser, FiCalendar } from 'react-icons/fi'
import Cookies from 'js-cookie'
import LOGO from '../assets/header.svg'

const AdminDashboard = () => {
  const navigate = useNavigate()
  const [adminId, setAdminId] = useState(null)
  const [adminName, setAdminName] = useState('')
  const [adminEmail, setAdminEmail] = useState('')
  const [fields, setFields] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('stats')
  const [showFieldForm, setShowFieldForm] = useState(false)
  const [editingField, setEditingField] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showSlotsModal, setShowSlotsModal] = useState(false)
  const [selectedFieldForSlots, setSelectedFieldForSlots] = useState(null)
  const [slotsLoading, setSlotsLoading] = useState(false)
  
  // Court-based scheduling states
  const [courts, setCourts] = useState([])
  const [newCourtName, setNewCourtName] = useState('')
  const [courtsLoading, setCourtsLoading] = useState(false)
  const [slotSetupScreen, setSlotSetupScreen] = useState(null) // null, 'court-list', 'set-hours', 'view-override'
  const [selectedCourt, setSelectedCourt] = useState(null)
  const [courtOpenTime, setCourtOpenTime] = useState('08:00')
  const [courtCloseTime, setCourtCloseTime] = useState('17:00')
  const [courtPrice, setCourtPrice] = useState('100000')
  const [recurrenceType, setRecurrenceType] = useState('specific') // 'specific', 'weekly', 'monthly'
  const [recurringDays, setRecurringDays] = useState([0,1,2,3,4,5,6]) // 0=Sun to 6=Sat
  const [recurringDuration, setRecurringDuration] = useState(7) // days
  const [recurringStartDate, setRecurringStartDate] = useState('')
  const [overrideDate, setOverrideDate] = useState('')
  const [overrideOpenTime, setOverrideOpenTime] = useState('')
  const [overrideCloseTime, setOverrideCloseTime] = useState('')
  const [overridePrice, setOverridePrice] = useState('')
  const [overrideList, setOverrideList] = useState([])
  const [viewSlotsForCourt, setViewSlotsForCourt] = useState(null)
  const [viewDate, setViewDate] = useState('')
  const [viewSlots, setViewSlots] = useState([])
  const [slotsModalTab, setSlotsModalTab] = useState('manage') // 'manage' or 'view'

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm()

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

  // Fetch fields when adminId is set
  useEffect(() => {
    if (adminId) {
      fetchFields()
      fetchBookings()
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
      const response = await fetch(`http://localhost:5000/api/admin/${adminId}/bookings`)
      if (response.ok) {
        const data = await response.json()
        setBookings(data)
      }
    } catch (err) {
      console.error('Failed to fetch bookings:', err)
    }
  }

  const handleFieldSubmit = async (data) => {
    try {
      setError('')
      setSuccess('')

      const fieldData = {
        adminId,
        name: data.fieldName,
        category: data.category,
        description: data.description,
        address: data.address,
        city: data.city,
        imageUrl: data.imageUrl,
        isActive: data.isActive === 'on' ? true : (data.isActive ? true : false),
        googleMapsLink: data.googleMapsLink,
      }

      const url = editingField
        ? `http://localhost:5000/api/fields/${editingField.id}`
        : 'http://localhost:5000/api/fields'

      const method = editingField ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fieldData),
      })

      if (response.ok) {
        setSuccess(editingField ? 'Field updated successfully' : 'Field created successfully')
        reset()
        setShowFieldForm(false)
        setEditingField(null)
        fetchFields()
        setTimeout(() => setSuccess(''), 3000)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to save field')
      }
    } catch (err) {
      setError('Cannot connect to server')
    }
  }

  const handleEditField = (field) => {
    setEditingField(field)
    setValue('fieldName', field.name)
    setValue('category', field.category)
    setValue('description', field.description)
    setValue('address', field.address)
    setValue('city', field.city)
    setValue('imageUrl', field.image_url)
    setValue('isActive', field.is_active === 1 ? true : false)
    setValue('googleMapsLink', field.google_maps_link || '')
    setShowFieldForm(true)
  }

  const handleDeleteField = async (fieldId) => {
    if (!window.confirm('Are you sure you want to permanently delete this field? This cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`http://localhost:5000/api/fields/${fieldId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId }),
      })

      if (response.ok) {
        setSuccess('✓ Field removed')
        fetchFields()
        setTimeout(() => setSuccess(''), 3000)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to remove field')
      }
    } catch (err) {
      setError('Cannot connect to server')
    }
  }

  const handleCloseForm = () => {
    setShowFieldForm(false)
    setEditingField(null)
    reset()
  }

  const openSlotsModal = async (field) => {
    setSelectedFieldForSlots(field)
    setSlotSetupScreen('court-list')
    setSlotsModalTab('manage')
    setCourtsLoading(true)
    try {
      const [courtsResponse, slotsResponse] = await Promise.all([
        fetch(`http://localhost:5000/api/field/${field.id}/courts`),
        fetch(`http://localhost:5000/api/field/${field.id}/slots`)
      ])
      
      if (courtsResponse.ok) {
        const courtsData = await courtsResponse.json()
        setCourts(courtsData)
      } else {
        setCourts([])
      }

      if (slotsResponse.ok) {
        const slotsData = await slotsResponse.json()
        setViewSlots(slotsData)
      } else {
        setViewSlots([])
      }
    } catch (err) {
      setError('Failed to fetch data')
      setCourts([])
      setViewSlots([])
    } finally {
      setCourtsLoading(false)
    }
    setShowSlotsModal(true)
  }

  const handleAddCourt = async () => {
    if (!newCourtName.trim()) {
      setError('Please enter court name')
      return
    }

    try {
      const response = await fetch(`http://localhost:5000/api/field/${selectedFieldForSlots.id}/courts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId,
          name: newCourtName
        })
      })

      if (response.ok) {
        setSuccess('Court added')
        setNewCourtName('')
        // Refresh courts
        const refreshResponse = await fetch(`http://localhost:5000/api/field/${selectedFieldForSlots.id}/courts`)
        if (refreshResponse.ok) {
          const data = await refreshResponse.json()
          setCourts(data)
        }
        setTimeout(() => setSuccess(''), 2000)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to add court')
      }
    } catch (err) {
      setError('Cannot connect to server')
    }
  }

  const handleDeleteCourt = async (courtId) => {
    if (!window.confirm('Delete this court?')) return

    try {
      const response = await fetch(`http://localhost:5000/api/field/${selectedFieldForSlots.id}/courts/${courtId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId })
      })

      if (response.ok) {
        setSuccess('Court deleted')
        const refreshResponse = await fetch(`http://localhost:5000/api/field/${selectedFieldForSlots.id}/courts`)
        if (refreshResponse.ok) {
          const data = await refreshResponse.json()
          setCourts(data)
        }
        setTimeout(() => setSuccess(''), 2000)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to delete court')
      }
    } catch (err) {
      setError('Cannot connect to server')
    }
  }

  const handleSetCourtHours = () => {
    if (!courtOpenTime || !courtCloseTime || !courtPrice) {
      setError('Please fill all fields')
      return
    }

    if (courtOpenTime >= courtCloseTime) {
      setError('Opening time must be before closing time')
      return
    }

    setSlotSetupScreen('view-schedule')
  }

  const handleGenerateSlots = async () => {
    if (!recurringStartDate) {
      setError('Please select start date')
      return
    }

    try {
      setError('')
      const response = await fetch(`http://localhost:5000/api/field/${selectedFieldForSlots.id}/generate-slots`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId,
          courtId: selectedCourt.id,
          courtName: selectedCourt.name,
          openingTime: courtOpenTime,
          closingTime: courtCloseTime,
          price: parseFloat(courtPrice),
          startDate: recurringStartDate,
          duration: recurringDuration,
          durationType: recurrenceType,
          daysOfWeek: recurringDays
        })
      })

      if (response.ok) {
        const result = await response.json()
        setSuccess(`Generated ${result.count} time slots`)
        
        // Refresh viewSlots to show newly generated slots
        try {
          const refreshResponse = await fetch(`http://localhost:5000/api/field/${selectedFieldForSlots.id}/slots`)
          if (refreshResponse.ok) {
            const data = await refreshResponse.json()
            setViewSlots(data)
          }
        } catch (err) {
          console.error('Failed to refresh slots:', err)
        }

        setTimeout(() => {
          setSlotSetupScreen('court-list')
          setRecurringDays([0,1,2,3,4,5,6])
          setRecurringDuration(7)
        }, 2000)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to generate slots')
      }
    } catch (err) {
      setError('Cannot connect to server')
    }
  }

  const handleAddOverride = async () => {
    if (!overrideDate || !overrideOpenTime || !overrideCloseTime || !overridePrice) {
      setError('Please fill all override fields')
      return
    }

    try {
      const response = await fetch(`http://localhost:5000/api/field/${selectedFieldForSlots.id}/slots/override`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId,
          courtId: selectedCourt.id,
          overrideDate,
          openingTime: overrideOpenTime,
          closingTime: overrideCloseTime,
          price: parseFloat(overridePrice)
        })
      })

      if (response.ok) {
        const result = await response.json()
        setSuccess(`Override applied - ${result.count} slots updated`)
        setOverrideDate('')
        setOverrideOpenTime('')
        setOverrideCloseTime('')
        setOverridePrice('')
        setTimeout(() => setSuccess(''), 2000)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to apply override')
      }
    } catch (err) {
      setError('Cannot connect to server')
    }
  }

  const handleViewSlots = async (court) => {
    setViewSlotsForCourt(court)
    setSlotSetupScreen('view-grid')
    // Set default date to today
    const today = new Date().toISOString().split('T')[0]
    setViewDate(today)
    
    try {
      const response = await fetch(`http://localhost:5000/api/field/${selectedFieldForSlots.id}/slots`)
      if (response.ok) {
        const data = await response.json()
        setViewSlots(data)
      }
    } catch (err) {
      setError('Failed to fetch slots')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('adminId')
    Cookies.remove('admin_session')
    navigate('/login')
  }

  const stats = {
    totalFields: fields.length,
    totalSlots: fields.reduce((sum, field) => sum + (field.slots?.length || 0), 0),
    bookedSlots: fields.reduce(
      (sum, field) => sum + (field.slots?.filter((s) => s.is_booked)?.length || 0),
      0
    ),
  }

  const tabItems = [
    { id: 'stats', label: 'Dashboard', icon: FiBarChart2 },
    { id: 'fields', label: 'Manage Fields', icon: FiGrid },
    { id: 'bookings', label: 'Bookings', icon: FiCalendar },
  ]

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900">
      <div className="flex min-h-screen">
        {/* SIDEBAR */}
        <aside className="w-64 min-h-screen bg-primary text-white flex flex-col">
          <div className="px-6 pt-8 pb-6">
            <img src={LOGO} alt="MainYuk" className="h-10 w-30" />
          </div>

          <nav className="px-3 pb-8 space-y-1">
            {tabItems.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-4 py-4 text-left text-sm font-bold transition ${
                  activeTab === tab.id
                    ? 'bg-white/20 text-white'
                    : 'text-white/90 hover:bg-white/15'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-auto px-6 pb-6">
            <div className="flex items-center gap-3 rounded-xl bg-white/15 px-4 py-4 backdrop-blur-sm border border-white/20">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/25">
                <FiUser className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white uppercase tracking-wide">{adminName}</p>
                <p className="text-xs text-white/70 truncate">{adminEmail}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-white/10 px-4 py-3 text-sm font-semibold text-white/90 transition hover:bg-white/20 hover:text-white"
            >
              <FiLogOut className="h-4 w-4" />
              Log out
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 p-8 md:p-10">
          {/* Alerts */}
          {error && (
            <div className="mb-6 rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm font-medium">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 inline-block rounded-full bg-green-50 border border-green-300 text-green-700 px-5 py-2 text-sm font-semibold shadow-sm">
              {success}
            </div>
          )}

          {/* DASHBOARD TAB */}
          {activeTab === 'stats' && (
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl font-bold mb-8 tracking-tight">Dashboard</h1>
                <div className="grid gap-6 lg:grid-cols-3">
                  <div className="rounded-2xl bg-white px-6 py-8 shadow-sm border border-gray-100 hover:shadow-md transition">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                        Your Venues
                      </p>
                      <FiBriefcase className="text-primary/40 h-5 w-5" />
                    </div>
                    <p className="text-4xl font-bold text-primary">
                      {stats.totalFields}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">Active & Inactive</p>
                  </div>
                  <div className="rounded-2xl bg-white px-6 py-8 shadow-sm border border-gray-100 hover:shadow-md transition">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                        Available Slots
                      </p>
                      <FiTrendingUp className="text-primary/40 h-5 w-5" />
                    </div>
                    <p className="text-4xl font-bold text-primary">
                      {stats.totalSlots}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">Total time slots</p>
                  </div>
                  <div className="rounded-2xl bg-white px-6 py-8 shadow-sm border border-gray-100 hover:shadow-md transition">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                        Bookings
                      </p>
                      <FiAward className="text-primary/40 h-5 w-5" />
                    </div>
                    <p className="text-4xl font-bold text-primary">
                      {stats.bookedSlots}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">Confirmed bookings</p>
                  </div>
                </div>
              </div>

              {/* Additional Dashboard Sections */}
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Quick Actions */}
                <div className="rounded-2xl bg-gradient-to-br from-primary/5 to-transparent p-6 border border-primary/10">
                  <div className="flex items-center gap-2 mb-4">
                    <FiPlus className="text-primary" />
                    <h3 className="text-lg font-bold text-gray-900">Quick Actions</h3>
                  </div>
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        setActiveTab('fields')
                        setTimeout(() => {
                          setEditingField(null)
                          reset()
                          setShowFieldForm(true)
                        }, 0)
                      }}
                      className="w-full text-left px-4 py-3 rounded-lg bg-white hover:bg-primary/5 transition border border-gray-100 text-sm font-medium text-gray-900"
                    >
                      Add New Venue
                    </button>
                    <button
                      onClick={() => setActiveTab('fields')}
                      className="w-full text-left px-4 py-3 rounded-lg bg-white hover:bg-primary/5 transition border border-gray-100 text-sm font-medium text-gray-900"
                    >
                      View All Venues
                    </button>
                  </div>
                </div>

                {/* Performance Overview */}
                <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-transparent p-6 border border-blue-100">
                  <div className="flex items-center gap-2 mb-4">
                    <FiTrendingUp className="text-blue-600" />
                    <h3 className="text-lg font-bold text-gray-900">Performance</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700 font-medium">Booking Rate</span>
                        <span className="text-gray-900 font-bold">{stats.totalSlots > 0 ? Math.round((stats.bookedSlots / stats.totalSlots) * 100) : 0}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all"
                          style={{ width: `${stats.totalSlots > 0 ? (stats.bookedSlots / stats.totalSlots) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Venues */}
              {fields.length > 0 && (
                <div className="rounded-2xl bg-white p-6 border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <FiUsers className="text-primary" />
                    <h3 className="text-lg font-bold text-gray-900">Recent Venues</h3>
                  </div>
                  <div className="space-y-2">
                    {fields.slice(0, 3).map((field) => (
                      <div key={field.id} className="flex justify-between items-center p-3 rounded-lg bg-gray-50 border border-gray-100">
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{field.name}</p>
                          <p className="text-xs text-gray-500">{field.city} • {field.category}</p>
                        </div>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${field.is_active === 1 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {field.is_active === 1 ? '✓ Open' : '⊘ Closed'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* FIELDS TAB */}
          {activeTab === 'fields' && (
            <div>
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Manage Fields</h1>
                <button
                  onClick={() => {
                    setEditingField(null)
                    reset()
                    setShowFieldForm(true)
                  }}
                  className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full hover:opacity-90 transition font-semibold text-sm"
                >
                  <FiPlus className="h-4 w-4" /> Add Field
                </button>
              </div>

              {loading ? (
                <div className="text-center py-12 text-gray-500">Loading fields...</div>
              ) : fields.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
                  <p className="text-gray-500 font-medium">No fields yet. Create your first field!</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {fields.map((field) => (
                    <div
                      key={field.id}
                      className={`bg-white rounded-2xl shadow-sm border transition ${field.is_active === 0 ? 'border-yellow-200 bg-yellow-50/30' : 'border-gray-100'} hover:shadow-md overflow-hidden`}
                    >
                      <div className="flex items-start justify-between p-4">
                        <div className="h-32 w-32 flex-shrink-0 bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden rounded-xl ml-2"> 

                          {field.image_url ? (
                            <img src={field.image_url} alt={field.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-gray-100">
                              <FiBriefcase className="h-12 w-12 text-gray-300" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 px-8"> 
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold">{field.name}</h3>
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${field.is_active === 1 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                              {field.is_active === 1 ? '✓ Open' : '⊘ Closed'}
                            </span>
                          </div>
                          <div className="space-y-1 text-sm text-gray-600">
                            <p>
                              <span className="font-semibold text-gray-900">Category:</span> <span className="inline-block bg-gray-100 text-gray-700 px-3 py-0.5 rounded-full text-xs font-medium ml-1">{field.category}</span>
                            </p>
                            <p><span className="font-semibold text-gray-900">Address:</span> {field.address}</p>
                            {field.city && <p><span className="font-semibold text-gray-900">City:</span> {field.city}</p>}
                            {field.description && <p><span className="font-semibold text-gray-900">Description:</span> {field.description}</p>}
                          </div>
                        </div>
                        
                        <div className="flex gap-2 pr-4 flex-shrink-0">
                          <button
                            onClick={() => openSlotsModal(field)}
                            className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-lg transition font-medium"
                            title="Manage time slots"
                          >
                            <FiCalendar className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleEditField(field)}
                            className="p-2.5 text-primary hover:bg-primary/10 rounded-lg transition font-medium"
                            title="Edit field"
                          >
                            <FiEdit2 className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteField(field.id)}
                            className="p-2.5 text-red-600 hover:bg-red-50 rounded-lg transition font-medium"
                            title="Delete field"
                          >
                            <FiTrash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* BOOKINGS TAB */}
          {activeTab === 'bookings' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold mb-1 tracking-tight">Bookings</h1>
                <p className="text-gray-600 text-sm">All bookings for your fields</p>
              </div>

              {loading ? (
                <div className="text-center py-12 text-gray-500">Loading bookings...</div>
              ) : bookings.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
                  <p className="text-gray-500 font-medium">No bookings yet</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {bookings.map((booking) => (
                    <div
                      key={booking.id}
                      className={`bg-white rounded-2xl shadow-sm border transition hover:shadow-md overflow-hidden ${
                        booking.status === 'confirmed' ? 'border-green-100' : 
                        booking.status === 'pending' ? 'border-yellow-100' : 
                        'border-red-100'
                      }`}
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900">{booking.field_name}</h3>
                            <p className="text-sm text-gray-600 mt-1">Booking ID: #{booking.id}</p>
                          </div>
                          <span className={`text-xs font-bold px-3 py-1.5 rounded-full flex-shrink-0 ${
                            booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                            booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {booking.status === 'confirmed' ? '✓ Confirmed' :
                             booking.status === 'pending' ? '⏳ Pending' :
                             '✗ Cancelled'}
                          </span>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600 font-medium">User</p>
                            <p className="text-gray-900 font-semibold mt-1">{booking.user_name}</p>
                            <p className="text-gray-500 text-xs mt-1">{booking.user_email}</p>
                            {booking.user_phone && (
                              <p className="text-gray-500 text-xs">{booking.user_phone}</p>
                            )}
                          </div>
                          <div>
                            <p className="text-gray-600 font-medium">Time Slots</p>
                            <p className="text-gray-900 mt-1 text-xs font-mono">
                              {booking.time_slots}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600 font-medium">Booking Date</p>
                            <p className="text-gray-900 font-semibold mt-1">
                              {new Date(booking.booking_date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600 font-medium">Amount</p>
                            <p className="text-primary font-bold text-lg mt-1">
                              Rp {parseInt(booking.total_amount).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          </main>
      </div>

      {/* TIME SLOTS MANAGEMENT MODAL */}
      {showSlotsModal && selectedFieldForSlots && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-5xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Manage Slots: {selectedFieldForSlots.name}</h2>
              <button
                onClick={() => {
                  setShowSlotsModal(false)
                  setSlotSetupScreen('court-list')
                  setSlotsModalTab('manage')
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <FiX className="h-6 w-6 text-gray-500" />
              </button>
            </div>

            {error && (
              <div className="mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 rounded-full bg-green-50 border border-green-200 text-green-700 px-4 py-2 text-sm inline-block">
                {success}
              </div>
            )}

            {/* TABS */}
            <div className="flex gap-2 mb-6 border-b border-gray-200">
              <button
                onClick={() => {
                  setSlotsModalTab('manage')
                  setSlotSetupScreen('court-list')
                }}
                className={`px-4 py-3 text-sm font-semibold transition ${
                  slotsModalTab === 'manage'
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Manage Courts & Schedule
              </button>
              <button
                onClick={() => {
                  setSlotsModalTab('view')
                  setViewDate(new Date().toISOString().split('T')[0])
                }}
                className={`px-4 py-3 text-sm font-semibold transition ${
                  slotsModalTab === 'view'
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                View Schedule Table
              </button>
            </div>

            {/* MANAGE TAB */}
            {slotsModalTab === 'manage' && (
              <>
                {/* COURTS LIST VIEW */}
                {slotSetupScreen === 'court-list' && (
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                      <p className="text-sm font-bold mb-4 text-gray-800">Add New Court</p>
                      <div className="flex gap-3">
                        <input
                          placeholder="e.g., Court A, Lapangan 1"
                          value={newCourtName}
                          onChange={(e) => setNewCourtName(e.target.value)}
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
                        />
                        <button
                          onClick={handleAddCourt}
                          className="px-6 py-3 bg-primary text-white rounded-full hover:opacity-90 transition flex items-center gap-2 font-semibold text-sm flex-shrink-0"
                        >
                          <FiPlus className="h-4 w-4" /> Add
                        </button>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-bold mb-4 text-gray-800">Your Courts ({courts.length})</p>
                      {courtsLoading ? (
                        <div className="text-center py-8 text-gray-500">Loading courts...</div>
                      ) : courts.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 text-sm bg-gray-50 rounded-2xl border border-gray-100">
                          No courts yet. Add one above!
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {courts.map((court) => (
                            <div
                              key={court.id}
                              className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-white hover:shadow-md transition"
                            >
                              <div>
                                <p className="font-semibold text-gray-900">{court.name}</p>
                                <p className="text-xs text-gray-500 mt-1">Click to set schedule</p>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    setSelectedCourt(court)
                                    setSlotSetupScreen('set-hours')
                                    setCourtOpenTime('08:00')
                                    setCourtCloseTime('17:00')
                                    setCourtPrice('100000')
                                  }}
                                  className="px-4 py-2.5 bg-primary text-white rounded-full hover:opacity-90 transition font-semibold text-sm"
                                >
                                  Set Schedule
                                </button>
                                <button
                                  onClick={() => handleDeleteCourt(court.id)}
                                  className="p-2.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                                  title="Delete court"
                                >
                                  <FiTrash2 className="h-5 w-5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

            {/* SET COURT HOURS VIEW */}
            {slotSetupScreen === 'set-hours' && selectedCourt && (
              <div className="space-y-6">
                <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
                  <p className="text-sm text-blue-700"><strong>Court:</strong> {selectedCourt.name}</p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-700">Opening Time</label>
                      <input
                        type="time"
                        value={courtOpenTime}
                        onChange={(e) => setCourtOpenTime(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-700">Closing Time</label>
                      <input
                        type="time"
                        value={courtCloseTime}
                        onChange={(e) => setCourtCloseTime(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">Price per Slot (Rp)</label>
                    <input
                      type="number"
                      value={courtPrice}
                      onChange={(e) => setCourtPrice(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
                    />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-primary/10 to-blue-50 rounded-2xl p-4 border border-primary/20">
                  <p className="text-sm text-gray-700"><strong>Note:</strong> System will automatically create 1-hour slots between these times. For example: 8:00-9:00, 9:00-10:00, etc.</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-4 text-gray-700">Schedule Pattern</label>
                  <div className="space-y-4">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                        <input
                          type="radio"
                          checked={recurrenceType === 'specific'}
                          onChange={() => setRecurrenceType('specific')}
                          className="w-4 h-4"
                        />
                        Generate once starting from:
                      </label>
                      <input
                        type="date"
                        value={recurringStartDate}
                        onChange={(e) => setRecurringStartDate(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                        <input
                          type="radio"
                          checked={recurrenceType === 'weekly'}
                          onChange={() => setRecurrenceType('weekly')}
                          className="w-4 h-4"
                        />
                        Repeat on specific days of week:
                      </label>
                      <div className="grid grid-cols-7 gap-2">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              const newDays = [...recurringDays]
                              if (newDays.includes(idx)) {
                                newDays.splice(newDays.indexOf(idx), 1)
                              } else {
                                newDays.push(idx)
                              }
                              setRecurringDays(newDays.sort())
                            }}
                            className={`px-2 py-2 rounded-lg text-xs font-semibold transition ${
                              recurringDays.includes(idx)
                                ? 'bg-primary text-white'
                                : 'bg-gray-100 text-gray-700 border border-gray-200'
                            }`}
                          >
                            {day}
                          </button>
                        ))}
                      </div>
                      <div className="mt-3">
                        <label className="text-xs font-medium text-gray-600 block mb-2">Duration (days):</label>
                        <input
                          type="number"
                          min="1"
                          max="365"
                          value={recurringDuration}
                          onChange={(e) => setRecurringDuration(parseInt(e.target.value))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-2">Start date required below</p>
                    </div>
                  </div>

                  {recurrenceType === 'weekly' && (
                    <div className="mt-4">
                      <label className="block text-xs font-medium text-gray-700 mb-2">Start date:</label>
                      <input
                        type="date"
                        value={recurringStartDate}
                        onChange={(e) => setRecurringStartDate(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-3 justify-end pt-6 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setSlotSetupScreen('court-list')
                      setSelectedCourt(null)
                    }}
                    className="px-6 py-2.5 border border-gray-300 rounded-full hover:bg-gray-50 transition font-semibold text-sm text-gray-700"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleGenerateSlots}
                    className="px-6 py-2.5 bg-primary text-white rounded-full hover:opacity-90 transition font-semibold text-sm flex items-center gap-2"
                  >
                    <FiCheck className="h-4 w-4" /> Generate Slots
                  </button>
                </div>
              </div>
            )}

            {!slotSetupScreen && (
              <div className="flex gap-3 justify-end pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowSlotsModal(false)}
                  className="px-6 py-2.5 border border-gray-300 rounded-full hover:bg-gray-50 transition font-semibold text-sm text-gray-700"
                >
                  Close
                </button>
              </div>
            )}
              </>
            )}

            {/* VIEW TAB */}
            {slotsModalTab === 'view' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Select Date to View</label>
                  <input
                    type="date"
                    value={viewDate}
                    onChange={(e) => setViewDate(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
                  />
                </div>

                {/* SCHEDULE TABLE */}
                <div className="mt-6 overflow-x-auto">
                  <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                    {/* Header */}
                    <div className="grid gap-0 border-b border-gray-200" style={{ gridTemplateColumns: `120px repeat(${[...new Set(viewSlots.filter(s => {
                      const slotDate = new Date(s.start_time).toISOString().split('T')[0]
                      return slotDate === viewDate
                    }).map(s => s.court_id || s.court_name))].length || 1}, 1fr)` }}>
                      <div className="px-4 py-3 text-xs font-bold text-gray-700 bg-primary/5 border-r border-gray-200">
                        Waktu
                      </div>
                      {[...new Set(viewSlots
                        .filter(s => {
                          const slotDate = new Date(s.start_time).toISOString().split('T')[0]
                          return slotDate === viewDate
                        })
                        .map(s => s.court_name || 'Court ' + (s.court_id || '1')))
                      ]
                        .sort()
                        .map((court) => (
                          <div key={court} className="px-4 py-3 text-xs font-bold text-gray-700 bg-gray-50 border-r border-gray-200 text-center">
                            {court}
                          </div>
                        ))}
                    </div>

                    {/* Slots Grid */}
                    <div className="divide-y divide-gray-200">
                      {[...new Set(viewSlots
                        .filter(s => {
                          const slotDate = new Date(s.start_time).toISOString().split('T')[0]
                          return slotDate === viewDate
                        })
                        .map(s => {
                          const startTime = new Date(s.start_time).toLocaleTimeString('en-US', { 
                            hour: '2-digit', 
                            minute: '2-digit',
                            hour12: false 
                          })
                          return startTime
                        }))
                      ]
                        .sort()
                        .map(time => (
                          <div key={time} className="grid gap-0 border-b border-gray-200" style={{ gridTemplateColumns: `120px repeat(${[...new Set(viewSlots.filter(s => {
                            const slotDate = new Date(s.start_time).toISOString().split('T')[0]
                            return slotDate === viewDate
                          }).map(s => s.court_name || 'Court ' + (s.court_id || '1')))].length || 1}, 1fr)` }}>
                            {/* Time Cell */}
                            <div className="px-4 py-3 text-xs font-bold text-gray-900 bg-gray-50 border-r border-gray-200">
                              {time}-{String(parseInt(time.split(':')[0])+1).padStart(2, '0')}:00
                            </div>

                            {/* Slot Cells */}
                            {[...new Set(viewSlots
                              .filter(s => {
                                const slotDate = new Date(s.start_time).toISOString().split('T')[0]
                                return slotDate === viewDate
                              })
                              .map(s => s.court_name || 'Court ' + (s.court_id || '1')))
                            ]
                              .sort()
                              .map(courtName => {
                                const slot = viewSlots.find(s => {
                                  const slotDate = new Date(s.start_time).toISOString().split('T')[0]
                                  const slotTime = new Date(s.start_time).toLocaleTimeString('en-US', { 
                                    hour: '2-digit', 
                                    minute: '2-digit',
                                    hour12: false 
                                  })
                                  return slotDate === viewDate && slotTime === time && (s.court_name || 'Court ' + (s.court_id || '1')) === courtName
                                })

                                if (!slot) {
                                  return (
                                    <div key={courtName} className="px-3 py-3 border-r border-gray-200 bg-gray-50"></div>
                                  )
                                }

                                const isBooked = slot.is_booked === 1

                                return (
                                  <div
                                    key={slot.id}
                                    className={`px-3 py-4 border-r border-gray-200 text-center ${
                                      isBooked
                                        ? 'bg-gray-100 opacity-50'
                                        : 'bg-white'
                                    }`}
                                  >
                                    <p className="text-xs font-bold text-primary">Rp {parseInt(slot.price).toLocaleString()}</p>
                                    <p className={`text-xs mt-1 font-semibold ${isBooked ? 'text-gray-500' : 'text-green-700'}`}>
                                      {isBooked ? 'Tidak Tersedia' : 'Tersedia'}
                                    </p>
                                  </div>
                                )
                              })}
                          </div>
                        ))}
                    </div>

                    {viewSlots.filter(s => {
                      const slotDate = new Date(s.start_time).toISOString().split('T')[0]
                      return slotDate === viewDate
                    }).length === 0 && (
                      <div className="p-8 text-center text-gray-500 text-sm">
                        No slots created for {viewDate}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setShowSlotsModal(false)}
                    className="px-6 py-2.5 border border-gray-300 rounded-full hover:bg-gray-50 transition font-semibold text-sm text-gray-700"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FIELD FORM MODAL */}
      {showFieldForm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">
                {editingField ? 'Edit Field' : 'Add New Field'}
              </h2>
              <button
                onClick={handleCloseForm}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <FiX className="h-6 w-6 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit(handleFieldSubmit)} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Field Name *</label>
                <input
                  {...register('fieldName', { required: 'Field name is required' })}
                  placeholder="e.g., Main Futsal Court"
                  className={`w-full px-4 py-3 border rounded-full focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm ${
                    errors.fieldName ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.fieldName && (
                  <p className="text-red-500 text-sm mt-1 ml-4">{errors.fieldName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Category *</label>
                <select
                  {...register('category', { required: 'Category is required' })}
                  className={`w-full px-4 py-3 border rounded-full focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm ${
                    errors.category ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select a category</option>
                  <option value="Futsal">Futsal</option>
                  <option value="Badminton">Badminton</option>
                  <option value="Basketball">Basketball</option>
                  <option value="Tennis">Tennis</option>
                </select>
                {errors.category && (
                  <p className="text-red-500 text-sm mt-1 ml-4">{errors.category.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Address *</label>
                <input
                  {...register('address', { required: 'Address is required' })}
                  placeholder="e.g., Jl. Merdeka No. 1"
                  className={`w-full px-4 py-3 border rounded-full focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm ${
                    errors.address ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.address && (
                  <p className="text-red-500 text-sm mt-1 ml-4">{errors.address.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">City *</label>
                <select
                  {...register('city', { required: 'City is required' })}
                  className={`w-full px-4 py-3 border rounded-full focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm ${
                    errors.city ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select a city</option>
                  <option value="Medan">Medan</option>
                  <option value="Jakarta">Jakarta</option>
                  <option value="Surabaya">Surabaya</option>
                  <option value="Bandung">Bandung</option>
                  <option value="Pekanbaru">Pekanbaru</option>
                </select>
                {errors.city && (
                  <p className="text-red-500 text-sm mt-1 ml-4">{errors.city.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Description</label>
                <textarea
                  {...register('description')}
                  placeholder="Add details about your field..."
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Google Maps Link</label>
                <input
                  {...register('googleMapsLink')}
                  placeholder="https://maps.google.com/..."
                  type="url"
                  className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Image URL</label>
                <input
                  {...register('imageUrl')}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
                />
              </div>

              <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <input
                  type="checkbox"
                  {...register('isActive')}
                  className="w-5 h-5 accent-primary rounded cursor-pointer"
                  id="isActiveToggle"
                />
                <label htmlFor="isActiveToggle" className="text-sm font-semibold text-gray-700 cursor-pointer flex-1">
                  {editingField ? (
                    <>Open for Bookings</>
                  ) : (
                    <>Open for Bookings</>
                  )}
                </label>
                <span className="text-xs font-medium text-gray-500">
                  {editingField ? (
                    editingField.is_active === 1 ? '✓ Open' : '✗ Closed'
                  ) : (
                    '✓ Open'
                  )}
                </span>
              </div>

              <div className="flex gap-3 justify-end pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="px-6 py-2.5 border border-gray-300 rounded-full hover:bg-gray-50 transition font-semibold text-sm text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-primary text-white rounded-full hover:opacity-90 transition flex items-center gap-2 font-semibold text-sm"
                >
                  <FiCheck className="h-4 w-4" /> {editingField ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
