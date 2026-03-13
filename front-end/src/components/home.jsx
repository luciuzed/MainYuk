import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./home.css";
import Footer from "./footer";

const Home = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchCity, setSearchCity] = useState("");
  const [searchSport, setSearchSport] = useState("");

  const handleSearchClick = () => {
    navigate(`/reserve?term=${searchTerm}&city=${searchCity}&sport=${searchSport}`);
  };

  const handleReset = () => {
    setSearchTerm("");
    setSearchCity("");
    setSearchSport("");
  };

  return (
    <div className="home" id="home">

      {/* HERO SECTION */}
      <section className="hero">
        <div className="hero-content">
          <h1>VENUE OLAHRAGA TERBAIK</h1>
          <p>
            Temukan dan booking venue olahraga terbaik pilihanmu
            dengan mudah, cepat, dan terpercaya melalui aplikasi kami.
          </p>

          {/* SEARCH BOX */}
          <div className="search-container">
            <input 
              type="text" 
              placeholder="Cari Nama Venue" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select value={searchCity} onChange={(e) => setSearchCity(e.target.value)}>
              <option value="">Pilih Kota</option>
              <option value="Medan">Medan</option>
              <option value="Binjai">Binjai</option>
              <option value="Jakarta">Jakarta</option>
              <option value="Bandung">Bandung</option>
              <option value="Surabaya">Surabaya</option>
              <option value="Bali">Bali</option>
            </select>
            <select value={searchSport} onChange={(e) => setSearchSport(e.target.value)}>
              <option value="">Pilih Cabang Olahraga</option>
              <option value="Futsal">Futsal</option>
              <option value="Badminton">Badminton</option>
              <option value="Basket">Basket</option>
              <option value="Sepakbola">Sepakbola</option>
              <option value="Tenis">Tenis</option>
              <option value="Voli">Voli</option>
              <option value="Golf">Golf</option>
              <option value="Baseball">Baseball</option>
              <option value="Renang">Renang</option>
              <option value="Yoga">Yoga</option>
              <option value="Biliar">Biliar</option>
              <option value="Bowling">Bowling</option>
              <option value="Boxing">Boxing</option>
            </select>
            <button className="btn-search" onClick={handleSearchClick}>Cari Venue</button>
            <button className="btn-reset" onClick={handleReset}>Reset</button>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="features">
        <div className="features-content">
          <h2>Mengapa Memilih BUKALAPANG?</h2>
          <div className="features-grid">
            <div className="feature">
              <div className="feature-icon">🏆</div>
              <h3>Venue Terpercaya</h3>
              <p>Semua venue telah diverifikasi dan siap untuk digunakan.</p>
            </div>
            <div className="feature">
              <div className="feature-icon">⚡</div>
              <h3>Pemesanan Cepat</h3>
              <p>Booking dalam hitungan menit tanpa ribet.</p>
            </div>
            <div className="feature">
              <div className="feature-icon">💰</div>
              <h3>Harga Terjangkau</h3>
              <p>Tarif kompetitif untuk semua jenis olahraga.</p>
            </div>
            <div className="feature">
              <div className="feature-icon">📍</div>
              <h3>Lokasi Strategis</h3>
              <p>Venue tersebar di seluruh Kota Medan.</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />

    </div>
  );
};

export default Home;