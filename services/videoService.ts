
import { VideoItem, Comment, Lecturer, AboutData } from '../types';
import { db, isConfigured } from './firebaseConfig';
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc, query, orderBy, arrayUnion, increment, writeBatch, setDoc, getDoc } from 'firebase/firestore';

const STORAGE_KEY = 'drivestream_db_v1';
const LECTURER_STORAGE_KEY = 'lecturer_db_v1';
const ABOUT_STORAGE_KEY = 'about_content_v1';
const VIEWED_KEY = 'viewed_videos_list';
const COLLECTION_NAME = 'videos';
const LECTURER_COLLECTION = 'lecturers';
const ABOUT_COLLECTION = 'about_content';
const ABOUT_DOC_ID = 'main_content';

// --- INITIAL DUMMY DATA (Fallback) ---
const INITIAL_DATA: VideoItem[] = [
  {
    id: 'demo-1',
    title: 'Jejak Pesisir: Kehidupan Nelayan Kenjeran',
    driveLink: 'https://drive.google.com/file/d/123456/view',
    embedUrl: 'https://www.youtube.com/embed/LXb3EKWsInQ',
    thumbnailUrl: 'https://images.unsplash.com/photo-1534234828563-025321aa216e?auto=format&fit=crop&q=80&w=800',
    caption: 'Sebuah dokumenter pendek yang merekam denyut kehidupan para nelayan di pesisir Surabaya, menyoroti tantangan modernisasi dan tradisi yang bertahan.',
    createdAt: Date.now(),
    ratings: [5, 5, 4],
    viewCount: 125,
    shareCount: 12,
    comments: [
      { id: 'c1', text: 'Visualnya sangat cinematic! Color gradingnya pas banget.', createdAt: Date.now() - 100000, userName: 'Mahasiswa A', reaction: '🔥' }
    ],
    uploadedBy: { uid: 'system', name: 'System Admin' }
  },
  {
    id: 'demo-2',
    title: 'Pasar Tradisional: Di Balik Hiruk Pikuk',
    driveLink: 'https://drive.google.com/file/d/789012/view',
    embedUrl: 'https://www.youtube.com/embed/ysz5S6P_z-U',
    thumbnailUrl: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&q=80&w=800',
    caption: 'Eksplorasi visual tentang interaksi manusia di pasar tradisional yang mulai tergerus zaman. Tugas Akhir Videografi Kelompok 3.',
    createdAt: Date.now() - 10000,
    ratings: [4, 5],
    viewCount: 89,
    shareCount: 5,
    comments: [],
    uploadedBy: { uid: 'system', name: 'System Admin' }
  }
];

const DEFAULT_ABOUT_DATA: AboutData = {
  heroTitle: "Arsip Digital",
  heroSubtitle: "Karya Visual",
  introText: "Wadah apresiasi dan eksibisi online untuk karya film dokumenter mahasiswa Desain Komunikasi Visual ITS.",
  visionTitle: "Visi & Misi",
  visionText: "DocuTube DKV ITS lahir dari kebutuhan untuk mendokumentasikan dan mempublikasikan karya-karya terbaik mahasiswa mata kuliah Videografi.\n\nSetiap tahun, puluhan cerita inspiratif terekam dalam lensa mahasiswa, mulai dari budaya lokal, isu sosial, hingga potret humanis. Platform ini hadir agar cerita-cerita tersebut tidak hanya tersimpan di hard drive, melainkan dapat dinikmati, diapresiasi, dan menjadi referensi bagi publik luas.",
  creatorName: "Dhani Soenyoto",
  creatorRole: "Lead Developer & Designer",
  creatorBio: "Mahasiswa/Alumni DKV ITS yang berfokus pada Creative Coding dan Web Development. Mengembangkan DocuTube untuk arsip digital yang berkelanjutan.",
  address: "Gedung Desain Produk Industri & DKV, Kampus ITS Sukolilo, Surabaya, Jawa Timur 60111",
  email: "admin@dkv.its.ac.id"
};

// --- HELPER: LocalStorage Implementation ---
const getLocalVideos = (): VideoItem[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATA));
      return INITIAL_DATA;
    }
    const data = JSON.parse(stored);
    // Migration for existing data
    return data.map((v: any) => ({ 
      ...v, 
      viewCount: v.viewCount || 0,
      shareCount: v.shareCount || 0
    }));
  } catch (e) {
    return [];
  }
};

const saveLocalVideos = (videos: VideoItem[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(videos));
};

const getLocalLecturers = (): Lecturer[] => {
  try {
    const stored = localStorage.getItem(LECTURER_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
};

const saveLocalLecturers = (lecturers: Lecturer[]) => {
  localStorage.setItem(LECTURER_STORAGE_KEY, JSON.stringify(lecturers));
};

// --- HELPER: Sanitize Data for Firestore ---
const sanitizeData = (data: any) => {
  return JSON.parse(JSON.stringify(data));
};

// --- MAIN SERVICE FUNCTIONS (Async) ---

export const getVideos = async (): Promise<VideoItem[]> => {
  if (isConfigured && db) {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ 
        id: doc.id, 
        viewCount: 0, 
        shareCount: 0, 
        ...doc.data() 
      } as VideoItem));
    } catch (error) {
      console.error("Error fetching from Firebase:", error);
      return getLocalVideos();
    }
  }
  return new Promise(resolve => {
    setTimeout(() => resolve(getLocalVideos()), 300);
  });
};

