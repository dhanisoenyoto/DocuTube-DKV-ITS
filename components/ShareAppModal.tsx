
import React, { useRef, useState, useEffect } from 'react';
import { X, Download, Instagram, Play, Star, ExternalLink, Loader2, Sparkles, RefreshCw, Film, Aperture, Share } from 'lucide-react';
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
  const [videoTitles, setVideoTitles] = useState<string[]>([]);
  const [canShareFiles, setCanShareFiles] = useState(false);

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
      const videos = await getVideos();
      
      if (videos.length === 0) {
          setIsLoadingImages(false);
          return;
      }

      // Shuffle and pick 3 videos for the poster
      const shuffled = shuffleArray(videos);
      const selected = shuffled.slice(0, 3);
      
      setVideoTitles(selected.map(v => v.title));

      // Convert thumbnails to Base64
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
      // Check if navigator.share supports files
      if (navigator.canShare && navigator.share) {
         const testFile = new File(["foo"], "foo.txt", { type: "text/plain" });
         setCanShareFiles(navigator.canShare({ files: [testFile] }));
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSmartShare = async () => {
    if (!storyRef.current) return;
    setIsGenerating(true);

    try {
      // 1. Wait for rendering stability
      await new Promise(resolve => setTimeout(resolve, 500)); 

      // 2. Generate Canvas
      const canvas = await html2canvas(storyRef.current, {
        scale: 3, // Ultra High Res
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#020617',
        logging: false,
      });

      const dataUrl = canvas.toDataURL("image/png", 1.0);

      // 3. Logic: Direct Share vs Download
      if (canShareFiles) {
        // --- MOBILE / SUPPORTED BROWSERS ---
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], 'docutube-story.png', { type: 'image/png' });
        
        await navigator.share({
            files: [file],
            title: 'DocuTube Poster',
            text: 'Nonton film dokumenter karya DKV ITS 2025! 🎬 #DocuTube',
        });
      } else {
        // --- DESKTOP / UNSUPPORTED ---
        const link = document.createElement('a');
        link.download = `DocuTube-Poster-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
      }

    } catch (error) {
      console.error("Failed to process image", error);
      alert("Gagal memproses gambar. Silakan coba lagi atau screenshot manual.");
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
                 Poster Preview (9:16)
               </h3>
               <button 
                 onClick={generateLayout}
                 disabled={isLoadingImages}
                 className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-white rounded-full transition-colors border border-slate-700 shadow-lg"
               >
                 <RefreshCw className={`w-3 h-3 ${isLoadingImages ? 'animate-spin' : ''}`} />
                 Shuffle Film
               </button>
           </div>

           {/* 
              Target Element for html2canvas. 
              Ratio 9:16 (360x640 base size for logic, scaled up for export)
           */}
           <div className="relative shadow-[0_20px_60px_rgba(0,0,0,0.8)] rounded-xl overflow-hidden ring-1 ring-slate-800">
             <div 
               ref={storyRef}
               className="relative w-[360px] h-[640px] bg-black overflow-hidden flex flex-col text-white select-none"
               style={{ 
                 fontFamily: 'system-ui, -apple-system, sans-serif',
               }}
             >
                {/* --- LAYER 1: CINEMATIC BACKGROUND --- */}
                {processedThumbnails[0] && (
                  <div className="absolute inset-0 z-0">
                    <img src={processedThumbnails[0]} className="w-full h-full object-cover opacity-60 grayscale-[30%] contrast-125 scale-110 blur-sm" alt="bg" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black"></div>
                  </div>
                )}

                {/* --- LAYER 2: TEXTURE OVERLAYS (NOISE & DUST) --- */}
                <div className="absolute inset-0 z-[1] opacity-20 pointer-events-none mix-blend-overlay" 
                     style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
                </div>

                {/* --- LAYER 3: CONTENT COMPOSITION --- */}
                <div className="relative z-10 flex flex-col h-full p-6">
                  
                  {/* Header */}
                  <div className="flex justify-between items-start border-b border-white/20 pb-4">
                     <div>
                        <div className="flex items-center gap-1 text-[8px] font-bold tracking-[0.4em] text-orange-500 uppercase mb-1">
                           <Play className="w-2 h-2 fill-orange-500" /> Official Selection
                        </div>
                        <h1 className="text-3xl font-black italic tracking-tighter leading-none text-white drop-shadow-lg">
                           DKV ITS<br/>2025
                        </h1>
                     </div>
                     <div className="text-right">
                        <div className="text-[10px] text-slate-300 font-mono">EST.</div>
                        <div className="text-xl font-bold">MMXXV</div>
                     </div>
                  </div>

                  {/* Dynamic Photo Collage */}
                  <div className="flex-1 relative flex items-center justify-center perspective-[1000px]">
                     
                     {/* Image 2 (Back) */}
                     {processedThumbnails[1] && (
                        <div className="absolute w-56 aspect-[4/5] transform -rotate-6 -translate-x-8 translate-y-4 shadow-2xl border-4 border-white bg-white z-10 brightness-75">
                           <img src={processedThumbnails[1]} className="w-full h-full object-cover" alt="img2" />
                           <div className="absolute bottom-2 left-2 right-2 text-[8px] text-black font-bold uppercase truncate px-1">
                              {videoTitles[1]}
                           </div>
                        </div>
                     )}

                     {/* Image 3 (Front/Hero) */}
                     {processedThumbnails[2] && (
                        <div className="absolute w-60 aspect-[4/5] transform rotate-3 translate-x-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-4 border-white bg-white z-20">
                           <img src={processedThumbnails[2]} className="w-full h-full object-cover contrast-110" alt="img3" />
                           {/* Shine Effect */}
                           <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none"></div>
                           
                           {/* Label Tag */}
                           <div className="absolute -bottom-4 -right-4 bg-orange-600 text-white px-3 py-1 text-xs font-bold uppercase tracking-widest shadow-lg transform -rotate-2">
                              Now Showing
                           </div>
                        </div>
                     )}

                     {/* Main Title Overlay */}
                     <div className="absolute z-30 top-1/2 left-0 right-0 -translate-y-1/2 text-center pointer-events-none mix-blend-difference">
                        <span className="text-5xl font-black text-white tracking-widest uppercase opacity-20 blur-[1px]">
                           CINEMA
                        </span>
                     </div>
                  </div>

                  {/* Footer / CTA */}
                  <div className="pt-6">
                     <div className="flex items-end justify-between mb-4">
                        <div>
                           <div className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Presents by</div>
                           <div className="text-sm font-bold text-white flex items-center gap-1">
                              <Aperture className="w-4 h-4 text-orange-500" />
                              Videografi Dept.
                           </div>
                        </div>
                        <div className="flex gap-1">
                           {[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 text-orange-500 fill-orange-500" />)}
                        </div>
                     </div>

                     {/* CTA Button Visual */}
                     <div className="w-full bg-white text-black py-4 px-6 rounded-none flex items-center justify-between font-black tracking-wider uppercase transform skew-x-[-10deg] shadow-[5px_5px_0px_rgba(234,88,12,1)]">
                        <div className="transform skew-x-[10deg] flex items-center gap-2">
                           <Play className="w-5 h-5 fill-black" />
                           Watch Online
                        </div>
                        <div className="transform skew-x-[10deg] text-[10px] font-mono border border-black px-1 rounded">
                           FREE
                        </div>
                     </div>
                     
                     <div className="text-center mt-3">
                        <span className="text-[10px] font-mono text-slate-400 tracking-[0.2em] uppercase">
                           dokumenter2025.online
                        </span>
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
                 <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg border border-white/10">
                    <Instagram className="w-7 h-7 text-white" />
                 </div>
                 <div>
                    <h2 className="text-xl font-bold text-white">Share to Story</h2>
                    <p className="text-sm text-slate-400">Bagikan poster film ini ke teman-temanmu.</p>
                 </div>
              </div>
           </div>

           <div className="space-y-6 flex-1">
              <div className="flex gap-4">
                 <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 text-white font-bold flex items-center justify-center text-sm">1</div>
                    <div className="w-0.5 h-full bg-slate-800 mt-2"></div>
                 </div>
                 <div>
                    <h4 className="font-bold text-white text-sm mb-1">Poster Ready!</h4>
                    <p className="text-xs text-slate-400">Poster sinematik sudah dibuatkan otomatis untukmu dari koleksi film yang ada.</p>
                 </div>
              </div>

              <div className="flex gap-4">
                 <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 text-white font-bold flex items-center justify-center text-sm">2</div>
                    <div className="w-0.5 h-full bg-slate-800 mt-2"></div>
                 </div>
                 <div>
                    <h4 className="font-bold text-white text-sm mb-1">{canShareFiles ? 'Share Langsung' : 'Download & Upload'}</h4>
                    <p className="text-xs text-slate-400">
                      {canShareFiles 
                        ? 'Klik tombol Share untuk langsung membuka Instagram Story.' 
                        : 'Simpan gambar ke galeri, lalu buka Instagram dan upload ke Story.'}
                    </p>
                 </div>
              </div>

              <div className="flex gap-4">
                 <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 text-white font-bold flex items-center justify-center text-sm">3</div>
                 </div>
                 <div>
                    <h4 className="font-bold text-white text-sm mb-1">Add Link Sticker</h4>
                    <p className="text-xs text-slate-400 mb-2">Jangan lupa tempel link ini di Story-mu:</p>
                    <div 
                      onClick={() => {
                        navigator.clipboard.writeText('https://dokumenter2025.online');
                        alert('Link tersalin!');
                      }}
                      className="bg-slate-950 border border-slate-800 rounded-lg p-3 flex items-center justify-between cursor-pointer hover:border-orange-500 group transition-colors shadow-inner"
                    >
                       <code className="text-orange-400 font-mono text-xs">dokumenter2025.online</code>
                       <span className="text-[10px] font-bold text-slate-500 group-hover:text-white uppercase flex items-center gap-1">
                          <ExternalLink className="w-3 h-3" /> Copy
                       </span>
                    </div>
                 </div>
              </div>
           </div>

           <div className="mt-8 pt-6 border-t border-slate-800">
              <button 
                 onClick={handleSmartShare}
                 disabled={isGenerating || isLoadingImages}
                 className={`w-full py-4 font-extrabold rounded-xl flex items-center justify-center gap-3 transition-all transform active:scale-[0.99] shadow-[0_0_20px_rgba(255,255,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed border-2 border-white ${
                    canShareFiles 
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white' 
                        : 'bg-white hover:bg-slate-200 text-slate-900'
                 }`}
              >
                 {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : canShareFiles ? <Share className="w-5 h-5" /> : <Download className="w-5 h-5" />}
                 {isGenerating ? 'Memproses...' : canShareFiles ? 'Share to Instagram Story' : 'Download Poster HD'}
              </button>
           </div>
        </div>

      </div>
    </div>
  );
};
