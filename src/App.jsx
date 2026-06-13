import { useState, useEffect, useRef } from "react";
import { FaHome, FaUser, FaBook, FaTrophy, FaRandom, FaRobot, FaSignOutAlt, FaPlus, FaHeart, FaStar, FaTrash, FaEdit, FaCamera, FaSearch, FaUsers, FaClock, FaThumbsUp, FaThumbsDown, FaArrowLeft, FaCog, FaMoon, FaSun, FaAdjust, FaBars, FaTimes, FaChevronDown, FaChevronUp, FaFire, FaGamepad, FaSteam, FaShoppingCart, FaChartLine, FaBell, FaLanguage, FaDonate, FaGem, FaMedal, FaList, FaFileExport, FaFileImport } from "react-icons/fa";
import { GiAchievement, GiSpinningWheel, GiNotebook } from "react-icons/gi";
import { BsFillCollectionFill } from "react-icons/bs";
import { SiKofi } from "react-icons/si";
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
  error: "#f44336"
};

const DEEPSEEK_API_KEY = "sk-b5699f49547a4e4ab7eaa74cb6bb7016";

const FIXED_GAMES = [
  { id: 1, name: "The Witcher 3: Wild Hunt", rating: 9.5, genre: "RPG", playtime: "100h+", year: 2015, img: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/292030/header.jpg", developer: "CD Projekt Red", description: "Ein Meisterwerk des Open-World-RPGs. Als Geralt von Riva jagst du Monster, löst Quests und triffst Entscheidungen, die die Welt verändern.", steamId: 292030 },
  { id: 2, name: "Red Dead Redemption 2", rating: 9.6, genre: "Open World", playtime: "100h+", year: 2018, img: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1174180/header.jpg", developer: "Rockstar Games", description: "Ein episches Western-Epos. Erlebe die Geschichte von Arthur Morgan, einem Outlaw auf der Flucht vor der Moderne.", steamId: 1174180 },
  { id: 3, name: "Elden Ring", rating: 9.5, genre: "Open World", playtime: "100h+", year: 2022, img: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1245620/header.jpg", developer: "FromSoftware", description: "Ein Meisterwerk des Open-World-Action-RPGs. Erkunde 'The Lands Between' mit seinen Geheimnissen und herausfordernden Bossen.", steamId: 1245620 },
  { id: 4, name: "Baldur's Gate 3", rating: 9.6, genre: "RPG", playtime: "100h+", year: 2023, img: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1086940/header.jpg", developer: "Larian Studios", description: "Das ultimative D&D-Rollenspielerlebnis. Erstelle deinen Charakter und erlebe eine epische Geschichte.", steamId: 1086940 },
  { id: 5, name: "God of War (2018)", rating: 9.4, genre: "Action", playtime: "40-60h", year: 2018, img: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1593500/header.jpg", developer: "Santa Monica Studio", description: "Eine emotionale Reise durch die nordische Mythologie. Kratos und sein Sohn Atreus haben eine der besten Vater-Sohn-Beziehungen.", steamId: 1593500 },
  { id: 6, name: "Cyberpunk 2077", rating: 8.5, genre: "RPG", playtime: "60-100h", year: 2020, img: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1091500/header.jpg", developer: "CD Projekt Red", description: "Ein Open-World-RPG in einer dystopischen Zukunft. Night City ist eine der beeindruckendsten Spielwelten.", steamId: 1091500 },
  { id: 7, name: "Hades", rating: 9.3, genre: "Action", playtime: "40-60h", year: 2020, img: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1145360/header.jpg", developer: "Supergiant Games", description: "Ein Roguelite-Actionspiel mit griechischer Mythologie. Jeder Lauf fühlt sich frisch an.", steamId: 1145360 },
  { id: 8, name: "Stardew Valley", rating: 9.2, genre: "Simulation", playtime: "100h+", year: 2016, img: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/413150/header.jpg", developer: "ConcernedApe", description: "Ein Farm-Simulator mit RPG-Elementen. Baue deine Farm auf, erkunde Minen und knüpfe Freundschaften.", steamId: 413150 },
  { id: 9, name: "Hollow Knight", rating: 9.3, genre: "Action", playtime: "40-60h", year: 2017, img: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/367520/header.jpg", developer: "Team Cherry", description: "Ein atmosphärisches Metroidvania. Erkunde eine riesige unterirdische Welt voller Geheimnisse.", steamId: 367520 },
  { id: 10, name: "Portal 2", rating: 9.4, genre: "Puzzle", playtime: "10-20h", year: 2011, img: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/620/header.jpg", developer: "Valve", description: "Das perfekte Puzzlespiel. Löse kreative Rätsel mit der Portal-Gun.", steamId: 620 },
  { id: 11, name: "Disco Elysium", rating: 9.4, genre: "RPG", playtime: "40-60h", year: 2019, img: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/632470/header.jpg", developer: "ZA/UM", description: "Ein einzigartiges Detektiv-RPG ohne Kampf. Deine Entscheidungen und Dialoge bestimmen den Verlauf.", steamId: 632470 },
  { id: 12, name: "Outer Wilds", rating: 9.3, genre: "Adventure", playtime: "20-40h", year: 2019, img: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/753640/header.jpg", developer: "Mobius Digital", description: "Ein Open-World-Mystery-Spiel in einer Zeitschleife. Erkunde ein Sonnensystem voller Geheimnisse.", steamId: 753640 }
];

const HIDDEN_GEMS = [
  { id: 101, name: "CrossCode", rating: 9.1, genre: "Action RPG", img: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/368340/header.jpg", description: "Ein unterschätztes Meisterwerk mit pixeliger Grafik und fordernden Rätseln." },
  { id: 102, name: "Katana ZERO", rating: 9.0, genre: "Action", img: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/460950/header.jpg", description: "Ein stylisher Neo-Noir-Actionspiel mit Zeitlupen-Mechaniken." },
  { id: 103, name: "Return of the Obra Dinn", rating: 9.2, genre: "Puzzle", img: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/653530/header.jpg", description: "Ein einzigartiges Detektivspiel mit 1-Bit-Grafik." },
  { id: 104, name: "Outer Wilds", rating: 9.3, genre: "Adventure", img: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/753640/header.jpg", description: "Ein mysteriöses Weltraum-Abenteuer in einer Zeitschleife." }
];

const AOTY_GAMES = {
  2025: { name: "Clair Obscur: Expedition 33", img: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/2358720/header.jpg", genre: "RPG", developer: "Kepler Interactive" },
  2024: { name: "Astro Bot", img: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/2357570/header.jpg", genre: "Platformer", developer: "Team Asobi" },
  2023: { name: "Baldur's Gate 3", img: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1086940/header.jpg", genre: "RPG", developer: "Larian Studios" },
  2022: { name: "Elden Ring", img: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1245620/header.jpg", genre: "Open World", developer: "FromSoftware" },
  2021: { name: "It Takes Two", img: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1426210/header.jpg", genre: "Adventure", developer: "Hazelight Studios" },
  2020: { name: "The Last of Us Part II", img: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1888930/header.jpg", genre: "Action", developer: "Naughty Dog" }
};

const GENRES = ["All", "Action", "RPG", "Open World", "Puzzle", "Simulation", "Adventure"];

export default function NexPlay() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profilePic, setProfilePic] = useState(null);
  const [uploadingPic, setUploadingPic] = useState(false);
  const fileInputRef = useRef(null);
  
  const [theme, setTheme] = useState(() => localStorage.getItem("nexplay_theme") || "dark");
  const [language, setLanguage] = useState(() => localStorage.getItem("nexplay_language") || "de");
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
  const [showNotification, setShowNotification] = useState(null);
  
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
  const [compareGames, setCompareGames] = useState([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [sortBy, setSortBy] = useState("rating");
  const [topGenre, setTopGenre] = useState("All");
  
  const [aiMessages, setAiMessages] = useState([
    { role: "assistant", content: "🎮 Hallo! Ich bin dein Gaming-Assistent! Ich kann dir Spiele empfehlen, Fragen beantworten und Tipps geben. Was möchtest du wissen?" }
  ]);
  const [aiInput, setAiInput] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const aiChatEndRef = useRef(null);
  
  const [randomGame, setRandomGame] = useState(null);
  const [showRandomModal, setShowRandomModal] = useState(false);
  const [randomMinRating, setRandomMinRating] = useState(7);
  const [randomGenre, setRandomGenre] = useState("all");
  const [spinning, setSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState(null);
  
  const [searchUsersTerm, setSearchUsersTerm] = useState("");
  const [foundUsers, setFoundUsers] = useState([]);
  
  const [userLevel, setUserLevel] = useState(1);
  const [userXP, setUserXP] = useState(0);
  const [userBadges, setUserBadges] = useState([]);
  
  const [soundEnabled, setSoundEnabled] = useState(true);

  const currentColors = theme === "dark" ? colors : { ...colors, bg: "#ffffff", bgCard: "#f0f0f0", text: "#000000", textSecondary: "#666666" };

  const showNotif = (msg, type = "success") => {
    setShowNotification({ msg, type });
    setTimeout(() => setShowNotification(null), 3000);
  };

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

  const calculateXP = () => {
    let xp = 0;
    xp += library.length * 10;
    xp += library.filter(g => g.status === "completed").length * 25;
    xp += favorites.length * 5;
    xp += gameDetailReviews.length * 15;
    xp += Object.keys(gameJournal).length * 10;
    return xp;
  };

  const calculateLevel = (xp) => Math.floor(Math.sqrt(xp / 100)) + 1;

  const updateUserLevel = () => {
    const newXP = calculateXP();
    setUserXP(newXP);
    const newLevel = calculateLevel(newXP);
    setUserLevel(newLevel);
    
    const badges = [];
    if (library.length >= 10) badges.push({ id: "collector", name: "Sammler", icon: "📚" });
    if (library.length >= 50) badges.push({ id: "master", name: "Spielemeister", icon: "👑" });
    if (gameDetailReviews.length >= 10) badges.push({ id: "critic", name: "Kritiker", icon: "✍️" });
    if (library.filter(g => g.status === "completed").length >= 10) badges.push({ id: "completionist", name: "Vollender", icon: "✅" });
    if (newLevel >= 10) badges.push({ id: "veteran", name: "Veteran", icon: "🎖️" });
    if (newLevel >= 25) badges.push({ id: "legend", name: "Legende", icon: "🏆" });
    setUserBadges(badges);
  };

  useEffect(() => {
    if (user) updateUserLevel();
  }, [library, favorites, gameDetailReviews, gameJournal]);

  const sendAiMessage = async () => {
    if (!aiInput.trim()) return;
    
    const userMessage = aiInput.trim();
    setAiMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setAiInput("");
    setIsAiLoading(true);
    
    const getLocalResponse = (msg) => {
      const lowerMsg = msg.toLowerCase();
      if (lowerMsg.includes("empfehl")) {
        const random = FIXED_GAMES[Math.floor(Math.random() * FIXED_GAMES.length)];
        return `🎮 Empfehlung: **${random.name}**!\n⭐ Bewertung: ${random.rating}/10\n🎭 Genre: ${random.genre}\n⏱️ Spielzeit: ${random.playtime}\n\n${random.description.substring(0, 150)}...`;
      }
      if (lowerMsg.includes("witcher")) {
        return "🐺 **The Witcher 3 Tipps:**\n• Mach alle Nebenquests\n• Lerne Gwent\n• Die DLCs sind ein Muss!";
      }
      if (lowerMsg.includes("elden ring")) {
        return "🗡️ **Elden Ring Tipps:**\n• Level Lebenspunkte zuerst\n• Erkunde Limgrave gründlich\n• Nutze Geisterbeschwörungen";
      }
      return `Danke für deine Frage! Ich kann dir helfen mit:\n• Spielempfehlungen\n• Spiel-Tipps\n• Genre-Fragen\n\nWas möchtest du wissen?`;
    };
    
    try {
      const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${DEEPSEEK_API_KEY}` },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            { role: "system", content: "Du bist ein Gaming-Assistent. Antworte auf Deutsch, freundlich und mit Emojis." },
            ...aiMessages.slice(-5).map(m => ({ role: m.role, content: m.content })),
            { role: "user", content: userMessage }
          ],
          temperature: 0.7,
          max_tokens: 500
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setAiMessages(prev => [...prev, { role: "assistant", content: data.choices?.[0]?.message?.content || getLocalResponse(userMessage) }]);
      } else {
        setAiMessages(prev => [...prev, { role: "assistant", content: getLocalResponse(userMessage) }]);
      }
    } catch (error) {
      setAiMessages(prev => [...prev, { role: "assistant", content: getLocalResponse(userMessage) }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const getGames = () => {
    let games = [...FIXED_GAMES];
    if (searchQuery) games = games.filter(g => g.name.toLowerCase().includes(searchQuery.toLowerCase()));
    if (selectedGenre !== "All") games = games.filter(g => g.genre === selectedGenre);
    if (sortBy === "rating") games.sort((a, b) => b.rating - a.rating);
    else if (sortBy === "year") games.sort((a, b) => b.year - a.year);
    else if (sortBy === "name") games.sort((a, b) => a.name.localeCompare(b.name));
    return games;
  };

  const getGamesByGenre = (genre) => {
    if (genre === "All") return [...FIXED_GAMES].sort((a, b) => b.rating - a.rating).slice(0, 10);
    return FIXED_GAMES.filter(g => g.genre === genre).sort((a, b) => b.rating - a.rating);
  };

  const openGameDetail = (game) => {
    playSound();
    setSelectedGameDetail(game);
    setJournalText(gameJournal[game.id] || "");
    if (user) getGameReviews(game.id).then(setGameDetailReviews).catch(() => {});
    setCurrentTab("gameDetail");
  };

  const closeGameDetail = () => {
    setSelectedGameDetail(null);
    setCurrentTab("home");
  };

  const addToLibrary = (game) => {
    if (library.find(g => g.id === game.id)) return;
    setLibrary([...library, { ...game, status: "wishlist", dateAdded: new Date().toISOString() }]);
    setActivityFeed(prev => [{ id: Date.now(), type: "add", message: `${userData?.username || "User"} hat ${game.name} hinzugefügt`, timestamp: new Date().toISOString() }, ...prev].slice(0, 20));
    updateUserLevel();
    playSound();
    showNotif(`${game.name} wurde hinzugefügt!`);
  };

  const removeFromLibrary = (id) => {
    setLibrary(library.filter(g => g.id !== id));
    playSound();
    showNotif("Spiel entfernt");
  };

  const updateStatus = (id, status, game) => {
    setLibrary(library.map(g => g.id === id ? { ...g, status } : g));
    if (status === "completed") {
      setActivityFeed(prev => [{ id: Date.now(), type: "completed", message: `${userData?.username || "User"} hat ${game.name} abgeschlossen! 🎉`, timestamp: new Date().toISOString() }, ...prev].slice(0, 20));
      showNotif(`Glückwunsch! ${game.name} abgeschlossen! 🎉`);
    }
    updateUserLevel();
    playSound();
  };

  const toggleFavorite = (id) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    updateUserLevel();
    playSound();
  };

  const addToWishlist = (game) => {
    if (wishlist.find(g => g.id === game.id)) return;
    setWishlist([...wishlist, game]);
    playSound();
    showNotif(`${game.name} auf Wunschliste!`);
  };

  const saveJournalNote = (gameId) => {
    setGameJournal(prev => ({ ...prev, [gameId]: journalText }));
    updateUserLevel();
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
    if (user) {
      await addGameReview(user.uid, selectedGameDetail.id, selectedGameDetail.name, reviewRating, reviewComment);
      const reviews = await getGameReviews(selectedGameDetail.id);
      setGameDetailReviews(reviews);
    } else {
      setGameDetailReviews(prev => [{ id: Date.now(), userId: "demo", rating: reviewRating, comment: reviewComment, createdAt: new Date().toISOString(), likes: [], dislikes: [] }, ...prev]);
    }
    updateUserLevel();
    setReviewRating(0);
    setReviewComment("");
    playSound();
    showNotif("Review gespeichert!");
  };

  const handleLikeReview = async (reviewId) => {
    if (!user) return;
    await likeReview(reviewId, user.uid);
    const reviews = await getGameReviews(selectedGameDetail.id);
    setGameDetailReviews(reviews);
  };

  const handleDislikeReview = async (reviewId) => {
    if (!user) return;
    await dislikeReview(reviewId, user.uid);
    const reviews = await getGameReviews(selectedGameDetail.id);
    setGameDetailReviews(reviews);
  };

  const addToCompare = (game) => {
    if (compareGames.find(g => g.id === game.id)) {
      setCompareGames(compareGames.filter(g => g.id !== game.id));
    } else if (compareGames.length < 2) {
      setCompareGames([...compareGames, game]);
    } else {
      showNotif("Maximal 2 Spiele vergleichen!", "error");
    }
  };

  const exportLibrary = () => {
    const data = { library, favorites, wishlist, customTags, gameJournal, playlists };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nexplay_backup_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotif("Bibliothek exportiert!");
  };

  const importLibrary = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.library) setLibrary(data.library);
        if (data.favorites) setFavorites(data.favorites);
        if (data.wishlist) setWishlist(data.wishlist);
        if (data.customTags) setCustomTags(data.customTags);
        if (data.gameJournal) setGameJournal(data.gameJournal);
        if (data.playlists) setPlaylists(data.playlists);
        showNotif("Bibliothek importiert!");
      } catch (err) {
        showNotif("Fehler beim Import!", "error");
      }
    };
    reader.readAsText(file);
  };

  const createPlaylist = (name) => {
    if (!name.trim()) return;
    setPlaylists([...playlists, { id: Date.now(), name, games: [], createdAt: new Date().toISOString() }]);
    showNotif(`Playlist "${name}" erstellt!`);
  };

  const addToPlaylist = (playlistId, game) => {
    setPlaylists(playlists.map(p => 
      p.id === playlistId && !p.games.find(g => g.id === game.id)
        ? { ...p, games: [...p.games, game] }
        : p
    ));
    showNotif(`Zu Playlist hinzugefügt!`);
  };

  const achievements = [
    { id: "first", name: "Erstes Spiel", desc: "Spiel zur Bibliothek hinzugefügt", icon: "🎮", unlocked: library.length >= 1 },
    { id: "collector", name: "Sammler", desc: "10 Spiele gesammelt", icon: "📚", unlocked: library.length >= 10 },
    { id: "completionist", name: "Vollender", desc: "5 Spiele abgeschlossen", icon: "✅", unlocked: library.filter(g => g.status === "completed").length >= 5 },
    { id: "favorites", name: "Herzensbrecher", desc: "5 Favoriten", icon: "❤️", unlocked: favorites.length >= 5 },
    { id: "critic", name: "Kritiker", desc: "5 Reviews", icon: "✍️", unlocked: gameDetailReviews.length >= 5 },
    { id: "level10", name: "Level 10", desc: "Erreiche Level 10", icon: "⭐", unlocked: userLevel >= 10 },
    { id: "master", name: "Meister", desc: "Level 25", icon: "🏆", unlocked: userLevel >= 25 }
  ];

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
      showNotif("Profilbild geändert!");
    } catch (err) {
      showNotif("Fehler beim Hochladen", "error");
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
    showNotif("Profil gespeichert!");
  };

  const searchUsersHandler = async () => {
    if (!searchUsersTerm.trim()) return;
    const results = await searchUsers(searchUsersTerm);
    setFoundUsers(results);
  };

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

  useEffect(() => { if (user && library.length) saveLibraryToFirestore(user.uid, library); }, [library, user]);
  useEffect(() => { if (user && favorites) saveProfileToFirestore(user.uid, { favorites }); }, [favorites, user]);
  useEffect(() => { if (user && wishlist) saveProfileToFirestore(user.uid, { wishlist }); }, [wishlist, user]);
  useEffect(() => { if (user && activityFeed) saveProfileToFirestore(user.uid, { activityFeed }); }, [activityFeed, user]);
  useEffect(() => { if (user && playlists) saveProfileToFirestore(user.uid, { playlists }); }, [playlists, user]);
  useEffect(() => { if (user && customTags) saveProfileToFirestore(user.uid, { customTags }); }, [customTags, user]);
  useEffect(() => { if (user && gameJournal) saveProfileToFirestore(user.uid, { gameJournal }); }, [gameJournal, user]);

  const handleLogin = async () => {
    if (!email || !password) { setErrorMsg("Email und Passwort erforderlich"); return; }
    setLoadingAction(true);
    const result = await loginWithEmail(email, password);
    if (result && !result.error) {
      setShowLoginModal(false);
      setEmail("");
      setPassword("");
      playSound();
      showNotif("Willkommen zurück!");
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
      showNotif("Account erstellt! Willkommen bei NexPlay!");
    } else {
      setErrorMsg(result.error || "Registrierung fehlgeschlagen");
    }
    setLoadingAction(false);
  };

  const doRandom = () => {
    let pool = [...FIXED_GAMES, ...HIDDEN_GEMS];
    if (randomGenre !== "all") pool = pool.filter(g => g.genre === randomGenre);
    if (randomMinRating) pool = pool.filter(g => (g.rating || 9.0) >= randomMinRating);
    if (pool.length === 0) pool = [...FIXED_GAMES];
    setRandomGame(pool[Math.floor(Math.random() * pool.length)]);
    setShowRandomModal(true);
    playSound();
  };

  const spinWheel = () => {
    setSpinning(true);
    setTimeout(() => {
      setSpinResult([...FIXED_GAMES, ...HIDDEN_GEMS][Math.floor(Math.random() * ([...FIXED_GAMES, ...HIDDEN_GEMS].length))]);
      setSpinning(false);
      playSound();
    }, 500);
  };

  const styles = {
    app: { background: currentColors.bg, minHeight: "100vh", color: currentColors.text, fontFamily: "'Inter', system-ui, sans-serif" },
    container: { maxWidth: 1400, margin: "0 auto", padding: "0 24px" },
    header: { padding: "20px 0", borderBottom: `1px solid ${currentColors.primary}20`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 },
    logo: { display: "flex", alignItems: "center", gap: 12, cursor: "pointer" },
    logoIcon: { background: `linear-gradient(135deg, ${currentColors.primary}, ${currentColors.primaryDark})`, borderRadius: "14px", padding: "10px 12px" },
    logoText: { fontSize: 22, fontWeight: 800, background: `linear-gradient(135deg, ${currentColors.primary}, ${currentColors.primaryDark})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
    rightSection: { display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" },
    badge10k: { background: currentColors.primary, color: currentColors.bg, borderRadius: "20px", padding: "6px 14px", fontSize: 13, fontWeight: 700 },
    navTabs: { display: "flex", gap: 8, flexWrap: "wrap" },
    navTab: (active) => ({ background: active ? currentColors.primary : `${currentColors.primary}20`, border: "none", borderRadius: 12, padding: "10px 20px", color: active ? currentColors.bg : currentColors.text, cursor: "pointer", fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", gap: 8 }),
    avatar: { width: 40, height: 40, borderRadius: "50%", background: currentColors.primary, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 18 },
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 24 },
    gameCard: { background: currentColors.bgCard, borderRadius: 20, overflow: "hidden", cursor: "pointer", border: `1px solid ${currentColors.primary}20`, transition: "all 0.3s ease", position: "relative" },
    gameImg: { width: "100%", aspectRatio: "3/4", objectFit: "cover" },
    gameInfo: { padding: "14px" },
    gameName: { fontSize: 14, fontWeight: 700, marginBottom: 4 },
    rating: { display: "flex", alignItems: "center", gap: 4, color: currentColors.primary, fontSize: 12, fontWeight: 600, marginBottom: 6 },
    addBtn: { background: currentColors.primary, border: "none", borderRadius: 10, padding: "8px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", width: "100%", marginTop: 8, color: currentColors.bg, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 },
    searchBar: { background: currentColors.bgCard, border: `1px solid ${currentColors.primary}20`, borderRadius: 14, padding: "14px 18px", color: currentColors.text, fontSize: 14, width: "100%", marginBottom: 24, outline: "none" },
    modalOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.96)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" },
    modalContent: { background: currentColors.bgCard, borderRadius: 28, padding: 32, width: "95%", maxWidth: 520, border: `1px solid ${currentColors.primary}30`, maxHeight: "90vh", overflowY: "auto" },
    modalTitle: { fontSize: 26, fontWeight: 700, marginBottom: 24, textAlign: "center", color: currentColors.text },
    input: { width: "100%", background: `${currentColors.primary}10`, border: `1px solid ${currentColors.primary}30`, borderRadius: 12, padding: "14px 18px", color: currentColors.text, fontSize: 14, marginBottom: 16, outline: "none" },
    modalBtn: { background: currentColors.primary, border: "none", borderRadius: 14, padding: "14px", fontSize: 16, fontWeight: 600, cursor: "pointer", width: "100%", marginTop: 12, color: currentColors.bg },
    loadingSpinner: { width: 48, height: 48, border: `3px solid ${currentColors.primary}20`, borderTop: `3px solid ${currentColors.primary}`, borderRadius: "50%", animation: "spin 1s linear infinite" },
    emptyState: { textAlign: "center", padding: 60, background: currentColors.bgCard, borderRadius: 24, color: currentColors.textSecondary },
    sectionTitle: { fontSize: 24, fontWeight: 700, marginBottom: 24, display: "flex", alignItems: "center", gap: 12 },
    filterRow: { display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24, alignItems: "center" },
    select: { background: `${currentColors.primary}10`, border: `1px solid ${currentColors.primary}30`, borderRadius: 10, padding: "8px 14px", color: currentColors.text, fontSize: 13, cursor: "pointer" },
    statCard: { background: currentColors.bgCard, borderRadius: 16, padding: "16px", textAlign: "center", flex: 1 },
    statNumber: { fontSize: 28, fontWeight: 800, color: currentColors.primary },
    profileHeader: { display: "flex", gap: 28, alignItems: "center", background: currentColors.bgCard, borderRadius: 28, padding: 28, marginBottom: 28, flexWrap: "wrap", justifyContent: "center" },
    profileAvatarLarge: { width: 100, height: 100, borderRadius: "50%", background: `linear-gradient(135deg, ${currentColors.primary}, ${currentColors.primaryDark})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, fontWeight: 700, position: "relative" },
    cameraIcon: { position: "absolute", bottom: 0, right: 0, background: currentColors.bg, borderRadius: "50%", padding: "8px", cursor: "pointer" },
    achievementGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12, marginTop: 16 },
    achievementCard: { background: `${currentColors.primary}10`, borderRadius: 12, padding: 12, display: "flex", alignItems: "center", gap: 12 },
    aiChatContainer: { height: 550, display: "flex", flexDirection: "column", background: currentColors.bgCard, borderRadius: 24, overflow: "hidden" },
    aiMessages: { flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 12 },
    aiMessage: (isUser) => ({ background: isUser ? currentColors.primary : `${currentColors.primary}20`, color: isUser ? currentColors.bg : currentColors.text, padding: "12px 16px", borderRadius: 18, borderBottomRightRadius: isUser ? 4 : 18, borderBottomLeftRadius: isUser ? 18 : 4, maxWidth: "80%", alignSelf: isUser ? "flex-end" : "flex-start", whiteSpace: "pre-wrap" }),
    aiInputRow: { display: "flex", gap: 12, padding: 16, background: `${currentColors.primary}10`, borderTop: `1px solid ${currentColors.primary}20` },
    wheel: { width: 200, height: 200, borderRadius: "50%", background: `conic-gradient(${currentColors.primary} 0deg 72deg, #4caf50 72deg 144deg, #f44336 144deg 216deg, #1b2838 216deg 288deg, ${currentColors.primary} 288deg 360deg)`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" },
    wheelInner: { width: 60, height: 60, borderRadius: "50%", background: currentColors.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 },
    notification: { position: "fixed", bottom: 20, right: 20, background: currentColors.primary, color: currentColors.bg, padding: "12px 24px", borderRadius: 12, zIndex: 3000, animation: "slideIn 0.3s ease" }
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

  if (currentTab === "gameDetail" && selectedGameDetail) {
    const tags = customTags[selectedGameDetail.id] || [];
    const isOnLibrary = library.some(g => g.id === selectedGameDetail.id);
    const isOnWishlist = wishlist.some(g => g.id === selectedGameDetail.id);
    const isCompared = compareGames.some(g => g.id === selectedGameDetail.id);
    const isExpanded = expandedDescriptions[selectedGameDetail.id];
    
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
              <button style={styles.navTab(false)} onClick={() => setCurrentTab("home")}>Home</button>
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
                {isExpanded ? selectedGameDetail.description : (selectedGameDetail.description.length > 200 ? selectedGameDetail.description.substring(0, 200) + "..." : selectedGameDetail.description)}
                {selectedGameDetail.description.length > 200 && (
                  <button style={{ background: "none", border: "none", color: currentColors.primary, cursor: "pointer", marginTop: 8 }} onClick={() => setExpandedDescriptions(prev => ({ ...prev, [selectedGameDetail.id]: !prev[selectedGameDetail.id] }))}>
                    {isExpanded ? "Weniger" : "Mehr"} <FaChevronDown />
                  </button>
                )}
              </div>
              
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
                {selectedGameDetail.steamId && (
                  <a href={`https://store.steampowered.com/app/${selectedGameDetail.steamId}`} target="_blank" rel="noopener noreferrer" style={{ ...styles.addBtn, width: "auto", padding: "10px 20px", textDecoration: "none", background: "#1b2838" }}>
                    <FaSteam /> Steam
                  </a>
                )}
                <a href={`https://www.amazon.de/s?k=${encodeURIComponent(selectedGameDetail.name)}+game`} target="_blank" rel="noopener noreferrer" style={{ ...styles.addBtn, width: "auto", padding: "10px 20px", textDecoration: "none", background: "#ff9900" }}>
                  <SiAmazon /> Amazon
                </a>
              </div>
              
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
                {!isOnLibrary && <button style={{ ...styles.addBtn, width: "auto", padding: "10px 20px" }} onClick={() => addToLibrary(selectedGameDetail)}>+ Bibliothek</button>}
                <button style={{ ...styles.addBtn, width: "auto", padding: "10px 20px", background: isCompared ? colors.success : currentColors.primary }} onClick={() => addToCompare(selectedGameDetail)}>
                  {isCompared ? "✓ Vergleichen" : "🔄 Vergleichen"}
                </button>
                <button style={{ ...styles.addBtn, width: "auto", padding: "10px 20px", background: isOnWishlist ? colors.success : currentColors.primary }} onClick={() => addToWishlist(selectedGameDetail)}>⭐ Wunschliste</button>
              </div>
              
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>Tags:</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {tags.map((tag, i) => (
                    <span key={i} style={{ background: `${currentColors.primary}20`, borderRadius: 20, padding: "4px 12px", fontSize: 12 }}>{tag} <button onClick={() => removeTag(selectedGameDetail.id, i)} style={{ background: "none", border: "none", cursor: "pointer" }}>✕</button></span>
                  ))}
                  <input style={{ ...styles.input, marginBottom: 0, padding: "4px 12px", width: 100, fontSize: 12 }} placeholder="Neuer Tag" value={newTag} onChange={e => setNewTag(e.target.value)} onKeyPress={e => e.key === "Enter" && addTag(selectedGameDetail.id)} />
                  <button style={{ ...styles.addBtn, width: "auto", padding: "4px 12px" }} onClick={() => addTag(selectedGameDetail.id)}>+</button>
                </div>
              </div>
              
              <div style={{ background: currentColors.bgCard, borderRadius: 16, padding: 16 }}>
                <div style={{ fontWeight: 600, marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}><GiNotebook /> Spiel-Tagebuch</div>
                <textarea style={{ width: "100%", background: `${currentColors.primary}10`, border: "none", borderRadius: 12, padding: 12, color: currentColors.text, fontSize: 13, resize: "vertical" }} rows="3" placeholder="Deine Gedanken zum Spiel..." value={journalText} onChange={e => setJournalText(e.target.value)} onBlur={() => saveJournalNote(selectedGameDetail.id)} />
              </div>
            </div>
          </div>
          
          <iframe src={`https://www.youtube.com/embed?listType=search&q=${encodeURIComponent(selectedGameDetail.name)}+trailer`} style={{ width: "100%", height: 360, borderRadius: 20, marginBottom: 28, border: "none" }} title="Trailer" />
          
          <div>
            <div style={styles.sectionTitle}>⭐ Bewertung schreiben</div>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 20 }}>
              {[1,2,3,4,5].map(star => (
                <span key={star} style={{ fontSize: 36, cursor: "pointer", color: star <= reviewRating ? currentColors.primary : currentColors.textSecondary }} onClick={() => setReviewRating(star)}>★</span>
              ))}
            </div>
            <textarea style={styles.input} placeholder="Deine Bewertung..." rows="3" value={reviewComment} onChange={e => setReviewComment(e.target.value)} />
            <button style={styles.modalBtn} onClick={submitReview}>Bewertung speichern</button>
            
            {gameDetailReviews.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <div style={styles.sectionTitle}>📝 Reviews ({gameDetailReviews.length})</div>
                {gameDetailReviews.map(review => (
                  <div key={review.id} style={{ background: `${currentColors.primary}10`, borderRadius: 12, padding: 16, marginBottom: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <span style={{ color: currentColors.primary }}>★ {review.rating}</span>
                      <span style={{ fontSize: 12, color: currentColors.textSecondary }}>{new Date(review.createdAt).toLocaleString()}</span>
                    </div>
                    <div style={{ fontSize: 14, marginBottom: 12 }}>{review.comment}</div>
                    {user && (
                      <div style={{ display: "flex", gap: 16 }}>
                        <button style={{ background: "none", border: "none", color: currentColors.text, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }} onClick={() => handleLikeReview(review.id)}>
                          <FaThumbsUp /> {review.likes?.length || 0}
                        </button>
                        <button style={{ background: "none", border: "none", color: currentColors.text, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }} onClick={() => handleDislikeReview(review.id)}>
                          <FaThumbsDown /> {review.dislikes?.length || 0}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.app}>
      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        .spinning-wheel { animation: spin 0.5s ease-out; }
      `}</style>
      
      {showNotification && <div style={styles.notification}>{showNotification.msg}</div>}
      
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.logo} onClick={() => setCurrentTab("home")}>
            <div style={styles.logoIcon}><span>NX</span></div>
            <span style={styles.logoText}>NexPlay</span>
          </div>
          <div style={styles.rightSection}>
            <span style={styles.badge10k}>10K</span>
            <button style={styles.navTab(false)} onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              {theme === "dark" ? <FaSun /> : <FaMoon />}
            </button>
            <button style={styles.navTab(false)} onClick={() => setLanguage(language === "de" ? "en" : "de")}>
              <FaLanguage /> {language === "de" ? "DE" : "EN"}
            </button>
            <div style={styles.navTabs}>
              <button style={styles.navTab(currentTab === "home")} onClick={() => setCurrentTab("home")}><FaHome /> Entdecken</button>
              <button style={styles.navTab(currentTab === "library")} onClick={() => setCurrentTab("library")}><BsFillCollectionFill /> Bibliothek</button>
              <button style={styles.navTab(currentTab === "profile")} onClick={() => setCurrentTab("profile")}><FaUser /> Profil</button>
              <button style={styles.navTab(currentTab === "ai")} onClick={() => setCurrentTab("ai")}><FaRobot /> KI</button>
              <button style={styles.navTab(currentTab === "aoty")} onClick={() => setCurrentTab("aoty")}><FaTrophy /> AOTY</button>
              <button style={styles.navTab(currentTab === "top10")} onClick={() => setCurrentTab("top10")}><FaChartLine /> Top 10</button>
              <button style={styles.navTab(currentTab === "hidden")} onClick={() => setCurrentTab("hidden")}><FaGem /> Hidden Gems</button>
              <button style={styles.navTab(currentTab === "random")} onClick={() => setCurrentTab("random")}><FaRandom /> Zufall</button>
              <button style={styles.navTab(false)} onClick={() => setShowCompareModal(true)}><FaGamepad /> Vergleichen</button>
              {!user && <button style={styles.navTab(false)} onClick={() => setShowLoginModal(true)}>Login</button>}
              {user && <div style={styles.avatar}>{userData?.username?.charAt(0).toUpperCase()}</div>}
            </div>
          </div>
        </div>

        {currentTab === "home" && (
          <div>
            <div style={styles.filterRow}>
              <input style={styles.searchBar} placeholder="Spiel suchen..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              <select style={styles.select} value={selectedGenre} onChange={e => setSelectedGenre(e.target.value)}>
                {GENRES.map(g => <option key={g}>{g}</option>)}
              </select>
              <select style={styles.select} value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="rating">Nach Bewertung</option><option value="year">Nach Jahr</option><option value="name">Nach Name</option>
              </select>
              <button style={styles.addBtn} onClick={exportLibrary}><FaFileExport /> Export</button>
              <label style={styles.addBtn}>
                <FaFileImport /> Import
                <input type="file" accept=".json" style={{ display: "none" }} onChange={e => e.target.files[0] && importLibrary(e.target.files[0])} />
              </label>
            </div>
            
            {user && (
              <div style={{ display: "flex", gap: 16, marginBottom: 28, flexWrap: "wrap" }}>
                <div style={styles.statCard}><div style={styles.statNumber}>{library.length}</div><div>Spiele</div><div style={{ fontSize: 12 }}>Level {userLevel}</div></div>
                <div style={styles.statCard}><div style={styles.statNumber}>{library.filter(g => g.status === "completed").length}</div><div>Abgeschlossen</div></div>
                <div style={styles.statCard}><div style={styles.statNumber}>{userXP}</div><div>XP</div></div>
                <div style={styles.statCard}><div style={styles.statNumber}>{userBadges.length}</div><div>Abzeichen</div></div>
              </div>
            )}
            
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
                    <button style={styles.addBtn} onClick={(e) => { e.stopPropagation(); addToLibrary(game); }}>+ Bibliothek</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentTab === "library" && (
          <div>
            <div style={styles.sectionTitle}>📚 Meine Bibliothek ({library.length})</div>
            <div style={{ display: "flex", gap: 16, marginBottom: 28, flexWrap: "wrap" }}>
              <div style={styles.statCard}><div style={styles.statNumber}>{library.length}</div><div>Gesamt</div></div>
              <div style={styles.statCard}><div style={styles.statNumber}>{library.filter(g => g.status === "playing").length}</div><div>Spiele ich</div></div>
              <div style={styles.statCard}><div style={styles.statNumber}>{library.filter(g => g.status === "completed").length}</div><div>Fertig</div></div>
            </div>
            {library.length === 0 ? <div style={styles.emptyState}>Leer. Füge Spiele hinzu!</div> : library.map(game => (
              <div key={game.id} style={{ background: currentColors.bgCard, borderRadius: 16, display: "flex", gap: 16, padding: 16, marginBottom: 12, alignItems: "center", flexWrap: "wrap" }}>
                <img src={game.img} style={{ width: 60, height: 80, objectFit: "cover", borderRadius: 12, cursor: "pointer" }} onClick={() => openGameDetail(game)} alt={game.name} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{game.name}</div>
                  <div style={{ fontSize: 12, color: currentColors.textSecondary, marginBottom: 8 }}>{game.developer} · {game.year}</div>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <select style={styles.select} value={game.status} onChange={e => updateStatus(game.id, e.target.value, game)}>
                      <option value="wishlist">📝 Wunschliste</option><option value="playing">🎮 Spiele ich</option><option value="completed">✅ Fertig</option>
                    </select>
                    <button style={styles.select} onClick={() => toggleFavorite(game.id)}><FaHeart color={favorites.includes(game.id) ? currentColors.primary : "#fff"} /></button>
                    <button style={{ ...styles.select, color: "#ff6b6b" }} onClick={() => removeFromLibrary(game.id)}>Entfernen</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {currentTab === "profile" && (
          <div>
            {user ? (
              <>
                <div style={styles.profileHeader}>
                  <div style={{ position: "relative" }}>
                    {profilePic ? <img src={profilePic} style={styles.profileAvatarLarge} alt="avatar" /> : <div style={styles.profileAvatarLarge}>{userData?.username?.charAt(0).toUpperCase()}</div>}
                    <div style={styles.cameraIcon} onClick={() => fileInputRef.current?.click()}><FaCamera size={16} /></div>
                    <input type="file" ref={fileInputRef} style={{ display: "none" }} accept="image/*" onChange={handleProfilePicUpload} />
                  </div>
                  <div>
                    <div style={{ fontSize: 28, fontWeight: 700, display: "flex", alignItems: "center", gap: 10 }}>{userData?.username} <span style={{ fontSize: 14, background: currentColors.primary, color: currentColors.bg, padding: "4px 8px", borderRadius: 20 }}>Level {userLevel}</span></div>
                    <div style={{ fontSize: 14, color: currentColors.textSecondary, marginBottom: 16 }}>{user.email}</div>
                    <div style={{ fontSize: 14, marginBottom: 20 }}>{userData?.bio || "Keine Bio"}</div>
                    <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
                      <div style={styles.statCard}><div style={styles.statNumber}>{library.length}</div><div>Spiele</div></div>
                      <div style={styles.statCard}><div style={styles.statNumber}>{library.filter(g => g.status === "completed").length}</div><div>Fertig</div></div>
                      <div style={styles.statCard}><div style={styles.statNumber}>{favorites.length}</div><div>Favoriten</div></div>
                      <div style={styles.statCard}><div style={styles.statNumber}>{userXP}</div><div>XP</div></div>
                    </div>
                    <div style={{ display: "flex", gap: 12 }}>
                      <button style={styles.addBtn} onClick={() => setShowEditModal(true)}><FaEdit /> Bearbeiten</button>
                      <a href="https://ko-fi.com/sherlock10k" target="_blank" rel="noopener noreferrer" style={{ ...styles.addBtn, textDecoration: "none", background: "#ff5e5e" }}><SiKofi /> Donate</a>
                    </div>
                  </div>
                </div>

                <div style={styles.sectionTitle}><FaMedal /> Abzeichen ({userBadges.length})</div>
                <div style={styles.achievementGrid}>
                  {userBadges.map(badge => (
                    <div key={badge.id} style={styles.achievementCard}>
                      <div style={{ fontSize: 28 }}>{badge.icon}</div>
                      <div><div style={{ fontWeight: 600 }}>{badge.name}</div></div>
                    </div>
                  ))}
                </div>

                <div style={styles.sectionTitle}><GiAchievement /> Erfolge</div>
                <div style={styles.achievementGrid}>
                  {achievements.map(ach => (
                    <div key={ach.id} style={{ ...styles.achievementCard, opacity: ach.unlocked ? 1 : 0.5 }}>
                      <div style={{ fontSize: 28 }}>{ach.icon}</div>
                      <div><div style={{ fontWeight: 600 }}>{ach.name}</div><div style={{ fontSize: 11, color: currentColors.textSecondary }}>{ach.desc}</div></div>
                    </div>
                  ))}
                </div>

                <div style={styles.sectionTitle}><FaList /> Playlists</div>
                <div style={{ marginBottom: 20, display: "flex", gap: 12 }}>
                  <input style={styles.input} placeholder="Neue Playlist..." id="playlistName" />
                  <button style={styles.addBtn} onClick={() => createPlaylist(document.getElementById("playlistName").value)}>Erstellen</button>
                </div>
                {playlists.map(playlist => (
                  <div key={playlist.id} style={{ background: currentColors.bgCard, borderRadius: 16, padding: 16, marginBottom: 12 }}>
                    <div style={{ fontWeight: 700, marginBottom: 8 }}>{playlist.name} ({playlist.games.length} Spiele)</div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {playlist.games.slice(0, 5).map(game => (
                        <img key={game.id} src={game.img} style={{ width: 50, height: 67, borderRadius: 8, cursor: "pointer" }} onClick={() => openGameDetail(game)} alt={game.name} />
                      ))}
                    </div>
                  </div>
                ))}

                <div style={styles.sectionTitle}><FaUsers /> Aktivitäten</div>
                {activityFeed.slice(0, 5).map(act => (
                  <div key={act.id} style={{ background: currentColors.bgCard, borderRadius: 12, padding: 12, marginBottom: 10, display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ fontSize: 24 }}>{act.type === "add" ? "➕" : "✅"}</div>
                    <div><div>{act.message}</div><div style={{ fontSize: 11, color: currentColors.textSecondary }}>{new Date(act.timestamp).toLocaleString()}</div></div>
                  </div>
                ))}

                <div style={styles.sectionTitle}><FaSearch /> Nutzer suchen</div>
                <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
                  <input style={styles.input} placeholder="Benutzername..." value={searchUsersTerm} onChange={e => setSearchUsersTerm(e.target.value)} />
                  <button style={styles.addBtn} onClick={searchUsersHandler}>Suchen</button>
                </div>
                {foundUsers.map(u => (
                  <div key={u.id} style={{ background: currentColors.bgCard, borderRadius: 12, padding: 12, marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div><span style={{ fontWeight: 700 }}>{u.username}</span><div style={{ fontSize: 12, color: currentColors.textSecondary }}>{u.bio || "Keine Bio"}</div></div>
                    <button style={styles.select}>Freund anfragen</button>
                  </div>
                ))}
              </>
            ) : <div style={styles.emptyState}>Login für Profil</div>}
          </div>
        )}

        {currentTab === "ai" && (
          <div>
            <div style={styles.sectionTitle}><FaRobot /> KI-Assistent</div>
            <div style={styles.aiChatContainer}>
              <div style={styles.aiMessages}>
                {aiMessages.map((msg, idx) => (
                  <div key={idx} style={styles.aiMessage(msg.role === "user")}>
                    <div style={{ fontWeight: 600, marginBottom: 4, fontSize: 12, opacity: 0.7 }}>{msg.role === "user" ? "Du" : "🎮 KI"}</div>
                    <div style={{ fontSize: 14, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{msg.content}</div>
                  </div>
                ))}
                {isAiLoading && <div style={styles.aiMessage(false)}><div style={{ display: "flex", gap: 4 }}>●●●</div></div>}
                <div ref={aiChatEndRef} />
              </div>
              <div style={styles.aiInputRow}>
                <input style={{ flex: 1, background: `${currentColors.primary}10`, border: `1px solid ${currentColors.primary}30`, borderRadius: 24, padding: "12px 18px", color: currentColors.text, fontSize: 14, outline: "none" }} placeholder="Frag mich nach Spielen..." value={aiInput} onChange={e => setAiInput(e.target.value)} onKeyPress={e => e.key === "Enter" && sendAiMessage()} />
                <button style={styles.addBtn} onClick={sendAiMessage}>Senden</button>
              </div>
            </div>
          </div>
        )}

        {currentTab === "aoty" && (
          <div>
            <div style={styles.sectionTitle}><FaTrophy /> Game of the Year</div>
            <div style={styles.grid}>
              {Object.entries(AOTY_GAMES).sort((a,b) => parseInt(b[0]) - parseInt(a[0])).map(([year, game]) => (
                <div key={year} style={styles.gameCard} onClick={() => openGameDetail({ ...game, id: `aoty-${year}`, rating: 9.5, playtime: "40-60h", year: parseInt(year), description: `${game.name} ist ein Meisterwerk!` })}>
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

        {currentTab === "top10" && (
          <div>
            <div style={styles.sectionTitle}><FaChartLine /> Top 10 nach Genre</div>
            <div style={styles.filterRow}>
              <select style={styles.select} value={topGenre} onChange={e => setTopGenre(e.target.value)}>
                {GENRES.map(g => <option key={g}>{g}</option>)}
              </select>
            </div>
            <div style={styles.grid}>
              {getGamesByGenre(topGenre).slice(0, 10).map((game, idx) => (
                <div key={game.id} style={styles.gameCard} onClick={() => openGameDetail(game)}>
                  <img src={game.img} style={styles.gameImg} alt={game.name} />
                  <div style={{ position: "absolute", top: 12, left: 12, background: currentColors.primary, borderRadius: 20, padding: "2px 10px", fontSize: 12, fontWeight: 700, color: currentColors.bg }}>#{idx + 1}</div>
                  <div style={styles.gameInfo}>
                    <div style={styles.gameName}>{game.name}</div>
                    <div style={styles.rating}>★ {game.rating}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentTab === "hidden" && (
          <div>
            <div style={styles.sectionTitle}><FaGem /> Hidden Gems</div>
            <div style={styles.grid}>
              {HIDDEN_GEMS.map(game => (
                <div key={game.id} style={styles.gameCard} onClick={() => openGameDetail({ ...game, id: game.id, playtime: "20-40h", year: 2020, developer: "Indie", description: game.description })}>
                  <img src={game.img} style={styles.gameImg} alt={game.name} />
                  <div style={styles.gameInfo}>
                    <div style={styles.gameName}>{game.name}</div>
                    <div style={styles.rating}>★ {game.rating}</div>
                    <div style={{ fontSize: 11, color: currentColors.textSecondary }}>{game.genre}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentTab === "random" && (
          <div>
            <div style={{ background: currentColors.bgCard, borderRadius: 24, padding: 24, marginBottom: 28 }}>
              <div style={styles.sectionTitle}><FaRandom /> Zufallsspiel</div>
              <div style={styles.filterRow}>
                <select style={styles.select} value={randomGenre} onChange={e => setRandomGenre(e.target.value)}>
                  <option value="all">Alle</option><option value="Action">Action</option><option value="RPG">RPG</option><option value="Open World">Open World</option>
                </select>
                <div><span>Min. Rating: {randomMinRating}</span><input type="range" min="0" max="10" step="0.5" value={randomMinRating} onChange={e => setRandomMinRating(parseFloat(e.target.value))} style={{ width: 150, accentColor: currentColors.primary }} /></div>
                <button style={styles.addBtn} onClick={doRandom}>Zufall</button>
              </div>
            </div>
            
            <div style={{ background: currentColors.bgCard, borderRadius: 28, padding: 32, textAlign: "center" }}>
              <div style={styles.sectionTitle}><GiSpinningWheel /> Game Night</div>
              <div style={{ margin: "28px 0", display: "flex", justifyContent: "center" }}>
                <div className={spinning ? "spinning-wheel" : ""} style={styles.wheel} onClick={spinWheel}>
                  <div style={styles.wheelInner}><GiSpinningWheel size={28} /></div>
                </div>
              </div>
              <button style={styles.addBtn} onClick={spinWheel}>{spinning ? "Spinning..." : "Drehen"}</button>
              {spinResult && !spinning && (
                <div style={{ marginTop: 24 }}>
                  <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>🎉 Dein Spiel!</div>
                  <div style={styles.gameCard} onClick={() => openGameDetail(spinResult)}>
                    <img src={spinResult.img} style={styles.gameImg} alt={spinResult.name} />
                    <div style={styles.gameInfo}>
                      <div style={styles.gameName}>{spinResult.name}</div>
                      <button style={styles.addBtn}>Öffnen</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {showCompareModal && (
        <div style={styles.modalOverlay} onClick={() => setShowCompareModal(false)}>
          <div style={{ ...styles.modalContent, maxWidth: 800 }} onClick={e => e.stopPropagation()}>
            <div style={styles.modalTitle}>Spiele vergleichen</div>
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap", justifyContent: "center" }}>
              {compareGames.length === 0 && <div style={{ textAlign: "center", width: "100%" }}>Wähle 2 Spiele zum Vergleichen aus</div>}
              {compareGames.map(game => (
                <div key={game.id} style={{ flex: 1, minWidth: 200, textAlign: "center" }}>
                  <img src={game.img} style={{ width: "100%", borderRadius: 16, marginBottom: 12 }} alt={game.name} />
                  <div style={{ fontWeight: 700 }}>{game.name}</div>
                  <div>⭐ {game.rating}</div>
                  <div>{game.genre}</div>
                  <div>{game.playtime}</div>
                  <div>{game.year}</div>
                  <button style={{ ...styles.select, marginTop: 12 }} onClick={() => setCompareGames(compareGames.filter(g => g.id !== game.id))}>Entfernen</button>
                </div>
              ))}
              {compareGames.length < 2 && (
                <div style={{ flex: 1, minWidth: 200, textAlign: "center", opacity: 0.5 }}>
                  <div style={{ background: currentColors.bgCard, borderRadius: 16, padding: 40 }}>+ Spiel wählen</div>
                </div>
              )}
            </div>
            <button style={styles.modalBtn} onClick={() => setShowCompareModal(false)}>Schließen</button>
          </div>
        </div>
      )}

      {showRandomModal && randomGame && (
        <div style={styles.modalOverlay} onClick={() => setShowRandomModal(false)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div style={styles.modalTitle}>🎲 Zufallsspiel</div>
            <img src={randomGame.img} style={{ width: "100%", borderRadius: 20, marginBottom: 20 }} alt={randomGame.name} />
            <div style={{ fontSize: 20, fontWeight: 700, textAlign: "center", marginBottom: 8 }}>{randomGame.name}</div>
            <div style={{ fontSize: 16, color: currentColors.primary, textAlign: "center", marginBottom: 20 }}>★ {randomGame.rating || 9.0} · {randomGame.playtime || "20-40h"}</div>
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
            <div style={styles.modalTitle}>{isLogin ? "Login" : "Registrieren"}</div>
            {errorMsg && <div style={{ color: colors.error, textAlign: "center", marginBottom: 16 }}>{errorMsg}</div>}
            <input style={styles.input} type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
            <div style={{ position: "relative" }}>
              <input style={styles.input} type={showPassword ? "text" : "password"} placeholder="Passwort" value={password} onChange={e => setPassword(e.target.value)} />
              <span style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", cursor: "pointer" }} onClick={() => setShowPassword(!showPassword)}>{showPassword ? "👁️" : "👁️‍🗨️"}</span>
            </div>
            <button style={styles.modalBtn} onClick={isLogin ? handleLogin : handleRegister}>{isLogin ? "Login" : "Registrieren"}</button>
            <div style={{ textAlign: "center", marginTop: 16, cursor: "pointer", color: currentColors.textSecondary }} onClick={() => { setIsLogin(!isLogin); setErrorMsg(""); }}>
              {isLogin ? "Kein Account? Registrieren" : "Account vorhanden? Login"}
            </div>
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