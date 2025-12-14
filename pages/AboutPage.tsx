
import React from 'react';
import { Mail, MapPin, Github, Linkedin, Camera, Film, Code2, Globe } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 pb-20">
      {/* Hero Header */}
      <div className="relative py-20 lg:py-28 overflow-hidden border-b border-slate-800 bg-slate-900/50">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
           <div className="absolute -top-[20%] -right-[10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl"></div>
           <div className="absolute top-[20%] -left-[10%] w-[400px] h-[400px] bg-orange-600/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10 text-center">
           <span className="inline-block py-1 px-3 rounded-full bg-slate-800/80 border border-slate-700 text-orange-400 text-xs font-bold tracking-widest uppercase mb-4">
              Tentang Platform
           </span>
           <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
              Arsip Digital <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-500">Karya Visual</span>
           </h1>
           <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Wadah apresiasi dan eksibisi online untuk karya film dokumenter mahasiswa Desain Komunikasi Visual ITS.
           </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-5xl space-y-20">
         
         {/* Section: Definisi / Vision */}
         <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative group">
               <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
               <img 
                 src="https://images.unsplash.com/photo-1517524206127-48bbd363f3d7?auto=format&fit=crop&q=80&w=800" 
                 alt="Filmmaking" 
                 className="relative rounded-2xl shadow-2xl border border-slate-800 transform group-hover:scale-[1.01] transition-transform duration-500"
               />
            </div>
            <div className="space-y-6">
               <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                  <Film className="w-8 h-8 text-orange-500" /> Visi & Misi
               </h2>
               <div className="space-y-4 text-slate-400 text-lg leading-relaxed">
                  <p>
                     <strong className="text-white">DocuTube DKV ITS</strong> lahir dari kebutuhan untuk mendokumentasikan dan mempublikasikan karya-karya terbaik mahasiswa mata kuliah Videografi.
                  </p>
                  <p>
                     Setiap tahun, puluhan cerita inspiratif terekam dalam lensa mahasiswa, mulai dari budaya lokal, isu sosial, hingga potret humanis. Platform ini hadir agar cerita-cerita tersebut tidak hanya tersimpan di hard drive, melainkan dapat dinikmati, diapresiasi, dan menjadi referensi bagi publik luas.
                  </p>
               </div>
            </div>
         </div>

         {/* Section: The Team / Creator */}
         <div className="bg-slate-900 rounded-3xl p-8 md:p-12 border border-slate-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="text-center mb-12">
               <h2 className="text-3xl font-bold text-white mb-2">Meet the Creator</h2>
               <p className="text-slate-500">Dedikasi untuk pengembangan teknologi kreatif di lingkungan kampus.</p>
            </div>

            <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-12">
               {/* Profile Card */}
               <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col items-center w-full max-w-sm hover:border-orange-500/50 transition-colors shadow-lg">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center mb-4 border-2 border-slate-700 shadow-inner">
                     <Code2 className="w-10 h-10 text-orange-500" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Dhani Soenyoto</h3>
                  <p className="text-orange-500 text-sm font-medium mb-4">Lead Developer & Designer</p>
                  <p className="text-slate-400 text-center text-sm mb-6">
                     Mahasiswa/Alumni DKV ITS yang berfokus pada Creative Coding dan Web Development. Mengembangkan DocuTube untuk arsip digital yang berkelanjutan.
                  </p>
                  <div className="flex gap-4">
                     <a href="#" className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"><Github className="w-5 h-5" /></a>
                     <a href="#" className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"><Linkedin className="w-5 h-5" /></a>
                     <a href="#" className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"><Globe className="w-5 h-5" /></a>
                  </div>
               </div>

               {/* Department Info */}
               <div className="text-center md:text-left max-w-md space-y-4">
                  <div className="inline-flex items-center gap-2 text-indigo-400 font-bold uppercase tracking-wider text-xs bg-indigo-500/10 px-3 py-1 rounded-full">
                     <Camera className="w-4 h-4" /> Didukung Oleh
                  </div>
                  <h3 className="text-2xl font-bold text-white">Departemen Desain Komunikasi Visual</h3>
                  <p className="text-slate-400">
                     Institut Teknologi Sepuluh Nopember (ITS) Surabaya. Menggabungkan seni, desain, dan teknologi untuk memecahkan masalah komunikasi visual.
                  </p>
               </div>
            </div>
         </div>

         {/* Footer Contact */}
         <div className="border-t border-slate-800 pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-start gap-4 text-slate-400 max-w-md">
               <MapPin className="w-6 h-6 shrink-0 text-orange-500 mt-1" />
               <div>
                  <h4 className="text-white font-bold mb-1">Lokasi Kampus</h4>
                  <p className="text-sm">Gedung Desain Produk Industri & DKV, Kampus ITS Sukolilo, Surabaya, Jawa Timur 60111</p>
               </div>
            </div>
            
            <div className="flex items-center gap-4">
               <a href="mailto:admin@dkv.its.ac.id" className="flex items-center gap-2 px-5 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-white text-sm font-medium transition-colors">
                  <Mail className="w-4 h-4" /> Hubungi Kami
               </a>
            </div>
         </div>

      </div>
    </div>
  );
};
