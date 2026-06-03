// ============================================================
//  ANIFILE — Firebase Configuration
//  Replace the config below with YOUR Firebase project config!
//  Get it from: Firebase Console > Project Settings > Your Apps
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc, arrayUnion, arrayRemove, collection, query, where, getDocs, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ⚠️  REPLACE THIS WITH YOUR FIREBASE CONFIG
const firebaseConfig = {
  apiKey:            "AIzaSyAmfpWAmmbMRNbkmo0tpUBNaHa2aPPDTSY",
  authDomain:        "anime67-2a3b7.firebaseapp.com",
  databaseURL:       "https://anime67-2a3b7-default-rtdb.firebaseio.com",
  projectId:         "anime67-2a3b7",
  storageBucket:     "anime67-2a3b7.firebasestorage.app",
  messagingSenderId: "541162994426",
  appId:             "1:541162994426:web:135a4540fc2a08770fe743",
  measurementId:     "G-SQKTG2ZRD2"
};

// Initialize Firebase
const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// ============================================================
//  AUTH FUNCTIONS
// ============================================================

// Sign in with Google
export async function loginWithGoogle() {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        await createOrUpdateUser(result.user);
        return { success: true, user: result.user };
    } catch (e) {
        return { success: false, error: e.message };
    }
}

// Sign in with Email/Password
export async function loginWithEmail(email, password) {
    try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        return { success: true, user: result.user };
    } catch (e) {
        return { success: false, error: e.message };
    }
}

// Register with Email/Password
export async function registerWithEmail(email, password, username) {
    try {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await createOrUpdateUser(result.user, username);
        return { success: true, user: result.user };
    } catch (e) {
        return { success: false, error: e.message };
    }
}

// Sign out
export async function logout() {
    try {
        await signOut(auth);
        return { success: true };
    } catch (e) {
        return { success: false, error: e.message };
    }
}

// Auth state listener
export function onAuthChange(callback) {
    return onAuthStateChanged(auth, callback);
}

// ============================================================
//  USER FUNCTIONS
// ============================================================

// Create or update user profile in Firestore
async function createOrUpdateUser(user, username) {
    const ref  = doc(db, 'users', user.uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
        await setDoc(ref, {
            uid: user.uid,
            email: user.email,
            username: username || user.displayName || user.email.split('@')[0],
            photoURL: user.photoURL || null,
            watchlist: [],
            watchHistory: [],
            createdAt: serverTimestamp()
        });
    }
}

// Get user profile
export async function getUserProfile(uid) {
    const snap = await getDoc(doc(db, 'users', uid));
    return snap.exists() ? snap.data() : null;
}

// ============================================================
//  WATCHLIST FUNCTIONS
// ============================================================

// Add anime to watchlist
export async function addToWatchlist(uid, anime) {
    const ref = doc(db, 'users', uid);
    await updateDoc(ref, {
        watchlist: arrayUnion({
            mal_id: anime.mal_id,
            title: anime.title,
            image: anime.image,
            slug: anime.slug,
            addedAt: new Date().toISOString()
        })
    });
}

// Remove anime from watchlist
export async function removeFromWatchlist(uid, mal_id) {
    const ref  = doc(db, 'users', uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;
    const current = snap.data().watchlist || [];
    const updated = current.filter(a => a.mal_id !== mal_id);
    await updateDoc(ref, { watchlist: updated });
}

// Get watchlist
export async function getWatchlist(uid) {
    const snap = await getDoc(doc(db, 'users', uid));
    return snap.exists() ? (snap.data().watchlist || []) : [];
}

// ============================================================
//  WATCH HISTORY FUNCTIONS
// ============================================================

// Save watch progress
export async function saveWatchProgress(uid, animeSlug, ep, mal_id, title, image) {
    const ref = doc(db, 'users', uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;

    const history = snap.data().watchHistory || [];
    const existing = history.find(h => h.slug === animeSlug);

    if (existing) {
        existing.lastEp = ep;
        existing.updatedAt = new Date().toISOString();
        await updateDoc(ref, { watchHistory: history });
    } else {
        await updateDoc(ref, {
            watchHistory: arrayUnion({
                slug: animeSlug,
                mal_id,
                title,
                image,
                lastEp: ep,
                updatedAt: new Date().toISOString()
            })
        });
    }
}

// Get watch history
export async function getWatchHistory(uid) {
    const snap = await getDoc(doc(db, 'users', uid));
    if (!snap.exists()) return [];
    return (snap.data().watchHistory || []).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
}

// ============================================================
//  COMMENTS / RATINGS (BONUS)
// ============================================================

// Post comment
export async function postComment(animeSlug, uid, username, text) {
    const ref = doc(collection(db, 'comments', animeSlug, 'posts'));
    await setDoc(ref, {
        uid,
        username,
        text,
        likes: 0,
        createdAt: serverTimestamp()
    });
}

// Get comments
export async function getComments(animeSlug) {
    const colRef = collection(db, 'comments', animeSlug, 'posts');
    const snap = await getDocs(query(colRef));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// Rate anime (1-10)
export async function rateAnime(uid, mal_id, rating) {
    await setDoc(doc(db, 'ratings', `${uid}_${mal_id}`), {
        uid, mal_id, rating,
        ratedAt: serverTimestamp()
    });
}

export { auth, db };
