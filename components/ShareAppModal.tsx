
import React, { useRef, useState } from 'react';
import { X, Download, Instagram, PlayCircle, Star, ExternalLink, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';

interface ShareAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareAppModal: React.FC<ShareAppModalProps> = ({ isOpen, onClose }) => {
  const storyRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const handleDownload = async () => {
    if (!storyRef.current) return;
    setIsGenerating(true);

    try {
      // Create canvas with high scale for better resolution
      const canvas = await html2canvas(storyRef.current, {
        scale: 2, 
        useCORS: true, // Important for external images
        backgroundColor: '#020617', 
        logging: false,
        allowTaint: true,
      });

      // Convert and download
      const image = canvas.toDataURL("image/png", 1.0);
      const link = document.createElement('a');
      link.download = 'DocuTube-Story-Share.png';
      link.href = image;
      link.click();
    } catch (error) {
      console.error("Failed to generate image", error);
      alert("Gagal membuat gambar. Anda bisa melakukan screenshot manual sebagai alternatif.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="relative w-full max-w-5xl bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl flex flex-col md:flex-row overflow-hidden max-h-[90vh]">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors border border-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* --- PREVIEW AREA (The Canvas Source) --- */}
        <div className="flex-1 bg-slate-950 p-4 md:p-8 flex items-center justify-center overflow-y-auto bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
           
           {/* 
              Target Element for html2canvas. 
              Ratio 9:16 (360x640 base size for mobile feel)
           */}
           <div 
             ref={storyRef}
             className="relative w-[360px] h-[640px] shrink-0 bg-slate-950 overflow-hidden shadow-2xl text-white select-none flex flex-col"
             style={{ 
               fontFamily: 'sans-serif',
               backgroundImage: 'linear-gradient(to bottom right, #0f172a, #1e1b4b)',
             }}
           >
              {/* Background Accents (Orbs) */}
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-orange-500/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-purple-600/20 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2"></div>
              
              {/* Story Content */}
              <div className="relative z-10 flex flex-col h-full p-6">
                
                {/* Header Branding */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20">
                      <PlayCircle className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-lg tracking-tight">DocuTube</span>
                  </div>
                  <div className="px-2 py-1 bg-white/10 backdrop-blur rounded text-[10px] font-mono tracking-wider border border-white/10">
                    OFFICIAL SELECTION
                  </div>
                </div>

                {/* Main Visual: Video Card Mockup */}
                <div className="flex-1 flex flex-col justify-center gap-6">
                   <div className="relative bg-slate-900 rounded-2xl border border-slate-700/50 overflow-hidden shadow-2xl transform rotate-[-3deg] hover:rotate-0 transition-transform duration-500 mx-2">
                      <div className="relative aspect-[4/5]">
                         <img 
                           src="https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&q=80&w=600" 
                           className="w-full h-full object-cover opacity-90"
                           alt="Preview"
                           crossOrigin="anonymous"
                         />
                         {/* Overlay Gradient */}
                         <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                         
                         {/* Text on Image */}
                         <div className="absolute bottom-4 left-4 right-4">
                            <div className="flex gap-1 mb-2">
                               {[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />)}
                            </div>
                            <h2 className="font-bold text-xl leading-tight text-white mb-1 drop-shadow-md">Karya Dokumenter <br/>Terbaik Mahasiswa</h2>
                         </div>
                         
                         {/* Play Button Overlay */}
                         <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/40 shadow-lg">
                               <PlayCircle className="w-7 h-7 text-white fill-white/20" />
                            </div>
                         </div>
                      </div>
                   </div>

                   <div className="text-center space-y-1 mt-2">
                      <h3 className="text-2xl font-black italic text-white tracking-tighter drop-shadow-lg">
                         NONTON <span className="text-orange-500">GRATIS!</span>
                      </h3>
                      <p className="text-xs text-slate-300 font-light px-4 opacity-80">
                         Dukung sineas muda Indonesia berkarya.
                      </p>
                   </div>
                </div>

                {/* Bottom CTA Area (Designed for Link Sticker) */}
                <div className="mt-4 mb-8">
                   <div className="bg-white/95 text-slate-900 py-3 px-4 rounded-xl font-bold text-center shadow-[0_0_25px_rgba(255,255,255,0.2)] flex items-center justify-center gap-2 animate-pulse mx-4">
                      <ExternalLink className="w-4 h-4" />
                      KLIK LINK DI SINI
                   </div>
                   <div className="flex flex-col items-center mt-2">
                      <div className="w-[1px] h-6 bg-slate-500/50"></div>
                      <div className="bg-slate-800/80 backdrop-blur px-4 py-1 rounded-full border border-slate-600 mt-1">
                         <span className="text-[10px] font-mono text-orange-400 tracking-wider">dokumenter2025.online</span>
                      </div>
                   </div>
                </div>

              </div>
           </div>
        </div>

        {/* --- INSTRUCTIONS SIDEBAR --- */}
        <div className="w-full md:w-[400px] bg-slate-900 border-t md:border-t-0 md:border-l border-slate-800 p-8 flex flex-col justify-between">
           <div>
              <div className="flex items-center gap-3 mb-8">
                 <div className="p-3 bg-gradient-to-tr from-yellow-500 via-purple-500 to-indigo-500 rounded-xl shadow-lg">
                    <Instagram className="w-6 h-6 text-white" />
                 </div>
                 <div>
                    <h3 className="font-bold text-white text-lg">Share ke Instagram</h3>
                    <p className="text-xs text-slate-400">Ajak teman-temanmu menonton!</p>
                 </div>
              </div>

              <div className="space-y-6">
                 {/* Step 1 */}
                 <div className="relative pl-6 border-l-2 border-slate-800">
                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-800 border-2 border-slate-600 flex items-center justify-center">
                       <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-200">1. Simpan Gambar</h4>
                    <p className="text-xs text-slate-400 mt-1">Klik tombol download di bawah untuk menyimpan gambar preview tersebut ke galeri HP/Laptop.</p>
                 </div>

                 {/* Step 2 */}
                 <div className="relative pl-6 border-l-2 border-slate-800">
                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-800 border-2 border-slate-600 flex items-center justify-center">
                       <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-200">2. Upload ke Story</h4>
                    <p className="text-xs text-slate-400 mt-1">Buka Instagram Story, pilih gambar yang baru saja diunduh.</p>
                 </div>

                 {/* Step 3 */}
                 <div className="relative pl-6 border-l-2 border-slate-800">
                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-800 border-2 border-slate-600 flex items-center justify-center">
                       <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-200">3. Tambahkan Link</h4>
                    <p className="text-xs text-slate-400 mt-1">
                       Gunakan fitur <strong>Link Sticker</strong> dan tempel di area tombol putih.
                    </p>
                    <div className="mt-2 bg-slate-950 p-2 rounded border border-slate-800 flex items-center justify-between group cursor-pointer hover:border-orange-500/50 transition-colors"
                       onClick={() => {
                         navigator.clipboard.writeText('https://dokumenter2025.online');
                         alert('Link URL berhasil disalin!');
                       }}
                    >
                       <code className="text-orange-400 text-xs font-mono">https://dokumenter2025.online</code>
                       <span className="text-[10px] bg-slate-800 px-2 py-1 rounded text-slate-400 group-hover:text-white font-medium">Copy</span>
                    </div>
                 </div>
              </div>
           </div>

           <div className="mt-8 pt-6 border-t border-slate-800">
              <button 
                 onClick={handleDownload}
                 disabled={isGenerating}
                 className="w-full py-4 bg-white hover:bg-slate-200 text-slate-900 font-bold rounded-xl flex items-center justify-center gap-3 transition-all transform active:scale-[0.98] shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                 {isGenerating ? (
                    <Loader2 className="w-5 h-5 animate-spin text-slate-600" />
                 ) : (
                    <Download className="w-5 h-5" />
                 )}
                 {isGenerating ? 'Memproses Gambar...' : 'Simpan Gambar (Save Image)'}
              </button>
              <p className="text-center text-[10px] text-slate-500 mt-3">
                 Gambar akan tersimpan sebagai file PNG.
              </p>
           </div>
        </div>

      </div>
    </div>
  );
};
