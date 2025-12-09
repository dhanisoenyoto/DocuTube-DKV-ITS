import { VideoItem, Comment } from '../types';
import { db, isConfigured } from './firebaseConfig';
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc, query, orderBy, arrayUnion } from 'firebase/firestore';

const STORAGE_KEY = 'drivestream_db_v1';
const COLLECTION_NAME = 'videos';

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
    comments: [
      { id: 'c1', text: 'Visualnya sangat cinematic! Color gradingnya pas banget.', createdAt: Date.now() - 100000, userName: 'Mahasiswa A' }
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
    comments: [],
    uploadedBy: { uid: 'system', name: 'System Admin' }
  }
];

// --- HELPER: LocalStorage Implementation ---
const getLocalVideos = (): VideoItem[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATA));
      return INITIAL_DATA;
    }
    return JSON.parse(stored);
  } catch (e) {
    return [];
  }
};

const saveLocalVideos = (videos: VideoItem[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(videos));
};

// --- HELPER: Sanitize Data for Firestore ---
// Firestore rejects 'undefined', so we convert object to JSON and back to remove undefined keys
const sanitizeData = (data: any) => {
  return JSON.parse(JSON.stringify(data));
};

// --- MAIN SERVICE FUNCTIONS (Async) ---

export const getVideos = async (): Promise<VideoItem[]> => {
  // 1. Try Firebase
  if (isConfigured && db) {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as VideoItem));
    } catch (error) {
      console.error("Error fetching from Firebase:", error);
      // Fallback to local if fetch fails (e.g. permission error)
      return getLocalVideos();
    }
  }
  // 2. Fallback LocalStorage
  return new Promise(resolve => {
    // Simulate network delay for realism
    setTimeout(() => resolve(getLocalVideos()), 300);
  });
};

export const saveVideo = async (video: VideoItem): Promise<void> => {
  if (isConfigured && db) {
    try {
      // Remove ID because Firestore generates it
      const { id, ...videoData } = video;
      // Sanitize to remove any 'undefined' values which cause Firestore to crash
      const safeData = sanitizeData(videoData);
      await addDoc(collection(db, COLLECTION_NAME), safeData);
      return;
    } catch (e) {
      console.error("Firebase save failed", e);
      throw e;
    }
  }
  
  // Local Fallback
  const current = getLocalVideos();
  const updated = [video, ...current];
  saveLocalVideos(updated);
};

export const updateVideo = async (updatedVideo: VideoItem): Promise<void> => {
  if (isConfigured && db) {
    try {
      const videoRef = doc(db, COLLECTION_NAME, updatedVideo.id);
      // IMPORTANT: When updating video details (Edit), we exclude ratings/comments arrays 
      // from the update payload to avoid overwriting concurrent atomic updates from other users.
      const { id, ratings, comments, ...data } = updatedVideo;
      // Sanitize data
      const safeData = sanitizeData(data);
      await updateDoc(videoRef, safeData);
      return;
    } catch (e) {
      console.error("Firebase update failed", e);
      throw e;
    }
  }

  // Local Fallback
  const current = getLocalVideos();
  const index = current.findIndex(v => v.id === updatedVideo.id);
  if (index !== -1) {
    // For local, we just replace the whole object
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

  // Local Fallback
  const current = getLocalVideos();
  const updated = current.filter(v => v.id !== id);
  saveLocalVideos(updated);
};

export const addRating = async (videoId: string, rating: number): Promise<void> => {
  // 1. Firebase Atomic Update
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
  
  // 2. Local Fallback (Standard Read-Modify-Write)
  const videos = getLocalVideos();
  const video = videos.find(v => v.id === videoId);
  if (video) {
    if (!video.ratings) video.ratings = [];
    video.ratings.push(rating);
    saveLocalVideos(videos);
  }
};

export const addComment = async (videoId: string, text: string, userName?: string): Promise<void> => {
  const newComment: Comment = {
    id: crypto.randomUUID(),
    text,
    createdAt: Date.now(),
    userName: userName || 'Anonymous'
  };

  // 1. Firebase Atomic Update
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

  // 2. Local Fallback
  const videos = getLocalVideos();
  const video = videos.find(v => v.id === videoId);
  if (video) {
    if (!video.comments) video.comments = [];
    video.comments.unshift(newComment);
    saveLocalVideos(videos);
  }
};

// --- UTILS (Sync) ---

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

// Modified fileToBase64 to include IMAGE COMPRESSION
// Firestore has a 1MB limit per document. We must compress images to ensure they fit.
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      
      img.onload = () => {
        // Create a canvas to resize/compress the image
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800; // Resize to max width 800px
        const scaleSize = MAX_WIDTH / img.width;
        
        // Calculate new dimensions
        if (scaleSize < 1) {
            canvas.width = MAX_WIDTH;
            canvas.height = img.height * scaleSize;
        } else {
            canvas.width = img.width;
            canvas.height = img.height;
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            reject(new Error("Could not get canvas context"));
            return;
        }

        // Draw image to canvas
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Convert to Base64 JPEG with 0.7 quality (Good compression)
        // This dramatically reduces file size from MBs to KBs
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
        resolve(compressedBase64);
      };
      
      img.onerror = (error) => reject(error);
    };
    
    reader.onerror = (error) => reject(error);
  });
};
