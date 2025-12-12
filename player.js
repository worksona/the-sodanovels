// Sodanovels Audiobook Player
class AudiobookPlayer {
  constructor() {
    this.currentBook = null;
    this.chapters = [];
    this.currentChapterIndex = 0;
    this.audioElement = document.getElementById('audioPlayer');
    this.isPlaying = false;
    
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.loadLastBook();
    this.renderBookSelector();
  }

  setupEventListeners() {
    // Audio events
    this.audioElement.addEventListener('loadedmetadata', () => this.onAudioLoaded());
    this.audioElement.addEventListener('timeupdate', () => this.onTimeUpdate());
    this.audioElement.addEventListener('ended', () => this.onAudioEnded());
    this.audioElement.addEventListener('play', () => this.onPlay());
    this.audioElement.addEventListener('pause', () => this.onPause());

    // Control buttons
    document.getElementById('playPause').addEventListener('click', () => this.togglePlayPause());
    document.getElementById('prevChapter').addEventListener('click', () => this.previousChapter());
    document.getElementById('nextChapter').addEventListener('click', () => this.nextChapter());
    document.getElementById('skipBackward').addEventListener('click', () => this.skip(-10));
    document.getElementById('skipForward').addEventListener('click', () => this.skip(10));
    
    // Playback rate
    document.getElementById('playbackRate').addEventListener('change', (e) => {
      this.audioElement.playbackRate = parseFloat(e.target.value);
      this.saveProgress();
    });

    // Progress bar
    const progressBar = document.getElementById('progressBar');
    progressBar.addEventListener('click', (e) => this.seek(e));
    
    // Sidebar toggles
    const sidebarToggleHeader = document.getElementById('sidebarToggleHeader');
    if (sidebarToggleHeader) {
      sidebarToggleHeader.addEventListener('click', () => this.toggleSidebar());
    }
    document.getElementById('closeSidebar').addEventListener('click', () => this.closeSidebar());
    
    // Book selector
    document.getElementById('switchBookBtn').addEventListener('click', () => this.showBookSelector());
    document.getElementById('closeBookSelector').addEventListener('click', () => this.hideBookSelector());
    document.querySelector('.modal-overlay').addEventListener('click', () => this.hideBookSelector());
    
    // Share button
    document.getElementById('shareBtn').addEventListener('click', () => this.shareBook());
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    
    // Check URL parameters
    this.checkURLParams();
  }

  checkURLParams() {
    const params = new URLSearchParams(window.location.search);
    const bookId = params.get('book');
    if (bookId) {
      const book = window.AUDIOBOOKS.find(b => b.id === bookId);
      if (book) {
        this.loadBook(book);
      }
    }
  }

  loadLastBook() {
    const savedBookId = localStorage.getItem('currentBook');
    if (savedBookId) {
      const book = window.AUDIOBOOKS.find(b => b.id === savedBookId);
      if (book) {
        this.loadBook(book);
        return;
      }
    }
    
    // Default to first book if no saved book
    if (window.AUDIOBOOKS.length > 0) {
      this.loadBook(window.AUDIOBOOKS[0]);
    }
  }

  async loadBook(book) {
    this.currentBook = book;
    localStorage.setItem('currentBook', book.id);
    
    // Update URL
    const url = new URL(window.location.href);
    url.searchParams.set('book', book.id);
    window.history.replaceState({}, '', url);
    
    // Update UI
    document.getElementById('bookTitle').textContent = book.title;
    document.getElementById('bookSubtitle').textContent = `${book.subtitle} • ${book.narrator}`;
    
    // Update header title to show current book
    const headerTitle = document.getElementById('headerTitle');
    headerTitle.innerHTML = `<span class="italic">${book.title}</span>`;
    document.title = `${book.title} - sodanovels`;
    
    // Load chapters
    await this.loadChapters(book);
    
    // Load saved progress
    const progress = this.loadProgress();
    if (progress) {
      this.currentChapterIndex = progress.chapterIndex || 0;
      this.audioElement.playbackRate = progress.playbackRate || 1;
      document.getElementById('playbackRate').value = this.audioElement.playbackRate;
    }
    
    // Load chapter
    this.loadChapter(this.currentChapterIndex);
    
    this.hideBookSelector();
    this.closeSidebar();
  }

  async loadChapters(book) {
    try {
      const response = await fetch(book.textFile);
      const text = await response.text();
      
      this.chapters = this.parseChapters(text, book.chapterRegex);
      this.renderChapterList();
    } catch (error) {
      console.error('Error loading chapters:', error);
      this.chapters = [];
    }
  }

