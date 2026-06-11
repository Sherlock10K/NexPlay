import { useState, useEffect, useMemo } from "react";
import { FaHome, FaUser, FaFire, FaSearch, FaHeart, FaStar, FaTrash, FaSignOutAlt, FaPlus, FaCheck, FaEnvelope, FaEye, FaEyeSlash, FaEdit, FaUsers, FaClock, FaRandom, FaThumbsUp, FaThumbsDown, FaArrowLeft, FaCog, FaVolumeUp, FaVolumeMute, FaLanguage, FaSteam, FaPlaystation, FaGamepad, FaTrophy, FaGem, FaShoppingCart, FaRobot, FaFilter, FaLink, FaExternalLinkAlt } from "react-icons/fa";
import { GiConsoleController, GiAchievement } from "react-icons/gi";
import { BsFillCollectionFill, BsFillHeartFill } from "react-icons/bs";
import { auth, loginWithEmail, registerWithEmail, logout, loadLibraryFromFirestore, saveLibraryToFirestore, loadProfileFromFirestore, saveProfileToFirestore, updateUsername, updateBio, togglePrivacy, searchUsers, resetPassword, addGameReview, getGameReviews, updateLastPlayed, likeReview, dislikeReview } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

const colors = {
  primary: "#ffd400",
  primaryDark: "#e6bf00",
  bg: "#0a0a0f",
  bgCard: "#14141f",
  bgCardHover: "#1f1f32",
  text: "#ffffff",
  textSecondary: "#c0c0d0",
  textMuted: "#a0a0b0",
  success: "#4caf50",
  error: "#f44336",
  steam: "#1b2838",
  epic: "#2a2a2a",
  playstation: "#003791",
  amazon: "#ff9900",
  loaded: "#7c3aed",
};

const MOODS = ["Emotional", "Action", "Dark", "Fantasy", "Horror", "Mystery", "Cozy", "Epic", "Atmospheric", "Challenging"];
const GENRES = ["Action", "Adventure", "RPG", "Indie", "Horror", "Strategy", "Puzzle", "Open World", "Story Rich"];
const PLAYTIMES = ["Under 10h", "10-20h", "20-40h", "40-60h", "60-100h", "100h+"];

const translations = {
  en: { home: "Discover", library: "Library", profile: "Profile", friends: "Friends", ai: "AI Assistant", login: "Login", register: "Register", logout: "Logout", search: "Search games...", mood: "What's your mood?", genre: "Pick your genres", playtime: "How long?", next: "Next", results: "Show Results", topPicks: "Top Picks", allResults: "All Results", sort: "Sort", bestMatch: "Best Match", rating: "Rating", year: "Year", add: "Add to Library", inLibrary: "In Library", reviews: "Reviews", played: "Played", remove: "Remove", editProfile: "Edit Profile", username: "Username", bio: "Bio", private: "Private profile", save: "Save", achievements: "Achievements", firstGame: "First Game", collector: "Collector", completionist: "Completionist", recentlyPlayed: "Recently Played", favorites: "Favorites", total: "Total", playing: "Playing", completed: "Completed", randomGame: "Random Game", rollAgain: "Roll Again", close: "Close", back: "Back", buyOn: "Buy on", writeReview: "Write Review", yourReview: "Your review...", submit: "Submit", noReviews: "No reviews yet", findFriends: "Find Friends", settings: "Settings", sound: "Sound Effects", language: "Language", steamId: "Steam ID", importGames: "Import Steam Games", findSteamId: "How to find your Steam ID" },
  de: { home: "Entdecken", library: "Bibliothek", profile: "Profil", friends: "Freunde", ai: "KI-Assistent", login: "Anmelden", register: "Registrieren", logout: "Abmelden", search: "Spiele suchen...", mood: "Wie ist deine Stimmung?", genre: "Wähle deine Genres", playtime: "Wie lange?", next: "Weiter", results: "Ergebnisse", topPicks: "Top Empfehlungen", allResults: "Alle Ergebnisse", sort: "Sortieren", bestMatch: "Bester Treffer", rating: "Bewertung", year: "Jahr", add: "Zur Bibliothek", inLibrary: "In Bibliothek", reviews: "Bewertungen", played: "Gespielt", remove: "Entfernen", editProfile: "Profil bearbeiten", username: "Benutzername", bio: "Über mich", private: "Privates Profil", save: "Speichern", achievements: "Erfolge", firstGame: "Erstes Spiel", collector: "Sammler", completionist: "Vollender", recentlyPlayed: "Zuletzt gespielt", favorites: "Favoriten", total: "Gesamt", playing: "Spielt", completed: "Abgeschlossen", randomGame: "Zufälliges Spiel", rollAgain: "Nochmal", close: "Schließen", back: "Zurück", buyOn: "Kaufen auf", writeReview: "Bewertung schreiben", yourReview: "Deine Bewertung...", submit: "Speichern", noReviews: "Keine Bewertungen", findFriends: "Freunde finden", settings: "Einstellungen", sound: "Soundeffekte", language: "Sprache", steamId: "Steam ID", importGames: "Steam Spiele importieren", findSteamId: "So findest du deine Steam ID" }
};

const RAWG_API_KEY = '4da2c00cf3b2459d988e0ed0ac16988d';

const translateGenre = (genreName) => {
  const map = {
    "Action": "Action", "Adventure": "Adventure", "RPG": "RPG",
    "Indie": "Indie", "Strategy": "Strategy", "Shooter": "Shooter",
    "Horror": "Horror", "Puzzle": "Puzzle", "Simulation": "Simulation",
    "Platformer": "Platformer", "Open World": "Open World", "Story Rich": "Story Rich",
    "Racing": "Racing", "Fighting": "Fighting", "Sports": "Sports"
  };
  return map[genreName] || genreName;
};

let steamGamesCache = {};

export default function NexPlay() {
  const [lang, setLang] = useState("en");
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [gamesLoading, setGamesLoading] = useState(true);
  const [allGames, setAllGames] = useState([]);
  const [library, setLibrary] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [currentTab, setCurrentTab] = useState("home");
  const [discoverSubTab, setDiscoverSubTab] = useState("discover");
  const [searchQuery, setSearchQuery] = useState("");
  const [step, setStep] = useState(1);
  const [selectedMoods, setSelectedMoods] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedPlaytime, setSelectedPlaytime] = useState(null);
  const [sortBy, setSortBy] = useState("score");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showRandomModal, setShowRandomModal] = useState(false);
  const [randomGame, setRandomGame] = useState(null);
  const [randomExcludeHorror, setRandomExcludeHorror] = useState(false);
  const [randomExcludeIndie, setRandomExcludeIndie] = useState(false);
  const [randomExcludeOld, setRandomExcludeOld] = useState(false);
  const [randomMinRating, setRandomMinRating] = useState(7);
  const [randomMode, setRandomMode] = useState("full");
  const [aiQuery, setAiQuery] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState({ genre: "", minRating: 0, year: 0 });
  const [searchUsersTerm, setSearchUsersTerm] = useState("");
  const [foundUsers, setFoundUsers] = useState([]);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editUsername, setEditUsername] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editPrivate, setEditPrivate] = useState(false);
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState("");
  const [selectedGameDetail, setSelectedGameDetail] = useState(null);
  const [gameDetailReviews, setGameDetailReviews] = useState([]);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [showReviews, setShowReviews] = useState(false);
  const [reviewsGame, setReviewsGame] = useState(null);
  const [audioInitialized, setAudioInitialized] = useState(false);
  
  const [steamIdInput, setSteamIdInput] = useState("");
  const [platformLinks, setPlatformLinks] = useState({ steam: false, epic: false, playstation: false });
  const [syncingPlatform, setSyncingPlatform] = useState(null);

  const text = translations[lang];

  const fetchGamesFromRAWG = async () => {
    setGamesLoading(true);
    try {
      let allFetchedGames = [];
      for (let page = 1; page <= 3; page++) {
        const response = await fetch(
          `https://api.rawg.io/api/games?key=${RAWG_API_KEY}&metacritic=70,100&exclude_tags=nsfw,adult,erotic,hentai,porn,sex&page_size=50&page=${page}&ordering=-metacritic`
        );
        const data = await response.json();
        
        const translatedGames = data.results.map(game => ({
          id: game.id,
          name: game.name,
          rawgRating: (game.metacritic || 75) / 10,
          genre: translateGenre(game.genres?.[0]?.name || "Action"),
          playtime: game.playtime ? `${game.playtime}h` : "20-40h",
          year: game.released ? new Date(game.released).getFullYear() : 2024,
          img: game.background_image || `https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/${game.slug?.match(/\d+/)?.[0] || 0}/header.jpg`,
          developer: game.developers?.[0]?.name || game.publishers?.[0]?.name || "Unknown",
          mood: game.tags?.slice(0,1).map(t => translateGenre(t.name))[0] || "Action",
          description: game.description_raw || "Ein fantastisches Spiel, das du unbedingt ausprobieren solltest!",
          trailer: game.clip?.clip || (game.slug ? `https://www.youtube.com/embed/${game.slug}` : ""),
          platforms: game.platforms?.map(p => p.platform.name) || [],
          steamId: null,
          popularity: game.metacritic || 70
        }));
        allFetchedGames = [...allFetchedGames, ...translatedGames];
      }
      
      const uniqueGames = allFetchedGames.filter((game, index, self) => 
        index === self.findIndex(g => g.name.toLowerCase() === game.name.toLowerCase())
      );
      
      setAllGames(uniqueGames);
    } catch (error) {
      console.error("RAWg API error:", error);
    } finally {
      setGamesLoading(false);
    }
  };

  useEffect(() => {
    fetchGamesFromRAWG();
  }, []);

  const fetchSteamRatings = async (appIds) => {
    const validIds = appIds.filter(id => id && !steamGamesCache[id]);
    if (validIds.length === 0) return;
    
    try {
      const promises = validIds.map(appId =>
        fetch(`https://store.steampowered.com/api/appdetails?appids=${appId}&cc=de`)
          .then(res => res.json())
          .then(data => {
            if (data[appId]?.success) {
              const gameData = data[appId].data;
              steamGamesCache[appId] = {
                steamRating: gameData.metacritic ? gameData.metacritic.score / 10 : null,
                reviewCount: gameData.recommendations?.total || 0,
                img: gameData.header_image,
                name: gameData.name
              };
            }
          })
          .catch(err => console.error(`Failed to fetch Steam rating for ${appId}:`, err))
      );
      await Promise.all(promises);
    } catch (error) {
      console.error("Error fetching Steam ratings:", error);
    }
  };