export const saveVideo = async (video: VideoItem): Promise<void> => {
  if (isConfigured && db) {
    try {
      const { id, ...videoData } = video;
      const safeData = sanitizeData(videoData);
      
      if (video.thumbnailUrl && video.thumbnailUrl.length > 950000) {
        throw new Error("Ukuran gambar thumbnail terlalu besar.");
      }

      await addDoc(collection(db, COLLECTION_NAME), safeData);
      return;
    } catch (e) {
      console.error("Firebase save failed", e);
      throw e;
    }
  }
  
  const current = getLocalVideos();
  const updated = [video, ...current];
  saveLocalVideos(updated);
};

export const updateVideo = async (updatedVideo: VideoItem): Promise<void> => {
  if (isConfigured && db) {
    try {
      const videoRef = doc(db, COLLECTION_NAME, updatedVideo.id);
      const { id, ratings, comments, viewCount, shareCount, ...data } = updatedVideo; // Exclude counters/arrays
      const safeData = sanitizeData(data);

      if (updatedVideo.thumbnailUrl && updatedVideo.thumbnailUrl.length > 950000) {
        throw new Error("Ukuran gambar thumbnail terlalu besar.");
      }

      await updateDoc(videoRef, safeData);
      return;
    } catch (e) {
      console.error("Firebase update failed", e);
      throw e;
    }
  }

  const current = getLocalVideos();
  const index = current.findIndex(v => v.id === updatedVideo.id);
  if (index !== -1) {
    current[index] = updatedVideo;
    saveLocalVideos(current);
  }
};

export const deleteVideo = async (id: string): Promise<void> => {
  if (isConfigured && db) {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
      return;
    } catch (e) {
      console.error("Firebase delete failed", e);
      throw e;
    }
  }

  const current = getLocalVideos();
  const updated = current.filter(v => v.id !== id);
  saveLocalVideos(updated);
};

// --- INTERACTION SERVICES ---

export const incrementViewCount = async (videoId: string): Promise<void> => {
  if (isConfigured && db) {
    try {
      const videoRef = doc(db, COLLECTION_NAME, videoId);
      await updateDoc(videoRef, {
        viewCount: increment(1)
      });
      return;
    } catch (e) {
      console.error("Firebase view increment failed", e);
    }
  }

  const videos = getLocalVideos();
  const video = videos.find(v => v.id === videoId);
  if (video) {
    video.viewCount = (video.viewCount || 0) + 1;
    saveLocalVideos(videos);
  }
};

export const incrementShareCount = async (videoId: string): Promise<void> => {
  if (isConfigured && db) {
    try {
      const videoRef = doc(db, COLLECTION_NAME, videoId);
      await updateDoc(videoRef, {
        shareCount: increment(1)
      });
      return;
    } catch (e) {
      console.error("Firebase share increment failed", e);
    }
  }

  const videos = getLocalVideos();
  const video = videos.find(v => v.id === videoId);
  if (video) {
    video.shareCount = (video.shareCount || 0) + 1;
    saveLocalVideos(videos);
  }
};

export const addRating = async (videoId: string, rating: number): Promise<void> => {
  if (isConfigured && db) {
    try {
      const videoRef = doc(db, COLLECTION_NAME, videoId);
      await updateDoc(videoRef, {
        ratings: arrayUnion(rating)
      });
      return;
    } catch (e) {
      console.error("Firebase rating failed", e);
    }
  }
  
  const videos = getLocalVideos();
  const video = videos.find(v => v.id === videoId);
  if (video) {
    if (!video.ratings) video.ratings = [];
    video.ratings.push(rating);
    saveLocalVideos(videos);
  }
};

export const addComment = async (videoId: string, text: string, userName?: string, reaction?: string): Promise<void> => {
  const newComment: Comment = {
    id: crypto.randomUUID(),
    text,
    createdAt: Date.now(),
    userName: userName || 'Anonymous',
    reaction: reaction
  };

  if (isConfigured && db) {
    try {
      const videoRef = doc(db, COLLECTION_NAME, videoId);
      await updateDoc(videoRef, {
        comments: arrayUnion(newComment)
      });
      return;
    } catch (e) {
      console.error("Firebase comment failed", e);
    }
  }

  const videos = getLocalVideos();
  const video = videos.find(v => v.id === videoId);
  if (video) {
    if (!video.comments) video.comments = [];
    video.comments.unshift(newComment);
    saveLocalVideos(videos);
  }
};

// --- RESET STATISTICS ---

