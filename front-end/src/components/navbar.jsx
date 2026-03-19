import React from 'react'
import { NavLink, Link } from "react-router-dom"
import logo from '../assets/logo.svg'

const Navbar = () => {
  const navItemClass = ({isActive}) =>
    `relative px-3 py-1 transition-all duration-300 ${isActive ? 'text-[#009966] font-bold' : 'text-[#009966]/80'} `

  return (
    <div className="navbar py-5 flex items-center justify-between">
        <div className="logo">
            <img src={logo} alt="Logo" className="h-15" />
        </div>
        <ul className="menu flex items-center justify-center gap-15 font-bold">
            <li className="relative">
              <NavLink to="/" className={navItemClass} end>
                {({isActive}) => (
                  <>
                    Home
                    <span className={`absolute left-1/2 -translate-x-1/2 -bottom-1 h-[2px] bg-[#009966] transition-all duration-300 ${isActive ? 'w-3/4' : 'w-0'}`} />
                  </>
                )}
              </NavLink>
            </li>
            <li className="relative">
              <NavLink to="/venue" className={navItemClass}>
                {({isActive}) => (
                  <>
                    Venue
                    <span className={`absolute left-1/2 -translate-x-1/2 -bottom-1 h-[2px] bg-[#009966] transition-all duration-300 ${isActive ? 'w-3/4' : 'w-0'}`} />
                  </>
                )}
              </NavLink>
            </li>
            <li className="relative">
              <NavLink to="/contact" className={navItemClass}>
                {({isActive}) => (
                  <>
                    Contact
                    <span className={`absolute left-1/2 -translate-x-1/2 -bottom-1 h-[2px] bg-[#009966] transition-all duration-300 ${isActive ? 'w-3/4' : 'w-0'}`} />
                  </>
                )}
              </NavLink>
            </li>
        </ul>

        <div>
            <Link to="/login">
                <button className="bg-primary text-white font-semibold px-4 py-2 rounded-full hover:opacity-90 transition duration-300 cursor-pointer ">Sign Up</button>
            </Link>
        </div>
    </div>
  )
}

export default Navbar