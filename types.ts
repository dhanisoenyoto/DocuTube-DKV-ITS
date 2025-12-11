
export interface Comment {
  id: string;
  text: string;
  createdAt: number;
  userName?: string; // Optional: who commented
  reaction?: string; // New: Emoticon reaction
}

export interface User {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

export interface VideoItem {
  id: string;
  title: string;
  driveLink: string;
  embedUrl: string;
  thumbnailUrl: string; 
  caption: string;
  createdAt: number;
  ratings: number[];
  comments: Comment[];
  viewCount: number; // New: View counter
  uploadedBy?: {
    uid: string;
    name: string;
    photoURL?: string;
  };
}

export interface Lecturer {
  id: string;
  name: string;
  nip: string;
  bio: string;
  photoUrl: string;
}

export interface VideoFormData {
  title: string;
  driveLink: string;
  caption: string;
  thumbnailFile: File | null;
}

export interface VisitorAvatar {
  emoji: string;
  bgClass: string;
  label: string;
  id: string;
}
