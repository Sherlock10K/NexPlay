import { useState, useEffect, useRef } from "react";
import { FaHome, FaUser, FaBook, FaTrophy, FaRandom, FaRobot, FaSignOutAlt, FaPlus, FaHeart, FaStar, FaTrash, FaEdit, FaCamera, FaSearch, FaUsers, FaClock, FaThumbsUp, FaThumbsDown, FaArrowLeft, FaCog, FaMoon, FaSun, FaAdjust, FaBars, FaTimes, FaChevronDown, FaChevronUp, FaFire, FaGamepad, FaSteam, FaShoppingCart } from "react-icons/fa";
import { GiAchievement, GiSpinningWheel, GiNotebook } from "react-icons/gi";
import { BsFillCollectionFill, BsFillHeartFill } from "react-icons/bs";
import { auth, loginWithEmail, registerWithEmail, logout, loadLibraryFromFirestore, saveLibraryToFirestore, loadProfileFromFirestore, saveProfileToFirestore, updateUsername, updateBio, togglePrivacy, searchUsers, addGameReview, getGameReviews, updateLastPlayed, likeReview, dislikeReview } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const colors = {
  primary: "#ffd400",
  primaryDark: "#e6bf00",
  bg: "#0a0a0f",
  bgCard: "#14141f",
  text: "#ffffff",
  textSecondary: "#a0a0b0",
  success: "#4caf50",
  error: "#f44336",
  steam: "#1b2838"
};

const RAWG_API_KEY = "4da2c00cf3b2459d988e0ed0ac16988d";
const DEEPSEEK_API_KEY = "sk-b5699f49547a4e4ab7eaa74cb6bb7016";

