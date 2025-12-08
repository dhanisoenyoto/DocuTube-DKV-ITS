export interface Comment {
  id: string;
  text: string;
  createdAt: number;
}

export interface VideoItem {
  id: string;
  title: string;
  driveLink: string;
  embedUrl: string;
  thumbnailUrl: string; // Base64 or external URL
  caption: string;
  createdAt: number;
  ratings: number[]; // Array of ratings (1-5)
  comments: Comment[];
}

export interface VideoFormData {
  title: string;
  driveLink: string;
  caption: string;
  thumbnailFile: File | null;
}