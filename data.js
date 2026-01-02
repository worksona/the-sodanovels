// Audiobook data configuration
const AUDIOBOOKS = [
  {
    id: 'the-next-listener',
    title: 'The Next Listener',
    subtitle: 'A voyager mystery.',
    author: 'sodanovels',
    narrator: 'AI Narrator: Nova',
    totalChapters: 17,
    // Path to markdown file (relative to index.html)
    textFile: './the-next-listener/The-Next-Listener.md',
    // Path to audio files (chapter index will be appended)
    audioBasePath: './the-next-listener',
    audioFilePattern: (index) => `The_Next_Listener_Chapter_${index + 1}.mp3`,
    // Regex pattern to detect chapters in the markdown
    chapterRegex: /^#{1,6}\s*CHAPTER\s+/im,
  },
  {
    id: 'double-cross',
    title: 'Double Cross',
    subtitle: 'The Tolnest Protocol',
    author: 'sodanovels',
    narrator: 'AI Narrator',
    totalChapters: 13,
    textFile: './double-cross/DOUBLE-CROSS-The-Tolnest-Protocol.md',
    audioBasePath: './double-cross',
    audioFilePattern: (index) => `Double_Cross_Chapter_${index + 1}.mp3`,
    chapterRegex: /^#{1,6}\s*\*\*CHAPTER/im,
  },
  {
    id: 'the-three-dots',
    title: 'The Three Dots',
    subtitle: 'A dime store mystery.',
    author: 'sodanovels',
    narrator: 'AI Voice: Alloy',
    totalChapters: 10,
    textFile: './the-three-dots/three dots - dime store mystery.md',
    audioBasePath: './the-three-dots',
    audioFilePattern: (index) => `the_three_dots_chapter_${index + 1}.mp3`,
    chapterRegex: /^#{1,6}\s*CHAPTER\s+/im,
  },
  {
    id: 'the-angle',
    title: 'The Angle',
    subtitle: 'A geometric mystery.',
    author: 'sodanovels',
    narrator: 'AI Narrator',
    totalChapters: 13,
    textFile: './the-angle/The-Angle.md',
    audioBasePath: './the-angle',
    audioFilePattern: (index) => `The_Angle_Chapter_${index + 1}.mp3`,
    chapterRegex: /^##\s*\*\*Chapter\s+/im,
  },
  {
    id: 'out-of-phase',
    title: 'Out of Phase',
    subtitle: 'A sci-fi noir story.',
    author: 'sodanovels',
    narrator: 'AI Narrator',
    totalChapters: 13,
    textFile: './out-of-phase/Out of Phase.md',
    audioBasePath: './out-of-phase',
    audioFilePattern: (index) => `Out_of_Phase_Chapter_${index + 1}.mp3`,
    chapterRegex: /^##\s*\*\*Chapter\s+/im,
  }
];

// Make available globally
window.AUDIOBOOKS = AUDIOBOOKS;

