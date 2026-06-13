import { useState, useEffect, useMemo, useRef } from "react";
import { FaHome, FaUser, FaFire, FaSearch, FaHeart, FaStar, FaTrash, FaSignOutAlt, FaPlus, FaCheck, FaEnvelope, FaEye, FaEyeSlash, FaEdit, FaUsers, FaClock, FaRandom, FaThumbsUp, FaThumbsDown, FaArrowLeft, FaCog, FaVolumeUp, FaVolumeMute, FaLanguage, FaSteam, FaPlaystation, FaGamepad, FaTrophy, FaGem, FaShoppingCart, FaRobot, FaFilter, FaLink, FaExternalLinkAlt, FaDonate, FaAward, FaList, FaMedal, FaGamepad as FaGamepadIcon, FaDiceD6, FaGlobe, FaStarHalfAlt, FaTv, FaMicrophone, FaVideo, FaDesktop, FaPlusCircle, FaTrashAlt, FaUsers as FaUsersIcon, FaBell, FaCalendarAlt, FaChartLine, FaBook, FaTags, FaBalanceScale, FaFileExport, FaFileImport, FaMoon, FaSun, FaAdjust, FaBars, FaTimes, FaChevronDown, FaChevronUp, FaFutbol, FaSpinner, FaCamera } from "react-icons/fa";
import { GiConsoleController, GiAchievement, GiSwordman, GiPuzzle, GiMusicalNotes, GiBrain, GiShield, GiMagicSwirl, GiTrophy, GiLaurels, GiSpinningWheel, GiNotebook, GiTwoCoins, GiLevelEndFlag } from "react-icons/gi";
import { BsFillCollectionFill, BsFillHeartFill, BsFillStarFill, BsFillAwardFill, BsFillPlayFill } from "react-icons/bs";
import { auth, loginWithEmail, registerWithEmail, logout, loadLibraryFromFirestore, saveLibraryToFirestore, loadProfileFromFirestore, saveProfileToFirestore, updateUsername, updateBio, togglePrivacy, searchUsers, resetPassword, addGameReview, getGameReviews, updateLastPlayed, likeReview, dislikeReview } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

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

const DEEPSEEK_API_KEY = "sk-b5699f49547a4e4ab7eaa74cb6bb7016";

