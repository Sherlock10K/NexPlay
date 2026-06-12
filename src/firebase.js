import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, sendPasswordResetEmail } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, updateDoc, arrayUnion, arrayRemove, collection, query, where, getDocs, addDoc, deleteDoc, orderBy, limit } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Deine Firebase Config hier einfügen (aus der Firebase Console)
const firebaseConfig = {
  apiKey: "DEIN_API_KEY",
  authDomain: "DEIN_AUTH_DOMAIN",
  projectId: "DEIN_PROJECT_ID",
  storageBucket: "DEIN_STORAGE_BUCKET",
  messagingSenderId: "DEIN_SENDER_ID",
  appId: "DEIN_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// ========== LIBRARY FUNCTIONS ==========
export const saveLibraryToFirestore = async (userId, library) => {
  const userRef = doc(db, "users", userId);
  await setDoc(userRef, { library }, { merge: true });
};

export const loadLibraryFromFirestore = async (userId) => {
  const userRef = doc(db, "users", userId);
  const docSnap = await getDoc(userRef);
  return docSnap.exists() ? docSnap.data().library || [] : [];
};

// ========== PROFILE FUNCTIONS ==========
export const saveProfileToFirestore = async (userId, profileData) => {
  const userRef = doc(db, "users", userId);
  await setDoc(userRef, profileData, { merge: true });
};

export const loadProfileFromFirestore = async (userId) => {
  const userRef = doc(db, "users", userId);
  const docSnap = await getDoc(userRef);
  return docSnap.exists() ? docSnap.data() : null;
};

export const updateUsername = async (userId, newUsername, oldUsername) => {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, { username: newUsername });
  return { success: true };
};

export const updateBio = async (userId, newBio) => {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, { bio: newBio });
};

export const togglePrivacy = async (userId, isPrivate) => {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, { isPrivate });
};

export const searchUsers = async (searchTerm) => {
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("username", ">=", searchTerm), where("username", "<=", searchTerm + "\uf8ff"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// ========== REVIEW FUNCTIONS ==========
export const addGameReview = async (userId, gameId, gameName, rating, comment) => {
  const reviewsRef = collection(db, "reviews");
  await addDoc(reviewsRef, {
    userId, gameId, gameName, rating, comment,
    likes: [], dislikes: [], createdAt: new Date().toISOString()
  });
};

export const getGameReviews = async (gameId) => {
  const reviewsRef = collection(db, "reviews");
  const q = query(reviewsRef, where("gameId", "==", gameId), orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const likeReview = async (reviewId, userId) => {
  const reviewRef = doc(db, "reviews", reviewId);
  const reviewSnap = await getDoc(reviewRef);
  const data = reviewSnap.data();
  const newLikes = data.likes.includes(userId) ? data.likes.filter(id => id !== userId) : [...data.likes, userId];
  const newDislikes = data.dislikes.filter(id => id !== userId);
  await updateDoc(reviewRef, { likes: newLikes, dislikes: newDislikes });
};

export const dislikeReview = async (reviewId, userId) => {
  const reviewRef = doc(db, "reviews", reviewId);
  const reviewSnap = await getDoc(reviewRef);
  const data = reviewSnap.data();
  const newDislikes = data.dislikes.includes(userId) ? data.dislikes.filter(id => id !== userId) : [...data.dislikes, userId];
  const newLikes = data.likes.filter(id => id !== userId);
  await updateDoc(reviewRef, { likes: newLikes, dislikes: newDislikes });
};

// ========== LAST PLAYED ==========
export const updateLastPlayed = async (userId, gameId, gameName, gameImg) => {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);
  const lastPlayed = userSnap.data()?.lastPlayed || [];
  const newEntry = { gameId, gameName, gameImg, timestamp: new Date().toISOString() };
  const updated = [newEntry, ...lastPlayed.filter(g => g.gameId !== gameId)].slice(0, 10);
  await updateDoc(userRef, { lastPlayed: updated });
};

// ========== LOGIN/REGISTER ==========
export const loginWithEmail = async (email, password) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    return { error: error.message };
  }
};

export const registerWithEmail = async (email, password, username) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await saveProfileToFirestore(result.user.uid, { username, email, favorites: [], platformLinks: {}, createdAt: new Date().toISOString() });
    return result;
  } catch (error) {
    return { error: error.message };
  }
};

export const logout = () => signOut(auth);
export const resetPassword = (email) => sendPasswordResetEmail(auth, email);
