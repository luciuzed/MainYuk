import React from "react";
import "./navbar.css";

const Navbar = () => {
  return (
    <div className="navbar">
      <div className="navbar-content">
        <div className="logo">
            <h1>BUKALAPANG</h1>
        </div>
        <ul className="menu">
            <li><a href="#home">Home</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#reserve">Reserve</a></li>
        </ul>

        <div>
            <button>Login</button>
        </div>
      </div>
    </div>
  )
}

export default Navbar