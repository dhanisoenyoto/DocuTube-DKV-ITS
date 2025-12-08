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
    // Keep loading true for at least a beat to show UI stability or waiting for DB
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
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800 py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
            Screening Online <br className="hidden md:block" /> Film Dokumenter 2025
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Berikut adalah kumpulan dari film dokumenter mata kuliah videografi 2025, tonton, apresiasi, dan sebarkan!
          </p>
          
          <div className="max-w-md mx-auto relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-3 border border-slate-700 rounded-full leading-5 bg-slate-900/50 text-slate-300 placeholder-slate-500 focus:outline-none focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all shadow-xl"
              placeholder="Cari video..."
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
            <Loader2 className="w-10 h-10 animate-spin mb-4 text-indigo-500" />
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
              <div className="flex flex-col items-center mt-12 space-y-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-slate-800 transition-all"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <div className="flex gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`w-10 h-10 rounded-lg border font-medium transition-all ${
                          currentPage === page
                            ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/25'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-indigo-500'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-slate-800 transition-all"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
                
                <p className="text-slate-500 text-sm">
                  Menampilkan halaman {currentPage} dari {totalPages}
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
             <div className="inline-block p-4 rounded-full bg-slate-900 mb-4">
               <Search className="w-8 h-8 text-slate-600" />
             </div>
             <h3 className="text-xl font-medium text-slate-300">Tidak ada video ditemukan</h3>
             <p className="text-slate-500 mt-2">Coba kata kunci pencarian yang lain.</p>
          </div>
        )}
      </div>
    </main>
  );
};