// ========== KERN: JEDES SPIEL BEKOMMT EIN REALISTISCHES RATING ==========
const gamesWithData = useMemo(() => {
  const steamAppIds = allGames
    .map(g => g.steamId)
    .filter(id => id && typeof id === 'number');
  
  if (steamAppIds.length > 0) {
    fetchSteamRatings(steamAppIds);
  }
  
  return allGames.map(game => {
    const steamData = game.steamId ? steamGamesCache[game.steamId] : null;
    
    // ========== 1. RAWg RATING KORRIGIEREN ==========
    let rawRating = game.rawgRating;
    const name = game.name?.toLowerCase() || "";
    const genre = game.genre?.toLowerCase() || "";
    
    // Spezifische Korrekturen (RAWg ist oft zu hoch)
    if (name.includes("soulcalibur")) rawRating = 8.0;
    if (name.includes("tekken")) rawRating = 8.2;
    if (name.includes("street fighter")) rawRating = 8.5;
    if (name.includes("mortal kombat")) rawRating = 8.3;
    if (name.includes("fifa")) rawRating = 7.5;
    if (name.includes("pes") || name.includes("efootball")) rawRating = 7.0;
    if (name.includes("call of duty")) rawRating = 7.5;
    if (name.includes("assassin") && name.includes("creed")) rawRating = 7.8;
    if (name.includes("pokemon")) rawRating = 8.0;
    if (name.includes("battlefield")) rawRating = 7.8;
    if (name.includes("far cry")) rawRating = 7.8;
    if (name.includes("watch dogs")) rawRating = 7.5;
    
    // Genre-basierte Maximalratings
    let maxRating = 9.5; // AAA Action/RPG (Elden Ring, Witcher 3)
    if (genre.includes("fighting") || genre.includes("sports")) maxRating = 8.5;
    else if (genre.includes("indie")) maxRating = 9.0;
    else if (genre.includes("horror")) maxRating = 9.0;
    else if (genre.includes("puzzle")) maxRating = 8.5;
    
    // Rating nicht übers Maximum
    let finalRating = Math.min(rawRating, maxRating);
    
    // Steam-Rating einmischen (falls vorhanden)
    if (steamData && steamData.steamRating) {
      finalRating = (steamData.steamRating + finalRating) / 2;
    }
    
    // Auf eine Nachkommastelle runden
    finalRating = Math.round(finalRating * 10) / 10;
    
    // ========== 2. REVIEW-ANZAHL (für Kategorisierung) ==========
    let reviewCount = 0;
    if (steamData && steamData.reviewCount > 0) {
      reviewCount = steamData.reviewCount;
    } else {
      // Reviews basierend auf korrigiertem Rating
      if (finalRating >= 9.0) reviewCount = 150000 + Math.floor(Math.random() * 150000);
      else if (finalRating >= 8.5) reviewCount = 50000 + Math.floor(Math.random() * 100000);
      else if (finalRating >= 8.0) reviewCount = 15000 + Math.floor(Math.random() * 35000);
      else if (finalRating >= 7.5) reviewCount = 5000 + Math.floor(Math.random() * 10000);
      else reviewCount = 1000 + Math.floor(Math.random() * 4000);
    }
    
    // ========== 3. BILD (mit Fallback) ==========
    let finalImg = steamData?.img || game.img;
    if (!finalImg || finalImg === "" || finalImg.includes("null") || finalImg.includes("placeholder")) {
      finalImg = `https://placehold.co/300x400/14141f/ffd400?text=${encodeURIComponent(game.name.slice(0, 8))}`;
    }
    
    return {
      ...game,
      finalRating: finalRating,
      finalImg: finalImg,
      reviewCount: reviewCount
    };
  });
}, [allGames]);

  // ========== KATEGORIEN – JETZT WIRKLICH UNTERSCHIEDLICH ==========
  // MUST PLAY: Rating ≥ 8.5 UND mehr als 50.000 Reviews (echte Hits)
  const MUST_PLAY_GAMES = useMemo(() => 
    [...gamesWithData]
      .filter(g => g.finalRating >= 8.5 && g.reviewCount >= 50000)
      .sort((a, b) => b.finalRating - a.finalRating),
    [gamesWithData]
  );

  // BEST EVER: Top 50 nach Rating (egal wie viele Reviews)
  const BEST_EVER_GAMES = useMemo(() => 
    [...gamesWithData]
      .sort((a, b) => b.finalRating - a.finalRating)
      .slice(0, 50),
    [gamesWithData]
  );

  // HIDDEN GEMS: Rating ≥ 8.0 ABER weniger als 10.000 Reviews (unterbewertete Perlen)
  const HIDDEN_GEMS_GAMES = useMemo(() => 
    [...gamesWithData]
      .filter(g => g.finalRating >= 8.0 && g.reviewCount < 10000)
      .sort((a, b) => b.finalRating - a.finalRating),
    [gamesWithData]
  );

  const playSound = (type) => {
    if (!soundEnabled || !audioInitialized) return;
    const audio = new Audio();
    if (type === "click") audio.src = "https://www.soundjay.com/misc/sounds/button-click-1.mp3";
    if (type === "add") audio.src = "https://www.soundjay.com/misc/sounds/notification-1.mp3";
    if (type === "login") audio.src = "https://www.soundjay.com/misc/sounds/bell-ringing-1.mp3";
    audio.volume = 0.3;
    audio.play().catch(e => console.log("Sound error:", e));
  };

  const initAudio = () => {
    if (!audioInitialized) {
      setAudioInitialized(true);
      const audio = new Audio();
      audio.play().catch(e => console.log("Audio init:", e));
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const cloudLibrary = await loadLibraryFromFirestore(firebaseUser.uid);
          setLibrary(cloudLibrary.length > 0 ? cloudLibrary : []);
          const profile = await loadProfileFromFirestore(firebaseUser.uid);
          setUserData(profile);
          if (profile?.favorites) setFavorites(profile.favorites);
          if (profile?.platformLinks) setPlatformLinks(profile.platformLinks);
        } catch (err) { console.error(err); }
      } else {
        setUser(null); setUserData(null); setLibrary([]); setFavorites([]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user && library.length > 0) saveLibraryToFirestore(user.uid, library);
  }, [library, user]);

  useEffect(() => {
    if (user && favorites) saveProfileToFirestore(user.uid, { favorites });
  }, [favorites, user]);

  useEffect(() => {
    if (user && platformLinks) saveProfileToFirestore(user.uid, { platformLinks });
  }, [platformLinks, user]);

  const handleLogin = async () => {
    if (!email || !password) { setErrorMsg("Email and password required"); return; }
    const result = await loginWithEmail(email, password);
    if (result) { setShowLoginModal(false); setEmail(""); setPassword(""); playSound("login"); }
    else setErrorMsg("Login failed");
  };

  const handleRegister = async () => {
    if (!email || !password) { setErrorMsg("Email and password required"); return; }
    if (password.length < 6) { setErrorMsg("Password must be at least 6 characters"); return; }
    let username = email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "");
    const result = await registerWithEmail(email, password, username);
    if (result.user) { setShowLoginModal(false); setEmail(""); setPassword(""); playSound("login"); }
    else setErrorMsg(result.error || "Registration failed");
  };

  const handleSearchUsers = async () => {
    if (!searchUsersTerm.trim()) return;
    setSearchingUsers(true);
    const results = await searchUsers(searchUsersTerm);
    setFoundUsers(results);
    setSearchingUsers(false);
  };

  const handleSteamLogin = async () => {
    if (!steamIdInput.trim()) {
      alert("Please enter your Steam ID");
      return;
    }
    
    setSyncingPlatform("steam");
    
    try {
      const response = await fetch(`/api/steam?action=getGames&steamId=${steamIdInput.trim()}`);
      const data = await response.json();
      
      if (data.response && data.response.games) {
        const steamGames = data.response.games;
        let importedCount = 0;
        
        steamGames.forEach(steamGame => {
          const matchingGame = gamesWithData.find(g => 
            g.name.toLowerCase().includes(steamGame.name.toLowerCase()) ||
            steamGame.name.toLowerCase().includes(g.name.toLowerCase())
          );
          
          if (matchingGame && !library.find(l => l.id === matchingGame.id)) {
            addToLibrary(matchingGame);
            importedCount++;
          }
        });
        
        setPlatformLinks(prev => ({ ...prev, steam: true }));
        alert(`✅ ${importedCount} von ${steamGames.length} Steam games imported to your library!`);
      } else {
        alert("No games found. Make sure your Steam profile is set to Public.");
      }
    } catch (err) {
      console.error(err);
      alert("Error fetching Steam games. Make sure your Steam profile is public.");
    } finally {
      setSyncingPlatform(null);
    }
  };

  const handleUpdateProfile = async () => {
    if (editUsername && editUsername !== userData?.username) {
      const result = await updateUsername(user.uid, editUsername, userData?.username);
      if (result.error) { setEditError(result.error); return; }
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
    setEditSuccess("Profile updated!");
    setTimeout(() => setShowEditModal(false), 1500);
  };

  const openEditModal = () => {
    setEditUsername(userData?.username || "");
    setEditBio(userData?.bio || "");
    setEditPrivate(userData?.isPrivate || false);
    setEditError(""); setEditSuccess("");
    setShowEditModal(true);
  };

  const openGameDetail = async (game) => {
    initAudio();
    setSelectedGameDetail(game);
    const reviews = await getGameReviews(game.id);
    setGameDetailReviews(reviews);
    setCurrentTab("gameDetail");
  };

  const closeGameDetail = () => {
    setSelectedGameDetail(null);
    setCurrentTab("home");
  };

  const submitGameDetailReview = async () => {
    if (reviewRating === 0) { alert("Please give a rating"); return; }
    await addGameReview(user.uid, selectedGameDetail.id, selectedGameDetail.name, reviewRating, reviewComment);
    const updatedReviews = await getGameReviews(selectedGameDetail.id);
    setGameDetailReviews(updatedReviews);
    setReviewRating(0); setReviewComment("");
    playSound("add");
  };

  const handleLikeReview = async (reviewId) => {
    if (!user) return;
    await likeReview(reviewId, user.uid);
    const updated = await getGameReviews(selectedGameDetail.id);
    setGameDetailReviews(updated);
  };

  const handleDislikeReview = async (reviewId) => {
    if (!user) return;
    await dislikeReview(reviewId, user.uid);
    const updated = await getGameReviews(selectedGameDetail.id);
    setGameDetailReviews(updated);
  };

  const markAsPlayed = async (game) => {
    await updateLastPlayed(user.uid, game.id, game.name, game.img);
    const updated = await loadProfileFromFirestore(user.uid);
    setUserData(updated);
    playSound("add");
  };

  const addToLibrary = async (game) => {
    if (library.find(g => g.id === game.id)) return;
    setLibrary([...library, { ...game, status: "wishlist", dateAdded: new Date().toISOString() }]);
    playSound("add");
  };

  const removeFromLibrary = (id) => setLibrary(library.filter(g => g.id !== id));
  const updateStatus = async (id, status, game) => {
    setLibrary(library.map(g => g.id === id ? { ...g, status } : g));
    if (status === "completed") {
      await updateLastPlayed(user.uid, id, game.name, game.img);
      const updated = await loadProfileFromFirestore(user.uid);
      setUserData(updated);
    }
    playSound("click");
  };
  const toggleFavorite = (id) => setFavorites(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

  const doRandom = () => {
    initAudio();
    let pool = [...gamesWithData];
    if (randomExcludeHorror) pool = pool.filter(g => g.mood !== "Horror" && g.genre !== "Horror");
    if (randomExcludeIndie) pool = pool.filter(g => g.genre !== "Indie");
    if (randomExcludeOld) pool = pool.filter(g => g.year >= 2015);
    pool = pool.filter(g => g.finalRating >= randomMinRating);
    if (randomMode === "genre") {
      const randomGenre = pool.length ? pool[Math.floor(Math.random() * pool.length)].genre : "Action";
      pool = pool.filter(g => g.genre === randomGenre);
    }
    if (randomMode === "mood") {
      const randomMood = pool.length ? pool[Math.floor(Math.random() * pool.length)].mood : "Action";
      pool = pool.filter(g => g.mood === randomMood);
    }
    if (pool.length === 0) pool = [...gamesWithData];
    const random = pool[Math.floor(Math.random() * pool.length)];
    setRandomGame(random);
    setShowRandomModal(true);
    playSound("click");
  };

  const handleAiSearch = async () => {
    if (!aiQuery.trim()) return;
    setIsAiLoading(true);
    setTimeout(() => {
      const lower = aiQuery.toLowerCase();
      if (lower.includes("walking dead") || lower.includes("zombie")) {
        setAiResponse(`🎮 Based on "${aiQuery}": The Walking Dead: Season Two, The Last of Us, Days Gone`);
      } else if (lower.includes("cozy") || lower.includes("relax")) {
        setAiResponse(`🎮 Based on "${aiQuery}": Stardew Valley, Animal Crossing, Cozy Grove`);
      } else {
        setAiResponse(`🎮 Based on "${aiQuery}": The Witcher 3, Red Dead Redemption 2, Baldur's Gate 3`);
      }
      setIsAiLoading(false);
    }, 1000);
  };

  const getBuyLinks = (game) => {
    const links = [];
    if (game.steamId) {
      links.push({ name: "Steam", url: `https://store.steampowered.com/app/${game.steamId}`, icon: <FaSteam />, color: colors.steam });
    } else {
      links.push({ name: "Steam", url: `https://store.steampowered.com/search/?term=${encodeURIComponent(game.name)}`, icon: <FaSteam />, color: colors.steam });
    }
    links.push({ name: "Amazon", url: `https://www.amazon.de/s?k=${encodeURIComponent(game.name)}`, icon: <FaShoppingCart />, color: colors.amazon });
    links.push({ name: "Loaded", url: `https://www.loaded.com/de_de/search?q=${encodeURIComponent(game.name)}`, icon: <FaExternalLinkAlt />, color: colors.loaded });
    return links;
  };

  const filteredCategoryGames = (games) => {
    let filtered = [...games];
    if (categoryFilter.genre) filtered = filtered.filter(g => g.genre === categoryFilter.genre);
    if (categoryFilter.minRating > 0) filtered = filtered.filter(g => g.finalRating >= categoryFilter.minRating);
    if (categoryFilter.year > 0) filtered = filtered.filter(g => g.year >= categoryFilter.year);
    return filtered;
  };

  const results = useMemo(() => {
    let list = gamesWithData.map(g => ({ 
      ...g, 
      score: (selectedMoods.includes(g.mood) ? 40 : 20) + 
             (selectedGenres.includes(g.genre) ? 40 : 20) + 
             (selectedPlaytime === g.playtime ? 20 : 0) + 
             (g.finalRating * 2) 
    }));
    if (searchQuery) list = list.filter(g => g.name.toLowerCase().includes(searchQuery.toLowerCase()));
    if (sortBy === "score") list.sort((a,b) => b.score - a.score);
    if (sortBy === "rating") list.sort((a,b) => b.finalRating - a.finalRating);
    if (sortBy === "year") list.sort((a,b) => b.year - a.year);
    return list;
  }, [selectedMoods, selectedGenres, selectedPlaytime, searchQuery, sortBy, gamesWithData]);

  const topPicks = results.slice(0, 8);
  const restResults = results.slice(3);
  const toggle = (arr, setArr, val) => setArr(prev => prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val]);

  const animationStyles = `
    @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes slideIn { from { opacity: 0; transform: translateY(-50px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes spin { to { transform: rotate(360deg); } }
    .fade-in { animation: fadeIn 0.4s ease-out; }
    .slide-in { animation: slideIn 0.3s ease-out; }
    .game-card { transition: all 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1); cursor: pointer; }
    .game-card:hover { transform: translateY(-8px) scale(1.02); box-shadow: 0 20px 30px -12px rgba(0,0,0,0.5); }
    .btn-click:active { transform: scale(0.96); }
  `;

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = animationStyles;
    document.head.appendChild(style);
  }, []);

  const styles = {
    app: { background: colors.bg, minHeight: "100vh", width: "100%", color: colors.text, fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" },
    container: { maxWidth: 1200, margin: "0 auto", padding: "0 24px" },
    header: { padding: "20px 0", borderBottom: `1px solid rgba(255,212,0,0.15)`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 },
    logo: { fontSize: 26, fontWeight: 800, display: "flex", alignItems: "center", gap: 10, cursor: "pointer" },
    logoIcon: { background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`, borderRadius: "14px", padding: "8px 12px", color: colors.bg },
    logoText: { background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
    mainTabs: { display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" },
    mainTab: (active) => ({ background: active ? colors.primary : "rgba(255,255,255,0.06)", border: "none", borderRadius: 14, padding: "10px 22px", color: active ? colors.bg : colors.text, cursor: "pointer", fontWeight: 600, fontSize: 15, display: "flex", alignItems: "center", gap: 8 }),
    iconBtn: { background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 12, padding: "10px 14px", color: colors.text, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontSize: 14 },
    loginBtn: { background: "linear-gradient(135deg, #4285f4, #3367d6)", border: "none", borderRadius: 12, padding: "10px 20px", color: "#fff", cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: 8, fontSize: 14 },
    logoutBtn: { background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 12, padding: "10px 20px", color: colors.text, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontSize: 14 },
    userAvatar: { width: 36, height: 36, borderRadius: "50%", background: colors.primary, display: "flex", alignItems: "center", justifyContent: "center", color: colors.bg, fontWeight: 700, fontSize: 16 },
    tabNav: { display: "flex", gap: 4, borderBottom: `1px solid rgba(255,255,255,0.08)`, marginTop: 24, marginBottom: 24, overflowX: "auto" },
    tabNavBtn: (active) => ({ background: "none", border: "none", borderBottom: active ? `2px solid ${colors.primary}` : "2px solid transparent", color: active ? colors.primary : colors.textSecondary, padding: "12px 24px", cursor: "pointer", fontSize: 14, fontWeight: active ? 600 : 400, whiteSpace: "nowrap" }),
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 24 },
    gameCard: { background: colors.bgCard, borderRadius: 16, overflow: "hidden", cursor: "pointer", border: "1px solid rgba(255,255,255,0.06)", position: "relative" },
    gameImg: { width: "100%", aspectRatio: "3/4", objectFit: "cover" },
    gameInfo: { padding: "14px" },
    gameName: { fontSize: 15, fontWeight: 700, marginBottom: 4, color: colors.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
    rating: { display: "flex", alignItems: "center", gap: 4, color: colors.primary, fontSize: 13, fontWeight: 600, marginBottom: 8 },
    addBtn: { background: colors.primary, border: "none", borderRadius: 10, padding: "10px 12px", fontSize: 13, fontWeight: 600, cursor: "pointer", width: "100%", marginTop: 10, color: colors.bg, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 },
    searchBar: { background: colors.bgCard, border: `1px solid rgba(255,255,255,0.08)`, borderRadius: 14, padding: "14px 18px", color: colors.text, fontSize: 15, width: "100%", marginBottom: 24, outline: "none" },
    pillGrid: { display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 28 },
    pill: (selected) => ({ background: selected ? colors.primary : "rgba(255,255,255,0.06)", border: "none", borderRadius: 40, padding: "12px 24px", color: selected ? colors.bg : colors.text, cursor: "pointer", fontSize: 14, fontWeight: selected ? 600 : 400 }),
    nextBtn: { background: colors.primary, border: "none", borderRadius: 14, padding: "14px 32px", fontSize: 16, fontWeight: 600, cursor: "pointer", color: colors.bg, marginTop: 28 },
    stepContainer: { padding: "28px 0", maxWidth: 650, margin: "0 auto" },
    stepTitle: { fontSize: 28, fontWeight: 700, marginBottom: 28, textAlign: "center", color: colors.text },
    filterRow: { display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24, alignItems: "center" },
    filterBtn: (active) => ({ background: active ? colors.primary : "rgba(255,255,255,0.05)", border: "none", borderRadius: 10, padding: "8px 16px", color: active ? colors.bg : colors.text, cursor: "pointer", fontSize: 13 }),
    sectionTitle: { fontSize: 24, fontWeight: 700, marginBottom: 24, display: "flex", alignItems: "center", gap: 12, color: colors.text },
    topPicksRow: { display: "flex", gap: 20, overflowX: "auto", marginBottom: 32, paddingBottom: 12 },
    topPickCard: { minWidth: 220, background: colors.bgCard, borderRadius: 14, padding: 14, cursor: "pointer", position: "relative" },
    libraryCard: { background: colors.bgCard, borderRadius: 14, display: "flex", gap: 16, padding: 16, marginBottom: 14, alignItems: "center", flexWrap: "wrap" },
    libraryImg: { width: 65, height: 87, objectFit: "cover", borderRadius: 10 },
    libraryInfo: { flex: 1 },
    libraryTitle: { fontWeight: 700, fontSize: 16, color: colors.text, marginBottom: 4 },
    libraryMeta: { fontSize: 12, color: colors.textSecondary, marginBottom: 8 },
    libraryActions: { display: "flex", gap: 10, flexWrap: "wrap" },
    select: { background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 10, padding: "8px 14px", color: colors.text, fontSize: 13, cursor: "pointer" },
    statCard: { background: colors.bgCard, borderRadius: 14, padding: "16px", textAlign: "center", minWidth: 100 },
    statNumber: { fontSize: 32, fontWeight: 800, color: colors.primary },
    statLabel: { fontSize: 12, color: colors.textSecondary, marginTop: 4 },
    statsRow: { display: "flex", gap: 16, marginBottom: 28, flexWrap: "wrap" },
    profileHeader: { display: "flex", gap: 24, alignItems: "center", background: colors.bgCard, borderRadius: 24, padding: 28, marginBottom: 28, flexWrap: "wrap", justifyContent: "center", textAlign: "center" },
    profileAvatarLarge: { width: 90, height: 90, borderRadius: "50%", background: colors.primary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 38, fontWeight: 700, color: colors.bg },
    editBtn: { background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 10, padding: "10px 20px", color: colors.text, cursor: "pointer", fontSize: 13, marginTop: 18, display: "inline-flex", alignItems: "center", gap: 8 },
    lastPlayedRow: { display: "flex", gap: 16, overflowX: "auto", marginBottom: 28, paddingBottom: 10 },
    lastPlayedCard: { minWidth: 90, background: colors.bgCard, borderRadius: 12, padding: 10, textAlign: "center", cursor: "pointer" },
    lastPlayedImg: { width: 70, height: 70, objectFit: "cover", borderRadius: 10, marginBottom: 6 },
    lastPlayedName: { fontSize: 11, color: colors.text, fontWeight: 500 },
    randomFilterSection: { background: colors.bgCard, borderRadius: 16, padding: 20, marginBottom: 24 },
    randomFilterTitle: { fontSize: 16, fontWeight: 600, color: colors.text, marginBottom: 16, display: "flex", alignItems: "center", gap: 10 },
    randomFilterRow: { display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center" },
    randomCheckbox: { display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: colors.textSecondary },
    randomSlider: { width: 220, accentColor: colors.primary },
    randomSelect: { background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 10, padding: "8px 14px", color: colors.text, fontSize: 13, cursor: "pointer" },
    aiSection: { background: colors.bgCard, borderRadius: 16, padding: 24, marginBottom: 24 },
    aiRow: { display: "flex", gap: 14, marginBottom: 20, flexWrap: "wrap" },
    aiResultBox: { background: "rgba(0,0,0,0.3)", borderRadius: 14, padding: 18, marginTop: 18, fontSize: 14, color: colors.textSecondary, lineHeight: 1.6 },
    platformSection: { background: colors.bgCard, borderRadius: 16, padding: 20, marginBottom: 24 },
    platformRow: { display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center", marginBottom: 16 },
    platformBtn: (bgColor) => ({ background: bgColor, border: "none", borderRadius: 12, padding: "10px 18px", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, fontSize: 13, fontWeight: 500 }),
    modalOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.96)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" },
    modalContent: { background: colors.bgCard, borderRadius: 28, padding: 32, width: "90%", maxWidth: 520, border: `1px solid ${colors.primary}30` },
    modalTitle: { fontSize: 26, fontWeight: 700, marginBottom: 24, textAlign: "center", color: colors.text },
    input: { width: "100%", background: "rgba(255,255,255,0.08)", border: `1px solid rgba(255,255,255,0.1)`, borderRadius: 12, padding: "14px 18px", color: colors.text, fontSize: 15, marginBottom: 16, outline: "none" },
    textarea: { width: "100%", background: "rgba(255,255,255,0.08)", border: `1px solid rgba(255,255,255,0.1)`, borderRadius: 12, padding: "14px 18px", color: colors.text, fontSize: 15, marginBottom: 16, outline: "none", resize: "vertical", fontFamily: "inherit" },
    passwordWrapper: { position: "relative", width: "100%" },
    passwordEye: { position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", cursor: "pointer", color: colors.textSecondary },
    modalBtn: { background: colors.primary, border: "none", borderRadius: 14, padding: "14px", fontSize: 16, fontWeight: 600, cursor: "pointer", width: "100%", marginTop: 12, color: colors.bg },
    modalBtnSecondary: { background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 14, padding: "14px", fontSize: 16, fontWeight: 600, cursor: "pointer", width: "auto", color: colors.text },
    switchText: { textAlign: "center", marginTop: 16, color: colors.textSecondary, fontSize: 14, cursor: "pointer" },
    errorText: { color: colors.error, fontSize: 13, textAlign: "center", marginBottom: 14 },
    successText: { color: colors.success, fontSize: 13, textAlign: "center", marginBottom: 14 },
    loadingSpinner: { width: 48, height: 48, border: `3px solid ${colors.primary}20`, borderTop: `3px solid ${colors.primary}`, borderRadius: "50%", animation: "spin 1s linear infinite" },
    emptyState: { textAlign: "center", padding: 60, background: colors.bgCard, borderRadius: 24, color: colors.textSecondary },
    reviewStars: { display: "flex", gap: 12, justifyContent: "center", marginBottom: 24 },
    reviewStar: { fontSize: 36, cursor: "pointer", color: colors.textSecondary },
    reviewCard: { background: colors.bgCard, borderRadius: 14, padding: 16, marginBottom: 14 },
    reviewHeader: { display: "flex", justifyContent: "space-between", marginBottom: 10 },
    reviewUsername: { fontWeight: 700, fontSize: 14, color: colors.text },
    reviewRating: { color: colors.primary, fontSize: 13 },
    reviewComment: { fontSize: 14, color: colors.textSecondary, lineHeight: 1.4 },
    reviewActions: { display: "flex", gap: 16, marginTop: 12 },
    likeBtn: { display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: colors.textSecondary, cursor: "pointer", background: "none", border: "none" },
    userCard: { background: colors.bgCard, borderRadius: 14, padding: 16, marginBottom: 14, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" },
    userAvatarSmall: { width: 48, height: 48, borderRadius: "50%", background: colors.primary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 700, color: colors.bg },
    searchRow: { display: "flex", gap: 14, marginBottom: 24 },
    gameDetailHeader: { display: "flex", gap: 28, flexWrap: "wrap", marginBottom: 28 },
    gameDetailImg: { width: 240, borderRadius: 18, objectFit: "cover" },
    gameDetailInfo: { flex: 1 },
    gameDetailName: { fontSize: 32, fontWeight: 700, marginBottom: 10, color: colors.text },
    gameDetailDeveloper: { fontSize: 14, color: colors.textSecondary, marginBottom: 8 },
    gameDetailRating: { fontSize: 16, color: colors.primary, marginBottom: 12 },
    gameDetailDescription: { fontSize: 15, color: colors.textSecondary, lineHeight: 1.6, marginBottom: 16 },
    gameDetailPlatforms: { display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 },
    platformBadge: { background: "rgba(255,255,255,0.1)", borderRadius: 24, padding: "6px 14px", fontSize: 12, color: colors.text },
    buyButtonsRow: { display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 },
    buyBtn: (bgColor) => ({ background: bgColor, border: "none", borderRadius: 10, padding: "10px 18px", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, fontSize: 13, fontWeight: 500 }),
    backBtn: { display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.05)", border: "none", borderRadius: 12, padding: "10px 20px", color: colors.text, cursor: "pointer", marginBottom: 24, fontSize: 14 },
    trailerFrame: { width: "100%", height: 350, borderRadius: 18, marginBottom: 24, border: "none" },
    settingsSection: { background: colors.bgCard, borderRadius: 16, padding: 24, marginBottom: 24 },
    settingsRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 14 },
    settingsLabel: { fontSize: 15, color: colors.text },
    checkbox: { display: "flex", alignItems: "center", gap: 12, marginBottom: 16, cursor: "pointer", fontSize: 14, color: colors.textSecondary },
  };

  const GameCard = ({ game, showBtn = false }) => {
    const isFavorite = favorites.includes(game.id);
    const inLibrary = library.some(g => g.id === game.id);
    return (
      <div className="game-card" style={styles.gameCard} onClick={() => openGameDetail(game)}>
        <img src={game.finalImg || game.img} style={styles.gameImg} alt={game.name} onError={(e) => { e.target.src = `https://placehold.co/300x400/14141f/ffd400?text=${encodeURIComponent(game.name.slice(0,3))}`; }} />
        <div style={{ position: "absolute", top: 10, right: 10, background: "rgba(0,0,0,0.7)", borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 700, color: colors.primary }}>★ {game.finalRating?.toFixed(1)}</div>
        <button className="btn-click" style={{ position: "absolute", top: 10, left: 10, background: "rgba(0,0,0,0.7)", border: "none", borderRadius: 20, padding: "6px 8px", cursor: "pointer" }} onClick={(e) => { e.stopPropagation(); toggleFavorite(game.id); }}>
          {isFavorite ? <BsFillHeartFill color={colors.primary} size={12} /> : <FaHeart color="#fff" size={12} />}
        </button>
        <div style={styles.gameInfo}>
          <div style={styles.gameName}>{game.name}</div>
          <div style={styles.rating}><FaStar size={11} /> {game.finalRating?.toFixed(1)}</div>
          <div style={{ fontSize: 11, color: colors.textSecondary, marginBottom: 8 }}>{game.playtime}</div>
          {showBtn && <button className="btn-click" style={styles.addBtn} onClick={(e) => { e.stopPropagation(); addToLibrary(game); }}>{inLibrary ? <FaCheck size={12} /> : <FaPlus size={12} />} {inLibrary ? "In Library" : "Add"}</button>}
        </div>
      </div>
    );
  };

  if (loading || gamesLoading) {
    return <div style={{ background: colors.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}><div style={styles.loadingSpinner}></div></div>;
  }

  if (currentTab === "gameDetail" && selectedGameDetail) {
    const buyLinks = getBuyLinks(selectedGameDetail);
    return (
      <div style={styles.app}>
        <div style={styles.container}>
          <div style={styles.header}>
            <div style={styles.logo} onClick={() => setCurrentTab("home")}>
              <span style={styles.logoIcon}>NX</span>
              <span style={styles.logoText}>NexPlay</span>
            </div>
            <div style={styles.mainTabs}>
              <button className="btn-click" style={styles.iconBtn} onClick={() => setShowSettings(true)}><FaCog /> Settings</button>
              {!user ? <button className="btn-click" style={styles.loginBtn} onClick={() => setShowLoginModal(true)}><FaEnvelope /> Login</button> :
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={styles.userAvatar}>{userData?.username?.charAt(0).toUpperCase()}</div>
                  <button className="btn-click" style={styles.logoutBtn} onClick={logout}>Logout</button>
                </div>}
            </div>
          </div>
          <button className="btn-click" style={styles.backBtn} onClick={closeGameDetail}><FaArrowLeft /> Back</button>
          <div className="fade-in" style={styles.gameDetailHeader}>
            <img src={selectedGameDetail.finalImg || selectedGameDetail.img} style={styles.gameDetailImg} alt={selectedGameDetail.name} />
            <div style={styles.gameDetailInfo}>
              <div style={styles.gameDetailName}>{selectedGameDetail.name}</div>
              <div style={styles.gameDetailDeveloper}>{selectedGameDetail.developer}</div>
              <div style={styles.gameDetailRating}>★ {selectedGameDetail.finalRating?.toFixed(1)} · {selectedGameDetail.year} · {selectedGameDetail.playtime}</div>
              <div style={styles.gameDetailDescription}>{selectedGameDetail.description}</div>
              <div style={styles.gameDetailPlatforms}>{selectedGameDetail.platforms?.map(p => <span key={p} style={styles.platformBadge}>{p}</span>)}</div>
              <div style={styles.buyButtonsRow}>{buyLinks.map(link => <button key={link.name} className="btn-click" style={styles.buyBtn(link.color)} onClick={() => window.open(link.url, "_blank")}>{link.icon} Buy on {link.name}</button>)}</div>
              <button className="btn-click" style={{ ...styles.addBtn, width: "auto", display: "inline-flex" }} onClick={() => addToLibrary(selectedGameDetail)}>+ Add to Library</button>
            </div>
          </div>
          {selectedGameDetail.trailer && <iframe src={selectedGameDetail.trailer} style={styles.trailerFrame} title="Trailer" allowFullScreen />}
          <div className="fade-in">
            <div style={styles.sectionTitle}>Write a Review</div>
            <div style={styles.reviewStars}>{[1,2,3,4,5].map(star => <span key={star} className="btn-click" style={{ ...styles.reviewStar, color: star <= reviewRating ? colors.primary : colors.textSecondary }} onClick={() => setReviewRating(star)}>★</span>)}</div>
            <textarea style={styles.textarea} placeholder="Your review..." rows="2" value={reviewComment} onChange={e => setReviewComment(e.target.value)} />
            <button className="btn-click" style={styles.modalBtn} onClick={submitGameDetailReview}>Submit Review</button>
          </div>
          <div className="fade-in" style={{ marginTop: 28 }}>
            <div style={styles.sectionTitle}>Reviews ({gameDetailReviews.length})</div>
            {gameDetailReviews.length === 0 ? <div style={styles.emptyState}>No reviews yet. Be the first!</div> :
              gameDetailReviews.map(review => (
                <div key={review.id} style={styles.reviewCard}>
                  <div style={styles.reviewHeader}>
                    <span style={styles.reviewUsername}>{review.username}</span>
                    <span style={styles.reviewRating}>★ {review.rating}/5</span>
                  </div>
                  <div style={styles.reviewComment}>{review.comment || "No comment"}</div>
                  {user && (
                    <div style={styles.reviewActions}>
                      <button className="btn-click" style={styles.likeBtn} onClick={() => handleLikeReview(review.id)}><FaThumbsUp /> {review.likes?.length || 0}</button>
                      <button className="btn-click" style={styles.likeBtn} onClick={() => handleDislikeReview(review.id)}><FaThumbsDown /> {review.dislikes?.length || 0}</button>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.app} onClick={initAudio}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.logo} onClick={() => setCurrentTab("home")}>
            <span style={styles.logoIcon}>NX</span>
            <span style={styles.logoText}>NexPlay</span>
          </div>
          <div style={styles.mainTabs}>
            <button className="btn-click" style={styles.mainTab(currentTab === "home")} onClick={() => setCurrentTab("home")}><FaHome /> Discover</button>
            <button className="btn-click" style={styles.mainTab(currentTab === "library")} onClick={() => setCurrentTab("library")}><BsFillCollectionFill /> Library</button>
            <button className="btn-click" style={styles.mainTab(currentTab === "profile")} onClick={() => setCurrentTab("profile")}><FaUser /> Profile</button>
            <button className="btn-click" style={styles.mainTab(currentTab === "friends")} onClick={() => setCurrentTab("friends")}><FaUsers /> Friends</button>
            <button className="btn-click" style={styles.mainTab(currentTab === "ai")} onClick={() => setCurrentTab("ai")}><FaRobot /> AI</button>
            <button className="btn-click" style={styles.iconBtn} onClick={() => setShowSettings(true)}><FaCog /></button>
            {!user ? <button className="btn-click" style={styles.loginBtn} onClick={() => setShowLoginModal(true)}><FaEnvelope /> Login</button> :
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={styles.userAvatar}>{userData?.username?.charAt(0).toUpperCase()}</div>
                <button className="btn-click" style={styles.logoutBtn} onClick={logout}>Logout</button>
              </div>}
          </div>
        </div>

        {currentTab === "home" && (
          <div className="fade-in">
            <div style={styles.tabNav}>
              <button className="btn-click" style={styles.tabNavBtn(discoverSubTab === "discover")} onClick={() => setDiscoverSubTab("discover")}>🔍 Discover</button>
              <button className="btn-click" style={styles.tabNavBtn(discoverSubTab === "must")} onClick={() => setDiscoverSubTab("must")}>🔥 Must Play</button>
              <button className="btn-click" style={styles.tabNavBtn(discoverSubTab === "best")} onClick={() => setDiscoverSubTab("best")}>🏆 Best Ever</button>
              <button className="btn-click" style={styles.tabNavBtn(discoverSubTab === "gems")} onClick={() => setDiscoverSubTab("gems")}>💎 Hidden Gems</button>
            </div>

            {discoverSubTab === "discover" && (
              <>
                <div style={styles.randomFilterSection}>
                  <div style={styles.randomFilterTitle}><FaRandom /> Random Game</div>
                  <div style={styles.randomFilterRow}>
                    <label className="btn-click" style={styles.randomCheckbox}><input type="checkbox" checked={randomExcludeHorror} onChange={e => setRandomExcludeHorror(e.target.checked)} /> Exclude Horror</label>
                    <label className="btn-click" style={styles.randomCheckbox}><input type="checkbox" checked={randomExcludeIndie} onChange={e => setRandomExcludeIndie(e.target.checked)} /> Exclude Indie</label>
                    <label className="btn-click" style={styles.randomCheckbox}><input type="checkbox" checked={randomExcludeOld} onChange={e => setRandomExcludeOld(e.target.checked)} /> Exclude before 2015</label>
                    <div><span style={{ color: colors.textSecondary }}>Min Rating: {randomMinRating}</span><input type="range" min="0" max="10" step="0.5" value={randomMinRating} onChange={e => setRandomMinRating(parseFloat(e.target.value))} style={styles.randomSlider} /></div>
                    <select className="btn-click" value={randomMode} onChange={e => setRandomMode(e.target.value)} style={styles.randomSelect}>
                      <option value="full">Fully Random</option><option value="genre">Random by Genre</option><option value="mood">Random by Mood</option>
                    </select>
                    <button className="btn-click" style={styles.loginBtn} onClick={doRandom}><FaRandom /> Random Game</button>
                  </div>
                </div>

                <div style={styles.tabNav}>
                  <button className="btn-click" style={styles.tabNavBtn(step === 1)} onClick={() => setStep(1)}>Mood</button>
                  <button className="btn-click" style={styles.tabNavBtn(step === 2)} onClick={() => setStep(2)}>Genre</button>
                  <button className="btn-click" style={styles.tabNavBtn(step === 3)} onClick={() => setStep(3)}>Playtime</button>
                  <button className="btn-click" style={styles.tabNavBtn(step === 4)} onClick={() => setStep(4)}>Results</button>
                </div>

                {step === 1 && (
                  <div className="slide-in">
                    <div style={styles.stepTitle}>What's your mood? 🎭</div>
                    <div style={styles.pillGrid}>{MOODS.map(m => <button key={m} className="btn-click" style={styles.pill(selectedMoods.includes(m))} onClick={() => toggle(selectedMoods, setSelectedMoods, m)}>{m}</button>)}</div>
                    <button className="btn-click" style={styles.nextBtn} onClick={() => setStep(2)}>Next →</button>
                  </div>
                )}
                {step === 2 && (
                  <div className="slide-in">
                    <div style={styles.stepTitle}>Pick your genres 🎮</div>
                    <div style={styles.pillGrid}>{GENRES.map(g => <button key={g} className="btn-click" style={styles.pill(selectedGenres.includes(g))} onClick={() => toggle(selectedGenres, setSelectedGenres, g)}>{g}</button>)}</div>
                    <button className="btn-click" style={styles.nextBtn} onClick={() => setStep(3)}>Next →</button>
                  </div>
                )}
                {step === 3 && (
                  <div className="slide-in">
                    <div style={styles.stepTitle}>How long? ⏱️</div>
                    <div style={styles.pillGrid}>{PLAYTIMES.map(p => <button key={p} className="btn-click" style={styles.pill(selectedPlaytime === p)} onClick={() => setSelectedPlaytime(p === selectedPlaytime ? null : p)}>{p}</button>)}</div>
                    <button className="btn-click" style={styles.nextBtn} onClick={() => setStep(4)}>Show Results 🚀</button>
                  </div>
                )}
                {step === 4 && (
                  <div className="fade-in">
                    <input style={styles.searchBar} placeholder="Search games..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                    <div style={styles.filterRow}>
                      <span>Sort:</span>
                      <button className="btn-click" style={styles.filterBtn(sortBy === "score")} onClick={() => setSortBy("score")}>Best Match</button>
                      <button className="btn-click" style={styles.filterBtn(sortBy === "rating")} onClick={() => setSortBy("rating")}>Rating</button>
                      <button className="btn-click" style={styles.filterBtn(sortBy === "year")} onClick={() => setSortBy("year")}>Year</button>
                    </div>
                    {topPicks.length > 0 && (
                      <div>
                        <div style={styles.sectionTitle}>🎯 Top Picks For You</div>
                        <div style={styles.topPicksRow}>{topPicks.map((g,i) => <div key={g.id} className="game-card" style={styles.topPickCard} onClick={() => openGameDetail(g)}><div style={{ fontSize: 24, marginBottom: 8 }}>{["🥇","🥈","🥉","4","5","6","7","8"][i]}</div><img src={g.finalImg || g.img} style={{ width: "100%", height: 90, objectFit: "cover", borderRadius: 10 }} alt={g.name} /><div style={{ fontWeight: 700, marginTop: 10, color: colors.text }}>{g.name}</div><div style={{ fontSize: 12, color: colors.primary }}>★ {g.finalRating?.toFixed(1)}</div><button className="btn-click" style={styles.addBtn} onClick={(e) => { e.stopPropagation(); addToLibrary(g); }}>+ Add</button></div>)}</div>
                      </div>
                    )}
                    <div style={styles.sectionTitle}>📋 All Results</div>
                    <div style={styles.grid}>{restResults.map(g => <GameCard key={g.id} game={g} showBtn={true} />)}</div>
                  </div>
                )}
              </>
            )}

            {discoverSubTab === "must" && (
              <div>
                <div style={styles.randomFilterSection}>
                  <div style={styles.randomFilterTitle}><FaFilter /> Filter</div>
                  <div style={styles.randomFilterRow}>
                    <select className="btn-click" onChange={e => setCategoryFilter({ ...categoryFilter, genre: e.target.value })} style={styles.select}><option value="">Genre</option>{GENRES.map(g => <option key={g} value={g}>{g}</option>)}</select>
                    <input type="number" placeholder="Min Rating" style={{ ...styles.input, width: 110, marginBottom: 0 }} onChange={e => setCategoryFilter({ ...categoryFilter, minRating: parseFloat(e.target.value) || 0 })} />
                    <input type="number" placeholder="Min Year" style={{ ...styles.input, width: 110, marginBottom: 0 }} onChange={e => setCategoryFilter({ ...categoryFilter, year: parseInt(e.target.value) || 0 })} />
                    <button className="btn-click" style={styles.filterBtn(false)} onClick={() => setCategoryFilter({ genre: "", minRating: 0, year: 0 })}>Clear</button>
                  </div>
                </div>
                <div style={styles.grid}>{filteredCategoryGames(MUST_PLAY_GAMES).slice(0, 40).map(g => <GameCard key={g.id} game={g} showBtn={true} />)}</div>
              </div>
            )}

            {discoverSubTab === "best" && (
              <div>
                <div style={styles.randomFilterSection}>
                  <div style={styles.randomFilterTitle}><FaFilter /> Filter</div>
                  <div style={styles.randomFilterRow}>
                    <select className="btn-click" onChange={e => setCategoryFilter({ ...categoryFilter, genre: e.target.value })} style={styles.select}><option value="">Genre</option>{GENRES.map(g => <option key={g} value={g}>{g}</option>)}</select>
                    <input type="number" placeholder="Min Rating" style={{ ...styles.input, width: 110, marginBottom: 0 }} onChange={e => setCategoryFilter({ ...categoryFilter, minRating: parseFloat(e.target.value) || 0 })} />
                    <input type="number" placeholder="Min Year" style={{ ...styles.input, width: 110, marginBottom: 0 }} onChange={e => setCategoryFilter({ ...categoryFilter, year: parseInt(e.target.value) || 0 })} />
                    <button className="btn-click" style={styles.filterBtn(false)} onClick={() => setCategoryFilter({ genre: "", minRating: 0, year: 0 })}>Clear</button>
                  </div>
                </div>
                <div style={styles.grid}>{filteredCategoryGames(BEST_EVER_GAMES).slice(0, 40).map(g => <GameCard key={g.id} game={g} showBtn={true} />)}</div>
              </div>
            )}

            {discoverSubTab === "gems" && (
              <div>
                <div style={styles.randomFilterSection}>
                  <div style={styles.randomFilterTitle}><FaFilter /> Filter</div>
                  <div style={styles.randomFilterRow}>
                    <select className="btn-click" onChange={e => setCategoryFilter({ ...categoryFilter, genre: e.target.value })} style={styles.select}><option value="">Genre</option>{GENRES.map(g => <option key={g} value={g}>{g}</option>)}</select>
                    <input type="number" placeholder="Min Rating" style={{ ...styles.input, width: 110, marginBottom: 0 }} onChange={e => setCategoryFilter({ ...categoryFilter, minRating: parseFloat(e.target.value) || 0 })} />
                    <input type="number" placeholder="Min Year" style={{ ...styles.input, width: 110, marginBottom: 0 }} onChange={e => setCategoryFilter({ ...categoryFilter, year: parseInt(e.target.value) || 0 })} />
                    <button className="btn-click" style={styles.filterBtn(false)} onClick={() => setCategoryFilter({ genre: "", minRating: 0, year: 0 })}>Clear</button>
                  </div>
                </div>
                <div style={styles.grid}>{filteredCategoryGames(HIDDEN_GEMS_GAMES).slice(0, 30).map(g => <GameCard key={g.id} game={g} showBtn={true} />)}</div>
              </div>
            )}
          </div>
        )}

        {currentTab === "library" && (
          <div className="fade-in">
            <div style={styles.sectionTitle}>📚 My Library ({library.length})</div>
            <div style={styles.statsRow}>
              <div style={styles.statCard}><div style={styles.statNumber}>{library.length}</div><div>Total</div></div>
              <div style={styles.statCard}><div style={styles.statNumber}>{library.filter(g => g.status === "playing").length}</div><div>Playing</div></div>
              <div style={styles.statCard}><div style={styles.statNumber}>{library.filter(g => g.status === "completed").length}</div><div>Completed</div></div>
            </div>
            {library.length === 0 ? <div style={styles.emptyState}>Your library is empty. Add games from Discover!</div> : library.map(game => (
              <div key={game.id} className="fade-in" style={styles.libraryCard}>
                <img src={game.finalImg || game.img} style={styles.libraryImg} onClick={() => openGameDetail(game)} alt={game.name} />
                <div style={styles.libraryInfo}>
                  <div style={styles.libraryTitle}>{game.name}</div>
                  <div style={styles.libraryMeta}>{game.developer} · {game.year}</div>
                  <div style={styles.libraryActions}>
                    <select className="btn-click" value={game.status} onChange={e => updateStatus(game.id, e.target.value, game)} style={styles.select}>
                      <option value="wishlist">📝 Wishlist</option><option value="playing">🎮 Playing</option><option value="completed">✅ Completed</option>
                    </select>
                    <button className="btn-click" onClick={() => toggleFavorite(game.id)} style={styles.select}><FaHeart color={favorites.includes(game.id) ? colors.primary : "#fff"} /></button>
                    <button className="btn-click" onClick={() => markAsPlayed(game)} style={styles.select}><FaClock /> Played</button>
                    <button className="btn-click" onClick={() => removeFromLibrary(game.id)} style={{ ...styles.select, color: "#ff6b6b" }}>Remove</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {currentTab === "profile" && (
          <div className="fade-in">
            {user ? (
              <>
                <div style={styles.profileHeader}>
                  <div style={styles.profileAvatarLarge}>{userData?.username?.charAt(0).toUpperCase()}</div>
                  <div>
                    <div style={{ fontSize: 24, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>{userData?.username}{userData?.username === "Sherlock10K" && <span style={{ color: colors.primary }}>👑</span>}</div>
                    <div style={{ fontSize: 13, color: colors.textSecondary }}>{user.email}</div>
                    <div style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 14 }}>{userData?.bio || "No bio"}</div>
                    <div style={styles.statsRow}>
                      <div><div style={styles.statNumber}>{library.length}</div><div>Games</div></div>
                      <div><div style={styles.statNumber}>{library.filter(g => g.status === "completed").length}</div><div>Completed</div></div>
                      <div><div style={styles.statNumber}>{favorites.length}</div><div>Favorites</div></div>
                    </div>
                    <button className="btn-click" style={styles.editBtn} onClick={openEditModal}><FaEdit /> Edit Profile</button>
                  </div>
                </div>

                <div style={styles.platformSection}>
                  <div style={styles.randomFilterTitle}><FaSteam /> Steam Connection</div>
                  <div style={styles.platformRow}>
                    <input type="text" placeholder={text.steamId} value={steamIdInput} onChange={e => setSteamIdInput(e.target.value)} style={{ ...styles.input, marginBottom: 0, flex: 1 }} />
                    <button className="btn-click" style={styles.platformBtn(colors.steam)} onClick={handleSteamLogin} disabled={syncingPlatform === "steam"}>
                      <FaSteam /> {syncingPlatform === "steam" ? "Importing..." : text.importGames}
                    </button>
                  </div>
                  <div style={{ fontSize: 12, color: colors.textSecondary, marginTop: 12 }}>
                    🔍 {text.findSteamId}: <a href="https://steamidfinder.com/" target="_blank" rel="noreferrer" style={{ color: colors.primary }}>steamidfinder.com</a>
                  </div>
                  <div style={{ fontSize: 11, color: colors.textMuted, marginTop: 8 }}>
                    ⚠️ Make sure your Steam profile is set to "Public"
                  </div>
                </div>

                {userData?.lastPlayed?.length > 0 && (
                  <><div style={styles.sectionTitle}><FaClock /> Recently Played</div><div style={styles.lastPlayedRow}>{userData.lastPlayed.slice(0,6).map((g,i) => <div key={i} className="hover-lift" style={styles.lastPlayedCard} onClick={() => { const game = gamesWithData.find(a => a.id === g.gameId); if (game) openGameDetail(game); }}><img src={g.gameImg} style={styles.lastPlayedImg} alt={g.gameName} /><div style={styles.lastPlayedName}>{g.gameName}</div></div>)}</div></>
                )}
                <div style={styles.sectionTitle}><GiAchievement /> Achievements</div>
                <div style={styles.statsRow}>
                  <div style={styles.statCard}><div style={{ fontSize: 36 }}>🏅</div><div>First Game</div>{library.length >= 1 && <div style={{ color: colors.primary }}>✓</div>}</div>
                  <div style={styles.statCard}><div style={{ fontSize: 36 }}>🎮</div><div>Collector</div>{library.length >= 10 && <div style={{ color: colors.primary }}>✓</div>}</div>
                  <div style={styles.statCard}><div style={{ fontSize: 36 }}>✅</div><div>Completionist</div>{library.filter(g => g.status === "completed").length >= 5 && <div style={{ color: colors.primary }}>✓</div>}</div>
                </div>
              </>
            ) : <div style={styles.emptyState}>Login to see your profile</div>}
          </div>
        )}

        {currentTab === "friends" && (
          <div className="fade-in">
            <div style={styles.sectionTitle}><FaUsers /> Find Friends</div>
            <div style={styles.searchRow}>
              <input style={{ ...styles.input, marginBottom: 0, flex: 1 }} placeholder="Search by username..." value={searchUsersTerm} onChange={e => setSearchUsersTerm(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSearchUsers()} />
              <button className="btn-click" style={styles.loginBtn} onClick={handleSearchUsers}><FaSearch /> Search</button>
            </div>
            {searchingUsers && <div style={{ textAlign: "center", color: colors.textSecondary }}>Searching...</div>}
            {foundUsers.length === 0 && searchUsersTerm && !searchingUsers && <div style={styles.emptyState}>No users found</div>}
            {foundUsers.map(u => (
              <div key={u.id} className="fade-in" style={styles.userCard}>
                <div style={styles.userAvatarSmall}>{u.username?.charAt(0).toUpperCase()}</div>
                <div><div style={{ fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>{u.username}{u.username === "Sherlock10K" && <span style={{ color: colors.primary }}>👑</span>}</div><div style={{ fontSize: 13, color: colors.textSecondary }}>{u.bio || "No bio"}</div></div>
                <button className="btn-click" style={{ ...styles.addBtn, width: "auto", marginTop: 0, padding: "8px 16px", fontSize: 12 }} onClick={() => alert(`Friend request sent to ${u.username}`)}>Add Friend</button>
              </div>
            ))}
          </div>
        )}

        {currentTab === "ai" && (
          <div className="fade-in">
            <div style={styles.aiSection}>
              <div style={styles.randomFilterTitle}><FaRobot /> AI Assistant</div>
              <div style={styles.aiRow}>
                <input style={{ ...styles.input, marginBottom: 0, flex: 1 }} placeholder="Ask AI for game recommendations..." value={aiQuery} onChange={e => setAiQuery(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleAiSearch()} />
                <button className="btn-click" style={styles.loginBtn} onClick={handleAiSearch} disabled={isAiLoading}>{isAiLoading ? "Thinking..." : "✨ Go"}</button>
              </div>
              {aiResponse && <div className="fade-in" style={styles.aiResultBox}>{aiResponse}</div>}
            </div>
            <div style={styles.randomFilterSection}>
              <div style={styles.randomFilterTitle}><FaFilter /> Filter Games</div>
              <div style={styles.randomFilterRow}>
                <select className="btn-click" onChange={e => setCategoryFilter({ ...categoryFilter, genre: e.target.value })} style={styles.select}><option value="">Genre</option>{GENRES.map(g => <option key={g} value={g}>{g}</option>)}</select>
                <input type="number" placeholder="Min Rating" style={{ ...styles.input, width: 110, marginBottom: 0 }} onChange={e => setCategoryFilter({ ...categoryFilter, minRating: parseFloat(e.target.value) || 0 })} />
                <input type="number" placeholder="Min Year" style={{ ...styles.input, width: 110, marginBottom: 0 }} onChange={e => setCategoryFilter({ ...categoryFilter, year: parseInt(e.target.value) || 0 })} />
                <button className="btn-click" style={styles.filterBtn(false)} onClick={() => setCategoryFilter({ genre: "", minRating: 0, year: 0 })}>Clear</button>
              </div>
            </div>
            <div style={styles.sectionTitle}>🔥 Must Play</div>
            <div style={styles.grid}>{filteredCategoryGames(MUST_PLAY_GAMES).slice(0, 20).map(g => <GameCard key={g.id} game={g} showBtn={true} />)}</div>
            <div style={styles.sectionTitle}>🏆 Best Ever</div>
            <div style={styles.grid}>{filteredCategoryGames(BEST_EVER_GAMES).slice(0, 20).map(g => <GameCard key={g.id} game={g} showBtn={true} />)}</div>
            <div style={styles.sectionTitle}>💎 Hidden Gems</div>
            <div style={styles.grid}>{filteredCategoryGames(HIDDEN_GEMS_GAMES).map(g => <GameCard key={g.id} game={g} showBtn={true} />)}</div>
          </div>
        )}
      </div>

      {showSettings && (
        <div className="fade-in" style={styles.modalOverlay} onClick={() => setShowSettings(false)}>
          <div className="slide-in" style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div style={styles.modalTitle}>Settings ⚙️</div>
            <div style={styles.settingsSection}>
              <div style={styles.settingsRow}><span style={styles.settingsLabel}>Sound Effects:</span><button className="btn-click" style={styles.iconBtn} onClick={() => setSoundEnabled(!soundEnabled)}>{soundEnabled ? <FaVolumeUp /> : <FaVolumeMute />} {soundEnabled ? "ON" : "OFF"}</button></div>
              <div style={styles.settingsRow}><span style={styles.settingsLabel}>Language:</span><button className="btn-click" style={styles.iconBtn} onClick={() => setLang(lang === "en" ? "de" : "en")}><FaLanguage /> {lang === "en" ? "DE" : "EN"}</button></div>
            </div>
            <button className="btn-click" style={styles.modalBtn} onClick={() => setShowSettings(false)}>Close</button>
          </div>
        </div>
      )}

      {showRandomModal && randomGame && (
        <div className="fade-in" style={styles.modalOverlay} onClick={() => setShowRandomModal(false)}>
          <div className="slide-in" style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div style={styles.modalTitle}>🎲 Random Game</div>
            <img src={randomGame.finalImg || randomGame.img} style={{ width: "100%", borderRadius: 18, marginBottom: 20 }} alt={randomGame.name} />
            <div style={{ fontSize: 18, fontWeight: 700, textAlign: "center", marginBottom: 8 }}>{randomGame.name}</div>
            <div style={{ fontSize: 15, color: colors.primary, textAlign: "center", marginBottom: 14 }}>★ {randomGame.finalRating?.toFixed(1)} · {randomGame.playtime} · {randomGame.year}</div>
            <div style={{ fontSize: 14, marginBottom: 24, color: colors.textSecondary, textAlign: "center" }}>{randomGame.description}</div>
            <div style={{ display: "flex", gap: 14, justifyContent: "center" }}><button className="btn-click" style={{ ...styles.addBtn, width: "auto", marginTop: 0, padding: "10px 24px" }} onClick={() => { addToLibrary(randomGame); setShowRandomModal(false); }}>+ Add to Library</button><button className="btn-click" style={styles.modalBtnSecondary} onClick={doRandom}>Roll Again</button></div>
          </div>
        </div>
      )}

      {showLoginModal && (
        <div className="fade-in" style={styles.modalOverlay} onClick={() => setShowLoginModal(false)}>
          <div className="slide-in" style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div style={styles.modalTitle}>{isLogin ? "Login" : "Register"}</div>
            {errorMsg && <div style={styles.errorText}>{errorMsg}</div>}
            <input style={styles.input} type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
            <div style={styles.passwordWrapper}><input style={styles.input} type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} /><span className="btn-click" style={styles.passwordEye} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <FaEyeSlash /> : <FaEye />}</span></div>
            <button className="btn-click" style={styles.modalBtn} onClick={isLogin ? handleLogin : handleRegister}>{isLogin ? "Login" : "Register"}</button>
            <div className="btn-click" style={styles.switchText} onClick={() => { setIsLogin(!isLogin); setErrorMsg(""); }}>{isLogin ? "No account? Register" : "Already have an account? Login"}</div>
          </div>
        </div>
      )}

      {showEditModal && user && (
        <div className="fade-in" style={styles.modalOverlay} onClick={() => setShowEditModal(false)}>
          <div className="slide-in" style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div style={styles.modalTitle}>Edit Profile</div>
            {editError && <div style={styles.errorText}>{editError}</div>}
            {editSuccess && <div style={styles.successText}>{editSuccess}</div>}
            <input style={styles.input} placeholder="Username" value={editUsername} onChange={e => setEditUsername(e.target.value)} />
            <textarea style={styles.textarea} placeholder="Bio" rows="2" value={editBio} onChange={e => setEditBio(e.target.value)} />
            <label className="btn-click" style={styles.checkbox}><input type="checkbox" checked={editPrivate} onChange={e => setEditPrivate(e.target.checked)} /> Private profile</label>
            <button className="btn-click" style={styles.modalBtn} onClick={handleUpdateProfile}>Save</button>
          </div>
        </div>
      )}

      {showReviews && reviewsGame && (
        <div className="fade-in" style={styles.modalOverlay} onClick={closeReviews}>
          <div className="slide-in" style={{ ...styles.modalContent, maxWidth: 550 }} onClick={e => e.stopPropagation()}>
            <div style={styles.modalTitle}>Reviews for {reviewsGame.name}</div>
            {gameDetailReviews.length === 0 ? <div style={styles.emptyState}>No reviews yet. Be the first!</div> :
              gameDetailReviews.map(review => (
                <div key={review.id} style={styles.reviewCard}>
                  <div style={styles.reviewHeader}>
                    <span style={styles.reviewUsername}>{review.username}</span>
                    <span style={styles.reviewRating}>★ {review.rating}/5</span>
                  </div>
                  <div style={styles.reviewComment}>{review.comment || "No comment"}</div>
                </div>
              ))}
            <button className="btn-click" style={styles.modalBtn} onClick={closeReviews}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}