// import React from 'react'

const navbar = () => {
  return (
    <div className="navbar py-7 flex items-center justify-between">
        <div className="logo">
            <h1>Logo</h1>
        </div>
        <ul className="menu flex items-center justify-center gap-15">
            <li><a href="#">Home</a></li>
            <li><a href="#">About</a></li>
            <li><a href="#">Reserve</a></li>
        </ul>

        <div>
            <button className="bg-primary text-white font-semibold px-4 py-2 rounded-full hover:opacity-90 transition duration-300">Login</button>
        </div>
    </div>
  )
}

export default navbar