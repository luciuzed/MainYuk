import React from "react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <section className="flex-1 px-6 py-20 sm:py-24">
        <div className="max-w-[1100px] mx-auto grid gap-12 lg:grid-cols-[1.25fr_0.75fr] items-center">
          <div>
            <p className="text-[13px] font-semibold text-[#00A859] uppercase tracking-widest mb-4">MAIN YUK!</p>
            <h1 className="text-[42px] sm:text-[56px] lg:text-[68px] font-extrabold text-gray-900 leading-tight mb-5">
              Booking venue olahraga lebih cepat.
            </h1>
            <p className="text-[16px] sm:text-[18px] text-gray-500 max-w-[640px] leading-relaxed mb-8">
              Navigasi sekarang dibatasi ke Home, About, dan Contact supaya halaman utama tetap fokus dan tidak membawa sisa merge lama.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/about" className="px-6 py-3 rounded-xl bg-[#00A859] text-white font-bold hover:bg-[#008f4c] transition-colors">
                About
              </Link>
              <Link to="/contact" className="px-6 py-3 rounded-xl border border-gray-200 text-gray-700 font-bold hover:border-[#00A859] hover:text-[#00A859] transition-colors">
                Contact
              </Link>
            </div>
          </div>

          <div className="bg-gray-50 rounded-[28px] p-8 shadow-[0_8px_40px_rgba(0,0,0,0.06)]">
            <div className="rounded-3xl bg-white border border-gray-100 p-6">
              <p className="text-[12px] font-semibold text-gray-400 uppercase tracking-wide mb-3">Quick View</p>
              <div className="space-y-4">
                <div className="h-24 rounded-2xl bg-linear-to-br from-[#e6f7ef] to-white border border-gray-100" />
                <div className="h-4 w-2/3 rounded-full bg-gray-100" />
                <div className="h-4 w-1/2 rounded-full bg-gray-100" />
                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div className="h-10 rounded-xl bg-[#e6f7ef]" />
                  <div className="h-10 rounded-xl bg-gray-100" />
                  <div className="h-10 rounded-xl bg-gray-100" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;