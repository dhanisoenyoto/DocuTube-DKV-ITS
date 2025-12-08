import { VideoItem, Comment } from '../types';

const STORAGE_KEY = 'drivestream_db_v1';

// Initial dummy data to populate the app if empty
const INITIAL_DATA: VideoItem[] = [
  {
    id: 'demo-1',
    title: 'Scenic Nature',
    driveLink: 'https://drive.google.com/file/d/123456/view',
    embedUrl: 'https://www.youtube.com/embed/LXb3EKWsInQ',
    thumbnailUrl: 'https://picsum.photos/800/450?random=1',
    caption: 'A beautiful capture of nature in its purest form.',
    createdAt: Date.now(),
    ratings: [5, 4, 5],
    comments: [
      { id: 'c1', text: 'Amazing view!', createdAt: Date.now() - 100000 }
    ]
  },
  {
    id: 'demo-2',
    title: 'Urban Exploration',
    driveLink: 'https://drive.google.com/file/d/789012/view',
    embedUrl: 'https://www.youtube.com/embed/ysz5S6P_z-U',
    thumbnailUrl: 'https://picsum.photos/800/450?random=2',
    caption: 'Exploring the depths of the city architecture.',
    createdAt: Date.now() - 10000,
    ratings: [3, 4],
    comments: []
  }
];

export const getVideos = (): VideoItem[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATA));
      return INITIAL_DATA;
    }
    return JSON.parse(stored);
  } catch (e) {
    console.error("Failed to load videos", e);
    return [];
  }
};

export const saveVideo = (video: VideoItem): void => {
  const currentVideos = getVideos();
  // Ensure new fields exist if we are saving a new object manually
  if (!video.ratings) video.ratings = [];
  if (!video.comments) video.comments = [];
  
  const updatedVideos = [video, ...currentVideos];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedVideos));
};

export const updateVideo = (updatedVideo: VideoItem): void => {
  const currentVideos = getVideos();
  const index = currentVideos.findIndex(v => v.id === updatedVideo.id);
  if (index !== -1) {
    currentVideos[index] = updatedVideo;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentVideos));
  }
};

export const deleteVideo = (id: string): void => {
  const currentVideos = getVideos();
  const updatedVideos = currentVideos.filter(v => v.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedVideos));
};

export const addRating = (videoId: string, rating: number): void => {
  const videos = getVideos();
  const video = videos.find(v => v.id === videoId);
  if (video) {
    if (!video.ratings) video.ratings = [];
    video.ratings.push(rating);
    updateVideo(video);
  }
};

export const addComment = (videoId: string, text: string): void => {
  const videos = getVideos();
  const video = videos.find(v => v.id === videoId);
  if (video) {
    if (!video.comments) video.comments = [];
    const newComment: Comment = {
      id: crypto.randomUUID(),
      text,
      createdAt: Date.now()
    };
    video.comments.unshift(newComment); // Add to top
    updateVideo(video);
  }
};

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
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};