  parseChapters(text, regex) {
    const lines = text.split('\n');
    const chapters = [];
    let currentChapter = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (regex.test(line)) {
        // Save previous chapter
        if (currentChapter) {
          chapters.push(currentChapter);
        }
        
        // Start new chapter
        currentChapter = {
          title: line.replace(/^#+\s*/, '').trim(),
          text: '',
          startLine: i
        };
      } else if (currentChapter) {
        currentChapter.text += line + '\n';
      }
    }

    // Add last chapter
    if (currentChapter) {
      chapters.push(currentChapter);
    }

    return chapters;
  }

  renderChapterList() {
    const container = document.getElementById('chapterList');
    container.innerHTML = '';
    
    this.chapters.forEach((chapter, index) => {
      const item = document.createElement('div');
      item.className = 'chapter-item';
      if (index === this.currentChapterIndex) {
        item.classList.add('active');
      }
      
      // Check if audio exists for this chapter
      const audioPath = `${this.currentBook.audioBasePath}/${this.currentBook.audioFilePattern(index)}`;
      item.classList.add('has-audio');
      
      const title = document.createElement('div');
      title.className = 'chapter-title';
      title.textContent = chapter.title;
      
      item.appendChild(title);
      item.addEventListener('click', () => {
        this.loadChapter(index);
        this.closeSidebar();
      });
      
      container.appendChild(item);
    });
  }

