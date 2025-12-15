# PWA Setup Instructions

## What is a PWA?
Your app is now a **Progressive Web App (PWA)**! This means users can:
- ✅ Install it on their phone/desktop like a native app
- ✅ Add it to their home screen
- ✅ Use it in fullscreen mode
- ✅ Get basic offline functionality

## How Users Install the App

### On Mobile (Android/iOS):
1. Open the website in Chrome/Safari
2. Look for the "Add to Home Screen" or "Install" prompt
3. Tap "Install" or "Add"
4. The app icon will appear on the home screen

### On Desktop (Chrome/Edge):
1. Open the website
2. Look for the install icon (⊕) in the address bar
3. Click "Install"
4. The app opens in its own window

## App Icons
I've generated a placeholder icon. To use your own:

1. Create icons in these sizes:
   - 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512

2. Save them in: `frontend/assets/icons/`
   - Name them: `icon-72x72.png`, `icon-192x192.png`, etc.

3. Or use an online tool like:
   - https://realfavicongenerator.net/
   - https://www.pwabuilder.com/imageGenerator

## Files Added
- `frontend/manifest.json` - App configuration
- `frontend/sw.js` - Service worker for offline support
- Updated `frontend/index.html` - Added PWA meta tags

## Testing
1. Deploy to production (PWAs require HTTPS)
2. Open in Chrome DevTools → Application → Manifest
3. Check "Service Workers" tab to verify registration

## Next Steps
- Replace placeholder icons with your branded icons
- Customize colors in `manifest.json`
- Add more offline functionality in `sw.js` if needed
