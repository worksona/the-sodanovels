// Audiobook data configuration
const AUDIOBOOKS = [
  {
    id: 'the-next-listener',
    title: 'The Next Listener',
    subtitle: 'A voyager mystery.',
    author: 'sodanovels',
    narrator: 'AI Voice: Onyx',
    totalChapters: 16,
    // Path to markdown file (relative to index.html)
    textFile: './the-next-listener/The Next Listener.md',
    // Path to audio files (chapter index will be appended)
    audioBasePath: './the-next-listener',
    audioFilePattern: (index) => `The_Next_Listener_Chapter_${index + 1}.mp3`,
    // Regex pattern to detect chapters in the markdown
    chapterRegex: /^#{1,6}\s*CHAPTER\s+/im,
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
  }
];

// Make available globally
window.AUDIOBOOKS = AUDIOBOOKS;

