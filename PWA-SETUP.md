# PWA Setup Guide

## Overview
The sodanovels audiobook player is now a full Progressive Web App (PWA) that can be installed on devices and supports background audio playback.

## PWA Features

### ✅ Implemented
- **Installable**: Add to home screen on mobile/desktop
- **Offline capable**: Service worker caches assets
- **Background audio**: Continues playing when screen is locked
- **App shortcuts**: Quick access to each audiobook
- **Standalone mode**: Runs like a native app
- **Auto-updates**: Service worker updates automatically
- **Progress persistence**: Saves even when offline

### 📱 Mobile Benefits
- **Lock screen controls**: Play/pause from lock screen
- **Background playback**: Listen while using other apps
- **Home screen icon**: Launch like a native app
- **No browser chrome**: Full-screen immersive experience
- **Offline listening**: Works without internet after first load

### 🚗 Perfect for Driving
- **Background audio**: Keep listening when screen locks
- **Lock screen controls**: Control playback without unlocking
- **Auto-save progress**: Never lose your place
- **Reliable playback**: Continues even if connection drops

## Required Files

### Icons
You need to create two icon files:
- `icon-192.png` (192x192 pixels)
- `icon-512.png` (512x512 pixels)

#### Quick Icon Creation

**Option 1: Use the Icon Generator**
1. Open `create-icons.html` in a browser
2. Click the download buttons
3. Save as `icon-192.png` and `icon-512.png`

**Option 2: Use Online Tool**
1. Go to https://www.favicon-generator.org/
2. Upload a square image (your logo/design)
3. Generate and download the icons
4. Rename to `icon-192.png` and `icon-512.png`

