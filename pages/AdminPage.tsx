import React, { useState, useRef, useEffect } from 'react';
import { Upload, Link as LinkIcon, FileImage, Type, CheckCircle, AlertCircle, X, SortAsc, SortDesc, Calendar, UserCheck, AlertTriangle, Edit2, Loader2, Cloud, CloudOff } from 'lucide-react';
import { parseDriveLink, saveVideo, updateVideo, fileToBase64, getVideos, deleteVideo, getAverageRating } from '../services/videoService';
import { getCurrentUser } from '../services/authService';
import { isConfigured } from '../services/firebaseConfig';
import { VideoItem } from '../types';
import { VideoCard } from '../components/VideoCard';

type SortType = 'newest' | 'best' | 'worst';
type TabType = 'videos' | 'upload';

export const AdminPage: React.FC = () => {
  // Navigation State
  const [activeTab, setActiveTab] = useState<TabType>('videos');

  // Video Form State
  const [title, setTitle] = useState('');
  const [link, setLink] = useState('');
  const [caption, setCaption] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  // System State
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [existingVideos, setExistingVideos] = useState<VideoItem[]>([]);
  const [sortType, setSortType] = useState<SortType>('newest');
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentUser = getCurrentUser();

  useEffect(() => {
    refreshVideos();
  }, []);

  const refreshVideos = async () => {
    setIsFetching(true);
    try {
      const data = await getVideos();
      setExistingVideos(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsFetching(false);
    }
  };

  const getSortedVideos = () => {
    const videos = [...existingVideos];
    switch (sortType) {
      case 'best':
        return videos.sort((a, b) => getAverageRating(b.ratings || []) - getAverageRating(a.ratings || []));
      case 'worst':
        return videos.sort((a, b) => getAverageRating(a.ratings || []) - getAverageRating(b.ratings || []));
      case 'newest':
      default:
        return videos.sort((a, b) => b.createdAt - a.createdAt);
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setThumbnailFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const startEditing = (video: VideoItem) => {
    setTitle(video.title);
    setLink(video.driveLink);
    setCaption(video.caption);
    setThumbnailPreview(video.thumbnailUrl);
    setThumbnailFile(null);
    setEditingId(video.id);
    setMessage(null);
    setActiveTab('upload');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEditing = () => {
    setTitle('');
    setLink('');
    setCaption('');
    clearThumbnail();
    setEditingId(null);
    setMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const embedUrl = parseDriveLink(link);
      if (!embedUrl) {
        throw new Error("Link Google Drive tidak valid. Pastikan link dapat diakses publik atau gunakan link 'Share'.");
      }

      if (!thumbnailPreview && !thumbnailFile) {
        throw new Error("Mohon unggah thumbnail gambar.");
      }

      let base64Thumbnail = thumbnailPreview || '';
      if (thumbnailFile) {
        base64Thumbnail = await fileToBase64(thumbnailFile);
      }

      if (editingId) {
        const originalVideo = existingVideos.find(v => v.id === editingId);
        if (!originalVideo) throw new Error("Video tidak ditemukan.");

        const updatedVideoItem: VideoItem = {
          ...originalVideo,
          title,
          driveLink: link,
          embedUrl,
          thumbnailUrl: base64Thumbnail,
          caption,
          ratings: originalVideo.ratings,
          comments: originalVideo.comments,
        };

        await updateVideo(updatedVideoItem);
        setMessage({ type: 'success', text: 'Video berhasil diperbarui!' });
        cancelEditing();
      } else {
        const newVideo: VideoItem = {
          id: crypto.randomUUID(),
          title,
          driveLink: link,
          embedUrl,
          thumbnailUrl: base64Thumbnail,
          caption,
          createdAt: Date.now(),
          ratings: [],
          comments: [],
          uploadedBy: currentUser ? {
            uid: currentUser.uid,
            name: currentUser.displayName || 'Unknown',
            // Use spread condition to safely add photoURL only if it exists
            // This prevents adding 'undefined' which causes Firestore crashes
            ...(currentUser.photoURL ? { photoURL: currentUser.photoURL } : {})
          } : undefined
        };

        await saveVideo(newVideo);
        setTitle('');
        setLink('');
        setCaption('');
        clearThumbnail();
        setMessage({ type: 'success', text: 'Video berhasil ditambahkan ke galeri!' });
        
        // Pindah ke tab list setelah upload sukses
        setTimeout(() => setActiveTab('videos'), 1500);
      }

      await refreshVideos();
      
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: err.message || 'Terjadi kesalahan saat menyimpan.' });
    } finally {
      setIsLoading(false);
    }
  };

  const requestDelete = (id: string) => {
    setDeleteTargetId(id);
  };

  const confirmDelete = async () => {
    if (deleteTargetId) {
      await deleteVideo(deleteTargetId);
      await refreshVideos();
      setMessage({ type: 'success', text: 'Video berhasil dihapus.' });
      setDeleteTargetId(null);
      if (editingId === deleteTargetId) {
        cancelEditing();
      }
    }
  };

  const sortedVideos = getSortedVideos();

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      
      {/* Disclaimer Section */}
      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mb-6">
        <div className="flex gap-3">
          <AlertCircle className="w-6 h-6 text-yellow-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="text-yellow-500 font-bold text-sm uppercase tracking-wide">Disclaimer</h3>
            <p className="text-sm text-yellow-200/80 leading-relaxed">
              Selamat datang di laman admin unggah dokumen film dokumenter mata kuliah videografi 2025, gunakan dengan bijak, dilarang menyalah gunakan apps dan laman ini dengan tanpa seijin dosen pengampu. Apps ini hanya sebagai media bantu dalam screening dan penilaian bersama. Terima kasih sudah berprogres!
            </p>
          </div>
        </div>
      </div>

      {/* Admin Status Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 bg-indigo-900/20 p-4 rounded-xl border border-indigo-500/30 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-full">
             <UserCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">
              {currentUser?.displayName || 'Admin'}
            </h2>
            <p className="text-xs text-indigo-300">
              {currentUser?.email || 'Logged in'}
            </p>
          </div>
        </div>
        
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium cursor-default ${
          isConfigured 
            ? 'bg-green-500/10 border-green-500/30 text-green-400' 
            : 'bg-red-500/10 border-red-500/30 text-red-400'
        }`}>
          {isConfigured ? (
            <>
              <Cloud className="w-3 h-3" />
              <span>Cloud Synced (Online)</span>
            </>
          ) : (
            <>
              <CloudOff className="w-3 h-3" />
              <span>Offline (Config Missing)</span>
            </>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 mb-6 border-b border-slate-800 pb-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('videos')}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors flex items-center gap-2 ${
            activeTab === 'videos' 
              ? 'bg-slate-800 text-white border-b-2 border-indigo-500' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <SortAsc className="w-4 h-4" />
          Daftar Video
        </button>
        <button
          onClick={() => {
            setActiveTab('upload');
            cancelEditing();
          }}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors flex items-center gap-2 ${
            activeTab === 'upload' 
              ? 'bg-slate-800 text-white border-b-2 border-indigo-500' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Upload className="w-4 h-4" />
          Upload Baru
        </button>
      </div>

      {/* CONTENT AREA */}
      <div className="grid grid-cols-1 gap-8">
        
        {/* --- UPLOAD / EDIT TAB --- */}
        {activeTab === 'upload' && (
          <div className="max-w-2xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className={`bg-slate-900 rounded-xl p-6 border transition-colors ${editingId ? 'border-indigo-500 shadow-indigo-500/10 shadow-lg' : 'border-slate-800'}`}>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                {editingId ? (
                  <>
                    <Edit2 className="w-6 h-6 text-indigo-500" />
                    Edit Video
                  </>
                ) : (
                  <>
                    <Upload className="w-6 h-6 text-indigo-500" />
                    Upload Video Baru
                  </>
                )}
              </h2>

              {message && (
                <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
                  message.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}>
                  {message.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                  <p className="text-sm">{message.text}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Judul Video</label>
                  <div className="relative">
                    <Type className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                    <input 
                      type="text" 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      placeholder="Contoh: Dokumentasi Acara 2024"
                    />
                  </div>
                </div>

                {/* Link */}
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Link Google Drive</label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                    <input 
                      type="url" 
                      value={link}
                      onChange={(e) => setLink(e.target.value)}
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      placeholder="https://drive.google.com/..."
                    />
                  </div>
                </div>

                {/* Thumbnail */}
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Thumbnail</label>
                  <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-800 border-dashed rounded-lg hover:bg-slate-950/50 transition-colors ${!thumbnailPreview ? 'bg-slate-950' : ''}`}>
                    {thumbnailPreview ? (
                      <div className="relative w-full">
                        <img src={thumbnailPreview} alt="Preview" className="w-full h-40 object-cover rounded-md" />
                        <button 
                          type="button" 
                          onClick={clearThumbnail}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-1 text-center cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                        <FileImage className="mx-auto h-12 w-12 text-slate-500" />
                        <div className="flex text-sm text-slate-400 justify-center">
                          <span className="relative cursor-pointer rounded-md font-medium text-indigo-500 hover:text-indigo-400 focus-within:outline-none">
                            Upload a file
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">PNG, JPG, GIF up to 5MB</p>
                      </div>
                    )}
                    <input 
                      ref={fileInputRef}
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleThumbnailChange}
                    />
                  </div>
                </div>

                {/* Caption */}
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Caption / Deskripsi</label>
                  <textarea 
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    rows={4}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-3 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                    placeholder="Ceritakan tentang video ini..."
                  />
                </div>

                {/* Buttons */}
                <div className="flex flex-col gap-2 pt-2">
                  <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-indigo-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>Processing...</>
                    ) : (
                      <>
                        {editingId ? <Edit2 className="w-5 h-5" /> : <Upload className="w-5 h-5" />}
                        {editingId ? 'Update Video' : 'Submit Video'}
                      </>
                    )}
                  </button>
                  
                  {editingId && (
                    <button 
                      type="button"
                      onClick={cancelEditing}
                      className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-2 px-4 rounded-lg transition-all"
                    >
                      Batal Edit
                    </button>
                  )}
                </div>

              </form>
            </div>
          </div>
        )}

        {/* --- LIST TAB --- */}
        {activeTab === 'videos' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
             <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-4">
                <h3 className="text-xl font-bold text-slate-200">Daftar Video ({existingVideos.length})</h3>
                
                <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800">
                  <button 
                    onClick={() => setSortType('newest')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-1 transition-all ${
                      sortType === 'newest' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Calendar className="w-3 h-3" />
                    Newest
                  </button>
                  <button 
                    onClick={() => setSortType('best')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-1 transition-all ${
                      sortType === 'best' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <SortDesc className="w-3 h-3" />
                    Best Rated
                  </button>
                  <button 
                    onClick={() => setSortType('worst')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-1 transition-all ${
                      sortType === 'worst' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <SortAsc className="w-3 h-3" />
                    Worst Rated
                  </button>
                </div>
             </div>
             
             {isFetching ? (
               <div className="flex items-center justify-center py-20 text-slate-500">
                  <Loader2 className="w-8 h-8 animate-spin mb-2" />
               </div>
             ) : sortedVideos.length === 0 ? (
               <div className="text-center py-12 bg-slate-900/50 rounded-xl border border-slate-800 border-dashed">
                 <p className="text-slate-500">Belum ada video yang diunggah.</p>
                 <button onClick={() => setActiveTab('upload')} className="mt-4 text-indigo-400 hover:text-indigo-300 text-sm font-medium">
                   Upload video pertama Anda &rarr;
                 </button>
               </div>
             ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sortedVideos.map(video => (
                    <VideoCard 
                      key={video.id} 
                      video={video} 
                      isAdmin 
                      onDelete={requestDelete} 
                      onEdit={startEditing}
                      onUpdate={refreshVideos}
                    />
                  ))}
               </div>
             )}
          </div>
        )}

      </div>

      {/* Custom Delete Confirmation Modal */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 rounded-2xl p-6 max-w-sm w-full border border-red-500/30 shadow-2xl">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-white">Konfirmasi Hapus</h3>
              <p className="text-slate-400">Apakah Anda yakin ingin menghapus video ini secara permanen?</p>
              
              <div className="flex gap-3 w-full pt-2">
                <button 
                  onClick={() => setDeleteTargetId(null)}
                  className="flex-1 px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-medium hover:bg-slate-700 transition-colors"
                >
                  Tidak
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
                >
                  Ya
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};