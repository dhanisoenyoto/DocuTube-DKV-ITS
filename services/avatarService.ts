
// --- AVATAR THEMES ---
const THEMES = {
  FILM: ['🎬', '🎥', '🍿', '🎞️', '🎭', '🎫', '🎪', '📺', '👓', '🧢', '👽', '🤠', '🕵️', '🧙‍♂️', '🧛‍♀️', '🧟', '🧚', '🧞‍♂️', '🦸', '🦹'],
  MUSIC: ['🎧', '🎸', '🎹', '🎺', '🎻', '🎤', '🎼', '🥁', '📻', '🎷', '🪕', '🪗', '🪘', '🎹', '🎙️', '🔈', '🔉', '🔊', '🎵', '🎶'],
  FOOD: ['🍔', '🍕', '🍩', '🍦', '🍟', '🌮', '🍱', '🥤', '🍇', '🍉', '🍊', '🍋', '🍌', '🍍', '🍎', '🍐', '🍑', '🍒', '🍓', '🥝']
};

const BACKGROUNDS = [
  'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-yellow-500', 
  'bg-lime-500', 'bg-green-500', 'bg-emerald-500', 'bg-teal-500', 
  'bg-cyan-500', 'bg-sky-500', 'bg-blue-500', 'bg-indigo-500', 
  'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500', 'bg-pink-500', 
  'bg-rose-500', 'bg-slate-500'
];

export interface VisitorAvatar {
  emoji: string;
  bgClass: string;
  label: string;
  id: string;
}

// Helper: Simple hash function for string
const hashCode = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

export const getVisitorId = (): string => {
  const STORAGE_KEY = 'docutube_visitor_id_v2';
  let id = localStorage.getItem(STORAGE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY, id);
  }
  return id;
};

export const generateAvatar = (seed: string): VisitorAvatar => {
  const hash = hashCode(seed);
  
  // Select Theme based on hash
  const themeKeys = Object.keys(THEMES) as Array<keyof typeof THEMES>;
  const themeIndex = hash % themeKeys.length;
  const selectedTheme = THEMES[themeKeys[themeIndex]];
  
  // Select Emoji
  const emojiIndex = (hash >> 2) % selectedTheme.length;
  const emoji = selectedTheme[emojiIndex];
  
  // Select Background
  const bgIndex = (hash >> 4) % BACKGROUNDS.length;
  const bgClass = BACKGROUNDS[bgIndex];

  // Generate Fun Label
  const adjectives = ['Happy', 'Serious', 'Curious', 'Sleepy', 'Excited', 'Chill', 'Creative', 'Bold'];
  const nouns = ['Watcher', 'Critic', 'Fan', 'Student', 'Director', 'Viewer', 'Artist', 'Expert'];
  
  const adjIndex = (hash >> 6) % adjectives.length;
  const nounIndex = (hash >> 8) % nouns.length;
  
  return {
    id: seed,
    emoji,
    bgClass,
    label: `${adjectives[adjIndex]} ${nouns[nounIndex]}`
  };
};

// Generate a list of "fake" viewers based on the video ID to simulate a crowd
export const generateCrowd = (videoId: string, count: number): VisitorAvatar[] => {
  const crowd: VisitorAvatar[] = [];
  // Cap visual crowd at 10 to prevent UI clutter
  const displayCount = Math.min(count, 12); 
  
  for (let i = 0; i < displayCount; i++) {
    // Combine videoId and index to create a consistent "random" seed for this video
    const seed = `${videoId}-viewer-${i}`;
    crowd.push(generateAvatar(seed));
  }
  return crowd;
};
