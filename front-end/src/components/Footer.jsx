import React from "react";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>MAINYUK!</h3>
          <p>Platform pemesanan venue olahraga terdepan</p>
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
        <p>&copy; 2026 MAINYUK!. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;