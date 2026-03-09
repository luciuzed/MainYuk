// import React from 'react'
import { useState, useEffect } from 'react'
import { useForm } from "react-hook-form"
import IMAGE from '../assets/ring.jpg'

import { FaUser, FaLock, FaPhoneAlt, FaEye, FaEyeSlash } from "react-icons/fa";

const PasswordInput = ({ placeholder, showPassword, setShowPassword, ...props }) => {
  return (
    <div className="relative w-full">
      <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

      <input
        type={showPassword ? "text" : "password"}
        placeholder={placeholder}
        {...props}
        className="w-full pl-12 pr-12 py-3 border rounded-full focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
      />

      {showPassword ? (
        <FaEye
          onClick={() => setShowPassword(false)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
        />
      ) : (
        <FaEyeSlash
          onClick={() => setShowPassword(true)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
        />
      )}
    </div>
  )
}

const LoginPage = () => {
  const [role, setRole] = useState('User')

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mode, setMode] = useState("login")
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    console.log("Sending to server:", { email, password }) //debug
    const url = role === "User" ? "login" : "login-business";

    try {
      const response = await fetch(`http://localhost:5000/api/${url}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(`Welcome, ${data.user.name}!`);
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Cannot connect to server');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    const url = role === "User" ? "register" : "register-business";

    if (!fullName || !email || !password || !confirmPassword) {
        return setError("Please fill in all fields");
    }

    if (password !== confirmPassword) {
      return setError("Passwords do not match");
    }

    try {
      const response = await fetch(`http://localhost:5000/api/${url}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: fullName, 
          email: email, 
          password: password,
          phone: phone
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Registration successful!");
        setMode("login"); 
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('Cannot connect to server');
    }
  };

  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors }
  } = useForm()

  const onSubmit = (data) => {
    if (mode === "register") {
      if (!role || role === "Customer") {
        alert("Please select a valid role (User or Admin)")
        return
      }
      
      if (data.password !== data.confirmPassword) {
        alert("Passwords do not match")
        return
      }
    }

    console.log("Validated Data:", { ...data, role })
    alert("Form submitted successfully")
    reset()
    
    // Reset local states if needed
    if (mode === "login") {
      setShowPassword(false)
    } else {
      setShowPassword(false)
      setShowConfirmPassword(false)
    }
  }

  const handleModeSwitch = () => {
    setMode(mode === "login" ? "register" : "login")
    setRole("Customer")
    setShowPassword(false)
    setShowConfirmPassword(false)
    reset() // This will clear all form fields including password
  }

  const handleRoleChange = (newRole) => {
    setRole(newRole)
    // Clear password fields when switching roles in login mode
    if (mode === "login") {
      setValue("password", "") // Clear password field in react-hook-form
      setShowPassword(false)
    }
  }

  // Phone number validation function
  const validatePhoneNumber = (value) => {
    // Remove any non-digit characters except + at the beginning
    let cleaned = value.replace(/[^\d+]/g, '')
    
    // Ensure only one + at the beginning if present
    if (cleaned.indexOf('+') > 0) {
      cleaned = cleaned.replace(/\+/g, '')
    }
    
    // Format phone number (you can customize this based on your requirements)
    if (cleaned.startsWith('+62')) {
      // Indonesian format
      if (cleaned.length < 10 || cleaned.length > 15) {
        return "Phone number must be between 10-15 digits"
      }
    } else if (cleaned.startsWith('0')) {
      // Local format starting with 0
      if (cleaned.length < 10 || cleaned.length > 13) {
        return "Phone number must be between 10-13 digits"
      }
    } else {
      // International format without +
      if (cleaned.length < 8 || cleaned.length > 15) {
        return "Phone number must be between 8-15 digits"
      }
    }
    
    return true
  }

  return (
    <div className="w-full h-[calc(100vh-80px)] flex ">
      {/* left */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-1/2 flex flex-col pr-10 pt-5"
      >
        {/* option */}
        {mode === "login" && (
          <div className="flex mb-5">
            <button
              onClick={() => setRole("User")}
              className={`flex-1 pb-3 font-semibold ${
                role === "User"
                  ? "text-primary border-b-2 border-primary"
                  : "text-gray-400"
              }`} 
            >
              User
            </button>

            <button
              type="button"
              onClick={() => handleRoleChange("Business")}
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
        {/* title */}
        <h1
          className={`font-semibold text-5xl mx-5 mt-10 justify-center items-center flex ${
            mode === "login" ? "mb-15" : "mb-5"
          }`} 
        >
          {mode === "login" ? "Welcome Back!" : "Create an Account"}
        </h1>
        
        
        {mode === "register" && (
          <div className="w-full flex flex-col items-center">
            {/* roles selection */}
            <div className="w-3/4">
              <p className="mb-2 font-semibold">Register as:</p>

              <div className="flex gap-4 mb-4">

                <button
                  type="button"
                  onClick={() => setRole("User")}
                  className={`px-6 py-2 rounded-full border ${
                    role === "User"
                      ? "bg-primary text-white border-primary"
                      : "border-gray-300 text-gray-500"
                  }`}
                >
                  User
                </button>

                <button
                  type="button"
                  onClick={() => setRole("Admin")}
                  className={`px-6 py-2 rounded-full border ${
                    role === "Admin"
                      ? "bg-primary text-white border-primary"
                      : "border-gray-300 text-gray-500"
                  }`}
                >
                  Admin
                </button>

              </div>
              {mode === "register" && !role && (
                <p className="text-red-500 text-sm">Please select a role</p>
              )}
            </div>
            {/* register name input */}
            <div className="w-3/4">
              <div className="relative">
                <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

                <input
                  type="text"
                  placeholder="Full Name"
                  {...register("fullName", {
                    required: "Full name is required",
                    minLength: {
                      value: 3,
                      message: "Minimum 3 characters"
                    }
                  })}
                  value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border rounded-full focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <p className="text-red-500 text-sm h-5 ml-5">
                {errors.fullName?.message}
              </p>
            </div>

          </div>
        )}

        <div className="w-full flex justify-center">
          <div className="w-3/4">
            <div className="relative">
              <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

              <input
                type="email"
                value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^\S+@\S+\.\S+$/i,
                    message: "Invalid email"
                  }
                })}
                className="w-full pl-12 pr-4 py-3 border rounded-full focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <p className="text-red-500 text-sm h-5 ml-5">
              {errors.email?.message}
            </p>
          </div>
        </div>

        {mode === "register" && (
          <div className="w-full flex justify-center">
            <div className="w-3/4">
              <div className="relative">
                <FaPhoneAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

                <input
                  type="tel"
                  value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone Number"
                  {...register("phone", {
                    required: "Phone number is required",
                    validate: validatePhoneNumber,
                    onChange: (e) => {
                      let value = e.target.value
                      // Auto-format Indonesian numbers
                      if (value.startsWith("0")) {
                        value = "+62" + value.slice(1)
                        e.target.value = value
                      }
                      // Remove any non-digit characters except +
                      value = value.replace(/[^\d+]/g, '')
                      e.target.value = value
                    }
                  })}
                  className="w-full pl-12 pr-4 py-3 border rounded-full focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <p className="text-red-500 text-sm h-5 ml-5">
                {errors.phone?.message}
              </p>
            </div>
          </div>
        )}

        {mode === "login" && (
          <div className="w-full flex justify-center">
            <div className="w-3/4 mb-6">
              <PasswordInput
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                {...register("password", {
                  required: "Password is required"
                })}
              />
              <p className="text-red-500 text-sm h-5 ml-5">
                {errors.password?.message}
              </p>
            </div>
          </div>
        )}

        {mode === "register" && (
          <div className="w-full flex justify-center">
            <div className="w-3/4 flex gap-4 mb-6">

              <div className="w-1/2">
                <PasswordInput
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  showPassword={showPassword}
                  setShowPassword={setShowPassword}
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Minimum 6 characters"
                    }
                  })}
                />

                <p className="text-red-500 text-sm h-5 ml-5">
                  {errors.password?.message}
                </p>
              </div>

              <div className="w-1/2">
                <PasswordInput
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  showPassword={showConfirmPassword}
                  setShowPassword={setShowConfirmPassword}
                  {...register("confirmPassword", {
                    required: "Confirm password is required",
                    validate: (value) =>
                      value === watch("password") || "Passwords do not match"
                  })}
                />

                <p className="text-red-500 text-sm h-5 ml-5">
                  {errors.confirmPassword?.message}
                </p>
              </div>

            </div>
          </div>
        )}
        <div className=""><p className="text-red-500 text-center mb-4">{error}</p></div>
        <div className="flex justify-center">
          <button
            type="submit"
            onClick={mode === "login" ? handleLogin : handleRegister}
          className="w-3/4 bg-primary text-white py-3 rounded-full font-semibold cursor-pointer hover:opacity-90 transition"
          >
            Continue
          </button>
        </div>

        <div className="w-full flex justify-center mt-4">
          <button
            type="button"
            onClick={handleModeSwitch}
            className="text-primary font-medium hover:underline cursor-pointer"
          >
            {mode === "login"
              ? "Don’t have an account? Register"
              : "Already have an account? Login"}
          </button>
        </div>
      </form>

      {/* right */}
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