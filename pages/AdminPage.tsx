
import React, { useState, useRef, useEffect } from 'react';
import { Upload, Link as LinkIcon, FileImage, Type, CheckCircle, AlertCircle, X, SortAsc, SortDesc, Calendar, UserCheck, AlertTriangle, Edit2, Loader2, Cloud, CloudOff, Users, GraduationCap, RefreshCw } from 'lucide-react';
import { parseDriveLink, saveVideo, updateVideo, fileToBase64, getVideos, deleteVideo, getAverageRating, getLecturers, saveLecturer, deleteLecturer, resetAllStatistics } from '../services/videoService';
import { getCurrentUser } from '../services/authService';
import { isConfigured } from '../services/firebaseConfig';
import { VideoItem, Lecturer } from '../types';
import { VideoCard } from '../components/VideoCard';

type SortType = 'newest' | 'best' | 'worst';
type TabType = 'videos' | 'upload' | 'lecturers';

export const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('videos');
  const [currentUser] = useState(getCurrentUser());

  // Video State
  const [title, setTitle] = useState('');
  const [link, setLink] = useState('');
  const [caption, setCaption] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Lecturer State
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [lecName, setLecName] = useState('');
  const [lecNip, setLecNip] = useState('');
  const [lecBio, setLecBio] = useState('');
  const [lecPhotoFile, setLecPhotoFile] = useState<File | null>(null);
  const [lecPhotoPreview, setLecPhotoPreview] = useState<string | null>(null);

  // System State
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState<string>(''); 
  const [isFetching, setIsFetching] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [existingVideos, setExistingVideos] = useState<VideoItem[]>([]);
  const [sortType, setSortType] = useState<SortType>('newest');
  
  // Modals
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteType, setDeleteType] = useState<'video' | 'lecturer'>('video');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lecFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    refreshVideos();
    refreshLecturers();
  }, []);

  const refreshVideos = async () => {
    setIsFetching(true);
    try {
      const data = await getVideos();
      setExistingVideos(data);
    } catch (e) { console.error(e); } finally { setIsFetching(false); }
  };

  const refreshLecturers = async () => {
    try {
      const data = await getLecturers();
      setLecturers(data);
    } catch (e) { console.error(e); }
  };

  const getSortedVideos = () => {
    const videos = [...existingVideos];
    switch (sortType) {
      case 'best': return videos.sort((a, b) => getAverageRating(b.ratings || []) - getAverageRating(a.ratings || []));
      case 'worst': return videos.sort((a, b) => getAverageRating(a.ratings || []) - getAverageRating(b.ratings || []));
      case 'newest': default: return videos.sort((a, b) => b.createdAt - a.createdAt);
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) { alert("Ukuran file terlalu besar (>5MB)."); return; }
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setThumbnailPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleLecPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLecPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setLecPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const clearThumbnail = () => {
    setThumbnailFile(null); setThumbnailPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const clearLecForm = () => {
    setLecName(''); setLecNip(''); setLecBio('');
    setLecPhotoFile(null); setLecPhotoPreview(null);
    if (lecFileInputRef.current) lecFileInputRef.current.value = '';
  };

  const startEditing = (video: VideoItem) => {
    setTitle(video.title); setLink(video.driveLink); setCaption(video.caption);
    setThumbnailPreview(video.thumbnailUrl); setThumbnailFile(null);
    setEditingId(video.id); setMessage(null); setActiveTab('upload');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEditing = () => {
    setTitle(''); setLink(''); setCaption(''); clearThumbnail();
    setEditingId(null); setMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); setLoadingStatus('Processing...'); setMessage(null);

    try {
      const embedUrl = parseDriveLink(link);
      if (!embedUrl) throw new Error("Link tidak valid.");
      if (!thumbnailPreview && !thumbnailFile) throw new Error("Thumbnail wajib ada.");

      let base64Thumbnail = thumbnailPreview || '';
      if (thumbnailFile) {
        setLoadingStatus('Compressing image...');
        base64Thumbnail = await fileToBase64(thumbnailFile);
      }

      setLoadingStatus('Saving...');
      if (editingId) {
        const original = existingVideos.find(v => v.id === editingId);
        if (!original) throw new Error("Video not found");
        await updateVideo({ ...original, title, driveLink: link, embedUrl, thumbnailUrl: base64Thumbnail, caption });
        setMessage({ type: 'success', text: 'Video updated!' });
        cancelEditing();
      } else {
        await saveVideo({
          id: crypto.randomUUID(), title, driveLink: link, embedUrl, thumbnailUrl: base64Thumbnail, caption,
          createdAt: Date.now(), ratings: [], comments: [], viewCount: 0,
          uploadedBy: currentUser ? { uid: currentUser.uid, name: currentUser.displayName || 'Unknown', ...(currentUser.photoURL ? { photoURL: currentUser.photoURL } : {}) } : undefined
        });
        setMessage({ type: 'success', text: 'Video published!' });
        setTitle(''); setLink(''); setCaption(''); clearThumbnail();
      }
      await refreshVideos();
    } catch (err: any) { setMessage({ type: 'error', text: err.message }); } 
    finally { setIsLoading(false); }
  };

  const handleLecturerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lecPhotoPreview && !lecPhotoFile) { alert("Foto wajib diupload"); return; }
    setIsLoading(true);

    try {
      let photoBase64 = lecPhotoPreview || '';
      if (lecPhotoFile) {
        photoBase64 = await fileToBase64(lecPhotoFile);
      }
      await saveLecturer({
        id: crypto.randomUUID(),
        name: lecName,
        nip: lecNip,
        bio: lecBio,
        photoUrl: photoBase64
      });
      clearLecForm();
      await refreshLecturers();
      setMessage({ type: 'success', text: 'Pengajar berhasil ditambahkan!' });
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message });
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (deleteTargetId) {
      if (deleteType === 'video') {
        await deleteVideo(deleteTargetId);
        await refreshVideos();
      } else {
        await deleteLecturer(deleteTargetId);
        await refreshLecturers();
      }
      setMessage({ type: 'success', text: 'Item dihapus.' });
      setDeleteTargetId(null);
    }
  };

  const handleResetStatistics = async () => {
    setIsLoading(true);
    setLoadingStatus('Resetting stats...');
    try {
      await resetAllStatistics();
      await refreshVideos();
      setMessage({ type: 'success', text: 'Semua statistik (View, Rating, Komentar) berhasil di-reset ke 0.' });
      setShowResetConfirm(false);
    } catch (e: any) {
      setMessage({ type: 'error', text: 'Gagal reset: ' + e.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 bg-indigo-900/20 p-4 rounded-xl border border-indigo-500/30 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-600 rounded-full">
             <UserCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{currentUser?.displayName || 'Admin'}</h2>
            <p className="text-xs text-indigo-300">{currentUser?.email}</p>
          </div>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium ${isConfigured ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
          {isConfigured ? <><Cloud className="w-3 h-3" /> Online</> : <><CloudOff className="w-3 h-3" /> Offline</>}
        </div>
      </div>

      <div className="flex gap-2 mb-6 border-b border-slate-800 pb-1 overflow-x-auto">
        <button onClick={() => setActiveTab('videos')} className={`px-4 py-2 text-sm font-medium rounded-t-lg flex items-center gap-2 ${activeTab === 'videos' ? 'bg-slate-800 text-white border-b-2 border-orange-500' : 'text-slate-400 hover:bg-slate-900'}`}>
          <SortAsc className="w-4 h-4" /> Daftar Video
        </button>
        <button onClick={() => { setActiveTab('upload'); cancelEditing(); }} className={`px-4 py-2 text-sm font-medium rounded-t-lg flex items-center gap-2 ${activeTab === 'upload' ? 'bg-slate-800 text-white border-b-2 border-orange-500' : 'text-slate-400 hover:bg-slate-900'}`}>
          <Upload className="w-4 h-4" /> Upload Video
        </button>
        <button onClick={() => setActiveTab('lecturers')} className={`px-4 py-2 text-sm font-medium rounded-t-lg flex items-center gap-2 ${activeTab === 'lecturers' ? 'bg-slate-800 text-white border-b-2 border-orange-500' : 'text-slate-400 hover:bg-slate-900'}`}>
          <GraduationCap className="w-4 h-4" /> Kelola Pengajar
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* --- UPLOAD TAB --- */}
        {activeTab === 'upload' && (
          <div className="max-w-2xl mx-auto w-full animate-in fade-in">
            <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                {editingId ? <><Edit2 className="w-6 h-6 text-orange-500" /> Edit Video</> : <><Upload className="w-6 h-6 text-orange-500" /> Upload Video</>}
              </h2>
              {message && <div className={`mb-6 p-4 rounded-lg flex gap-3 text-sm ${message.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>{message.text}</div>}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm text-slate-400">Judul</label>
                  <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-white focus:ring-orange-500" />
                </div>
                <div>
                  <label className="text-sm text-slate-400">Link GDrive</label>
                  <input type="url" value={link} onChange={e => setLink(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-white focus:ring-orange-500" />
                </div>
                <div>
                  <label className="text-sm text-slate-400">Thumbnail</label>
                  <div onClick={() => fileInputRef.current?.click()} className="mt-1 border-2 border-dashed border-slate-800 rounded p-6 text-center cursor-pointer hover:bg-slate-950">
                    {thumbnailPreview ? <img src={thumbnailPreview} className="h-40 mx-auto object-cover rounded" /> : <div className="text-slate-500"><FileImage className="mx-auto h-8 w-8 mb-2" />Upload Image</div>}
                    <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleThumbnailChange} />
                  </div>
                  {thumbnailPreview && <button type="button" onClick={clearThumbnail} className="text-xs text-red-400 mt-2">Hapus Gambar</button>}
                </div>
                <div>
                  <label className="text-sm text-slate-400">Caption</label>
                  <textarea value={caption} onChange={e => setCaption(e.target.value)} rows={4} required className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-white focus:ring-orange-500" />
                </div>
                <button type="submit" disabled={isLoading} className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded disabled:opacity-50 flex justify-center gap-2">
                  {isLoading ? <Loader2 className="animate-spin" /> : editingId ? 'Update' : 'Submit'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* --- VIDEOS TAB --- */}
        {activeTab === 'videos' && (
          <div className="space-y-6 animate-in fade-in">
             <div className="flex flex-col md:flex-row justify-between mb-4 gap-4">
                <h3 className="text-xl font-bold">Daftar Video ({existingVideos.length})</h3>
                <div className="flex gap-2">
                  <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800 h-fit">
                    <button onClick={() => setSortType('newest')} className={`px-3 py-1 text-xs rounded ${sortType === 'newest' ? 'bg-orange-600 text-white' : 'text-slate-400'}`}>Newest</button>
                    <button onClick={() => setSortType('best')} className={`px-3 py-1 text-xs rounded ${sortType === 'best' ? 'bg-orange-600 text-white' : 'text-slate-400'}`}>Best</button>
                  </div>
                  {/* Reset Button */}
                  <button 
                    onClick={() => setShowResetConfirm(true)}
                    className="flex items-center gap-2 px-3 py-1 bg-slate-900 border border-red-500/30 text-red-400 text-xs rounded-lg hover:bg-red-900/20 transition-colors h-fit self-start"
                  >
                    <RefreshCw className="w-3 h-3" /> Reset Statistik
                  </button>
                </div>
             </div>
             
             {message && message.type === 'success' && <div className="p-3 bg-green-500/10 text-green-400 rounded-lg text-sm">{message.text}</div>}

             {isFetching ? <Loader2 className="mx-auto animate-spin" /> : (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getSortedVideos().map(video => (
                    <VideoCard key={video.id} video={video} isAdmin onDelete={() => { setDeleteType('video'); setDeleteTargetId(video.id); }} onEdit={startEditing} onUpdate={refreshVideos} />
                  ))}
               </div>
             )}
          </div>
        )}

        {/* --- LECTURERS TAB --- */}
        {activeTab === 'lecturers' && (
          <div className="max-w-4xl mx-auto w-full animate-in fade-in">
             <div className="grid md:grid-cols-2 gap-8">
                {/* Form */}
                <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 h-fit">
                   <h3 className="font-bold text-lg mb-4 text-orange-500 flex items-center gap-2"><Users className="w-5 h-5" /> Tambah Pengajar</h3>
                   <form onSubmit={handleLecturerSubmit} className="space-y-4">
                      <input type="text" placeholder="Nama Lengkap & Gelar" value={lecName} onChange={e => setLecName(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-white" />
                      <input type="text" placeholder="NIP / Kode Dosen" value={lecNip} onChange={e => setLecNip(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-white" />
                      <textarea placeholder="Biodata Singkat" value={lecBio} onChange={e => setLecBio(e.target.value)} rows={3} required className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-white" />
                      
                      <div onClick={() => lecFileInputRef.current?.click()} className="border-2 border-dashed border-slate-800 rounded p-4 text-center cursor-pointer hover:bg-slate-950">
                        {lecPhotoPreview ? <img src={lecPhotoPreview} className="h-24 w-24 object-cover rounded-full mx-auto" /> : <span className="text-xs text-slate-500">Upload Foto Profil</span>}
                        <input ref={lecFileInputRef} type="file" className="hidden" accept="image/*" onChange={handleLecPhotoChange} />
                      </div>
                      <button type="submit" disabled={isLoading} className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 rounded">{isLoading ? 'Saving...' : 'Tambah'}</button>
                   </form>
                </div>

                {/* List */}
                <div className="space-y-4">
                   {lecturers.map(lec => (
                      <div key={lec.id} className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex items-center gap-4 relative group">
                         <img src={lec.photoUrl} className="w-16 h-16 rounded-full object-cover border border-slate-700" />
                         <div>
                            <h4 className="font-bold text-white">{lec.name}</h4>
                            <p className="text-orange-500 text-xs">{lec.nip}</p>
                            <p className="text-slate-500 text-xs line-clamp-2">{lec.bio}</p>
                         </div>
                         <button onClick={() => { setDeleteType('lecturer'); setDeleteTargetId(lec.id); }} className="absolute top-2 right-2 p-1.5 text-slate-600 hover:text-red-500 hover:bg-slate-800 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                            <X className="w-4 h-4" />
                         </button>
                      </div>
                   ))}
                   {lecturers.length === 0 && <p className="text-slate-500 text-center py-10">Belum ada data pengajar.</p>}
                </div>
             </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-slate-900 rounded-2xl p-6 max-w-sm w-full border border-red-500/30">
            <h3 className="text-xl font-bold text-white mb-2">Hapus Data?</h3>
            <p className="text-slate-400 text-sm mb-6">Data yang dihapus tidak dapat dikembalikan.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTargetId(null)} className="flex-1 px-4 py-2 bg-slate-800 text-white rounded hover:bg-slate-700">Batal</button>
              <button onClick={confirmDelete} className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Hapus</button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Stats Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in zoom-in-95">
          <div className="bg-slate-900 rounded-2xl p-6 max-w-md w-full border border-red-500/50 shadow-2xl">
            <div className="flex items-center gap-3 mb-4 text-red-500">
              <AlertTriangle className="w-8 h-8" />
              <h3 className="text-xl font-bold">Reset Statistik?</h3>
            </div>
            <p className="text-slate-300 mb-2">
              Anda akan mereset data berikut ke 0 untuk <strong>SEMUA VIDEO</strong>:
            </p>
            <ul className="list-disc list-inside text-slate-400 text-sm mb-6 space-y-1 ml-2">
              <li>Jumlah Views</li>
              <li>Jumlah Shares</li>
              <li>Semua Rating/Bintang</li>
              <li>Semua Komentar</li>
            </ul>
            <p className="text-red-400 text-sm font-bold mb-6 italic">
              Tindakan ini tidak bisa dibatalkan!
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowResetConfirm(false)} 
                className="flex-1 px-4 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-700 font-medium"
                disabled={isLoading}
              >
                Batalkan
              </button>
              <button 
                onClick={handleResetStatistics} 
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold flex justify-center gap-2 items-center"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : 'Ya, Reset Semuanya'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
