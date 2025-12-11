
import React, { useEffect, useState } from 'react';
import { getVideos } from '../services/videoService';
import { VideoItem } from '../types';
import { Loader2, Globe, Clock, BarChart3, TrendingUp, Eye, Share2, MessageCircle } from 'lucide-react';

export const StatisticsPage: React.FC = () => {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await getVideos();
      setVideos(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  // --- DERIVED METRICS ---
  
  // 1. Engagement Ranking (Comments + Shares)
  const mostEngagedVideos = [...videos]
    .sort((a, b) => {
      const scoreA = (a.comments?.length || 0) + (a.shareCount || 0);
      const scoreB = (b.comments?.length || 0) + (b.shareCount || 0);
      return scoreB - scoreA;
    })
    .slice(0, 5);

  // 2. View Count Ranking
  const mostViewedVideos = [...videos]
    .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
    .slice(0, 5);

  // 3. Simulated Geo Data (Visual only, no backend)
  const regions = [
    { name: 'Surabaya', percent: 45, color: 'bg-orange-500' },
    { name: 'Jakarta', percent: 25, color: 'bg-pink-500' },
    { name: 'Malang', percent: 15, color: 'bg-indigo-500' },
    { name: 'Bandung', percent: 10, color: 'bg-teal-500' },
    { name: 'Lainnya', percent: 5, color: 'bg-slate-600' }
  ];

  // 4. Simulated Peak Hours (Visual only)
  const peakHours = [10, 25, 45, 80, 60, 40, 30, 90, 100, 70, 50, 30];

  return (
    <div className="min-h-screen bg-slate-950 pb-20">
      <div className="bg-slate-900 border-b border-slate-800 py-12 px-4">
        <div className="container mx-auto text-center">
           <div className="inline-flex items-center justify-center p-3 bg-pink-500/10 rounded-full mb-4">
              <BarChart3 className="w-8 h-8 text-pink-500" />
           </div>
           <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">Statistik Pengunjung</h1>
           <p className="text-slate-400">Data analitik pemutaran, sebaran wilayah, dan interaksi audiens.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {isLoading ? (
           <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-pink-500" /></div>
        ) : (
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* --- REGIONAL DEMOGRAPHICS --- */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                 <div className="flex items-center gap-2 mb-6 text-pink-400 font-bold uppercase tracking-wider text-sm">
                    <Globe className="w-5 h-5" /> Sebaran Wilayah (Simulasi)
                 </div>
                 <div className="space-y-4">
                    {regions.map(r => (
                       <div key={r.name}>
                          <div className="flex justify-between text-sm text-slate-300 mb-1">
                             <span>{r.name}</span>
                             <span>{r.percent}%</span>
                          </div>
                          <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
                             <div className={`h-full ${r.color} rounded-full`} style={{ width: `${r.percent}%` }}></div>
                          </div>
                       </div>
                    ))}
                 </div>
                 <div className="mt-6 p-4 bg-slate-950 rounded-lg text-xs text-slate-500 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Mayoritas pengunjung berasal dari wilayah Jawa Timur, khususnya area kampus ITS Surabaya.
                 </div>
              </div>

              {/* --- PEAK HOURS CHART --- */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col">
                 <div className="flex items-center gap-2 mb-6 text-orange-400 font-bold uppercase tracking-wider text-sm">
                    <Clock className="w-5 h-5" /> Jam Kunjungan Terpadat
                 </div>
                 <div className="flex-1 flex items-end gap-2 h-48 mt-4">
                    {peakHours.map((h, i) => (
                       <div key={i} className="flex-1 flex flex-col justify-end group relative">
                          <div 
                             className="w-full bg-orange-500/80 rounded-t-sm hover:bg-orange-400 transition-all" 
                             style={{ height: `${h}%` }}
                          ></div>
                          {/* Tooltip */}
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-slate-900 text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                             {h}%
                          </div>
                          <div className="text-[10px] text-center text-slate-500 mt-2">
                             {i * 2}
                          </div>
                       </div>
                    ))}
                 </div>
                 <div className="flex justify-between text-xs text-slate-500 mt-2 px-1">
                    <span>00:00</span>
                    <span>12:00</span>
                    <span>22:00</span>
                 </div>
              </div>

              {/* --- MOST VIEWED --- */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl lg:col-span-2">
                 <div className="flex items-center gap-2 mb-6 text-indigo-400 font-bold uppercase tracking-wider text-sm">
                    <Eye className="w-5 h-5" /> Top 5 Video Paling Banyak Ditonton
                 </div>
                 <div className="space-y-4">
                    {mostViewedVideos.map((video, index) => (
                       <div key={video.id} className="flex items-center gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800 hover:border-indigo-500/50 transition-colors">
                          <div className="text-2xl font-bold text-slate-700 w-8 text-center">#{index + 1}</div>
                          <img src={video.thumbnailUrl} className="w-24 h-14 object-cover rounded-lg hidden sm:block" alt="thumb" />
                          <div className="flex-1 min-w-0">
                             <h4 className="font-bold text-slate-200 truncate">{video.title}</h4>
                             <p className="text-xs text-slate-500 truncate">{video.caption}</p>
                          </div>
                          <div className="text-right">
                             <div className="text-xl font-bold text-white">{video.viewCount || 0}</div>
                             <div className="text-xs text-slate-500">Views</div>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>

              {/* --- MOST ENGAGED --- */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl lg:col-span-2">
                 <div className="flex items-center gap-2 mb-6 text-green-400 font-bold uppercase tracking-wider text-sm">
                    <Share2 className="w-5 h-5" /> Top Engagement (Shares + Comments)
                 </div>
                 <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-400">
                       <thead className="text-xs uppercase bg-slate-950 text-slate-300">
                          <tr>
                             <th className="px-4 py-3 rounded-l-lg">Judul Film</th>
                             <th className="px-4 py-3 text-center">Shares</th>
                             <th className="px-4 py-3 text-center">Comments</th>
                             <th className="px-4 py-3 text-center rounded-r-lg">Total Score</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-800">
                          {mostEngagedVideos.map(video => (
                             <tr key={video.id} className="hover:bg-slate-800/50 transition-colors">
                                <td className="px-4 py-3 font-medium text-white">{video.title}</td>
                                <td className="px-4 py-3 text-center text-green-400 font-bold">{video.shareCount || 0}</td>
                                <td className="px-4 py-3 text-center text-indigo-400 font-bold">{video.comments?.length || 0}</td>
                                <td className="px-4 py-3 text-center">
                                   <span className="bg-slate-800 px-2 py-1 rounded text-white font-bold">
                                      {(video.shareCount || 0) + (video.comments?.length || 0)}
                                   </span>
                                </td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </div>

           </div>
        )}
      </div>
    </div>
  );
};