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

      <div className="container mx-auto px-4 py-12">
         {isLoading ? (
            <div className="flex justify-center py-12">
               <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
         ) : lecturers.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
               Belum ada data pengajar.
            </div>
         ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {lecturers.map(lecturer => (
                  <div key={lecturer.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-orange-500/50 transition-all hover:shadow-xl hover:shadow-orange-500/10 flex flex-col items-center text-center p-8 group">
                     <div className="w-32 h-32 rounded-full border-4 border-slate-800 overflow-hidden mb-6 group-hover:border-orange-500 transition-colors">
                        <img 
                           src={lecturer.photoUrl} 
                           alt={lecturer.name} 
                           className="w-full h-full object-cover"
                        />
                     </div>
                     <h3 className="text-xl font-bold text-white mb-1">{lecturer.name}</h3>
                     <p className="text-orange-400 text-sm font-medium mb-4">{lecturer.nip}</p>
                     <p className="text-slate-400 text-sm leading-relaxed">{lecturer.bio}</p>
                  </div>
               ))}
            </div>
         )}
      </div>
    </div>
  );
};