const AOTY_DATA = {
  2025: { winner: "Clair Obscur: Expedition 33", img: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/2358720/header.jpg", steamId: 2358720, genre: "RPG", playtime: "60-100h", developer: "Kepler Interactive", description: "Clair Obscur: Expedition 33 ist ein episches RPG in einer düsteren Fantasy-Welt." },
  2024: { winner: "Astro Bot", img: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/2357570/header.jpg", steamId: 2357570, genre: "Platformer", playtime: "20-40h", developer: "Team Asobi", description: "Astro Bot ist ein charmantes 3D-Platformer-Abenteuer." },
  2023: { winner: "Baldur's Gate 3", img: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1086940/header.jpg", steamId: 1086940, genre: "RPG", playtime: "100h+", developer: "Larian Studios", description: "Baldur's Gate 3 ist das ultimative D&D-Rollenspielerlebnis." },
  2022: { winner: "Elden Ring", img: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1245620/header.jpg", steamId: 1245620, genre: "Open World", playtime: "100h+", developer: "FromSoftware", description: "Elden Ring ist ein Meisterwerk des Open-World-Action-RPGs." },
  2021: { winner: "It Takes Two", img: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1426210/header.jpg", steamId: 1426210, genre: "Adventure", playtime: "20-40h", developer: "Hazelight Studios", description: "It Takes Two ist ein einzigartiges Koop-Abenteuer." },
  2020: { winner: "The Last of Us Part II", img: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1888930/header.jpg", steamId: 1888930, genre: "Action", playtime: "40-60h", developer: "Naughty Dog", description: "The Last of Us Part II ist ein emotionales Meisterwerk." }
};

const MANUAL_GAMES = [
  { id: 8001, name: "The Witcher 3: Wild Hunt", rating: 9.5, genre: "RPG", playtime: "100h+", year: 2015, img: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/292030/header.jpg", developer: "CD Projekt Red", mood: "Epic", description: "Ein Meisterwerk des Open-World-RPGs.", platforms: ["PC", "PS4", "Xbox One", "Switch"], steamId: 292030 },
  { id: 8002, name: "Red Dead Redemption 2", rating: 9.6, genre: "Open World", playtime: "100h+", year: 2018, img: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1174180/header.jpg", developer: "Rockstar Games", mood: "Epic", description: "Ein episches Western-Epos.", platforms: ["PC", "PS4", "Xbox One", "Stadia"], steamId: 1174180 },
  { id: 8003, name: "God of War (2018)", rating: 9.4, genre: "Action", playtime: "40-60h", year: 2018, img: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1593500/header.jpg", developer: "Santa Monica Studio", mood: "Epic", description: "Eine emotionale Reise durch die nordische Mythologie.", platforms: ["PC", "PS4", "PS5"], steamId: 1593500 },
  { id: 8004, name: "Cyberpunk 2077", rating: 8.5, genre: "RPG", playtime: "60-100h", year: 2020, img: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1091500/header.jpg", developer: "CD Projekt Red", mood: "Action", description: "Ein Open-World-RPG in einer dystopischen Zukunft.", platforms: ["PC", "PS5", "Xbox Series X", "PS4", "Xbox One"], steamId: 1091500 },
  { id: 8005, name: "Elden Ring", rating: 9.5, genre: "Open World", playtime: "100h+", year: 2022, img: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1245620/header.jpg", developer: "FromSoftware", mood: "Challenging", description: "Ein Meisterwerk des Open-World-Action-RPGs.", platforms: ["PC", "PS5", "Xbox Series X", "PS4"], steamId: 1245620 },
  { id: 8006, name: "Baldur's Gate 3", rating: 9.6, genre: "RPG", playtime: "100h+", year: 2023, img: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1086940/header.jpg", developer: "Larian Studios", mood: "Epic", description: "Das ultimative D&D-Rollenspielerlebnis.", platforms: ["PC", "PS5", "Xbox Series X"], steamId: 1086940 }
];

const MANUAL_HIDDEN_GEMS = [
  { id: 9001, name: "CrossCode", rating: 9.1, genre: "RPG", playtime: "40-60h", year: 2018, img: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/368340/header.jpg", developer: "Radical Fish Games", mood: "Action", description: "Ein Action-RPG im Retro-Stil mit modernen Elementen.", platforms: ["PC", "Switch", "PS4", "Xbox One"], steamId: 368340 },
  { id: 9002, name: "Outer Wilds", rating: 9.3, genre: "Adventure", playtime: "20-40h", year: 2019, img: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/753640/header.jpg", developer: "Mobius Digital", mood: "Mystery", description: "Ein Open-World-Mystery-Spiel über ein Sonnensystem in einer Zeitschleife.", platforms: ["PC", "PS4", "Xbox One", "Switch"], steamId: 753640 },
  { id: 9003, name: "Return of the Obra Dinn", rating: 9.2, genre: "Puzzle", playtime: "10-20h", year: 2018, img: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/653530/header.jpg", developer: "Lucas Pope", mood: "Mystery", description: "Ein Detektivspiel in einzigartiger 1-Bit-Grafik.", platforms: ["PC", "Switch", "PS4", "Xbox One"], steamId: 653530 },
  { id: 9004, name: "Hades", rating: 9.3, genre: "Action", playtime: "40-60h", year: 2020, img: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1145360/header.jpg", developer: "Supergiant Games", mood: "Action", description: "Ein Roguelite-Actionspiel mit griechischer Mythologie.", platforms: ["PC", "Switch", "PS4", "Xbox"], steamId: 1145360 }
];

const translations = {
  en: { home: "Discover", library: "Library", profile: "Profile", friends: "Friends", ai: "AI Assistant", aoty: "AOTY", random: "Random", playlists: "Playlists", compare: "Compare", activity: "Activity", wishlist: "Wishlist", backlog: "Backlog Cleaner", tags: "Tags", journal: "Journal", export: "Export", import: "Import", theme: "Theme", dark: "Dark", light: "Light", auto: "Auto", randomGame: "Random Game", yearFilter: "Year", allYears: "All Years", login: "Login", register: "Register", logout: "Logout", search: "Search games...", searchAOTY: "Search by year or game name...", mood: "What's your mood?", genre: "Pick your genres", playtime: "How long?", next: "Next", results: "Show Results", topPicks: "Top Picks", bestEver: "Best Ever", allResults: "All Results", hiddenGems: "Hidden Gems", sort: "Sort", bestMatch: "Best Match", rating: "Rating", year: "Year", add: "Add to Library", inLibrary: "In Library", reviews: "Reviews", played: "Played", remove: "Remove", editProfile: "Edit Profile", username: "Username", bio: "Bio", private: "Private profile", save: "Save", achievements: "Achievements", firstGame: "First Game", collector: "Collector", completionist: "Completionist", recentlyPlayed: "Recently Played", favorites: "Favorites", total: "Total", playing: "Playing", completed: "Completed", rollAgain: "Roll Again", close: "Close", back: "Back", buyOn: "Buy on", writeReview: "Write Review", yourReview: "Your review...", submit: "Submit", noReviews: "No reviews yet", findFriends: "Find Friends", settings: "Settings", sound: "Sound Effects", language: "Language", steamId: "Steam ID", importGames: "Import Steam Games", findSteamId: "How to find your Steam ID", donate: "Support the developer", topRated: "Top Rated Game", topGenre: "Top Genre", totalPlaytime: "Total Playtime", aotyTitle: "Game of the Year", top10: "Top 10 by Genre", findYourGame: "Find Your Game", allAwards: "All Awards", backToAOTY: "Back to AOTY Overview", createPlaylist: "Create Playlist", playlistName: "Playlist Name", addToPlaylist: "Add to Playlist", gameNightMode: "Game Night Mode", spinWheel: "Spin the Wheel", excludeMultiplayer: "Exclude Multiplayer", activityFeed: "Activity Feed", addToWishlist: "Add to Wishlist", checkPrice: "Check Price", backlogTip: "You should play", addTag: "Add Tag", compareGames: "Compare Games", selectGame: "Select Game", journalNotes: "My Notes", exportLibrary: "Export Library", importLibrary: "Import Library", themeSelect: "Select Theme", loading: "Loading...", showMore: "Show more", showLess: "Show less", winner: "Winner", graphics: "Graphics", story: "Story", gameplay: "Gameplay", replayability: "Replayability", steamConnect: "Steam Connect", level: "Level", xp: "XP", badges: "Badges", completionProgress: "Completion Progress", quickStats: "Quick Stats" },
  de: { home: "Entdecken", library: "Bibliothek", profile: "Profil", friends: "Freunde", ai: "KI-Assistent", aoty: "AOTY", random: "Zufall", playlists: "Playlists", compare: "Vergleichen", activity: "Aktivitäten", wishlist: "Wunschliste", backlog: "Backlog Reiniger", tags: "Tags", journal: "Tagebuch", export: "Exportieren", import: "Importieren", theme: "Design", dark: "Dunkel", light: "Hell", auto: "Auto", randomGame: "Zufälliges Spiel", yearFilter: "Jahr", allYears: "Alle Jahre", login: "Anmelden", register: "Registrieren", logout: "Abmelden", search: "Spiele suchen...", searchAOTY: "Suche nach Jahr oder Spielname...", mood: "Wie ist deine Stimmung?", genre: "Wähle deine Genres", playtime: "Wie lange?", next: "Weiter", results: "Ergebnisse", topPicks: "Top Empfehlungen", bestEver: "Beste Aller Zeiten", allResults: "Alle Ergebnisse", hiddenGems: "Geheimtipps", sort: "Sortieren", bestMatch: "Bester Treffer", rating: "Bewertung", year: "Jahr", add: "Zur Bibliothek", inLibrary: "In Bibliothek", reviews: "Bewertungen", played: "Gespielt", remove: "Entfernen", editProfile: "Profil bearbeiten", username: "Benutzername", bio: "Über mich", private: "Privates Profil", save: "Speichern", achievements: "Erfolge", firstGame: "Erstes Spiel", collector: "Sammler", completionist: "Vollender", recentlyPlayed: "Zuletzt gespielt", favorites: "Favoriten", total: "Gesamt", playing: "Spielt", completed: "Abgeschlossen", rollAgain: "Nochmal", close: "Schließen", back: "Zurück", buyOn: "Kaufen auf", writeReview: "Bewertung schreiben", yourReview: "Deine Bewertung...", submit: "Speichern", noReviews: "Keine Bewertungen", findFriends: "Freunde finden", settings: "Einstellungen", sound: "Soundeffekte", language: "Sprache", steamId: "Steam ID", importGames: "Steam Spiele importieren", findSteamId: "So findest du deine Steam ID", donate: "Unterstütze den Entwickler", topRated: "Bestbewertetes Spiel", topGenre: "Top Genre", totalPlaytime: "Spielzeit Gesamt", aotyTitle: "Spiel des Jahres", top10: "Top 10 pro Genre", findYourGame: "Finde dein Spiel", allAwards: "Alle Auszeichnungen", backToAOTY: "Zurück zur AOTY Übersicht", createPlaylist: "Playlist erstellen", playlistName: "Playlist Name", addToPlaylist: "Zu Playlist hinzufügen", gameNightMode: "Spielabend Modus", spinWheel: "Rad drehen", excludeMultiplayer: "Multiplayer ausschließen", activityFeed: "Aktivitäten Feed", addToWishlist: "Zur Wunschliste", checkPrice: "Preis prüfen", backlogTip: "Du solltest spielen", addTag: "Tag hinzufügen", compareGames: "Spiele vergleichen", selectGame: "Spiel auswählen", journalNotes: "Meine Notizen", exportLibrary: "Bibliothek exportieren", importLibrary: "Bibliothek importieren", themeSelect: "Design auswählen", loading: "Laden...", showMore: "Mehr anzeigen", showLess: "Weniger anzeigen", winner: "Gewinner", graphics: "Grafik", story: "Geschichte", gameplay: "Spielspaß", replayability: "Wiederspielwert", steamConnect: "Steam Verbindung", level: "Level", xp: "XP", badges: "Abzeichen", completionProgress: "Fortschritt", quickStats: "Schnellstatistiken" }
};

const RAWG_API_KEY = "4da2c00cf3b2459d988e0ed0ac16988d";

const translateGenre = (genreName) => {
  const map = { Action: "Action", Adventure: "Adventure", RPG: "RPG", Indie: "Indie", Strategy: "Strategy", Shooter: "Shooter", Horror: "Horror", Puzzle: "Puzzle", Simulation: "Simulation", Platformer: "Platformer", "Open World": "Open World", "Story Rich": "Story Rich", Racing: "Racing", Fighting: "Fighting", Sports: "Sports" };
  return map[genreName] || genreName;
};

let steamGamesCache = {};

const calculateWeightedRating = (game, steamData) => {
  let baseRating = game.rawgRating || game.rating || 7.5;
  let finalRating = baseRating;
  if (game.name?.toLowerCase().includes("elden ring")) finalRating = 9.5;
  if (game.name?.toLowerCase().includes("baldur's gate 3")) finalRating = 9.6;
  if (game.name?.toLowerCase().includes("witcher 3")) finalRating = 9.4;
  if (game.name?.toLowerCase().includes("red dead redemption 2")) finalRating = 9.6;
  return Math.round(finalRating * 10) / 10;
};

const generateLongDescription = (gameName, rawDescription) => {
  if (rawDescription && rawDescription.length > 200) return rawDescription;
  return `${gameName} ist ein herausragendes Spiel, das die Herzen von Gamern erobert hat. Die Entwickler haben viel Liebe zum Detail gesteckt. Die Spielmechanik ist intuitiv und tiefgründig. Ein absolutes Muss!`;
};

const getGameImage = (rawgImg, gameName, steamData) => {
  if (steamData?.img && !steamData.img.includes("null")) return steamData.img;
  if (rawgImg && !rawgImg.includes("null") && !rawgImg.includes("placeholder")) return rawgImg;
  const manualGame = MANUAL_GAMES.find(g => g.name === gameName);
  if (manualGame?.img) return manualGame.img;
  const hiddenGem = MANUAL_HIDDEN_GEMS.find(g => g.name === gameName);
  if (hiddenGem?.img) return hiddenGem.img;
  return `https://placehold.co/300x400/14141f/ffd400?text=${encodeURIComponent(gameName?.slice(0, 8) || "Game")}`;
};

const getTrailerUrl = (game) => `https://www.youtube.com/embed?listType=search&q=${encodeURIComponent(game.name)}+trailer`;

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
  const [aiMessages, setAiMessages] = useState([{ role: "assistant", content: "🎮 Hallo! Ich bin dein KI-Gaming-Assistent! Frag mich nach Spielen, Tipps oder lass dir was empfehlen!" }]);
  const [aiInput, setAiInput] = useState("");
  const aiChatEndRef = useRef(null);
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
  const [profilePicUrl, setProfilePicUrl] = useState(null);
  const [profilePicUploading, setProfilePicUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [userLevel, setUserLevel] = useState(1);
  const [userXP, setUserXP] = useState(0);
  const [userBadges, setUserBadges] = useState([]);

  const text = translations[lang];

  const scrollToBottom = () => { aiChatEndRef.current?.scrollIntoView({ behavior: "smooth" }); };
  useEffect(() => { scrollToBottom(); }, [aiMessages]);

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
    if (library.length >= 25) badges.push({ id: "master", name: "Game Master", icon: "👑" });
    if (gameDetailReviews.length >= 5) badges.push({ id: "critic", name: "The Critic", icon: "✍️" });
    if (library.filter(g => g.status === "completed").length >= 5) badges.push({ id: "completionist", name: "Vollender", icon: "✅" });
    if (newLevel >= 5) badges.push({ id: "veteran", name: "Veteran", icon: "🎖️" });
    if (newLevel >= 10) badges.push({ id: "legend", name: "Legend", icon: "🏆" });
    setUserBadges(badges);
  };

  useEffect(() => { if (user) updateUserLevel(); }, [library, favorites, gameDetailReviews, gameJournal]);

  const toggleDescription = (gameId) => { setExpandedDescriptions(prev => ({ ...prev, [gameId]: !prev[gameId] })); };
  const closeReviews = () => { setShowReviews(false); setReviewsGame(null); };
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
    setPlaylists(playlists.map(p => p.id === playlistId && !p.games.find(g => g.id === game.id) ? { ...p, games: [...p.games, game] } : p));
  };

  const removeFromPlaylist = (playlistId, gameId) => {
    setPlaylists(playlists.map(p => p.id === playlistId ? { ...p, games: p.games.filter(g => g.id !== gameId) } : p));
  };

  const deletePlaylist = (playlistId) => { setPlaylists(playlists.filter(p => p.id !== playlistId)); };

  const spinGameNight = () => {
    setSpinning(true);
    let pool = [...gamesWithData, ...MANUAL_GAMES, ...MANUAL_HIDDEN_GEMS];
    if (gameNightFilters.excludeMultiplayer) pool = pool.filter(g => !g.genre?.includes("Multiplayer") && !g.genre?.includes("Co-op"));
    pool = pool.filter(g => (g.finalRating || g.rating) >= gameNightFilters.minRating);
    if (gameNightFilters.maxPlaytime) {
      const maxHours = parseInt(gameNightFilters.maxPlaytime);
      pool = pool.filter(g => { const hours = parseInt(g.playtime?.match(/\d+/)?.[0]) || 0; return hours <= maxHours; });
    }
    if (pool.length === 0) pool = [...gamesWithData, ...MANUAL_GAMES, ...MANUAL_HIDDEN_GEMS];
    setTimeout(() => { setSpinResult(pool[Math.floor(Math.random() * pool.length)]); setSpinning(false); }, 500);
  };

  useEffect(() => {
    if (library.length > 0 && user) {
      setActivityFeed(prev => [{ id: Date.now(), type: "library_update", message: `${userData?.username} hat ${library.length} Spiele in der Bibliothek`, timestamp: new Date().toISOString() }, ...prev].slice(0, 20));
    }
  }, [library.length, user, userData]);

  const addActivity = (type, gameName) => {
    setActivityFeed(prev => [{ id: Date.now(), type: type, message: `${userData?.username} hat ${gameName} ${type === "add" ? "hinzugefügt" : type === "completed" ? "abgeschlossen" : "gespielt"}`, timestamp: new Date().toISOString() }, ...prev].slice(0, 20));
  };

  const getBacklogRecommendation = () => {
    const unplayed = library.filter(g => g.status !== "completed" && g.status !== "playing");
    if (unplayed.length === 0) return "Keine Spiele im Backlog! 🎉";
    return [...unplayed].sort((a, b) => (b.finalRating || b.rating) - (a.finalRating || a.rating))[0];
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
  };

  const addTag = (gameId, tag) => {
    if (!tag.trim()) return;
    setCustomTags(prev => ({ ...prev, [gameId]: [...(prev[gameId] || []), tag.trim()] }));
  };

  const removeTag = (gameId, tagIndex) => {
    setCustomTags(prev => ({ ...prev, [gameId]: prev[gameId].filter((_, i) => i !== tagIndex) }));
  };

  const saveJournalNote = (gameId, note) => {
    setGameJournal(prev => ({ ...prev, [gameId]: note }));
  };

  const fetchGamesFromRAWG = async () => {
    setGamesLoading(true);
    try {
      let allFetchedGames = [];
      for (let page = 1; page <= 2; page++) {
        const response = await fetch(`https://api.rawg.io/api/games?key=${RAWG_API_KEY}&metacritic=70,100&exclude_tags=nsfw,adult&page_size=50&page=${page}&ordering=-metacritic`);
        const data = await response.json();
        if (data.results) {
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
            platforms: game.platforms?.map(p => p.platform.name) || [],
            steamId: null,
            popularity: game.metacritic || 70
          }));
          allFetchedGames = [...allFetchedGames, ...translatedGames];
        }
      }
      const uniqueGames = [...allFetchedGames, ...MANUAL_GAMES, ...MANUAL_HIDDEN_GEMS].filter((game, index, self) => index === self.findIndex(g => g.name.toLowerCase() === game.name.toLowerCase()));
      setAllGames(uniqueGames);
    } catch (error) { console.error(error); } finally { setGamesLoading(false); }
  };

  useEffect(() => { fetchGamesFromRAWG(); }, []);

  const fetchSteamRatings = async (appIds) => {
    const validIds = appIds.filter(id => id && !steamGamesCache[id]);
    if (validIds.length === 0) return;
    try {
      await Promise.all(validIds.map(appId => fetch(`https://store.steampowered.com/api/appdetails?appids=${appId}&cc=de`).then(res => res.json()).then(data => {
        if (data[appId]?.success) {
          const gameData = data[appId].data;
          steamGamesCache[appId] = { steamRating: gameData.metacritic ? gameData.metacritic.score / 10 : null, reviewCount: gameData.recommendations?.total || 0, img: gameData.header_image, name: gameData.name };
        }
      }).catch(() => {})));
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
    const rawgGems = gamesWithData.filter(g => g.finalRating >= 8.5 && g.reviewCount < 20000 && (g.genre === "Indie" || g.genre === "Puzzle" || g.genre === "Adventure")).slice(0, 20);
    const manualGemsWithRating = MANUAL_HIDDEN_GEMS.map(g => ({ ...g, finalRating: calculateWeightedRating(g, null), finalImg: g.img, finalDescription: g.description || generateLongDescription(g.name, "") }));
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
    return [...gamesWithData].sort((a, b) => { if (b.finalRating !== a.finalRating) return b.finalRating - a.finalRating; return b.year - a.year; }).slice(0, 40);
  }, [gamesWithData]);

  const top10ByGenre = useMemo(() => {
    let filtered = gamesWithData.filter(g => { if (!g.genre) return false; return g.genre.toLowerCase() === selectedGenreForTop.toLowerCase(); });
    if (filtered.length < 10) filtered = [...filtered, ...MANUAL_GAMES.filter(g => g.genre === selectedGenreForTop)];
    return [...filtered].sort((a, b) => { if (b.finalRating !== a.finalRating) return b.finalRating - a.finalRating; return b.year - a.year; }).slice(0, 10);
  }, [gamesWithData, selectedGenreForTop]);

  const searchAOTY = () => {
    const search = aotySearch.trim().toLowerCase();
    if (!search) { setAotyResult(null); setSelectedAotyYear(null); return; }
    const yearMatch = search.match(/^\d{4}$/);
    if (yearMatch) { const year = parseInt(search); if (AOTY_DATA[year]) { setAotyResult({ type: "year", year, data: AOTY_DATA[year] }); setSelectedAotyYear(year); } else setAotyResult({ type: "error", message: `No data for ${year}` }); return; }
    for (const [year, data] of Object.entries(AOTY_DATA)) { if (data.winner?.toLowerCase().includes(search)) { setAotyResult({ type: "game", year, game: data.winner, data }); setSelectedAotyYear(year); return; } }
    setAotyResult({ type: "error", message: "Game not found" });
  };

  useEffect(() => { searchAOTY(); }, [aotySearch]);

  const doRandom = () => {
    setLoadingAction(true);
    setTimeout(() => {
      let pool = [...gamesWithData, ...MANUAL_GAMES, ...MANUAL_HIDDEN_GEMS];
      if (randomExcludeHorror) pool = pool.filter(g => g.mood !== "Horror" && g.genre !== "Horror");
      if (randomExcludeIndie) pool = pool.filter(g => g.genre !== "Indie");
      if (randomExcludeOld) pool = pool.filter(g => g.year >= 2015);
      if (randomYear !== "all") pool = pool.filter(g => g.year === parseInt(randomYear));
      pool = pool.filter(g => (g.finalRating || g.rating) >= randomMinRating);
      if (randomMode === "genre" && pool.length) { const randomGenre = pool[Math.floor(Math.random() * pool.length)].genre; pool = pool.filter(g => g.genre === randomGenre); }
      if (randomMode === "mood" && pool.length) { const randomMood = pool[Math.floor(Math.random() * pool.length)].mood; pool = pool.filter(g => g.mood === randomMood); }
      if (!pool.length) pool = [...gamesWithData, ...MANUAL_GAMES, ...MANUAL_HIDDEN_GEMS];
      setRandomGame(pool[Math.floor(Math.random() * pool.length)]);
      setShowRandomModal(true);
      setLoadingAction(false);
    }, 500);
  };

  const playSound = (type) => { if (!soundEnabled || !audioInitialized) return; const audio = new Audio(); audio.volume = 0.2; audio.play().catch(() => {}); };
  const initAudio = () => { if (!audioInitialized && soundEnabled) setAudioInitialized(true); };

  const sendAiMessage = async () => {
    if (!aiInput.trim()) return;
    const userMessage = aiInput.trim();
    setAiMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setAiInput("");
    setIsAiLoading(true);
    
    const getLocalResponse = (msg) => {
      const lowerMsg = msg.toLowerCase();
      if (lowerMsg.includes("empfehl") || lowerMsg.includes("vorschlag")) {
        const random = TOP_PICKS_GAMES[Math.floor(Math.random() * TOP_PICKS_GAMES.length)];
        return `🎮 **Spielempfehlung:** ${random.name}\n⭐ Bewertung: ${random.finalRating}/10\n🎭 Genre: ${random.genre}\n⏱️ Spielzeit: ${random.playtime}\n\n${random.finalDescription?.substring(0, 150)}...`;
      }
      if (lowerMsg.includes("witcher")) return "🐺 **The Witcher 3 Tipps:** Mach alle Nebenquests, lerne Gwent, die DLCs sind ein Muss!";
      if (lowerMsg.includes("elden ring")) return "🗡️ **Elden Ring Tipps:** Level Lebenspunkte zuerst, erkunde Limgrave gründlich, nutze Geisterbeschwörungen!";
      return `Danke für deine Frage! Ich kann dir helfen mit:\n• Spielempfehlungen\n• Spiel-Tipps\n• Genre-Fragen\n• Backlog Priorisierung\n\nWas möchtest du wissen?`;
    };
    
    try {
      const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${DEEPSEEK_API_KEY}` },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            { role: "system", content: "Du bist ein Gaming-Assistent. Antworte auf Deutsch, freundlich und mit Emojis. Gib konkrete Spieltipps." },
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
      } else { setAiMessages(prev => [...prev, { role: "assistant", content: getLocalResponse(userMessage) }]); }
    } catch (error) { setAiMessages(prev => [...prev, { role: "assistant", content: getLocalResponse(userMessage) }]); }
    finally { setIsAiLoading(false); }
  };

  const handleProfilePicUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || !user) return;
    setProfilePicUploading(true);
    try {
      const storage = getStorage();
      const storageRef = ref(storage, `profile_pics/${user.uid}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      setProfilePicUrl(downloadURL);
      await saveProfileToFirestore(user.uid, { profilePic: downloadURL });
      setUserData(prev => ({ ...prev, profilePic: downloadURL }));
    } catch (error) { console.error("Fehler:", error); alert("Fehler beim Hochladen des Profilbildes"); }
    finally { setProfilePicUploading(false); }
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
          if (profile?.profilePic) setProfilePicUrl(profile.profilePic);
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
  useEffect(() => { if (user && profilePicUrl) saveProfileToFirestore(user.uid, { profilePic: profilePicUrl }); }, [profilePicUrl, user]);

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
          const matchingGame = gamesWithData.find(g => g.name.toLowerCase().includes(steamGame.name.toLowerCase()) || steamGame.name.toLowerCase().includes(g.name.toLowerCase()));
          if (matchingGame && !library.find(l => l.id === matchingGame.id)) { addToLibrary(matchingGame); importedCount++; }
        });
        setPlatformLinks(prev => ({ ...prev, steam: true }));
        await saveProfileToFirestore(user.uid, { platformLinks: { ...platformLinks, steam: true } });
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
    if (editBio !== userData?.bio) { await updateBio(user.uid, editBio); setUserData({ ...userData, bio: editBio }); await saveProfileToFirestore(user.uid, { bio: editBio }); }
    if (editPrivate !== userData?.isPrivate) { await togglePrivacy(user.uid, editPrivate); setUserData({ ...userData, isPrivate: editPrivate }); }
    setEditSuccess("Profile updated!");
    setTimeout(() => setShowEditModal(false), 1500);
    setLoadingAction(false);
  };

  const openEditModal = () => { setEditUsername(userData?.username || ""); setEditBio(userData?.bio || ""); setEditPrivate(userData?.isPrivate || false); setEditError(""); setEditSuccess(""); setShowEditModal(true); };

  const openGameDetail = async (game) => {
    initAudio();
    setLoadingAction(true);
    try {
      const fullGame = [...gamesWithData, ...MANUAL_GAMES, ...MANUAL_HIDDEN_GEMS].find(g => g.id === game.id) || game;
      if (!fullGame) { alert("Spiel konnte nicht geladen werden."); setLoadingAction(false); return; }
      setSelectedGameDetail(fullGame);
      const reviews = await getGameReviews(fullGame.id);
      setGameDetailReviews(reviews);
      setCurrentTab("gameDetail");
    } catch (error) { console.error("Error loading game detail:", error); alert("Fehler beim Laden des Spiels."); }
    finally { setLoadingAction(false); }
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
    updateUserLevel();
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
      updateUserLevel();
    }
    playSound("click");
    setLoadingAction(false);
  };
  
  const toggleFavorite = (id) => setFavorites(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

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
    const allGamesList = [...gamesWithData, ...MANUAL_GAMES, ...MANUAL_HIDDEN_GEMS];
    const gamesWithRatings = library.map(libGame => ({ ...libGame, finalRating: allGamesList.find(g => g.id === libGame.id)?.finalRating || allGamesList.find(g => g.id === libGame.id)?.rating || 7.0 }));
    const topRated = [...gamesWithRatings].sort((a,b) => b.finalRating - a.finalRating)[0];
    const genreCount = {}; library.forEach(g => genreCount[g.genre] = (genreCount[g.genre] || 0) + 1);
    const topGenre = Object.entries(genreCount).sort((a,b) => b[1] - a[1])[0]?.[0] || "None";
    const totalPlaytime = library.reduce((sum, g) => sum + (parseInt(g.playtime?.match(/\d+/)?.[0]) || 0), 0);
    const avgRating = gamesWithRatings.reduce((sum, g) => sum + g.finalRating, 0) / gamesWithRatings.length;
    return { topRated, topGenre, totalPlaytime, avgRating: avgRating.toFixed(1) };
  }, [library, gamesWithData]);

  const achievements = [
    { id: "first", name: text.firstGame, desc: "First game added", icon: "🏅", unlocked: library.length >= 1 },
    { id: "collector", name: text.collector, desc: "10 games", icon: "🎮", unlocked: library.length >= 10 },
    { id: "completionist", name: text.completionist, desc: "5 completed", icon: "✅", unlocked: library.filter(g => g.status === "completed").length >= 5 },
    { id: "favorites", name: "5 Favorites", desc: "5 games in favorites", icon: "❤️", unlocked: favorites.length >= 5 },
    { id: "master", name: "Game Master", desc: "25 games", icon: "👑", unlocked: library.length >= 25 },
    { id: "level5", name: "Level 5", desc: "Reach Level 5", icon: "⭐", unlocked: userLevel >= 5 },
    { id: "level10", name: "Level 10", desc: "Reach Level 10", icon: "🏆", unlocked: userLevel >= 10 }
  ];

  const currentColors = theme === "dark" ? colors : theme === "light" ? { ...colors, bg: "#ffffff", bgCard: "#f0f0f0", text: "#000000", textSecondary: "#333333", textMuted: "#666666" } : colors;

  const animationStyles = `
    @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes slideIn { from { opacity: 0; transform: translateY(-50px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes wheelSpin { 0% { transform: rotate(0deg); } 100% { transform: rotate(1440deg); } }
    @keyframes pulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }
    .fade-in { animation: fadeIn 0.4s ease-out; }
    .slide-in { animation: slideIn 0.3s ease-out; }
    .game-card { transition: all 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1); cursor: pointer; background: ${currentColors.bgCard}; border-radius: 20px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08); }
    .game-card:hover { transform: translateY(-8px) scale(1.02); box-shadow: 0 20px 30px -12px rgba(0,0,0,0.5); border-color: ${currentColors.primary}40; }
    .btn-click:active { transform: scale(0.96); }
    .spinning-wheel { animation: wheelSpin 0.5s ease-out; }
    .pulse-dot { animation: pulse 1s infinite; }
    @media (max-width: 768px) { .hamburger-btn { display: flex !important; } .main-tabs-desktop { display: none !important; } }
    @media (min-width: 769px) { .hamburger-btn { display: none !important; } .main-tabs-desktop { display: flex !important; } }
  `;

  useEffect(() => { const style = document.createElement("style"); style.textContent = animationStyles; document.head.appendChild(style); }, [currentColors]);

  const styles = {
    app: { background: currentColors.bg, minHeight: "100vh", width: "100%", color: currentColors.text, fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" },
    container: { maxWidth: 1400, margin: "0 auto", padding: "0 24px" },
    header: { padding: "20px 0", borderBottom: `1px solid rgba(255,212,0,0.15)`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 },
    logo: { fontSize: 24, fontWeight: 800, display: "flex", alignItems: "center", gap: 12, cursor: "pointer" },
    logoIcon: { background: `linear-gradient(135deg, ${currentColors.primary} 0%, ${currentColors.primaryDark} 100%)`, borderRadius: "14px", padding: "10px 12px", color: currentColors.bg, display: "flex", alignItems: "center", gap: 8 },
    logoIconText: { fontSize: 20 },
    logoText: { background: `linear-gradient(135deg, ${currentColors.primary} 0%, ${currentColors.primaryDark} 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontSize: 22 },
    rightSection: { display: "flex", alignItems: "center", gap: 20 },
    badge10k: { background: currentColors.primary, color: currentColors.bg, borderRadius: "20px", padding: "6px 14px", fontSize: 13, fontWeight: 700 },
    mainTabs: { display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", justifyContent: "flex-start" },
    mainTab: (active) => ({ background: active ? currentColors.primary : "rgba(255,255,255,0.08)", border: "none", borderRadius: 14, padding: "12px 28px", color: active ? currentColors.bg : currentColors.text, cursor: "pointer", fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", gap: 10, transition: "all 0.2s ease", whiteSpace: "nowrap" }),
    iconBtn: { background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 14, padding: "12px 18px", color: currentColors.text, cursor: "pointer", display: "flex", alignItems: "center", gap: 10, fontSize: 14, transition: "all 0.2s ease" },
    loginBtn: { background: "linear-gradient(135deg, #4285f4, #3367d6)", border: "none", borderRadius: 14, padding: "12px 28px", color: "#fff", cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: 10, fontSize: 14, transition: "all 0.2s ease" },
    logoutBtn: { background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 14, padding: "12px 28px", color: currentColors.text, cursor: "pointer", display: "flex", alignItems: "center", gap: 10, fontSize: 14, transition: "all 0.2s ease" },
    userAvatar: { width: 44, height: 44, borderRadius: "50%", background: currentColors.primary, display: "flex", alignItems: "center", justifyContent: "center", color: currentColors.bg, fontWeight: 700, fontSize: 18, objectFit: "cover" },
    hamburgerBtn: { background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 14, padding: "12px", color: currentColors.text, cursor: "pointer", alignItems: "center", gap: 8, fontSize: 22, display: "none" },
    mobileMenu: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: currentColors.bg, zIndex: 1000, padding: "24px", overflowY: "auto", transform: mobileMenuOpen ? "translateX(0)" : "translateX(-100%)", transition: "transform 0.3s ease" },
    mobileMenuClose: { position: "absolute", top: 20, right: 20, background: "rgba(255,255,255,0.1)", border: "none", borderRadius: "50%", padding: "12px", cursor: "pointer", color: currentColors.text },
    mobileMenuItem: { display: "flex", alignItems: "center", gap: 14, padding: "16px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", width: "100%", background: "none", border: "none", color: currentColors.text, fontSize: 16, cursor: "pointer" },
    tabNav: { display: "flex", gap: 8, borderBottom: `1px solid rgba(255,255,255,0.08)`, marginTop: 24, marginBottom: 24, overflowX: "auto", flexWrap: "nowrap" },
    tabNavBtn: (active) => ({ background: "none", border: "none", borderBottom: active ? `3px solid ${currentColors.primary}` : "3px solid transparent", color: active ? currentColors.primary : currentColors.textSecondary, padding: "10px 24px", cursor: "pointer", fontSize: 13, fontWeight: active ? 600 : 400, whiteSpace: "nowrap" }),
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 28 },
    gameCard: { background: currentColors.bgCard, borderRadius: 20, overflow: "hidden", cursor: "pointer", border: "1px solid rgba(255,255,255,0.08)", transition: "all 0.3s ease", position: "relative" },
    gameImg: { width: "100%", aspectRatio: "3/4", objectFit: "cover" },
    gameInfo: { padding: "16px" },
    gameName: { fontSize: 15, fontWeight: 700, marginBottom: 6, color: currentColors.text, wordWrap: "break-word", whiteSpace: "normal", lineHeight: 1.3 },
    rating: { display: "flex", alignItems: "center", gap: 6, color: currentColors.primary, fontSize: 13, fontWeight: 600, marginBottom: 8 },
    addBtn: { background: currentColors.primary, border: "none", borderRadius: 12, padding: "10px 14px", fontSize: 14, fontWeight: 600, cursor: "pointer", width: "100%", marginTop: 10, color: currentColors.bg, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.2s ease" },
    searchBar: { background: currentColors.bgCard, border: `1px solid rgba(255,255,255,0.08)`, borderRadius: 16, padding: "14px 20px", color: currentColors.text, fontSize: 15, width: "100%", marginBottom: 28, outline: "none", transition: "all 0.2s ease" },
    pillGrid: { display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 28 },
    pill: (selected) => ({ background: selected ? currentColors.primary : "rgba(255,255,255,0.06)", border: "none", borderRadius: 40, padding: "12px 24px", color: selected ? currentColors.bg : currentColors.text, cursor: "pointer", fontSize: 14, fontWeight: selected ? 600 : 400, transition: "all 0.2s ease" }),
    nextBtn: { background: currentColors.primary, border: "none", borderRadius: 16, padding: "14px 32px", fontSize: 16, fontWeight: 600, cursor: "pointer", color: currentColors.bg, marginTop: 32, width: "100%" },
    filterRow: { display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24, alignItems: "center" },
    filterBtn: (active) => ({ background: active ? currentColors.primary : "rgba(255,255,255,0.05)", border: "none", borderRadius: 10, padding: "8px 16px", color: active ? currentColors.bg : currentColors.text, cursor: "pointer", fontSize: 13, transition: "all 0.2s ease" }),
    sectionTitle: { fontSize: 24, fontWeight: 700, marginBottom: 20, display: "flex", alignItems: "center", gap: 12, color: currentColors.text },
    topPicksRow: { display: "flex", gap: 20, overflowX: "auto", marginBottom: 32, paddingBottom: 12 },
    topPickCard: { minWidth: 200, background: currentColors.bgCard, borderRadius: 16, padding: 14, cursor: "pointer", position: "relative" },
    libraryCard: { background: currentColors.bgCard, borderRadius: 16, display: "flex", gap: 16, padding: 16, marginBottom: 16, alignItems: "center", flexWrap: "wrap", transition: "all 0.2s ease" },
    libraryImg: { width: 70, height: 93, objectFit: "cover", borderRadius: 14 },
    libraryInfo: { flex: 1, minWidth: 200 },
    libraryTitle: { fontWeight: 700, fontSize: 16, color: currentColors.text, marginBottom: 6, wordWrap: "break-word" },
    libraryMeta: { fontSize: 13, color: currentColors.textSecondary, marginBottom: 8 },
    libraryActions: { display: "flex", gap: 10, flexWrap: "wrap" },
    select: { background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 10, padding: "8px 14px", color: currentColors.text, fontSize: 13, cursor: "pointer", transition: "all 0.2s ease" },
    statCard: { background: currentColors.bgCard, borderRadius: 16, padding: "20px", textAlign: "center", minWidth: 100, flex: 1, transition: "transform 0.2s ease", cursor: "pointer" },
    statNumber: { fontSize: 32, fontWeight: 800, color: currentColors.primary },
    statLabel: { fontSize: 13, color: currentColors.textSecondary, marginTop: 6 },
    statsRow: { display: "flex", gap: 16, marginBottom: 28, flexWrap: "wrap" },
    profileHeader: { display: "flex", gap: 32, alignItems: "center", background: `linear-gradient(135deg, ${currentColors.bgCard} 0%, ${currentColors.bgCard}80 100%)`, borderRadius: 32, padding: 32, marginBottom: 32, flexWrap: "wrap", justifyContent: "center", textAlign: "center", border: `1px solid ${currentColors.primary}20` },
    profileAvatarLarge: { width: 100, height: 100, borderRadius: "50%", background: `linear-gradient(135deg, ${currentColors.primary} 0%, ${currentColors.primaryDark} 100%)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 44, fontWeight: 700, color: currentColors.bg, position: "relative", objectFit: "cover" },
    cameraIcon: { position: "absolute", bottom: 0, right: 0, background: currentColors.bg, borderRadius: "50%", padding: "8px", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.3)" },
    editBtn: { background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 12, padding: "10px 20px", color: currentColors.text, cursor: "pointer", fontSize: 13, marginTop: 16, display: "inline-flex", alignItems: "center", gap: 8, transition: "all 0.2s ease" },
    lastPlayedRow: { display: "flex", gap: 20, overflowX: "auto", marginBottom: 28, paddingBottom: 12 },
    lastPlayedCard: { minWidth: 90, background: currentColors.bgCard, borderRadius: 14, padding: 12, textAlign: "center", cursor: "pointer", transition: "all 0.2s ease" },
    lastPlayedImg: { width: 66, height: 66, objectFit: "cover", borderRadius: 12, marginBottom: 8 },
    lastPlayedName: { fontSize: 12, color: currentColors.text, fontWeight: 500, wordWrap: "break-word" },
    randomFilterSection: { background: currentColors.bgCard, borderRadius: 24, padding: 24, marginBottom: 28 },
    randomFilterTitle: { fontSize: 18, fontWeight: 600, color: currentColors.text, marginBottom: 16, display: "flex", alignItems: "center", gap: 10 },
    randomFilterRow: { display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" },
    randomCheckbox: { display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 14, color: currentColors.textSecondary },
    randomSlider: { width: 200, accentColor: currentColors.primary },
    randomSelect: { background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 12, padding: "8px 16px", color: currentColors.text, fontSize: 14, cursor: "pointer" },
    aiSection: { background: currentColors.bgCard, borderRadius: 24, padding: 24, marginBottom: 28 },
    aiChatContainer: { height: 400, display: "flex", flexDirection: "column", background: currentColors.bgCard, borderRadius: 20, overflow: "hidden", marginTop: 16 },
    aiMessages: { flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 12 },
    aiMessage: (isUser) => ({ background: isUser ? currentColors.primary : "rgba(255,255,255,0.08)", color: isUser ? currentColors.bg : currentColors.text, padding: "12px 16px", borderRadius: 18, borderBottomRightRadius: isUser ? 4 : 18, borderBottomLeftRadius: isUser ? 18 : 4, maxWidth: "80%", alignSelf: isUser ? "flex-end" : "flex-start", whiteSpace: "pre-wrap" }),
    aiInputRow: { display: "flex", gap: 12, padding: 16, background: "rgba(0,0,0,0.3)", borderTop: "1px solid rgba(255,255,255,0.08)" },
    platformSection: { background: currentColors.bgCard, borderRadius: 20, padding: 20, marginBottom: 24 },
    platformRow: { display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center", marginBottom: 16 },
    platformBtn: (bgColor) => ({ background: bgColor, border: "none", borderRadius: 12, padding: "10px 20px", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, fontSize: 14, fontWeight: 500, transition: "all 0.2s ease" }),
    modalOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.96)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" },
    modalContent: { background: currentColors.bgCard, borderRadius: 32, padding: 32, width: "95%", maxWidth: 520, border: `1px solid ${currentColors.primary}30`, maxHeight: "90vh", overflowY: "auto" },
    modalTitle: { fontSize: 26, fontWeight: 700, marginBottom: 24, textAlign: "center", color: currentColors.text },
    input: { width: "100%", background: "rgba(255,255,255,0.08)", border: `1px solid rgba(255,255,255,0.1)`, borderRadius: 14, padding: "14px 18px", color: currentColors.text, fontSize: 15, marginBottom: 16, outline: "none", transition: "all 0.2s ease" },
    textarea: { width: "100%", background: "rgba(255,255,255,0.08)", border: `1px solid rgba(255,255,255,0.1)`, borderRadius: 14, padding: "14px 18px", color: currentColors.text, fontSize: 15, marginBottom: 16, outline: "none", resize: "vertical", fontFamily: "inherit" },
    passwordWrapper: { position: "relative", width: "100%" },
    passwordEye: { position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", cursor: "pointer", color: currentColors.textSecondary },
    modalBtn: { background: currentColors.primary, border: "none", borderRadius: 16, padding: "14px", fontSize: 16, fontWeight: 600, cursor: "pointer", width: "100%", marginTop: 14, color: currentColors.bg, transition: "all 0.2s ease" },
    modalBtnSecondary: { background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 16, padding: "14px", fontSize: 16, fontWeight: 600, cursor: "pointer", width: "auto", color: currentColors.text, transition: "all 0.2s ease" },
    switchText: { textAlign: "center", marginTop: 16, color: currentColors.textSecondary, fontSize: 14, cursor: "pointer" },
    errorText: { color: colors.error, fontSize: 14, textAlign: "center", marginBottom: 14 },
    successText: { color: colors.success, fontSize: 14, textAlign: "center", marginBottom: 14 },
    loadingSpinner: { width: 48, height: 48, border: `3px solid ${currentColors.primary}20`, borderTop: `3px solid ${currentColors.primary}`, borderRadius: "50%", animation: "spin 1s linear infinite" },
    loadingOverlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" },
    emptyState: { textAlign: "center", padding: 60, background: currentColors.bgCard, borderRadius: 28, color: currentColors.textSecondary, fontSize: 16 },
    reviewStars: { display: "flex", gap: 12, justifyContent: "center", marginBottom: 24 },
    reviewStar: { fontSize: 36, cursor: "pointer", color: currentColors.textSecondary, transition: "all 0.2s ease" },
    reviewCard: { background: currentColors.bgCard, borderRadius: 16, padding: 18, marginBottom: 16, transition: "all 0.2s ease" },
    reviewHeader: { display: "flex", justifyContent: "space-between", marginBottom: 10, flexWrap: "wrap", gap: 8 },
    reviewUsername: { fontWeight: 700, fontSize: 14, color: currentColors.text },
    reviewRating: { color: currentColors.primary, fontSize: 13 },
    reviewComment: { fontSize: 14, color: currentColors.textSecondary, lineHeight: 1.5, wordWrap: "break-word" },
    reviewActions: { display: "flex", gap: 18, marginTop: 14 },
    likeBtn: { display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: currentColors.textSecondary, cursor: "pointer", background: "none", border: "none", transition: "all 0.2s ease" },
    userCard: { background: currentColors.bgCard, borderRadius: 16, padding: 16, marginBottom: 16, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", transition: "all 0.2s ease" },
    userAvatarSmall: { width: 52, height: 52, borderRadius: "50%", background: currentColors.primary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 700, color: currentColors.bg },
    searchRow: { display: "flex", gap: 16, marginBottom: 28 },
    gameDetailHeader: { display: "flex", gap: 32, flexWrap: "wrap", marginBottom: 32, flexDirection: window.innerWidth <= 768 ? "column" : "row", alignItems: window.innerWidth <= 768 ? "center" : "flex-start" },
    gameDetailImg: { width: window.innerWidth <= 768 ? "100%" : 240, maxWidth: 240, borderRadius: 20, objectFit: "cover" },
    gameDetailInfo: { flex: 1 },
    gameDetailName: { fontSize: 32, fontWeight: 700, marginBottom: 10, color: currentColors.text, wordWrap: "break-word" },
    gameDetailDeveloper: { fontSize: 14, color: currentColors.textSecondary, marginBottom: 8 },
    gameDetailRating: { fontSize: 18, color: currentColors.primary, marginBottom: 14 },
    gameDetailDescription: { fontSize: 15, color: currentColors.textSecondary, lineHeight: 1.6, marginBottom: 20, wordWrap: "break-word" },
    showMoreBtn: { background: "none", border: "none", color: currentColors.primary, cursor: "pointer", fontSize: 13, marginTop: 10, display: "flex", alignItems: "center", gap: 6, transition: "all 0.2s ease" },
    gameDetailPlatforms: { display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 },
    platformBadge: { background: "rgba(255,255,255,0.1)", borderRadius: 24, padding: "6px 14px", fontSize: 13, color: currentColors.text },
    buyButtonsRow: { display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 },
    buyBtn: (bgColor) => ({ background: bgColor, border: "none", borderRadius: 12, padding: "10px 20px", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, fontSize: 14, fontWeight: 500, transition: "all 0.2s ease" }),
    backBtn: { display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.05)", border: "none", borderRadius: 14, padding: "12px 24px", color: currentColors.text, cursor: "pointer", marginBottom: 28, fontSize: 14, transition: "all 0.2s ease" },
    trailerFrame: { width: "100%", height: 360, borderRadius: 24, marginBottom: 28, border: "none", background: "#000" },
    settingsSection: { background: currentColors.bgCard, borderRadius: 24, padding: 24, marginBottom: 28 },
    settingsRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 12 },
    settingsLabel: { fontSize: 15, color: currentColors.text },
    checkbox: { display: "flex", alignItems: "center", gap: 12, marginBottom: 18, cursor: "pointer", fontSize: 14, color: currentColors.textSecondary },
    achievementGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14, marginTop: 20 },
    achievementCard: { background: "rgba(0,0,0,0.3)", borderRadius: 14, padding: 14, display: "flex", alignItems: "center", gap: 14, transition: "all 0.2s ease" },
    achievementIcon: { fontSize: 28 },
    achievementInfo: { flex: 1 },
    achievementName: { fontSize: 14, fontWeight: 600, color: currentColors.text },
    achievementDesc: { fontSize: 11, color: currentColors.textSecondary },
    donationBtn: { background: `linear-gradient(135deg, ${currentColors.primary} 0%, ${currentColors.primaryDark} 100%)`, border: "none", borderRadius: 14, padding: "12px 24px", color: currentColors.bg, cursor: "pointer", fontWeight: 700, display: "flex", alignItems: "center", gap: 8, fontSize: 14, transition: "all 0.2s ease" },
    aotyResultCard: { background: currentColors.bgCard, borderRadius: 32, padding: 32, marginBottom: 32, border: `1px solid ${currentColors.primary}30` },
    aotyWinnerCard: { background: `linear-gradient(135deg, ${currentColors.primary}10, ${currentColors.bgCard})`, borderRadius: 20, padding: 18, marginBottom: 16, cursor: "pointer", display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap", transition: "all 0.2s ease" },
    gotyBackBtn: { background: "rgba(255,255,255,0.05)", border: "none", borderRadius: 14, padding: "10px 20px", color: currentColors.text, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 24, fontSize: 14, transition: "all 0.2s ease" },
    topGenreSelect: { background: currentColors.bgCard, border: `1px solid ${currentColors.primary}30`, borderRadius: 16, padding: "14px 24px", color: currentColors.text, fontSize: 15, marginBottom: 28, cursor: "pointer", width: "100%", transition: "all 0.2s ease" },
    aotyYearCard: { background: currentColors.bgCard, borderRadius: 22, padding: 24, textAlign: "center", cursor: "pointer", border: "1px solid rgba(255,255,255,0.05)", transition: "all 0.2s ease" },
    playlistCard: { background: currentColors.bgCard, borderRadius: 24, padding: 24, marginBottom: 24, border: `1px solid ${currentColors.primary}20`, transition: "all 0.2s ease" },
    gameNightCard: { background: currentColors.bgCard, borderRadius: 28, padding: 32, marginBottom: 32, textAlign: "center" },
    wheelContainer: { margin: "28px 0", display: "flex", justifyContent: "center" },
    wheel: { width: 220, height: 220, borderRadius: "50%", background: `conic-gradient(${currentColors.primary} 0deg 72deg, ${currentColors.primaryDark} 72deg 144deg, ${colors.success} 144deg 216deg, ${colors.error} 216deg 288deg, ${colors.steam} 288deg 360deg)`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "transform 0.1s", boxShadow: "0 15px 40px rgba(0,0,0,0.4)" },
    wheelInner: { width: 70, height: 70, borderRadius: "50%", background: currentColors.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 },
    activityCard: { background: currentColors.bgCard, borderRadius: 14, padding: 14, marginBottom: 14, display: "flex", alignItems: "center", gap: 14, transition: "all 0.2s ease" },
    compareCard: { background: currentColors.bgCard, borderRadius: 32, padding: 32, marginBottom: 32 },
    compareGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, marginBottom: 28 },
    compareColumn: { background: "rgba(0,0,0,0.2)", borderRadius: 24, padding: 24, transition: "all 0.2s ease" },
    compareHeader: { fontSize: 20, fontWeight: 700, marginBottom: 20, textAlign: "center", paddingBottom: 16, borderBottom: `2px solid ${currentColors.primary}40` },
    compareRow: { display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" },
    compareLabel: { fontWeight: 600, color: currentColors.textSecondary, fontSize: 14 },
    compareValue: { fontWeight: 500, color: currentColors.text, fontSize: 14 },
    journalCard: { background: currentColors.bgCard, borderRadius: 20, padding: 20, marginBottom: 24 },
    tag: { background: "rgba(255,212,0,0.15)", borderRadius: 20, padding: "4px 12px", fontSize: 11, color: currentColors.primary, display: "inline-flex", alignItems: "center", gap: 6 },
    profileSection: { marginBottom: 32 },
    profileSectionTitle: { fontSize: 20, fontWeight: 600, marginBottom: 20, display: "flex", alignItems: "center", gap: 12, color: currentColors.text },
    progressBar: { background: `${currentColors.primary}20`, borderRadius: 10, height: 10, overflow: "hidden", marginTop: 8 },
    progressFill: { width: `${(library.filter(g => g.status === "completed").length / (library.length || 1)) * 100}%`, background: currentColors.primary, height: 10, transition: "width 0.3s ease" }
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
        <div style={{ position: "absolute", top: 12, right: 12, background: "rgba(0,0,0,0.75)", borderRadius: 24, padding: "2px 10px", fontSize: 12, fontWeight: 700, color: currentColors.primary }}>★ {rating?.toFixed(1)}</div>
        <button className="btn-click" style={{ position: "absolute", top: 12, left: 12, background: "rgba(0,0,0,0.75)", border: "none", borderRadius: 24, padding: "6px 8px", cursor: "pointer" }} onClick={(e) => { e.stopPropagation(); toggleFavorite(game.id); }}>
          {isFavorite ? <BsFillHeartFill color={currentColors.primary} size={12} /> : <FaHeart color="#fff" size={12} />}
        </button>
        <div style={styles.gameInfo}>
          <div style={styles.gameName}>{game.name}</div>
          <div style={styles.rating}><FaStar size={11} /> {rating?.toFixed(1)}</div>
          <div style={{ fontSize: 12, color: currentColors.textSecondary, marginBottom: 8 }}>{game.playtime}</div>
          {tags.length > 0 && (<div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 }}>{tags.slice(0, 2).map((tag, i) => <span key={i} style={styles.tag}>{tag}</span>)}</div>)}
          {showBtn && <button className="btn-click" style={styles.addBtn} onClick={(e) => { e.stopPropagation(); addToLibrary(game); }}>{inLibrary ? <FaCheck size={12} /> : <FaPlus size={12} />} {inLibrary ? text.inLibrary : text.add}</button>}
        </div>
      </div>
    );
  };

  const backlogRecommendation = getBacklogRecommendation();
  const completionPercentage = library.length > 0 ? Math.round((library.filter(g => g.status === "completed").length / library.length) * 100) : 0;

  if (loading || gamesLoading) {
    return (
      <div style={{ background: currentColors.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
        <div style={styles.loadingSpinner}></div>
        <div style={{ marginTop: 24, color: currentColors.text, fontSize: 16 }}>{text.loading}</div>
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
    const shortDescription = fullDescription.length > 300 ? fullDescription.substring(0, 300) + "..." : fullDescription;
    
    return (
      <div style={styles.app}>
        <div style={styles.container}>
          <div style={styles.header}>
            <div style={styles.logo} onClick={() => setCurrentTab("home")}>
              <div style={styles.logoIcon}><GiConsoleController size={20} /><span style={styles.logoIconText}>NX</span></div>
              <span style={styles.logoText}>NexPlay</span>
            </div>
            <div style={styles.rightSection}>
              <div style={styles.mainTabs}>
                <button className="btn-click" style={styles.iconBtn} onClick={() => setShowSettings(true)}><FaCog size={15} /></button>
                {!user ? <button className="btn-click" style={styles.loginBtn} onClick={() => setShowLoginModal(true)}><FaEnvelope size={15} /> {text.login}</button> :
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    {profilePicUrl ? <img src={profilePicUrl} style={styles.userAvatar} alt="avatar" /> : <div style={styles.userAvatar}>{userData?.username?.charAt(0).toUpperCase()}</div>}
                    <button className="btn-click" style={styles.logoutBtn} onClick={logout}><FaSignOutAlt size={15} /></button>
                  </div>}
                <span style={styles.badge10k}>10K</span>
              </div>
            </div>
          </div>
          <button className="btn-click" style={styles.backBtn} onClick={closeGameDetail}><FaArrowLeft size={14} /> {text.back}</button>
          <div className="fade-in" style={styles.gameDetailHeader}>
            <img src={selectedGameDetail.finalImg || selectedGameDetail.img} style={styles.gameDetailImg} alt={selectedGameDetail.name} />
            <div style={styles.gameDetailInfo}>
              <div style={styles.gameDetailName}>{selectedGameDetail.name}</div>
              <div style={styles.gameDetailDeveloper}>{selectedGameDetail.developer}</div>
              <div style={styles.gameDetailRating}>★ {(selectedGameDetail.finalRating || selectedGameDetail.rating)?.toFixed(1)} · {selectedGameDetail.year} · {selectedGameDetail.playtime}</div>
              <div style={styles.gameDetailDescription}>
                {isExpanded ? fullDescription : shortDescription}
                {fullDescription.length > 300 && (<button className="btn-click" style={styles.showMoreBtn} onClick={() => toggleDescription(selectedGameDetail.id)}>{isExpanded ? <><FaChevronUp size={12} /> {text.showLess}</> : <><FaChevronDown size={12} /> {text.showMore}</>}</button>)}
              </div>
              <div style={styles.gameDetailPlatforms}>{selectedGameDetail.platforms?.slice(0, 5).map(p => <span key={p} style={styles.platformBadge}>{p}</span>)}</div>
              <div style={styles.buyButtonsRow}>{buyLinks.map(link => <button key={link.name} className="btn-click" style={styles.buyBtn(link.color)} onClick={() => window.open(link.url, "_blank")}>{link.icon} {link.name}</button>)}</div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
                <button className="btn-click" style={{ ...styles.addBtn, width: "auto", padding: "10px 20px" }} onClick={() => addToLibrary(selectedGameDetail)}>+ {text.add}</button>
                <button className="btn-click" style={{ ...styles.addBtn, width: "auto", padding: "10px 20px", background: isOnWishlist ? colors.success : currentColors.primary }} onClick={() => { if (!isOnWishlist) addToWishlist(selectedGameDetail); }}>⭐ {text.addToWishlist}</button>
              </div>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 14 }}>{text.tags}:</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>{tags.map((tag, i) => <span key={i} style={styles.tag}>{tag} <button onClick={() => removeTag(selectedGameDetail.id, i)} style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", marginLeft: 4 }}>✕</button></span>)}</div>
                <div style={{ display: "flex", gap: 10 }}><input style={{ ...styles.input, marginBottom: 0, padding: "10px 14px", fontSize: 13 }} placeholder={text.addTag} value={newTag} onChange={e => setNewTag(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addTag(selectedGameDetail.id, newTag)} /><button className="btn-click" style={{ ...styles.addBtn, width: "auto", padding: "8px 16px" }} onClick={() => addTag(selectedGameDetail.id, newTag)}>+</button></div>
              </div>
              <div style={styles.journalCard}><div style={{ fontWeight: 600, marginBottom: 8, fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}><GiNotebook /> {text.journalNotes}</div><textarea style={{ ...styles.textarea, fontSize: 13, padding: "12px" }} rows="3" placeholder="Write your thoughts..." value={journalText} onChange={e => setJournalText(e.target.value)} onBlur={() => saveJournalNote(selectedGameDetail.id, journalText)} /></div>
            </div>
          </div>
          {selectedGameDetail.finalTrailer && <iframe src={selectedGameDetail.finalTrailer} style={styles.trailerFrame} title="Trailer" allowFullScreen />}
          <div className="fade-in">
            <div style={styles.sectionTitle}>{text.writeReview}</div>
            <div style={styles.reviewStars}>{[1,2,3,4,5].map(star => <span key={star} className="btn-click" style={{ ...styles.reviewStar, color: star <= reviewRating ? currentColors.primary : currentColors.textSecondary }} onClick={() => setReviewRating(star)}>★</span>)}</div>
            <textarea style={styles.textarea} placeholder={text.yourReview} rows="2" value={reviewComment} onChange={e => setReviewComment(e.target.value)} />
            <button className="btn-click" style={styles.modalBtn} onClick={submitGameDetailReview}>{text.submit}</button>
          </div>
          <div className="fade-in" style={{ marginTop: 28 }}>
            <div style={styles.sectionTitle}>{text.reviews} ({gameDetailReviews.length})</div>
            {gameDetailReviews.length === 0 ? <div style={styles.emptyState}>{text.noReviews}</div> : gameDetailReviews.slice(0, 5).map(review => (
              <div key={review.id} style={styles.reviewCard}>
                <div style={styles.reviewHeader}><span style={styles.reviewUsername}>{review.username || "User"}</span><span style={styles.reviewRating}>★ {review.rating}/5</span></div>
                <div style={styles.reviewComment}>{review.comment || "No comment"}</div>
                {user && (<div style={styles.reviewActions}><button className="btn-click" style={styles.likeBtn} onClick={() => handleLikeReview(review.id)}><FaThumbsUp size={12} /> {review.likes?.length || 0}</button><button className="btn-click" style={styles.likeBtn} onClick={() => handleDislikeReview(review.id)}><FaThumbsDown size={12} /> {review.dislikes?.length || 0}</button></div>)}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.app} onClick={initAudio}>
      <div className="mobile-menu-overlay" style={styles.mobileMenu}>
        <button className="btn-click" style={styles.mobileMenuClose} onClick={closeMobileMenu}><FaTimes size={24} /></button>
        <div style={{ marginTop: 60 }}>
          <button className="btn-click" style={styles.mobileMenuItem} onClick={() => { setCurrentTab("home"); closeMobileMenu(); }}><FaHome size={18} /> {text.home}</button>
          <button className="btn-click" style={styles.mobileMenuItem} onClick={() => { setCurrentTab("library"); closeMobileMenu(); }}><BsFillCollectionFill size={18} /> {text.library}</button>
          <button className="btn-click" style={styles.mobileMenuItem} onClick={() => { setCurrentTab("profile"); closeMobileMenu(); }}><FaUser size={18} /> {text.profile}</button>
          <button className="btn-click" style={styles.mobileMenuItem} onClick={() => { setCurrentTab("friends"); closeMobileMenu(); }}><FaUsers size={18} /> {text.friends}</button>
          <button className="btn-click" style={styles.mobileMenuItem} onClick={() => { setCurrentTab("ai"); closeMobileMenu(); }}><FaRobot size={18} /> {text.ai}</button>
          <button className="btn-click" style={styles.mobileMenuItem} onClick={() => { setCurrentTab("aoty"); closeMobileMenu(); }}><FaTrophy size={18} /> {text.aoty}</button>
          <button className="btn-click" style={styles.mobileMenuItem} onClick={() => { setCurrentTab("random"); closeMobileMenu(); }}><FaRandom size={18} /> {text.random}</button>
          <button className="btn-click" style={styles.mobileMenuItem} onClick={() => { setCurrentTab("playlists"); closeMobileMenu(); }}><FaList size={18} /> {text.playlists}</button>
          <button className="btn-click" style={styles.mobileMenuItem} onClick={() => { setCurrentTab("compare"); closeMobileMenu(); }}><FaBalanceScale size={18} /> {text.compare}</button>
          <button className="btn-click" style={styles.mobileMenuItem} onClick={() => { setShowSettings(true); closeMobileMenu(); }}><FaCog size={18} /> {text.settings}</button>
          {!user ? <button className="btn-click" style={{ ...styles.mobileMenuItem, background: "linear-gradient(135deg, #4285f4, #3367d6)", marginTop: 24, borderRadius: 16, justifyContent: "center", padding: "14px" }} onClick={() => { setShowLoginModal(true); closeMobileMenu(); }}><FaEnvelope size={18} /> {text.login}</button> :
            <button className="btn-click" style={{ ...styles.mobileMenuItem, background: "rgba(255,255,255,0.08)", marginTop: 24, borderRadius: 16, justifyContent: "center", padding: "14px" }} onClick={() => { logout(); closeMobileMenu(); }}><FaSignOutAlt size={18} /> {text.logout}</button>}
        </div>
      </div>

      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.logo} onClick={() => setCurrentTab("home")}>
            <div style={styles.logoIcon}><GiConsoleController size={20} /><span style={styles.logoIconText}>NX</span></div>
            <span style={styles.logoText}>NexPlay</span>
          </div>
          <div style={styles.rightSection}>
            <div className="main-tabs-desktop" style={styles.mainTabs}>
              <button className="btn-click" style={styles.mainTab(currentTab === "home")} onClick={() => setCurrentTab("home")}><FaHome size={15} /> {text.home}</button>
              <button className="btn-click" style={styles.mainTab(currentTab === "library")} onClick={() => setCurrentTab("library")}><BsFillCollectionFill size={15} /> {text.library}</button>
              <button className="btn-click" style={styles.mainTab(currentTab === "profile")} onClick={() => setCurrentTab("profile")}><FaUser size={15} /> {text.profile}</button>
              <button className="btn-click" style={styles.mainTab(currentTab === "friends")} onClick={() => setCurrentTab("friends")}><FaUsers size={15} /> {text.friends}</button>
              <button className="btn-click" style={styles.mainTab(currentTab === "ai")} onClick={() => setCurrentTab("ai")}><FaRobot size={15} /> {text.ai}</button>
              <button className="btn-click" style={styles.mainTab(currentTab === "aoty")} onClick={() => setCurrentTab("aoty")}><FaTrophy size={15} /> {text.aoty}</button>
              <button className="btn-click" style={styles.mainTab(currentTab === "random")} onClick={() => setCurrentTab("random")}><FaRandom size={15} /> {text.random}</button>
              <button className="btn-click" style={styles.mainTab(currentTab === "playlists")} onClick={() => setCurrentTab("playlists")}><FaList size={15} /> {text.playlists}</button>
              <button className="btn-click" style={styles.mainTab(currentTab === "compare")} onClick={() => setCurrentTab("compare")}><FaBalanceScale size={15} /> {text.compare}</button>
              <button className="btn-click" style={styles.iconBtn} onClick={() => setShowSettings(true)}><FaCog size={15} /></button>
              <span style={styles.badge10k}>10K</span>
              {!user ? <button className="btn-click" style={styles.loginBtn} onClick={() => setShowLoginModal(true)}><FaEnvelope size={15} /> {text.login}</button> :
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  {profilePicUrl ? <img src={profilePicUrl} style={styles.userAvatar} alt="avatar" /> : <div style={styles.userAvatar}>{userData?.username?.charAt(0).toUpperCase()}</div>}
                  <button className="btn-click" style={styles.logoutBtn} onClick={logout}><FaSignOutAlt size={15} /></button>
                </div>}
            </div>
            <button className="btn-click hamburger-btn" style={styles.hamburgerBtn} onClick={toggleMobileMenu}><FaBars size={22} /></button>
          </div>
        </div>

        {currentTab === "home" && (
          <div className="fade-in">
            <div style={styles.tabNav}>
              <button className="btn-click" style={styles.tabNavBtn(discoverSubTab === "findGame")} onClick={() => setDiscoverSubTab("findGame")}>🔍 {text.findYourGame}</button>
              <button className="btn-click" style={styles.tabNavBtn(discoverSubTab === "topPicks")} onClick={() => setDiscoverSubTab("topPicks")}>🎯 {text.topPicks}</button>
              <button className="btn-click" style={styles.tabNavBtn(discoverSubTab === "bestEver")} onClick={() => setDiscoverSubTab("bestEver")}>🏆 {text.bestEver}</button>
              <button className="btn-click" style={styles.tabNavBtn(discoverSubTab === "hiddenGems")} onClick={() => setDiscoverSubTab("hiddenGems")}>💎 {text.hiddenGems}</button>
              <button className="btn-click" style={styles.tabNavBtn(discoverSubTab === "top10")} onClick={() => setDiscoverSubTab("top10")}>📊 {text.top10}</button>
            </div>

            {discoverSubTab === "findGame" && (
              <>
                <div style={styles.randomFilterSection}>
                  <div style={styles.randomFilterTitle}><FaRandom size={16} /> {text.randomGame}</div>
                  <div style={styles.randomFilterRow}>
                    <label className="btn-click" style={styles.randomCheckbox}><input type="checkbox" checked={randomExcludeHorror} onChange={e => setRandomExcludeHorror(e.target.checked)} /> No Horror</label>
                    <label className="btn-click" style={styles.randomCheckbox}><input type="checkbox" checked={randomExcludeIndie} onChange={e => setRandomExcludeIndie(e.target.checked)} /> No Indie</label>
                    <label className="btn-click" style={styles.randomCheckbox}><input type="checkbox" checked={randomExcludeOld} onChange={e => setRandomExcludeOld(e.target.checked)} /> 2015+</label>
                  </div>
                  <div style={styles.randomFilterRow}>
                    <select className="btn-click" value={randomYear} onChange={e => setRandomYear(e.target.value)} style={styles.randomSelect}>
                      <option value="all">{text.allYears}</option>
                      {[...new Set(gamesWithData.map(g => g.year))].sort((a,b) => b - a).slice(0, 15).map(year => (<option key={year} value={year}>{year}</option>))}
                    </select>
                    <select className="btn-click" value={randomMode} onChange={e => setRandomMode(e.target.value)} style={styles.randomSelect}>
                      <option value="full">Random</option><option value="genre">By Genre</option><option value="mood">By Mood</option>
                    </select>
                    <button className="btn-click" style={styles.loginBtn} onClick={doRandom}><FaRandom size={14} /> Roll</button>
                  </div>
                  <div style={{ marginTop: 16 }}><span style={{ fontSize: 14 }}>Min Rating: {randomMinRating}</span><input type="range" min="0" max="10" step="0.5" value={randomMinRating} onChange={e => setRandomMinRating(parseFloat(e.target.value))} style={styles.randomSlider} /></div>
                </div>

                <div style={styles.tabNav}>
                  <button className="btn-click" style={styles.tabNavBtn(step === 1)} onClick={() => setStep(1)}>{text.mood}</button>
                  <button className="btn-click" style={styles.tabNavBtn(step === 2)} onClick={() => setStep(2)}>{text.genre}</button>
                  <button className="btn-click" style={styles.tabNavBtn(step === 3)} onClick={() => setStep(3)}>{text.playtime}</button>
                  <button className="btn-click" style={styles.tabNavBtn(step === 4)} onClick={() => setStep(4)}>{text.results}</button>
                </div>

                {step === 1 && (<div className="slide-in"><div style={{ fontSize: 24, fontWeight: 700, marginBottom: 28, textAlign: "center" }}>{text.mood} 🎭</div><div style={styles.pillGrid}>{MOODS.map(m => <button key={m} className="btn-click" style={styles.pill(selectedMoods.includes(m))} onClick={() => toggle(selectedMoods, setSelectedMoods, m)}>{m}</button>)}</div><button className="btn-click" style={styles.nextBtn} onClick={() => setStep(2)}>{text.next} →</button></div>)}
                {step === 2 && (<div className="slide-in"><div style={{ fontSize: 24, fontWeight: 700, marginBottom: 28, textAlign: "center" }}>{text.genre} 🎮</div><div style={styles.pillGrid}>{GENRES.map(g => <button key={g} className="btn-click" style={styles.pill(selectedGenres.includes(g))} onClick={() => toggle(selectedGenres, setSelectedGenres, g)}>{g}</button>)}</div><button className="btn-click" style={styles.nextBtn} onClick={() => setStep(3)}>{text.next} →</button></div>)}
                {step === 3 && (<div className="slide-in"><div style={{ fontSize: 24, fontWeight: 700, marginBottom: 28, textAlign: "center" }}>{text.playtime} ⏱️</div><div style={styles.pillGrid}>{PLAYTIMES.map(p => <button key={p} className="btn-click" style={styles.pill(selectedPlaytime === p)} onClick={() => setSelectedPlaytime(p === selectedPlaytime ? null : p)}>{p}</button>)}</div><button className="btn-click" style={styles.nextBtn} onClick={() => setStep(4)}>{text.results} 🚀</button></div>)}
                {step === 4 && (<div className="fade-in"><input style={styles.searchBar} placeholder={text.search} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} /><div style={styles.filterRow}><span style={{ fontSize: 14 }}>{text.sort}:</span><button className="btn-click" style={styles.filterBtn(sortBy === "score")} onClick={() => setSortBy("score")}>{text.bestMatch}</button><button className="btn-click" style={styles.filterBtn(sortBy === "rating")} onClick={() => setSortBy("rating")}>{text.rating}</button><button className="btn-click" style={styles.filterBtn(sortBy === "year")} onClick={() => setSortBy("year")}>{text.year}</button></div>{topPicks.length > 0 && (<div><div style={styles.sectionTitle}>🎯 {text.topPicks}</div><div style={styles.topPicksRow}>{topPicks.slice(0, 6).map((g,i) => <div key={g.id} className="game-card" style={styles.topPickCard} onClick={() => openGameDetail(g)}><div style={{ fontSize: 22, marginBottom: 8 }}>{["🥇","🥈","🥉","4","5","6"][i]}</div><img src={g.finalImg || g.img} style={{ width: "100%", height: 100, objectFit: "cover", borderRadius: 12 }} alt={g.name} /><div style={{ fontWeight: 700, marginTop: 12, fontSize: 13, wordWrap: "break-word" }}>{g.name}</div><div style={{ fontSize: 12, color: currentColors.primary, marginTop: 4 }}>★ {(g.finalRating || g.rating)?.toFixed(1)}</div><button className="btn-click" style={{ ...styles.addBtn, padding: "8px 12px", fontSize: 12 }} onClick={(e) => { e.stopPropagation(); addToLibrary(g); }}>+ {text.add}</button></div>)}</div>)}<div style={styles.sectionTitle}>📋 {text.allResults}</div><div style={styles.grid}>{restResults.slice(0, 24).map(g => <GameCard key={g.id} game={g} showBtn={true} />)}</div></div>)}
              </>
            )}

            {discoverSubTab === "topPicks" && (<div className="fade-in"><div style={styles.sectionTitle}>🎯 {text.topPicks}</div><div style={styles.grid}>{TOP_PICKS_GAMES.slice(0, 20).map(g => <GameCard key={g.id} game={g} showBtn={true} />)}</div></div>)}
            {discoverSubTab === "bestEver" && (<div className="fade-in"><input style={styles.searchBar} placeholder={text.search} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} /><div style={styles.filterRow}><span>{text.sort}:</span><button className="btn-click" style={styles.filterBtn(sortBy === "score")} onClick={() => setSortBy("score")}>{text.bestMatch}</button><button className="btn-click" style={styles.filterBtn(sortBy === "rating")} onClick={() => setSortBy("rating")}>{text.rating}</button></div><div style={styles.sectionTitle}>🏆 {text.bestEver}</div><div style={styles.grid}>{filteredCategoryGames(BEST_EVER_GAMES).slice(0, 30).map(g => <GameCard key={g.id} game={g} showBtn={true} />)}</div></div>)}
            {discoverSubTab === "hiddenGems" && (<div className="fade-in"><div style={styles.sectionTitle}>💎 {text.hiddenGems}</div><div style={styles.grid}>{HIDDEN_GEMS_GAMES.map(g => <GameCard key={g.id} game={g} showBtn={true} />)}</div></div>)}
            {discoverSubTab === "top10" && (<div className="fade-in"><select className="btn-click" value={selectedGenreForTop} onChange={e => setSelectedGenreForTop(e.target.value)} style={styles.topGenreSelect}>{GENRES.map(g => <option key={g} value={g}>{g}</option>)}</select><div style={styles.sectionTitle}>⭐ {text.top10} - {selectedGenreForTop}</div>{top10ByGenre.length === 0 ? (<div style={styles.emptyState}>No games found in this genre.</div>) : (<div style={styles.grid}>{top10ByGenre.map(g => <GameCard key={g.id} game={g} showBtn={true} />)}</div>)}</div>)}
          </div>
        )}

        {currentTab === "library" && (
          <div className="fade-in">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
              <div style={styles.sectionTitle}>📚 {text.library} ({library.length})</div>
              <div style={{ display: "flex", gap: 12 }}>
                <button className="btn-click" style={styles.loginBtn} onClick={exportLibrary}><FaFileExport size={14} /> {text.export}</button>
                <label className="btn-click" style={styles.loginBtn}><FaFileImport size={14} /> {text.import}<input type="file" accept=".json" style={{ display: "none" }} onChange={importLibrary} /></label>
              </div>
            </div>
            <div style={styles.statsRow}>
              <div className="profile-stat-card" style={styles.statCard}><div style={styles.statNumber}>{library.length}</div><div>{text.total}</div></div>
              <div className="profile-stat-card" style={styles.statCard}><div style={styles.statNumber}>{library.filter(g => g.status === "playing").length}</div><div>{text.playing}</div></div>
              <div className="profile-stat-card" style={styles.statCard}><div style={styles.statNumber}>{library.filter(g => g.status === "completed").length}</div><div>{text.completed}</div></div>
            </div>
            <div style={styles.profileSection}><div style={styles.profileSectionTitle}>{text.completionProgress}</div><div style={styles.progressBar}><div style={styles.progressFill}></div></div><div style={{ textAlign: "center", marginTop: 8, fontSize: 14, color: currentColors.textSecondary }}>{completionPercentage}% abgeschlossen</div></div>
            {library.length === 0 ? <div style={styles.emptyState}>{text.library} is empty. Add games from Discover!</div> : library.map(game => (
              <div key={game.id} className="fade-in" style={styles.libraryCard}>
                <img src={game.finalImg || game.img} style={styles.libraryImg} onClick={() => openGameDetail(game)} alt={game.name} />
                <div style={styles.libraryInfo}>
                  <div style={styles.libraryTitle}>{game.name}</div>
                  <div style={styles.libraryMeta}>{game.developer?.slice(0, 40)} · {game.year}</div>
                  <div style={styles.libraryActions}>
                    <select className="btn-click" value={game.status} onChange={e => updateStatus(game.id, e.target.value, game)} style={styles.select}>
                      <option value="wishlist">📝 Wishlist</option><option value="playing">🎮 {text.playing}</option><option value="completed">✅ {text.completed}</option>
                    </select>
                    <button className="btn-click" onClick={() => toggleFavorite(game.id)} style={styles.select}><FaHeart color={favorites.includes(game.id) ? currentColors.primary : "#fff"} size={13} /></button>
                    <button className="btn-click" onClick={() => markAsPlayed(game)} style={styles.select}><FaClock size={13} /> {text.played}</button>
                    <button className="btn-click" onClick={() => removeFromLibrary(game.id)} style={{ ...styles.select, color: "#ff6b6b" }}><FaTrash size={13} /> {text.remove}</button>
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
                  <div style={{ position: "relative" }}>
                    {profilePicUrl ? <img src={profilePicUrl} style={styles.profileAvatarLarge} alt="avatar" /> : <div style={styles.profileAvatarLarge}>{userData?.username?.charAt(0).toUpperCase()}</div>}
                    <div style={styles.cameraIcon} onClick={() => fileInputRef.current?.click()}><FaCamera size={18} color={currentColors.primary} /></div>
                    <input type="file" ref={fileInputRef} style={{ display: "none" }} accept="image/*" onChange={handleProfilePicUpload} />
                    {profilePicUploading && <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", background: "rgba(0,0,0,0.7)", borderRadius: "50%", padding: "8px" }}><FaSpinner className="spinning-wheel" size={20} /></div>}
                  </div>
                  <div>
                    <div style={{ fontSize: 30, fontWeight: 700, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>{userData?.username}{userData?.username === "Sherlock10K" && <span style={{ color: currentColors.primary, fontSize: 26 }}>👑</span>}</div>
                    <div style={{ fontSize: 14, color: currentColors.textSecondary }}>{user.email}</div>
                    <div style={{ fontSize: 14, color: currentColors.textSecondary, marginBottom: 18 }}>{userData?.bio || "No bio"}</div>
                    <div style={styles.statsRow}>
                      <div className="profile-stat-card" style={styles.statCard}><div style={styles.statNumber}>{library.length}</div><div>{text.total}</div></div>
                      <div className="profile-stat-card" style={styles.statCard}><div style={styles.statNumber}>{library.filter(g => g.status === "completed").length}</div><div>{text.completed}</div></div>
                      <div className="profile-stat-card" style={styles.statCard}><div style={styles.statNumber}>{favorites.length}</div><div>{text.favorites}</div></div>
                    </div>
                    <div style={styles.statsRow}>
                      <div className="profile-stat-card" style={styles.statCard}><div style={styles.statNumber}>{userLevel}</div><div>{text.level}</div></div>
                      <div className="profile-stat-card" style={styles.statCard}><div style={styles.statNumber}>{userXP}</div><div>{text.xp}</div></div>
                      <div className="profile-stat-card" style={styles.statCard}><div style={styles.statNumber}>{userBadges.length}</div><div>{text.badges}</div></div>
                    </div>
                    <button className="btn-click" style={styles.editBtn} onClick={openEditModal}><FaEdit size={14} /> {text.editProfile}</button>
                    <button className="btn-click" style={{ ...styles.donationBtn, marginLeft: 14, marginTop: 20 }} onClick={() => window.open("https://ko-fi.com/sherlock10k", "_blank")}><FaDonate size={14} /> {text.donate}</button>
                  </div>
                </div>

                <div style={styles.profileSection}><div style={styles.profileSectionTitle}><FaStar size={16} /> {text.wishlist}</div>{wishlist.length === 0 ? <div style={styles.emptyState}>Your wishlist is empty.</div> : <div style={styles.grid}>{wishlist.slice(0, 6).map(game => <GameCard key={game.id} game={game} showBtn={true} />)}</div>}</div>
                <div style={styles.profileSection}><div style={styles.profileSectionTitle}><FaBell size={16} /> {text.activityFeed}</div>{activityFeed.length === 0 ? <div style={styles.emptyState}>No activity yet.</div> : activityFeed.slice(0, 5).map(activity => (<div key={activity.id} style={styles.activityCard}><div style={{ fontSize: 28 }}>{activity.type === "add" ? "➕" : activity.type === "completed" ? "✅" : "🎮"}</div><div style={{ flex: 1 }}><div style={{ fontSize: 14 }}>{activity.message}</div><div style={{ fontSize: 11, color: currentColors.textMuted }}>{new Date(activity.timestamp).toLocaleString()}</div></div></div>))}</div>
                <div style={styles.profileSection}><div style={styles.profileSectionTitle}><FaChartLine size={16} /> {text.backlog}</div>{backlogRecommendation && typeof backlogRecommendation === "object" ? (<div style={styles.gameNightCard}><div style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>{text.backlogTip}:</div><GameCard game={backlogRecommendation} showBtn={true} /></div>) : (<div style={styles.emptyState}>{backlogRecommendation || "No backlog games! Add some games to your library."}</div>)}</div>
                <div style={styles.profileSection}><div style={styles.profileSectionTitle}><GiAchievement size={18} /> {text.achievements}</div><div style={styles.achievementGrid}>{achievements.map(ach => (<div key={ach.id} className="profile-stat-card" style={{ ...styles.achievementCard, opacity: ach.unlocked ? 1 : 0.6 }}><div style={styles.achievementIcon}>{ach.icon}</div><div style={styles.achievementInfo}><div style={styles.achievementName}>{ach.name}</div><div style={styles.achievementDesc}>{ach.desc}</div></div></div>))}</div></div>
                <div style={styles.profileSection}><div style={styles.profileSectionTitle}><FaMedal size={16} /> {text.badges}</div><div style={styles.achievementGrid}>{userBadges.length === 0 ? <div style={styles.emptyState}>No badges yet. Keep playing!</div> : userBadges.map(badge => (<div key={badge.id} style={styles.achievementCard}><div style={styles.achievementIcon}>{badge.icon}</div><div><div style={styles.achievementName}>{badge.name}</div></div></div>))}</div></div>
              </>
            ) : <div style={styles.emptyState}>Login to see your profile</div>}
          </div>
        )}

        {currentTab === "friends" && (
          <div className="fade-in">
            <div style={styles.sectionTitle}><FaUsers size={18} /> {text.findFriends}</div>
            <div style={styles.searchRow}><input style={{ ...styles.input, marginBottom: 0, flex: 1 }} placeholder="Search by username..." value={searchUsersTerm} onChange={e => setSearchUsersTerm(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSearchUsers()} /><button className="btn-click" style={styles.loginBtn} onClick={handleSearchUsers}><FaSearch size={15} /> {text.search}</button></div>
            {searchingUsers && <div style={{ textAlign: "center", color: currentColors.textSecondary }}>Searching...</div>}
            {foundUsers.length === 0 && searchUsersTerm && !searchingUsers && <div style={styles.emptyState}>No users found</div>}
            {foundUsers.map(u => (<div key={u.id} className="fade-in" style={styles.userCard}><div style={styles.userAvatarSmall}>{u.username?.charAt(0).toUpperCase()}</div><div><div style={{ fontWeight: 700, fontSize: 16, display: "flex", alignItems: "center", gap: 8 }}>{u.username}{u.username === "Sherlock10K" && <span style={{ color: currentColors.primary }}>👑</span>}</div><div style={{ fontSize: 14, color: currentColors.textSecondary }}>{u.bio?.slice(0, 50) || "No bio"}</div></div><button className="btn-click" style={{ ...styles.addBtn, width: "auto", marginTop: 0, padding: "8px 20px", fontSize: 13 }} onClick={() => alert(`Friend request sent to ${u.username}`)}>Add Friend</button></div>))}
          </div>
        )}

        {currentTab === "ai" && (
          <div className="fade-in">
            <div style={styles.aiSection}>
              <div style={styles.randomFilterTitle}><FaRobot size={18} /> {text.ai}</div>
              <div style={styles.aiChatContainer}>
                <div style={styles.aiMessages}>
                  {aiMessages.map((msg, idx) => (<div key={idx} style={styles.aiMessage(msg.role === "user")}><div style={{ fontWeight: 600, marginBottom: 4, fontSize: 12, opacity: 0.7 }}>{msg.role === "user" ? "Du" : "🎮 NexPlay KI"}</div><div style={{ fontSize: 14, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{msg.content}</div></div>))}
                  {isAiLoading && (<div style={styles.aiMessage(false)}><div style={{ display: "flex", gap: 4 }}><span className="pulse-dot">●</span><span className="pulse-dot" style={{ animationDelay: "0.2s" }}>●</span><span className="pulse-dot" style={{ animationDelay: "0.4s" }}>●</span></div></div>)}
                  <div ref={aiChatEndRef} />
                </div>
                <div style={styles.aiInputRow}>
                  <input style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "none", borderRadius: 24, padding: "12px 18px", color: currentColors.text, fontSize: 14, outline: "none" }} placeholder="Frag mich nach Spielen, Tipps oder lass dir was empfehlen..." value={aiInput} onChange={e => setAiInput(e.target.value)} onKeyPress={e => e.key === "Enter" && sendAiMessage()} />
                  <button className="btn-click" style={styles.addBtn} onClick={sendAiMessage}>{isAiLoading ? <FaSpinner className="spinning-wheel" size={14} /> : "Senden"}</button>
                </div>
              </div>
            </div>
            <div style={styles.sectionTitle}>🎯 {text.topPicks}</div>
            <div style={styles.grid}>{TOP_PICKS_GAMES.slice(0, 16).map(g => <GameCard key={g.id} game={g} showBtn={true} />)}</div>
            <div style={styles.sectionTitle}>🏆 {text.bestEver}</div>
            <div style={styles.grid}>{BEST_EVER_GAMES.slice(0, 16).map(g => <GameCard key={g.id} game={g} showBtn={true} />)}</div>
            <div style={styles.sectionTitle}>💎 {text.hiddenGems}</div>
            <div style={styles.grid}>{HIDDEN_GEMS_GAMES.slice(0, 16).map(g => <GameCard key={g.id} game={g} showBtn={true} />)}</div>
          </div>
        )}

        {currentTab === "aoty" && (
          <div className="fade-in">
            {selectedAotyYear ? (
              <>
                <button className="btn-click" style={styles.gotyBackBtn} onClick={() => { setSelectedAotyYear(null); setAotySearch(""); setAotyResult(null); }}><FaArrowLeft size={14} /> {text.backToAOTY}</button>
                <div style={styles.aotyResultCard}>
                  <div style={{ fontSize: 30, fontWeight: 800, marginBottom: 24, textAlign: "center", color: currentColors.primary }}>{selectedAotyYear}</div>
                  <div className="award-card" style={styles.aotyWinnerCard} onClick={() => { const award = AOTY_DATA[selectedAotyYear]; if (award) { const gameData = { id: selectedAotyYear, name: award.winner, rating: 9.0, genre: award.genre || "Action", playtime: award.playtime || "20-40h", year: selectedAotyYear, img: award.img, developer: award.developer || "Various", description: award.description || `${award.winner} ist das Spiel des Jahres ${selectedAotyYear}.`, platforms: ["PC", "Console"], steamId: award.steamId, finalRating: 9.0, finalImg: award.img }; openGameDetail(gameData); } }}>
                    <div style={{ display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap" }}><FaTrophy style={{ color: currentColors.primary, fontSize: 30 }} /><div><div style={{ fontSize: 14, color: currentColors.primary }}>Game of the Year</div><div style={{ fontSize: 24, fontWeight: 700 }}>{AOTY_DATA[selectedAotyYear]?.winner}</div></div></div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div style={styles.sectionTitle}><FaTrophy size={20} /> {text.aotyTitle}</div>
                <input style={styles.searchBar} placeholder={text.searchAOTY} value={aotySearch} onChange={e => setAotySearch(e.target.value)} />
                {aotyResult?.type === "year" && aotyResult.data && (<div style={styles.aotyResultCard}><div style={{ fontSize: 30, fontWeight: 800, marginBottom: 24, textAlign: "center", color: currentColors.primary }}>{aotyResult.year}</div><div className="award-card" style={styles.aotyWinnerCard} onClick={() => { const award = aotyResult.data; const gameData = { id: aotyResult.year, name: award.winner, rating: 9.0, genre: award.genre || "Action", playtime: award.playtime || "20-40h", year: aotyResult.year, img: award.img, developer: award.developer || "Various", description: award.description || `${award.winner} ist das Spiel des Jahres ${aotyResult.year}.`, platforms: ["PC", "Console"], steamId: award.steamId, finalRating: 9.0, finalImg: award.img }; openGameDetail(gameData); }}><div style={{ display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap" }}><FaTrophy style={{ color: currentColors.primary, fontSize: 30 }} /><div><div style={{ fontSize: 14, color: currentColors.primary }}>Game of the Year</div><div style={{ fontSize: 24, fontWeight: 700 }}>{aotyResult.data.winner}</div></div></div></div></div>)}
                {aotyResult?.type === "error" && <div style={styles.emptyState}>{aotyResult.message}</div>}
                {!aotySearch && !selectedAotyYear && (<div style={styles.grid}>{Object.keys(AOTY_DATA).sort((a,b) => b - a).map(year => (<div key={year} className="aoty-year-card" style={styles.aotyYearCard} onClick={() => setSelectedAotyYear(parseInt(year))}><div style={{ fontWeight: 700, fontSize: 26, color: currentColors.primary }}>{year}</div><div style={{ fontSize: 14, marginTop: 12 }}>{AOTY_DATA[year].winner}</div></div>))}</div>)}
              </>
            )}
          </div>
        )}

        {currentTab === "random" && (
          <div className="fade-in">
            <div style={styles.randomFilterSection}>
              <div style={styles.randomFilterTitle}><FaRandom size={18} /> {text.randomGame}</div>
              <div style={styles.randomFilterRow}>
                <label className="btn-click" style={styles.randomCheckbox}><input type="checkbox" checked={randomExcludeHorror} onChange={e => setRandomExcludeHorror(e.target.checked)} /> Exclude Horror</label>
                <label className="btn-click" style={styles.randomCheckbox}><input type="checkbox" checked={randomExcludeIndie} onChange={e => setRandomExcludeIndie(e.target.checked)} /> Exclude Indie</label>
                <label className="btn-click" style={styles.randomCheckbox}><input type="checkbox" checked={randomExcludeOld} onChange={e => setRandomExcludeOld(e.target.checked)} /> Exclude before 2015</label>
              </div>
              <div style={styles.randomFilterRow}>
                <select className="btn-click" value={randomYear} onChange={e => setRandomYear(e.target.value)} style={styles.randomSelect}><option value="all">{text.allYears}</option>{[...new Set(gamesWithData.map(g => g.year))].sort((a,b) => b - a).slice(0, 15).map(year => (<option key={year} value={year}>{year}</option>))}</select>
                <select className="btn-click" value={randomMode} onChange={e => setRandomMode(e.target.value)} style={styles.randomSelect}><option value="full">Fully Random</option><option value="genre">Random by Genre</option><option value="mood">Random by Mood</option></select>
                <button className="btn-click" style={styles.loginBtn} onClick={doRandom}><FaRandom size={14} /> {text.randomGame}</button>
              </div>
              <div style={{ marginTop: 16 }}><span style={{ fontSize: 14 }}>Min Rating: {randomMinRating}</span><input type="range" min="0" max="10" step="0.5" value={randomMinRating} onChange={e => setRandomMinRating(parseFloat(e.target.value))} style={styles.randomSlider} /></div>
            </div>
            <div style={styles.gameNightCard}>
              <div style={styles.randomFilterTitle}><GiSpinningWheel size={18} /> {text.gameNightMode}</div>
              <div style={{ marginBottom: 18 }}><label className="btn-click" style={styles.randomCheckbox}><input type="checkbox" checked={gameNightFilters.excludeMultiplayer} onChange={e => setGameNightFilters({ ...gameNightFilters, excludeMultiplayer: e.target.checked })} /> {text.excludeMultiplayer}</label></div>
              <div style={{ marginBottom: 18 }}><div style={{ fontSize: 14, color: currentColors.textSecondary, marginBottom: 6 }}>Min Rating: {gameNightFilters.minRating}</div><input type="range" min="0" max="10" step="0.5" value={gameNightFilters.minRating} onChange={e => setGameNightFilters({ ...gameNightFilters, minRating: parseFloat(e.target.value) })} style={styles.randomSlider} /></div>
              <div style={{ marginBottom: 18 }}><input type="number" placeholder="Max Playtime (hours)" style={styles.input} value={gameNightFilters.maxPlaytime} onChange={e => setGameNightFilters({ ...gameNightFilters, maxPlaytime: e.target.value })} /></div>
              <div style={styles.wheelContainer}><div className={spinning ? "spinning-wheel" : ""} style={styles.wheel} onClick={spinGameNight}><div style={styles.wheelInner}><GiSpinningWheel size={32} /></div></div></div>
              <button className="btn-click" style={styles.loginBtn} onClick={spinGameNight} disabled={spinning}>{spinning ? "🎲 Spinning..." : <>🎲 {text.spinWheel}</>}</button>
              {spinResult && !spinning && (<div style={{ marginTop: 28, textAlign: "center", animation: "fadeIn 0.5s ease-out" }}><div style={{ fontSize: 20, fontWeight: 700, marginBottom: 16, color: currentColors.primary }}>🎉 Game Night Pick!</div><GameCard game={spinResult} showBtn={true} /></div>)}
            </div>
          </div>
        )}

        {currentTab === "playlists" && (
          <div className="fade-in">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, flexWrap: "wrap", gap: 16 }}><div style={styles.sectionTitle}><FaList size={18} /> {text.playlists}</div><button className="btn-click" style={styles.loginBtn} onClick={() => setShowCreatePlaylist(true)}><FaPlusCircle size={15} /> {text.createPlaylist}</button></div>
            {playlists.length === 0 ? <div style={styles.emptyState}>No playlists yet. Create your first one!</div> : playlists.map(playlist => (<div key={playlist.id} style={styles.playlistCard}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}><div style={{ fontWeight: 700, fontSize: 20 }}>{playlist.name}</div><button className="btn-click" style={{ background: "rgba(255,255,255,0.05)", border: "none", borderRadius: 12, padding: "6px 16px", color: currentColors.textSecondary, cursor: "pointer", fontSize: 13 }} onClick={() => deletePlaylist(playlist.id)}><FaTrashAlt size={12} /> Delete</button></div><div style={styles.grid}>{playlist.games.slice(0, 8).map(game => <GameCard key={game.id} game={game} showBtn={false} />)}</div>{playlist.games.length > 8 && <div style={{ textAlign: "center", marginTop: 20 }}>+{playlist.games.length - 8} more</div>}</div>))}
          </div>
        )}

        {currentTab === "compare" && (
          <div className="fade-in">
            <div style={styles.sectionTitle}><FaBalanceScale size={18} /> {text.compareGames}</div>
            <div style={styles.compareCard}>
              <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 28 }}>
                <select className="btn-click" style={{ ...styles.select, flex: 1, padding: "14px", fontSize: 15 }} value={compareGames[0]?.id || ""} onChange={e => { const game = [...gamesWithData, ...MANUAL_GAMES, ...MANUAL_HIDDEN_GEMS].find(g => g.id === parseInt(e.target.value)); setCompareGames([game, compareGames[1]]); }}>
                  <option value="">{text.selectGame} 1</option>
                  {[...gamesWithData, ...MANUAL_GAMES, ...MANUAL_HIDDEN_GEMS].slice(0, 50).map(g => <option key={g.id} value={g.id}>{g.name} ({g.year}) - ★{g.finalRating?.toFixed(1)}</option>)}
                </select>
                <div style={{ fontSize: 28, color: currentColors.primary, alignSelf: "center", fontWeight: 700 }}>VS</div>
                <select className="btn-click" style={{ ...styles.select, flex: 1, padding: "14px", fontSize: 15 }} value={compareGames[1]?.id || ""} onChange={e => { const game = [...gamesWithData, ...MANUAL_GAMES, ...MANUAL_HIDDEN_GEMS].find(g => g.id === parseInt(e.target.value)); setCompareGames([compareGames[0], game]); }}>
                  <option value="">{text.selectGame} 2</option>
                  {[...gamesWithData, ...MANUAL_GAMES, ...MANUAL_HIDDEN_GEMS].slice(0, 50).map(g => <option key={g.id} value={g.id}>{g.name} ({g.year}) - ★{g.finalRating?.toFixed(1)}</option>)}
                </select>
              </div>
              {compareGames[0] && compareGames[1] && (<div><div style={styles.compareGrid}><div style={styles.compareColumn}><div style={styles.compareHeader}><img src={compareGames[0].finalImg || compareGames[0].img} style={{ width: 100, height: 133, objectFit: "cover", borderRadius: 16, marginBottom: 16 }} alt={compareGames[0].name} /><div style={{ fontSize: 20 }}>{compareGames[0].name}</div><div style={{ fontSize: 18, color: currentColors.primary, marginTop: 6 }}>★ {compareGames[0].finalRating?.toFixed(1)}</div></div><div style={styles.compareRow}><span style={styles.compareLabel}>{text.year}</span><span style={styles.compareValue}>{compareGames[0].year}</span></div><div style={styles.compareRow}><span style={styles.compareLabel}>{text.genre}</span><span style={styles.compareValue}>{compareGames[0].genre}</span></div><div style={styles.compareRow}><span style={styles.compareLabel}>{text.playtime}</span><span style={styles.compareValue}>{compareGames[0].playtime}</span></div><div style={styles.compareRow}><span style={styles.compareLabel}>Developer</span><span style={styles.compareValue}>{compareGames[0].developer}</span></div></div><div style={styles.compareColumn}><div style={styles.compareHeader}><img src={compareGames[1].finalImg || compareGames[1].img} style={{ width: 100, height: 133, objectFit: "cover", borderRadius: 16, marginBottom: 16 }} alt={compareGames[1].name} /><div style={{ fontSize: 20 }}>{compareGames[1].name}</div><div style={{ fontSize: 18, color: currentColors.primary, marginTop: 6 }}>★ {compareGames[1].finalRating?.toFixed(1)}</div></div><div style={styles.compareRow}><span style={styles.compareLabel}>{text.year}</span><span style={styles.compareValue}>{compareGames[1].year}</span></div><div style={styles.compareRow}><span style={styles.compareLabel}>{text.genre}</span><span style={styles.compareValue}>{compareGames[1].genre}</span></div><div style={styles.compareRow}><span style={styles.compareLabel}>{text.playtime}</span><span style={styles.compareValue}>{compareGames[1].playtime}</span></div><div style={styles.compareRow}><span style={styles.compareLabel}>Developer</span><span style={styles.compareValue}>{compareGames[1].developer}</span></div></div></div><div style={{ marginTop: 32, padding: 20, background: "rgba(0,0,0,0.2)", borderRadius: 20, textAlign: "center" }}><div style={{ fontSize: 16, fontWeight: 600, marginBottom: 10 }}>🏆 {text.winner}</div><div style={{ fontSize: 26, fontWeight: 800, color: currentColors.primary }}>{compareGames[0].finalRating > compareGames[1].finalRating ? compareGames[0].name : compareGames[1].finalRating > compareGames[0].finalRating ? compareGames[1].name : "Tie!"}</div></div></div>)}
            </div>
          </div>
        )}
      </div>

      {showEditModal && user && (<div className="fade-in" style={styles.modalOverlay} onClick={() => setShowEditModal(false)}><div className="slide-in" style={styles.modalContent} onClick={e => e.stopPropagation()}><div style={styles.modalTitle}>{text.editProfile}</div>{editError && <div style={styles.errorText}>{editError}</div>}{editSuccess && <div style={styles.successText}>{editSuccess}</div>}<input style={styles.input} placeholder={text.username} value={editUsername} onChange={e => setEditUsername(e.target.value)} /><textarea style={styles.textarea} placeholder={text.bio} rows="3" value={editBio} onChange={e => setEditBio(e.target.value)} /><label className="btn-click" style={styles.checkbox}><input type="checkbox" checked={editPrivate} onChange={e => setEditPrivate(e.target.checked)} /> {text.private}</label><div style={{ marginTop: 20, paddingTop: 20, borderTop: `1px solid rgba(255,255,255,0.1)` }}><div style={{ fontWeight: 600, marginBottom: 16, fontSize: 16 }}><FaSteam /> {text.steamConnect}</div><div style={styles.platformRow}><input type="text" placeholder={text.steamId} value={steamIdInput} onChange={e => setSteamIdInput(e.target.value)} style={{ ...styles.input, marginBottom: 0, flex: 1 }} /><button className="btn-click" style={styles.platformBtn(colors.steam)} onClick={handleSteamLogin} disabled={syncingPlatform === "steam"}><FaSteam size={14} /> {syncingPlatform === "steam" ? "Importing..." : text.importGames}</button></div><div style={{ fontSize: 12, color: currentColors.textSecondary, marginTop: 12 }}>🔍 {text.findSteamId}: <a href="https://steamidfinder.com/" target="_blank" rel="noreferrer" style={{ color: currentColors.primary }}>steamidfinder.com</a></div></div><button className="btn-click" style={styles.modalBtn} onClick={handleUpdateProfile}>{text.save}</button></div></div>)}
      {showCreatePlaylist && (<div className="fade-in" style={styles.modalOverlay} onClick={() => setShowCreatePlaylist(false)}><div className="slide-in" style={styles.modalContent} onClick={e => e.stopPropagation()}><div style={styles.modalTitle}>{text.createPlaylist}</div><input style={styles.input} placeholder={text.playlistName} value={newPlaylistName} onChange={e => setNewPlaylistName(e.target.value)} /><button className="btn-click" style={styles.modalBtn} onClick={createPlaylist}>{text.createPlaylist}</button></div></div>)}
      {showSettings && (<div className="fade-in" style={styles.modalOverlay} onClick={() => setShowSettings(false)}><div className="slide-in" style={styles.modalContent} onClick={e => e.stopPropagation()}><div style={styles.modalTitle}>{text.settings} ⚙️</div><div style={styles.settingsSection}><div style={styles.settingsRow}><span style={styles.settingsLabel}>{text.sound}:</span><button className="btn-click" style={styles.iconBtn} onClick={() => setSoundEnabled(!soundEnabled)}>{soundEnabled ? <FaVolumeUp size={15} /> : <FaVolumeMute size={15} />} {soundEnabled ? "ON" : "OFF"}</button></div><div style={styles.settingsRow}><span style={styles.settingsLabel}>{text.language}:</span><button className="btn-click" style={styles.iconBtn} onClick={() => setLang(lang === "en" ? "de" : "en")}><FaLanguage size={15} /> {lang === "en" ? "DE" : "EN"}</button></div><div style={styles.settingsRow}><span style={styles.settingsLabel}>{text.theme}:</span><div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}><button className="btn-click" style={{ ...styles.iconBtn, background: theme === "dark" ? currentColors.primary : "rgba(255,255,255,0.08)", padding: "8px 16px" }} onClick={() => setTheme("dark")}><FaMoon size={13} /> {text.dark}</button><button className="btn-click" style={{ ...styles.iconBtn, background: theme === "light" ? currentColors.primary : "rgba(255,255,255,0.08)", padding: "8px 16px" }} onClick={() => setTheme("light")}><FaSun size={13} /> {text.light}</button><button className="btn-click" style={{ ...styles.iconBtn, background: theme === "auto" ? currentColors.primary : "rgba(255,255,255,0.08)", padding: "8px 16px" }} onClick={() => setTheme("auto")}><FaAdjust size={13} /> {text.auto}</button></div></div></div><button className="btn-click" style={styles.modalBtn} onClick={() => setShowSettings(false)}>{text.close}</button></div></div>)}
      {showRandomModal && randomGame && (<div className="fade-in" style={styles.modalOverlay} onClick={() => setShowRandomModal(false)}><div className="slide-in" style={styles.modalContent} onClick={e => e.stopPropagation()}><div style={styles.modalTitle}>🎲 {text.randomGame}</div><img src={randomGame.finalImg || randomGame.img} style={{ width: "100%", borderRadius: 24, marginBottom: 24 }} alt={randomGame.name} /><div style={{ fontSize: 20, fontWeight: 700, textAlign: "center", marginBottom: 10 }}>{randomGame.name}</div><div style={{ fontSize: 16, color: currentColors.primary, textAlign: "center", marginBottom: 16 }}>★ {(randomGame.finalRating || randomGame.rating)?.toFixed(1)} · {randomGame.playtime} · {randomGame.year}</div><div style={{ fontSize: 14, marginBottom: 24, color: currentColors.textSecondary, textAlign: "center", maxHeight: 150, overflow: "auto" }}>{(randomGame.finalDescription || generateLongDescription(randomGame.name, "")).slice(0, 250)}...</div><div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}><button className="btn-click" style={{ ...styles.addBtn, width: "auto", padding: "10px 24px", fontSize: 14 }} onClick={() => { addToLibrary(randomGame); setShowRandomModal(false); }}>+ {text.add}</button><button className="btn-click" style={styles.modalBtnSecondary} onClick={doRandom}>{text.rollAgain}</button></div></div></div>)}
      {showLoginModal && (<div className="fade-in" style={styles.modalOverlay} onClick={() => setShowLoginModal(false)}><div className="slide-in" style={styles.modalContent} onClick={e => e.stopPropagation()}><div style={styles.modalTitle}>{isLogin ? text.login : text.register}</div>{errorMsg && <div style={styles.errorText}>{errorMsg}</div>}<input style={styles.input} type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} /><div style={styles.passwordWrapper}><input style={styles.input} type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} /><span style={styles.passwordEye} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}</span></div><button className="btn-click" style={styles.modalBtn} onClick={isLogin ? handleLogin : handleRegister}>{isLogin ? text.login : text.register}</button><div style={styles.switchText} onClick={() => { setIsLogin(!isLogin); setErrorMsg(""); }}>{isLogin ? "No account? Register" : "Already have an account? Login"}</div></div></div>)}
      {loadingAction && (<div style={styles.loadingOverlay}><div style={styles.loadingSpinner}></div><div style={{ marginTop: 20, color: currentColors.text }}>{text.loading}</div></div>)}
    </div>
  );
}