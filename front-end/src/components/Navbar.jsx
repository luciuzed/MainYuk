import React, { useState, useEffect, useRef } from 'react'
import { NavLink, Link, useLocation } from "react-router-dom"
import logo from '../assets/logo.svg'
import { FaBars, FaTimes } from "react-icons/fa"
import { MdAccountCircle } from "react-icons/md"
import Cookies from 'js-cookie'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef(null)
  const location = useLocation()

  // ✅ Update user on route change
  useEffect(() => {
    const session = Cookies.get('user_session')
    if (session) {
      setUser(JSON.parse(session))
    } else {
      setUser(null)
    }
  }, [location])

  // ✅ Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleLogout = () => {
    Cookies.remove('user_session')
    setUser(null)
    setShowDropdown(false)
  }

  const navItemClass = ({ isActive }) =>
    `relative px-3 py-1 transition-all duration-300 ${
      isActive ? 'text-[#009966] font-bold' : 'text-[#009966]/80'
    }`

  return (
    <div className="navbar py-5 flex items-center justify-between relative">

      {/* Logo */}
      <img src={logo} alt="Logo" className="h-15" />

      {/* Desktop Menu */}
      <ul className="hidden md:flex items-center gap-15 font-bold">
        <li>
          <NavLink to="/" className={navItemClass} end>Home</NavLink>
        </li>
        <li>
          <NavLink to="/venue" className={navItemClass}>Venue</NavLink>
        </li>
        <li>
          <NavLink to="/contact" className={navItemClass}>Contact</NavLink>
        </li>
      </ul>

      {/* RIGHT SECTION */}
      <div className="hidden md:block relative" ref={dropdownRef}>
        {user ? (
          <div className="relative">
            
            {/* ✅ Modern Icon Button */}
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center justify-center p-1 rounded-full hover:bg-gray-100 transition cursor-pointer"
            >
              <MdAccountCircle size={40} className="text-primary" />
            </button>

            {/* Dropdown */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg py-2 z-50">
                
                <div className="px-4 py-2 text-sm text-gray-500 border-b">
                  {user.name || "User"}
                </div>

                <Link to="/profile">
                  <div className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                    Profile
                  </div>
                </Link>

                <div
                  onClick={handleLogout}
                  className="px-4 py-2 hover:bg-red-100 text-red-500 cursor-pointer"
                >
                  Logout
                </div>
              </div>
            )}

          </div>
        ) : (
          <Link to="/login">
            <button className="bg-primary text-white font-semibold px-4 py-2 rounded-full hover:opacity-90 transition">
              Sign Up
            </button>
          </Link>
        )}
      </div>

      {/* Mobile Button */}
      <div className="md:hidden">
        <button onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="absolute top-20 left-0 w-full bg-white shadow-md flex flex-col items-center gap-6 py-6 md:hidden z-50">

          <NavLink to="/" onClick={() => setIsOpen(false)}>Home</NavLink>
          <NavLink to="/venue" onClick={() => setIsOpen(false)}>Venue</NavLink>
          <NavLink to="/contact" onClick={() => setIsOpen(false)}>Contact</NavLink>

          {user ? (
            <>
              <div className="flex items-center gap-2">
                <MdAccountCircle size={28} className="text-primary" />
                <span>{user.name}</span>
              </div>

              <Link to="/profile" onClick={() => setIsOpen(false)}>
                Profile
              </Link>

              <button
                onClick={handleLogout}
                className="text-red-500 font-semibold"
              >
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" onClick={() => setIsOpen(false)}>
              <button className="bg-primary text-white px-4 py-2 rounded-full">
                Sign Up
              </button>
            </Link>
          )}

        </div>
      )}
    </div>
  )
}

export default Navbar