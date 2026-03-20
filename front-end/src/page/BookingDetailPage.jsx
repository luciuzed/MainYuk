import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FaMapMarkerAlt, FaStar, FaChevronLeft, FaRegClock, 
  FaShieldAlt, FaWhatsapp, FaRunning, FaCheckCircle 
} from 'react-icons/fa';
import { allExperiences } from './BookingPage'; 

const BookingDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // State for new booking type: Court + Time
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  const field = allExperiences.find(item => item.id === parseInt(id));

  if (!field) return <div className="p-10 text-center font-bold">Field not found</div>;

  const courts = ["Court A (Vinyl)", "Court B (Vinyl)", "Court C (Interlock)"];
  const timeSlots = ["08:00", "10:00", "15:00", "17:00", "19:00", "21:00"];

  const openMap = () => {
    const query = encodeURIComponent(`${field.title} ${field.location}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  // WhatsApp Redirect with dynamic message
  const contactWhatsApp = () => {
    const message = `Halo Admin, saya ingin bertanya tentang booking di ${field.title} untuk ${field.tag}.`;
    window.open(`https://wa.me/6289794383499?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 mb-20">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-[10px] font-bold text-gray-400 mb-6 uppercase tracking-widest hover:text-black transition-colors"
      >
        <FaChevronLeft size={10} /> Back to Exploration
      </button>

      <div className="grid lg:grid-cols-3 gap-12">
        
        {/* LEFT: Venue Details */}
        <div className="lg:col-span-2 space-y-8">
          <div className="relative rounded-3xl overflow-hidden aspect-video shadow-2xl">
             <img src={field.img} alt={field.title} className="w-full h-full object-cover" />
             <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md text-white px-4 py-1 rounded-full text-xs font-bold">
               {field.tag}
             </div>
          </div>

          <div className="flex justify-between items-start">
              <h1 className="text-4xl font-black text-gray-900 leading-none">{field.title}</h1>
              <button onClick={openMap} className="mt-3 flex items-center gap-2 text-primary hover:underline text-sm font-bold">
                <FaMapMarkerAlt /> {field.location}, Indonesia
              </button>
          </div>

          <div className="p-8 bg-gray-50 rounded-[2rem] border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Venue Overview</h3>
            <p className="text-gray-500 leading-relaxed text-sm">
              {field.description} This facility is professionally managed and cleaned daily. 
              Perfect for {field.tag} enthusiasts looking for a premium experience.
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-600 bg-gray-100 px-4 py-2 rounded-full">
              <FaCheckCircle className="text-green-500" /> Free Parking
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-gray-600 bg-gray-100 px-4 py-2 rounded-full">
              <FaCheckCircle className="text-green-500" /> Changing Room
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-gray-600 bg-gray-100 px-4 py-2 rounded-full">
              <FaCheckCircle className="text-green-500" /> Mineral Water
            </div>
          </div>
        </div>

        {/* RIGHT: New Selection Booking Card */}
        <div className="lg:col-span-1">
          <div className="sticky top-8 border border-gray-100 rounded-[2.5rem] bg-white p-8 shadow-2xl shadow-gray-200/50 space-y-8">
            
            {/* 1. Court Selection */}
            <div className="space-y-4">
              <p className="text-xs font-black text-gray-900 uppercase tracking-widest">1. Select Court</p>
              <div className="space-y-2">
                {courts.map((court) => (
                  <button
                    key={court}
                    onClick={() => setSelectedCourt(court)}
                    className={`w-full p-4 text-left text-xs font-bold rounded-2xl border transition-all ${
                      selectedCourt === court 
                      ? "bg-primary/5 border-primary text-primary" 
                      : "bg-white border-gray-100 text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    {court}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Time Selection */}
            <div className="space-y-4">
              <p className="text-xs font-black text-gray-900 uppercase tracking-widest">2. Select Time</p>
              <div className="grid grid-cols-3 gap-2">
                {timeSlots.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`py-3 text-[11px] font-bold rounded-xl border transition-all ${
                      selectedTime === time 
                      ? "bg-black text-white border-black" 
                      : "bg-white text-gray-400 border-gray-100 hover:border-primary"
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-50">
              <div className="flex justify-between items-center mb-6">
                <span className="text-sm font-bold text-gray-400">Total Price</span>
                <span className="text-2xl font-black text-gray-900">{field.price}</span>
              </div>

              <button 
                disabled={!selectedTime || !selectedCourt}
                className="w-full py-4 bg-primary text-white rounded-2xl font-black text-sm shadow-xl shadow-primary/30 hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-20"
              >
                Confirm Reservation
              </button>

              <button 
                onClick={contactWhatsApp}
                className="w-full mt-3 py-4 flex items-center justify-center gap-2 bg-green-500 text-white rounded-2xl font-black text-sm shadow-xl shadow-green-500/20 hover:bg-green-600 transition-all"
              >
                <FaWhatsapp size={18} /> Chat via WhatsApp
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default BookingDetailPage;