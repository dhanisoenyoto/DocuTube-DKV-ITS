
import React, { useEffect, useState } from 'react';
import { getVideos, getAppTestimonials, addAppTestimonial } from '../services/videoService';
import { VideoItem, AppTestimonial } from '../types';
import { VideoCard } from '../components/VideoCard';
import { Search, ChevronLeft, ChevronRight, Loader2, MessageSquareQuote, Star, Send } from 'lucide-react';
import { getCurrentUser } from '../services/authService';
import { getVisitorId, generateAvatar } from '../services/avatarService';

const ITEMS_PER_PAGE = 10;

export const HomePage: React.FC = () => {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Testimonial State
  const [testimonials, setTestimonials] = useState<AppTestimonial[]>([]);
  const [newTestimonialText, setNewTestimonialText] = useState('');
  const [newRating, setNewRating] = useState(0);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [currentUser] = useState(getCurrentUser());

  useEffect(() => {
    loadVideos();
    loadTestimonials();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const loadVideos = async () => {
    try {
      const data = await getVideos();
      setVideos(data);
    } catch (err) {
      console.error("Failed to load videos", err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTestimonials = async () => {
    const data = await getAppTestimonials();
    setTestimonials(data);
  };

  const handleTestimonialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newRating === 0 || !newTestimonialText.trim()) return;

    setIsSubmittingReview(true);
    try {
      let userName = 'Pengunjung';
      let userAvatar = '';
      let userAvatarBg = '';
      let isAnonymous = true;

      if (currentUser) {
        userName = currentUser.displayName || 'User';
        userAvatar = currentUser.photoURL || '';
        isAnonymous = false;
      } else {
        const visitorId = getVisitorId();
        const avatar = generateAvatar(visitorId);
        userName = avatar.label;
        userAvatar = avatar.emoji;
        userAvatarBg = avatar.bgClass;
      }

      const testimonial: AppTestimonial = {
        id: crypto.randomUUID(),
        text: newTestimonialText,
        rating: newRating,
        userName,
        userAvatar,
        userAvatarBg,
        createdAt: Date.now(),
        isAnonymous
      };

      await addAppTestimonial(testimonial);
      setNewTestimonialText('');
      setNewRating(0);
      loadTestimonials(); // Refresh list
    } catch (e) {
      console.error(e);
      alert('Gagal mengirim ulasan.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const filteredVideos = videos.filter(v => 
    v.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    v.caption.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredVideos.length / ITEMS_PER_PAGE);
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentVideos = filteredVideos.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="min-h-screen pb-12">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800 py-20 md:py-32 px-4 overflow-hidden relative">
        {/* Background Accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto max-w-5xl relative z-10">
          
          {/* Text Only - Clean Layout */}
          <div className="flex flex-col items-center justify-center text-center mb-12">
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white drop-shadow-sm leading-[1.1] mb-6">
              Screening Online <br /> 
              <span className="text-pink-500">Film Dokumenter 2025</span>
            </h1>
            
            <div className="h-1.5 w-32 bg-pink-500 rounded-full mb-8 opacity-90 shadow-[0_0_15px_rgba(236,72,153,0.5)]"></div>
            
            <p className="text-lg md:text-xl text-slate-400 font-light leading-relaxed max-w-2xl mx-auto">
              Kumpulan karya film dokumenter mata kuliah videografi 2025. Tonton, apresiasi, dan sebarkan inspirasi!
            </p>
            
          </div>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative group mt-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-500 group-focus-within:text-pink-500 transition-colors" />
            </div>
            <input
              type="text"
              className="block w-full pl-14 pr-6 py-5 border border-slate-700 rounded-full leading-5 bg-slate-900/80 backdrop-blur-md text-slate-200 placeholder-slate-500 focus:outline-none focus:bg-slate-900 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-lg transition-all shadow-2xl hover:bg-slate-900 hover:border-slate-600"
              placeholder="Cari judul film, sutradara, atau kata kunci..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

        </div>
      </div>

      {/* Grid Section */}
      <div className="container mx-auto px-4 py-12">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <Loader2 className="w-10 h-10 animate-spin mb-4 text-pink-500" />
            <p>Memuat galeri video...</p>
          </div>
        ) : filteredVideos.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {currentVideos.map((video) => (
                <VideoCard 
                  key={video.id} 
                  video={video} 
                  onUpdate={loadVideos}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-col items-center mt-16 space-y-4 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-center gap-2 p-1 bg-slate-900/50 rounded-xl border border-slate-800 shadow-lg">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-3 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <div className="flex gap-1 px-2 overflow-x-auto max-w-[200px] md:max-w-none scrollbar-hide">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`w-10 h-10 shrink-0 rounded-lg font-bold text-sm transition-all ${
                          currentPage === page
                            ? 'bg-pink-600 text-white shadow-lg shadow-pink-500/25 scale-110'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-3 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
                
                <p className="text-slate-500 text-xs uppercase tracking-widest">
                  Halaman {currentPage} dari {totalPages}
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 animate-in zoom-in duration-300">
             <div className="inline-flex p-6 rounded-full bg-slate-900/50 mb-6 border border-slate-800 shadow-xl">
               <Search className="w-12 h-12 text-slate-600" />
             </div>
             <h3 className="text-2xl font-bold text-slate-300 mb-2">Tidak ada video ditemukan</h3>
             <p className="text-slate-500">Coba gunakan kata kunci pencarian yang lain.</p>
          </div>
        )}
      </div>

      {/* --- TESTIMONIALS SECTION (NEW) --- */}
      <div className="border-t border-slate-800 bg-slate-950/50 relative">
        <div className="container mx-auto px-4 py-20 max-w-6xl">
           <div className="flex flex-col items-center text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-4 border border-indigo-500/20">
                 <MessageSquareQuote className="w-4 h-4" /> Feedback
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Apa Kata Penonton?</h2>
              <p className="text-slate-400 max-w-xl">
                 Berikan dukungan, kritik, dan saran untuk platform DocuTube agar semakin baik ke depannya.
              </p>
           </div>

           {/* Testimonial Grid */}
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {testimonials.map((t) => (
                 <div key={t.id} className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 p-6 rounded-2xl flex flex-col shadow-lg hover:border-slate-700 transition-all">
                    <div className="flex items-center gap-3 mb-4">
                       {t.isAnonymous || !t.userAvatar || t.userAvatar.length < 5 ? (
                          <div className={`w-10 h-10 rounded-full ${t.userAvatarBg || 'bg-slate-700'} flex items-center justify-center text-lg border border-slate-700 shadow-inner`}>
                             {t.userAvatar || '👤'}
                          </div>
                       ) : (
                          <img src={t.userAvatar} alt={t.userName} className="w-10 h-10 rounded-full border border-slate-700 object-cover" />
                       )}
                       <div>
                          <h4 className="font-bold text-white text-sm">{t.userName}</h4>
                          <div className="flex gap-0.5">
                             {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`w-3 h-3 ${i < t.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-700'}`} />
                             ))}
                          </div>
                       </div>
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed italic relative">
                       <span className="text-4xl absolute -top-4 -left-2 text-indigo-500/20 font-serif">"</span>
                       {t.text}
                    </p>
                 </div>
              ))}
           </div>

           {/* Add Testimonial Form */}
           <div className="max-w-xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-20 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
              
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2 relative z-10">
                 <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" /> Beri Ulasan Anda
              </h3>
              
              <form onSubmit={handleTestimonialSubmit} className="space-y-4 relative z-10">
                 <div className="flex gap-2 justify-center py-4 bg-slate-950/50 rounded-xl border border-slate-800 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                       <button
                          key={star}
                          type="button"
                          onClick={() => setNewRating(star)}
                          className={`p-2 transition-transform hover:scale-110 focus:outline-none ${newRating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-slate-700 hover:text-yellow-400'}`}
                       >
                          <Star className="w-8 h-8" />
                       </button>
                    ))}
                 </div>
                 
                 <textarea
                    value={newTestimonialText}
                    onChange={(e) => setNewTestimonialText(e.target.value)}
                    placeholder="Tulis pendapatmu tentang platform ini..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none h-32"
                 />
                 
                 <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Mengirim sebagai: <strong>{currentUser ? currentUser.displayName : 'Pengunjung (Anonim)'}</strong></span>
                    <button 
                       type="submit"
                       disabled={newRating === 0 || !newTestimonialText.trim() || isSubmittingReview}
                       className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-indigo-500/25"
                    >
                       {isSubmittingReview ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                       Kirim
                    </button>
                 </div>
              </form>
           </div>
        </div>
      </div>
    </main>
  );
};
