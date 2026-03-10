import React from "react";
import "./home.css";

const Home = () => {
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
            <input type="text" placeholder="Cari Venue" />
            <select>
              <option>Pilih Kota</option>
              <option>Medan</option>
              <option>Binjai</option>
            </select>
            <select>
              <option>Pilih Cabang Olahraga</option>
              <option>Futsal</option>
              <option>Badminton</option>
              <option>Basket</option>
              <option>Sepakbola</option>
              <option>Tenis</option>
              <option>Voli</option>
              <option>Golf</option>
            </select>
            <button>Cari Venue</button>
          </div>
        </div>
      </section>

      {/* LIST VENUE */}
      <section className="venue-list" id="reserve">
        <div className="venue-content">
          <h2>Venue Tersedia</h2>

          <div className="card-container">
            <div className="card">
              <img
                src="https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800"
                alt="Lapangan Futsal"
              />
              <h3>Lapangan Futsal</h3>
              <p>Harga mulai Rp 100.000 / jam</p>
              <button>Booking Sekarang</button>
            </div>

            <div className="card">
              <img
                src="https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800"
                alt="GOR Badminton"
              />
              <h3>GOR Badminton</h3>
              <p>Harga mulai Rp 80.000 / jam</p>
              <button>Booking Sekarang</button>
            </div>

            <div className="card">
              <img
                src="https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800"
                alt="Lapangan Basket"
              />
              <h3>Lapangan Basket</h3>
              <p>Harga mulai Rp 120.000 / jam</p>
              <button>Booking Sekarang</button>
            </div>

            <div className="card">
              <img
                src="https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800"
                alt="Lapangan Sepakbola"
              />
              <h3>Lapangan Sepakbola</h3>
              <p>Harga mulai Rp 150.000 / jam</p>
              <button>Booking Sekarang</button>
            </div>

            <div className="card">
              <img
                src="https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800"
                alt="Lapangan Tenis"
              />
              <h3>Lapangan Tenis</h3>
              <p>Harga mulai Rp 90.000 / jam</p>
              <button>Booking Sekarang</button>
            </div>

            <div className="card">
              <img
                src="https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800"
                alt="Lapangan Voli"
              />
              <h3>Lapangan Voli</h3>
              <p>Harga mulai Rp 100.000 / jam</p>
              <button>Booking Sekarang</button>
            </div>

            <div className="card">
              <img
                src="https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800"
                alt="Lapangan Golf"
              />
              <h3>Lapangan Golf</h3>
              <p>Harga mulai Rp 200.000 / jam</p>
              <button>Booking Sekarang</button>
            </div>

            <div className="card">
              <img
                src="https://images.unsplash.com/photo-1508344928928-7165b67de128?w=800"
                alt="Lapangan Baseball"
              />
              <h3>Lapangan Baseball</h3>
              <p>Harga mulai Rp 150.000 / jam</p>
              <button>Booking Sekarang</button>
            </div>

            <div className="card">
              <img
                src="https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800"
                alt="Kolam Renang"
              />
              <h3>Kolam Renang</h3>
              <p>Harga mulai Rp 50.000 / jam</p>
              <button>Booking Sekarang</button>
            </div>
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

      {/* ABOUT SECTION */}
      <section id="about" className="about">
        <div className="about-content">
          <h2>Tentang BUKALAPANG</h2>
          <p>
            BUKALAPANG adalah platform inovatif yang didedikasikan untuk memudahkan masyarakat Kota Medan dalam mencari dan memesan venue olahraga.
            Kami hadir sebagai solusi modern untuk para pecinta olahraga yang ingin menikmati aktivitas fisik tanpa harus repot mencari tempat yang tepat.
          </p>
          <p>
            Dengan koleksi venue yang beragam, mulai dari lapangan futsal hingga kolam renang, BUKALAPANG menawarkan kemudahan akses ke berbagai fasilitas olahraga berkualitas.
            Sistem pemesanan online kami dirancang untuk memberikan pengalaman yang cepat, aman, dan user-friendly, sehingga Anda dapat fokus pada hal yang paling penting: menikmati olahraga Anda.
          </p>
          <p>
            Kami berkomitmen untuk mendukung gaya hidup sehat di Kota Medan dengan menyediakan platform yang menghubungkan pengguna dengan venue olahraga terbaik.
            Tim kami terus berinovasi untuk memberikan layanan terbaik dan memastikan kepuasan pelanggan.
          </p>
          <div className="creators">
            <h3>Dibuat Oleh:</h3>
            <ul>
              <li>Vincent</li>
              <li>Alvaro Caesar</li>
              <li>Edbert Luciuz</li>
            </ul>
          </div>
          <div className="about-stats">
            <div className="stat">
              <h3>100+</h3>
              <p>Venue Tersedia</p>
            </div>
            <div className="stat">
              <h3>9</h3>
              <p>Jenis Olahraga</p>
            </div>
            <div className="stat">
              <h3>24/7</h3>
              <p>Dukungan</p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>BUKALAPANG</h3>
            <p>Platform pemesanan venue olahraga terdepan di Kota Medan</p>
          </div>
          <div className="footer-section">
            <h4>Kontak Kami</h4>
            <p>Email: info@bukalapang.com</p>
            <p>Telepon: +62 812 3456 7890</p>
            <p>Alamat: Jl. Olahraga No. 123, Medan</p>
          </div>
          <div className="footer-section">
            <h4>Ikuti Kami</h4>
            <div className="social-links">
              <a href="#">Facebook</a>
              <a href="#">Instagram</a>
              <a href="#">Twitter</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 BUKALAPANG. All rights reserved. | Dibuat oleh Vincent, Alvaro Caesar, Edbert Luciuz</p>
        </div>
      </footer>

    </div>
  );
};

export default Home;