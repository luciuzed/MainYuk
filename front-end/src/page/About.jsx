import React from "react";
import Footer from "../components/Footer";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <section className="flex-1 px-6 py-20 sm:py-24">
        <div className="max-w-[1100px] mx-auto grid gap-10 lg:grid-cols-[1fr_0.9fr] items-start">
          <div>
            <p className="text-[13px] font-semibold text-[#00A859] uppercase tracking-widest mb-3">About</p>
            <h1 className="text-[34px] sm:text-[44px] font-extrabold text-gray-900 mb-5">Tentang MAIN YUK!</h1>
            <p className="text-[15px] sm:text-[16px] text-gray-600 leading-relaxed max-w-[680px] mb-6">
              MAIN YUK! adalah platform pemesanan venue olahraga yang dirancang untuk membuat pencarian dan komunikasi dengan tim kami lebih sederhana.
            </p>
            <p className="text-[15px] sm:text-[16px] text-gray-600 leading-relaxed max-w-[680px]">
              Halaman ini juga dipakai untuk contact sementara, jadi semua informasi inti ditempatkan di satu tempat sampai struktur final siap.
            </p>
          </div>

          <div className="grid gap-4">
            <div className="rounded-2xl bg-gray-50 p-6 border border-gray-100">
              <p className="text-[12px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Contact</p>
              <p className="text-[16px] font-bold text-gray-900 mb-1">info@bukalapang.com</p>
              <p className="text-[14px] text-gray-500">+62 812 3456 7890</p>
            </div>
            <div className="rounded-2xl bg-[#e6f7ef] p-6 border border-[#cceedd]">
              <p className="text-[12px] font-semibold text-[#00A859] uppercase tracking-wide mb-2">Route Notes</p>
              <p className="text-[14px] text-gray-700 leading-relaxed">
                Use /about for this page and /contact routes here as requested.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;