// ========== FESTE SPIELE (keine Duplikate) ==========
const FIXED_GAMES = [
  { id: 1, name: "The Witcher 3: Wild Hunt", rating: 9.5, genre: "RPG", playtime: "100h+", year: 2015, img: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/292030/header.jpg", developer: "CD Projekt Red", description: "Ein Meisterwerk des Open-World-RPGs. Als Geralt von Riva jagst du Monster, löst Quests und triffst Entscheidungen, die die Welt verändern." },
  { id: 2, name: "Red Dead Redemption 2", rating: 9.6, genre: "Open World", playtime: "100h+", year: 2018, img: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1174180/header.jpg", developer: "Rockstar Games", description: "Ein episches Western-Epos. Erlebe die Geschichte von Arthur Morgan, einem Outlaw auf der Flucht vor der Moderne." },
  { id: 3, name: "Elden Ring", rating: 9.5, genre: "Open World", playtime: "100h+", year: 2022, img: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1245620/header.jpg", developer: "FromSoftware", description: "Ein Meisterwerk des Open-World-Action-RPGs. Erkunde 'The Lands Between' mit seinen Geheimnissen und herausfordernden Bossen." },
  { id: 4, name: "Baldur's Gate 3", rating: 9.6, genre: "RPG", playtime: "100h+", year: 2023, img: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1086940/header.jpg", developer: "Larian Studios", description: "Das ultimative D&D-Rollenspielerlebnis. Erstelle deinen Charakter und erlebe eine epische Geschichte." },
  { id: 5, name: "God of War (2018)", rating: 9.4, genre: "Action", playtime: "40-60h", year: 2018, img: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1593500/header.jpg", developer: "Santa Monica Studio", description: "Eine emotionale Reise durch die nordische Mythologie. Kratos und sein Sohn Atreus haben eine der besten Vater-Sohn-Beziehungen." },
  { id: 6, name: "Cyberpunk 2077", rating: 8.5, genre: "RPG", playtime: "60-100h", year: 2020, img: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1091500/header.jpg", developer: "CD Projekt Red", description: "Ein Open-World-RPG in einer dystopischen Zukunft. Night City ist eine der beeindruckendsten Spielwelten." },
  { id: 7, name: "Hades", rating: 9.3, genre: "Action", playtime: "40-60h", year: 2020, img: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1145360/header.jpg", developer: "Supergiant Games", description: "Ein Roguelite-Actionspiel mit griechischer Mythologie. Jeder Lauf fühlt sich frisch an." },
  { id: 8, name: "Stardew Valley", rating: 9.2, genre: "Simulation", playtime: "100h+", year: 2016, img: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/413150/header.jpg", developer: "ConcernedApe", description: "Ein Farm-Simulator mit RPG-Elementen. Baue deine Farm auf, erkunde Minen und knüpfe Freundschaften." },
  { id: 9, name: "Hollow Knight", rating: 9.3, genre: "Action", playtime: "40-60h", year: 2017, img: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/367520/header.jpg", developer: "Team Cherry", description: "Ein atmosphärisches Metroidvania. Erkunde eine riesige unterirdische Welt voller Geheimnisse." },
  { id: 10, name: "Portal 2", rating: 9.4, genre: "Puzzle", playtime: "10-20h", year: 2011, img: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/620/header.jpg", developer: "Valve", description: "Das perfekte Puzzlespiel. Löse kreative Rätsel mit der Portal-Gun." },
  { id: 11, name: "Disco Elysium", rating: 9.4, genre: "RPG", playtime: "40-60h", year: 2019, img: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/632470/header.jpg", developer: "ZA/UM", description: "Ein einzigartiges Detektiv-RPG ohne Kampf. Deine Entscheidungen und Dialoge bestimmen den Verlauf." },
  { id: 12, name: "Outer Wilds", rating: 9.3, genre: "Adventure", playtime: "20-40h", year: 2019, img: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/753640/header.jpg", developer: "Mobius Digital", description: "Ein Open-World-Mystery-Spiel in einer Zeitschleife. Erkunde ein Sonnensystem voller Geheimnisse." }
];

const AOTY_GAMES = {
  2025: { name: "Clair Obscur: Expedition 33", img: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/2358720/header.jpg", genre: "RPG", developer: "Kepler Interactive", description: "Ein episches RPG in einer düsteren Fantasy-Welt. Entdecke eine atemberaubende offene Welt und erlebe eine emotionale Geschichte." },
  2024: { name: "Astro Bot", img: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/2357570/header.jpg", genre: "Platformer", developer: "Team Asobi", description: "Ein charmantes 3D-Platformer-Abenteuer. Begleite Astro auf einer Reise durch bunte Welten." },
  2023: { name: "Baldur's Gate 3", img: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1086940/header.jpg", genre: "RPG", developer: "Larian Studios", description: "Das ultimative D&D-Rollenspielerlebnis. Ein Meisterwerk, das alle Erwartungen übertrifft." },
  2022: { name: "Elden Ring", img: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1245620/header.jpg", genre: "Open World", developer: "FromSoftware", description: "Ein Meisterwerk des Open-World-Action-RPGs. Ein Spiel, das eine ganze Generation geprägt hat." },
  2021: { name: "It Takes Two", img: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1426210/header.jpg", genre: "Adventure", developer: "Hazelight Studios", description: "Ein einzigartiges Koop-Abenteuer über eine zerstrittene Familie. Ein emotionales Meisterwerk." },
  2020: { name: "The Last of Us Part II", img: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1888930/header.jpg", genre: "Action", developer: "Naughty Dog", description: "Ein emotionales Meisterwerk über Rache und Vergebung. Eine Geschichte, die unter die Haut geht." }
};

export default function NexPlay() {
  // ========== AUTH STATE ==========
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profilePic, setProfilePic] = useState(null);
  const [uploadingPic, setUploadingPic] = useState(false);
  const fileInputRef = useRef(null);
  
  // ========== UI STATE ==========
  const [theme, setTheme] = useState(() => localStorage.getItem("nexplay_theme") || "dark");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState("home");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loadingAction, setLoadingAction] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editUsername, setEditUsername] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editPrivate, setEditPrivate] = useState(false);
  const [editSuccess, setEditSuccess] = useState("");
  
  // ========== GAME STATE ==========
  const [library, setLibrary] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [activityFeed, setActivityFeed] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [selectedGameDetail, setSelectedGameDetail] = useState(null);
  const [gameDetailReviews, setGameDetailReviews] = useState([]);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const [gameJournal, setGameJournal] = useState({});
  const [journalText, setJournalText] = useState("");
  const [newTag, setNewTag] = useState("");
  const [customTags, setCustomTags] = useState({});
  
  // ========== DISCOVER STATE ==========
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [sortBy, setSortBy] = useState("rating");
  
  // ========== AI CHAT STATE ==========
  const [aiMessages, setAiMessages] = useState([
    { role: "assistant", content: "Hi! Ich bin dein Gaming-Assistent. Frag mich nach Spielempfehlungen, Tipps oder was du sonst wissen möchtest! 🎮" }
  ]);
  const [aiInput, setAiInput] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const aiChatEndRef = useRef(null);
  
  // ========== AOTY STATE ==========
  const [selectedAotyYear, setSelectedAotyYear] = useState(null);
  
  // ========== RANDOM GAME STATE ==========
  const [randomGame, setRandomGame] = useState(null);
  const [showRandomModal, setShowRandomModal] = useState(false);
  const [randomMinRating, setRandomMinRating] = useState(7);
  const [randomGenre, setRandomGenre] = useState("all");
  const [spinning, setSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState(null);
  
  // ========== FRIENDS STATE ==========
  const [searchUsersTerm, setSearchUsersTerm] = useState("");
  const [foundUsers, setFoundUsers] = useState([]);
  
  // ========== SETTINGS ==========
  const [soundEnabled, setSoundEnabled] = useState(true);

  const currentColors = theme === "dark" ? colors : { ...colors, bg: "#ffffff", bgCard: "#f0f0f0", text: "#000000", textSecondary: "#666666" };

  // ========== HELPER FUNCTIONS ==========
  const scrollToBottom = () => {
    aiChatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [aiMessages]);

  const playSound = () => {
    if (!soundEnabled) return;
    const audio = new Audio("https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3");
    audio.volume = 0.2;
    audio.play().catch(() => {});
  };

  // ========== AI CHAT FUNCTION ==========
  const sendAiMessage = async () => {
    if (!aiInput.trim()) return;
    
    const userMessage = aiInput.trim();
    setAiMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setAiInput("");
    setIsAiLoading(true);
    
    try {
      const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            { role: "system", content: "Du bist ein Gaming-Assistent. Du hilfst bei Spielempfehlungen, beantwortest Fragen zu Spielen und gibst Tipps. Sei freundlich und enthusiastisch. Antworte auf Deutsch." },
            ...aiMessages.slice(-5).map(m => ({ role: m.role, content: m.content })),
            { role: "user", content: userMessage }
          ],
          temperature: 0.7,
          max_tokens: 500
        })
      });
      
      const data = await response.json();
      const assistantReply = data.choices?.[0]?.message?.content || "Entschuldigung, ich konnte keine Antwort generieren. Bitte versuche es später erneut.";
      setAiMessages(prev => [...prev, { role: "assistant", content: assistantReply }]);
    } catch (error) {
      console.error("AI Error:", error);
      setAiMessages(prev => [...prev, { role: "assistant", content: "Entschuldigung, es gab einen Fehler bei der Verbindung zur KI. Bitte versuche es später erneut." }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  // ========== GAME FUNCTIONS ==========
  const getGames = () => {
    let games = [...FIXED_GAMES];
    if (searchQuery) {
      games = games.filter(g => g.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    if (selectedGenre !== "All") {
      games = games.filter(g => g.genre === selectedGenre);
    }
    if (sortBy === "rating") {
      games.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "year") {
      games.sort((a, b) => b.year - a.year);
    } else if (sortBy === "name") {
      games.sort((a, b) => a.name.localeCompare(b.name));
    }
    return games;
  };

  const openGameDetail = (game) => {
    playSound();
    setSelectedGameDetail(game);
    setJournalText(gameJournal[game.id] || "");
    setCurrentTab("gameDetail");
  };

  const closeGameDetail = () => {
    setSelectedGameDetail(null);
    setCurrentTab("home");
  };

  const addToLibrary = (game) => {
    if (library.find(g => g.id === game.id)) return;
    setLibrary([...library, { ...game, status: "wishlist", dateAdded: new Date().toISOString() }]);
    setActivityFeed(prev => [{ id: Date.now(), type: "add", message: `${userData?.username} hat ${game.name} hinzugefügt`, timestamp: new Date().toISOString() }, ...prev].slice(0, 20));
    playSound();
  };

  const removeFromLibrary = (id) => {
    setLibrary(library.filter(g => g.id !== id));
    playSound();
  };

  const updateStatus = (id, status, game) => {
    setLibrary(library.map(g => g.id === id ? { ...g, status } : g));
    if (status === "completed") {
      setActivityFeed(prev => [{ id: Date.now(), type: "completed", message: `${userData?.username} hat ${game.name} abgeschlossen`, timestamp: new Date().toISOString() }, ...prev].slice(0, 20));
    }
    playSound();
  };

  const toggleFavorite = (id) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    playSound();
  };

  const addToWishlist = (game) => {
    if (wishlist.find(g => g.id === game.id)) return;
    setWishlist([...wishlist, game]);
    playSound();
  };

  const saveJournalNote = (gameId) => {
    setGameJournal(prev => ({ ...prev, [gameId]: journalText }));
    playSound();
  };

  const addTag = (gameId) => {
    if (!newTag.trim()) return;
    setCustomTags(prev => ({ ...prev, [gameId]: [...(prev[gameId] || []), newTag.trim()] }));
    setNewTag("");
    playSound();
  };

  const removeTag = (gameId, index) => {
    setCustomTags(prev => ({ ...prev, [gameId]: prev[gameId].filter((_, i) => i !== index) }));
    playSound();
  };

  const submitReview = async () => {
    if (reviewRating === 0) return;
    await addGameReview(user.uid, selectedGameDetail.id, selectedGameDetail.name, reviewRating, reviewComment);
    setGameDetailReviews(await getGameReviews(selectedGameDetail.id));
    setReviewRating(0);
    setReviewComment("");
    playSound();
  };

  const doRandom = () => {
    let pool = [...FIXED_GAMES];
    if (randomGenre !== "all") {
      pool = pool.filter(g => g.genre === randomGenre);
    }
    pool = pool.filter(g => g.rating >= randomMinRating);
    if (pool.length === 0) pool = [...FIXED_GAMES];
    const random = pool[Math.floor(Math.random() * pool.length)];
    setRandomGame(random);
    setShowRandomModal(true);
    playSound();
  };

  const spinWheel = () => {
    setSpinning(true);
    setTimeout(() => {
      const random = FIXED_GAMES[Math.floor(Math.random() * FIXED_GAMES.length)];
      setSpinResult(random);
      setSpinning(false);
      playSound();
    }, 500);
  };

  // ========== ACHIEVEMENTS ==========
  const achievements = [
    { id: "first", name: "Erstes Spiel", desc: "Erstes Spiel zur Bibliothek hinzugefügt", icon: "🎮", unlocked: library.length >= 1 },
    { id: "collector", name: "Sammler", desc: "10 Spiele in der Bibliothek", icon: "📚", unlocked: library.length >= 10 },
    { id: "completionist", name: "Vollender", desc: "5 Spiele abgeschlossen", icon: "✅", unlocked: library.filter(g => g.status === "completed").length >= 5 },
    { id: "favorites", name: "Herzensbrecher", desc: "5 Favoriten markiert", icon: "❤️", unlocked: favorites.length >= 5 },
    { id: "master", name: "Spielemeister", desc: "25 Spiele in der Bibliothek", icon: "👑", unlocked: library.length >= 25 },
    { id: "critic", name: "Kritiker", desc: "10 Bewertungen geschrieben", icon: "✍️", unlocked: gameDetailReviews.length >= 10 },
    { id: "grinder", name: "Grinder", desc: "3 Spiele mit 100+ Stunden", icon: "🕰️", unlocked: library.filter(g => g.playtime === "100h+").length >= 3 }
  ];

  // ========== PROFILE FUNCTIONS ==========
  const handleProfilePicUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !user) return;
    setUploadingPic(true);
    try {
      const storage = getStorage();
      const storageRef = ref(storage, `profile_pics/${user.uid}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setProfilePic(url);
      await saveProfileToFirestore(user.uid, { profilePic: url });
      alert("Profilbild erfolgreich geändert!");
    } catch (err) {
      alert("Fehler beim Hochladen");
    } finally {
      setUploadingPic(false);
    }
  };

  const handleUpdateProfile = async () => {
    setLoadingAction(true);
    if (editUsername && editUsername !== userData?.username) {
      await updateUsername(user.uid, editUsername, userData?.username);
      setUserData({ ...userData, username: editUsername });
    }
    if (editBio !== userData?.bio) {
      await updateBio(user.uid, editBio);
      setUserData({ ...userData, bio: editBio });
    }
    if (editPrivate !== userData?.isPrivate) {
      await togglePrivacy(user.uid, editPrivate);
      setUserData({ ...userData, isPrivate: editPrivate });
    }
    setEditSuccess("Profil aktualisiert!");
    setTimeout(() => setShowEditModal(false), 1500);
    setLoadingAction(false);
  };

  // ========== AUTH ==========
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const libraryData = await loadLibraryFromFirestore(firebaseUser.uid);
        setLibrary(libraryData);
        const profile = await loadProfileFromFirestore(firebaseUser.uid);
        setUserData(profile);
        if (profile?.favorites) setFavorites(profile.favorites);
        if (profile?.wishlist) setWishlist(profile.wishlist);
        if (profile?.activityFeed) setActivityFeed(profile.activityFeed);
        if (profile?.profilePic) setProfilePic(profile.profilePic);
        if (profile?.playlists) setPlaylists(profile.playlists);
        if (profile?.customTags) setCustomTags(profile.customTags);
        if (profile?.gameJournal) setGameJournal(profile.gameJournal);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user && library.length) saveLibraryToFirestore(user.uid, library);
  }, [library, user]);
  useEffect(() => {
    if (user && favorites) saveProfileToFirestore(user.uid, { favorites });
  }, [favorites, user]);
  useEffect(() => {
    if (user && wishlist) saveProfileToFirestore(user.uid, { wishlist });
  }, [wishlist, user]);
  useEffect(() => {
    if (user && activityFeed) saveProfileToFirestore(user.uid, { activityFeed });
  }, [activityFeed, user]);
  useEffect(() => {
    if (user && playlists) saveProfileToFirestore(user.uid, { playlists });
  }, [playlists, user]);
  useEffect(() => {
    if (user && customTags) saveProfileToFirestore(user.uid, { customTags });
  }, [customTags, user]);
  useEffect(() => {
    if (user && gameJournal) saveProfileToFirestore(user.uid, { gameJournal });
  }, [gameJournal, user]);

  const handleLogin = async () => {
    if (!email || !password) { setErrorMsg("Email und Passwort erforderlich"); return; }
    setLoadingAction(true);
    const result = await loginWithEmail(email, password);
    if (result && !result.error) {
      setShowLoginModal(false);
      setEmail("");
      setPassword("");
      playSound();
    } else {
      setErrorMsg(result?.error || "Login fehlgeschlagen");
    }
    setLoadingAction(false);
  };

  const handleRegister = async () => {
    if (!email || !password) { setErrorMsg("Email und Passwort erforderlich"); return; }
    if (password.length < 6) { setErrorMsg("Passwort muss mindestens 6 Zeichen haben"); return; }
    setLoadingAction(true);
    const username = email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "");
    const result = await registerWithEmail(email, password, username);
    if (result.user) {
      setShowLoginModal(false);
      setEmail("");
      setPassword("");
      playSound();
    } else {
      setErrorMsg(result.error || "Registrierung fehlgeschlagen");
    }
    setLoadingAction(false);
  };

  // ========== STYLES ==========
  const styles = {
    app: { background: currentColors.bg, minHeight: "100vh", color: currentColors.text, fontFamily: "'Inter', system-ui, sans-serif" },
    container: { maxWidth: 1400, margin: "0 auto", padding: "0 24px" },
    header: { padding: "20px 0", borderBottom: `1px solid rgba(255,212,0,0.15)`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 },
    logo: { display: "flex", alignItems: "center", gap: 12, cursor: "pointer" },
    logoIcon: { background: `linear-gradient(135deg, ${currentColors.primary}, ${currentColors.primaryDark})`, borderRadius: "14px", padding: "10px 12px", display: "flex", alignItems: "center", gap: 8 },
    logoText: { fontSize: 22, fontWeight: 800, background: `linear-gradient(135deg, ${currentColors.primary}, ${currentColors.primaryDark})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
    rightSection: { display: "flex", alignItems: "center", gap: 20 },
    badge10k: { background: currentColors.primary, color: currentColors.bg, borderRadius: "20px", padding: "6px 14px", fontSize: 13, fontWeight: 700 },
    navTabs: { display: "flex", gap: 8, flexWrap: "wrap" },
    navTab: (active) => ({ background: active ? currentColors.primary : "rgba(255,255,255,0.08)", border: "none", borderRadius: 12, padding: "10px 20px", color: active ? currentColors.bg : currentColors.text, cursor: "pointer", fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", gap: 8 }),
    avatar: { width: 40, height: 40, borderRadius: "50%", background: currentColors.primary, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 18, objectFit: "cover" },
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 24 },
    gameCard: { background: currentColors.bgCard, borderRadius: 20, overflow: "hidden", cursor: "pointer", border: "1px solid rgba(255,255,255,0.08)", transition: "all 0.3s ease", position: "relative" },
    gameImg: { width: "100%", aspectRatio: "3/4", objectFit: "cover" },
    gameInfo: { padding: "14px" },
    gameName: { fontSize: 14, fontWeight: 700, marginBottom: 4, wordWrap: "break-word" },
    rating: { display: "flex", alignItems: "center", gap: 4, color: currentColors.primary, fontSize: 12, fontWeight: 600, marginBottom: 6 },
    addBtn: { background: currentColors.primary, border: "none", borderRadius: 10, padding: "8px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", width: "100%", marginTop: 8, color: currentColors.bg, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 },
    searchBar: { background: currentColors.bgCard, border: `1px solid rgba(255,255,255,0.08)`, borderRadius: 14, padding: "14px 18px", color: currentColors.text, fontSize: 14, width: "100%", marginBottom: 24, outline: "none" },
    modalOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.96)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" },
    modalContent: { background: currentColors.bgCard, borderRadius: 28, padding: 32, width: "95%", maxWidth: 520, border: `1px solid ${currentColors.primary}30`, maxHeight: "90vh", overflowY: "auto" },
    modalTitle: { fontSize: 26, fontWeight: 700, marginBottom: 24, textAlign: "center", color: currentColors.text },
    input: { width: "100%", background: "rgba(255,255,255,0.08)", border: `1px solid rgba(255,255,255,0.1)`, borderRadius: 12, padding: "14px 18px", color: currentColors.text, fontSize: 14, marginBottom: 16, outline: "none" },
    modalBtn: { background: currentColors.primary, border: "none", borderRadius: 14, padding: "14px", fontSize: 16, fontWeight: 600, cursor: "pointer", width: "100%", marginTop: 12, color: currentColors.bg },
    loadingSpinner: { width: 48, height: 48, border: `3px solid ${currentColors.primary}20`, borderTop: `3px solid ${currentColors.primary}`, borderRadius: "50%", animation: "spin 1s linear infinite" },
    emptyState: { textAlign: "center", padding: 60, background: currentColors.bgCard, borderRadius: 24, color: currentColors.textSecondary },
    sectionTitle: { fontSize: 24, fontWeight: 700, marginBottom: 24, display: "flex", alignItems: "center", gap: 12 },
    filterRow: { display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24, alignItems: "center" },
    filterBtn: (active) => ({ background: active ? currentColors.primary : "rgba(255,255,255,0.05)", border: "none", borderRadius: 10, padding: "8px 16px", color: active ? currentColors.bg : currentColors.text, cursor: "pointer", fontSize: 13 }),
    select: { background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 10, padding: "8px 14px", color: currentColors.text, fontSize: 13, cursor: "pointer" },
    statCard: { background: currentColors.bgCard, borderRadius: 16, padding: "16px", textAlign: "center", flex: 1 },
    statNumber: { fontSize: 28, fontWeight: 800, color: currentColors.primary },
    profileHeader: { display: "flex", gap: 28, alignItems: "center", background: currentColors.bgCard, borderRadius: 28, padding: 28, marginBottom: 28, flexWrap: "wrap", justifyContent: "center" },
    profileAvatarLarge: { width: 100, height: 100, borderRadius: "50%", background: `linear-gradient(135deg, ${currentColors.primary}, ${currentColors.primaryDark})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, fontWeight: 700, position: "relative", objectFit: "cover" },
    cameraIcon: { position: "absolute", bottom: 0, right: 0, background: currentColors.bg, borderRadius: "50%", padding: "8px", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.3)" },
    achievementGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12, marginTop: 16 },
    achievementCard: { background: "rgba(0,0,0,0.3)", borderRadius: 12, padding: 12, display: "flex", alignItems: "center", gap: 12 },
    aiChatContainer: { height: 500, display: "flex", flexDirection: "column", background: currentColors.bgCard, borderRadius: 24, overflow: "hidden" },
    aiMessages: { flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 12 },
    aiMessage: (isUser) => ({ background: isUser ? currentColors.primary : "rgba(255,255,255,0.08)", color: isUser ? currentColors.bg : currentColors.text, padding: "12px 16px", borderRadius: 18, borderBottomRightRadius: isUser ? 4 : 18, borderBottomLeftRadius: isUser ? 18 : 4, maxWidth: "80%", alignSelf: isUser ? "flex-end" : "flex-start" }),
    aiInputRow: { display: "flex", gap: 12, padding: 16, background: "rgba(0,0,0,0.3)", borderTop: `1px solid rgba(255,255,255,0.08)` },
    wheel: { width: 200, height: 200, borderRadius: "50%", background: `conic-gradient(${currentColors.primary} 0deg 72deg, #4caf50 72deg 144deg, #f44336 144deg 216deg, #1b2838 216deg 288deg, #ffd400 288deg 360deg)`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "transform 0.1s", boxShadow: "0 10px 30px rgba(0,0,0,0.3)" },
    wheelInner: { width: 60, height: 60, borderRadius: "50%", background: currentColors.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }
  };

  if (loading) {
    return (
      <div style={styles.app}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
          <div style={styles.loadingSpinner}></div>
        </div>
      </div>
    );
  }

  // ========== GAME DETAIL VIEW ==========
  if (currentTab === "gameDetail" && selectedGameDetail) {
    const tags = customTags[selectedGameDetail.id] || [];
    const isOnWishlist = wishlist.some(g => g.id === selectedGameDetail.id);
    const fullDesc = selectedGameDetail.description;
    const isExpanded = expandedDescriptions[selectedGameDetail.id];
    const shortDesc = fullDesc.length > 200 ? fullDesc.substring(0, 200) + "..." : fullDesc;
    
    return (
      <div style={styles.app}>
        <div style={styles.container}>
          <div style={styles.header}>
            <div style={styles.logo} onClick={() => setCurrentTab("home")}>
              <div style={styles.logoIcon}><span>NX</span></div>
              <span style={styles.logoText}>NexPlay</span>
            </div>
            <div style={styles.rightSection}>
              <span style={styles.badge10k}>10K</span>
              <button className="btn-click" style={styles.navTab(false)} onClick={() => setCurrentTab("home")}>Home</button>
              {user && <div style={styles.avatar}>{userData?.username?.charAt(0).toUpperCase()}</div>}
              {!user && <button style={styles.navTab(false)} onClick={() => setShowLoginModal(true)}>Login</button>}
            </div>
          </div>
          
          <button style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", color: currentColors.text, marginBottom: 20, cursor: "pointer" }} onClick={closeGameDetail}>
            <FaArrowLeft /> Zurück
          </button>
          
          <div style={{ display: "flex", gap: 32, flexWrap: "wrap", marginBottom: 32 }}>
            <img src={selectedGameDetail.img} style={{ width: 240, borderRadius: 20, objectFit: "cover" }} alt={selectedGameDetail.name} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 34, fontWeight: 700, marginBottom: 12 }}>{selectedGameDetail.name}</div>
              <div style={{ fontSize: 15, color: currentColors.textSecondary, marginBottom: 8 }}>{selectedGameDetail.developer}</div>
              <div style={{ fontSize: 18, color: currentColors.primary, marginBottom: 16 }}>★ {selectedGameDetail.rating} · {selectedGameDetail.year} · {selectedGameDetail.playtime}</div>
              <div style={{ fontSize: 15, color: currentColors.textSecondary, lineHeight: 1.6, marginBottom: 20 }}>
                {isExpanded ? fullDesc : shortDesc}
                {fullDesc.length > 200 && (
                  <button style={{ background: "none", border: "none", color: currentColors.primary, cursor: "pointer", marginTop: 8, display: "flex", alignItems: "center", gap: 4 }} onClick={() => setExpandedDescriptions(prev => ({ ...prev, [selectedGameDetail.id]: !prev[selectedGameDetail.id] }))}>
                    {isExpanded ? <><FaChevronUp /> Weniger anzeigen</> : <><FaChevronDown /> Mehr anzeigen</>}
                  </button>
                )}
              </div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
                <button style={{ ...styles.addBtn, width: "auto", padding: "10px 20px" }} onClick={() => addToLibrary(selectedGameDetail)}>+ Zur Bibliothek</button>
                <button style={{ ...styles.addBtn, width: "auto", padding: "10px 20px", background: isOnWishlist ? colors.success : currentColors.primary }} onClick={() => addToWishlist(selectedGameDetail)}>⭐ Wunschliste</button>
              </div>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>Tags:</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
                  {tags.map((tag, i) => (
                    <span key={i} style={{ background: "rgba(255,212,0,0.15)", borderRadius: 20, padding: "4px 12px", fontSize: 12 }}>{tag} <button onClick={() => removeTag(selectedGameDetail.id, i)} style={{ background: "none", border: "none", color: "inherit", cursor: "pointer" }}>✕</button></span>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <input style={{ ...styles.input, marginBottom: 0, padding: "8px 12px", fontSize: 13 }} placeholder="Neuer Tag" value={newTag} onChange={e => setNewTag(e.target.value)} onKeyPress={e => e.key === "Enter" && addTag(selectedGameDetail.id)} />
                  <button style={{ ...styles.addBtn, width: "auto", padding: "8px 16px" }} onClick={() => addTag(selectedGameDetail.id)}>+</button>
                </div>
              </div>
              <div style={{ background: currentColors.bgCard, borderRadius: 16, padding: 16 }}>
                <div style={{ fontWeight: 600, marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}><GiNotebook /> Spiel-Tagebuch</div>
                <textarea style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "none", borderRadius: 12, padding: 12, color: currentColors.text, fontSize: 13, resize: "vertical" }} rows="3" placeholder="Deine Gedanken zum Spiel..." value={journalText} onChange={e => setJournalText(e.target.value)} onBlur={() => saveJournalNote(selectedGameDetail.id)} />
              </div>
            </div>
          </div>
          
          <iframe src={`https://www.youtube.com/embed?listType=search&q=${encodeURIComponent(selectedGameDetail.name)}+trailer`} style={{ width: "100%", height: 360, borderRadius: 20, marginBottom: 28, border: "none" }} title="Trailer" />
          
          <div>
            <div style={styles.sectionTitle}>Bewertung schreiben</div>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 20 }}>
              {[1,2,3,4,5].map(star => (
                <span key={star} style={{ fontSize: 36, cursor: "pointer", color: star <= reviewRating ? currentColors.primary : currentColors.textSecondary }} onClick={() => setReviewRating(star)}>★</span>
              ))}
            </div>
            <textarea style={styles.input} placeholder="Deine Bewertung..." rows="2" value={reviewComment} onChange={e => setReviewComment(e.target.value)} />
            <button style={styles.modalBtn} onClick={submitReview}>Bewertung speichern</button>
          </div>
        </div>
      </div>
    );
  }

  // ========== MAIN APP ==========
  return (
    <div style={styles.app}>
      <div style={styles.container}>
        {/* HEADER */}
        <div style={styles.header}>
          <div style={styles.logo} onClick={() => setCurrentTab("home")}>
            <div style={styles.logoIcon}><span>NX</span></div>
            <span style={styles.logoText}>NexPlay</span>
          </div>
          <div style={styles.rightSection}>
            <span style={styles.badge10k}>10K</span>
            <div style={styles.navTabs}>
              <button style={styles.navTab(currentTab === "home")} onClick={() => setCurrentTab("home")}><FaHome /> Entdecken</button>
              <button style={styles.navTab(currentTab === "library")} onClick={() => setCurrentTab("library")}><BsFillCollectionFill /> Bibliothek</button>
              <button style={styles.navTab(currentTab === "profile")} onClick={() => setCurrentTab("profile")}><FaUser /> Profil</button>
              <button style={styles.navTab(currentTab === "ai")} onClick={() => setCurrentTab("ai")}><FaRobot /> KI</button>
              <button style={styles.navTab(currentTab === "aoty")} onClick={() => setCurrentTab("aoty")}><FaTrophy /> AOTY</button>
              <button style={styles.navTab(currentTab === "random")} onClick={() => setCurrentTab("random")}><FaRandom /> Zufall</button>
              {!user && <button style={styles.navTab(false)} onClick={() => setShowLoginModal(true)}>Login</button>}
              {user && <div style={styles.avatar}>{userData?.username?.charAt(0).toUpperCase()}</div>}
            </div>
          </div>
        </div>

        {/* HOME TAB */}
        {currentTab === "home" && (
          <div>
            <div style={styles.filterRow}>
              <input style={styles.searchBar} placeholder="Spiel suchen..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              <select style={styles.select} value={selectedGenre} onChange={e => setSelectedGenre(e.target.value)}>
                <option>All</option><option>Action</option><option>RPG</option><option>Open World</option><option>Puzzle</option><option>Simulation</option><option>Adventure</option>
              </select>
              <select style={styles.select} value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="rating">Nach Bewertung</option><option value="year">Nach Jahr</option><option value="name">Nach Name</option>
              </select>
            </div>
            <div style={styles.grid}>
              {getGames().map(game => (
                <div key={game.id} style={styles.gameCard} onClick={() => openGameDetail(game)}>
                  <img src={game.img} style={styles.gameImg} alt={game.name} />
                  <div style={{ position: "absolute", top: 12, right: 12, background: "rgba(0,0,0,0.75)", borderRadius: 20, padding: "2px 10px", fontSize: 12, fontWeight: 700, color: currentColors.primary }}>★ {game.rating}</div>
                  <button style={{ position: "absolute", top: 12, left: 12, background: "rgba(0,0,0,0.75)", border: "none", borderRadius: 20, padding: "4px 8px", cursor: "pointer" }} onClick={(e) => { e.stopPropagation(); toggleFavorite(game.id); }}>
                    {favorites.includes(game.id) ? <FaHeart color={currentColors.primary} /> : <FaHeart color="#fff" />}
                  </button>
                  <div style={styles.gameInfo}>
                    <div style={styles.gameName}>{game.name}</div>
                    <div style={styles.rating}><FaStar size={10} /> {game.rating}</div>
                    <div style={{ fontSize: 11, color: currentColors.textSecondary, marginBottom: 8 }}>{game.playtime}</div>
                    <button style={styles.addBtn} onClick={(e) => { e.stopPropagation(); addToLibrary(game); }}>+ Zur Bibliothek</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* LIBRARY TAB */}
        {currentTab === "library" && (
          <div>
            <div style={styles.sectionTitle}>📚 Meine Bibliothek ({library.length})</div>
            <div style={styles.statsRow} className="stats-row">
              <div style={styles.statCard}><div style={styles.statNumber}>{library.length}</div><div>Gesamt</div></div>
              <div style={styles.statCard}><div style={styles.statNumber}>{library.filter(g => g.status === "playing").length}</div><div>Spiele ich</div></div>
              <div style={styles.statCard}><div style={styles.statNumber}>{library.filter(g => g.status === "completed").length}</div><div>Abgeschlossen</div></div>
            </div>
            {library.length === 0 ? <div style={styles.emptyState}>Deine Bibliothek ist leer. Füge Spiele hinzu!</div> : library.map(game => (
              <div key={game.id} style={{ background: currentColors.bgCard, borderRadius: 16, display: "flex", gap: 16, padding: 16, marginBottom: 12, alignItems: "center", flexWrap: "wrap" }}>
                <img src={game.img} style={{ width: 60, height: 80, objectFit: "cover", borderRadius: 12, cursor: "pointer" }} onClick={() => openGameDetail(game)} alt={game.name} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{game.name}</div>
                  <div style={{ fontSize: 12, color: currentColors.textSecondary, marginBottom: 8 }}>{game.developer} · {game.year}</div>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <select style={styles.select} value={game.status} onChange={e => updateStatus(game.id, e.target.value, game)}>
                      <option value="wishlist">📝 Wunschliste</option><option value="playing">🎮 Spiele ich</option><option value="completed">✅ Abgeschlossen</option>
                    </select>
                    <button style={styles.select} onClick={() => toggleFavorite(game.id)}><FaHeart color={favorites.includes(game.id) ? currentColors.primary : "#fff"} /></button>
                    <button style={{ ...styles.select, color: "#ff6b6b" }} onClick={() => removeFromLibrary(game.id)}>Entfernen</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PROFILE TAB */}
        {currentTab === "profile" && (
          <div>
            {user ? (
              <>
                <div style={styles.profileHeader}>
                  <div style={{ position: "relative" }}>
                    {profilePic ? <img src={profilePic} style={styles.profileAvatarLarge} alt="avatar" /> : <div style={styles.profileAvatarLarge}>{userData?.username?.charAt(0).toUpperCase()}</div>}
                    <div style={styles.cameraIcon} onClick={() => fileInputRef.current?.click()}><FaCamera size={16} /></div>
                    <input type="file" ref={fileInputRef} style={{ display: "none" }} accept="image/*" onChange={handleProfilePicUpload} />
                    {uploadingPic && <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", background: "rgba(0,0,0,0.7)", borderRadius: "50%", padding: 8 }}><div style={styles.loadingSpinner} /></div>}
                  </div>
                  <div>
                    <div style={{ fontSize: 28, fontWeight: 700, display: "flex", alignItems: "center", gap: 10 }}>{userData?.username} 👑</div>
                    <div style={{ fontSize: 14, color: currentColors.textSecondary, marginBottom: 16 }}>{user.email}</div>
                    <div style={{ fontSize: 14, color: currentColors.textSecondary, marginBottom: 20 }}>{userData?.bio || "Keine Bio"}</div>
                    <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
                      <div style={styles.statCard}><div style={styles.statNumber}>{library.length}</div><div>Spiele</div></div>
                      <div style={styles.statCard}><div style={styles.statNumber}>{library.filter(g => g.status === "completed").length}</div><div>Abgeschlossen</div></div>
                      <div style={styles.statCard}><div style={styles.statNumber}>{favorites.length}</div><div>Favoriten</div></div>
                      <div style={styles.statCard}><div style={styles.statNumber}>{wishlist.length}</div><div>Wunschliste</div></div>
                    </div>
                    <button style={styles.addBtn} onClick={() => setShowEditModal(true)}><FaEdit /> Profil bearbeiten</button>
                  </div>
                </div>

                {/* ACHIEVEMENTS SICHTBAR */}
                <div style={styles.sectionTitle}><GiAchievement /> Erfolge</div>
                <div style={styles.achievementGrid}>
                  {achievements.map(ach => (
                    <div key={ach.id} style={{ ...styles.achievementCard, opacity: ach.unlocked ? 1 : 0.5 }}>
                      <div style={{ fontSize: 28 }}>{ach.icon}</div>
                      <div><div style={{ fontWeight: 600 }}>{ach.name}</div><div style={{ fontSize: 11, color: currentColors.textSecondary }}>{ach.desc}</div></div>
                    </div>
                  ))}
                </div>

                {/* WISHLIST */}
                {wishlist.length > 0 && (
                  <>
                    <div style={styles.sectionTitle}><FaStar /> Wunschliste</div>
                    <div style={styles.grid}>{wishlist.slice(0, 6).map(game => <div key={game.id} style={styles.gameCard} onClick={() => openGameDetail(game)}><img src={game.img} style={styles.gameImg} alt={game.name} /><div style={styles.gameInfo}><div style={styles.gameName}>{game.name}</div><div style={styles.rating}>★ {game.rating}</div></div></div>)}</div>
                  </>
                )}

                {/* ACTIVITY FEED */}
                {activityFeed.length > 0 && (
                  <>
                    <div style={styles.sectionTitle}><FaBell /> Aktivitäten</div>
                    {activityFeed.slice(0, 5).map(act => (
                      <div key={act.id} style={{ background: currentColors.bgCard, borderRadius: 12, padding: 12, marginBottom: 10, display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ fontSize: 24 }}>{act.type === "add" ? "➕" : "✅"}</div>
                        <div><div>{act.message}</div><div style={{ fontSize: 11, color: currentColors.textSecondary }}>{new Date(act.timestamp).toLocaleString()}</div></div>
                      </div>
                    ))}
                  </>
                )}

                {/* BACKLOG CLEANER */}
                <div style={styles.sectionTitle}><FaChartLine /> Backlog Cleaner</div>
                {library.filter(g => g.status !== "completed" && g.status !== "playing").length > 0 ? (
                  <div style={styles.gameCard} onClick={() => openGameDetail(library.find(g => g.status !== "completed" && g.status !== "playing"))}>
                    <img src={library.find(g => g.status !== "completed" && g.status !== "playing")?.img} style={styles.gameImg} alt="" />
                    <div style={styles.gameInfo}>
                      <div style={styles.gameName}>{library.find(g => g.status !== "completed" && g.status !== "playing")?.name}</div>
                      <button style={styles.addBtn}>Als nächstes spielen</button>
                    </div>
                  </div>
                ) : <div style={styles.emptyState}>Keine Spiele im Backlog! 🎉</div>}
              </>
            ) : <div style={styles.emptyState}>Login um dein Profil zu sehen</div>}
          </div>
        )}

        {/* AI TAB - MIT CHAT UI */}
        {currentTab === "ai" && (
          <div>
            <div style={styles.sectionTitle}><FaRobot /> KI-Assistent mit DeepSeek</div>
            <div style={styles.aiChatContainer}>
              <div style={styles.aiMessages}>
                {aiMessages.map((msg, idx) => (
                  <div key={idx} style={styles.aiMessage(msg.role === "user")}>
                    <div style={{ fontWeight: 600, marginBottom: 4, fontSize: 12, opacity: 0.7 }}>{msg.role === "user" ? "Du" : "NexPlay AI"}</div>
                    <div style={{ fontSize: 14, lineHeight: 1.5 }}>{msg.content}</div>
                  </div>
                ))}
                {isAiLoading && (
                  <div style={styles.aiMessage(false)}>
                    <div style={{ display: "flex", gap: 4 }}>
                      <span style={{ animation: "pulse 1s infinite" }}>●</span>
                      <span style={{ animation: "pulse 1s infinite 0.2s" }}>●</span>
                      <span style={{ animation: "pulse 1s infinite 0.4s" }}>●</span>
                    </div>
                  </div>
                )}
                <div ref={aiChatEndRef} />
              </div>
              <div style={styles.aiInputRow}>
                <input style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "none", borderRadius: 24, padding: "12px 18px", color: currentColors.text, fontSize: 14, outline: "none" }} placeholder="Frag mich nach Spielen..." value={aiInput} onChange={e => setAiInput(e.target.value)} onKeyPress={e => e.key === "Enter" && sendAiMessage()} />
                <button style={styles.addBtn} onClick={sendAiMessage} disabled={isAiLoading}>Senden</button>
              </div>
            </div>
          </div>
        )}

        {/* AOTY TAB */}
        {currentTab === "aoty" && (
          <div>
            <div style={styles.sectionTitle}><FaTrophy /> Game of the Year</div>
            <div style={styles.grid}>
              {Object.entries(AOTY_GAMES).sort((a,b) => parseInt(b[0]) - parseInt(a[0])).map(([year, game]) => (
                <div key={year} style={styles.gameCard} onClick={() => openGameDetail({ ...game, id: `aoty-${year}`, rating: 9.5, playtime: "40-60h", year: parseInt(year) })}>
                  <img src={game.img} style={styles.gameImg} alt={game.name} />
                  <div style={styles.gameInfo}>
                    <div style={{ fontSize: 20, fontWeight: 700, color: currentColors.primary }}>{year}</div>
                    <div style={styles.gameName}>{game.name}</div>
                    <div style={{ fontSize: 12, color: currentColors.textSecondary }}>{game.genre}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RANDOM TAB */}
        {currentTab === "random" && (
          <div>
            <div style={styles.randomFilterSection}>
              <div style={styles.sectionTitle}><FaRandom /> Zufälliges Spiel</div>
              <div style={styles.filterRow}>
                <select style={styles.select} value={randomGenre} onChange={e => setRandomGenre(e.target.value)}>
                  <option value="all">Alle Genres</option><option value="Action">Action</option><option value="RPG">RPG</option><option value="Open World">Open World</option><option value="Puzzle">Puzzle</option>
                </select>
                <div><span>Min. Bewertung: {randomMinRating}</span><input type="range" min="0" max="10" step="0.5" value={randomMinRating} onChange={e => setRandomMinRating(parseFloat(e.target.value))} style={{ width: 150, accentColor: currentColors.primary }} /></div>
                <button style={styles.addBtn} onClick={doRandom}>Zufälliges Spiel</button>
              </div>
            </div>
            
            <div style={styles.gameNightCard}>
              <div style={styles.sectionTitle}><GiSpinningWheel /> Game Night Mode</div>
              <div style={styles.wheelContainer}>
                <div className={spinning ? "spinning-wheel" : ""} style={styles.wheel} onClick={spinWheel}>
                  <div style={styles.wheelInner}><GiSpinningWheel size={28} /></div>
                </div>
              </div>
              <button style={styles.addBtn} onClick={spinWheel} disabled={spinning}>{spinning ? "Spinning..." : "Rad drehen"}</button>
              {spinResult && !spinning && (
                <div style={{ marginTop: 24, textAlign: "center" }}>
                  <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>🎉 Dein Spiel für heute!</div>
                  <div style={styles.gameCard} onClick={() => openGameDetail(spinResult)}>
                    <img src={spinResult.img} style={styles.gameImg} alt={spinResult.name} />
                    <div style={styles.gameInfo}>
                      <div style={styles.gameName}>{spinResult.name}</div>
                      <button style={styles.addBtn}>Zum Spiel</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* MODALS */}
      {showRandomModal && randomGame && (
        <div style={styles.modalOverlay} onClick={() => setShowRandomModal(false)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div style={styles.modalTitle}>🎲 Zufälliges Spiel</div>
            <img src={randomGame.img} style={{ width: "100%", borderRadius: 20, marginBottom: 20 }} alt={randomGame.name} />
            <div style={{ fontSize: 20, fontWeight: 700, textAlign: "center", marginBottom: 8 }}>{randomGame.name}</div>
            <div style={{ fontSize: 16, color: currentColors.primary, textAlign: "center", marginBottom: 20 }}>★ {randomGame.rating} · {randomGame.playtime}</div>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button style={styles.addBtn} onClick={() => { addToLibrary(randomGame); setShowRandomModal(false); }}>+ Hinzufügen</button>
              <button style={styles.modalBtn} onClick={doRandom}>Nochmal</button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && user && (
        <div style={styles.modalOverlay} onClick={() => setShowEditModal(false)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div style={styles.modalTitle}>Profil bearbeiten</div>
            {editSuccess && <div style={{ color: colors.success, textAlign: "center", marginBottom: 16 }}>{editSuccess}</div>}
            <input style={styles.input} placeholder="Benutzername" value={editUsername} onChange={e => setEditUsername(e.target.value)} />
            <textarea style={styles.input} placeholder="Bio" rows="3" value={editBio} onChange={e => setEditBio(e.target.value)} />
            <button style={styles.modalBtn} onClick={handleUpdateProfile}>Speichern</button>
          </div>
        </div>
      )}

      {showLoginModal && (
        <div style={styles.modalOverlay} onClick={() => setShowLoginModal(false)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div style={styles.modalTitle}>{isLogin ? "Anmelden" : "Registrieren"}</div>
            {errorMsg && <div style={{ color: colors.error, textAlign: "center", marginBottom: 16 }}>{errorMsg}</div>}
            <input style={styles.input} type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
            <div style={{ position: "relative" }}>
              <input style={styles.input} type={showPassword ? "text" : "password"} placeholder="Passwort" value={password} onChange={e => setPassword(e.target.value)} />
              <span style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", cursor: "pointer" }} onClick={() => setShowPassword(!showPassword)}>{showPassword ? "👁️" : "👁️‍🗨️"}</span>
            </div>
            <button style={styles.modalBtn} onClick={isLogin ? handleLogin : handleRegister}>{isLogin ? "Anmelden" : "Registrieren"}</button>
            <div style={{ textAlign: "center", marginTop: 16, cursor: "pointer", color: currentColors.textSecondary }} onClick={() => { setIsLogin(!isLogin); setErrorMsg(""); }}>{isLogin ? "Noch keinen Account? Registrieren" : "Bereits einen Account? Anmelden"}</div>
          </div>
        </div>
      )}

      {loadingAction && (
        <div style={styles.modalOverlay}>
          <div style={styles.loadingSpinner}></div>
        </div>
      )}
    </div>
  );
}