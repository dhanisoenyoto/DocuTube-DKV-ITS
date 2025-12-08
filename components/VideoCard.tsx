import React, { useState } from 'react';
import { VideoItem } from '../types';
import { Play, X, Clock, Trash2, Star, MessageCircle, Send } from 'lucide-react';
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
          <div className="relative w-full max-w-5xl bg-slate-950 rounded-2xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800 shrink-0">
              <h3 className="font-semibold text-lg truncate pr-4 text-slate-100">{video.title}</h3>
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
                
                {/* Left: Details & Rating */}
                <div className="lg:col-span-2 space-y-6">
                  <div>
                    <h4 className="text-sm font-bold text-indigo-400 mb-2 uppercase tracking-wider">Caption</h4>
                    <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{video.caption}</p>
                  </div>

                  {/* Rating Section */}
                  <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                       <h4 className="text-sm font-bold text-slate-300">Rating Video</h4>
                       <span className="text-xs text-slate-500">({ratingCount} votes)</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-3xl font-bold text-white">{avgRating}</div>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => handleRate(star)}
                            disabled={hasRated}
                            className={`transition-transform hover:scale-110 focus:outline-none ${hasRated ? 'cursor-default' : 'cursor-pointer'}`}
                          >
                            <Star 
                              className={`w-6 h-6 ${
                                (hasRated ? userRating : 0) >= star || avgRating >= star 
                                  ? 'fill-yellow-400 text-yellow-400' 
                                  : 'text-slate-600'
                              }`} 
                            />
                          </button>
                        ))}
                      </div>
                      {hasRated && <span className="text-xs text-green-400 animate-pulse">Terima kasih!</span>}
                    </div>
                  </div>
                </div>

                {/* Right: Testimonials/Comments */}
                <div className="lg:col-span-1 flex flex-col h-full min-h-[300px]">
                  <h4 className="text-sm font-bold text-indigo-400 mb-4 uppercase tracking-wider flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Testimoni ({comments.length})
                  </h4>
                  
                  {/* Comments List */}
                  <div className="flex-1 bg-slate-900 rounded-lg p-3 overflow-y-auto mb-4 border border-slate-800 max-h-[300px]">
                    {comments.length === 0 ? (
                      <p className="text-slate-500 text-sm text-center py-8">Belum ada komentar.</p>
                    ) : (
                      <div className="space-y-3">
                        {comments.map((comment) => (
                          <div key={comment.id} className="bg-slate-950 p-3 rounded border border-slate-800/50">
                            <p className="text-slate-300 text-sm mb-1">{comment.text}</p>
                            <p className="text-slate-600 text-[10px] text-right">
                              {new Date(comment.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Add Comment Form */}
                  <form onSubmit={handleSubmitComment} className="relative">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Tulis testimoni..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg py-3 pl-4 pr-12 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                    <button 
                      type="submit"
                      disabled={!newComment.trim()}
                      className="absolute right-2 top-2 p-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors"
                    >
                      <Send className="w-4 h-4" />
                    </button>
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