  loadChapter(index) {
    if (index < 0 || index >= this.chapters.length) return;
    
    this.currentChapterIndex = index;
    const chapter = this.chapters[index];
    
    // Update text
    document.getElementById('chapterTitle').textContent = chapter.title;
    document.getElementById('chapterText').innerHTML = this.formatChapterText(chapter.text);
    
    // Update chapter list
    document.querySelectorAll('.chapter-item').forEach((item, i) => {
      item.classList.toggle('active', i === index);
    });
    
    // Update chapter info
    document.getElementById('chapterProgress').textContent = 
      `Chapter ${index + 1} of ${this.chapters.length}`;
    
    // Load audio
    const audioPath = `${this.currentBook.audioBasePath}/${this.currentBook.audioFilePattern(index)}`;
    this.audioElement.src = audioPath;
    
    // Load saved position for this chapter
    const progress = this.loadProgress();
    if (progress && progress.chapterIndex === index && progress.currentTime) {
      this.audioElement.currentTime = progress.currentTime;
    }
    
    // Update controls
    this.updateControls();
    
    // Scroll chapter into view
    const activeChapter = document.querySelector('.chapter-item.active');
    if (activeChapter) {
      activeChapter.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  formatChapterText(text) {
    // Parse markdown to HTML
    return this.parseMarkdown(text);
  }

  parseMarkdown(markdown) {
    let html = markdown;
    
    // Headers (# to ######)
    html = html.replace(/^######\s+(.+)$/gm, '<h6>$1</h6>');
    html = html.replace(/^#####\s+(.+)$/gm, '<h5>$1</h5>');
    html = html.replace(/^####\s+(.+)$/gm, '<h4>$1</h4>');
    html = html.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>');
    
    // Bold **text** or __text__
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');
    
    // Italic *text* or _text_
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    html = html.replace(/_(.+?)_/g, '<em>$1</em>');
    
    // Links [text](url)
    html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank">$1</a>');
    
    // Line breaks and paragraphs
    const lines = html.split('\n');
    const formatted = [];
    let inParagraph = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip empty lines
      if (!line) {
        if (inParagraph) {
          formatted.push('</p>');
          inParagraph = false;
        }
        continue;
      }
      
      // Check if line is already wrapped in HTML tag
      if (line.startsWith('<h') || line.startsWith('<ul') || line.startsWith('<ol') || 
          line.startsWith('<li') || line.startsWith('<div') || line.startsWith('<blockquote')) {
        if (inParagraph) {
          formatted.push('</p>');
          inParagraph = false;
        }
        formatted.push(line);
      } else {
        // Regular text - wrap in paragraph
        if (!inParagraph) {
          formatted.push('<p>');
          inParagraph = true;
        } else {
          formatted.push(' ');
        }
        formatted.push(line);
      }
    }
    
    // Close last paragraph if open
    if (inParagraph) {
      formatted.push('</p>');
    }
    
    return formatted.join('');
  }

  togglePlayPause() {
    if (this.isPlaying) {
      this.audioElement.pause();
    } else {
      this.audioElement.play();
    }
  }

  previousChapter() {
    if (this.currentChapterIndex > 0) {
      this.loadChapter(this.currentChapterIndex - 1);
      this.audioElement.play();
    }
  }

  nextChapter() {
    if (this.currentChapterIndex < this.chapters.length - 1) {
      this.loadChapter(this.currentChapterIndex + 1);
      this.audioElement.play();
    }
  }

  skip(seconds) {
    this.audioElement.currentTime = Math.max(0, Math.min(
      this.audioElement.duration,
      this.audioElement.currentTime + seconds
    ));
  }

  seek(event) {
    const progressBar = event.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const percent = (event.clientX - rect.left) / rect.width;
    this.audioElement.currentTime = percent * this.audioElement.duration;
  }

  onAudioLoaded() {
    const duration = this.audioElement.duration;
    document.getElementById('duration').textContent = this.formatTime(duration);
    this.updateControls();
  }

  onTimeUpdate() {
    const currentTime = this.audioElement.currentTime;
    const duration = this.audioElement.duration;
    
    // Update time display
    document.getElementById('currentTime').textContent = this.formatTime(currentTime);
    
    // Update progress bar
    const percent = (currentTime / duration) * 100;
    document.getElementById('progressFill').style.width = `${percent}%`;
    document.getElementById('progressHandle').style.left = `${percent}%`;
    
    // Save progress periodically (every 5 seconds)
    if (Math.floor(currentTime) % 5 === 0) {
      this.saveProgress();
    }
  }

  onAudioEnded() {
    // Auto-advance to next chapter
    if (this.currentChapterIndex < this.chapters.length - 1) {
      this.nextChapter();
      this.audioElement.play();
    } else {
      this.isPlaying = false;
      this.updatePlayPauseButton();
    }
  }

  onPlay() {
    this.isPlaying = true;
    this.updatePlayPauseButton();
  }

  onPause() {
    this.isPlaying = false;
    this.updatePlayPauseButton();
    this.saveProgress();
  }

  updatePlayPauseButton() {
    document.getElementById('playIcon').style.display = this.isPlaying ? 'none' : 'block';
    document.getElementById('pauseIcon').style.display = this.isPlaying ? 'block' : 'none';
  }

  updateControls() {
    document.getElementById('prevChapter').disabled = this.currentChapterIndex === 0;
    document.getElementById('nextChapter').disabled = this.currentChapterIndex === this.chapters.length - 1;
  }

  formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  saveProgress() {
    if (!this.currentBook) return;
    
    const progress = {
      bookId: this.currentBook.id,
      chapterIndex: this.currentChapterIndex,
      currentTime: this.audioElement.currentTime,
      duration: this.audioElement.duration,
      playbackRate: this.audioElement.playbackRate,
      lastPlayed: Date.now()
    };
    
    localStorage.setItem(`progress_${this.currentBook.id}`, JSON.stringify(progress));
  }

  loadProgress() {
    if (!this.currentBook) return null;
    
    const saved = localStorage.getItem(`progress_${this.currentBook.id}`);
    if (saved) {
      return JSON.parse(saved);
    }
    return null;
  }

  toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
  }

  closeSidebar() {
    document.getElementById('sidebar').classList.remove('open');
  }

  showBookSelector() {
    document.getElementById('bookSelector').classList.remove('hidden');
  }

  hideBookSelector() {
    document.getElementById('bookSelector').classList.add('hidden');
  }

  renderBookSelector() {
    const container = document.getElementById('bookList');
    container.innerHTML = '';
    
    window.AUDIOBOOKS.forEach(book => {
      const card = document.createElement('div');
      card.className = 'book-card';
      
      card.innerHTML = `
        <h3>${book.title}</h3>
        <p>${book.subtitle}</p>
      `;
      
      card.addEventListener('click', () => this.loadBook(book));
      container.appendChild(card);
    });
  }

  async shareBook() {
    const url = new URL(window.location.href);
    url.searchParams.set('book', this.currentBook.id);
    
    try {
      await navigator.clipboard.writeText(url.toString());
      this.showToast('Link copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  }

  showToast(message) {
    const toast = document.getElementById('shareMessage');
    toast.textContent = message;
    toast.classList.remove('hidden');
    setTimeout(() => {
      toast.classList.add('hidden');
    }, 3000);
  }

  handleKeyboard(event) {
    // Don't handle if user is typing in an input
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'SELECT') {
      return;
    }
    
    switch (event.key) {
      case ' ':
        event.preventDefault();
        this.togglePlayPause();
        break;
      case 'ArrowLeft':
        event.preventDefault();
        this.skip(-10);
        break;
      case 'ArrowRight':
        event.preventDefault();
        this.skip(10);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.previousChapter();
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.nextChapter();
        break;
      case 'Escape':
        this.closeSidebar();
        this.hideBookSelector();
        break;
    }
  }
}

// Initialize player when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.player = new AudiobookPlayer();
});

