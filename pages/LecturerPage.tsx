import React, { useEffect, useState } from 'react';
import { getLecturers } from '../services/videoService';
import { Lecturer } from '../types';
import { Loader2, GraduationCap } from 'lucide-react';

export const LecturerPage: React.FC = () => {
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLecturers();
  }, []);

  const loadLecturers = async () => {
    try {
      const data = await getLecturers();
      setLecturers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 pb-20">
      <div className="bg-slate-900 border-b border-slate-800 py-16 px-4">
         <div className="container mx-auto text-center">
            <div className="inline-flex items-center justify-center p-3 bg-orange-500/10 rounded-full mb-4">
               <GraduationCap className="w-8 h-8 text-orange-500" />
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">Tim Pengajar</h1>
            <p className="text-slate-400 max-w-2xl mx-auto">
               Dosen dan instruktur mata kuliah Videografi DKV ITS 2025 yang membimbing mahasiswa dalam berkarya.
            </p>
         </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-5xl">
         {isLoading ? (
            <div className="flex justify-center py-12">
               <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
         ) : lecturers.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
               Belum ada data pengajar.
            </div>
         ) : (
            <div className="space-y-6">
               {lecturers.map(lecturer => (
                  <div key={lecturer.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8 hover:border-orange-500/50 transition-all hover:shadow-xl hover:shadow-orange-500/10 group">
                     {/* Foto Profile */}
                     <div className="shrink-0">
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-slate-800 overflow-hidden group-hover:border-orange-500 transition-colors shadow-lg">
                           <img 
                              src={lecturer.photoUrl} 
                              alt={lecturer.name} 
                              className="w-full h-full object-cover"
                           />
                        </div>
                     </div>
                     
                     {/* Info Text */}
                     <div className="flex-1 text-center md:text-left space-y-3">
                        <div>
                           <h3 className="text-2xl font-bold text-white group-hover:text-orange-400 transition-colors">{lecturer.name}</h3>
                           <div className="inline-block px-3 py-1 rounded-full bg-slate-800 text-orange-500 text-sm font-medium mt-2 border border-slate-700">
                              {lecturer.nip}
                           </div>
                        </div>
                        <div className="w-12 h-1 bg-slate-800 mx-auto md:mx-0 rounded-full"></div>
                        <p className="text-slate-300 leading-relaxed text-base">
                           {lecturer.bio}
                        </p>
                     </div>
                  </div>
               ))}
            </div>
         )}
      </div>
    </div>
  );
};