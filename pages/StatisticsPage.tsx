
import React, { useEffect, useState } from 'react';
import { getVideos } from '../services/videoService';
import { VideoItem } from '../types';
import { Loader2, Globe, Clock, BarChart3, TrendingUp, Eye, Share2, MessageCircle, Activity } from 'lucide-react';

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

  // 4. Simulated Peak Hours Data (Enhanced)
  const peakHoursData = [
     { time: '00', value: 10, label: '00:00' },
     { time: '02', value: 5, label: '02:00' },
     { time: '04', value: 2, label: '04:00' },
     { time: '06', value: 15, label: '06:00' },
     { time: '08', value: 45, label: '08:00' },
     { time: '10', value: 65, label: '10:00' },
     { time: '12', value: 85, label: '12:00' },
     { time: '14', value: 60, label: '14:00' },
     { time: '16', value: 55, label: '16:00' },
     { time: '18', value: 90, label: '18:00' },
     { time: '20', value: 98, label: '20:00' },
     { time: '22', value: 40, label: '22:00' }
  ];

  // Helper to determine bar color based on intensity
  const getBarGradient = (val: number) => {
    if (val >= 80) return 'from-pink-500 to-rose-600 shadow-[0_0_15px_rgba(236,72,153,0.6)]';
    if (val >= 50) return 'from-indigo-400 to-purple-600';
    return 'from-emerald-400 to-teal-600 opacity-80';
  };

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
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl h-fit">
                 <div className="flex items-center gap-2 mb-6 text-pink-400 font-bold uppercase tracking-wider text-sm">
                    <Globe className="w-5 h-5" /> Sebaran Wilayah (Simulasi)
                 </div>
                 <div className="space-y-5">
                    {regions.map(r => (
                       <div key={r.name}>
                          <div className="flex justify-between text-sm text-slate-300 mb-2 font-medium">
                             <span>{r.name}</span>
                             <span>{r.percent}%</span>
                          </div>
                          <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800/50">
                             <div className={`h-full ${r.color} rounded-full transition-all duration-1000`} style={{ width: `${r.percent}%` }}></div>
                          </div>
                       </div>
                    ))}
                 </div>
                 <div className="mt-8 p-4 bg-slate-950 rounded-xl text-xs text-slate-400 flex items-start gap-3 border border-slate-800/50">
                    <TrendingUp className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                    <p>Mayoritas pengunjung berasal dari wilayah Jawa Timur, dengan konsentrasi tertinggi di area kampus ITS Surabaya.</p>
                 </div>
              </div>

              {/* --- PEAK HOURS CHART (Colorful & Detailed) --- */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col h-full">
                 <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2 text-orange-400 font-bold uppercase tracking-wider text-sm">
                        <Clock className="w-5 h-5" /> Waktu Kunjungan (24H)
                    </div>
                    <div className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-[10px] text-slate-400 font-mono">
                        GMT+7
                    </div>
                 </div>
                 
                 {/* Graph Area */}
                 <div className="flex-1 flex items-end justify-between gap-2 sm:gap-3 h-64 mt-2 px-1">
                    {peakHoursData.map((data, i) => (
                       <div key={i} className="flex-1 flex flex-col justify-end group relative h-full">
                          {/* Value Tooltip (Hover) */}
                          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-slate-900 text-xs font-bold px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-all transform group-hover:-translate-y-1 pointer-events-none z-10 whitespace-nowrap">
                             {data.value}% Traffic
                             <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-white rotate-45"></div>
                          </div>
                          
                          {/* Bar */}
                          <div className="w-full bg-slate-800/50 rounded-t-lg relative overflow-hidden flex items-end h-full">
                             <div 
                                className={`w-full rounded-t-lg bg-gradient-to-t ${getBarGradient(data.value)} transition-all duration-1000 ease-out group-hover:brightness-110`} 
                                style={{ height: `${data.value}%` }}
                             >
                                {/* Shine Effect */}
                                <div className="absolute top-0 left-0 w-full h-[1px] bg-white/30"></div>
                             </div>
                          </div>
                          
                          {/* X-Axis Label */}
                          <div className="text-[10px] text-center text-slate-500 mt-3 font-medium group-hover:text-white transition-colors">
                             {data.time}
                          </div>
                       </div>
                    ))}
                 </div>
                 
                 {/* Summary Insight */}
                 <div className="mt-6 flex items-center gap-3 bg-gradient-to-r from-slate-800 to-slate-900 p-4 rounded-xl border border-slate-700/50">
                    <div className="p-2 bg-orange-500/20 rounded-full shrink-0">
                        <Activity className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-white">Waktu Paling Sibuk</h4>
                        <p className="text-xs text-slate-400">
                            Traffic tertinggi terjadi pada pukul <span className="text-orange-400 font-bold">20:00 - 22:00</span>. Disarankan melakukan upload konten baru sebelum jam ini.
                        </p>
                    </div>
                 </div>
              </div>

              {/* --- MOST VIEWED --- */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl lg:col-span-2">
                 <div className="flex items-center gap-2 mb-6 text-indigo-400 font-bold uppercase tracking-wider text-sm">
                    <Eye className="w-5 h-5" /> Top 5 Video Paling Banyak Ditonton
                 </div>
                 <div className="space-y-4">
                    {mostViewedVideos.map((video, index) => (
                       <div key={video.id} className="flex items-center gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800 hover:border-indigo-500/50 transition-colors group">
                          <div className={`text-2xl font-bold w-10 text-center ${index === 0 ? 'text-yellow-400' : 'text-slate-700'}`}>
                            #{index + 1}
                          </div>
                          <div className="relative w-24 h-14 rounded-lg overflow-hidden hidden sm:block shrink-0">
                             <img src={video.thumbnailUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="thumb" />
                          </div>
                          <div className="flex-1 min-w-0">
                             <h4 className="font-bold text-slate-200 truncate group-hover:text-indigo-400 transition-colors">{video.title}</h4>
                             <p className="text-xs text-slate-500 truncate">{video.caption}</p>
                          </div>
                          <div className="text-right px-2">
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
                                <td className="px-4 py-3 font-medium text-white max-w-[200px] truncate">{video.title}</td>
                                <td className="px-4 py-3 text-center text-green-400 font-bold">{video.shareCount || 0}</td>
                                <td className="px-4 py-3 text-center text-indigo-400 font-bold">{video.comments?.length || 0}</td>
                                <td className="px-4 py-3 text-center">
                                   <span className="bg-slate-800 px-3 py-1 rounded-full text-white font-bold border border-slate-700">
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
