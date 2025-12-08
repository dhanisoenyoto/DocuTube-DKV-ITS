
import React, { useEffect, useState } from 'react';
import { getVideos } from '../services/videoService';
import { VideoItem } from '../types';
import { VideoCard } from '../components/VideoCard';
import { Search } from 'lucide-react';

export const HomePage: React.FC = () => {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = () => {
    const data = getVideos();
    setVideos(data);
  };

  const filteredVideos = videos.filter(v => 
    v.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    v.caption.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800 py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            Screening Online Dokumenter 2025
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
        {filteredVideos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredVideos.map((video) => (
              <VideoCard 
                key={video.id} 
                video={video} 
                onUpdate={loadVideos}
              />
            ))}
          </div>
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