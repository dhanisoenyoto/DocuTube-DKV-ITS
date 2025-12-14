
import React, { useEffect, useState } from 'react';
import { Mail, MapPin, Github, Linkedin, Camera, Film, Code2, Globe, Edit3, X, Save, Loader2 } from 'lucide-react';
import { getAboutContent, saveAboutContent } from '../services/videoService';
import { getCurrentUser } from '../services/authService';
import { AboutData } from '../types';

export const AboutPage: React.FC = () => {
  const [data, setData] = useState<AboutData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<AboutData | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [currentUser] = useState(getCurrentUser());

  // AUTHORIZED EMAIL
  const AUTHORIZED_EMAIL = 'sancokbrancok@gmail.com';
  const canEdit = currentUser?.email === AUTHORIZED_EMAIL;

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    const content = await getAboutContent();
    setData(content);
    setFormData(content);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (formData) {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSave = async () => {
    if (!formData) return;
    setIsSaving(true);
    try {
      await saveAboutContent(formData);
      setData(formData);
      setIsEditing(false);
    } catch (e) {
      alert("Gagal menyimpan perubahan");
    } finally {
      setIsSaving(false);
    }
  };

  if (!data) return <div className="min-h-screen bg-slate-950 flex justify-center pt-20"><Loader2 className="animate-spin text-orange-500" /></div>;

  return (
    <div className="min-h-screen bg-slate-950 pb-20 relative">
      
      {/* Edit Button for Authorized User */}
      {canEdit && (
        <button 
          onClick={() => setIsEditing(true)}
          className="fixed bottom-6 right-6 z-50 bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-2xl transition-transform hover:scale-110 border-2 border-indigo-400"
          title="Edit Page Content"
        >
          <Edit3 className="w-6 h-6" />
        </button>
      )}

      {/* Hero Header */}
      <div className="relative py-20 lg:py-28 overflow-hidden border-b border-slate-800 bg-slate-900/50">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
           <div className="absolute -top-[20%] -right-[10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl"></div>
           <div className="absolute top-[20%] -left-[10%] w-[400px] h-[400px] bg-orange-600/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10 text-center">
           <span className="inline-block py-1 px-3 rounded-full bg-slate-800/80 border border-slate-700 text-orange-400 text-xs font-bold tracking-widest uppercase mb-4">
              Tentang Platform
           </span>
           <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
              {data.heroTitle} <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-500">{data.heroSubtitle}</span>
           </h1>
           <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              {data.introText}
           </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-5xl space-y-20">
         
         {/* Section: Definisi / Vision */}
         <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative group">
               <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
               <img 
                 src="https://images.unsplash.com/photo-1517524206127-48bbd363f3d7?auto=format&fit=crop&q=80&w=800" 
                 alt="Filmmaking" 
                 className="relative rounded-2xl shadow-2xl border border-slate-800 transform group-hover:scale-[1.01] transition-transform duration-500"
               />
            </div>
            <div className="space-y-6">
               <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                  <Film className="w-8 h-8 text-orange-500" /> {data.visionTitle}
               </h2>
               <div className="space-y-4 text-slate-400 text-lg leading-relaxed whitespace-pre-wrap">
                  {data.visionText}
               </div>
            </div>
         </div>

         {/* Section: The Team / Creator */}
         <div className="bg-slate-900 rounded-3xl p-8 md:p-12 border border-slate-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="text-center mb-12">
               <h2 className="text-3xl font-bold text-white mb-2">Meet the Creator</h2>
               <p className="text-slate-500">Dedikasi untuk pengembangan teknologi kreatif di lingkungan kampus.</p>
            </div>

            <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-12">
               {/* Profile Card */}
               <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col items-center w-full max-w-sm hover:border-orange-500/50 transition-colors shadow-lg">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center mb-4 border-2 border-slate-700 shadow-inner">
                     <Code2 className="w-10 h-10 text-orange-500" />
                  </div>
                  <h3 className="text-xl font-bold text-white">{data.creatorName}</h3>
                  <p className="text-orange-500 text-sm font-medium mb-4">{data.creatorRole}</p>
                  <p className="text-slate-400 text-center text-sm mb-6">
                     {data.creatorBio}
                  </p>
                  <div className="flex gap-4">
                     <a href="#" className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"><Github className="w-5 h-5" /></a>
                     <a href="#" className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"><Linkedin className="w-5 h-5" /></a>
                     <a href="#" className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"><Globe className="w-5 h-5" /></a>
                  </div>
               </div>

               {/* Department Info */}
               <div className="text-center md:text-left max-w-md space-y-4">
                  <div className="inline-flex items-center gap-2 text-indigo-400 font-bold uppercase tracking-wider text-xs bg-indigo-500/10 px-3 py-1 rounded-full">
                     <Camera className="w-4 h-4" /> Didukung Oleh
                  </div>
                  <h3 className="text-2xl font-bold text-white">Departemen Desain Komunikasi Visual</h3>
                  <p className="text-slate-400">
                     Institut Teknologi Sepuluh Nopember (ITS) Surabaya. Menggabungkan seni, desain, dan teknologi untuk memecahkan masalah komunikasi visual.
                  </p>
               </div>
            </div>
         </div>

         {/* Footer Contact */}
         <div className="border-t border-slate-800 pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-start gap-4 text-slate-400 max-w-md">
               <MapPin className="w-6 h-6 shrink-0 text-orange-500 mt-1" />
               <div>
                  <h4 className="text-white font-bold mb-1">Lokasi Kampus</h4>
                  <p className="text-sm">{data.address}</p>
               </div>
            </div>
            
            <div className="flex items-center gap-4">
               <a href={`mailto:${data.email}`} className="flex items-center gap-2 px-5 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-white text-sm font-medium transition-colors">
                  <Mail className="w-4 h-4" /> Hubungi Kami
               </a>
            </div>
         </div>

      </div>

      {/* EDIT MODAL */}
      {isEditing && formData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-slate-900 w-full max-w-2xl rounded-2xl border border-slate-700 shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900 rounded-t-2xl">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-indigo-400" /> Edit Page Content
              </h3>
              <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6 flex-1 scrollbar-thin">
              {/* Hero Section */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-orange-400 uppercase tracking-wide">Hero Header</h4>
                <div>
                  <label className="text-xs text-slate-500">Judul Utama</label>
                  <input name="heroTitle" value={formData.heroTitle} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white" />
                </div>
                <div>
                  <label className="text-xs text-slate-500">Sub Judul (Gradient Color)</label>
                  <input name="heroSubtitle" value={formData.heroSubtitle} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white" />
                </div>
                <div>
                  <label className="text-xs text-slate-500">Intro Text</label>
                  <textarea name="introText" rows={2} value={formData.introText} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white" />
                </div>
              </div>

              {/* Vision Section */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-orange-400 uppercase tracking-wide">Vision & Mission</h4>
                <div>
                  <label className="text-xs text-slate-500">Judul Bagian</label>
                  <input name="visionTitle" value={formData.visionTitle} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white" />
                </div>
                <div>
                  <label className="text-xs text-slate-500">Isi Teks</label>
                  <textarea name="visionText" rows={6} value={formData.visionText} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white" />
                </div>
              </div>

              {/* Creator Section */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-orange-400 uppercase tracking-wide">Creator Profile</h4>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="text-xs text-slate-500">Nama</label>
                      <input name="creatorName" value={formData.creatorName} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white" />
                   </div>
                   <div>
                      <label className="text-xs text-slate-500">Role</label>
                      <input name="creatorRole" value={formData.creatorRole} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white" />
                   </div>
                </div>
                <div>
                  <label className="text-xs text-slate-500">Bio Singkat</label>
                  <textarea name="creatorBio" rows={3} value={formData.creatorBio} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white" />
                </div>
              </div>

              {/* Contact Section */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-orange-400 uppercase tracking-wide">Contact Info</h4>
                <div>
                  <label className="text-xs text-slate-500">Alamat</label>
                  <textarea name="address" rows={2} value={formData.address} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white" />
                </div>
                <div>
                  <label className="text-xs text-slate-500">Email</label>
                  <input name="email" value={formData.email} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white" />
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-900 rounded-b-2xl flex justify-end gap-3">
               <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg">Cancel</button>
               <button onClick={handleSave} disabled={isSaving} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold flex items-center gap-2 disabled:opacity-50">
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Changes
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
