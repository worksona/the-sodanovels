// Sodanovels Audiobook Player
class AudiobookPlayer {
  constructor() {
    this.currentBook = null;
    this.chapters = [];
    this.currentChapterIndex = 0;
    this.audioElement = document.getElementById('audioPlayer');
    this.isPlaying = false;
    this.isDragging = false;
    this.isSeeking = false;
    this.isSeeking = false;
    this.progressState = null;
    this.progressState = null;
    this.installPrompt = null;
    this.lastSaveTime = 0;

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.loadLastBook();
    // Render selector but it might be empty if we hid the only other book
    this.renderBookSelector();
    this.setupPWALogic();
  }

  setupEventListeners() {
    // Audio events
    this.audioElement.addEventListener('loadedmetadata', () => this.onAudioLoaded());
    this.audioElement.addEventListener('timeupdate', () => this.onTimeUpdate());
    this.audioElement.addEventListener('ended', () => this.onAudioEnded());
    this.audioElement.addEventListener('play', () => this.onPlay());
    this.audioElement.addEventListener('pause', () => this.onPause());
    this.audioElement.addEventListener('seeking', () => this.onSeeking());
    this.audioElement.addEventListener('seeked', () => this.onSeeked());

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

    // Progress bar interactions
    const progressBar = document.getElementById('progressBar');

    // Unified Mouse/Touch interactions
    progressBar.addEventListener('mousedown', (e) => this.startDrag(e));
    progressBar.addEventListener('touchstart', (e) => this.startDrag(e), { passive: false });

    // Global drag events
    document.addEventListener('mousemove', (e) => this.onDrag(e));
    document.addEventListener('touchmove', (e) => this.onDrag(e), { passive: false });
    document.addEventListener('mouseup', () => this.endDrag());
    document.addEventListener('touchend', () => this.endDrag());

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

    // Lifecycle events for saving progress
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this.saveProgress();
    });
    window.addEventListener('pagehide', () => this.saveProgress());

    // Check URL parameters
    this.checkURLParams();
  }

  setupPWALogic() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.installPrompt = e;

      const installBtn = document.getElementById('installAppBtn');
      if (installBtn) {
        installBtn.classList.remove('hidden');
        installBtn.addEventListener('click', () => this.handleInstallClick());
      }
    });
  }

  async handleInstallClick() {
    if (!this.installPrompt) return;

    this.installPrompt.prompt();
    const result = await this.installPrompt.userChoice;

    if (result.outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }
    this.installPrompt = null;
    document.getElementById('installAppBtn').classList.add('hidden');
  }

  // Calculate progress percentage from event
  getEventPercent(e) {
    const progressBar = document.getElementById('progressBar');
    const rect = progressBar.getBoundingClientRect();
    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    let percent = (clientX - rect.left) / rect.width;
    return Math.max(0, Math.min(1, percent));
  }

  startDrag(e) {
    // Only handle left click or touch
    if (e.type === 'mousedown' && e.button !== 0) return;

    e.preventDefault();
    this.isDragging = true;

    // Calculate position
    const percent = this.getEventPercent(e);
    this.updateProgressVisuals(percent);

    // Only seek immediately if we clicked the rail (not the handle itself)
    // This prevents micro-seeks when just trying to grab the bead
    if (e.target.id !== 'progressHandle' && !isNaN(this.audioElement.duration)) {
      this.audioElement.currentTime = percent * this.audioElement.duration;
      this.saveProgress();
    }
  }

  onDrag(e) {
    if (!this.isDragging) return;
    e.preventDefault();

    const percent = this.getEventPercent(e);
    this.updateProgressVisuals(percent);

    // Update visual time display
    if (!isNaN(this.audioElement.duration)) {
      const previewTime = percent * this.audioElement.duration;
      document.getElementById('currentTime').textContent = this.formatTime(previewTime);
    }
  }

  endDrag() {
    if (!this.isDragging) return;
    this.isDragging = false;

    // Final seek to the drag position
    const handle = document.getElementById('progressHandle');
    // Using current visual position as truth
    const percent = parseFloat(handle.style.left) / 100;

    if (!isNaN(this.audioElement.duration) && !isNaN(percent)) {
      this.audioElement.currentTime = percent * this.audioElement.duration;
      this.saveProgress();
    }
  }

  updateProgressVisuals(percent) {
    document.getElementById('progressFill').style.width = `${percent * 100}%`;
    document.getElementById('progressHandle').style.left = `${percent * 100}%`;
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

    // Default to first book if no saved book or saved book not found
    // Filter for non-null/undefined in case we have gaps in array
    const validBooks = window.AUDIOBOOKS.filter(b => b);
    if (validBooks.length > 0) {
      this.loadBook(validBooks[0]);
    }
  }

  async loadBook(book) {
    // Save progress of PREVIOUS book before switching, if any
    if (this.currentBook && this.currentBook.id !== book.id) {
      this.saveProgress();
    }

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

    // Load chapters
    await this.loadChapters(book);

    // Initialize State from Storage (Read ONCE)
    const savedState = localStorage.getItem(`progress_${book.id}`);
    try {
      this.progressState = savedState ? JSON.parse(savedState) : {};
    } catch (e) {
      console.error("Error parsing saved progress, resetting", e);
      this.progressState = {};
    }

    // Ensure structure
    if (!this.progressState.chapters) {
      this.progressState.chapters = {};
    }

    // Restore Global State
    this.currentChapterIndex = 0; // Default
    let playbackRate = 1;

    if (this.progressState) {
      // Restore last active chapter
      if (this.progressState.lastChapterIndex !== undefined && this.progressState.lastChapterIndex < this.chapters.length) {
        this.currentChapterIndex = this.progressState.lastChapterIndex;
      }
      if (this.progressState.playbackRate) {
        playbackRate = this.progressState.playbackRate;
      }
    }

    this.audioElement.playbackRate = playbackRate;
    document.getElementById('playbackRate').value = playbackRate;

    // Load chapter (this will seek to correct time)
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

      item.classList.add('has-audio');

      const title = document.createElement('div');
      title.className = 'chapter-title';
      title.textContent = chapter.title;

      item.appendChild(title);
      item.addEventListener('click', () => {
        // Save current before switching
        this.saveProgress();
        this.loadChapter(index);
        this.closeSidebar();
      });

      container.appendChild(item);
    });
  }

  loadChapter(index) {
    if (index < 0 || index >= this.chapters.length) return;

    // Save previous chapter progress before switching (if we were already on a valid chapter)
    // Note: This might be redundant with the click handler but safe.
    // However, if we just loaded the book, we shouldn't overwrite with 0.

    this.currentChapterIndex = index;
    const chapter = this.chapters[index];

    // Update text
    document.getElementById('chapterTitle').textContent = chapter.title;
    document.getElementById('chapterText').innerHTML = this.formatChapterText(chapter.text);

    // Update chapter list UI
    document.querySelectorAll('.chapter-item').forEach((item, i) => {
      item.classList.toggle('active', i === index);
    });

    // Update chapter info
    document.getElementById('chapterProgress').textContent =
      `Chapter ${index + 1} of ${this.chapters.length}`;

    // Load audio
    const audioPath = `${this.currentBook.audioBasePath}/${this.currentBook.audioFilePattern(index)}`;

    // Check if we're actually changing source (optimization)
    const currentSrc = this.audioElement.getAttribute('src'); // Use getAttribute to get raw string
    // But standardized way:
    if (this.audioElement.src !== new URL(audioPath, document.baseURI).href) {
      this.audioElement.src = audioPath;
    }

    // RESTORE POSITION
    // RESTORE POSITION from in-memory state
    let savedTime = 0;

    if (this.progressState && this.progressState.chapters && this.progressState.chapters[index]) {
      savedTime = this.progressState.chapters[index].currentTime || 0;
    }

    this.audioElement.currentTime = savedTime;

    // Updates controls state (prev/next buttons)
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
      this.saveProgress(); // Save current before leaving
      this.loadChapter(this.currentChapterIndex - 1);
    }
  }

  nextChapter() {
    if (this.currentChapterIndex < this.chapters.length - 1) {
      this.saveProgress(); // Save current before leaving
      this.loadChapter(this.currentChapterIndex + 1);
    }
  }

  skip(seconds) {
    this.audioElement.currentTime = Math.max(0, Math.min(
      this.audioElement.duration,
      this.audioElement.currentTime + seconds
    ));
    this.saveProgress();
  }

  onAudioLoaded() {
    const duration = this.audioElement.duration;
    const currentTime = this.audioElement.currentTime;

    document.getElementById('duration').textContent = this.formatTime(duration);
    document.getElementById('currentTime').textContent = this.formatTime(currentTime);

    if (Number.isFinite(duration) && duration > 0) {
      const percent = (currentTime / duration);
      this.updateProgressVisuals(percent);
    }

    this.updateControls();
  }

  onTimeUpdate() {
    const currentTime = this.audioElement.currentTime;
    const duration = this.audioElement.duration;

    // Update time display
    // Only update if NOT dragging AND NOT seeking to avoid UI flickering
    if (!this.isDragging && !this.isSeeking) {
      document.getElementById('currentTime').textContent = this.formatTime(currentTime);

      if (Number.isFinite(duration) && duration > 0) {
        const percent = (currentTime / duration);
        this.updateProgressVisuals(percent);
      }
    }

    // Save progress periodically (throttled)
    // Don't save if dragging or seeking to avoid saving partial states
    const now = Date.now();
    if (!this.isDragging && !this.isSeeking && (now - this.lastSaveTime > 2000)) {
      this.saveProgress();
    }
  }

  onSeeking() {
    this.isSeeking = true;
  }

  onSeeked() {
    this.isSeeking = false;
  }

  onAudioEnded() {
    // Save completed state for this chapter
    const currentChapterIdx = this.currentChapterIndex;

    this.saveProgress(); // Should save near end time

    // Auto-advance to next chapter
    // Auto-advance to next chapter
    if (this.currentChapterIndex < this.chapters.length - 1) {
      // Mark current as done? (optional, but good for UI if we had checkmarks)

      this.nextChapter();
      // Audio play is handled in nextChapter or we call it here
      // Assuming loadChapter just loads, we need to play:
      // Since manual nextChapter() no longer plays, we must explicitly play here for auto-advance
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

    // Update In-Memory State
    // Ensure structure (should be guaranteed by loadBook, but safe guard)
    if (!this.progressState) this.progressState = { chapters: {} };
    if (!this.progressState.chapters) this.progressState.chapters = {};

    // Update current chapter info
    this.progressState.chapters[this.currentChapterIndex] = {
      currentTime: this.audioElement.currentTime,
      duration: this.audioElement.duration,
      lastPlayed: Date.now()
    };

    // Global Book State
    this.progressState.bookId = this.currentBook.id;
    this.progressState.lastChapterIndex = this.currentChapterIndex;
    this.progressState.playbackRate = this.audioElement.playbackRate;
    this.progressState.lastPlayed = Date.now();

    // Sync to Disk (Side Effect)
    try {
      localStorage.setItem(`progress_${this.currentBook.id}`, JSON.stringify(this.progressState));
      this.lastSaveTime = Date.now();
    } catch (e) {
      console.error("Storage failed", e);
    }
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

    // Filter out nulls
    const books = window.AUDIOBOOKS.filter(b => b);

    books.forEach(book => {
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
    // If book is missing (e.g. init failure), safe guard
    if (!this.currentBook) return;

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

