import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, sendPasswordResetEmail } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, addDoc, orderBy, arrayUnion, arrayRemove } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDGCgGnRCnExhH-iMcHf_JTvOgaTc23dXw",
  authDomain: "nexplay-f6d12.firebaseapp.com",
  projectId: "nexplay-f6d12",
  storageBucket: "nexplay-f6d12.firebasestorage.app",
  messagingSenderId: "132794794516",
  appId: "1:132794794516:web:6b4fe5ec16af6c6577dd01"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

const CREATOR_ID = "ITwkrLOG5bbcj6zROekdcAA70kF2";

// ========== AUTH ==========
export const loginWithEmail = async (email, password) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    return null;
  }
};

export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    return { error: error.message };
  }
};

export const registerWithEmail = async (email, password, username) => {
  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("username", "==", username));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) return { error: "Username already taken" };
    if (username === "Sherlock10K") return { error: "This username is reserved for the creator" };
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, "users", result.user.uid), {
      username: username,
      email: email,
      avatar: "",
      bio: "",
      isPrivate: false,
      createdAt: new Date().toISOString(),
      lastPlayed: []
    });
    return { user: result.user };
  } catch (error) {
    return { error: error.message };
  }
};

export const updateUsername = async (userId, newUsername, currentUsername) => {
  try {
    if (newUsername === "Sherlock10K" && userId !== CREATOR_ID) {
      return { error: "This username is reserved for the creator 👑" };
    }
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("username", "==", newUsername));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const existing = querySnapshot.docs[0];
      if (existing.id !== userId) return { error: "Username already taken" };
    }
    await updateDoc(doc(db, "users", userId), { username: newUsername });
    return { success: true };
  } catch (error) {
    return { error: error.message };
  }
};

export const updateBio = async (userId, bio) => {
  try {
    await updateDoc(doc(db, "users", userId), { bio: bio });
    return { success: true };
  } catch (error) {
    return { error: error.message };
  }
};

export const togglePrivacy = async (userId, isPrivate) => {
  try {
    await updateDoc(doc(db, "users", userId), { isPrivate: isPrivate });
    return { success: true };
  } catch (error) {
    return { error: error.message };
  }
};

// ========== REVIEWS ==========
export const addGameReview = async (userId, gameId, gameName, rating, comment) => {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    const username = userDoc.data()?.username || "Anonymous";
    await addDoc(collection(db, "reviews"), {
      userId, username, gameId, gameName, rating, comment,
      likes: [], dislikes: [], createdAt: new Date().toISOString()
    });
    return { success: true };
  } catch (error) {
    return { error: error.message };
  }
};

export const getGameReviews = async (gameId) => {
  try {
    const reviewsRef = collection(db, "reviews");
    const q = query(reviewsRef, where("gameId", "==", gameId), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    const reviews = [];
    querySnapshot.forEach((doc) => reviews.push({ id: doc.id, ...doc.data() }));
    return reviews;
  } catch (error) {
    return [];
  }
};

export const likeReview = async (reviewId, userId) => {
  try {
    const reviewRef = doc(db, "reviews", reviewId);
    await updateDoc(reviewRef, { likes: arrayUnion(userId), dislikes: arrayRemove(userId) });
    return { success: true };
  } catch (error) {
    return { error: error.message };
  }
};

export const dislikeReview = async (reviewId, userId) => {
  try {
    const reviewRef = doc(db, "reviews", reviewId);
    await updateDoc(reviewRef, { dislikes: arrayUnion(userId), likes: arrayRemove(userId) });
    return { success: true };
  } catch (error) {
    return { error: error.message };
  }
};

// ========== LAST PLAYED ==========
export const updateLastPlayed = async (userId, gameId, gameName, gameImg) => {
  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    const lastPlayed = userDoc.data()?.lastPlayed || [];
    const newEntry = { gameId, gameName, gameImg, timestamp: new Date().toISOString() };
    const updated = [newEntry, ...lastPlayed.filter(g => g.gameId !== gameId)].slice(0, 10);
    await updateDoc(userRef, { lastPlayed: updated });
    return { success: true };
  } catch (error) {
    return { error: error.message };
  }
};

// ========== USER PROFILE ==========
export const loadUserProfile = async (userId) => {
  const docRef = doc(db, "users", userId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() : null;
};

export const searchUsers = async (searchTerm) => {
  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("username", ">=", searchTerm), where("username", "<=", searchTerm + "\uf8ff"));
    const querySnapshot = await getDocs(q);
    const users = [];
    querySnapshot.forEach((doc) => users.push({ id: doc.id, ...doc.data() }));
    return users;
  } catch (error) {
    return [];
  }
};

export const logout = async () => {
  await signOut(auth);
};

// ========== LIBRARY ==========
export const loadLibraryFromFirestore = async (userId) => {
  const docRef = doc(db, "libraries", userId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data().games || [] : [];
};

export const saveLibraryToFirestore = async (userId, library) => {
  const docRef = doc(db, "libraries", userId);
  await setDoc(docRef, { games: library, lastUpdated: new Date().toISOString() }, { merge: true });
};

export const loadProfileFromFirestore = async (userId) => {
  return await loadUserProfile(userId);
};

export const saveProfileToFirestore = async (userId, profile) => {
  const docRef = doc(db, "users", userId);
  await setDoc(docRef, profile, { merge: true });
};