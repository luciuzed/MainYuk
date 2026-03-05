// import React from 'react'
import {useState} from 'react'
import IMAGE from '../assets/ring.jpg'
import { FaUser, FaLock, FaPhoneAlt, FaEye, FaEyeSlash  } from "react-icons/fa";

const LoginPage = () => {
  const [role, setRole] = useState('Customer')
  const [mode, setMode] = useState("login")
  const [showPassword, setShowPassword] = useState(false)
  return (
    <div className="w-full h-[calc(100vh-80px)] flex ">
      <div className="w-1/2 flex flex-col pr-10 pt-5">
        {mode === "login" && (
          <div className="flex">
            <button
              onClick={() => setRole("Customer")}
              className={`flex-1 pb-3 font-semibold ${
                role === "Customer"
                  ? "text-primary border-b-2 border-primary"
                  : "text-gray-400"
              }`} 
            >
              Customer
            </button>

            <button
              onClick={() => setRole("Business")}
              className={`flex-1 pb-3 font-semibold ${
                role === "Business"
                  ? "text-primary border-b-2 border-primary"
                  : "text-gray-400"
              }`}
            >
              Business
            </button>
          </div>
        )}
        {/* <h1 className="text-2xl font-bold m-5 mb-2">Login as {role}</h1> */}

        <h1 className="font-semibold text-5xl mx-5 mt-10 mb-15 justify-center align-center flex">
          {mode === "login" ? "Welcome Back!" : "Create an Account"}
        </h1>
      
        {mode === "register" && (
          <div className="w-full flex flex-col items-center mb-6">

            <div className="w-3/4">
              <p className="mb-2">Register as:</p>

              <div className="flex gap-8 mb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="accountType" defaultChecked />
                  <span>User</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="accountType" />
                  <span>Admin</span>
                </label>
              </div>
            </div>

            {/* Full Name */}
            <div className="relative w-3/4">
              <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Full Name"
                className="w-full pl-12 pr-4 py-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

          </div>
        )}

        <div className="w-full flex justify-center">
          <div className="relative w-3/4 mb-4">
            
            <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            
            <input
              type="email"
              placeholder="Email Address"
              className="w-full pl-12 pr-4 py-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
            />
            
          </div>
        </div>

        {mode === "register" && (
          <div className="w-full flex justify-center">
            <div className="relative w-3/4 mb-4">
              <FaPhoneAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="tel"
                placeholder="+62"
                className="w-full pl-12 pr-4 py-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        )}

        {mode === "login" && (
          <div className="w-full flex justify-center">
            <div className="relative w-3/4 mb-6">

              <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="w-full pl-12 pr-12 py-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
              />

              {showPassword ? (
                <FaEyeSlash
                  onClick={() => setShowPassword(false)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
                />
              ) : (
                <FaEye
                  onClick={() => setShowPassword(true)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
                />
              )}

            </div>
          </div>
        )}

        {mode === "register" && (
          <div className="w-full flex justify-center">
            <div className="w-3/4 flex gap-4 mb-6">

              <div className="relative w-1/2">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full pl-12 pr-4 py-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="relative w-1/2">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  placeholder="Confirm Password"
                  className="w-full pl-12 pr-4 py-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

            </div>
          </div>
        )}

        <div className="flex justify-center">
          <button className="w-3/4 bg-primary text-white py-3 rounded-full font-semibold cursor-pointer hover:opacity-90 transition">
            Continue
          </button>
        </div>

          <div className="w-full flex justify-center mt-4">
            <button
              onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                setRole("Customer");
              }}
              className="text-primary font-medium hover:underline cursor-pointer"
            >
              {mode === "login"
                ? "Don’t have an account? Register"
                : "Already have an account? Login"}
            </button>
          </div>
        </div>

        <div className="w-1/2 flex justify-center items-center ">
          <img 
            src={IMAGE} 
            alt="Ring" 
            className="w-3/4 h-5/6 object-cover rounded-xl"
          />
      </div>

    </div>
  )
}

export default LoginPage  