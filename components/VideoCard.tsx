import React, { useState } from 'react';
import { VideoItem } from '../types';
import { Play, X, Clock, Trash2, Star, MessageCircle, Send, Share2, Copy } from 'lucide-react';
import { addRating, addComment, getAverageRating } from '../services/videoService';

interface VideoCardProps {
  video: VideoItem;
  isAdmin?: boolean;
  onDelete?: (id: string) => void;
  onUpdate?: () => void; // Trigger parent refresh
}

export const VideoCard: React.FC<VideoCardProps> = ({ video, isAdmin, onDelete, onUpdate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [userRating, setUserRating] = useState<number>(0); // For user input interaction
  const [hasRated, setHasRated] = useState(false);

  const avgRating = getAverageRating(video.ratings || []);
  const ratingCount = video.ratings?.length || 0;
  const comments = video.comments || [];

  const formattedDate = new Date(video.createdAt).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const handleRate = (rating: number) => {
    if (hasRated) return;
    addRating(video.id, rating);
    setHasRated(true);
    setUserRating(rating);
    if (onUpdate) onUpdate();
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    addComment(video.id, newComment);
    setNewComment('');
    if (onUpdate) onUpdate();
  };

  const handleWhatsAppShare = () => {
    const text = `Nonton Film Dokumenter: "${video.title}"\n\n"${video.caption.substring(0, 150)}..."\n\nTonton selengkapnya di DocuTube DKV ITS: ${window.location.href}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleNativeShare = async () => {
    const shareData = {
      title: `DocuTube: ${video.title}`,
      text: `Nonton film dokumenter "${video.title}" karya mahasiswa DKV ITS.\n\n${video.caption}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback for desktop/unsupported browsers
      const textToCopy = `${shareData.title}\n${shareData.text}\n${shareData.url}`;
      navigator.clipboard.writeText(textToCopy);
      alert('Info video dan Link berhasil disalin! Anda dapat menempelkannya di Instagram Story atau pesan lainnya.');
    }
  };

  return (
    <>
      <div className="group relative bg-slate-900 rounded-xl overflow-hidden border border-slate-800 hover:border-indigo-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 flex flex-col h-full">
        {/* Thumbnail Container */}
        <div 
          className="relative aspect-video overflow-hidden cursor-pointer"
          onClick={() => setIsOpen(true)}
        >
          <img 
            src={video.thumbnailUrl} 
            alt={video.title} 
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/50">
              <Play className="w-8 h-8 text-white fill-white ml-1" />
            </div>
          </div>
          
          {/* Badge Rating on Card */}
          <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-yellow-400 flex items-center gap-1">
            <Star className="w-3 h-3 fill-yellow-400" />
            {avgRating > 0 ? avgRating : '-'}
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-grow">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-lg text-slate-100 line-clamp-2 leading-tight hover:text-indigo-400 transition-colors cursor-pointer" onClick={() => setIsOpen(true)}>
              {video.title}
            </h3>
            {isAdmin && onDelete && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(video.id);
                }}
                className="text-slate-500 hover:text-red-500 p-1 transition-colors bg-slate-800 rounded hover:bg-slate-700"
                title="Hapus Video"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
          
          <p className="text-slate-400 text-sm line-clamp-2 mb-4 flex-grow cursor-pointer" onClick={() => setIsOpen(true)}>
            {video.caption}
          </p>
          
          <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-800">
            <div className="flex items-center gap-2 text-slate-500 text-xs">
              <Clock className="w-3 h-3" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-1 text-slate-500 text-xs">
              <MessageCircle className="w-3 h-3" />
              <span>{comments.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200 overflow-y-auto">
          <div className="relative w-full max-w-5xl bg-slate-950 rounded-2xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col max-h-[95vh]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800 shrink-0">
              <h3 className="font-semibold text-lg truncate pr-4 text-slate-100 max-w-[80%]">{video.title}</h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Video Player */}
            <div className="relative aspect-video w-full bg-black shrink-0">
              <iframe 
                src={video.embedUrl} 
                className="absolute inset-0 w-full h-full"
                allow="autoplay; encrypted-media; fullscreen"
                allowFullScreen
                title={video.title}
              />
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
                
                {/* Left: Details, Share & Rating */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Share Buttons */}
                  <div className="flex flex-wrap gap-3">
                    <button 
                      onClick={handleWhatsAppShare}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Share WhatsApp
                    </button>
                    <button 
                      onClick={handleNativeShare}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors border border-slate-700"
                    >
                      <Share2 className="w-4 h-4" />
                      Share to IG / Copy
                    </button>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-indigo-400 mb-2 uppercase tracking-wider">Tentang Video</h4>
                    <p className="text-slate-300 leading-relaxed whitespace-pre-wrap text-base">{video.caption}</p>
                  </div>

                  {/* Rating Section */}
                  <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-800">
                    <div className="flex items-center justify-between mb-3">
                       <h4 className="text-sm font-bold text-slate-300">Berikan Rating</h4>
                       <span className="text-xs text-slate-500 bg-slate-900 px-2 py-1 rounded-full border border-slate-800">{ratingCount} ulasan</span>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-4xl font-bold text-white tracking-tighter">{avgRating}</div>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => handleRate(star)}
                            disabled={hasRated}
                            className={`transition-all hover:scale-110 focus:outline-none p-1 ${hasRated ? 'cursor-default' : 'cursor-pointer'}`}
                          >
                            <Star 
                              className={`w-8 h-8 ${
                                (hasRated ? userRating : 0) >= star || avgRating >= star 
                                  ? 'fill-yellow-400 text-yellow-400' 
                                  : 'text-slate-700 hover:text-yellow-400'
                              }`} 
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    {hasRated && <div className="mt-2 text-sm text-green-400 animate-pulse font-medium">Terima kasih atas rating Anda!</div>}
                  </div>
                </div>

                {/* Right: Testimonials/Comments */}
                <div className="lg:col-span-1 flex flex-col h-full min-h-[400px]">
                  <h4 className="text-sm font-bold text-indigo-400 mb-4 uppercase tracking-wider flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Komentar & Testimoni
                  </h4>
                  
                  {/* Comments List */}
                  <div className="flex-1 bg-slate-900 rounded-xl p-4 overflow-y-auto mb-4 border border-slate-800 max-h-[400px] shadow-inner">
                    {comments.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-slate-600 space-y-2">
                        <MessageCircle className="w-8 h-8 opacity-50" />
                        <p className="text-sm">Belum ada komentar.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {comments.map((comment) => (
                          <div key={comment.id} className="bg-slate-950 p-3 rounded-lg border border-slate-800/50">
                            <p className="text-slate-300 text-sm mb-2 leading-relaxed">{comment.text}</p>
                            <p className="text-slate-600 text-[10px] text-right font-medium">
                              {new Date(comment.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Add Comment Form */}
                  <form onSubmit={handleSubmitComment} className="relative">
                    <div className="relative">
                      <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Tulis pendapatmu..."
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-4 pr-12 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-lg"
                      />
                      <button 
                        type="submit"
                        disabled={!newComment.trim()}
                        className="absolute right-2 top-2 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-all"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </form>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};