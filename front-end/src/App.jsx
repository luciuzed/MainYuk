import { Routes, Route } from "react-router-dom"
import Navbar from "./components/Navbar"
import LoginPage from "./page/LoginPage"

function App() {
  return (
    <div className="container mx-auto px-10">
      <Navbar />

      <Routes>
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </div>
  )
}

export default App