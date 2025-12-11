
import React, { useState, useEffect } from 'react';
import { VideoItem, VisitorAvatar } from '../types';
import { Play, X, Clock, Trash2, Star, MessageCircle, Send, Share2, Edit, User as UserIcon, Eye, ThumbsUp, Heart, Smile, Frown, Zap, Users } from 'lucide-react';
import { addRating, addComment, getAverageRating, incrementViewCount } from '../services/videoService';
import { getCurrentUser } from '../services/authService';
import { getVisitorId, generateAvatar, generateCrowd } from '../services/avatarService';

interface VideoCardProps {
  video: VideoItem;
  isAdmin?: boolean;
  onDelete?: (id: string) => void;
  onEdit?: (video: VideoItem) => void;
  onUpdate?: () => void;
}

const REACTIONS = [
  { emoji: '🔥', label: 'Top' },
  { emoji: '❤️', label: 'Love' },
  { emoji: '👏', label: 'Keren' },
  { emoji: '😮', label: 'Wow' },
  { emoji: '😢', label: 'Sedih' },
  { emoji: '👎', label: 'Jelek' },
];

export const VideoCard: React.FC<VideoCardProps> = ({ video, isAdmin, onDelete, onEdit, onUpdate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [selectedReaction, setSelectedReaction] = useState<string | undefined>(undefined);
  const [userRating, setUserRating] = useState<number>(0); 
  const [hasRated, setHasRated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Avatar State
  const [myAvatar, setMyAvatar] = useState<VisitorAvatar | null>(null);
  const [crowd, setCrowd] = useState<VisitorAvatar[]>([]);

  const avgRating = getAverageRating(video.ratings || []);
  const ratingCount = video.ratings?.length || 0;
  const comments = video.comments || [];
  const latestComment = comments.length > 0 ? comments[comments.length - 1] : null;

  const formattedDate = new Date(video.createdAt).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const SHARE_URL = 'https://dokumenter2025.online/';

  // Init Avatar when component mounts
  useEffect(() => {
    const visitorId = getVisitorId();
    setMyAvatar(generateAvatar(visitorId));
  }, []);

  // Init Crowd when modal opens
  useEffect(() => {
    if (isOpen) {
      // Simulate other viewers based on total view count
      setCrowd(generateCrowd(video.id, video.viewCount || 5));
    }
  }, [isOpen, video.id, video.viewCount]);

  const handleOpen = () => {
    setIsOpen(true);
    
    const STORAGE_KEY = 'viewed_videos_list';
    try {
      const viewedList = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      if (!viewedList.includes(video.id)) {
        incrementViewCount(video.id).then(() => {
          const newList = [...viewedList, video.id];
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newList));
          if (onUpdate) onUpdate(); 
        });
      }
    } catch (e) {
      console.error("Error accessing local storage for views", e);
    }
  };

  const handleRate = async (rating: number) => {
    if (hasRated) return;
    setHasRated(true);
    setUserRating(rating);
    await addRating(video.id, rating);
    if (onUpdate) onUpdate();
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    setIsSubmitting(true);
    const currentUser = getCurrentUser();
    // Use Google Name OR the Avatar Label if anonymous
    const userName = currentUser?.displayName || (myAvatar ? myAvatar.label : 'Pengunjung');

    await addComment(video.id, newComment, userName, selectedReaction);
    setNewComment('');
    setSelectedReaction(undefined);
    setIsSubmitting(false);
    if (onUpdate) onUpdate();
  };

  const handleWhatsAppShare = () => {
    const text = `Nonton Film Dokumenter: "${video.title}"\n\n"${video.caption.substring(0, 150)}..."\n\nTonton selengkapnya di DocuTube DKV ITS: ${SHARE_URL}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleNativeShare = async () => {
    const shareData = {
      title: `DocuTube: ${video.title}`,
      text: `Nonton film dokumenter "${video.title}" karya mahasiswa DKV ITS.\n\n${video.caption}`,
      url: SHARE_URL,
    };

    if ((navigator as any).share) {
      try {
        await (navigator as any).share(shareData);
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      const textToCopy = `${shareData.title}\n${shareData.text}\n${shareData.url}`;
      navigator.clipboard.writeText(textToCopy);
      alert('Info video dan Link berhasil disalin!');
    }
  };

  return (
    <>
      <div className="group relative bg-slate-900 rounded-xl overflow-hidden border border-slate-800 hover:border-indigo-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 flex flex-col h-full">
        {/* Thumbnail Container */}
        <div 
          className="relative aspect-video overflow-hidden cursor-pointer"
          onClick={handleOpen}
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
          
          <div className="absolute top-2 right-2 flex gap-2">
             <div className="bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-white flex items-center gap-1">
                <Eye className="w-3 h-3 text-indigo-400" />
                {video.viewCount || 0}
             </div>
             <div className="bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-yellow-400 flex items-center gap-1">
                <Star className="w-3 h-3 fill-yellow-400" />
                {avgRating > 0 ? avgRating : '-'}
             </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-grow">
          <div className="flex justify-between items-start mb-2 gap-2">
            <h3 className="font-bold text-lg text-slate-100 line-clamp-2 leading-tight hover:text-indigo-400 transition-colors cursor-pointer" onClick={handleOpen}>
              {video.title}
            </h3>
            
            {isAdmin && (
              <div className="flex gap-1 shrink-0">
                {onEdit && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(video);
                    }}
                    className="text-slate-500 hover:text-indigo-400 p-1.5 transition-colors bg-slate-800 rounded hover:bg-slate-700"
                    title="Edit Video"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}
                {onDelete && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(video.id);
                    }}
                    className="text-slate-500 hover:text-red-500 p-1.5 transition-colors bg-slate-800 rounded hover:bg-slate-700"
                    title="Hapus Video"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>
          
          <p className="text-slate-400 text-sm line-clamp-2 mb-4 flex-grow cursor-pointer" onClick={handleOpen}>
            {video.caption}
          </p>
          
          {/* Latest Interaction Footer */}
          <div className="mt-auto border-t border-slate-800 pt-3 space-y-2">
             {latestComment && (
               <div className="flex items-center gap-2 text-xs bg-slate-950 p-2 rounded-lg border border-slate-800/50">
                  <MessageCircle className="w-3 h-3 text-indigo-400 shrink-0" />
                  <span className="text-slate-500 truncate">
                    <span className="text-slate-300 font-medium">{latestComment.userName}</span>: "{latestComment.text.substring(0, 30)}..."
                  </span>
               </div>
             )}
             
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-500 text-xs">
                  <Clock className="w-3 h-3" />
                  <span>{formattedDate}</span>
                </div>
                {/* Micro Avatar Indicator */}
                {myAvatar && (
                   <div className="text-[10px] text-slate-600 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      Menonton sebagai {myAvatar.emoji}
                   </div>
                )}
             </div>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm p-2 md:p-6 animate-in fade-in duration-200 overflow-hidden">
          <div className="relative w-full max-w-[95vw] lg:max-w-7xl h-[95vh] lg:h-[90vh] bg-slate-950 rounded-2xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col">
            
            <div className="flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800 shrink-0">
              <h3 className="font-semibold text-lg truncate pr-4 text-slate-100 max-w-[80%]">{video.title}</h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto flex flex-col bg-black/20">
                <div className="relative aspect-video w-full bg-black shrink-0">
                  <iframe 
                    src={video.embedUrl} 
                    className="absolute inset-0 w-full h-full"
                    allow="autoplay; encrypted-media; fullscreen"
                    allowFullScreen
                    title={video.title}
                  />
                </div>

                <div className="p-6 md:p-8 space-y-8 pb-12">
                   {/* Crowd & Identity Section (NEW) */}
                   <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                      {/* My Avatar */}
                      {myAvatar && (
                        <div className="flex items-center gap-3">
                           <div className={`w-10 h-10 rounded-full ${myAvatar.bgClass} flex items-center justify-center text-xl shadow-lg border-2 border-slate-700`}>
                              {myAvatar.emoji}
                           </div>
                           <div className="flex flex-col">
                              <span className="text-xs text-slate-400 uppercase tracking-wide">Anda menonton sebagai</span>
                              <span className="text-sm font-bold text-white">{myAvatar.label}</span>
                           </div>
                        </div>
                      )}

                      {/* Other Viewers (Simulated Crowd) */}
                      <div className="flex items-center gap-2">
                         <div className="flex -space-x-2 overflow-hidden px-2">
                            {crowd.map((visitor) => (
                               <div 
                                  key={visitor.id} 
                                  className={`w-8 h-8 rounded-full ${visitor.bgClass} flex items-center justify-center text-sm shadow-md border border-slate-900 ring-2 ring-slate-900 relative z-0 hover:z-10 hover:scale-110 transition-transform cursor-help`}
                                  title={`Sedang menonton: ${visitor.label}`}
                               >
                                  {visitor.emoji}
                               </div>
                            ))}
                         </div>
                         <div className="text-xs text-slate-500 font-medium">
                            +{Math.max((video.viewCount || 0) - crowd.length, 0)} others
                         </div>
                      </div>
                   </div>

                   {/* Share Buttons */}
                   <div className="flex flex-wrap gap-3">
                    <button onClick={handleWhatsAppShare} className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors shadow-lg">
                      <MessageCircle className="w-4 h-4" /> Share WhatsApp
                    </button>
                    <button onClick={handleNativeShare} className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors border border-slate-700 shadow-lg">
                      <Share2 className="w-4 h-4" /> Share / Copy Link
                    </button>
                  </div>

                  {/* Video Info */}
                  <div>
                    <h4 className="text-sm font-bold text-indigo-400 mb-3 uppercase tracking-wider flex items-center gap-2">Tentang Video</h4>
                    <p className="text-slate-200 leading-relaxed whitespace-pre-wrap text-base md:text-lg">{video.caption}</p>
                    <div className="flex items-center gap-4 mt-4 text-sm text-slate-500">
                       <span className="flex items-center gap-1"><Eye className="w-4 h-4" /> {video.viewCount || 0} views</span>
                       {video.uploadedBy && <span>Diunggah oleh: {video.uploadedBy.name}</span>}
                    </div>
                  </div>

                  {/* Rating Section */}
                  <div className="bg-slate-900/80 p-6 rounded-xl border border-slate-800">
                    <div className="flex items-center justify-between mb-4">
                       <h4 className="text-sm font-bold text-slate-300">Berikan Rating</h4>
                       <span className="text-xs text-slate-500 bg-slate-950 px-3 py-1 rounded-full border border-slate-800">{ratingCount} ulasan</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                      <div className="flex items-baseline gap-2">
                         <div className="text-5xl font-bold text-white tracking-tighter">{avgRating}</div>
                         <div className="text-slate-500 text-sm font-medium">/ 5.0</div>
                      </div>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => handleRate(star)}
                            disabled={hasRated}
                            className={`transition-all hover:scale-110 focus:outline-none p-1 ${hasRated ? 'cursor-default' : 'cursor-pointer'}`}
                          >
                            <Star className={`w-8 h-8 md:w-10 md:h-10 ${ (hasRated ? userRating : 0) >= star || avgRating >= star ? 'fill-yellow-400 text-yellow-400' : 'text-slate-700 hover:text-yellow-400' }`} />
                          </button>
                        ))}
                      </div>
                    </div>
                    {hasRated && <div className="mt-3 text-sm text-green-400 animate-pulse font-medium">Terima kasih atas rating Anda!</div>}
                  </div>
                </div>
              </div>

              {/* Comments Sidebar */}
              <div className="w-full lg:w-[420px] bg-slate-900 flex flex-col border-t lg:border-t-0 lg:border-l border-slate-800 shrink-0 h-[500px] lg:h-auto">
                <div className="p-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
                  <h4 className="text-sm font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" /> Komentar & Testimoni
                  </h4>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/50">
                  {comments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-600 space-y-3 opacity-60">
                      <MessageCircle className="w-12 h-12" />
                      <p className="text-sm font-medium">Belum ada komentar.</p>
                      <p className="text-xs">Jadilah yang pertama!</p>
                    </div>
                  ) : (
                    <div className="space-y-4 pb-4">
                      {comments.map((comment) => (
                        <div key={comment.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 shadow-sm relative">
                          {comment.reaction && (
                            <div className="absolute top-4 right-4 text-lg" title="Reaksi">{comment.reaction}</div>
                          )}
                          <p className="text-slate-200 text-sm mb-2 leading-relaxed whitespace-pre-wrap pr-6">{comment.text}</p>
                          <div className="flex justify-between items-end border-t border-slate-900 pt-2 mt-2">
                             <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-xs">
                                   {comment.userName ? comment.userName.charAt(0) : 'A'}
                                </div>
                                <span className="text-indigo-400 text-xs font-semibold">{comment.userName || 'Anonymous'}</span>
                             </div>
                             <span className="text-slate-600 text-[10px] font-medium">
                              {new Date(comment.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Comment Input */}
                <div className="p-4 border-t border-slate-800 bg-slate-900 shrink-0 space-y-3">
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                    {REACTIONS.map((r) => (
                      <button
                        key={r.label}
                        type="button"
                        onClick={() => setSelectedReaction(selectedReaction === r.emoji ? undefined : r.emoji)}
                        className={`px-3 py-1 rounded-full text-sm border transition-all flex items-center gap-1 ${
                          selectedReaction === r.emoji 
                            ? 'bg-indigo-600 border-indigo-500 text-white' 
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                        }`}
                      >
                        <span>{r.emoji}</span>
                        <span className="text-xs">{r.label}</span>
                      </button>
                    ))}
                  </div>

                  <form onSubmit={handleSubmitComment} className="relative">
                    <div className="relative">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder={`Komentar sebagai ${myAvatar?.label || 'Pengunjung'}...`}
                        rows={3}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-4 pr-12 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner resize-none"
                        disabled={isSubmitting}
                      />
                      <button 
                        type="submit"
                        disabled={!newComment.trim() || isSubmitting}
                        className="absolute right-3 bottom-3 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-all shadow-lg"
                      >
                        {isSubmitting ? <Clock className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
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
