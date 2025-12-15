
import React, { useRef, useState, useEffect } from 'react';
import { X, Download, Instagram, PlayCircle, Star, ExternalLink, Loader2, Sparkles, RefreshCw, Film } from 'lucide-react';
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
  const [displayVideos, setDisplayVideos] = useState<VideoItem[]>([]);

  // Helper: Shuffle Array
  const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

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

  const generateLayout = async () => {
    setIsLoadingImages(true);
    try {
      // 1. Get real videos
      const videos = await getVideos();
      
      if (videos.length === 0) {
          setIsLoadingImages(false);
          return;
      }

      // 2. Shuffle and take top 5 for a "stacked" look
      const shuffled = shuffleArray(videos);
      const selected = shuffled.slice(0, 5);
      setDisplayVideos(selected);
      
      // 3. Convert thumbnails to Base64
      const promises = selected.map(v => urlToBase64(v.thumbnailUrl));
      const results = await Promise.all(promises);
      
      const validImages = results.filter((img): img is string => !!img);
      setProcessedThumbnails(validImages);
    } catch (error) {
      console.error("Error preparing story images:", error);
    } finally {
      setIsLoadingImages(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      generateLayout();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDownload = async () => {
    if (!storyRef.current) return;
    setIsGenerating(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // Wait for render
      const canvas = await html2canvas(storyRef.current, {
        scale: 2, // High Res
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
           
           <div className="flex items-center gap-4 mb-4">
               <h3 className="text-slate-400 text-sm font-medium uppercase tracking-widest hidden md:block">
                 Preview Tampilan Story
               </h3>
               <button 
                 onClick={generateLayout}
                 disabled={isLoadingImages}
                 className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-white rounded-full transition-colors border border-slate-700"
               >
                 <RefreshCw className={`w-3 h-3 ${isLoadingImages ? 'animate-spin' : ''}`} />
                 Acak Tampilan
               </button>
           </div>

           {/* 
              Target Element for html2canvas. 
              Ratio 9:16 (360x640 base size)
           */}
           <div className="relative shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-2xl overflow-hidden ring-8 ring-slate-800">
             <div 
               ref={storyRef}
               className="relative w-[360px] h-[640px] bg-slate-950 overflow-hidden flex flex-col text-white select-none"
               style={{ 
                 fontFamily: 'system-ui, -apple-system, sans-serif',
                 backgroundImage: 'linear-gradient(to bottom, #020617, #1e1b4b)',
               }}
             >
                {/* Abstract Background Shapes */}
                <div className="absolute top-[-100px] left-[-50px] w-[300px] h-[300px] bg-orange-600/20 rounded-full blur-[80px]"></div>
                <div className="absolute bottom-[-50px] right-[-50px] w-[400px] h-[400px] bg-indigo-600/20 rounded-full blur-[100px]"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/noise.png')] opacity-10 mix-blend-overlay"></div>

                {/* Content Wrapper */}
                <div className="relative z-10 flex flex-col h-full">
                  
                  {/* Top Header */}
                  <div className="pt-8 px-6 pb-2 flex items-center justify-between">
                     <div className="flex flex-col">
                        <span className="text-[10px] tracking-[0.3em] font-bold text-orange-500 uppercase">Screening Online</span>
                        <span className="text-xl font-black italic tracking-tighter text-white">DOCUTUBE</span>
                     </div>
                     <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center bg-white/5 backdrop-blur-md">
                        <PlayCircle className="w-5 h-5 text-white" />
                     </div>
                  </div>

                  {/* Creative Grid Layout (Staggered/Masonry feel) */}
                  <div className="flex-1 relative overflow-hidden flex flex-col justify-center">
                      {/* Rotated Container */}
                      <div className="transform -rotate-[6deg] scale-110 translate-x-2 w-full">
                         <div className="grid grid-cols-2 gap-3 px-4">
                            {/* Column 1 (Shifted Up) */}
                            <div className="flex flex-col gap-3 -mt-8">
                               {isLoadingImages ? (
                                  <div className="w-full aspect-[3/4] bg-slate-800 rounded-lg animate-pulse"></div>
                               ) : processedThumbnails[0] ? (
                                  <div className="relative group rounded-lg overflow-hidden shadow-2xl border border-white/10">
                                     <img src={processedThumbnails[0]} className="w-full aspect-[3/4] object-cover opacity-90" alt="thumb" />
                                     <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-60"></div>
                                  </div>
                               ) : null}
                               {processedThumbnails[2] && (
                                  <div className="relative group rounded-lg overflow-hidden shadow-2xl border border-white/10">
                                     <img src={processedThumbnails[2]} className="w-full aspect-video object-cover opacity-90" alt="thumb" />
                                  </div>
                               )}
                            </div>

                            {/* Column 2 (Shifted Down) */}
                            <div className="flex flex-col gap-3 mt-8">
                               {isLoadingImages ? (
                                  <div className="w-full aspect-[3/4] bg-slate-800 rounded-lg animate-pulse"></div>
                               ) : processedThumbnails[1] ? (
                                  <div className="relative group rounded-lg overflow-hidden shadow-2xl border border-white/10">
                                     <img src={processedThumbnails[1]} className="w-full aspect-[3/4] object-cover opacity-90" alt="thumb" />
                                     <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-60"></div>
                                  </div>
                               ) : null}
                               {processedThumbnails[3] && (
                                  <div className="relative group rounded-lg overflow-hidden shadow-2xl border border-white/10">
                                     <img src={processedThumbnails[3]} className="w-full aspect-square object-cover opacity-90" alt="thumb" />
                                  </div>
                               )}
                            </div>
                         </div>
                      </div>

                      {/* Foreground Text Overlay */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20">
                         <div className="bg-black/30 backdrop-blur-sm p-4 w-full text-center border-y border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)] transform rotate-[-2deg]">
                            <h2 className="text-4xl font-black text-white leading-none drop-shadow-[0_4px_0_rgba(0,0,0,0.5)] tracking-tight">
                               2025 <span className="text-orange-500">DKV ITS</span>
                            </h2>
                            <div className="flex items-center justify-center gap-2 mt-1">
                               <Sparkles className="w-4 h-4 text-yellow-400 fill-yellow-400 animate-pulse" />
                               <span className="text-sm font-bold tracking-widest uppercase text-slate-200">Official Selection</span>
                               <Sparkles className="w-4 h-4 text-yellow-400 fill-yellow-400 animate-pulse" />
                            </div>
                         </div>
                      </div>
                  </div>

                  {/* Bottom Area */}
                  <div className="pb-12 px-8 flex flex-col items-center z-30">
                     <div className="w-full bg-white/95 text-slate-900 py-3 rounded-xl font-bold text-center shadow-[0_0_20px_rgba(255,255,255,0.2)] flex items-center justify-center gap-2 text-sm">
                        <ExternalLink className="w-4 h-4" />
                        TONTON DI SINI
                     </div>
                     <div className="flex flex-col items-center mt-2">
                        <div className="w-[1px] h-6 bg-slate-500/50"></div>
                        <div className="bg-slate-900/80 px-3 py-1 rounded-md border border-slate-700/50 backdrop-blur-md">
                           <span className="text-[10px] font-mono text-orange-400 tracking-wide">dokumenter2025.online</span>
                        </div>
                     </div>
                  </div>

                </div>
             </div>
           </div>
        </div>

        {/* --- RIGHT: INSTRUCTIONS --- */}
        <div className="w-full md:w-[420px] bg-slate-900 border-l border-slate-800 p-8 flex flex-col overflow-y-auto">
           <div className="mb-6">
              <div className="flex items-center gap-4 mb-4">
                 <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <Instagram className="w-8 h-8 text-white" />
                 </div>
                 <div>
                    <h2 className="text-xl font-bold text-white">Share to Story</h2>
                    <p className="text-sm text-slate-400">Bagikan karya mahasiswa DKV ITS</p>
                 </div>
              </div>
              <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700 text-xs text-slate-400">
                 <p>Klik tombol <strong>"Acak Tampilan"</strong> di atas preview untuk mendapatkan kombinasi video yang berbeda.</p>
              </div>
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
