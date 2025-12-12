# sodanovels Audiobook Player

A standalone Progressive Web App (PWA) audiobook player for **The Next Listener** and **The Three Dots**.

**🎯 This is a completely self-contained standalone app with zero dependencies!**

- ✅ No build step required
- ✅ No Node.js or npm needed
- ✅ Pure vanilla JavaScript
- ✅ Just upload and run
- ✅ All audiobook content included
- ✅ Works offline after first load

## 🎉 PWA Features

- 📱 **Installable** - Add to home screen like a native app
- 🎵 **Background Audio** - Keeps playing when screen is locked (perfect for driving!)
- 📴 **Offline Capable** - Listen without internet after first load
- 🔄 **Auto-updates** - New content automatically synced
- 💾 **Progress Saved** - Never lose your place
- 🏠 **Standalone Mode** - Runs without browser chrome

## Features

- 📚 **Two Featured Audiobooks**
  - The Next Listener (16 chapters)
  - The Three Dots (10 chapters)

- 🎵 **Full Audio Player**
  - Play/Pause with spacebar
  - Skip forward/backward (10 seconds)
  - Chapter navigation
  - Adjustable playback speed (0.75x - 2.0x)
  - Progress bar with seeking

- 💾 **Progress Tracking**
  - Automatically saves your position
  - Remembers last played book
  - Resumes from where you left off
  - Uses browser localStorage

- 📱 **Mobile Friendly**
  - Responsive design
  - Touch-optimized controls
  - Slide-out sidebar
  - Works on all devices

- ⌨️ **Keyboard Shortcuts**
  - `Space` - Play/Pause
  - `←` - Skip backward 10s
  - `→` - Skip forward 10s
  - `↑` - Previous chapter
  - `↓` - Next chapter
  - `Esc` - Close modals/sidebar

- 🔗 **Shareable Links**
  - Direct links to specific books
  - Copy shareable URLs
  - URL parameters: `?book=the-next-listener`

## Setup

### 🚀 Quick Start (Important!)

**Before deploying, create PWA icons:**
1. Open `create-icons.html` in your browser
2. Click "Download 192x192" and save as `icon-192.png`
3. Click "Download 512x512" and save as `icon-512.png`
4. Place both files in the `the-sodanovels/` directory

See [PWA-SETUP.md](./PWA-SETUP.md) for detailed PWA configuration.

### Local Testing

1. **Clone or download** this directory
2. **Start a local server** (required for file loading):

```bash
# Option 1: Python
python3 -m http.server 8000

# Option 2: Node.js (npx)
npx serve

# Option 3: VS Code Live Server extension
```

3. **Open in browser**:
```
http://localhost:8000
```

### Deploy to Netlify

1. **Push to GitHub**:
```bash
git add the-sodanovels/
git commit -m "Add standalone audiobook player"
git push
```

2. **Create new Netlify site**:
   - Go to https://app.netlify.com/
   - Click "Add new site" → "Import an existing project"
   - Select your repository
   - **Base directory**: `the-sodanovels`
   - **Build command**: (leave empty - static files)
   - **Publish directory**: `.` (current directory)

3. **Configure redirects** (optional):
   Create `_redirects` file:
```
/*    /index.html   200
```

### Deploy to Any Static Host

The player is pure HTML/CSS/JS with no build step required. Simply:

1. Upload all files to your host
2. Ensure the audio files are accessible at the correct paths
3. Configure CORS if needed (should work by default with relative paths)

## File Structure

```
the-sodanovels/
├── index.html           # Main HTML file
├── styles.css           # All styling
├── data.js              # Audiobook configuration
├── player.js            # Player functionality
├── README.md           # This file
└── _redirects          # Netlify redirects (optional)

Required external files (parent directories):
├── the-next-listener/
│   ├── The Next Listener.md
│   └── The_Next_Listener_Chapter_*.mp3
└── the-three-dots/
    ├── three dots - dime store mystery.md
    └── the_three_dots_chapter_*.mp3
```

## Configuration

To add or modify audiobooks, edit `data.js`:

```javascript
{
  id: 'your-book-id',
  title: 'Book Title',
  subtitle: 'Genre/Description',
  author: 'Author Name',
  narrator: 'AI Voice: VoiceName',
  totalChapters: 10,
  textFile: '../path/to/book.md',
  audioBasePath: '../path/to/audio',
  audioFilePattern: (index) => `chapter_${index + 1}.mp3`,
  chapterRegex: /^#{1,6}\s*CHAPTER\s+/im,
}
```

## Browser Compatibility

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers (iOS Safari, Chrome Android)

## Features in Detail

### Progress Tracking

Progress is saved automatically:
- Every 5 seconds during playback
- When pausing
- When changing chapters

Data stored in localStorage:
```javascript
{
  bookId: 'the-next-listener',
  chapterIndex: 5,
  currentTime: 123.45,
  duration: 300.0,
  playbackRate: 1.25,
  lastPlayed: 1234567890000
}
```

### Chapter Detection

Chapters are parsed from markdown files using regex:
- Matches any heading with "CHAPTER" (case insensitive)
- Supports markdown headings (#, ##, ###, etc.)
- Extracts chapter title and content
- Maps to corresponding audio files

### Audio Loading

Audio files are loaded on-demand:
- Only current chapter is loaded
- Previous position restored automatically
- Smooth transitions between chapters
- Auto-advance to next chapter when finished

## Customization

### Styling

All styles are in `styles.css`. Key CSS variables:

```css
:root {
  --color-bg: #f5f5f5;           /* Background color */
  --color-surface: #ffffff;      /* Card/surface color */
  --color-border: #e5e5e5;       /* Border color */
  --color-text: #171717;         /* Text color */
  --color-text-muted: #737373;   /* Muted text */
  --color-primary: #ea580c;      /* Accent color */
  --sidebar-width: 320px;        /* Sidebar width */
}
```

### Chapter Parsing

Customize the chapter regex in `data.js` to match your markdown format:

```javascript
// Matches: # CHAPTER ONE, ## Chapter 1, ### CHAPTER ONE: Title
chapterRegex: /^#{1,6}\s*CHAPTER\s+/im

// Match any heading:
chapterRegex: /^#{1,6}\s+/m

// Match specific pattern:
chapterRegex: /^## Part \d+/m
```

## Troubleshooting

### Audio files not loading

- Check file paths in `data.js`
- Ensure audio files exist in parent directories
- Check browser console for 404 errors
- Verify CORS if serving from different domains

### Chapters not appearing

- Check markdown file path in `data.js`
- Verify chapter regex matches your markdown format
- Check browser console for parsing errors
- Ensure markdown file is accessible

### Progress not saving

- Check localStorage is enabled in browser
- Try clearing browser data and refreshing
- Check browser console for errors
- Ensure localStorage quota not exceeded

### Mobile issues

- Ensure you're using a local server (not file://)
- Check audio file formats (MP3 recommended)
- Test in different mobile browsers
- Check touch events are not blocked

## Performance

- **Initial load**: < 100KB (HTML + CSS + JS)
- **Markdown**: ~100KB per book
- **Audio**: 2-10MB per chapter (on-demand)
- **Memory**: Efficient, only one audio file loaded at a time
- **Storage**: Progress data ~1KB per book

## Security

- No external dependencies
- No tracking or analytics
- Data stored locally only
- No server-side processing
- Safe to host anywhere

## License

Part of the sodanovels Audiobook Generator project.

## Support

For issues or questions:
1. Check the browser console for errors
2. Verify file paths in `data.js`
3. Test with a local server
4. Check README troubleshooting section

---

Made with ❤️ by sodanovels

