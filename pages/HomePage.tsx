import React, { useEffect, useState } from 'react';
import { getVideos } from '../services/videoService';
import { VideoItem } from '../types';
import { VideoCard } from '../components/VideoCard';
import { Search, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

const ITEMS_PER_PAGE = 10;

export const HomePage: React.FC = () => {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadVideos();
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
    </main>
  );
};