export const resetAllStatistics = async (): Promise<void> => {
  // 1. Clear Local Tracking to allow re-viewing
  localStorage.removeItem(VIEWED_KEY);

  // 2. Reset Database / Local Storage Data
  if (isConfigured && db) {
    try {
      // Fetch all videos
      const q = query(collection(db, COLLECTION_NAME));
      const querySnapshot = await getDocs(q);
      
      const batch = writeBatch(db);
      
      querySnapshot.docs.forEach((docSnapshot) => {
        const docRef = doc(db, COLLECTION_NAME, docSnapshot.id);
        batch.update(docRef, {
          viewCount: 0,
          shareCount: 0,
          ratings: [],
          comments: []
        });
      });

      await batch.commit();
      return;
    } catch (e) {
      console.error("Failed to reset statistics in Cloud", e);
      throw e;
    }
  }

  // Local Storage Reset
  const videos = getLocalVideos();
  const resetVideos = videos.map(v => ({
    ...v,
    viewCount: 0,
    shareCount: 0,
    ratings: [],
    comments: []
  }));
  saveLocalVideos(resetVideos);
};

// --- LECTURER SERVICES ---

export const getLecturers = async (): Promise<Lecturer[]> => {
  if (isConfigured && db) {
    try {
      const q = query(collection(db, LECTURER_COLLECTION));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Lecturer));
    } catch (error) {
      return getLocalLecturers();
    }
  }
  return getLocalLecturers();
};

export const saveLecturer = async (lecturer: Lecturer): Promise<void> => {
  if (isConfigured && db) {
    try {
      const { id, ...data } = lecturer;
      await addDoc(collection(db, LECTURER_COLLECTION), sanitizeData(data));
      return;
    } catch (e) { throw e; }
  }
  const current = getLocalLecturers();
  saveLocalLecturers([...current, lecturer]);
};

export const deleteLecturer = async (id: string): Promise<void> => {
  if (isConfigured && db) {
    try {
      await deleteDoc(doc(db, LECTURER_COLLECTION, id));
      return;
    } catch (e) { throw e; }
  }
  const current = getLocalLecturers();
  saveLocalLecturers(current.filter(l => l.id !== id));
};

// --- ABOUT CONTENT SERVICES ---

export const getAboutContent = async (): Promise<AboutData> => {
  if (isConfigured && db) {
    try {
      const docRef = doc(db, ABOUT_COLLECTION, ABOUT_DOC_ID);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { ...DEFAULT_ABOUT_DATA, ...docSnap.data() } as AboutData;
      }
    } catch (e) {
      console.error("Failed to fetch about content", e);
    }
  }
  // Fallback / Local
  const stored = localStorage.getItem(ABOUT_STORAGE_KEY);
  return stored ? JSON.parse(stored) : DEFAULT_ABOUT_DATA;
};

export const saveAboutContent = async (data: AboutData): Promise<void> => {
  if (isConfigured && db) {
    try {
      const docRef = doc(db, ABOUT_COLLECTION, ABOUT_DOC_ID);
      await setDoc(docRef, data); // setDoc creates or overwrites
      return;
    } catch (e) {
      console.error("Failed to save about content", e);
      throw e;
    }
  }
  localStorage.setItem(ABOUT_STORAGE_KEY, JSON.stringify(data));
};


// --- UTILS ---

export const getAverageRating = (ratings: number[]): number => {
  if (!ratings || ratings.length === 0) return 0;
  const sum = ratings.reduce((a, b) => a + b, 0);
  return Number((sum / ratings.length).toFixed(1));
};

export const parseDriveLink = (link: string): string | null => {
  const regex = /\/d\/([a-zA-Z0-9_-]+)/;
  const match = link.match(regex);
  if (match && match[1]) {
    return `https://drive.google.com/file/d/${match[1]}/preview`;
  }
  if (link.includes('drive.google.com') && link.includes('preview')) {
    return link;
  }
  if (link.includes('youtube.com') || link.includes('youtu.be')) {
      let videoId = '';
      if (link.includes('youtu.be')) {
          videoId = link.split('/').pop() || '';
      } else {
          const urlParams = new URLSearchParams(new URL(link).search);
          videoId = urlParams.get('v') || '';
      }
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  }
  return null;
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error("Waktu habis saat memproses gambar."));
    }, 10000);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const scaleSize = MAX_WIDTH / img.width;
          
          if (scaleSize < 1) {
              canvas.width = MAX_WIDTH;
              canvas.height = img.height * scaleSize;
          } else {
              canvas.width = img.width;
              canvas.height = img.height;
          }

          const ctx = canvas.getContext('2d');
          if (!ctx) {
              clearTimeout(timeoutId);
              reject(new Error("Browser error"));
              return;
          }

          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6);
          
          clearTimeout(timeoutId);
          resolve(compressedBase64);
        } catch (err) {
          clearTimeout(timeoutId);
          reject(err);
        }
      };
      img.onerror = () => {
        clearTimeout(timeoutId);
        reject(new Error("File rusak."));
      };
    };
    reader.onerror = () => {
      clearTimeout(timeoutId);
      reject(new Error("Gagal membaca file."));
    };
  });
};
