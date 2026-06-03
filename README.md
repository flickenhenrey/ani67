# AnimeFiles 🎌

A free anime streaming site clone based on AnimeKai, rebranded as **AnimeFiles**.

---

## 📁 File Structure

```
anifile/
├── index.html        ← Homepage
├── watch.html        ← Watch/player page  
├── browser.html      ← Search & browse page
├── css/
│   ├── main.css      ← AnimeFiles brand styles
│   ├── bundle.css    ← UI component library
│   └── swiper-bundle.min.css
├── js/
│   ├── function.js   ← All site logic + Jikan API
│   ├── firebase.js   ← Firebase auth/db helpers
│   └── jquery.min.js
└── images/
    └── logo.png      ← AnimeFiles logo
```

---

## 🔧 Setup

### 1. Firebase (free — Spark plan)
1. Go to https://console.firebase.google.com
2. Create a new project
3. Add a **Web App**
4. Copy your config into `js/firebase.js` replacing the placeholder values
5. Enable **Authentication** → Google + Email/Password
6. Enable **Firestore Database** (start in test mode)

### 2. Deploy to Firebase Hosting (free)
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
# Set public dir to: anifile/
firebase deploy
```

### 3. Video Source
- Videos are embedded from **GogoAnime** via iframe
- The embed URL pattern: `https://www1.gogoanime.pw/load.php?id={slug}-episode-{n}`
- Anime slugs come from **Jikan API** (free, no key needed)
- No self-hosting required!

---

## 🎯 Features
- ✅ Real anime data from Jikan/MyAnimeList API
- ✅ GogoAnime video embeds (Sub + Dub)
- ✅ Search with autocomplete
- ✅ Browse with filters (genre, type, status, rating)
- ✅ Episode list with range selector
- ✅ Watchlist (localStorage + Firebase)
- ✅ Related anime sidebar
- ✅ Firebase Auth (Google + Email)
- ✅ Watch history tracking
- ✅ Fully responsive (mobile + desktop)

---

## ⚠️ Notes
- Jikan API has a rate limit of ~3 req/sec (free)
- GogoAnime embeds may need updating if the domain changes
- This is for educational purposes