**Option 3: Use Design Software**
Create a square image with:
- Background: Orange gradient (#ea580c to #c2410c)
- Text: "sodanovels" (white, italic)
- Icon: 🎧 emoji or headphone graphic
- Export at 192x192 and 512x512

### Files Created
- ✅ `manifest.json` - PWA configuration
- ✅ `service-worker.js` - Offline & caching logic
- ✅ `create-icons.html` - Icon generator tool
- ⚠️ `icon-192.png` - You need to create this
- ⚠️ `icon-512.png` - You need to create this

## Testing Locally

### 1. Serve with HTTPS
PWAs require HTTPS (except localhost). Use one of these:

```bash
# Option 1: Local server (works for testing)
python3 -m http.server 8000
# Visit: http://localhost:8000

# Option 2: With HTTPS (better for testing)
npx serve -s . --ssl
# Visit: https://localhost:5000

# Option 3: Using ngrok (test on mobile)
npx serve -s .
ngrok http 8000
# Use the ngrok HTTPS URL on your phone
```

### 2. Check PWA Readiness

**Chrome DevTools:**
1. Open DevTools (F12)
2. Go to "Application" tab
3. Check "Manifest" section
4. Check "Service Workers" section
5. Run "Lighthouse" audit for PWA score

**Firefox:**
1. Open DevTools (F12)
2. Go to "Application" → "Manifest"
3. Check for errors

### 3. Test Install

**Desktop (Chrome/Edge):**
- Look for install icon in address bar
- Click to install
- App opens in standalone window

**Android:**
- Open in Chrome
- Tap menu → "Install app" or "Add to Home Screen"
- Icon appears on home screen

**iOS (Safari):**
- Tap Share button
- Scroll down → "Add to Home Screen"
- Name and add icon

### 4. Test Background Audio

1. Install the PWA
2. Start playing an audiobook
3. Lock your device screen
4. Audio should continue playing
5. Use lock screen controls

## Deployment

### Deploy to Netlify

1. **Push icons to repository**:
```bash
# After creating icons
git add icon-192.png icon-512.png
git commit -m "Add PWA icons"
git push
```

2. **Deploy normally**:
   - Netlify will serve all files including manifest
   - HTTPS is automatic on Netlify
   - Service worker will register automatically

3. **Verify PWA**:
   - Visit your deployed site
   - Check for install prompt
   - Install and test

### Custom Domain (Recommended)
PWAs work best with a custom domain:
```
https://audiobooks.sodanovels.com
```

Configure in Netlify:
1. Site settings → Domain management
2. Add custom domain
3. Configure DNS (CNAME or A record)
4. SSL certificate auto-generated

## How It Works

### Service Worker
The service worker (`service-worker.js`):
1. **Caches static assets** on first visit
2. **Network-first for audio**: Always try to fetch, fallback to cache
3. **Cache-first for static**: Instant load from cache
4. **Auto-updates**: New versions activate automatically

### Caching Strategy

**Static Assets** (HTML, CSS, JS):
- Cache first, network fallback
- Updates on service worker update
- Instant load after first visit

**Audio Files** (.mp3):
- Network first, cache as backup
- Cached for offline listening
- Only caches listened chapters

**Text Files** (.md):
- Network first, cache as backup
- Always tries to get latest version

### Storage
- **Service Worker Cache**: Audio files, text, static assets
- **localStorage**: Progress, settings, preferences
- **Persistent Storage**: Requested automatically when installed

## Browser Support

### Full PWA Support
- ✅ Chrome 90+ (Android/Desktop)
- ✅ Edge 90+ (Desktop)
- ✅ Samsung Internet 14+
- ⚠️ Safari 14+ (iOS) - Limited (no background audio sync)

### Background Audio
- ✅ Android (Chrome, Samsung Internet)
- ✅ Desktop (Chrome, Edge, Firefox)
- ⚠️ iOS - Works in standalone mode, limited in browser

### Installation
- ✅ Android - Full install support
- ✅ Desktop - Full install support
- ⚠️ iOS - "Add to Home Screen" (not full PWA)

## Troubleshooting

### Install Prompt Not Showing
- **Check HTTPS**: Must use HTTPS or localhost
- **Check manifest**: No errors in DevTools
- **Check icons**: Both icon files must exist
- **Check service worker**: Must register successfully
- **Wait**: Prompt may not show immediately

### Service Worker Not Registering
```javascript
// Check in console:
navigator.serviceWorker.getRegistrations().then(console.log)

// Unregister if stuck:
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(r => r.unregister())
})
```

### Background Audio Not Working

**Android:**
- Ensure PWA is installed (not just bookmarked)
- Check app has audio permission
- Try restarting the app

**iOS:**
- Background audio is limited
- Must add to home screen
- Works better in iOS 16.4+

### Cache Issues
Clear cache in DevTools:
1. Application → Storage → Clear site data
2. Application → Service Workers → Unregister
3. Refresh page

### Audio Not Playing Offline
- Audio must be cached (play it online first)
- Check cache size limit
- Check service worker is active

## Performance Tips

### Optimize Audio Files
- Use MP3 format (best compatibility)
- Bitrate: 64-128 kbps (speech is fine at lower bitrates)
- Mono audio for speech (half the file size)
- Compress with tools like ffmpeg

### Manage Cache Size
```javascript
// Check cache usage
navigator.storage.estimate().then(estimate => {
  console.log(`Using ${estimate.usage} of ${estimate.quota} bytes`);
});
```

### Clear Old Cache
Service worker automatically clears old versions, but you can manually:
```javascript
caches.keys().then(names => {
  names.forEach(name => caches.delete(name));
});
```

## Advanced Features

### App Shortcuts
Configured in manifest.json:
- Quick access to each audiobook
- Long-press app icon on Android
- Right-click on desktop

### Share Target
Share web pages to the app:
- Receives shared text/links
- Can implement "share audiobook" feature

### Background Sync
Future enhancement:
- Sync progress to cloud
- Download chapters in background
- Update checking

### Push Notifications
Future enhancement:
- New chapter notifications
- Playback reminders
- Progress milestones

## Monitoring

### Check PWA Status
```javascript
// Is running as PWA?
window.matchMedia('(display-mode: standalone)').matches

// Service worker active?
navigator.serviceWorker.controller

// Storage persistent?
navigator.storage.persisted()
```

### Analytics
Track PWA-specific metrics:
- Install rate
- Standalone usage
- Offline usage
- Background playback duration

## Security

### HTTPS Required
- PWA requires HTTPS in production
- Service workers only work over HTTPS
- Localhost exception for development

### Permissions
PWAs can request:
- ✅ Audio playback (automatic)
- ✅ Storage (automatic)
- ⚠️ Notifications (requires user permission)
- ⚠️ Location (not needed for this app)

## Updates

### Automatic Updates
Service worker checks for updates:
- On navigation
- Every 24 hours
- When explicitly checked

### Force Update
```javascript
// In service worker
self.skipWaiting();

// In app
registration.update();
```

### User Notification
App shows update prompt:
- "New version available"
- Option to reload
- Non-intrusive toast

## Best Practices

1. ✅ **Test offline**: Disable network in DevTools
2. ✅ **Test install**: On multiple devices/browsers
3. ✅ **Test background**: Lock screen and check playback
4. ✅ **Check performance**: Lighthouse PWA audit
5. ✅ **Monitor errors**: Service worker errors in console

## Resources

- [PWA Checklist](https://web.dev/pwa-checklist/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [Background Audio](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement)

---

## Quick Start

1. Create icons using `create-icons.html`
2. Test locally: `python3 -m http.server 8000`
3. Open in Chrome: `http://localhost:8000`
4. Check DevTools → Application → Manifest
5. Click install prompt
6. Test background audio by locking screen
7. Deploy to Netlify with HTTPS
8. Share with users!

Your audiobook player is now a full PWA! 🎉📱

