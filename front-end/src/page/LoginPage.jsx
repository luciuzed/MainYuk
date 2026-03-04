// import React from 'react'
import {useState} from 'react'
import IMAGE from '../assets/ring.jpg'
import { FaUser, FaLock} from "react-icons/fa";

const LoginPage = () => {
  const [role, setRole] = useState('Customer')
  return (
    <div className="w-full h-[calc(100vh-80px)] flex ">
      <div className="w-1/2 flex flex-col pr-10 pt-5">
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

        {/* <h1 className="text-2xl font-bold m-5 mb-2">Login as {role}</h1> */}

        <h1 className="font-semibold text-5xl mx-5 mt-10 mb-15 justify-center align-center flex">
          Welcome back!
        </h1>
      

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

        <div className="w-full flex justify-center">
          <div className="relative w-3/4 mb-6">
            
            <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            
            <input
              type="password"
              placeholder="Password"
              className="w-full pl-12 pr-4 py-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
            />
            
          </div>
        </div>

          <div className="flex justify-center">
            <button className="w-3/4 bg-primary text-white py-3 rounded-full font-semibold cursor-pointer hover:opacity-90 transition">
              Continue
            </button>
          </div>

          <div className="w-full flex justify-center mt-4">
            <button className="text-primary font-medium hover:underline cursor-pointer">
              Don’t have an account? Register
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