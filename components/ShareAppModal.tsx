
import React, { useRef, useState, useEffect } from 'react';
import { X, Download, Instagram, PlayCircle, Star, ExternalLink, Loader2, Sparkles, Film, Grid } from 'lucide-react';
import html2canvas from 'html2canvas';
import { getVideos } from '../services/videoService';
import { VideoItem } from '../types';

interface ShareAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareAppModal: React.FC<ShareAppModalProps> = ({ isOpen, onClose }) => {
  const storyRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [processedThumbnails, setProcessedThumbnails] = useState<string[]>([]);
  const [isLoadingImages, setIsLoadingImages] = useState(true);

  // Helper: Convert URL to Base64 to bypass CORS in html2canvas
  const urlToBase64 = async (url: string): Promise<string | null> => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      console.warn("Failed to convert image:", url);
      return null;
    }
  };

  useEffect(() => {
    if (isOpen) {
      setIsLoadingImages(true);
      const prepareImages = async () => {
        try {
          // 1. Get real videos
          const videos = await getVideos();
          
          // 2. Take top 4 videos (or random) for the grid
          const topVideos = videos.slice(0, 4);
          
          // 3. Convert all thumbnails to Base64 in parallel
          const promises = topVideos.map(v => urlToBase64(v.thumbnailUrl));
          const results = await Promise.all(promises);
          
          // Filter out failed loads
          const validImages = results.filter((img): img is string => !!img);
          setProcessedThumbnails(validImages);
        } catch (error) {
          console.error("Error preparing story images:", error);
        } finally {
          setIsLoadingImages(false);
        }
      };
      prepareImages();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDownload = async () => {
    if (!storyRef.current) return;
    setIsGenerating(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // Wait for render
      const canvas = await html2canvas(storyRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#0f172a',
        logging: false,
      });

      const image = canvas.toDataURL("image/png", 1.0);
      const link = document.createElement('a');
      link.download = `DocuTube-Story-${Date.now()}.png`;
      link.href = image;
      link.click();
    } catch (error) {
      console.error("Failed to generate image", error);
      alert("Gagal membuat gambar. Silakan screenshot manual.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-in fade-in duration-300">
      
      <div className="relative w-full max-w-6xl h-[90vh] bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl flex flex-col md:flex-row overflow-hidden">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2 bg-black/60 hover:bg-black/80 rounded-full text-white transition-colors border border-white/10"
        >
          <X className="w-6 h-6" />
        </button>

        {/* --- LEFT: CANVAS PREVIEW AREA --- */}
        <div className="flex-1 bg-slate-950 relative overflow-hidden flex flex-col items-center justify-center p-6 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]">
           
           <h3 className="text-slate-400 text-sm mb-4 font-medium uppercase tracking-widest hidden md:block">
             Preview Tampilan Story
           </h3>

           {/* 
              Target Element for html2canvas. 
              Ratio 9:16 (360x640 base size)
           */}
           <div className="relative shadow-2xl rounded-2xl overflow-hidden ring-8 ring-slate-800">
             <div 
               ref={storyRef}
               className="relative w-[360px] h-[640px] bg-slate-950 overflow-hidden flex flex-col text-white select-none"
               style={{ 
                 fontFamily: 'system-ui, -apple-system, sans-serif',
                 background: 'linear-gradient(180deg, #0f172a 0%, #1e1b4b 100%)',
               }}
             >
                {/* Background Decor */}
                <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900 via-slate-950 to-slate-950"></div>
                
                {/* Content Wrapper */}
                <div className="relative z-10 flex flex-col h-full">
                  
                  {/* Header */}
                  <div className="p-6 pb-2 flex items-center justify-between z-20">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-full border border-white/10 shadow-lg">
                      <PlayCircle className="w-4 h-4 text-orange-400 fill-orange-400" />
                      <span className="font-bold text-sm tracking-wide">DocuTube ITS</span>
                    </div>
                    <div className="px-2 py-1 bg-orange-600 rounded text-[10px] font-bold tracking-wider uppercase shadow-lg">
                      2025
                    </div>
                  </div>

                  {/* Thumbnail Grid */}
                  <div className="flex-1 p-4 flex flex-col gap-4 justify-center relative">
                     {/* Title Overlay */}
                     <div className="absolute top-10 left-0 w-full text-center z-30 pointer-events-none">
                        <h2 className="text-3xl font-black italic tracking-tighter text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] px-4 leading-none">
                           STREAMING <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">NOW</span>
                        </h2>
                     </div>

                     {/* The Grid */}
                     <div className="grid grid-cols-2 gap-3 transform rotate-[-2deg] scale-[0.95]">
                        {isLoadingImages ? (
                           // Loading Placeholders
                           Array(4).fill(0).map((_, i) => (
                              <div key={i} className="aspect-[4/5] bg-slate-800 rounded-xl animate-pulse border border-slate-700"></div>
                           ))
                        ) : processedThumbnails.length > 0 ? (
                           processedThumbnails.map((img, idx) => (
                              <div key={idx} className={`relative rounded-xl overflow-hidden shadow-2xl border border-slate-700/50 bg-slate-900 aspect-[4/5] ${idx % 2 === 0 ? 'translate-y-4' : ''}`}>
                                 <img src={img} className="w-full h-full object-cover opacity-80" alt="Thumb" />
                                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                                 <div className="absolute bottom-2 left-2 flex gap-0.5">
                                    <Star className="w-2 h-2 text-yellow-400 fill-yellow-400" />
                                    <Star className="w-2 h-2 text-yellow-400 fill-yellow-400" />
                                    <Star className="w-2 h-2 text-yellow-400 fill-yellow-400" />
                                 </div>
                              </div>
                           ))
                        ) : (
                           // Fallback if no videos found
                           <div className="col-span-2 aspect-[4/5] bg-slate-800 flex items-center justify-center rounded-xl border border-slate-700">
                              <Film className="w-12 h-12 text-slate-600" />
                           </div>
                        )}
                     </div>
                  </div>

                  {/* Footer CTA */}
                  <div className="p-8 pb-10 pt-2 flex flex-col items-center gap-3 z-20 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent mt-[-40px]">
                     <div className="bg-white text-slate-900 px-6 py-3 rounded-xl font-bold text-sm shadow-[0_0_30px_rgba(255,255,255,0.15)] flex items-center gap-2 transform rotate-1 animate-pulse border-2 border-slate-200">
                        <ExternalLink className="w-4 h-4" />
                        TONTON KARYA KAMI
                     </div>
                     
                     <div className="flex flex-col items-center">
                        <div className="w-0.5 h-6 bg-slate-600 rounded-full mb-1"></div>
                        <p className="text-[10px] font-mono text-orange-400 bg-slate-900/80 px-2 py-1 rounded border border-slate-800">
                           dokumenter2025.online
                        </p>
                     </div>
                  </div>

                </div>
             </div>
           </div>
        </div>

        {/* --- RIGHT: INSTRUCTIONS --- */}
        <div className="w-full md:w-[420px] bg-slate-900 border-l border-slate-800 p-8 flex flex-col overflow-y-auto">
           <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                 <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <Instagram className="w-8 h-8 text-white" />
                 </div>
                 <div>
                    <h2 className="text-xl font-bold text-white">Share to Story</h2>
                    <p className="text-sm text-slate-400">Tampilkan cuplikan karya di Instagram!</p>
                 </div>
              </div>
              <p className="text-sm text-slate-400 bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                 Gambar preview di samping dibuat otomatis dari video-video teratas yang ada di website ini.
              </p>
           </div>

           <div className="space-y-6 flex-1">
              <div className="flex gap-4">
                 <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-lg">1</div>
                    <div className="w-0.5 h-full bg-slate-800 mt-2"></div>
                 </div>
                 <div>
                    <h4 className="font-bold text-white text-sm mb-1">Simpan Gambar</h4>
                    <p className="text-xs text-slate-400">Download gambar layout thumbnail di samping.</p>
                 </div>
              </div>

              <div className="flex gap-4">
                 <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-lg">2</div>
                    <div className="w-0.5 h-full bg-slate-800 mt-2"></div>
                 </div>
                 <div>
                    <h4 className="font-bold text-white text-sm mb-1">Upload ke Story</h4>
                    <p className="text-xs text-slate-400">Upload gambar ke Instagram Story Anda.</p>
                 </div>
              </div>

              <div className="flex gap-4">
                 <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-lg">3</div>
                 </div>
                 <div>
                    <h4 className="font-bold text-white text-sm mb-1">Link Sticker</h4>
                    <p className="text-xs text-slate-400 mb-2">Tempel sticker link di area tombol putih:</p>
                    <div 
                      onClick={() => {
                        navigator.clipboard.writeText('https://dokumenter2025.online');
                        alert('Link tersalin!');
                      }}
                      className="bg-slate-950 border border-slate-800 rounded-lg p-3 flex items-center justify-between cursor-pointer hover:border-orange-500 group transition-colors"
                    >
                       <code className="text-orange-400 font-mono text-xs">https://dokumenter2025.online</code>
                       <span className="text-[10px] font-bold text-slate-500 group-hover:text-white uppercase">Copy</span>
                    </div>
                 </div>
              </div>
           </div>

           <div className="mt-8 pt-6 border-t border-slate-800">
              <button 
                 onClick={handleDownload}
                 disabled={isGenerating || isLoadingImages}
                 className="w-full py-4 bg-white hover:bg-slate-200 text-slate-900 font-extrabold rounded-xl flex items-center justify-center gap-3 transition-all transform active:scale-[0.99] shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                 {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                 {isGenerating ? 'Memproses...' : 'Download Image'}
              </button>
           </div>
        </div>

      </div>
    </div>
  );
};
