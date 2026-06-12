import { useState, useEffect, useMemo } from "react";
import { FaHome, FaUser, FaFire, FaSearch, FaHeart, FaStar, FaTrash, FaSignOutAlt, FaPlus, FaCheck, FaEnvelope, FaEye, FaEyeSlash, FaEdit, FaUsers, FaClock, FaRandom, FaThumbsUp, FaThumbsDown, FaArrowLeft, FaCog, FaVolumeUp, FaVolumeMute, FaLanguage, FaSteam, FaPlaystation, FaGamepad, FaTrophy, FaGem, FaShoppingCart, FaRobot, FaFilter, FaLink, FaExternalLinkAlt, FaDonate, FaAward, FaList, FaMedal, FaGamepad as FaGamepadIcon, FaDiceD6, FaGlobe, FaStarHalfAlt, FaTv, FaMicrophone, FaVideo, FaDesktop, FaPlusCircle, FaTrashAlt, FaUsers as FaUsersIcon, FaBell, FaCalendarAlt, FaChartLine, FaBook, FaTags, FaBalanceScale, FaFileExport, FaFileImport, FaMoon, FaSun, FaAdjust, FaBars, FaTimes, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { GiConsoleController, GiAchievement, GiSwordman, GiPuzzle, GiMusicalNotes, GiBrain, GiShield, GiMagicSwirl, GiTrophy, GiLaurels, GiSpinningWheel, GiNotebook, GiTwoCoins } from "react-icons/gi";
import { BsFillCollectionFill, BsFillHeartFill, BsFillStarFill, BsFillAwardFill, BsFillPlayFill } from "react-icons/bs";
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
const GENRES = ["Action", "Adventure", "RPG", "Indie", "Horror", "Strategy", "Puzzle", "Open World", "Story Rich", "Fighting", "Sports", "Racing", "Simulation"];
const PLAYTIMES = ["Under 10h", "10-20h", "20-40h", "40-60h", "60-100h", "100h+"];

const AOTY_DATA = {
  2026: { tga: { winner: "TBA 2026", img: "https://placehold.co/300x200/14141f/ffd400?text=TBA" } },
  2025: { tga: { winner: "Clair Obscur: Expedition 33", img: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/2358720/header.jpg", steamId: 2358720 } },
  2024: { tga: { winner: "Astro Bot", img: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/2357570/header.jpg", steamId: 2357570 } },
  2023: { tga: { winner: "Baldur's Gate 3", img: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1086940/header.jpg", steamId: 1086940 } },
  2022: { tga: { winner: "Elden Ring", img: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1245620/header.jpg", steamId: 1245620 } },
  2021: { tga: { winner: "It Takes Two", img: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1426210/header.jpg", steamId: 1426210 } },
  2020: { tga: { winner: "The Last of Us Part II", img: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1888930/header.jpg", steamId: 1888930 } },
  2019: { tga: { winner: "Sekiro: Shadows Die Twice", img: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/814380/header.jpg", steamId: 814380 } },
  2018: { tga: { winner: "God of War", img: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1593500/header.jpg", steamId: 1593500 } },
  2017: { tga: { winner: "The Legend of Zelda: Breath of the Wild", img: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1245620/header.jpg", steamId: 1245620 } },
  2016: { tga: { winner: "Overwatch", img: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/2357570/header.jpg", steamId: 2357570 } },
  2015: { tga: { winner: "The Witcher 3: Wild Hunt", img: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/292030/header.jpg", steamId: 292030 } },
  2014: { tga: { winner: "Dragon Age: Inquisition", img: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1222690/header.jpg", steamId: 1222690 } },
  2013: { tga: { winner: "Grand Theft Auto V", img: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/271590/header.jpg", steamId: 271590 } },
  2012: { tga: { winner: "The Walking Dead: Season One", img: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/207610/header.jpg", steamId: 207610 } },
  2011: { tga: { winner: "The Elder Scrolls V: Skyrim", img: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/489830/header.jpg", steamId: 489830 } },
  2010: { tga: { winner: "Red Dead Redemption", img: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1174180/header.jpg", steamId: 1174180 } },
  2009: { tga: { winner: "Uncharted 2: Among Thieves", img: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1250/header.jpg", steamId: 1250 } },
  2008: { tga: { winner: "Grand Theft Auto IV", img: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/12210/header.jpg", steamId: 12210 } },
  2007: { tga: { winner: "BioShock", img: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/7670/header.jpg", steamId: 7670 } },
  2006: { tga: { winner: "The Elder Scrolls IV: Oblivion", img: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/22330/header.jpg", steamId: 22330 } },
  2005: { tga: { winner: "Resident Evil 4", img: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/254700/header.jpg", steamId: 254700 } },
  2004: { tga: { winner: "Grand Theft Auto: San Andreas", img: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/12120/header.jpg", steamId: 12120 } },
  2003: { tga: { winner: "Madden NFL 2004", img: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/15530/header.jpg", steamId: 15530 } }
};

const translations = {
  en: { home: "Discover", library: "Library", profile: "Profile", friends: "Friends", ai: "AI Assistant", aoty: "AOTY", playlists: "Playlists", gameNight: "Game Night", activity: "Activity", wishlist: "Wishlist", backlog: "Backlog Cleaner", tags: "Tags", compare: "Compare", journal: "Journal", export: "Export", import: "Import", theme: "Theme", dark: "Dark", light: "Light", auto: "Auto", randomGame: "Random Game", yearFilter: "Year", allYears: "All Years", login: "Login", register: "Register", logout: "Logout", search: "Search games...", searchAOTY: "Search by year or game name...", mood: "What's your mood?", genre: "Pick your genres", playtime: "How long?", next: "Next", results: "Show Results", topPicks: "Top Picks", bestEver: "Best Ever", allResults: "All Results", hiddenGems: "Hidden Gems", sort: "Sort", bestMatch: "Best Match", rating: "Rating", year: "Year", add: "Add to Library", inLibrary: "In Library", reviews: "Reviews", played: "Played", remove: "Remove", editProfile: "Edit Profile", username: "Username", bio: "Bio", private: "Private profile", save: "Save", achievements: "Achievements", firstGame: "First Game", collector: "Collector", completionist: "Completionist", recentlyPlayed: "Recently Played", favorites: "Favorites", total: "Total", playing: "Playing", completed: "Completed", rollAgain: "Roll Again", close: "Close", back: "Back", buyOn: "Buy on", writeReview: "Write Review", yourReview: "Your review...", submit: "Submit", noReviews: "No reviews yet", findFriends: "Find Friends", settings: "Settings", sound: "Sound Effects", language: "Language", steamId: "Steam ID", importGames: "Import Steam Games", findSteamId: "How to find your Steam ID", donate: "Support the developer", topRated: "Top Rated Game", topGenre: "Top Genre", totalPlaytime: "Total Playtime", aotyTitle: "All Of The Year", top20: "Top 20 by Genre", findYourGame: "Find Your Game", allAwards: "All Awards", backToAOTY: "Back to AOTY Overview", createPlaylist: "Create Playlist", playlistName: "Playlist Name", addToPlaylist: "Add to Playlist", gameNightMode: "Game Night Mode", spinWheel: "Spin the Wheel", excludeMultiplayer: "Exclude Multiplayer", activityFeed: "Activity Feed", addToWishlist: "Add to Wishlist", checkPrice: "Check Price", backlogTip: "You should play", addTag: "Add Tag", compareGames: "Compare Games", selectGame: "Select Game", journalNotes: "My Notes", exportLibrary: "Export Library", importLibrary: "Import Library", themeSelect: "Select Theme", loading: "Loading...", showMore: "Show more", showLess: "Show less", winner: "Winner", compareFeatures: "Compare Features", graphics: "Graphics", story: "Story", gameplay: "Gameplay", replayability: "Replayability", price: "Price" },
  de: { home: "Entdecken", library: "Bibliothek", profile: "Profil", friends: "Freunde", ai: "KI-Assistent", aoty: "AOTY", playlists: "Playlists", gameNight: "Spielabend", activity: "Aktivitäten", wishlist: "Wunschliste", backlog: "Backlog Reiniger", tags: "Tags", compare: "Vergleichen", journal: "Tagebuch", export: "Exportieren", import: "Importieren", theme: "Design", dark: "Dunkel", light: "Hell", auto: "Auto", randomGame: "Zufälliges Spiel", yearFilter: "Jahr", allYears: "Alle Jahre", login: "Anmelden", register: "Registrieren", logout: "Abmelden", search: "Spiele suchen...", searchAOTY: "Suche nach Jahr oder Spielname...", mood: "Wie ist deine Stimmung?", genre: "Wähle deine Genres", playtime: "Wie lange?", next: "Weiter", results: "Ergebnisse", topPicks: "Top Empfehlungen", bestEver: "Beste Aller Zeiten", allResults: "Alle Ergebnisse", hiddenGems: "Geheimtipps", sort: "Sortieren", bestMatch: "Bester Treffer", rating: "Bewertung", year: "Jahr", add: "Zur Bibliothek", inLibrary: "In Bibliothek", reviews: "Bewertungen", played: "Gespielt", remove: "Entfernen", editProfile: "Profil bearbeiten", username: "Benutzername", bio: "Über mich", private: "Privates Profil", save: "Speichern", achievements: "Erfolge", firstGame: "Erstes Spiel", collector: "Sammler", completionist: "Vollender", recentlyPlayed: "Zuletzt gespielt", favorites: "Favoriten", total: "Gesamt", playing: "Spielt", completed: "Abgeschlossen", rollAgain: "Nochmal", close: "Schließen", back: "Zurück", buyOn: "Kaufen auf", writeReview: "Bewertung schreiben", yourReview: "Deine Bewertung...", submit: "Speichern", noReviews: "Keine Bewertungen", findFriends: "Freunde finden", settings: "Einstellungen", sound: "Soundeffekte", language: "Sprache", steamId: "Steam ID", importGames: "Steam Spiele importieren", findSteamId: "So findest du deine Steam ID", donate: "Unterstütze den Entwickler", topRated: "Bestbewertetes Spiel", topGenre: "Top Genre", totalPlaytime: "Spielzeit Gesamt", aotyTitle: "All Of The Year", top20: "Top 20 pro Genre", findYourGame: "Finde dein Spiel", allAwards: "Alle Auszeichnungen", backToAOTY: "Zurück zur AOTY Übersicht", createPlaylist: "Playlist erstellen", playlistName: "Playlist Name", addToPlaylist: "Zu Playlist hinzufügen", gameNightMode: "Spielabend Modus", spinWheel: "Rad drehen", excludeMultiplayer: "Multiplayer ausschließen", activityFeed: "Aktivitäten Feed", addToWishlist: "Zur Wunschliste", checkPrice: "Preis prüfen", backlogTip: "Du solltest spielen", addTag: "Tag hinzufügen", compareGames: "Spiele vergleichen", selectGame: "Spiel auswählen", journalNotes: "Meine Notizen", exportLibrary: "Bibliothek exportieren", importLibrary: "Bibliothek importieren", themeSelect: "Design auswählen", loading: "Laden...", showMore: "Mehr anzeigen", showLess: "Weniger anzeigen", winner: "Gewinner", compareFeatures: "Funktionen vergleichen", graphics: "Grafik", story: "Geschichte", gameplay: "Spielspaß", replayability: "Wiederspielwert", price: "Preis" }
};

const RAWG_API_KEY = "4da2c00cf3b2459d988e0ed0ac16988d";
const MANUAL_HIDDEN_GEMS = [
  { id: 9001, name: "CrossCode", rating: 9.1, genre: "Indie", playtime: "40-60h", year: 2018, img: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/368340/header.jpg", developer: "Radical Fish Games", mood: "Action", platforms: ["PC", "Switch", "PS4", "Xbox One"], steamId: 368340 },
  { id: 9002, name: "Outer Wilds", rating: 9.3, genre: "Adventure", playtime: "20-40h", year: 2019, img: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/753640/header.jpg", developer: "Mobius Digital", mood: "Mystery", platforms: ["PC", "PS4", "Xbox One", "Switch"], steamId: 753640 },
  { id: 9003, name: "Return of the Obra Dinn", rating: 9.2, genre: "Puzzle", playtime: "10-20h", year: 2018, img: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/653530/header.jpg", developer: "Lucas Pope", mood: "Mystery", platforms: ["PC", "Switch", "PS4", "Xbox One"], steamId: 653530 },
  { id: 9004, name: "Hades", rating: 9.3, genre: "Indie", playtime: "40-60h", year: 2020, img: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1145360/header.jpg", developer: "Supergiant Games", mood: "Action", platforms: ["PC", "Switch", "PS4", "Xbox"], steamId: 1145360 }
];

const translateGenre = (genreName) => {
  const map = {
    Action: "Action", Adventure: "Adventure", RPG: "RPG",
    Indie: "Indie", Strategy: "Strategy", Shooter: "Shooter",
    Horror: "Horror", Puzzle: "Puzzle", Simulation: "Simulation",
    Platformer: "Platformer", "Open World": "Open World", "Story Rich": "Story Rich",
    Racing: "Racing", Fighting: "Fighting", Sports: "Sports"
  };
  return map[genreName] || genreName;
};

let steamGamesCache = {};

// ========== KURZE BESCHREIBUNGEN (fehlerfrei) ==========
const generateLongDescription = (gameName, rawDescription) => {
  if (rawDescription && rawDescription.length > 200) return rawDescription;
  return `${gameName} ist ein herausragendes Spiel, das die Herzen von Gamern erobert hat. Die Entwickler haben viel Liebe zum Detail gesteckt. Die Spielmechanik ist intuitiv und tiefgründig. Die Geschichte fesselt von der ersten Minute an. Die Grafik ist atemberaubend und die Charaktere sind liebevoll gestaltet. Ein absolutes Muss für jeden Fan des Genres!`;
};

// ========== RATING-SYSTEM ==========
const calculateWeightedRating = (game, steamData) => {
  const name = game.name?.toLowerCase() || "";
  const currentYear = new Date().getFullYear();
  const gameYear = game.year || 2020;
  const age = currentYear - gameYear;
  
  let baseRating = game.rawgRating || 7.5;
  let steamRating = steamData?.steamRating || baseRating * 0.9;
  
  let agePenalty = 0;
  if (age >= 25) agePenalty = -0.8;
  else if (age >= 20) agePenalty = -0.6;
  else if (age >= 15) agePenalty = -0.4;
  else if (age >= 10) agePenalty = -0.2;
  else if (age >= 5) agePenalty = -0.1;
  else if (age <= 1) agePenalty = 0.2;
  
  let popularityBonus = 0;
  const reviewCount = steamData?.reviewCount || game.popularity || 0;
  if (reviewCount > 500000) popularityBonus = 0.5;
  else if (reviewCount > 200000) popularityBonus = 0.3;
  else if (reviewCount > 100000) popularityBonus = 0.2;
  else if (reviewCount > 50000) popularityBonus = 0.1;
  else if (reviewCount < 1000 && reviewCount > 0) popularityBonus = -0.2;
  
  let finalRating = (baseRating * 0.5) + (steamRating * 0.3) + popularityBonus + agePenalty;
  
  if (name === "tekken 3" || name.includes("tekken 3")) finalRating = 7.6;
  if (name.includes("elden ring")) finalRating = 9.5;
  if (name.includes("baldur's gate 3")) finalRating = 9.6;
  if (name.includes("witcher 3")) finalRating = 9.4;
  
  finalRating = Math.min(finalRating, 9.7);
  finalRating = Math.max(finalRating, 6.5);
  finalRating = Math.round(finalRating * 10) / 10;
  
  return finalRating;
};

const getGameImage = (rawgImg, gameName, steamData) => {
  if (steamData?.img && !steamData.img.includes("null")) return steamData.img;
  if (rawgImg && !rawgImg.includes("null") && !rawgImg.includes("placeholder")) return rawgImg;
  return `https://placehold.co/300x400/14141f/ffd400?text=${encodeURIComponent(gameName?.slice(0, 8) || "Game")}`;
};

const getTrailerUrl = (game) => {
  if (game.trailer && game.trailer.includes("youtube.com/embed")) return game.trailer;
  return `https://www.youtube.com/embed?listType=search&q=${encodeURIComponent(game.name)}+trailer`;
};

export default function NexPlay() {
  const [lang, setLang] = useState(() => localStorage.getItem("nexplay_lang") || "en");
  const [theme, setTheme] = useState(() => localStorage.getItem("nexplay_theme") || "dark");
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [gamesLoading, setGamesLoading] = useState(true);
  const [allGames, setAllGames] = useState([]);
  const [library, setLibrary] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState("home");
  const [discoverSubTab, setDiscoverSubTab] = useState("findGame");
  const [aotySearch, setAotySearch] = useState("");
  const [aotyResult, setAotyResult] = useState(null);
  const [selectedAotyYear, setSelectedAotyYear] = useState(null);
  const [selectedGenreForTop, setSelectedGenreForTop] = useState("Action");
  const [searchQuery, setSearchQuery] = useState("");
  const [step, setStep] = useState(1);
  const [selectedMoods, setSelectedMoods] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedPlaytime, setSelectedPlaytime] = useState(null);
  const [sortBy, setSortBy] = useState("score");
  const [soundEnabled, setSoundEnabled] = useState(() => localStorage.getItem("nexplay_sound") !== "false");
  const [showSettings, setShowSettings] = useState(false);
  const [showRandomModal, setShowRandomModal] = useState(false);
  const [randomGame, setRandomGame] = useState(null);
  const [randomExcludeHorror, setRandomExcludeHorror] = useState(false);
  const [randomExcludeIndie, setRandomExcludeIndie] = useState(false);
  const [randomExcludeOld, setRandomExcludeOld] = useState(false);
  const [randomMinRating, setRandomMinRating] = useState(7);
  const [randomYear, setRandomYear] = useState("all");
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
  const [playlists, setPlaylists] = useState([]);
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [gameNightFilters, setGameNightFilters] = useState({ excludeMultiplayer: false, minRating: 7, maxPlaytime: "" });
  const [spinning, setSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState(null);
  const [activityFeed, setActivityFeed] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [customTags, setCustomTags] = useState({});
  const [gameJournal, setGameJournal] = useState({});
  const [compareGames, setCompareGames] = useState([null, null]);
  const [loadingAction, setLoadingAction] = useState(false);
  const [steamIdInput, setSteamIdInput] = useState("");
  const [platformLinks, setPlatformLinks] = useState({ steam: false, epic: false, playstation: false });
  const [syncingPlatform, setSyncingPlatform] = useState(null);
  const [expandedDescriptions, setExpandedDescriptions] = useState({});

  const text = translations[lang];

  const toggleDescription = (gameId) => {
    setExpandedDescriptions(prev => ({ ...prev, [gameId]: !prev[gameId] }));
  };

  const closeReviews = () => {
    setShowReviews(false);
    setReviewsGame(null);
  };

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  useEffect(() => {
    localStorage.setItem("nexplay_theme", theme);
    document.body.style.backgroundColor = theme === "dark" ? "#0a0a0f" : theme === "light" ? "#f5f5f5" : window.matchMedia("(prefers-color-scheme: dark)").matches ? "#0a0a0f" : "#f5f5f5";
  }, [theme]);

  useEffect(() => localStorage.setItem("nexplay_lang", lang), [lang]);
  useEffect(() => localStorage.setItem("nexplay_sound", soundEnabled), [soundEnabled]);

  useEffect(() => {
    const savedPlaylists = localStorage.getItem("nexplay_playlists");
    if (savedPlaylists) setPlaylists(JSON.parse(savedPlaylists));
    const savedWishlist = localStorage.getItem("nexplay_wishlist");
    if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
    const savedTags = localStorage.getItem("nexplay_tags");
    if (savedTags) setCustomTags(JSON.parse(savedTags));
    const savedJournal = localStorage.getItem("nexplay_journal");
    if (savedJournal) setGameJournal(JSON.parse(savedJournal));
  }, []);

  useEffect(() => {
    localStorage.setItem("nexplay_playlists", JSON.stringify(playlists));
    localStorage.setItem("nexplay_wishlist", JSON.stringify(wishlist));
    localStorage.setItem("nexplay_tags", JSON.stringify(customTags));
    localStorage.setItem("nexplay_journal", JSON.stringify(gameJournal));
  }, [playlists, wishlist, customTags, gameJournal]);

  const createPlaylist = () => {
    if (!newPlaylistName.trim()) return;
    setPlaylists([...playlists, { id: Date.now(), name: newPlaylistName, games: [] }]);
    setNewPlaylistName("");
    setShowCreatePlaylist(false);
  };

  const addToPlaylist = (playlistId, game) => {
    setPlaylists(playlists.map(p => 
      p.id === playlistId && !p.games.find(g => g.id === game.id) 
        ? { ...p, games: [...p.games, game] } 
        : p
    ));
  };

  const removeFromPlaylist = (playlistId, gameId) => {
    setPlaylists(playlists.map(p => 
      p.id === playlistId ? { ...p, games: p.games.filter(g => g.id !== gameId) } : p
    ));
  };

  const deletePlaylist = (playlistId) => {
    setPlaylists(playlists.filter(p => p.id !== playlistId));
  };

  const spinGameNight = () => {
    setSpinning(true);
    let pool = [...gamesWithData, ...MANUAL_HIDDEN_GEMS];
    if (gameNightFilters.excludeMultiplayer) {
      pool = pool.filter(g => !g.genre?.includes("Multiplayer") && !g.genre?.includes("Co-op"));
    }
    pool = pool.filter(g => (g.finalRating || g.rating) >= gameNightFilters.minRating);
    if (gameNightFilters.maxPlaytime) {
      const maxHours = parseInt(gameNightFilters.maxPlaytime);
      pool = pool.filter(g => {
        const hours = parseInt(g.playtime?.match(/\d+/)?.[0]) || 0;
        return hours <= maxHours;
      });
    }
    if (pool.length === 0) pool = [...gamesWithData, ...MANUAL_HIDDEN_GEMS];
    setTimeout(() => {
      const random = pool[Math.floor(Math.random() * pool.length)];
      setSpinResult(random);
      setSpinning(false);
    }, 500);
  };

  useEffect(() => {
    if (library.length > 0 && user) {
      const newActivity = {
        id: Date.now(),
        type: "library_update",
        message: `${userData?.username} hat ${library.length} Spiele in der Bibliothek`,
        timestamp: new Date().toISOString()
      };
      setActivityFeed(prev => [newActivity, ...prev].slice(0, 20));
    }
  }, [library.length, user, userData]);

  const addActivity = (type, gameName) => {
    const newActivity = {
      id: Date.now(),
      type: type,
      message: `${userData?.username} hat ${gameName} ${type === "add" ? "hinzugefügt" : type === "completed" ? "abgeschlossen" : "gespielt"}`,
      timestamp: new Date().toISOString()
    };
    setActivityFeed(prev => [newActivity, ...prev].slice(0, 20));
  };

  const getBacklogRecommendation = () => {
    const unplayed = library.filter(g => g.status !== "completed" && g.status !== "playing");
    if (unplayed.length === 0) return "Keine Spiele im Backlog! 🎉";
    const sorted = [...unplayed].sort((a, b) => (b.finalRating || b.rating) - (a.finalRating || a.rating));
    return sorted[0];
  };

  const exportLibrary = () => {
    setLoadingAction(true);
    setTimeout(() => {
      const data = { library, favorites, wishlist, playlists, customTags, gameJournal };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `nexplay_backup_${new Date().toISOString().slice(0, 19)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setLoadingAction(false);
    }, 500);
  };

  const importLibrary = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setLoadingAction(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.library) setLibrary(data.library);
        if (data.favorites) setFavorites(data.favorites);
        if (data.wishlist) setWishlist(data.wishlist);
        if (data.playlists) setPlaylists(data.playlists);
        if (data.customTags) setCustomTags(data.customTags);
        if (data.gameJournal) setGameJournal(data.gameJournal);
        alert("Import erfolgreich!");
      } catch (err) { alert("Fehler beim Import"); }
      setLoadingAction(false);
    };
    reader.readAsText(file);
  };

  const addToWishlist = (game) => {
    if (wishlist.find(g => g.id === game.id)) return;
    setWishlist([...wishlist, game]);
    alert(`${game.name} zur Wunschliste hinzugefügt!`);
  };

  const addTag = (gameId, tag) => {
    if (!tag.trim()) return;
    setCustomTags(prev => ({
      ...prev,
      [gameId]: [...(prev[gameId] || []), tag.trim()]
    }));
  };

  const removeTag = (gameId, tagIndex) => {
    setCustomTags(prev => ({
      ...prev,
      [gameId]: prev[gameId].filter((_, i) => i !== tagIndex)
    }));
  };

  const saveJournalNote = (gameId, note) => {
    setGameJournal(prev => ({
      ...prev,
      [gameId]: note
    }));
  };

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
          img: game.background_image,
          developer: game.developers?.[0]?.name || "Unknown",
          mood: game.tags?.slice(0,1).map(t => translateGenre(t.name))[0] || "Action",
          description: game.description_raw || "",
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
    } catch (error) { console.error(error); } finally { setGamesLoading(false); }
  };

  useEffect(() => { fetchGamesFromRAWG(); }, []);

  const fetchSteamRatings = async (appIds) => {
    const validIds = appIds.filter(id => id && !steamGamesCache[id]);
    if (validIds.length === 0) return;
    try {
      await Promise.all(validIds.map(appId =>
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
          }).catch(() => {})
      ));
    } catch (error) { console.error(error); }
  };

  const gamesWithData = useMemo(() => {
    const steamAppIds = allGames.map(g => g.steamId).filter(id => id && typeof id === "number");
    if (steamAppIds.length > 0) fetchSteamRatings(steamAppIds);
    return allGames.map(game => {
      const steamData = game.steamId ? steamGamesCache[game.steamId] : null;
      const finalRating = calculateWeightedRating(game, steamData);
      const reviewCount = steamData?.reviewCount || (game.popularity * 1000) || 5000;
      const finalImg = getGameImage(game.img, game.name, steamData);
      return { ...game, finalRating, finalImg, finalDescription: generateLongDescription(game.name, game.description), finalTrailer: getTrailerUrl(game), reviewCount };
    });
  }, [allGames]);

  const HIDDEN_GEMS_GAMES = useMemo(() => {
    const rawgGems = gamesWithData.filter(g => g.finalRating >= 8.5 && g.reviewCount < 20000 && g.genre === "Indie").slice(0, 10);
    const manualGemsWithRating = MANUAL_HIDDEN_GEMS.map(g => ({ ...g, finalRating: calculateWeightedRating(g, null), finalImg: g.img, finalDescription: generateLongDescription(g.name, "") }));
    const allGems = [...rawgGems, ...manualGemsWithRating];
    return allGems.filter((g, index, self) => index === self.findIndex(g2 => g2.name === g.name)).sort((a, b) => b.finalRating - a.finalRating).slice(0, 30);
  }, [gamesWithData]);

  const TOP_PICKS_GAMES = useMemo(() => {
    const modernGames = gamesWithData.filter(g => g.year >= 2020 && g.finalRating >= 8.5);
    if (modernGames.length >= 12) return modernGames.slice(0, 20);
    const allHighRated = gamesWithData.filter(g => g.finalRating >= 8.8);
    return [...modernGames, ...allHighRated].slice(0, 20);
  }, [gamesWithData]);

  const BEST_EVER_GAMES = useMemo(() => {
    const sorted = [...gamesWithData].sort((a, b) => {
      if (b.finalRating !== a.finalRating) return b.finalRating - a.finalRating;
      return b.year - a.year;
    });
    return sorted.slice(0, 40);
  }, [gamesWithData]);

  const searchAOTY = () => {
    const search = aotySearch.trim().toLowerCase();
    if (!search) { setAotyResult(null); setSelectedAotyYear(null); return; }
    const yearMatch = search.match(/^\d{4}$/);
    if (yearMatch) {
      const year = parseInt(search);
      if (AOTY_DATA[year]) { setAotyResult({ type: "year", year, data: AOTY_DATA[year] }); setSelectedAotyYear(year); }
      else setAotyResult({ type: "error", message: `No data for ${year}` });
      return;
    }
    for (const [year, data] of Object.entries(AOTY_DATA)) {
      if (data.tga?.winner?.toLowerCase().includes(search)) {
        setAotyResult({ type: "game", year, game: data.tga.winner, category: "tga", data });
        setSelectedAotyYear(year);
        return;
      }
    }
    setAotyResult({ type: "error", message: "Game not found" });
  };

  useEffect(() => { searchAOTY(); }, [aotySearch]);

  const top20ByGenre = useMemo(() => {
    let filtered = gamesWithData.filter(g => {
      if (!g.genre) return false;
      return g.genre.toLowerCase() === selectedGenreForTop.toLowerCase();
    });
    
    const sorted = [...filtered].sort((a, b) => {
      if (b.finalRating !== a.finalRating) return b.finalRating - a.finalRating;
      return b.year - a.year;
    });
    
    return sorted.slice(0, 20);
  }, [gamesWithData, selectedGenreForTop]);

  const doRandom = () => {
    setLoadingAction(true);
    setTimeout(() => {
      let pool = [...gamesWithData, ...MANUAL_HIDDEN_GEMS];
      if (randomExcludeHorror) pool = pool.filter(g => g.mood !== "Horror" && g.genre !== "Horror");
      if (randomExcludeIndie) pool = pool.filter(g => g.genre !== "Indie");
      if (randomExcludeOld) pool = pool.filter(g => g.year >= 2015);
      if (randomYear !== "all") {
        const yearNum = parseInt(randomYear);
        pool = pool.filter(g => g.year === yearNum);
      }
      pool = pool.filter(g => (g.finalRating || g.rating) >= randomMinRating);
      if (randomMode === "genre" && pool.length) {
        const randomGenre = pool[Math.floor(Math.random() * pool.length)].genre;
        pool = pool.filter(g => g.genre === randomGenre);
      }
      if (randomMode === "mood" && pool.length) {
        const randomMood = pool[Math.floor(Math.random() * pool.length)].mood;
        pool = pool.filter(g => g.mood === randomMood);
      }
      if (!pool.length) pool = [...gamesWithData, ...MANUAL_HIDDEN_GEMS];
      setRandomGame(pool[Math.floor(Math.random() * pool.length)]);
      setShowRandomModal(true);
      setLoadingAction(false);
    }, 500);
  };

  const playSound = (type) => {
    if (!soundEnabled || !audioInitialized) return;
    const audio = new Audio();
    const soundUrl = type === "click" 
      ? "https://www.soundjay.com/misc/sounds/button-click-1.mp3" 
      : "https://www.soundjay.com/misc/sounds/notification-1.mp3";
    audio.src = soundUrl;
    audio.volume = 0.2;
    audio.play().catch(() => {});
  };

  const initAudio = () => {
    if (!audioInitialized && soundEnabled) {
      setAudioInitialized(true);
      const audio = new Audio();
      audio.volume = 0.01;
      audio.play().then(() => audio.pause()).catch(() => {});
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const cloudLibrary = await loadLibraryFromFirestore(firebaseUser.uid);
          setLibrary(cloudLibrary.length ? cloudLibrary : []);
          const profile = await loadProfileFromFirestore(firebaseUser.uid);
          setUserData(profile);
          if (profile?.favorites) setFavorites(profile.favorites);
          if (profile?.platformLinks) setPlatformLinks(profile.platformLinks);
          if (profile?.wishlist) setWishlist(profile.wishlist);
          if (profile?.activityFeed) setActivityFeed(profile.activityFeed);
        } catch (err) { console.error(err); }
      } else { setUser(null); setUserData(null); setLibrary([]); setFavorites([]); }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => { if (user && library.length) saveLibraryToFirestore(user.uid, library); }, [library, user]);
  useEffect(() => { if (user && favorites) saveProfileToFirestore(user.uid, { favorites }); }, [favorites, user]);
  useEffect(() => { if (user && platformLinks) saveProfileToFirestore(user.uid, { platformLinks }); }, [platformLinks, user]);
  useEffect(() => { if (user && wishlist) saveProfileToFirestore(user.uid, { wishlist }); }, [wishlist, user]);
  useEffect(() => { if (user && activityFeed) saveProfileToFirestore(user.uid, { activityFeed }); }, [activityFeed, user]);

  const handleLogin = async () => {
    if (!email || !password) { setErrorMsg("Email and password required"); return; }
    setLoadingAction(true);
    const result = await loginWithEmail(email, password);
    if (result && !result.error) { setShowLoginModal(false); setEmail(""); setPassword(""); playSound("login"); }
    else { setErrorMsg(result?.error || "Login failed"); }
    setLoadingAction(false);
  };

  const handleRegister = async () => {
    if (!email || !password) { setErrorMsg("Email and password required"); return; }
    if (password.length < 6) { setErrorMsg("Password must be at least 6 characters"); return; }
    setLoadingAction(true);
    const username = email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "");
    const result = await registerWithEmail(email, password, username);
    if (result.user) { setShowLoginModal(false); setEmail(""); setPassword(""); playSound("login"); }
    else { setErrorMsg(result.error || "Registration failed"); }
    setLoadingAction(false);
  };

  const handleSearchUsers = async () => {
    if (!searchUsersTerm.trim()) return;
    setSearchingUsers(true);
    const results = await searchUsers(searchUsersTerm);
    setFoundUsers(results);
    setSearchingUsers(false);
  };

  const handleSteamLogin = async () => {
    if (!steamIdInput.trim()) { alert("Please enter your Steam ID"); return; }
    setSyncingPlatform("steam");
    try {
      const response = await fetch(`/api/steam?action=getGames&steamId=${steamIdInput.trim()}`);
      const data = await response.json();
      if (data.response?.games) {
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
        alert(`✅ ${importedCount} von ${steamGames.length} Steam games imported!`);
      } else { alert("No games found. Make sure your Steam profile is public."); }
    } catch (err) { alert("Error fetching Steam games."); }
    finally { setSyncingPlatform(null); }
  };

  const handleUpdateProfile = async () => {
    setLoadingAction(true);
    if (editUsername && editUsername !== userData?.username) {
      const result = await updateUsername(user.uid, editUsername, userData?.username);
      if (result.error) { setEditError(result.error); setLoadingAction(false); return; }
      setUserData({ ...userData, username: editUsername });
    }
    if (editBio !== userData?.bio) { await updateBio(user.uid, editBio); setUserData({ ...userData, bio: editBio }); }
    if (editPrivate !== userData?.isPrivate) { await togglePrivacy(user.uid, editPrivate); setUserData({ ...userData, isPrivate: editPrivate }); }
    setEditSuccess("Profile updated!");
    setTimeout(() => setShowEditModal(false), 1500);
    setLoadingAction(false);
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
    setLoadingAction(true);
    const fullGame = [...gamesWithData, ...MANUAL_HIDDEN_GEMS].find(g => g.id === game.id) || game;
    setSelectedGameDetail(fullGame);
    const reviews = await getGameReviews(fullGame.id);
    setGameDetailReviews(reviews);
    setCurrentTab("gameDetail");
    setLoadingAction(false);
  };

  const closeGameDetail = () => { setSelectedGameDetail(null); setCurrentTab("home"); };

  const submitGameDetailReview = async () => {
    if (reviewRating === 0) { alert("Please give a rating"); return; }
    setLoadingAction(true);
    await addGameReview(user.uid, selectedGameDetail.id, selectedGameDetail.name, reviewRating, reviewComment);
    setGameDetailReviews(await getGameReviews(selectedGameDetail.id));
    setReviewRating(0); setReviewComment("");
    playSound("add");
    setLoadingAction(false);
  };

  const handleLikeReview = async (reviewId) => {
    if (!user) return;
    setLoadingAction(true);
    await likeReview(reviewId, user.uid);
    setGameDetailReviews(await getGameReviews(selectedGameDetail.id));
    setLoadingAction(false);
  };

  const handleDislikeReview = async (reviewId) => {
    if (!user) return;
    setLoadingAction(true);
    await dislikeReview(reviewId, user.uid);
    setGameDetailReviews(await getGameReviews(selectedGameDetail.id));
    setLoadingAction(false);
  };

  const markAsPlayed = async (game) => {
    setLoadingAction(true);
    await updateLastPlayed(user.uid, game.id, game.name, game.img);
    setUserData(await loadProfileFromFirestore(user.uid));
    playSound("add");
    addActivity("played", game.name);
    setLoadingAction(false);
  };

  const addToLibrary = async (game) => {
    if (library.find(g => g.id === game.id)) return;
    setLoadingAction(true);
    setLibrary([...library, { ...game, status: "wishlist", dateAdded: new Date().toISOString() }]);
    playSound("add");
    addActivity("add", game.name);
    setLoadingAction(false);
  };

  const removeFromLibrary = (id) => setLibrary(library.filter(g => g.id !== id));
  
  const updateStatus = async (id, status, game) => {
    setLoadingAction(true);
    setLibrary(library.map(g => g.id === id ? { ...g, status } : g));
    if (status === "completed") {
      await updateLastPlayed(user.uid, id, game.name, game.img);
      setUserData(await loadProfileFromFirestore(user.uid));
      addActivity("completed", game.name);
    }
    playSound("click");
    setLoadingAction(false);
  };
  
  const toggleFavorite = (id) => setFavorites(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

  const handleAiSearch = async () => {
    if (!aiQuery.trim()) return;
    setIsAiLoading(true);
    setTimeout(() => {
      const recommendations = [...gamesWithData, ...MANUAL_HIDDEN_GEMS].filter(g => (g.finalRating || g.rating) >= 8.5).sort(() => 0.5 - Math.random()).slice(0, 5).map(g => g.name).join(", ");
      setAiResponse(`🎮 Based on "${aiQuery}": ${recommendations || "The Witcher 3, Red Dead Redemption 2, Baldur's Gate 3"}`);
      setIsAiLoading(false);
    }, 1000);
  };

  const getBuyLinks = (game) => [
    { name: "Steam", url: `https://store.steampowered.com/search/?term=${encodeURIComponent(game.name)}`, icon: <FaSteam />, color: colors.steam },
    { name: "Amazon", url: `https://www.amazon.de/s?k=${encodeURIComponent(game.name)}`, icon: <FaShoppingCart />, color: colors.amazon },
    { name: "Loaded", url: `https://www.loaded.com/de_de/search?q=${encodeURIComponent(game.name)}`, icon: <FaExternalLinkAlt />, color: colors.loaded }
  ];

  const filteredCategoryGames = (games) => {
    let filtered = [...games];
    if (categoryFilter.genre) filtered = filtered.filter(g => g.genre === categoryFilter.genre);
    if (categoryFilter.minRating > 0) filtered = filtered.filter(g => (g.finalRating || g.rating) >= categoryFilter.minRating);
    if (categoryFilter.year > 0) filtered = filtered.filter(g => g.year >= categoryFilter.year);
    return filtered;
  };

  const results = useMemo(() => {
    let list = gamesWithData.map(g => ({ ...g, score: (selectedMoods.includes(g.mood) ? 40 : 20) + (selectedGenres.includes(g.genre) ? 40 : 20) + (selectedPlaytime === g.playtime ? 20 : 0) + ((g.finalRating || g.rating) * 2) }));
    if (searchQuery) list = list.filter(g => g.name.toLowerCase().includes(searchQuery.toLowerCase()));
    if (sortBy === "score") list.sort((a,b) => b.score - a.score);
    else if (sortBy === "rating") list.sort((a,b) => (b.finalRating || b.rating) - (a.finalRating || a.rating));
    else if (sortBy === "year") list.sort((a,b) => b.year - a.year);
    return list;
  }, [selectedMoods, selectedGenres, selectedPlaytime, searchQuery, sortBy, gamesWithData]);

  const topPicks = results.slice(0, 8);
  const restResults = results.slice(3);
  const toggle = (arr, setArr, val) => setArr(prev => prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val]);

  const profileStats = useMemo(() => {
    if (!library.length) return { topRated: null, topGenre: null, totalPlaytime: 0, avgRating: 0 };
    const allGamesList = [...gamesWithData, ...MANUAL_HIDDEN_GEMS];
    const gamesWithRatings = library.map(libGame => ({ ...libGame, finalRating: allGamesList.find(g => g.id === libGame.id)?.finalRating || allGamesList.find(g => g.id === libGame.id)?.rating || 7.0 }));
    const topRated = [...gamesWithRatings].sort((a,b) => b.finalRating - a.finalRating)[0];
    const genreCount = {};
    library.forEach(g => genreCount[g.genre] = (genreCount[g.genre] || 0) + 1);
    const topGenre = Object.entries(genreCount).sort((a,b) => b[1] - a[1])[0]?.[0] || "None";
    const totalPlaytime = library.reduce((sum, g) => sum + (parseInt(g.playtime?.match(/\d+/)?.[0]) || 0), 0);
    const avgRating = gamesWithRatings.reduce((sum, g) => sum + g.finalRating, 0) / gamesWithRatings.length;
    return { topRated, topGenre, totalPlaytime, avgRating: avgRating.toFixed(1) };
  }, [library, gamesWithData]);

  const achievements = useMemo(() => {
    const ach = [];
    if (library.length >= 1) ach.push({ id: "first", name: text.firstGame, desc: "First game added", icon: "🏅", unlocked: true });
    if (library.length >= 10) ach.push({ id: "collector", name: text.collector, desc: "10 games", icon: "🎮", unlocked: true });
    if (library.filter(g => g.status === "completed").length >= 5) ach.push({ id: "completionist", name: text.completionist, desc: "5 completed", icon: "✅", unlocked: true });
    if (favorites.length >= 5) ach.push({ id: "favorites", name: "5 Favorites", desc: "5 games in favorites", icon: "❤️", unlocked: true });
    if (library.length >= 25) ach.push({ id: "master", name: "Game Master", desc: "25 games", icon: "👑", unlocked: true });
    if (gameDetailReviews.length >= 10) ach.push({ id: "critic", name: "The Critic", desc: "Wrote 10 reviews", icon: "✍️", unlocked: true });
    if (library.filter(g => g.playtime === "100h+").length >= 3) ach.push({ id: "grinder", name: "The Grinder", desc: "3 games with 100+ hours", icon: "🕰️", unlocked: true, funny: true });
    if (playlists.length >= 3) ach.push({ id: "curator", name: "The Curator", desc: "Created 3 playlists", icon: "📚", unlocked: true });
    if (wishlist.length >= 5) ach.push({ id: "wisher", name: "The Wisher", desc: "5 games on wishlist", icon: "⭐", unlocked: true });
    if (Object.keys(customTags).length >= 3) ach.push({ id: "tagger", name: "The Tagger", desc: "Added 3 custom tags", icon: "🏷️", unlocked: true });
    return ach;
  }, [library, favorites, gameDetailReviews, playlists, wishlist, customTags]);

  const currentColors = theme === "dark" ? colors : theme === "light" ? { ...colors, bg: "#ffffff", bgCard: "#f0f0f0", text: "#000000", textSecondary: "#333333", textMuted: "#666666" } : colors;

  const animationStyles = `
    @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes slideIn { from { opacity: 0; transform: translateY(-50px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes spin { to { transform: rotate(360deg); } }
    .fade-in { animation: fadeIn 0.4s ease-out; }
    .slide-in { animation: slideIn 0.3s ease-out; }
    .game-card { transition: all 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1); cursor: pointer; background: ${currentColors.bgCard}; border-radius: 16px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08); }
    .game-card:hover { transform: translateY(-8px) scale(1.02); box-shadow: 0 20px 30px -12px rgba(0,0,0,0.5); border-color: ${currentColors.primary}40; }
    .btn-click:active { transform: scale(0.96); }
    .spinning-wheel { animation: spin 0.5s ease-out; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .text-wrap { word-wrap: break-word; overflow-wrap: break-word; white-space: normal; }
    .expandable-text { transition: all 0.3s ease; }
    @media (max-width: 768px) {
      .desktop-only { display: none !important; }
      .hamburger-btn { display: flex !important; }
      .main-tabs-desktop { display: none !important; }
      .compare-grid { grid-template-columns: 1fr !important; gap: 16px !important; }
    }
    @media (min-width: 769px) {
      .hamburger-btn { display: none !important; }
      .main-tabs-desktop { display: flex !important; }
      .mobile-menu-overlay { display: none !important; }
    }
  `;

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = animationStyles;
    document.head.appendChild(style);
  }, [currentColors]);

  const styles = {
    app: { background: currentColors.bg, minHeight: "100vh", width: "100%", color: currentColors.text, fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" },
    container: { maxWidth: 1200, margin: "0 auto", padding: "0 16px" },
    header: { padding: "16px 0", borderBottom: `1px solid rgba(255,212,0,0.15)`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 },
    logo: { fontSize: 22, fontWeight: 800, display: "flex", alignItems: "center", gap: 10, cursor: "pointer" },
    logoIcon: { background: `linear-gradient(135deg, ${currentColors.primary} 0%, ${currentColors.primaryDark} 100%)`, borderRadius: "12px", padding: "8px 10px", color: currentColors.bg, display: "flex", alignItems: "center", gap: 6 },
    logoIconText: { fontSize: 18 },
    logoText: { background: `linear-gradient(135deg, ${currentColors.primary} 0%, ${currentColors.primaryDark} 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontSize: 20 },
    mainTabs: { display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" },
    mainTab: (active) => ({ background: active ? currentColors.primary : "rgba(255,255,255,0.06)", border: "none", borderRadius: 12, padding: "10px 18px", color: active ? currentColors.bg : currentColors.text, cursor: "pointer", fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", gap: 8 }),
    iconBtn: { background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 12, padding: "10px 14px", color: currentColors.text, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontSize: 14 },
    loginBtn: { background: "linear-gradient(135deg, #4285f4, #3367d6)", border: "none", borderRadius: 12, padding: "10px 18px", color: "#fff", cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: 8, fontSize: 14 },
    logoutBtn: { background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 12, padding: "10px 18px", color: currentColors.text, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontSize: 14 },
    userAvatar: { width: 36, height: 36, borderRadius: "50%", background: currentColors.primary, display: "flex", alignItems: "center", justifyContent: "center", color: currentColors.bg, fontWeight: 700, fontSize: 16 },
    hamburgerBtn: { background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 12, padding: "10px 14px", color: currentColors.text, cursor: "pointer", alignItems: "center", gap: 8, fontSize: 20, display: "none" },
    mobileMenu: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: currentColors.bg, zIndex: 1000, padding: "20px", overflowY: "auto", transform: mobileMenuOpen ? "translateX(0)" : "translateX(-100%)", transition: "transform 0.3s ease" },
    mobileMenuClose: { position: "absolute", top: 16, right: 16, background: "rgba(255,255,255,0.1)", border: "none", borderRadius: "50%", padding: "10px", cursor: "pointer", color: currentColors.text },
    mobileMenuItem: { display: "flex", alignItems: "center", gap: 12, padding: "14px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", width: "100%", background: "none", border: "none", color: currentColors.text, fontSize: 16, cursor: "pointer" },
    tabNav: { display: "flex", gap: 4, borderBottom: `1px solid rgba(255,255,255,0.08)`, marginTop: 20, marginBottom: 20, overflowX: "auto", flexWrap: "nowrap" },
    tabNavBtn: (active) => ({ background: "none", border: "none", borderBottom: active ? `2px solid ${currentColors.primary}` : "2px solid transparent", color: active ? currentColors.primary : currentColors.textSecondary, padding: "10px 16px", cursor: "pointer", fontSize: 12, fontWeight: active ? 600 : 400, whiteSpace: "nowrap" }),
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 20 },
    gameCard: { background: currentColors.bgCard, borderRadius: 16, overflow: "hidden", cursor: "pointer", border: "1px solid rgba(255,255,255,0.08)", transition: "all 0.3s ease", position: "relative" },
    gameImg: { width: "100%", aspectRatio: "3/4", objectFit: "cover" },
    gameInfo: { padding: "12px" },
    gameName: { fontSize: 14, fontWeight: 700, marginBottom: 4, color: currentColors.text, wordWrap: "break-word", whiteSpace: "normal", lineHeight: 1.3 },
    rating: { display: "flex", alignItems: "center", gap: 4, color: currentColors.primary, fontSize: 12, fontWeight: 600, marginBottom: 6 },
    addBtn: { background: currentColors.primary, border: "none", borderRadius: 10, padding: "8px 10px", fontSize: 12, fontWeight: 600, cursor: "pointer", width: "100%", marginTop: 8, color: currentColors.bg, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 },
    searchBar: { background: currentColors.bgCard, border: `1px solid rgba(255,255,255,0.08)`, borderRadius: 12, padding: "12px 16px", color: currentColors.text, fontSize: 14, width: "100%", marginBottom: 20, outline: "none" },
    pillGrid: { display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 24 },
    pill: (selected) => ({ background: selected ? currentColors.primary : "rgba(255,255,255,0.06)", border: "none", borderRadius: 30, padding: "10px 18px", color: selected ? currentColors.bg : currentColors.text, cursor: "pointer", fontSize: 13, fontWeight: selected ? 600 : 400 }),
    nextBtn: { background: currentColors.primary, border: "none", borderRadius: 12, padding: "12px 24px", fontSize: 15, fontWeight: 600, cursor: "pointer", color: currentColors.bg, marginTop: 24, width: "100%" },
    filterRow: { display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20, alignItems: "center" },
    filterBtn: (active) => ({ background: active ? currentColors.primary : "rgba(255,255,255,0.05)", border: "none", borderRadius: 8, padding: "6px 12px", color: active ? currentColors.bg : currentColors.text, cursor: "pointer", fontSize: 12 }),
    sectionTitle: { fontSize: 20, fontWeight: 700, marginBottom: 16, display: "flex", alignItems: "center", gap: 10, color: currentColors.text },
    topPicksRow: { display: "flex", gap: 12, overflowX: "auto", marginBottom: 24, paddingBottom: 8 },
    topPickCard: { minWidth: 160, background: currentColors.bgCard, borderRadius: 12, padding: 10, cursor: "pointer", position: "relative" },
    libraryCard: { background: currentColors.bgCard, borderRadius: 12, display: "flex", gap: 12, padding: 12, marginBottom: 12, alignItems: "center", flexWrap: "wrap" },
    libraryImg: { width: 50, height: 67, objectFit: "cover", borderRadius: 8 },
    libraryInfo: { flex: 1, minWidth: 150 },
    libraryTitle: { fontWeight: 700, fontSize: 14, color: currentColors.text, marginBottom: 4, wordWrap: "break-word" },
    libraryMeta: { fontSize: 11, color: currentColors.textSecondary, marginBottom: 6 },
    libraryActions: { display: "flex", gap: 8, flexWrap: "wrap" },
    select: { background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 8, padding: "6px 10px", color: currentColors.text, fontSize: 12, cursor: "pointer" },
    statCard: { background: currentColors.bgCard, borderRadius: 12, padding: "12px", textAlign: "center", minWidth: 80, flex: 1 },
    statNumber: { fontSize: 24, fontWeight: 800, color: currentColors.primary },
    statLabel: { fontSize: 10, color: currentColors.textSecondary, marginTop: 4 },
    statsRow: { display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" },
    profileHeader: { display: "flex", gap: 16, alignItems: "center", background: currentColors.bgCard, borderRadius: 20, padding: 20, marginBottom: 24, flexWrap: "wrap", justifyContent: "center", textAlign: "center" },
    profileAvatarLarge: { width: 70, height: 70, borderRadius: "50%", background: currentColors.primary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, fontWeight: 700, color: currentColors.bg },
    editBtn: { background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 8, padding: "8px 16px", color: currentColors.text, cursor: "pointer", fontSize: 12, marginTop: 12, display: "inline-flex", alignItems: "center", gap: 6 },
    lastPlayedRow: { display: "flex", gap: 12, overflowX: "auto", marginBottom: 20, paddingBottom: 8 },
    lastPlayedCard: { minWidth: 70, background: currentColors.bgCard, borderRadius: 10, padding: 8, textAlign: "center", cursor: "pointer" },
    lastPlayedImg: { width: 54, height: 54, objectFit: "cover", borderRadius: 8, marginBottom: 4 },
    lastPlayedName: { fontSize: 9, color: currentColors.text, fontWeight: 500, wordWrap: "break-word" },
    randomFilterSection: { background: currentColors.bgCard, borderRadius: 14, padding: 16, marginBottom: 20 },
    randomFilterTitle: { fontSize: 14, fontWeight: 600, color: currentColors.text, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 },
    randomFilterRow: { display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" },
    randomCheckbox: { display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 12, color: currentColors.textSecondary },
    randomSlider: { width: 180, accentColor: currentColors.primary },
    randomSelect: { background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 8, padding: "6px 10px", color: currentColors.text, fontSize: 12, cursor: "pointer" },
    aiSection: { background: currentColors.bgCard, borderRadius: 14, padding: 16, marginBottom: 20 },
    aiRow: { display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" },
    aiResultBox: { background: "rgba(0,0,0,0.3)", borderRadius: 12, padding: 14, marginTop: 14, fontSize: 13, color: currentColors.textSecondary, lineHeight: 1.5 },
    platformSection: { background: currentColors.bgCard, borderRadius: 14, padding: 16, marginBottom: 20 },
    platformRow: { display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 12 },
    platformBtn: (bgColor) => ({ background: bgColor, border: "none", borderRadius: 10, padding: "8px 14px", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 500 }),
    modalOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.96)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" },
    modalContent: { background: currentColors.bgCard, borderRadius: 24, padding: 24, width: "95%", maxWidth: 480, border: `1px solid ${currentColors.primary}30`, maxHeight: "90vh", overflowY: "auto" },
    modalTitle: { fontSize: 22, fontWeight: 700, marginBottom: 20, textAlign: "center", color: currentColors.text },
    input: { width: "100%", background: "rgba(255,255,255,0.08)", border: `1px solid rgba(255,255,255,0.1)`, borderRadius: 10, padding: "12px 14px", color: currentColors.text, fontSize: 14, marginBottom: 14, outline: "none" },
    textarea: { width: "100%", background: "rgba(255,255,255,0.08)", border: `1px solid rgba(255,255,255,0.1)`, borderRadius: 10, padding: "12px 14px", color: currentColors.text, fontSize: 14, marginBottom: 14, outline: "none", resize: "vertical", fontFamily: "inherit" },
    passwordWrapper: { position: "relative", width: "100%" },
    passwordEye: { position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", cursor: "pointer", color: currentColors.textSecondary },
    modalBtn: { background: currentColors.primary, border: "none", borderRadius: 12, padding: "12px", fontSize: 15, fontWeight: 600, cursor: "pointer", width: "100%", marginTop: 10, color: currentColors.bg },
    modalBtnSecondary: { background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 12, padding: "12px", fontSize: 15, fontWeight: 600, cursor: "pointer", width: "auto", color: currentColors.text },
    switchText: { textAlign: "center", marginTop: 14, color: currentColors.textSecondary, fontSize: 13, cursor: "pointer" },
    errorText: { color: colors.error, fontSize: 12, textAlign: "center", marginBottom: 12 },
    successText: { color: colors.success, fontSize: 12, textAlign: "center", marginBottom: 12 },
    loadingSpinner: { width: 40, height: 40, border: `3px solid ${currentColors.primary}20`, borderTop: `3px solid ${currentColors.primary}`, borderRadius: "50%", animation: "spin 1s linear infinite" },
    loadingOverlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" },
    emptyState: { textAlign: "center", padding: 40, background: currentColors.bgCard, borderRadius: 20, color: currentColors.textSecondary, fontSize: 14 },
    reviewStars: { display: "flex", gap: 10, justifyContent: "center", marginBottom: 20 },
    reviewStar: { fontSize: 28, cursor: "pointer", color: currentColors.textSecondary },
    reviewCard: { background: currentColors.bgCard, borderRadius: 12, padding: 14, marginBottom: 12 },
    reviewHeader: { display: "flex", justifyContent: "space-between", marginBottom: 8, flexWrap: "wrap", gap: 6 },
    reviewUsername: { fontWeight: 700, fontSize: 13, color: currentColors.text },
    reviewRating: { color: currentColors.primary, fontSize: 12 },
    reviewComment: { fontSize: 13, color: currentColors.textSecondary, lineHeight: 1.4, wordWrap: "break-word" },
    reviewActions: { display: "flex", gap: 14, marginTop: 10 },
    likeBtn: { display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: currentColors.textSecondary, cursor: "pointer", background: "none", border: "none" },
    userCard: { background: currentColors.bgCard, borderRadius: 12, padding: 12, marginBottom: 12, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" },
    userAvatarSmall: { width: 40, height: 40, borderRadius: "50%", background: currentColors.primary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: currentColors.bg },
    searchRow: { display: "flex", gap: 10, marginBottom: 20 },
    gameDetailHeader: { display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 24, flexDirection: window.innerWidth <= 768 ? "column" : "row", alignItems: window.innerWidth <= 768 ? "center" : "flex-start" },
    gameDetailImg: { width: window.innerWidth <= 768 ? "100%" : 200, maxWidth: 200, borderRadius: 16, objectFit: "cover" },
    gameDetailInfo: { flex: 1 },
    gameDetailName: { fontSize: 24, fontWeight: 700, marginBottom: 8, color: currentColors.text, wordWrap: "break-word" },
    gameDetailDeveloper: { fontSize: 13, color: currentColors.textSecondary, marginBottom: 6 },
    gameDetailRating: { fontSize: 14, color: currentColors.primary, marginBottom: 10 },
    gameDetailDescription: { fontSize: 14, color: currentColors.textSecondary, lineHeight: 1.5, marginBottom: 14, wordWrap: "break-word" },
    showMoreBtn: { background: "none", border: "none", color: currentColors.primary, cursor: "pointer", fontSize: 12, marginTop: 8, display: "flex", alignItems: "center", gap: 4 },
    gameDetailPlatforms: { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 },
    platformBadge: { background: "rgba(255,255,255,0.1)", borderRadius: 20, padding: "4px 10px", fontSize: 11, color: currentColors.text },
    buyButtonsRow: { display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 },
    buyBtn: (bgColor) => ({ background: bgColor, border: "none", borderRadius: 8, padding: "8px 14px", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 500 }),
    backBtn: { display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.05)", border: "none", borderRadius: 10, padding: "8px 16px", color: currentColors.text, cursor: "pointer", marginBottom: 20, fontSize: 13 },
    trailerFrame: { width: "100%", height: 220, borderRadius: 14, marginBottom: 20, border: "none", background: "#000" },
    settingsSection: { background: currentColors.bgCard, borderRadius: 14, padding: 16, marginBottom: 20 },
    settingsRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 10 },
    settingsLabel: { fontSize: 14, color: currentColors.text },
    checkbox: { display: "flex", alignItems: "center", gap: 10, marginBottom: 14, cursor: "pointer", fontSize: 13, color: currentColors.textSecondary },
    achievementGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: 10, marginTop: 14 },
    achievementCard: { background: "rgba(0,0,0,0.3)", borderRadius: 10, padding: 10, display: "flex", alignItems: "center", gap: 10 },
    achievementIcon: { fontSize: 24 },
    achievementInfo: { flex: 1 },
    achievementName: { fontSize: 12, fontWeight: 600, color: currentColors.text },
    achievementDesc: { fontSize: 10, color: currentColors.textSecondary },
    donationBtn: { background: "linear-gradient(135deg, #ffd400, #e6bf00)", border: "none", borderRadius: 10, padding: "10px 16px", color: "#0a0a0f", cursor: "pointer", fontWeight: 700, display: "flex", alignItems: "center", gap: 6, fontSize: 13 },
    aotyResultCard: { background: currentColors.bgCard, borderRadius: 20, padding: 20, marginBottom: 20, border: `1px solid ${currentColors.primary}30` },
    aotyWinnerCard: { background: `linear-gradient(135deg, ${currentColors.primary}10, ${currentColors.bgCard})`, borderRadius: 14, padding: 14, marginBottom: 10, cursor: "pointer", display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" },
    gotyBackBtn: { background: "rgba(255,255,255,0.05)", border: "none", borderRadius: 10, padding: "8px 16px", color: currentColors.text, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 16, fontSize: 13 },
    topGenreSelect: { background: currentColors.bgCard, border: `1px solid ${currentColors.primary}30`, borderRadius: 10, padding: "10px 16px", color: currentColors.text, fontSize: 14, marginBottom: 20, cursor: "pointer", width: "100%" },
    aotyYearCard: { background: currentColors.bgCard, borderRadius: 14, padding: 12, textAlign: "center", cursor: "pointer", border: "1px solid rgba(255,255,255,0.05)" },
    playlistCard: { background: currentColors.bgCard, borderRadius: 14, padding: 14, marginBottom: 14, border: `1px solid ${currentColors.primary}20` },
    gameNightCard: { background: currentColors.bgCard, borderRadius: 14, padding: 16, marginBottom: 20, textAlign: "center" },
    activityCard: { background: currentColors.bgCard, borderRadius: 10, padding: 10, marginBottom: 10, display: "flex", alignItems: "center", gap: 10 },
    compareCard: { background: currentColors.bgCard, borderRadius: 20, padding: 20, marginBottom: 24 },
    compareGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 20 },
    compareColumn: { background: "rgba(0,0,0,0.2)", borderRadius: 16, padding: 20 },
    compareHeader: { fontSize: 18, fontWeight: 700, marginBottom: 16, textAlign: "center", paddingBottom: 12, borderBottom: `2px solid ${currentColors.primary}40` },
    compareRow: { display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" },
    compareLabel: { fontWeight: 600, color: currentColors.textSecondary, fontSize: 13 },
    compareValue: { fontWeight: 500, color: currentColors.text, fontSize: 13 },
    journalCard: { background: currentColors.bgCard, borderRadius: 14, padding: 14, marginBottom: 16 },
    tag: { background: "rgba(255,212,0,0.15)", borderRadius: 14, padding: "3px 8px", fontSize: 10, color: currentColors.primary, display: "inline-flex", alignItems: "center", gap: 4 }
  };

  const GameCard = ({ game, showBtn = false }) => {
    const isFavorite = favorites.includes(game.id);
    const inLibrary = library.some(g => g.id === game.id);
    const rating = game.finalRating || game.rating;
    const img = game.finalImg || game.img;
    const tags = customTags[game.id] || [];
    return (
      <div className="game-card" style={styles.gameCard} onClick={() => openGameDetail(game)}>
        <img src={img} style={styles.gameImg} alt={game.name} onError={(e) => { e.target.src = `https://placehold.co/300x400/14141f/ffd400?text=${encodeURIComponent(game.name?.slice(0, 8) || "Game")}`; }} />
        <div style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.7)", borderRadius: 20, padding: "2px 8px", fontSize: 11, fontWeight: 700, color: currentColors.primary }}>★ {rating?.toFixed(1)}</div>
        <button className="btn-click" style={{ position: "absolute", top: 8, left: 8, background: "rgba(0,0,0,0.7)", border: "none", borderRadius: 20, padding: "4px 6px", cursor: "pointer" }} onClick={(e) => { e.stopPropagation(); toggleFavorite(game.id); }}>
          {isFavorite ? <BsFillHeartFill color={currentColors.primary} size={10} /> : <FaHeart color="#fff" size={10} />}
        </button>
        <div style={styles.gameInfo}>
          <div style={styles.gameName}>{game.name}</div>
          <div style={styles.rating}><FaStar size={10} /> {rating?.toFixed(1)}</div>
          <div style={{ fontSize: 10, color: currentColors.textSecondary, marginBottom: 6 }}>{game.playtime}</div>
          {tags.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 3, marginBottom: 6 }}>
              {tags.slice(0, 2).map((tag, i) => <span key={i} style={styles.tag}>{tag}</span>)}
            </div>
          )}
          {showBtn && <button className="btn-click" style={styles.addBtn} onClick={(e) => { e.stopPropagation(); addToLibrary(game); }}>{inLibrary ? <FaCheck size={10} /> : <FaPlus size={10} />} {inLibrary ? text.inLibrary : text.add}</button>}
        </div>
      </div>
    );
  };

  const backlogRecommendation = getBacklogRecommendation();

  if (loading || gamesLoading) {
    return (
      <div style={{ background: currentColors.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
        <div style={styles.loadingSpinner}></div>
        <div style={{ marginTop: 16, color: currentColors.text }}>{text.loading}</div>
      </div>
    );
  }

  if (currentTab === "gameDetail" && selectedGameDetail) {
    const buyLinks = getBuyLinks(selectedGameDetail);
    const journalNote = gameJournal[selectedGameDetail.id] || "";
    const tags = customTags[selectedGameDetail.id] || [];
    const [newTag, setNewTag] = useState("");
    const [journalText, setJournalText] = useState(journalNote);
    const isOnWishlist = wishlist.some(g => g.id === selectedGameDetail.id);
    const fullDescription = selectedGameDetail.finalDescription || generateLongDescription(selectedGameDetail.name, "");
    const isExpanded = expandedDescriptions[selectedGameDetail.id] || false;
    const shortDescription = fullDescription.length > 200 ? fullDescription.substring(0, 200) + "..." : fullDescription;
    
    return (
      <div style={styles.app}>
        <div style={styles.container}>
          <div style={styles.header}>
            <div style={styles.logo} onClick={() => setCurrentTab("home")}>
              <div style={styles.logoIcon}>
                <GiConsoleController size={18} />
                <span style={styles.logoIconText}>NX</span>
              </div>
              <span style={styles.logoText}>NexPlay</span>
            </div>
            <div style={styles.mainTabs}>
              <button className="btn-click" style={styles.iconBtn} onClick={() => setShowSettings(true)}><FaCog size={14} /> <span style={{ display: window.innerWidth <= 768 ? "none" : "inline" }}>{text.settings}</span></button>
              {!user ? <button className="btn-click" style={styles.loginBtn} onClick={() => setShowLoginModal(true)}><FaEnvelope size={14} /> <span style={{ display: window.innerWidth <= 768 ? "none" : "inline" }}>{text.login}</span></button> :
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={styles.userAvatar}>{userData?.username?.charAt(0).toUpperCase()}</div>
                  <button className="btn-click" style={styles.logoutBtn} onClick={logout}><FaSignOutAlt size={14} /> <span style={{ display: window.innerWidth <= 768 ? "none" : "inline" }}>{text.logout}</span></button>
                </div>}
            </div>
          </div>
          <button className="btn-click" style={styles.backBtn} onClick={closeGameDetail}><FaArrowLeft size={12} /> {text.back}</button>
          <div className="fade-in" style={styles.gameDetailHeader}>
            <img src={selectedGameDetail.finalImg || selectedGameDetail.img} style={styles.gameDetailImg} alt={selectedGameDetail.name} />
            <div style={styles.gameDetailInfo}>
              <div style={styles.gameDetailName}>{selectedGameDetail.name}</div>
              <div style={styles.gameDetailDeveloper}>{selectedGameDetail.developer}</div>
              <div style={styles.gameDetailRating}>★ {(selectedGameDetail.finalRating || selectedGameDetail.rating)?.toFixed(1)} · {selectedGameDetail.year} · {selectedGameDetail.playtime}</div>
              <div style={styles.gameDetailDescription}>
                {isExpanded ? fullDescription : shortDescription}
                {fullDescription.length > 200 && (
                  <button className="btn-click" style={styles.showMoreBtn} onClick={() => toggleDescription(selectedGameDetail.id)}>
                    {isExpanded ? <><FaChevronUp size={10} /> {text.showLess}</> : <><FaChevronDown size={10} /> {text.showMore}</>}
                  </button>
                )}
              </div>
              <div style={styles.gameDetailPlatforms}>{selectedGameDetail.platforms?.slice(0, 4).map(p => <span key={p} style={styles.platformBadge}>{p}</span>)}</div>
              <div style={styles.buyButtonsRow}>{buyLinks.map(link => <button key={link.name} className="btn-click" style={styles.buyBtn(link.color)} onClick={() => window.open(link.url, "_blank")}>{link.icon} {link.name}</button>)}</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
                <button className="btn-click" style={{ ...styles.addBtn, width: "auto", padding: "8px 14px" }} onClick={() => addToLibrary(selectedGameDetail)}>+ {text.add}</button>
                <button className="btn-click" style={{ ...styles.addBtn, width: "auto", padding: "8px 14px", background: isOnWishlist ? colors.success : currentColors.primary }} onClick={() => { if (!isOnWishlist) addToWishlist(selectedGameDetail); }}>⭐ {text.addToWishlist}</button>
              </div>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontWeight: 600, marginBottom: 6, fontSize: 13 }}>{text.tags}:</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 6 }}>
                  {tags.map((tag, i) => <span key={i} style={styles.tag}>{tag} <button onClick={() => removeTag(selectedGameDetail.id, i)} style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", marginLeft: 2 }}>✕</button></span>)}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <input style={{ ...styles.input, marginBottom: 0, padding: "8px 10px", fontSize: 12 }} placeholder={text.addTag} value={newTag} onChange={e => setNewTag(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addTag(selectedGameDetail.id, newTag)} />
                  <button className="btn-click" style={{ ...styles.addBtn, width: "auto", padding: "8px 12px" }} onClick={() => addTag(selectedGameDetail.id, newTag)}>+</button>
                </div>
              </div>
              <div style={styles.journalCard}>
                <div style={{ fontWeight: 600, marginBottom: 6, fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}><GiNotebook /> {text.journalNotes}</div>
                <textarea style={{ ...styles.textarea, fontSize: 12, padding: "10px" }} rows="3" placeholder="Write your thoughts..." value={journalText} onChange={e => setJournalText(e.target.value)} onBlur={() => saveJournalNote(selectedGameDetail.id, journalText)} />
              </div>
            </div>
          </div>
          {selectedGameDetail.finalTrailer && <iframe src={selectedGameDetail.finalTrailer} style={styles.trailerFrame} title="Trailer" allowFullScreen />}
          <div className="fade-in">
            <div style={styles.sectionTitle}>{text.writeReview}</div>
            <div style={styles.reviewStars}>{[1,2,3,4,5].map(star => <span key={star} className="btn-click" style={{ ...styles.reviewStar, color: star <= reviewRating ? currentColors.primary : currentColors.textSecondary }} onClick={() => setReviewRating(star)}>★</span>)}</div>
            <textarea style={styles.textarea} placeholder={text.yourReview} rows="2" value={reviewComment} onChange={e => setReviewComment(e.target.value)} />
            <button className="btn-click" style={styles.modalBtn} onClick={submitGameDetailReview}>{text.submit}</button>
          </div>
          <div className="fade-in" style={{ marginTop: 24 }}>
            <div style={styles.sectionTitle}>{text.reviews} ({gameDetailReviews.length})</div>
            {gameDetailReviews.length === 0 ? <div style={styles.emptyState}>{text.noReviews}</div> :
              gameDetailReviews.slice(0, 5).map(review => (
                <div key={review.id} style={styles.reviewCard}>
                  <div style={styles.reviewHeader}>
                    <span style={styles.reviewUsername}>{review.username}</span>
                    <span style={styles.reviewRating}>★ {review.rating}/5</span>
                  </div>
                  <div style={styles.reviewComment}>{review.comment || "No comment"}</div>
                  {user && (
                    <div style={styles.reviewActions}>
                      <button className="btn-click" style={styles.likeBtn} onClick={() => handleLikeReview(review.id)}><FaThumbsUp size={11} /> {review.likes?.length || 0}</button>
                      <button className="btn-click" style={styles.likeBtn} onClick={() => handleDislikeReview(review.id)}><FaThumbsDown size={11} /> {review.dislikes?.length || 0}</button>
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
      {/* Mobile Menu Overlay */}
      <div className="mobile-menu-overlay" style={styles.mobileMenu}>
        <button className="btn-click" style={styles.mobileMenuClose} onClick={closeMobileMenu}><FaTimes size={20} /></button>
        <div style={{ marginTop: 40 }}>
          <button className="btn-click" style={styles.mobileMenuItem} onClick={() => { setCurrentTab("home"); closeMobileMenu(); }}><FaHome /> {text.home}</button>
          <button className="btn-click" style={styles.mobileMenuItem} onClick={() => { setCurrentTab("library"); closeMobileMenu(); }}><BsFillCollectionFill /> {text.library}</button>
          <button className="btn-click" style={styles.mobileMenuItem} onClick={() => { setCurrentTab("profile"); closeMobileMenu(); }}><FaUser /> {text.profile}</button>
          <button className="btn-click" style={styles.mobileMenuItem} onClick={() => { setCurrentTab("friends"); closeMobileMenu(); }}><FaUsers /> {text.friends}</button>
          <button className="btn-click" style={styles.mobileMenuItem} onClick={() => { setCurrentTab("ai"); closeMobileMenu(); }}><FaRobot /> {text.ai}</button>
          <button className="btn-click" style={styles.mobileMenuItem} onClick={() => { setCurrentTab("aoty"); closeMobileMenu(); }}><FaTrophy /> {text.aoty}</button>
          <button className="btn-click" style={styles.mobileMenuItem} onClick={() => { setCurrentTab("playlists"); closeMobileMenu(); }}><FaList /> {text.playlists}</button>
          <button className="btn-click" style={styles.mobileMenuItem} onClick={() => { setCurrentTab("gameNight"); closeMobileMenu(); }}><GiSpinningWheel /> {text.gameNight}</button>
          <button className="btn-click" style={styles.mobileMenuItem} onClick={() => { setCurrentTab("activity"); closeMobileMenu(); }}><FaBell /> {text.activity}</button>
          <button className="btn-click" style={styles.mobileMenuItem} onClick={() => { setCurrentTab("wishlist"); closeMobileMenu(); }}><FaStar /> {text.wishlist}</button>
          <button className="btn-click" style={styles.mobileMenuItem} onClick={() => { setCurrentTab("backlog"); closeMobileMenu(); }}><FaChartLine /> {text.backlog}</button>
          <button className="btn-click" style={styles.mobileMenuItem} onClick={() => { setCurrentTab("compare"); closeMobileMenu(); }}><FaBalanceScale /> {text.compare}</button>
          <button className="btn-click" style={styles.mobileMenuItem} onClick={() => { setShowSettings(true); closeMobileMenu(); }}><FaCog /> {text.settings}</button>
          {!user ? <button className="btn-click" style={{ ...styles.mobileMenuItem, background: "linear-gradient(135deg, #4285f4, #3367d6)", marginTop: 16, borderRadius: 12, justifyContent: "center" }} onClick={() => { setShowLoginModal(true); closeMobileMenu(); }}><FaEnvelope /> {text.login}</button> :
            <button className="btn-click" style={{ ...styles.mobileMenuItem, background: "rgba(255,255,255,0.08)", marginTop: 16, borderRadius: 12, justifyContent: "center" }} onClick={() => { logout(); closeMobileMenu(); }}><FaSignOutAlt /> {text.logout}</button>}
        </div>
      </div>

      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.logo} onClick={() => setCurrentTab("home")}>
            <div style={styles.logoIcon}>
              <GiConsoleController size={18} />
              <span style={styles.logoIconText}>NX</span>
            </div>
            <span style={styles.logoText}>NexPlay</span>
          </div>
          
          <button className="btn-click hamburger-btn" style={styles.hamburgerBtn} onClick={toggleMobileMenu}>
            <FaBars size={20} />
          </button>
          
          <div className="main-tabs-desktop" style={styles.mainTabs}>
            <button className="btn-click" style={styles.mainTab(currentTab === "home")} onClick={() => setCurrentTab("home")}><FaHome size={14} /> {text.home}</button>
            <button className="btn-click" style={styles.mainTab(currentTab === "library")} onClick={() => setCurrentTab("library")}><BsFillCollectionFill size={14} /> {text.library}</button>
            <button className="btn-click" style={styles.mainTab(currentTab === "profile")} onClick={() => setCurrentTab("profile")}><FaUser size={14} /> {text.profile}</button>
            <button className="btn-click" style={styles.mainTab(currentTab === "ai")} onClick={() => setCurrentTab("ai")}><FaRobot size={14} /> {text.ai}</button>
            <button className="btn-click" style={styles.mainTab(currentTab === "compare")} onClick={() => setCurrentTab("compare")}><FaBalanceScale size={14} /> {text.compare}</button>
            <button className="btn-click" style={styles.iconBtn} onClick={() => setShowSettings(true)}><FaCog size={14} /></button>
            {!user ? <button className="btn-click" style={styles.loginBtn} onClick={() => setShowLoginModal(true)}><FaEnvelope size={14} /> {text.login}</button> :
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={styles.userAvatar}>{userData?.username?.charAt(0).toUpperCase()}</div>
                <button className="btn-click" style={styles.logoutBtn} onClick={logout}><FaSignOutAlt size={14} /></button>
              </div>}
          </div>
        </div>

        {/* HOME TAB */}
        {currentTab === "home" && (
          <div className="fade-in">
            <div style={styles.tabNav}>
              <button className="btn-click" style={styles.tabNavBtn(discoverSubTab === "findGame")} onClick={() => setDiscoverSubTab("findGame")}>🔍 {text.findYourGame}</button>
              <button className="btn-click" style={styles.tabNavBtn(discoverSubTab === "topPicks")} onClick={() => setDiscoverSubTab("topPicks")}>🎯 {text.topPicks}</button>
              <button className="btn-click" style={styles.tabNavBtn(discoverSubTab === "bestEver")} onClick={() => setDiscoverSubTab("bestEver")}>🏆 {text.bestEver}</button>
              <button className="btn-click" style={styles.tabNavBtn(discoverSubTab === "hiddenGems")} onClick={() => setDiscoverSubTab("hiddenGems")}>💎 {text.hiddenGems}</button>
              <button className="btn-click" style={styles.tabNavBtn(discoverSubTab === "top20")} onClick={() => setDiscoverSubTab("top20")}>📊 {text.top20}</button>
            </div>

            {discoverSubTab === "findGame" && (
              <>
                <div style={styles.randomFilterSection}>
                  <div style={styles.randomFilterTitle}><FaRandom size={14} /> {text.randomGame}</div>
                  <div style={styles.randomFilterRow}>
                    <label className="btn-click" style={styles.randomCheckbox}><input type="checkbox" checked={randomExcludeHorror} onChange={e => setRandomExcludeHorror(e.target.checked)} /> No Horror</label>
                    <label className="btn-click" style={styles.randomCheckbox}><input type="checkbox" checked={randomExcludeIndie} onChange={e => setRandomExcludeIndie(e.target.checked)} /> No Indie</label>
                    <label className="btn-click" style={styles.randomCheckbox}><input type="checkbox" checked={randomExcludeOld} onChange={e => setRandomExcludeOld(e.target.checked)} /> 2015+</label>
                  </div>
                  <div style={styles.randomFilterRow}>
                    <select className="btn-click" value={randomYear} onChange={e => setRandomYear(e.target.value)} style={styles.randomSelect}>
                      <option value="all">{text.allYears}</option>
                      {[...new Set(gamesWithData.map(g => g.year))].sort((a,b) => b - a).slice(0, 10).map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                    <select className="btn-click" value={randomMode} onChange={e => setRandomMode(e.target.value)} style={styles.randomSelect}>
                      <option value="full">Random</option><option value="genre">By Genre</option><option value="mood">By Mood</option>
                    </select>
                    <button className="btn-click" style={styles.loginBtn} onClick={doRandom}><FaRandom size={12} /> Roll</button>
                  </div>
                  <div><span style={{ fontSize: 12 }}>Min Rating: {randomMinRating}</span><input type="range" min="0" max="10" step="0.5" value={randomMinRating} onChange={e => setRandomMinRating(parseFloat(e.target.value))} style={styles.randomSlider} /></div>
                </div>

                <div style={styles.tabNav}>
                  <button className="btn-click" style={styles.tabNavBtn(step === 1)} onClick={() => setStep(1)}>{text.mood}</button>
                  <button className="btn-click" style={styles.tabNavBtn(step === 2)} onClick={() => setStep(2)}>{text.genre}</button>
                  <button className="btn-click" style={styles.tabNavBtn(step === 3)} onClick={() => setStep(3)}>{text.playtime}</button>
                  <button className="btn-click" style={styles.tabNavBtn(step === 4)} onClick={() => setStep(4)}>{text.results}</button>
                </div>

                {step === 1 && (
                  <div className="slide-in">
                    <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 20, textAlign: "center" }}>{text.mood} 🎭</div>
                    <div style={styles.pillGrid}>{MOODS.map(m => <button key={m} className="btn-click" style={styles.pill(selectedMoods.includes(m))} onClick={() => toggle(selectedMoods, setSelectedMoods, m)}>{m}</button>)}</div>
                    <button className="btn-click" style={styles.nextBtn} onClick={() => setStep(2)}>{text.next} →</button>
                  </div>
                )}
                {step === 2 && (
                  <div className="slide-in">
                    <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 20, textAlign: "center" }}>{text.genre} 🎮</div>
                    <div style={styles.pillGrid}>{GENRES.map(g => <button key={g} className="btn-click" style={styles.pill(selectedGenres.includes(g))} onClick={() => toggle(selectedGenres, setSelectedGenres, g)}>{g}</button>)}</div>
                    <button className="btn-click" style={styles.nextBtn} onClick={() => setStep(3)}>{text.next} →</button>
                  </div>
                )}
                {step === 3 && (
                  <div className="slide-in">
                    <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 20, textAlign: "center" }}>{text.playtime} ⏱️</div>
                    <div style={styles.pillGrid}>{PLAYTIMES.map(p => <button key={p} className="btn-click" style={styles.pill(selectedPlaytime === p)} onClick={() => setSelectedPlaytime(p === selectedPlaytime ? null : p)}>{p}</button>)}</div>
                    <button className="btn-click" style={styles.nextBtn} onClick={() => setStep(4)}>{text.results} 🚀</button>
                  </div>
                )}
                {step === 4 && (
                  <div className="fade-in">
                    <input style={styles.searchBar} placeholder={text.search} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                    <div style={styles.filterRow}>
                      <span style={{ fontSize: 12 }}>{text.sort}:</span>
                      <button className="btn-click" style={styles.filterBtn(sortBy === "score")} onClick={() => setSortBy("score")}>{text.bestMatch}</button>
                      <button className="btn-click" style={styles.filterBtn(sortBy === "rating")} onClick={() => setSortBy("rating")}>{text.rating}</button>
                      <button className="btn-click" style={styles.filterBtn(sortBy === "year")} onClick={() => setSortBy("year")}>{text.year}</button>
                    </div>
                    {topPicks.length > 0 && (
                      <div>
                        <div style={styles.sectionTitle}>🎯 {text.topPicks}</div>
                        <div style={styles.topPicksRow}>{topPicks.slice(0, 6).map((g,i) => <div key={g.id} className="game-card" style={styles.topPickCard} onClick={() => openGameDetail(g)}><div style={{ fontSize: 18, marginBottom: 6 }}>{["🥇","🥈","🥉","4","5","6"][i]}</div><img src={g.finalImg || g.img} style={{ width: "100%", height: 70, objectFit: "cover", borderRadius: 8 }} alt={g.name} /><div style={{ fontWeight: 700, marginTop: 8, fontSize: 11, wordWrap: "break-word" }}>{g.name}</div><div style={{ fontSize: 10, color: currentColors.primary }}>★ {(g.finalRating || g.rating)?.toFixed(1)}</div><button className="btn-click" style={{ ...styles.addBtn, padding: "6px 8px", fontSize: 10 }} onClick={(e) => { e.stopPropagation(); addToLibrary(g); }}>+ {text.add}</button></div>)}</div>
                      </div>
                    )}
                    <div style={styles.sectionTitle}>📋 {text.allResults}</div>
                    <div style={styles.grid}>{restResults.slice(0, 20).map(g => <GameCard key={g.id} game={g} showBtn={true} />)}</div>
                  </div>
                )}
              </>
            )}

            {discoverSubTab === "topPicks" && (
              <div className="fade-in">
                <div style={styles.sectionTitle}>🎯 {text.topPicks}</div>
                <div style={styles.grid}>{TOP_PICKS_GAMES.slice(0, 20).map(g => <GameCard key={g.id} game={g} showBtn={true} />)}</div>
              </div>
            )}

            {discoverSubTab === "bestEver" && (
              <div className="fade-in">
                <input style={styles.searchBar} placeholder={text.search} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                <div style={styles.filterRow}>
                  <span>{text.sort}:</span>
                  <button className="btn-click" style={styles.filterBtn(sortBy === "score")} onClick={() => setSortBy("score")}>{text.bestMatch}</button>
                  <button className="btn-click" style={styles.filterBtn(sortBy === "rating")} onClick={() => setSortBy("rating")}>{text.rating}</button>
                </div>
                <div style={styles.sectionTitle}>🏆 {text.bestEver}</div>
                <div style={styles.grid}>{filteredCategoryGames(BEST_EVER_GAMES).slice(0, 30).map(g => <GameCard key={g.id} game={g} showBtn={true} />)}</div>
              </div>
            )}

            {discoverSubTab === "hiddenGems" && (
              <div className="fade-in">
                <div style={styles.sectionTitle}>💎 {text.hiddenGems}</div>
                <div style={styles.grid}>{HIDDEN_GEMS_GAMES.map(g => <GameCard key={g.id} game={g} showBtn={true} />)}</div>
              </div>
            )}

            {discoverSubTab === "top20" && (
              <div className="fade-in">
                <select className="btn-click" value={selectedGenreForTop} onChange={e => setSelectedGenreForTop(e.target.value)} style={styles.topGenreSelect}>
                  {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
                <div style={styles.sectionTitle}>⭐ Top 20 - {selectedGenreForTop}</div>
                {top20ByGenre.length === 0 ? (
                  <div style={styles.emptyState}>No games found in this genre.</div>
                ) : (
                  <div style={styles.grid}>{top20ByGenre.map(g => <GameCard key={g.id} game={g} showBtn={true} />)}</div>
                )}
              </div>
            )}
          </div>
        )}

        {/* LIBRARY TAB */}
        {currentTab === "library" && (
          <div className="fade-in">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
              <div style={styles.sectionTitle}>📚 {text.library} ({library.length})</div>
              <div style={{ display: "flex", gap: 10 }}>
                <button className="btn-click" style={styles.loginBtn} onClick={exportLibrary}><FaFileExport size={12} /> {text.export}</button>
                <label className="btn-click" style={styles.loginBtn}><FaFileImport size={12} /> {text.import}<input type="file" accept=".json" style={{ display: "none" }} onChange={importLibrary} /></label>
              </div>
            </div>
            <div style={styles.statsRow}>
              <div style={styles.statCard}><div style={styles.statNumber}>{library.length}</div><div>{text.total}</div></div>
              <div style={styles.statCard}><div style={styles.statNumber}>{library.filter(g => g.status === "playing").length}</div><div>{text.playing}</div></div>
              <div style={styles.statCard}><div style={styles.statNumber}>{library.filter(g => g.status === "completed").length}</div><div>{text.completed}</div></div>
            </div>
            {library.length === 0 ? <div style={styles.emptyState}>{text.library} is empty.</div> : library.map(game => (
              <div key={game.id} className="fade-in" style={styles.libraryCard}>
                <img src={game.finalImg || game.img} style={styles.libraryImg} onClick={() => openGameDetail(game)} alt={game.name} />
                <div style={styles.libraryInfo}>
                  <div style={styles.libraryTitle}>{game.name}</div>
                  <div style={styles.libraryMeta}>{game.developer?.slice(0, 20)} · {game.year}</div>
                  <div style={styles.libraryActions}>
                    <select className="btn-click" value={game.status} onChange={e => updateStatus(game.id, e.target.value, game)} style={styles.select}>
                      <option value="wishlist">📝 Wishlist</option><option value="playing">🎮 Playing</option><option value="completed">✅ Completed</option>
                    </select>
                    <button className="btn-click" onClick={() => toggleFavorite(game.id)} style={styles.select}><FaHeart color={favorites.includes(game.id) ? currentColors.primary : "#fff"} size={11} /></button>
                    <button className="btn-click" onClick={() => markAsPlayed(game)} style={styles.select}><FaClock size={11} /> {text.played}</button>
                    <button className="btn-click" onClick={() => removeFromLibrary(game.id)} style={{ ...styles.select, color: "#ff6b6b" }}><FaTrash size={11} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PROFILE TAB */}
        {currentTab === "profile" && (
          <div className="fade-in">
            {user ? (
              <>
                <div style={styles.profileHeader}>
                  <div style={styles.profileAvatarLarge}>{userData?.username?.charAt(0).toUpperCase()}</div>
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 700, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", justifyContent: "center" }}>{userData?.username}{userData?.username === "Sherlock10K" && <span style={{ color: currentColors.primary }}>👑</span>}</div>
                    <div style={{ fontSize: 11, color: currentColors.textSecondary }}>{user.email}</div>
                    <div style={{ fontSize: 11, color: currentColors.textSecondary, marginBottom: 10 }}>{userData?.bio || "No bio"}</div>
                    <div style={styles.statsRow}>
                      <div><div style={styles.statNumber}>{library.length}</div><div>{text.total}</div></div>
                      <div><div style={styles.statNumber}>{library.filter(g => g.status === "completed").length}</div><div>{text.completed}</div></div>
                      <div><div style={styles.statNumber}>{favorites.length}</div><div>{text.favorites}</div></div>
                    </div>
                    <button className="btn-click" style={styles.editBtn} onClick={openEditModal}><FaEdit size={11} /> {text.editProfile}</button>
                    <button className="btn-click" style={{ ...styles.donationBtn, marginLeft: 8 }} onClick={() => window.open("https://ko-fi.com", "_blank")}><FaDonate size={11} /> {text.donate}</button>
                  </div>
                </div>

                <div style={styles.sectionTitle}><GiAchievement size={16} /> {text.achievements}</div>
                <div style={styles.achievementGrid}>
                  {achievements.slice(0, 8).map(ach => (
                    <div key={ach.id} style={{ ...styles.achievementCard, opacity: ach.unlocked ? 1 : 0.5 }}>
                      <div style={styles.achievementIcon}>{ach.icon}</div>
                      <div style={styles.achievementInfo}>
                        <div style={styles.achievementName}>{ach.name}</div>
                        <div style={styles.achievementDesc}>{ach.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={styles.platformSection}>
                  <div style={styles.randomFilterTitle}><FaSteam size={14} /> Steam</div>
                  <div style={styles.platformRow}>
                    <input type="text" placeholder={text.steamId} value={steamIdInput} onChange={e => setSteamIdInput(e.target.value)} style={{ ...styles.input, marginBottom: 0, flex: 1, fontSize: 12 }} />
                    <button className="btn-click" style={styles.platformBtn(colors.steam)} onClick={handleSteamLogin} disabled={syncingPlatform === "steam"}>
                      <FaSteam size={12} /> {syncingPlatform === "steam" ? "..." : text.importGames}
                    </button>
                  </div>
                </div>

                {userData?.lastPlayed?.length > 0 && (
                  <><div style={styles.sectionTitle}><FaClock size={14} /> {text.recentlyPlayed}</div><div style={styles.lastPlayedRow}>{userData.lastPlayed.slice(0,6).map((g,i) => <div key={i} style={styles.lastPlayedCard} onClick={() => { const game = [...gamesWithData, ...MANUAL_HIDDEN_GEMS].find(a => a.id === g.gameId); if (game) openGameDetail(game); }}><img src={g.gameImg} style={styles.lastPlayedImg} alt={g.gameName} /><div style={styles.lastPlayedName}>{g.gameName.slice(0, 10)}</div></div>)}</div></>
                )}
              </>
            ) : <div style={styles.emptyState}>Login to see your profile</div>}
          </div>
        )}

        {/* AI TAB */}
        {currentTab === "ai" && (
          <div className="fade-in">
            <div style={styles.aiSection}>
              <div style={styles.randomFilterTitle}><FaRobot size={14} /> {text.ai}</div>
              <div style={styles.aiRow}>
                <input style={{ ...styles.input, marginBottom: 0, flex: 1 }} placeholder="Ask for recommendations..." value={aiQuery} onChange={e => setAiQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAiSearch()} />
                <button className="btn-click" style={styles.loginBtn} onClick={handleAiSearch} disabled={isAiLoading}>{isAiLoading ? "..." : "Go"}</button>
              </div>
              {aiResponse && <div className="fade-in" style={styles.aiResultBox}>{aiResponse}</div>}
            </div>
            <div style={styles.sectionTitle}>🎯 {text.topPicks}</div>
            <div style={styles.grid}>{TOP_PICKS_GAMES.slice(0, 12).map(g => <GameCard key={g.id} game={g} showBtn={true} />)}</div>
          </div>
        )}

        {/* AOTY TAB */}
        {currentTab === "aoty" && (
          <div className="fade-in">
            {selectedAotyYear ? (
              <>
                <button className="btn-click" style={styles.gotyBackBtn} onClick={() => { setSelectedAotyYear(null); setAotySearch(""); setAotyResult(null); }}>
                  <FaArrowLeft size={12} /> {text.backToAOTY}
                </button>
                <div style={styles.aotyResultCard}>
                  <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 8, textAlign: "center", color: currentColors.primary }}>{selectedAotyYear}</div>
                  <div style={styles.aotyWinnerCard} onClick={() => {
                    const award = AOTY_DATA[selectedAotyYear]?.tga;
                    if (award) {
                      const gameData = { id: selectedAotyYear, name: award.winner, rating: 9.0, genre: "Action", playtime: "20-40h", year: selectedAotyYear, img: award.img, developer: "Various", platforms: ["PC", "Console"], steamId: award.steamId, finalRating: 9.0, finalImg: award.img };
                      openGameDetail(gameData);
                    }
                  }}>
                    <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                      <FaTrophy style={{ color: currentColors.primary, fontSize: 24 }} />
                      <div>
                        <div style={{ fontSize: 11, color: currentColors.primary }}>The Game Awards</div>
                        <div style={{ fontSize: 16, fontWeight: 600 }}>{AOTY_DATA[selectedAotyYear]?.tga?.winner || "TBA"}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div style={styles.sectionTitle}><FaTrophy size={16} /> {text.aotyTitle}</div>
                <input style={styles.searchBar} placeholder={text.searchAOTY} value={aotySearch} onChange={e => setAotySearch(e.target.value)} />
                {!aotySearch && !selectedAotyYear && (
                  <div style={styles.grid}>
                    {Object.entries(AOTY_DATA).reverse().slice(0, 16).map(([year, data]) => (
                      <div key={year} style={styles.aotyYearCard} onClick={() => setSelectedAotyYear(parseInt(year))}>
                        {data.tga?.img && <img src={data.tga.img} style={{ width: "100%", height: 80, objectFit: "cover", borderRadius: 10, marginBottom: 8 }} alt={data.tga.winner} />}
                        <div style={{ fontWeight: 700, fontSize: 18, color: currentColors.primary }}>{year}</div>
                        <div style={{ fontSize: 10, marginTop: 6 }}>{data.tga?.winner?.slice(0, 20) || "No data"}</div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* FRIENDS TAB */}
        {currentTab === "friends" && (
          <div className="fade-in">
            <div style={styles.sectionTitle}><FaUsers size={14} /> {text.findFriends}</div>
            <div style={styles.searchRow}>
              <input style={{ ...styles.input, marginBottom: 0, flex: 1 }} placeholder="Search username..." value={searchUsersTerm} onChange={e => setSearchUsersTerm(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSearchUsers()} />
              <button className="btn-click" style={styles.loginBtn} onClick={handleSearchUsers}><FaSearch size={12} /> {text.search}</button>
            </div>
            {foundUsers.slice(0, 10).map(u => (
              <div key={u.id} style={styles.userCard}>
                <div style={styles.userAvatarSmall}>{u.username?.charAt(0).toUpperCase()}</div>
                <div><div style={{ fontWeight: 700, fontSize: 14 }}>{u.username}</div><div style={{ fontSize: 11, color: currentColors.textSecondary }}>{u.bio?.slice(0, 30) || "No bio"}</div></div>
              </div>
            ))}
          </div>
        )}

        {/* PLAYLISTS TAB */}
        {currentTab === "playlists" && (
          <div className="fade-in">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
              <div style={styles.sectionTitle}><FaList size={14} /> {text.playlists}</div>
              <button className="btn-click" style={styles.loginBtn} onClick={() => setShowCreatePlaylist(true)}><FaPlusCircle size={12} /> {text.createPlaylist}</button>
            </div>
            {playlists.length === 0 ? <div style={styles.emptyState}>No playlists yet.</div> : playlists.map(playlist => (
              <div key={playlist.id} style={styles.playlistCard}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{playlist.name}</div>
                  <button className="btn-click" style={{ background: "rgba(255,255,255,0.05)", border: "none", borderRadius: 6, padding: "4px 10px", color: currentColors.textSecondary, cursor: "pointer", fontSize: 11 }} onClick={() => deletePlaylist(playlist.id)}><FaTrashAlt size={10} /> Delete</button>
                </div>
                <div style={styles.grid}>
                  {playlist.games.slice(0, 6).map(game => <GameCard key={game.id} game={game} showBtn={false} />)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* GAME NIGHT TAB */}
        {currentTab === "gameNight" && (
          <div className="fade-in">
            <div style={styles.gameNightCard}>
              <div style={styles.randomFilterTitle}><GiSpinningWheel size={14} /> {text.gameNightMode}</div>
              <label className="btn-click" style={styles.randomCheckbox}><input type="checkbox" checked={gameNightFilters.excludeMultiplayer} onChange={e => setGameNightFilters({ ...gameNightFilters, excludeMultiplayer: e.target.checked })} /> {text.excludeMultiplayer}</label>
              <div style={{ margin: "12px 0" }}>
                <div style={{ fontSize: 11, color: currentColors.textSecondary }}>Min Rating: {gameNightFilters.minRating}</div>
                <input type="range" min="0" max="10" step="0.5" value={gameNightFilters.minRating} onChange={e => setGameNightFilters({ ...gameNightFilters, minRating: parseFloat(e.target.value) })} style={styles.randomSlider} />
              </div>
              <button className="btn-click" style={styles.loginBtn} onClick={spinGameNight} disabled={spinning}>
                {spinning ? "🎲" : <><GiSpinningWheel size={14} /> {text.spinWheel}</>}
              </button>
              {spinResult && !spinning && (
                <div style={{ marginTop: 20 }}><GameCard game={spinResult} showBtn={true} /></div>
              )}
            </div>
          </div>
        )}

        {/* WISHLIST TAB */}
        {currentTab === "wishlist" && (
          <div className="fade-in">
            <div style={styles.sectionTitle}><FaStar size={14} /> {text.wishlist}</div>
            {wishlist.length === 0 ? <div style={styles.emptyState}>Empty</div> : <div style={styles.grid}>{wishlist.slice(0, 20).map(game => <GameCard key={game.id} game={game} showBtn={true} />)}</div>}
          </div>
        )}

        {/* BACKLOG TAB */}
        {currentTab === "backlog" && (
          <div className="fade-in">
            <div style={styles.sectionTitle}><FaChartLine size={14} /> {text.backlog}</div>
            {backlogRecommendation && typeof backlogRecommendation === "object" ? (
              <div><GameCard game={backlogRecommendation} showBtn={true} /></div>
            ) : (
              <div style={styles.emptyState}>No backlog games!</div>
            )}
          </div>
        )}

        {/* COMPARE TAB - VERBESSERT */}
        {currentTab === "compare" && (
          <div className="fade-in">
            <div style={styles.sectionTitle}><FaBalanceScale size={16} /> {text.compareGames}</div>
            <div style={styles.compareCard}>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
                <select className="btn-click" style={{ ...styles.select, flex: 1, padding: "12px", fontSize: 14 }} value={compareGames[0]?.id || ""} onChange={e => { const game = [...gamesWithData, ...MANUAL_HIDDEN_GEMS].find(g => g.id === parseInt(e.target.value)); setCompareGames([game, compareGames[1]]); }}>
                  <option value="">{text.selectGame} 1</option>
                  {[...gamesWithData, ...MANUAL_HIDDEN_GEMS].slice(0, 50).map(g => <option key={g.id} value={g.id}>{g.name} ({g.year}) - ★{g.finalRating?.toFixed(1)}</option>)}
                </select>
                <div style={{ fontSize: 24, color: currentColors.primary, alignSelf: "center" }}>VS</div>
                <select className="btn-click" style={{ ...styles.select, flex: 1, padding: "12px", fontSize: 14 }} value={compareGames[1]?.id || ""} onChange={e => { const game = [...gamesWithData, ...MANUAL_HIDDEN_GEMS].find(g => g.id === parseInt(e.target.value)); setCompareGames([compareGames[0], game]); }}>
                  <option value="">{text.selectGame} 2</option>
                  {[...gamesWithData, ...MANUAL_HIDDEN_GEMS].slice(0, 50).map(g => <option key={g.id} value={g.id}>{g.name} ({g.year}) - ★{g.finalRating?.toFixed(1)}</option>)}
                </select>
              </div>
              
              {compareGames[0] && compareGames[1] && (
                <div>
                  <div style={styles.compareGrid}>
                    {/* Spiel 1 */}
                    <div style={styles.compareColumn}>
                      <div style={styles.compareHeader}>
                        <img src={compareGames[0].finalImg || compareGames[0].img} style={{ width: 80, height: 107, objectFit: "cover", borderRadius: 12, marginBottom: 12 }} alt={compareGames[0].name} />
                        <div>{compareGames[0].name}</div>
                        <div style={{ fontSize: 14, color: currentColors.primary, marginTop: 4 }}>★ {compareGames[0].finalRating?.toFixed(1)}</div>
                      </div>
                      <div style={styles.compareRow}>
                        <span style={styles.compareLabel}>{text.year}</span>
                        <span style={styles.compareValue}>{compareGames[0].year}</span>
                      </div>
                      <div style={styles.compareRow}>
                        <span style={styles.compareLabel}>{text.genre}</span>
                        <span style={styles.compareValue}>{compareGames[0].genre}</span>
                      </div>
                      <div style={styles.compareRow}>
                        <span style={styles.compareLabel}>{text.playtime}</span>
                        <span style={styles.compareValue}>{compareGames[0].playtime}</span>
                      </div>
                      <div style={styles.compareRow}>
                        <span style={styles.compareLabel}>Developer</span>
                        <span style={styles.compareValue}>{compareGames[0].developer}</span>
                      </div>
                      <div style={styles.compareRow}>
                        <span style={styles.compareLabel}>{text.graphics}</span>
                        <span style={styles.compareValue}>{compareGames[0].year >= 2020 ? "⭐ Sehr gut" : compareGames[0].year >= 2015 ? "👍 Gut" : "👎 Veraltet"}</span>
                      </div>
                      <div style={styles.compareRow}>
                        <span style={styles.compareLabel}>{text.story}</span>
                        <span style={styles.compareValue}>{compareGames[0].genre === "Story Rich" || compareGames[0].genre === "RPG" ? "⭐ Ausgezeichnet" : "👍 Gut"}</span>
                      </div>
                      <div style={styles.compareRow}>
                        <span style={styles.compareLabel}>{text.gameplay}</span>
                        <span style={styles.compareValue}>{compareGames[0].finalRating >= 9 ? "⭐ Meisterhaft" : compareGames[0].finalRating >= 8 ? "👍 Solide" : "👎 Durchschnitt"}</span>
                      </div>
                      <div style={styles.compareRow}>
                        <span style={styles.compareLabel}>{text.replayability}</span>
                        <span style={styles.compareValue}>{compareGames[0].playtime === "100h+" || compareGames[0].playtime === "60-100h" ? "⭐ Sehr hoch" : "👍 Mittel"}</span>
                      </div>
                    </div>
                    
                    {/* Spiel 2 */}
                    <div style={styles.compareColumn}>
                      <div style={styles.compareHeader}>
                        <img src={compareGames[1].finalImg || compareGames[1].img} style={{ width: 80, height: 107, objectFit: "cover", borderRadius: 12, marginBottom: 12 }} alt={compareGames[1].name} />
                        <div>{compareGames[1].name}</div>
                        <div style={{ fontSize: 14, color: currentColors.primary, marginTop: 4 }}>★ {compareGames[1].finalRating?.toFixed(1)}</div>
                      </div>
                      <div style={styles.compareRow}>
                        <span style={styles.compareLabel}>{text.year}</span>
                        <span style={styles.compareValue}>{compareGames[1].year}</span>
                      </div>
                      <div style={styles.compareRow}>
                        <span style={styles.compareLabel}>{text.genre}</span>
                        <span style={styles.compareValue}>{compareGames[1].genre}</span>
                      </div>
                      <div style={styles.compareRow}>
                        <span style={styles.compareLabel}>{text.playtime}</span>
                        <span style={styles.compareValue}>{compareGames[1].playtime}</span>
                      </div>
                      <div style={styles.compareRow}>
                        <span style={styles.compareLabel}>Developer</span>
                        <span style={styles.compareValue}>{compareGames[1].developer}</span>
                      </div>
                      <div style={styles.compareRow}>
                        <span style={styles.compareLabel}>{text.graphics}</span>
                        <span style={styles.compareValue}>{compareGames[1].year >= 2020 ? "⭐ Sehr gut" : compareGames[1].year >= 2015 ? "👍 Gut" : "👎 Veraltet"}</span>
                      </div>
                      <div style={styles.compareRow}>
                        <span style={styles.compareLabel}>{text.story}</span>
                        <span style={styles.compareValue}>{compareGames[1].genre === "Story Rich" || compareGames[1].genre === "RPG" ? "⭐ Ausgezeichnet" : "👍 Gut"}</span>
                      </div>
                      <div style={styles.compareRow}>
                        <span style={styles.compareLabel}>{text.gameplay}</span>
                        <span style={styles.compareValue}>{compareGames[1].finalRating >= 9 ? "⭐ Meisterhaft" : compareGames[1].finalRating >= 8 ? "👍 Solide" : "👎 Durchschnitt"}</span>
                      </div>
                      <div style={styles.compareRow}>
                        <span style={styles.compareLabel}>{text.replayability}</span>
                        <span style={styles.compareValue}>{compareGames[1].playtime === "100h+" || compareGames[1].playtime === "60-100h" ? "⭐ Sehr hoch" : "👍 Mittel"}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Vergleichs-Ergebnis */}
                  <div style={{ marginTop: 24, padding: 16, background: "rgba(0,0,0,0.2)", borderRadius: 12, textAlign: "center" }}>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>🏆 {text.winner}</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: currentColors.primary }}>
                      {compareGames[0].finalRating > compareGames[1].finalRating ? compareGames[0].name : compareGames[1].finalRating > compareGames[0].finalRating ? compareGames[1].name : "Unentschieden!"}
                    </div>
                    <div style={{ fontSize: 12, color: currentColors.textSecondary, marginTop: 4 }}>
                      {compareGames[0].finalRating > compareGames[1].finalRating ? 
                        `${compareGames[0].name} gewinnt mit ★${compareGames[0].finalRating?.toFixed(1)} vs ★${compareGames[1].finalRating?.toFixed(1)}` : 
                        compareGames[1].finalRating > compareGames[0].finalRating ?
                        `${compareGames[1].name} gewinnt mit ★${compareGames[1].finalRating?.toFixed(1)} vs ★${compareGames[0].finalRating?.toFixed(1)}` :
                        `Beide Spiele sind gleich gut bewertet!`}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* MODALS */}
      {showCreatePlaylist && (
        <div style={styles.modalOverlay} onClick={() => setShowCreatePlaylist(false)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div style={styles.modalTitle}>{text.createPlaylist}</div>
            <input style={styles.input} placeholder={text.playlistName} value={newPlaylistName} onChange={e => setNewPlaylistName(e.target.value)} />
            <button className="btn-click" style={styles.modalBtn} onClick={createPlaylist}>{text.createPlaylist}</button>
          </div>
        </div>
      )}

      {showSettings && (
        <div style={styles.modalOverlay} onClick={() => setShowSettings(false)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div style={styles.modalTitle}>{text.settings} ⚙️</div>
            <div style={styles.settingsSection}>
              <div style={styles.settingsRow}><span style={styles.settingsLabel}>{text.sound}:</span><button className="btn-click" style={styles.iconBtn} onClick={() => setSoundEnabled(!soundEnabled)}>{soundEnabled ? <FaVolumeUp size={14} /> : <FaVolumeMute size={14} />} {soundEnabled ? "ON" : "OFF"}</button></div>
              <div style={styles.settingsRow}><span style={styles.settingsLabel}>{text.language}:</span><button className="btn-click" style={styles.iconBtn} onClick={() => setLang(lang === "en" ? "de" : "en")}><FaLanguage size={14} /> {lang === "en" ? "DE" : "EN"}</button></div>
              <div style={styles.settingsRow}><span style={styles.settingsLabel}>{text.theme}:</span><div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}><button className="btn-click" style={{ ...styles.iconBtn, background: theme === "dark" ? currentColors.primary : "rgba(255,255,255,0.08)", padding: "6px 12px" }} onClick={() => setTheme("dark")}><FaMoon size={12} /> {text.dark}</button><button className="btn-click" style={{ ...styles.iconBtn, background: theme === "light" ? currentColors.primary : "rgba(255,255,255,0.08)", padding: "6px 12px" }} onClick={() => setTheme("light")}><FaSun size={12} /> {text.light}</button></div></div>
            </div>
            <button className="btn-click" style={styles.modalBtn} onClick={() => setShowSettings(false)}>{text.close}</button>
          </div>
        </div>
      )}

      {showRandomModal && randomGame && (
        <div style={styles.modalOverlay} onClick={() => setShowRandomModal(false)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div style={styles.modalTitle}>🎲 {text.randomGame}</div>
            <img src={randomGame.finalImg || randomGame.img} style={{ width: "100%", borderRadius: 14, marginBottom: 16 }} alt={randomGame.name} />
            <div style={{ fontSize: 16, fontWeight: 700, textAlign: "center", marginBottom: 6 }}>{randomGame.name}</div>
            <div style={{ fontSize: 13, color: currentColors.primary, textAlign: "center", marginBottom: 12 }}>★ {(randomGame.finalRating || randomGame.rating)?.toFixed(1)} · {randomGame.playtime}</div>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              <button className="btn-click" style={{ ...styles.addBtn, width: "auto", padding: "8px 16px" }} onClick={() => { addToLibrary(randomGame); setShowRandomModal(false); }}>+ {text.add}</button>
              <button className="btn-click" style={{ ...styles.modalBtnSecondary, padding: "8px 16px" }} onClick={doRandom}>{text.rollAgain}</button>
            </div>
          </div>
        </div>
      )}

      {showLoginModal && (
        <div style={styles.modalOverlay} onClick={() => setShowLoginModal(false)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div style={styles.modalTitle}>{isLogin ? text.login : text.register}</div>
            {errorMsg && <div style={styles.errorText}>{errorMsg}</div>}
            <input style={styles.input} type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
            <div style={styles.passwordWrapper}>
              <input style={styles.input} type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
              <span style={styles.passwordEye} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}</span>
            </div>
            <button className="btn-click" style={styles.modalBtn} onClick={isLogin ? handleLogin : handleRegister}>{isLogin ? text.login : text.register}</button>
            <div style={styles.switchText} onClick={() => { setIsLogin(!isLogin); setErrorMsg(""); }}>{isLogin ? "No account? Register" : "Already have an account? Login"}</div>
          </div>
        </div>
      )}

      {showEditModal && user && (
        <div style={styles.modalOverlay} onClick={() => setShowEditModal(false)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div style={styles.modalTitle}>{text.editProfile}</div>
            {editError && <div style={styles.errorText}>{editError}</div>}
            {editSuccess && <div style={styles.successText}>{editSuccess}</div>}
            <input style={styles.input} placeholder={text.username} value={editUsername} onChange={e => setEditUsername(e.target.value)} />
            <textarea style={styles.textarea} placeholder={text.bio} rows="2" value={editBio} onChange={e => setEditBio(e.target.value)} />
            <button className="btn-click" style={styles.modalBtn} onClick={handleUpdateProfile}>{text.save}</button>
          </div>
        </div>
      )}

      {loadingAction && (
        <div style={styles.loadingOverlay}>
          <div style={styles.loadingSpinner}></div>
        </div>
      )}
    </div>
  );
}