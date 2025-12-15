
import React, { useRef, useState, useEffect } from 'react';
import { X, Download, Instagram, PlayCircle, Star, ExternalLink, Loader2, Sparkles, Smartphone } from 'lucide-react';
import html2canvas from 'html2canvas';

interface ShareAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareAppModal: React.FC<ShareAppModalProps> = ({ isOpen, onClose }) => {
  const storyRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [isLoadingImage, setIsLoadingImage] = useState(true);

  // Cinematic Background Image (Unsplash)
  // Using a specific ID that represents filmmaking/cinema
  const IMG_URL = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=600"; 

  // Pre-load image as Base64 to ensure html2canvas can render it without CORS issues
  useEffect(() => {
    if (isOpen) {
      setIsLoadingImage(true);
      const loadImage = async () => {
        try {
          const response = await fetch(IMG_URL);
          const blob = await response.blob();
          const reader = new FileReader();
          reader.onloadend = () => {
            setBase64Image(reader.result as string);
            setIsLoadingImage(false);
          };
          reader.readAsDataURL(blob);
        } catch (error) {
          console.error("Error loading image for canvas:", error);
          // Fallback: stop loading, will show gradient
          setIsLoadingImage(false);
        }
      };
      loadImage();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDownload = async () => {
    if (!storyRef.current) return;
    setIsGenerating(true);

    try {
      // 1. Wait a bit for any fonts/images to settle
      await new Promise(resolve => setTimeout(resolve, 500));

      // 2. Capture canvas
      const canvas = await html2canvas(storyRef.current, {
        scale: 2, // 2x resolution for sharpness
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#0f172a', // Slate-900 fallback
        logging: false,
      });

      // 3. Download
      const image = canvas.toDataURL("image/png", 1.0);
      const link = document.createElement('a');
      link.download = `DocuTube-Story-${Date.now()}.png`;
      link.href = image;
      link.click();
    } catch (error) {
      console.error("Failed to generate image", error);
      alert("Gagal membuat gambar. Silakan coba lagi atau screenshot manual.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-in fade-in duration-300">
      
      {/* Container */}
      <div className="relative w-full max-w-6xl h-[90vh] bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl flex flex-col md:flex-row overflow-hidden">
        
        {/* Close Button */}
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
              Ratio 9:16 (360x640 base size for mobile simulation)
           */}
           <div className="relative shadow-2xl rounded-2xl overflow-hidden ring-8 ring-slate-800">
             <div 
               ref={storyRef}
               className="relative w-[360px] h-[640px] bg-slate-950 overflow-hidden flex flex-col text-white select-none"
               style={{ 
                 fontFamily: 'system-ui, -apple-system, sans-serif',
                 background: 'linear-gradient(180deg, #1e1b4b 0%, #0f172a 100%)',
               }}
             >
                {/* Decorative Background Blobs */}
                <div className="absolute top-[-50px] right-[-50px] w-[300px] h-[300px] bg-purple-600/30 rounded-full blur-[80px]"></div>
                <div className="absolute bottom-[-50px] left-[-50px] w-[300px] h-[300px] bg-orange-600/30 rounded-full blur-[80px]"></div>
                
                {/* Content Wrapper */}
                <div className="relative z-10 flex flex-col h-full p-8">
                  
                  {/* Header: Brand */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/10">
                      <PlayCircle className="w-4 h-4 text-orange-400 fill-orange-400" />
                      <span className="font-bold text-sm tracking-wide">DocuTube ITS</span>
                    </div>
                    <div className="px-2 py-1 bg-orange-600 rounded text-[10px] font-bold tracking-wider uppercase shadow-lg shadow-orange-500/20">
                      New Release
                    </div>
                  </div>

                  {/* Main Visual: Poster Card */}
                  <div className="flex-1 flex flex-col justify-center">
                     <div className="relative bg-slate-900 rounded-2xl border border-slate-700/50 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform rotate-[-3deg] hover:rotate-0 transition-transform duration-700 mx-2 mb-8">
                        {/* Aspect Ratio Container */}
                        <div className="relative aspect-[4/5] bg-slate-800">
                           {isLoadingImage ? (
                              <div className="absolute inset-0 flex items-center justify-center">
                                 <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
                              </div>
                           ) : base64Image ? (
                              <img 
                                src={base64Image}
                                className="w-full h-full object-cover opacity-90"
                                alt="Cinema"
                              />
                           ) : (
                              // Fallback Gradient if image fails
                              <div className="w-full h-full bg-gradient-to-br from-indigo-900 to-slate-900 flex items-center justify-center">
                                  <PlayCircle className="w-20 h-20 text-white/10" />
                              </div>
                           )}
                           
                           {/* Overlay Vignette */}
                           <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent"></div>
                           
                           {/* Card Text */}
                           <div className="absolute bottom-5 left-5 right-5">
                              <div className="flex gap-1 mb-3">
                                 {[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />)}
                              </div>
                              <h2 className="font-black text-2xl leading-tight text-white mb-2 drop-shadow-lg">
                                 Screening Online<br/>
                                 <span className="text-orange-500">Dokumenter 2025</span>
                              </h2>
                              <p className="text-xs text-slate-300 font-medium line-clamp-2 opacity-90">
                                 Saksikan karya-karya terbaik mahasiswa DKV ITS sekarang.
                              </p>
                           </div>
                        </div>
                     </div>

                     {/* Hype Text */}
                     <div className="text-center space-y-2">
                        <div className="inline-flex items-center gap-2 text-xl font-black italic text-white tracking-tight drop-shadow-md">
                           <Sparkles className="w-5 h-5 text-yellow-400" />
                           NONTON GRATIS
                           <Sparkles className="w-5 h-5 text-yellow-400" />
                        </div>
                     </div>
                  </div>

                  {/* Bottom: Link Sticker Placeholder */}
                  <div className="mt-6 mb-8 flex flex-col items-center gap-3">
                     {/* The Sticker Itself */}
                     <div className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold text-sm shadow-[0_4px_15px_rgba(0,0,0,0.3)] flex items-center gap-2 transform -rotate-2">
                        <ExternalLink className="w-4 h-4" />
                        KLIK LINK DI SINI
                     </div>
                     
                     {/* Arrow Pointer */}
                     <div className="flex flex-col items-center animate-bounce">
                        <div className="w-0.5 h-6 bg-slate-500/50 rounded-full"></div>
                        <p className="text-[10px] font-mono text-slate-400 mt-2 bg-slate-900/50 px-2 py-1 rounded border border-slate-700/50">
                           dokumenter2025.online
                        </p>
                     </div>
                  </div>

                </div>
             </div>
           </div>
        </div>

        {/* --- RIGHT: INSTRUCTIONS & ACTIONS --- */}
        <div className="w-full md:w-[420px] bg-slate-900 border-l border-slate-800 p-8 flex flex-col overflow-y-auto">
           
           <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                 <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <Instagram className="w-8 h-8 text-white" />
                 </div>
                 <div>
                    <h2 className="text-xl font-bold text-white">Share to Story</h2>
                    <p className="text-sm text-slate-400">Bagikan & dukung karya temanmu!</p>
                 </div>
              </div>
              
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                 <p className="text-sm text-slate-300 leading-relaxed">
                    Karena keterbatasan Instagram Web, Anda perlu <strong>menyimpan gambar</strong> terlebih dahulu, lalu mengunggahnya manual ke Story.
                 </p>
              </div>
           </div>

           <div className="space-y-6 flex-1">
              {/* Step 1 */}
              <div className="flex gap-4">
                 <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-lg shadow-indigo-500/20">1</div>
                    <div className="w-0.5 h-full bg-slate-800 mt-2"></div>
                 </div>
                 <div className="pb-6">
                    <h4 className="font-bold text-white text-sm mb-1">Simpan Gambar</h4>
                    <p className="text-xs text-slate-400">Klik tombol download di bawah. Gambar desain Story (sebelah kiri) akan tersimpan ke galeri Anda.</p>
                 </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4">
                 <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-lg shadow-indigo-500/20">2</div>
                    <div className="w-0.5 h-full bg-slate-800 mt-2"></div>
                 </div>
                 <div className="pb-6">
                    <h4 className="font-bold text-white text-sm mb-1">Upload ke Instagram</h4>
                    <p className="text-xs text-slate-400">Buka aplikasi Instagram {'>'} Buat Story {'>'} Pilih gambar yang barusan didownload.</p>
                 </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4">
                 <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-lg shadow-indigo-500/20">3</div>
                 </div>
                 <div>
                    <h4 className="font-bold text-white text-sm mb-1">Pasang Link Sticker</h4>
                    <p className="text-xs text-slate-400 mb-2">
                       Pilih fitur <strong>Link</strong> di sticker tray, lalu tempel URL ini:
                    </p>
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
                    <p className="text-[10px] text-slate-500 mt-2 italic">
                       *Letakkan sticker link tepat di atas tombol "KLIK LINK DI SINI" agar terlihat interaktif.
                    </p>
                 </div>
              </div>
           </div>

           <div className="mt-8 pt-6 border-t border-slate-800">
              <button 
                 onClick={handleDownload}
                 disabled={isGenerating || isLoadingImage}
                 className="w-full py-4 bg-white hover:bg-slate-200 text-slate-900 font-extrabold rounded-xl flex items-center justify-center gap-3 transition-all transform active:scale-[0.99] shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                 {isGenerating ? (
                    <>
                       <Loader2 className="w-5 h-5 animate-spin" />
                       Generating Story...
                    </>
                 ) : (
                    <>
                       <Download className="w-5 h-5" />
                       Download Image
                    </>
                 )}
              </button>
           </div>
        </div>

      </div>
    </div>
  );
};
