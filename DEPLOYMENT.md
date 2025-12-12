# Deployment Guide

This is a standalone audiobook player PWA. Here's how to deploy it.

## Quick Deploy Options

### Option 1: Netlify (Recommended)

**Drag & Drop Deploy:**
1. Go to https://app.netlify.com/drop
2. Drag the entire `the-sodanovels` folder
3. Done! Your site is live with HTTPS

**GitHub Deploy:**
1. Push this directory to a GitHub repository
2. Connect to Netlify
3. Build settings:
   - **Build command:** (leave empty - static files)
   - **Publish directory:** `.` (root)
   - **Base directory:** (leave empty or set to repo root)
4. Deploy!

**Netlify CLI:**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
cd the-sodanovels
netlify deploy --prod
```

### Option 2: Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd the-sodanovels
vercel --prod
```

### Option 3: GitHub Pages

1. Push to GitHub
2. Go to Settings → Pages
3. Source: Deploy from branch
4. Branch: main, folder: `/` (root)
5. Save

**Note:** Add a `.nojekyll` file for GitHub Pages:
```bash
touch .nojekyll
git add .nojekyll
git commit -m "Add .nojekyll for GitHub Pages"
```

### Option 4: Any Static Host

Upload these files to any static web host:
- All `.html`, `.css`, `.js` files
- `manifest.json`
- `service-worker.js`
- `the-next-listener/` folder (with all MP3s and markdown)
- `the-three-dots/` folder (with all MP3s and markdown)
- Icon files (icon-192.png, icon-512.png)

## Before Deploying

### 1. Create PWA Icons

**Important:** Generate app icons before deploying:

```bash
# Open in browser
open create-icons.html

# Or visit in browser:
# file:///path/to/the-sodanovels/create-icons.html
```

Then:
1. Click "Download 192x192" → save as `icon-192.png`
2. Click "Download 512x512" → save as `icon-512.png`
3. Place both files in the root directory

### 2. Test Locally

```bash
# Option 1: Python
python3 -m http.server 8000

# Option 2: Node.js
npx serve .

# Option 3: PHP
php -S localhost:8000
```

Open: http://localhost:8000

### 3. Verify Files

Make sure you have:
- ✅ `index.html`
- ✅ `styles.css`
- ✅ `player.js`
- ✅ `data.js`
- ✅ `manifest.json`
- ✅ `service-worker.js`
- ✅ `icon-192.png` (create from create-icons.html)
- ✅ `icon-512.png` (create from create-icons.html)
- ✅ `the-next-listener/` folder with 16 MP3 files and markdown
- ✅ `the-three-dots/` folder with 10 MP3 files and markdown
- ✅ `_redirects` (for Netlify SPA routing)

## Post-Deployment

### Test the PWA

1. **Visit your site** (must be HTTPS)
2. **Check manifest:**
   - Open DevTools → Application → Manifest
   - Verify icons load
3. **Check service worker:**
   - Open DevTools → Application → Service Workers
   - Should show "activated"
4. **Test install:**
   - Look for install prompt or icon in address bar
   - Install app
5. **Test offline:**
   - Play an audiobook chapter
   - Disable network in DevTools
   - Refresh page - should still work
6. **Test background audio:**
   - Install app
   - Play audiobook
   - Lock device screen
   - Audio should continue playing

### Lighthouse Audit

Run Lighthouse in Chrome DevTools:
1. Open DevTools
2. Go to "Lighthouse" tab
3. Select "Progressive Web App"
4. Run audit
5. Aim for 90+ score

### Update Metadata

Update these in `index.html`:
- `<title>` - Site title
- `<meta name="description">` - SEO description
- `<link rel="canonical">` - Your domain

Update these in `manifest.json`:
- `start_url` - Your domain path
- `scope` - Your domain path

## Custom Domain

### Netlify
1. Site settings → Domain management
2. Add custom domain
3. Follow DNS instructions
4. Wait for HTTPS certificate (automatic)

### Vercel
1. Project settings → Domains
2. Add domain
3. Configure DNS
4. HTTPS automatic

### CloudFlare (for any host)
1. Add site to CloudFlare
2. Update nameservers
3. Enable HTTPS/SSL
4. Set SSL mode to "Full"

## Troubleshooting

### Icons Not Loading
- Make sure icon files are in root directory
- Check file names match manifest.json
- Verify file size (should be under 1MB each)

### Service Worker Not Registering
- Must use HTTPS (or localhost)
- Check browser console for errors
- Verify service-worker.js is in root directory
- Try hard refresh (Cmd+Shift+R)

### Audio Not Playing
- Check file paths in data.js
- Verify MP3 files uploaded correctly
- Check browser console for 404 errors
- Test with browser Network tab

### App Not Installing
- Must be served over HTTPS
- Check manifest.json is valid
- Icons must be present and valid
- Run Lighthouse audit for PWA requirements

## Performance Tips

### Optimize Audio Files
```bash
# Reduce bitrate for smaller files (speech is fine at 64kbps)
ffmpeg -i input.mp3 -b:a 64k -ac 1 output.mp3

# Batch convert all files
for f in *.mp3; do
  ffmpeg -i "$f" -b:a 64k -ac 1 "optimized_$f"
done
```

### Enable Compression
Most hosts enable gzip/brotli automatically. If not:

**Netlify** - automatic

**Vercel** - automatic

**Apache (.htaccess):**
```apache
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css text/javascript application/javascript
</IfModule>
```

**Nginx:**
```nginx
gzip on;
gzip_types text/css text/javascript application/javascript;
```

## Monitoring

### Analytics
Add analytics to track usage:

**Google Analytics:**
```html
<!-- Add to index.html before </head> -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

**Plausible (privacy-friendly):**
```html
<script defer data-domain="yourdomain.com" src="https://plausible.io/js/script.js"></script>
```

### Error Tracking
Add Sentry for error monitoring:

```html
<script src="https://browser.sentry-cdn.com/7.x.x/bundle.min.js"></script>
<script>
  Sentry.init({
    dsn: 'YOUR_DSN',
    tracesSampleRate: 1.0,
  });
</script>
```

## Security Headers

Recommended headers (automatic on Netlify with `_redirects`):
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

## Support

For issues or questions:
1. Check README.md
2. Check PWA-SETUP.md
3. Open an issue on GitHub
4. Contact: support@sodanovels.com (update with your contact)

---

**Ready to deploy!** 🚀

This app requires zero build steps and zero dependencies.
Just upload the files and it works!

