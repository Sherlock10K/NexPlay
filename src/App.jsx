import { useState, useEffect, useMemo } from "react";
import { FaHome, FaUser, FaFire, FaSearch, FaHeart, FaStar, FaTrash, FaSignOutAlt, FaPlus, FaCheck, FaEnvelope, FaEye, FaEyeSlash, FaEdit, FaUsers, FaClock, FaRandom, FaThumbsUp, FaThumbsDown, FaArrowLeft, FaCog, FaVolumeUp, FaVolumeMute, FaLanguage, FaSteam, FaPlaystation, FaGamepad, FaTrophy, FaGem, FaShoppingCart, FaRobot, FaFilter, FaLink, FaExternalLinkAlt, FaDonate, FaAward, FaList, FaMedal, FaGamepad as FaGamepadIcon, FaDiceD6, FaGlobe, FaStarHalfAlt, FaTv, FaMicrophone, FaVideo, FaDesktop, FaPlusCircle, FaTrashAlt, FaUsers as FaUsersIcon, FaBell, FaCalendarAlt, FaChartLine, FaBook, FaTags, FaBalanceScale, FaFileExport, FaFileImport, FaMoon, FaSun, FaAdjust, FaBars } from "react-icons/fa";
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
  en: { home: "Discover", library: "Library", profile: "Profile", friends: "Friends", ai: "AI Assistant", aoty: "AOTY", playlists: "Playlists", gameNight: "Game Night", activity: "Activity", wishlist: "Wishlist", backlog: "Backlog Cleaner", tags: "Tags", compare: "Compare", journal: "Journal", export: "Export", import: "Import", theme: "Theme", dark: "Dark", light: "Light", auto: "Auto", randomGame: "Random Game", yearFilter: "Year", allYears: "All Years", login: "Login", register: "Register", logout: "Logout", search: "Search games...", searchAOTY: "Search by year or game name...", mood: "What's your mood?", genre: "Pick your genres", playtime: "How long?", next: "Next", results: "Show Results", topPicks: "Top Picks", bestEver: "Best Ever", allResults: "All Results", hiddenGems: "Hidden Gems", sort: "Sort", bestMatch: "Best Match", rating: "Rating", year: "Year", add: "Add to Library", inLibrary: "In Library", reviews: "Reviews", played: "Played", remove: "Remove", editProfile: "Edit Profile", username: "Username", bio: "Bio", private: "Private profile", save: "Save", achievements: "Achievements", firstGame: "First Game", collector: "Collector", completionist: "Completionist", recentlyPlayed: "Recently Played", favorites: "Favorites", total: "Total", playing: "Playing", completed: "Completed", rollAgain: "Roll Again", close: "Close", back: "Back", buyOn: "Buy on", writeReview: "Write Review", yourReview: "Your review...", submit: "Submit", noReviews: "No reviews yet", findFriends: "Find Friends", settings: "Settings", sound: "Sound Effects", language: "Language", steamId: "Steam ID", importGames: "Import Steam Games", findSteamId: "How to find your Steam ID", donate: "Support the developer", topRated: "Top Rated Game", topGenre: "Top Genre", totalPlaytime: "Total Playtime", aotyTitle: "All Of The Year", top20: "Top 20 by Genre", findYourGame: "Find Your Game", allAwards: "All Awards", backToAOTY: "Back to AOTY Overview", createPlaylist: "Create Playlist", playlistName: "Playlist Name", addToPlaylist: "Add to Playlist", gameNightMode: "Game Night Mode", spinWheel: "Spin the Wheel", excludeMultiplayer: "Exclude Multiplayer", activityFeed: "Activity Feed", addToWishlist: "Add to Wishlist", checkPrice: "Check Price", backlogTip: "You should play", addTag: "Add Tag", compareGames: "Compare Games", selectGame: "Select Game", journalNotes: "My Notes", exportLibrary: "Export Library", importLibrary: "Import Library", themeSelect: "Select Theme", loading: "Loading..." },
  de: { home: "Entdecken", library: "Bibliothek", profile: "Profil", friends: "Freunde", ai: "KI-Assistent", aoty: "AOTY", playlists: "Playlists", gameNight: "Spielabend", activity: "Aktivitäten", wishlist: "Wunschliste", backlog: "Backlog Reiniger", tags: "Tags", compare: "Vergleichen", journal: "Tagebuch", export: "Exportieren", import: "Importieren", theme: "Design", dark: "Dunkel", light: "Hell", auto: "Auto", randomGame: "Zufälliges Spiel", yearFilter: "Jahr", allYears: "Alle Jahre", login: "Anmelden", register: "Registrieren", logout: "Abmelden", search: "Spiele suchen...", searchAOTY: "Suche nach Jahr oder Spielname...", mood: "Wie ist deine Stimmung?", genre: "Wähle deine Genres", playtime: "Wie lange?", next: "Weiter", results: "Ergebnisse", topPicks: "Top Empfehlungen", bestEver: "Beste Aller Zeiten", allResults: "Alle Ergebnisse", hiddenGems: "Geheimtipps", sort: "Sortieren", bestMatch: "Bester Treffer", rating: "Bewertung", year: "Jahr", add: "Zur Bibliothek", inLibrary: "In Bibliothek", reviews: "Bewertungen", played: "Gespielt", remove: "Entfernen", editProfile: "Profil bearbeiten", username: "Benutzername", bio: "Über mich", private: "Privates Profil", save: "Speichern", achievements: "Erfolge", firstGame: "Erstes Spiel", collector: "Sammler", completionist: "Vollender", recentlyPlayed: "Zuletzt gespielt", favorites: "Favoriten", total: "Gesamt", playing: "Spielt", completed: "Abgeschlossen", rollAgain: "Nochmal", close: "Schließen", back: "Zurück", buyOn: "Kaufen auf", writeReview: "Bewertung schreiben", yourReview: "Deine Bewertung...", submit: "Speichern", noReviews: "Keine Bewertungen", findFriends: "Freunde finden", settings: "Einstellungen", sound: "Soundeffekte", language: "Sprache", steamId: "Steam ID", importGames: "Steam Spiele importieren", findSteamId: "So findest du deine Steam ID", donate: "Unterstütze den Entwickler", topRated: "Bestbewertetes Spiel", topGenre: "Top Genre", totalPlaytime: "Spielzeit Gesamt", aotyTitle: "All Of The Year", top20: "Top 20 pro Genre", findYourGame: "Finde dein Spiel", allAwards: "Alle Auszeichnungen", backToAOTY: "Zurück zur AOTY Übersicht", createPlaylist: "Playlist erstellen", playlistName: "Playlist Name", addToPlaylist: "Zu Playlist hinzufügen", gameNightMode: "Spielabend Modus", spinWheel: "Rad drehen", excludeMultiplayer: "Multiplayer ausschließen", activityFeed: "Aktivitäten Feed", addToWishlist: "Zur Wunschliste", checkPrice: "Preis prüfen", backlogTip: "Du solltest spielen", addTag: "Tag hinzufügen", compareGames: "Spiele vergleichen", selectGame: "Spiel auswählen", journalNotes: "Meine Notizen", exportLibrary: "Bibliothek exportieren", importLibrary: "Bibliothek importieren", themeSelect: "Design auswählen", loading: "Laden..." }
};

const RAWG_API_KEY = '4da2c00cf3b2459d988e0ed0ac16988d';
const MANUAL_HIDDEN_GEMS = [
  { id: 9001, name: "CrossCode", rating: 9.1, genre: "Indie", playtime: "40-60h", year: 2018, img: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/368340/header.jpg", developer: "Radical Fish Games", mood: "Action", description: "CrossCode ist ein Action-RPG im Retro-Stil, das in einem fiktiven MMORPG spielt.", platforms: ["PC", "Switch", "PS4", "Xbox One"], steamId: 368340, finalRating: 9.1 },
  { id: 9002, name: "Outer Wilds", rating: 9.3, genre: "Adventure", playtime: "20-40h", year: 2019, img: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/753640/header.jpg", developer: "Mobius Digital", mood: "Mystery", description: "Outer Wilds ist ein Open-World-Mystery-Spiel über ein Sonnensystem in einer Zeitschleife.", platforms: ["PC", "PS4", "Xbox One", "Switch"], steamId: 753640, finalRating: 9.3 },
  { id: 9003, name: "Return of the Obra Dinn", rating: 9.2, genre: "Puzzle", playtime: "10-20h", year: 2018, img: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/653530/header.jpg", developer: "Lucas Pope", mood: "Mystery", description: "Ein Detektivspiel in 1-Bit-Grafik.", platforms: ["PC", "Switch", "PS4", "Xbox One"], steamId: 653530, finalRating: 9.2 },
  { id: 9004, name: "Hades", rating: 9.3, genre: "Indie", playtime: "40-60h", year: 2020, img: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1145360/header.jpg", developer: "Supergiant Games", mood: "Action", description: "Ein Roguelite-Actionspiel, in dem du versuchst, die Unterwelt zu entkommen.", platforms: ["PC", "Switch", "PS4", "Xbox"], steamId: 1145360, finalRating: 9.3 }
];

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

const checkAndFixRatings = (game, steamData) => {
  let rating = game.rawgRating || 7.0;
  const name = game.name?.toLowerCase() || "";
  if (name.includes("goldeneye") && name.includes("007")) rating = 8.5;
  if (name.includes("perfect dark")) rating = 8.3;
  if (name.includes("metroid prime") && !name.includes("remastered")) rating = 9.0;
  return rating;
};

const calculateWeightedRating = (game, steamData) => {
  let rating = checkAndFixRatings(game, steamData);
  const name = game.name?.toLowerCase() || "";
  const metacriticScore = rating;
  let userRating = 7.0;
  if (steamData?.steamRating) userRating = steamData.steamRating;
  else userRating = metacriticScore * 0.9;
  let popularity = 7.0;
  const reviewCount = steamData?.reviewCount || game.popularity || 50;
  if (reviewCount > 500000) popularity = 9.5;
  else if (reviewCount > 200000) popularity = 9.0;
  else if (reviewCount > 100000) popularity = 8.5;
  else if (reviewCount > 50000) popularity = 8.0;
  else if (reviewCount > 10000) popularity = 7.5;
  else popularity = 7.0;
  let relevance = 7.0;
  const currentYear = new Date().getFullYear();
  const gameAge = currentYear - (game.year || 2020);
  if (gameAge <= 1) relevance = 9.5;
  else if (gameAge <= 2) relevance = 9.0;
  else if (gameAge <= 3) relevance = 8.5;
  else if (gameAge <= 5) relevance = 8.0;
  else if (gameAge <= 8) relevance = 7.5;
  else relevance = 7.0;
  let weightedRating = (metacriticScore * 0.3) + (userRating * 0.4) + (popularity * 0.2) + (relevance * 0.1);
  if (name.includes("soulcalibur") || (name.includes("tekken") && !name.includes("8"))) weightedRating = Math.min(weightedRating, 8.2);
  if (name.includes("fifa") || name.includes("pes") || name.includes("efootball")) weightedRating = Math.min(weightedRating, 7.5);
  if (weightedRating >= 8.5 && weightedRating < 9.0) weightedRating += 0.2;
  if (weightedRating >= 9.0 && weightedRating < 9.3) weightedRating += 0.15;
  if (name.includes("witcher 3") || name.includes("baldur's gate 3") || name.includes("elden ring") || name.includes("red dead redemption 2")) {
    weightedRating = Math.max(weightedRating, 9.3);
    weightedRating = Math.min(weightedRating, 9.7);
  } else {
    weightedRating = Math.min(weightedRating, 9.2);
  }
  weightedRating = Math.round(weightedRating * 10) / 10;
  weightedRating = Math.max(weightedRating, 6.0);
  return weightedRating;
};

const generateLongDescription = (gameName, rawDescription) => {
  if (rawDescription && rawDescription.length > 200) return rawDescription;
  return `${gameName} ist ein Meisterwerk der Videospielgeschichte. Die Entwickler haben unglaubliche Arbeit in jedes Detail gesteckt, von der Grafik bis zum Sounddesign. Die Spielmechanik ist intuitiv und dennoch tiefgründig. Die Geschichte fesselt von der ersten Minute an und lässt dich nicht mehr los. Ein absolutes Muss für jeden Fan des Genres!`;
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

  const text = translations[lang];

  const closeReviews = () => {
    setShowReviews(false);
    setReviewsGame(null);
  };

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

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
    const steamAppIds = allGames.map(g => g.steamId).filter(id => id && typeof id === 'number');
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
    const manualGemsWithRating = MANUAL_HIDDEN_GEMS.map(g => ({ ...g, finalRating: g.rating, finalImg: g.img, finalDescription: g.description }));
    const allGems = [...rawgGems, ...manualGemsWithRating];
    return allGems.filter((g, index, self) => index === self.findIndex(g2 => g2.name === g.name)).sort((a, b) => b.finalRating - a.finalRating).slice(0, 30);
  }, [gamesWithData]);

  const TOP_PICKS_GAMES = useMemo(() => {
    const rawgPicks = gamesWithData.filter(g => g.finalRating >= 9.0 && g.reviewCount >= 50000).slice(0, 20);
    if (rawgPicks.length >= 10) return rawgPicks;
    return gamesWithData.filter(g => g.finalRating >= 8.8).slice(0, 20);
  }, [gamesWithData]);

  const BEST_EVER_GAMES = useMemo(() => gamesWithData.sort((a,b) => b.finalRating - a.finalRating).slice(0, 40), [gamesWithData]);

  const searchAOTY = () => {
    const search = aotySearch.trim().toLowerCase();
    if (!search) { setAotyResult(null); setSelectedAotyYear(null); return; }
    if (/^\d{4}$/.test(search)) {
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
    const filtered = gamesWithData.filter(g => g.genre === selectedGenreForTop);
    let games = [...filtered].sort((a, b) => b.finalRating - a.finalRating);
    if (games.length < 10) return gamesWithData.filter(g => g.finalRating >= 8.5).slice(0, 20);
    return games.slice(0, 20);
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
    audio.src = type === "click" ? "https://www.soundjay.com/misc/sounds/button-click-1.mp3" : type === "add" ? "https://www.soundjay.com/misc/sounds/notification-1.mp3" : "https://www.soundjay.com/misc/sounds/bell-ringing-1.mp3";
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
    if (result) { setShowLoginModal(false); setEmail(""); setPassword(""); playSound("login"); }
    else { setErrorMsg("Login failed"); }
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
    @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }
    @keyframes wheelSpin { 0% { transform: rotate(0deg); } 100% { transform: rotate(1440deg); } }
    .fade-in { animation: fadeIn 0.4s ease-out; }
    .slide-in { animation: slideIn 0.3s ease-out; }
    .game-card { transition: all 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1); cursor: pointer; }
    .game-card:hover { transform: translateY(-8px) scale(1.02); box-shadow: 0 20px 30px -12px rgba(0,0,0,0.5); }
    .btn-click:active { transform: scale(0.96); }
    .spinning-wheel { animation: wheelSpin 0.5s ease-out; }
    @media (max-width: 768px) {
      .main-tabs { position: fixed; top: 70px; left: 0; right: 0; background: ${currentColors.bgCard}; flex-direction: column; padding: 16px; gap: 8px; z-index: 1000; border-radius: 0 0 16px 16px; box-shadow: 0 10px 20px rgba(0,0,0,0.3); }
      .main-tabs button { width: 100%; justify-content: center; }
    }
  `;

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = animationStyles;
    document.head.appendChild(style);
  }, []);

  const styles = {
    app: { background: currentColors.bg, minHeight: "100vh", width: "100%", color: currentColors.text, fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" },
    container: { maxWidth: 1200, margin: "0 auto", padding: "0 24px" },
    header: { padding: "20px 0", borderBottom: `1px solid rgba(255,212,0,0.15)`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 },
    logo: { fontSize: 26, fontWeight: 800, display: "flex", alignItems: "center", gap: 10, cursor: "pointer" },
    logoIcon: { background: `linear-gradient(135deg, ${currentColors.primary} 0%, ${currentColors.primaryDark} 100%)`, borderRadius: "14px", padding: "8px 12px", color: currentColors.bg },
    logoText: { background: `linear-gradient(135deg, ${currentColors.primary} 0%, ${currentColors.primaryDark} 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
    mainTabs: { display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" },
    mainTab: (active) => ({ background: active ? currentColors.primary : "rgba(255,255,255,0.06)", border: "none", borderRadius: 14, padding: "10px 22px", color: active ? currentColors.bg : currentColors.text, cursor: "pointer", fontWeight: 600, fontSize: 15, display: "flex", alignItems: "center", gap: 8 }),
    iconBtn: { background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 12, padding: "10px 14px", color: currentColors.text, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontSize: 14 },
    loginBtn: { background: "linear-gradient(135deg, #4285f4, #3367d6)", border: "none", borderRadius: 12, padding: "10px 20px", color: "#fff", cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: 8, fontSize: 14 },
    logoutBtn: { background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 12, padding: "10px 20px", color: currentColors.text, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontSize: 14 },
    userAvatar: { width: 36, height: 36, borderRadius: "50%", background: currentColors.primary, display: "flex", alignItems: "center", justifyContent: "center", color: currentColors.bg, fontWeight: 700, fontSize: 16 },
    hamburgerBtn: { background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 12, padding: "10px 14px", color: currentColors.text, cursor: "pointer", display: "none", alignItems: "center", gap: 8, fontSize: 20, "@media (max-width: 768px)": { display: "flex" } },
    tabNav: { display: "flex", gap: 4, borderBottom: `1px solid rgba(255,255,255,0.08)`, marginTop: 24, marginBottom: 24, overflowX: "auto" },
    tabNavBtn: (active) => ({ background: "none", border: "none", borderBottom: active ? `2px solid ${currentColors.primary}` : "2px solid transparent", color: active ? currentColors.primary : currentColors.textSecondary, padding: "12px 20px", cursor: "pointer", fontSize: 13, fontWeight: active ? 600 : 400, whiteSpace: "nowrap" }),
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 24 },
    gameCard: { background: currentColors.bgCard, borderRadius: 16, overflow: "hidden", cursor: "pointer", border: "1px solid rgba(255,255,255,0.06)", position: "relative" },
    gameImg: { width: "100%", aspectRatio: "3/4", objectFit: "cover" },
    gameInfo: { padding: "14px" },
    gameName: { fontSize: 15, fontWeight: 700, marginBottom: 4, color: currentColors.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
    rating: { display: "flex", alignItems: "center", gap: 4, color: currentColors.primary, fontSize: 13, fontWeight: 600, marginBottom: 8 },
    addBtn: { background: currentColors.primary, border: "none", borderRadius: 10, padding: "10px 12px", fontSize: 13, fontWeight: 600, cursor: "pointer", width: "100%", marginTop: 10, color: currentColors.bg, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 },
    searchBar: { background: currentColors.bgCard, border: `1px solid rgba(255,255,255,0.08)`, borderRadius: 14, padding: "14px 18px", color: currentColors.text, fontSize: 15, width: "100%", marginBottom: 24, outline: "none" },
    pillGrid: { display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 28 },
    pill: (selected) => ({ background: selected ? currentColors.primary : "rgba(255,255,255,0.06)", border: "none", borderRadius: 40, padding: "12px 24px", color: selected ? currentColors.bg : currentColors.text, cursor: "pointer", fontSize: 14, fontWeight: selected ? 600 : 400 }),
    nextBtn: { background: currentColors.primary, border: "none", borderRadius: 14, padding: "14px 32px", fontSize: 16, fontWeight: 600, cursor: "pointer", color: currentColors.bg, marginTop: 28 },
    stepContainer: { padding: "28px 0", maxWidth: 650, margin: "0 auto" },
    stepTitle: { fontSize: 28, fontWeight: 700, marginBottom: 28, textAlign: "center", color: currentColors.text },
    filterRow: { display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24, alignItems: "center" },
    filterBtn: (active) => ({ background: active ? currentColors.primary : "rgba(255,255,255,0.05)", border: "none", borderRadius: 10, padding: "8px 16px", color: active ? currentColors.bg : currentColors.text, cursor: "pointer", fontSize: 13 }),
    sectionTitle: { fontSize: 24, fontWeight: 700, marginBottom: 24, display: "flex", alignItems: "center", gap: 12, color: currentColors.text },
    topPicksRow: { display: "flex", gap: 20, overflowX: "auto", marginBottom: 32, paddingBottom: 12 },
    topPickCard: { minWidth: 220, background: currentColors.bgCard, borderRadius: 14, padding: 14, cursor: "pointer", position: "relative" },
    libraryCard: { background: currentColors.bgCard, borderRadius: 14, display: "flex", gap: 16, padding: 16, marginBottom: 14, alignItems: "center", flexWrap: "wrap" },
    libraryImg: { width: 65, height: 87, objectFit: "cover", borderRadius: 10 },
    libraryInfo: { flex: 1 },
    libraryTitle: { fontWeight: 700, fontSize: 16, color: currentColors.text, marginBottom: 4 },
    libraryMeta: { fontSize: 12, color: currentColors.textSecondary, marginBottom: 8 },
    libraryActions: { display: "flex", gap: 10, flexWrap: "wrap" },
    select: { background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 10, padding: "8px 14px", color: currentColors.text, fontSize: 13, cursor: "pointer" },
    statCard: { background: currentColors.bgCard, borderRadius: 14, padding: "16px", textAlign: "center", minWidth: 100 },
    statNumber: { fontSize: 32, fontWeight: 800, color: currentColors.primary },
    statLabel: { fontSize: 12, color: currentColors.textSecondary, marginTop: 4 },
    statsRow: { display: "flex", gap: 16, marginBottom: 28, flexWrap: "wrap" },
    profileHeader: { display: "flex", gap: 24, alignItems: "center", background: currentColors.bgCard, borderRadius: 24, padding: 28, marginBottom: 28, flexWrap: "wrap", justifyContent: "center", textAlign: "center" },
    profileAvatarLarge: { width: 90, height: 90, borderRadius: "50%", background: currentColors.primary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 38, fontWeight: 700, color: currentColors.bg },
    editBtn: { background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 10, padding: "10px 20px", color: currentColors.text, cursor: "pointer", fontSize: 13, marginTop: 18, display: "inline-flex", alignItems: "center", gap: 8 },
    lastPlayedRow: { display: "flex", gap: 16, overflowX: "auto", marginBottom: 28, paddingBottom: 10 },
    lastPlayedCard: { minWidth: 90, background: currentColors.bgCard, borderRadius: 12, padding: 10, textAlign: "center", cursor: "pointer" },
    lastPlayedImg: { width: 70, height: 70, objectFit: "cover", borderRadius: 10, marginBottom: 6 },
    lastPlayedName: { fontSize: 11, color: currentColors.text, fontWeight: 500 },
    randomFilterSection: { background: currentColors.bgCard, borderRadius: 16, padding: 20, marginBottom: 24 },
    randomFilterTitle: { fontSize: 16, fontWeight: 600, color: currentColors.text, marginBottom: 16, display: "flex", alignItems: "center", gap: 10 },
    randomFilterRow: { display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center" },
    randomCheckbox: { display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: currentColors.textSecondary },
    randomSlider: { width: 220, accentColor: currentColors.primary },
    randomSelect: { background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 10, padding: "8px 14px", color: currentColors.text, fontSize: 13, cursor: "pointer" },
    aiSection: { background: currentColors.bgCard, borderRadius: 16, padding: 24, marginBottom: 24 },
    aiRow: { display: "flex", gap: 14, marginBottom: 20, flexWrap: "wrap" },
    aiResultBox: { background: "rgba(0,0,0,0.3)", borderRadius: 14, padding: 18, marginTop: 18, fontSize: 14, color: currentColors.textSecondary, lineHeight: 1.6 },
    platformSection: { background: currentColors.bgCard, borderRadius: 16, padding: 20, marginBottom: 24 },
    platformRow: { display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center", marginBottom: 16 },
    platformBtn: (bgColor) => ({ background: bgColor, border: "none", borderRadius: 12, padding: "10px 18px", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, fontSize: 13, fontWeight: 500 }),
    modalOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.96)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" },
    modalContent: { background: currentColors.bgCard, borderRadius: 28, padding: 32, width: "90%", maxWidth: 520, border: `1px solid ${currentColors.primary}30` },
    modalTitle: { fontSize: 26, fontWeight: 700, marginBottom: 24, textAlign: "center", color: currentColors.text },
    input: { width: "100%", background: "rgba(255,255,255,0.08)", border: `1px solid rgba(255,255,255,0.1)`, borderRadius: 12, padding: "14px 18px", color: currentColors.text, fontSize: 15, marginBottom: 16, outline: "none" },
    textarea: { width: "100%", background: "rgba(255,255,255,0.08)", border: `1px solid rgba(255,255,255,0.1)`, borderRadius: 12, padding: "14px 18px", color: currentColors.text, fontSize: 15, marginBottom: 16, outline: "none", resize: "vertical", fontFamily: "inherit" },
    passwordWrapper: { position: "relative", width: "100%" },
    passwordEye: { position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", cursor: "pointer", color: currentColors.textSecondary },
    modalBtn: { background: currentColors.primary, border: "none", borderRadius: 14, padding: "14px", fontSize: 16, fontWeight: 600, cursor: "pointer", width: "100%", marginTop: 12, color: currentColors.bg },
    modalBtnSecondary: { background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 14, padding: "14px", fontSize: 16, fontWeight: 600, cursor: "pointer", width: "auto", color: currentColors.text },
    switchText: { textAlign: "center", marginTop: 16, color: currentColors.textSecondary, fontSize: 14, cursor: "pointer" },
    errorText: { color: colors.error, fontSize: 13, textAlign: "center", marginBottom: 14 },
    successText: { color: colors.success, fontSize: 13, textAlign: "center", marginBottom: 14 },
    loadingSpinner: { width: 48, height: 48, border: `3px solid ${currentColors.primary}20`, borderTop: `3px solid ${currentColors.primary}`, borderRadius: "50%", animation: "spin 1s linear infinite" },
    loadingOverlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" },
    emptyState: { textAlign: "center", padding: 60, background: currentColors.bgCard, borderRadius: 24, color: currentColors.textSecondary },
    reviewStars: { display: "flex", gap: 12, justifyContent: "center", marginBottom: 24 },
    reviewStar: { fontSize: 36, cursor: "pointer", color: currentColors.textSecondary },
    reviewCard: { background: currentColors.bgCard, borderRadius: 14, padding: 16, marginBottom: 14 },
    reviewHeader: { display: "flex", justifyContent: "space-between", marginBottom: 10 },
    reviewUsername: { fontWeight: 700, fontSize: 14, color: currentColors.text },
    reviewRating: { color: currentColors.primary, fontSize: 13 },
    reviewComment: { fontSize: 14, color: currentColors.textSecondary, lineHeight: 1.4 },
    reviewActions: { display: "flex", gap: 16, marginTop: 12 },
    likeBtn: { display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: currentColors.textSecondary, cursor: "pointer", background: "none", border: "none" },
    userCard: { background: currentColors.bgCard, borderRadius: 14, padding: 16, marginBottom: 14, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" },
    userAvatarSmall: { width: 48, height: 48, borderRadius: "50%", background: currentColors.primary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 700, color: currentColors.bg },
    searchRow: { display: "flex", gap: 14, marginBottom: 24 },
    gameDetailHeader: { display: "flex", gap: 28, flexWrap: "wrap", marginBottom: 28 },
    gameDetailImg: { width: 240, borderRadius: 18, objectFit: "cover" },
    gameDetailInfo: { flex: 1 },
    gameDetailName: { fontSize: 32, fontWeight: 700, marginBottom: 10, color: currentColors.text },
    gameDetailDeveloper: { fontSize: 14, color: currentColors.textSecondary, marginBottom: 8 },
    gameDetailRating: { fontSize: 16, color: currentColors.primary, marginBottom: 12 },
    gameDetailDescription: { fontSize: 15, color: currentColors.textSecondary, lineHeight: 1.6, marginBottom: 16 },
    gameDetailPlatforms: { display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 },
    platformBadge: { background: "rgba(255,255,255,0.1)", borderRadius: 24, padding: "6px 14px", fontSize: 12, color: currentColors.text },
    buyButtonsRow: { display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 },
    buyBtn: (bgColor) => ({ background: bgColor, border: "none", borderRadius: 10, padding: "10px 18px", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, fontSize: 13, fontWeight: 500 }),
    backBtn: { display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.05)", border: "none", borderRadius: 12, padding: "10px 20px", color: currentColors.text, cursor: "pointer", marginBottom: 24, fontSize: 14 },
    trailerFrame: { width: "100%", height: 350, borderRadius: 18, marginBottom: 24, border: "none", background: "#000" },
    settingsSection: { background: currentColors.bgCard, borderRadius: 16, padding: 24, marginBottom: 24 },
    settingsRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 14 },
    settingsLabel: { fontSize: 15, color: currentColors.text },
    checkbox: { display: "flex", alignItems: "center", gap: 12, marginBottom: 16, cursor: "pointer", fontSize: 14, color: currentColors.textSecondary },
    achievementGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12, marginTop: 16 },
    achievementCard: { background: "rgba(0,0,0,0.3)", borderRadius: 12, padding: 12, display: "flex", alignItems: "center", gap: 12 },
    achievementIcon: { fontSize: 28 },
    achievementInfo: { flex: 1 },
    achievementName: { fontSize: 13, fontWeight: 600, color: currentColors.text },
    achievementDesc: { fontSize: 11, color: currentColors.textSecondary },
    donationBtn: { background: "linear-gradient(135deg, #ffd400, #e6bf00)", border: "none", borderRadius: 12, padding: "12px 20px", color: "#0a0a0f", cursor: "pointer", fontWeight: 700, display: "flex", alignItems: "center", gap: 8, fontSize: 14 },
    aotyResultCard: { background: currentColors.bgCard, borderRadius: 24, padding: 28, marginBottom: 24, border: `1px solid ${currentColors.primary}30`, transition: "all 0.3s ease" },
    aotyWinnerCard: { background: `linear-gradient(135deg, ${currentColors.primary}10, ${currentColors.bgCard})`, borderRadius: 16, padding: 16, marginBottom: 12, cursor: "pointer", transition: "transform 0.2s", display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" },
    gotyBackBtn: { background: "rgba(255,255,255,0.05)", border: "none", borderRadius: 12, padding: "10px 20px", color: currentColors.text, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 20, fontSize: 14 },
    topGenreSelect: { background: currentColors.bgCard, border: `1px solid ${currentColors.primary}30`, borderRadius: 12, padding: "12px 20px", color: currentColors.text, fontSize: 14, marginBottom: 24, cursor: "pointer" },
    aotyYearCard: { background: currentColors.bgCard, borderRadius: 16, padding: 16, textAlign: "center", cursor: "pointer", transition: "all 0.3s ease", border: "1px solid rgba(255,255,255,0.05)" },
    playlistCard: { background: currentColors.bgCard, borderRadius: 16, padding: 16, marginBottom: 16, border: `1px solid ${currentColors.primary}20` },
    gameNightCard: { background: currentColors.bgCard, borderRadius: 16, padding: 20, marginBottom: 24, textAlign: "center" },
    activityCard: { background: currentColors.bgCard, borderRadius: 12, padding: 12, marginBottom: 12, display: "flex", alignItems: "center", gap: 12 },
    compareCard: { background: currentColors.bgCard, borderRadius: 16, padding: 20, marginBottom: 24 },
    journalCard: { background: currentColors.bgCard, borderRadius: 16, padding: 16, marginBottom: 16 },
    tag: { background: "rgba(255,212,0,0.15)", borderRadius: 16, padding: "4px 10px", fontSize: 11, color: currentColors.primary, display: "inline-flex", alignItems: "center", gap: 6 }
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
        <div style={{ position: "absolute", top: 10, right: 10, background: "rgba(0,0,0,0.7)", borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 700, color: currentColors.primary }}>★ {rating?.toFixed(1)}</div>
        <button className="btn-click" style={{ position: "absolute", top: 10, left: 10, background: "rgba(0,0,0,0.7)", border: "none", borderRadius: 20, padding: "6px 8px", cursor: "pointer" }} onClick={(e) => { e.stopPropagation(); toggleFavorite(game.id); }}>
          {isFavorite ? <BsFillHeartFill color={currentColors.primary} size={12} /> : <FaHeart color="#fff" size={12} />}
        </button>
        <div style={styles.gameInfo}>
          <div style={styles.gameName}>{game.name}</div>
          <div style={styles.rating}><FaStar size={11} /> {rating?.toFixed(1)}</div>
          <div style={{ fontSize: 11, color: currentColors.textSecondary, marginBottom: 8 }}>{game.playtime}</div>
          {tags.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 }}>
              {tags.map((tag, i) => <span key={i} style={styles.tag}>{tag}</span>)}
            </div>
          )}
          {showBtn && <button className="btn-click" style={styles.addBtn} onClick={(e) => { e.stopPropagation(); addToLibrary(game); }}>{inLibrary ? <FaCheck size={12} /> : <FaPlus size={12} />} {inLibrary ? text.inLibrary : text.add}</button>}
        </div>
      </div>
    );
  };

  const backlogRecommendation = getBacklogRecommendation();

  if (loading || gamesLoading) {
    return (
      <div style={{ background: currentColors.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
        <div style={styles.loadingSpinner}></div>
        <div style={{ marginTop: 20, color: currentColors.text }}>{text.loading}</div>
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
    return (
      <div style={styles.app}>
        <div style={styles.container}>
          <div style={styles.header}>
            <div style={styles.logo} onClick={() => setCurrentTab("home")}>
              <span style={styles.logoIcon}>NX</span>
              <span style={styles.logoText}>NexPlay</span>
            </div>
            <div style={styles.mainTabs}>
              <button className="btn-click" style={styles.iconBtn} onClick={() => setShowSettings(true)}><FaCog /> {text.settings}</button>
              {!user ? <button className="btn-click" style={styles.loginBtn} onClick={() => setShowLoginModal(true)}><FaEnvelope /> {text.login}</button> :
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={styles.userAvatar}>{userData?.username?.charAt(0).toUpperCase()}</div>
                  <button className="btn-click" style={styles.logoutBtn} onClick={logout}>{text.logout}</button>
                </div>}
            </div>
          </div>
          <button className="btn-click" style={styles.backBtn} onClick={closeGameDetail}><FaArrowLeft /> {text.back}</button>
          <div className="fade-in" style={styles.gameDetailHeader}>
            <img src={selectedGameDetail.finalImg || selectedGameDetail.img} style={styles.gameDetailImg} alt={selectedGameDetail.name} />
            <div style={styles.gameDetailInfo}>
              <div style={styles.gameDetailName}>{selectedGameDetail.name}</div>
              <div style={styles.gameDetailDeveloper}>{selectedGameDetail.developer}</div>
              <div style={styles.gameDetailRating}>★ {(selectedGameDetail.finalRating || selectedGameDetail.rating)?.toFixed(1)} · {selectedGameDetail.year} · {selectedGameDetail.playtime}</div>
              <div style={styles.gameDetailDescription}>{selectedGameDetail.finalDescription || generateLongDescription(selectedGameDetail.name, "")}</div>
              <div style={styles.gameDetailPlatforms}>{selectedGameDetail.platforms?.map(p => <span key={p} style={styles.platformBadge}>{p}</span>)}</div>
              <div style={styles.buyButtonsRow}>{buyLinks.map(link => <button key={link.name} className="btn-click" style={styles.buyBtn(link.color)} onClick={() => window.open(link.url, "_blank")}>{link.icon} {text.buyOn} {link.name}</button>)}</div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
                <button className="btn-click" style={{ ...styles.addBtn, width: "auto", display: "inline-flex" }} onClick={() => addToLibrary(selectedGameDetail)}>+ {text.add}</button>
                <button className="btn-click" style={{ ...styles.addBtn, width: "auto", display: "inline-flex", background: isOnWishlist ? colors.success : currentColors.primary }} onClick={() => { if (!isOnWishlist) addToWishlist(selectedGameDetail); else alert("Already on wishlist!"); }}>⭐ {text.addToWishlist}</button>
                <button className="btn-click" style={{ ...styles.addBtn, width: "auto", display: "inline-flex", background: "#444" }} onClick={() => alert("Price check would be implemented with a real API")}>{text.checkPrice}</button>
              </div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>{text.tags}:</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
                  {tags.map((tag, i) => <span key={i} style={styles.tag}>{tag} <button onClick={() => removeTag(selectedGameDetail.id, i)} style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", marginLeft: 4 }}>✕</button></span>)}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <input style={{ ...styles.input, marginBottom: 0, flex: 1 }} placeholder={text.addTag} value={newTag} onChange={e => setNewTag(e.target.value)} onKeyPress={e => e.key === 'Enter' && addTag(selectedGameDetail.id, newTag)} />
                  <button className="btn-click" style={styles.addBtn} onClick={() => addTag(selectedGameDetail.id, newTag)}>+</button>
                </div>
              </div>
              <div style={styles.journalCard}>
                <div style={{ fontWeight: 600, marginBottom: 8 }}><GiNotebook /> {text.journalNotes}</div>
                <textarea style={styles.textarea} rows="3" placeholder="Write your thoughts about this game..." value={journalText} onChange={e => setJournalText(e.target.value)} onBlur={() => saveJournalNote(selectedGameDetail.id, journalText)} />
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
          <div className="fade-in" style={{ marginTop: 28 }}>
            <div style={styles.sectionTitle}>{text.reviews} ({gameDetailReviews.length})</div>
            {gameDetailReviews.length === 0 ? <div style={styles.emptyState}>{text.noReviews}</div> :
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
          <button className="btn-click" style={{ ...styles.iconBtn, display: window.innerWidth <= 768 ? "flex" : "none" }} onClick={toggleMobileMenu}>
            <FaBars />
          </button>
          <div style={{ display: window.innerWidth > 768 ? "block" : "none" }}>
            <div className="main-tabs" style={styles.mainTabs}>
              <button className="btn-click" style={styles.mainTab(currentTab === "home")} onClick={() => { setCurrentTab("home"); setMobileMenuOpen(false); }}><FaHome /> {text.home}</button>
              <button className="btn-click" style={styles.mainTab(currentTab === "library")} onClick={() => { setCurrentTab("library"); setMobileMenuOpen(false); }}><BsFillCollectionFill /> {text.library}</button>
              <button className="btn-click" style={styles.mainTab(currentTab === "profile")} onClick={() => { setCurrentTab("profile"); setMobileMenuOpen(false); }}><FaUser /> {text.profile}</button>
              <button className="btn-click" style={styles.mainTab(currentTab === "friends")} onClick={() => { setCurrentTab("friends"); setMobileMenuOpen(false); }}><FaUsers /> {text.friends}</button>
              <button className="btn-click" style={styles.mainTab(currentTab === "ai")} onClick={() => { setCurrentTab("ai"); setMobileMenuOpen(false); }}><FaRobot /> {text.ai}</button>
              <button className="btn-click" style={styles.mainTab(currentTab === "aoty")} onClick={() => { setCurrentTab("aoty"); setMobileMenuOpen(false); }}><FaTrophy /> {text.aoty}</button>
              <button className="btn-click" style={styles.mainTab(currentTab === "playlists")} onClick={() => { setCurrentTab("playlists"); setMobileMenuOpen(false); }}><FaList /> {text.playlists}</button>
              <button className="btn-click" style={styles.mainTab(currentTab === "gameNight")} onClick={() => { setCurrentTab("gameNight"); setMobileMenuOpen(false); }}><GiSpinningWheel /> {text.gameNight}</button>
              <button className="btn-click" style={styles.mainTab(currentTab === "activity")} onClick={() => { setCurrentTab("activity"); setMobileMenuOpen(false); }}><FaBell /> {text.activity}</button>
              <button className="btn-click" style={styles.mainTab(currentTab === "wishlist")} onClick={() => { setCurrentTab("wishlist"); setMobileMenuOpen(false); }}><FaStar /> {text.wishlist}</button>
              <button className="btn-click" style={styles.mainTab(currentTab === "backlog")} onClick={() => { setCurrentTab("backlog"); setMobileMenuOpen(false); }}><FaChartLine /> {text.backlog}</button>
              <button className="btn-click" style={styles.mainTab(currentTab === "compare")} onClick={() => { setCurrentTab("compare"); setMobileMenuOpen(false); }}><FaBalanceScale /> {text.compare}</button>
              <button className="btn-click" style={styles.iconBtn} onClick={() => setShowSettings(true)}><FaCog /></button>
              {!user ? <button className="btn-click" style={styles.loginBtn} onClick={() => setShowLoginModal(true)}><FaEnvelope /> {text.login}</button> :
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={styles.userAvatar}>{userData?.username?.charAt(0).toUpperCase()}</div>
                  <button className="btn-click" style={styles.logoutBtn} onClick={logout}>{text.logout}</button>
                </div>}
            </div>
          </div>
        </div>
        <div style={{ display: window.innerWidth <= 768 && mobileMenuOpen ? "block" : "none" }}>
          <div className="main-tabs" style={{ ...styles.mainTabs, flexDirection: "column", width: "100%" }}>
            <button className="btn-click" style={styles.mainTab(currentTab === "home")} onClick={() => { setCurrentTab("home"); setMobileMenuOpen(false); }}><FaHome /> {text.home}</button>
            <button className="btn-click" style={styles.mainTab(currentTab === "library")} onClick={() => { setCurrentTab("library"); setMobileMenuOpen(false); }}><BsFillCollectionFill /> {text.library}</button>
            <button className="btn-click" style={styles.mainTab(currentTab === "profile")} onClick={() => { setCurrentTab("profile"); setMobileMenuOpen(false); }}><FaUser /> {text.profile}</button>
            <button className="btn-click" style={styles.mainTab(currentTab === "friends")} onClick={() => { setCurrentTab("friends"); setMobileMenuOpen(false); }}><FaUsers /> {text.friends}</button>
            <button className="btn-click" style={styles.mainTab(currentTab === "ai")} onClick={() => { setCurrentTab("ai"); setMobileMenuOpen(false); }}><FaRobot /> {text.ai}</button>
            <button className="btn-click" style={styles.mainTab(currentTab === "aoty")} onClick={() => { setCurrentTab("aoty"); setMobileMenuOpen(false); }}><FaTrophy /> {text.aoty}</button>
            <button className="btn-click" style={styles.mainTab(currentTab === "playlists")} onClick={() => { setCurrentTab("playlists"); setMobileMenuOpen(false); }}><FaList /> {text.playlists}</button>
            <button className="btn-click" style={styles.mainTab(currentTab === "gameNight")} onClick={() => { setCurrentTab("gameNight"); setMobileMenuOpen(false); }}><GiSpinningWheel /> {text.gameNight}</button>
            <button className="btn-click" style={styles.mainTab(currentTab === "activity")} onClick={() => { setCurrentTab("activity"); setMobileMenuOpen(false); }}><FaBell /> {text.activity}</button>
            <button className="btn-click" style={styles.mainTab(currentTab === "wishlist")} onClick={() => { setCurrentTab("wishlist"); setMobileMenuOpen(false); }}><FaStar /> {text.wishlist}</button>
            <button className="btn-click" style={styles.mainTab(currentTab === "backlog")} onClick={() => { setCurrentTab("backlog"); setMobileMenuOpen(false); }}><FaChartLine /> {text.backlog}</button>
            <button className="btn-click" style={styles.mainTab(currentTab === "compare")} onClick={() => { setCurrentTab("compare"); setMobileMenuOpen(false); }}><FaBalanceScale /> {text.compare}</button>
            <button className="btn-click" style={styles.iconBtn} onClick={() => setShowSettings(true)}><FaCog /></button>
            {!user ? <button className="btn-click" style={styles.loginBtn} onClick={() => setShowLoginModal(true)}><FaEnvelope /> {text.login}</button> :
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={styles.userAvatar}>{userData?.username?.charAt(0).toUpperCase()}</div>
                <button className="btn-click" style={styles.logoutBtn} onClick={logout}>{text.logout}</button>
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
                  <div style={styles.randomFilterTitle}><FaRandom /> {text.randomGame}</div>
                  <div style={styles.randomFilterRow}>
                    <label className="btn-click" style={styles.randomCheckbox}><input type="checkbox" checked={randomExcludeHorror} onChange={e => setRandomExcludeHorror(e.target.checked)} /> Exclude Horror</label>
                    <label className="btn-click" style={styles.randomCheckbox}><input type="checkbox" checked={randomExcludeIndie} onChange={e => setRandomExcludeIndie(e.target.checked)} /> Exclude Indie</label>
                    <label className="btn-click" style={styles.randomCheckbox}><input type="checkbox" checked={randomExcludeOld} onChange={e => setRandomExcludeOld(e.target.checked)} /> Exclude before 2015</label>
                    <div><span style={{ color: currentColors.textSecondary }}>{text.yearFilter}:</span>
                      <select className="btn-click" value={randomYear} onChange={e => setRandomYear(e.target.value)} style={styles.randomSelect}>
                        <option value="all">{text.allYears}</option>
                        {[...new Set(gamesWithData.map(g => g.year))].sort((a,b) => b - a).map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>
                    <div><span style={{ color: currentColors.textSecondary }}>Min Rating: {randomMinRating}</span><input type="range" min="0" max="10" step="0.5" value={randomMinRating} onChange={e => setRandomMinRating(parseFloat(e.target.value))} style={styles.randomSlider} /></div>
                    <select className="btn-click" value={randomMode} onChange={e => setRandomMode(e.target.value)} style={styles.randomSelect}>
                      <option value="full">Fully Random</option><option value="genre">Random by Genre</option><option value="mood">Random by Mood</option>
                    </select>
                    <button className="btn-click" style={styles.loginBtn} onClick={doRandom}><FaRandom /> {text.randomGame}</button>
                  </div>
                </div>

                <div style={styles.tabNav}>
                  <button className="btn-click" style={styles.tabNavBtn(step === 1)} onClick={() => setStep(1)}>{text.mood}</button>
                  <button className="btn-click" style={styles.tabNavBtn(step === 2)} onClick={() => setStep(2)}>{text.genre}</button>
                  <button className="btn-click" style={styles.tabNavBtn(step === 3)} onClick={() => setStep(3)}>{text.playtime}</button>
                  <button className="btn-click" style={styles.tabNavBtn(step === 4)} onClick={() => setStep(4)}>{text.results}</button>
                </div>

                {step === 1 && (
                  <div className="slide-in">
                    <div style={styles.stepTitle}>{text.mood} 🎭</div>
                    <div style={styles.pillGrid}>{MOODS.map(m => <button key={m} className="btn-click" style={styles.pill(selectedMoods.includes(m))} onClick={() => toggle(selectedMoods, setSelectedMoods, m)}>{m}</button>)}</div>
                    <button className="btn-click" style={styles.nextBtn} onClick={() => setStep(2)}>{text.next} →</button>
                  </div>
                )}
                {step === 2 && (
                  <div className="slide-in">
                    <div style={styles.stepTitle}>{text.genre} 🎮</div>
                    <div style={styles.pillGrid}>{GENRES.map(g => <button key={g} className="btn-click" style={styles.pill(selectedGenres.includes(g))} onClick={() => toggle(selectedGenres, setSelectedGenres, g)}>{g}</button>)}</div>
                    <button className="btn-click" style={styles.nextBtn} onClick={() => setStep(3)}>{text.next} →</button>
                  </div>
                )}
                {step === 3 && (
                  <div className="slide-in">
                    <div style={styles.stepTitle}>{text.playtime} ⏱️</div>
                    <div style={styles.pillGrid}>{PLAYTIMES.map(p => <button key={p} className="btn-click" style={styles.pill(selectedPlaytime === p)} onClick={() => setSelectedPlaytime(p === selectedPlaytime ? null : p)}>{p}</button>)}</div>
                    <button className="btn-click" style={styles.nextBtn} onClick={() => setStep(4)}>{text.results} 🚀</button>
                  </div>
                )}
                {step === 4 && (
                  <div className="fade-in">
                    <input style={styles.searchBar} placeholder={text.search} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                    <div style={styles.filterRow}>
                      <span>{text.sort}:</span>
                      <button className="btn-click" style={styles.filterBtn(sortBy === "score")} onClick={() => setSortBy("score")}>{text.bestMatch}</button>
                      <button className="btn-click" style={styles.filterBtn(sortBy === "rating")} onClick={() => setSortBy("rating")}>{text.rating}</button>
                      <button className="btn-click" style={styles.filterBtn(sortBy === "year")} onClick={() => setSortBy("year")}>{text.year}</button>
                    </div>
                    {topPicks.length > 0 && (
                      <div>
                        <div style={styles.sectionTitle}>🎯 {text.topPicks}</div>
                        <div style={styles.topPicksRow}>{topPicks.map((g,i) => <div key={g.id} className="game-card" style={styles.topPickCard} onClick={() => openGameDetail(g)}><div style={{ fontSize: 24, marginBottom: 8 }}>{["🥇","🥈","🥉","4","5","6","7","8"][i]}</div><img src={g.finalImg || g.img} style={{ width: "100%", height: 90, objectFit: "cover", borderRadius: 10 }} alt={g.name} /><div style={{ fontWeight: 700, marginTop: 10, color: currentColors.text }}>{g.name}</div><div style={{ fontSize: 12, color: currentColors.primary }}>★ {(g.finalRating || g.rating)?.toFixed(1)}</div><button className="btn-click" style={styles.addBtn} onClick={(e) => { e.stopPropagation(); addToLibrary(g); }}>+ {text.add}</button></div>)}</div>
                      </div>
                    )}
                    <div style={styles.sectionTitle}>📋 {text.allResults}</div>
                    <div style={styles.grid}>{restResults.slice(0, 30).map(g => <GameCard key={g.id} game={g} showBtn={true} />)}</div>
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
                  <button className="btn-click" style={styles.filterBtn(sortBy === "year")} onClick={() => setSortBy("year")}>{text.year}</button>
                </div>
                <div style={styles.sectionTitle}>🏆 {text.bestEver}</div>
                <div style={styles.grid}>{filteredCategoryGames(BEST_EVER_GAMES).slice(0, 40).map(g => <GameCard key={g.id} game={g} showBtn={true} />)}</div>
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
                <div style={{ ...styles.sectionTitle, fontSize: 20, marginBottom: 16 }}>⭐ {selectedGenreForTop}</div>
                {top20ByGenre.length === 0 ? (
                  <div style={styles.emptyState}>No games found in this genre. Try another one!</div>
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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={styles.sectionTitle}>📚 {text.library} ({library.length})</div>
              <div style={{ display: "flex", gap: 12 }}>
                <button className="btn-click" style={styles.loginBtn} onClick={exportLibrary}><FaFileExport /> {text.export}</button>
                <label className="btn-click" style={styles.loginBtn}><FaFileImport /> {text.import}<input type="file" accept=".json" style={{ display: "none" }} onChange={importLibrary} /></label>
              </div>
            </div>
            <div style={styles.statsRow}>
              <div style={styles.statCard}><div style={styles.statNumber}>{library.length}</div><div>{text.total}</div></div>
              <div style={styles.statCard}><div style={styles.statNumber}>{library.filter(g => g.status === "playing").length}</div><div>{text.playing}</div></div>
              <div style={styles.statCard}><div style={styles.statNumber}>{library.filter(g => g.status === "completed").length}</div><div>{text.completed}</div></div>
            </div>
            {library.length === 0 ? <div style={styles.emptyState}>{text.library} is empty. Add games from Discover!</div> : library.map(game => (
              <div key={game.id} className="fade-in" style={styles.libraryCard}>
                <img src={game.finalImg || game.img} style={styles.libraryImg} onClick={() => openGameDetail(game)} alt={game.name} />
                <div style={styles.libraryInfo}>
                  <div style={styles.libraryTitle}>{game.name}</div>
                  <div style={styles.libraryMeta}>{game.developer} · {game.year}</div>
                  <div style={styles.libraryActions}>
                    <select className="btn-click" value={game.status} onChange={e => updateStatus(game.id, e.target.value, game)} style={styles.select}>
                      <option value="wishlist">📝 Wishlist</option><option value="playing">🎮 {text.playing}</option><option value="completed">✅ {text.completed}</option>
                    </select>
                    <button className="btn-click" onClick={() => toggleFavorite(game.id)} style={styles.select}><FaHeart color={favorites.includes(game.id) ? currentColors.primary : "#fff"} /></button>
                    <button className="btn-click" onClick={() => markAsPlayed(game)} style={styles.select}><FaClock /> {text.played}</button>
                    <button className="btn-click" onClick={() => removeFromLibrary(game.id)} style={{ ...styles.select, color: "#ff6b6b" }}>{text.remove}</button>
                    <button className="btn-click" onClick={() => { if (playlists.length === 0) alert("Create a playlist first!"); else { const pId = prompt("Enter playlist ID to add this game"); if (pId) addToPlaylist(parseInt(pId), game); } }} style={styles.select}><FaList /> Add to Playlist</button>
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
                    <div style={{ fontSize: 24, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>{userData?.username}{userData?.username === "Sherlock10K" && <span style={{ color: currentColors.primary }}>👑</span>}</div>
                    <div style={{ fontSize: 13, color: currentColors.textSecondary }}>{user.email}</div>
                    <div style={{ fontSize: 13, color: currentColors.textSecondary, marginBottom: 14 }}>{userData?.bio || "No bio"}</div>
                    <div style={styles.statsRow}>
                      <div><div style={styles.statNumber}>{library.length}</div><div>{text.total}</div></div>
                      <div><div style={styles.statNumber}>{library.filter(g => g.status === "completed").length}</div><div>{text.completed}</div></div>
                      <div><div style={styles.statNumber}>{favorites.length}</div><div>{text.favorites}</div></div>
                      <div><div style={styles.statNumber}>{wishlist.length}</div><div>{text.wishlist}</div></div>
                    </div>
                    <div style={{ ...styles.statsRow, marginTop: 8 }}>
                      <div style={styles.statCard}><div style={{ fontSize: 20 }}>🏆</div><div>{text.topRated}</div><div style={{ fontSize: 12, color: currentColors.primary }}>{profileStats.topRated?.name || "None"}</div></div>
                      <div style={styles.statCard}><div style={{ fontSize: 20 }}>🎭</div><div>{text.topGenre}</div><div style={{ fontSize: 12, color: currentColors.primary }}>{profileStats.topGenre}</div></div>
                      <div style={styles.statCard}><div style={{ fontSize: 20 }}>⏱️</div><div>{text.totalPlaytime}</div><div style={{ fontSize: 12, color: currentColors.primary }}>{profileStats.totalPlaytime}h</div></div>
                      <div style={styles.statCard}><div style={{ fontSize: 20 }}>📊</div><div>Avg Rating</div><div style={{ fontSize: 12, color: currentColors.primary }}>{profileStats.avgRating}</div></div>
                    </div>
                    <button className="btn-click" style={styles.editBtn} onClick={openEditModal}><FaEdit /> {text.editProfile}</button>
                    <button className="btn-click" style={{ ...styles.donationBtn, marginLeft: 12, marginTop: 18 }} onClick={() => window.open("https://ko-fi.com", "_blank")}><FaDonate /> {text.donate}</button>
                  </div>
                </div>

                <div style={styles.sectionTitle}><GiAchievement /> {text.achievements}</div>
                <div style={styles.achievementGrid}>
                  {achievements.map(ach => (
                    <div key={ach.id} style={{ ...styles.achievementCard, opacity: ach.unlocked ? 1 : 0.5 }}>
                      <div style={styles.achievementIcon}>{ach.icon}</div>
                      <div style={styles.achievementInfo}>
                        <div style={styles.achievementName}>{ach.name} {ach.funny && "😂"} {ach.hidden && "🤫"}</div>
                        <div style={styles.achievementDesc}>{ach.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={styles.platformSection}>
                  <div style={styles.randomFilterTitle}><FaSteam /> Steam Connection</div>
                  <div style={styles.platformRow}>
                    <input type="text" placeholder={text.steamId} value={steamIdInput} onChange={e => setSteamIdInput(e.target.value)} style={{ ...styles.input, marginBottom: 0, flex: 1 }} />
                    <button className="btn-click" style={styles.platformBtn(colors.steam)} onClick={handleSteamLogin} disabled={syncingPlatform === "steam"}>
                      <FaSteam /> {syncingPlatform === "steam" ? "Importing..." : text.importGames}
                    </button>
                  </div>
                  <div style={{ fontSize: 12, color: currentColors.textSecondary, marginTop: 12 }}>
                    🔍 {text.findSteamId}: <a href="https://steamidfinder.com/" target="_blank" rel="noreferrer" style={{ color: currentColors.primary }}>steamidfinder.com</a>
                  </div>
                </div>

                {userData?.lastPlayed?.length > 0 && (
                  <><div style={styles.sectionTitle}><FaClock /> {text.recentlyPlayed}</div><div style={styles.lastPlayedRow}>{userData.lastPlayed.slice(0,6).map((g,i) => <div key={i} className="hover-lift" style={styles.lastPlayedCard} onClick={() => { const game = [...gamesWithData, ...MANUAL_HIDDEN_GEMS].find(a => a.id === g.gameId); if (game) openGameDetail(game); }}><img src={g.gameImg} style={styles.lastPlayedImg} alt={g.gameName} /><div style={styles.lastPlayedName}>{g.gameName}</div></div>)}</div></>
                )}

                {wishlist.length > 0 && (
                  <>
                    <div style={styles.sectionTitle}><FaStar /> {text.wishlist}</div>
                    <div style={styles.grid}>{wishlist.slice(0, 6).map(game => <GameCard key={game.id} game={game} showBtn={true} />)}</div>
                    {wishlist.length > 6 && <div style={{ textAlign: "center", marginTop: 16 }}><button className="btn-click" style={styles.loginBtn} onClick={() => setCurrentTab("wishlist")}>View all {wishlist.length} wishlist games →</button></div>}
                  </>
                )}

                {activityFeed.length > 0 && (
                  <>
                    <div style={styles.sectionTitle}><FaBell /> {text.activityFeed}</div>
                    <div>{activityFeed.slice(0, 5).map(activity => (
                      <div key={activity.id} style={styles.activityCard}>
                        <div style={{ fontSize: 24 }}>{activity.type === "add" ? "➕" : activity.type === "completed" ? "✅" : "🎮"}</div>
                        <div style={{ flex: 1 }}><div style={{ fontSize: 13 }}>{activity.message}</div><div style={{ fontSize: 10, color: currentColors.textMuted }}>{new Date(activity.timestamp).toLocaleString()}</div></div>
                      </div>
                    ))}</div>
                    {activityFeed.length > 5 && <div style={{ textAlign: "center", marginTop: 16 }}><button className="btn-click" style={styles.loginBtn} onClick={() => setCurrentTab("activity")}>View all activity →</button></div>}
                  </>
                )}
              </>
            ) : <div style={styles.emptyState}>Login to see your profile</div>}
          </div>
        )}

        {/* AI TAB */}
        {currentTab === "ai" && (
          <div className="fade-in">
            <div style={styles.aiSection}>
              <div style={styles.randomFilterTitle}><FaRobot /> {text.ai}</div>
              <div style={styles.aiRow}>
                <input style={{ ...styles.input, marginBottom: 0, flex: 1 }} placeholder="Ask AI for game recommendations..." value={aiQuery} onChange={e => setAiQuery(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleAiSearch()} />
                <button className="btn-click" style={styles.loginBtn} onClick={handleAiSearch} disabled={isAiLoading}>{isAiLoading ? "Thinking..." : "✨ Go"}</button>
              </div>
              {aiResponse && <div className="fade-in" style={styles.aiResultBox}>{aiResponse}</div>}
            </div>
            <div style={styles.sectionTitle}>🎯 {text.topPicks}</div>
            <div style={styles.grid}>{TOP_PICKS_GAMES.slice(0, 20).map(g => <GameCard key={g.id} game={g} showBtn={true} />)}</div>
            <div style={styles.sectionTitle}>🏆 {text.bestEver}</div>
            <div style={styles.grid}>{BEST_EVER_GAMES.slice(0, 20).map(g => <GameCard key={g.id} game={g} showBtn={true} />)}</div>
            <div style={styles.sectionTitle}>💎 {text.hiddenGems}</div>
            <div style={styles.grid}>{HIDDEN_GEMS_GAMES.map(g => <GameCard key={g.id} game={g} showBtn={true} />)}</div>
          </div>
        )}

        {/* AOTY TAB */}
        {currentTab === "aoty" && (
          <div className="fade-in">
            {selectedAotyYear ? (
              <>
                <button className="btn-click" style={styles.gotyBackBtn} onClick={() => { setSelectedAotyYear(null); setAotySearch(""); setAotyResult(null); }}>
                  <FaArrowLeft /> {text.backToAOTY}
                </button>
                <div style={styles.aotyResultCard}>
                  <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 8, textAlign: "center", color: currentColors.primary }}>{selectedAotyYear}</div>
                  <div key="tga" className="award-card" style={styles.aotyWinnerCard} onClick={() => {
                    const award = AOTY_DATA[selectedAotyYear]?.tga;
                    if (award) {
                      const gameData = { id: selectedAotyYear, name: award.winner, rating: 9.0, genre: "Action", playtime: "20-40h", year: selectedAotyYear, img: award.img, developer: "Various", mood: "Epic", description: `The Game Awards winner ${selectedAotyYear}.`, platforms: ["PC", "Console"], steamId: award.steamId, finalRating: 9.0, finalImg: award.img };
                      openGameDetail(gameData);
                    }
                  }}>
                    <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
                      <div style={{ width: 40, textAlign: "center" }}><FaTrophy style={{ color: currentColors.primary, fontSize: 28 }} /></div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, color: currentColors.primary, marginBottom: 2 }}>The Game Awards</div>
                        <div style={{ fontSize: 18, fontWeight: 600 }}>{AOTY_DATA[selectedAotyYear]?.tga?.winner || "TBA"}</div>
                      </div>
                      {AOTY_DATA[selectedAotyYear]?.tga?.img && <img src={AOTY_DATA[selectedAotyYear].tga.img} style={{ width: 80, height: 45, objectFit: "cover", borderRadius: 8 }} alt="" />}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div style={styles.sectionTitle}><FaTrophy /> {text.aotyTitle}</div>
                <input style={styles.searchBar} placeholder={text.searchAOTY} value={aotySearch} onChange={e => setAotySearch(e.target.value)} />
                {aotyResult?.type === "year" && aotyResult.data?.tga && (
                  <div style={styles.aotyResultCard}>
                    <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 16, textAlign: "center", color: currentColors.primary }}>{aotyResult.year}</div>
                    <div className="award-card" style={styles.aotyWinnerCard}>
                      <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
                        <div style={{ width: 40, textAlign: "center" }}><FaTrophy style={{ color: currentColors.primary, fontSize: 28 }} /></div>
                        <div>
                          <div style={{ fontSize: 12, color: currentColors.primary }}>The Game Awards</div>
                          <div style={{ fontSize: 18, fontWeight: 600 }}>{aotyResult.data.tga.winner}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {aotyResult?.type === "error" && <div style={styles.emptyState}>{aotyResult.message}</div>}
                {!aotySearch && !selectedAotyYear && (
                  <div style={styles.grid}>
                    {Object.entries(AOTY_DATA).reverse().map(([year, data]) => (
                      <div key={year} className="aoty-year-card" style={styles.aotyYearCard} onClick={() => setSelectedAotyYear(parseInt(year))}>
                        {data.tga?.img && <img src={data.tga.img} style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 12, marginBottom: 12 }} alt={data.tga.winner} />}
                        <div style={{ fontWeight: 700, fontSize: 20, color: currentColors.primary }}>{year}</div>
                        <div style={{ fontSize: 12, marginTop: 8 }}>{data.tga?.winner || "No data"}</div>
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
            <div style={styles.sectionTitle}><FaUsers /> {text.findFriends}</div>
            <div style={styles.searchRow}>
              <input style={{ ...styles.input, marginBottom: 0, flex: 1 }} placeholder="Search by username..." value={searchUsersTerm} onChange={e => setSearchUsersTerm(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSearchUsers()} />
              <button className="btn-click" style={styles.loginBtn} onClick={handleSearchUsers}><FaSearch /> {text.search}</button>
            </div>
            {searchingUsers && <div style={{ textAlign: "center", color: currentColors.textSecondary }}>Searching...</div>}
            {foundUsers.length === 0 && searchUsersTerm && !searchingUsers && <div style={styles.emptyState}>No users found</div>}
            {foundUsers.map(u => (
              <div key={u.id} className="fade-in" style={styles.userCard}>
                <div style={styles.userAvatarSmall}>{u.username?.charAt(0).toUpperCase()}</div>
                <div><div style={{ fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>{u.username}{u.username === "Sherlock10K" && <span style={{ color: currentColors.primary }}>👑</span>}</div><div style={{ fontSize: 13, color: currentColors.textSecondary }}>{u.bio || "No bio"}</div></div>
                <button className="btn-click" style={{ ...styles.addBtn, width: "auto", marginTop: 0, padding: "8px 16px", fontSize: 12 }} onClick={() => alert(`Friend request sent to ${u.username}`)}>Add Friend</button>
              </div>
            ))}
          </div>
        )}

        {/* PLAYLISTS TAB */}
        {currentTab === "playlists" && (
          <div className="fade-in">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div style={styles.sectionTitle}><FaList /> {text.playlists}</div>
              <button className="btn-click" style={styles.loginBtn} onClick={() => setShowCreatePlaylist(true)}><FaPlusCircle /> {text.createPlaylist}</button>
            </div>
            {playlists.length === 0 ? <div style={styles.emptyState}>No playlists yet. Create your first one!</div> : playlists.map(playlist => (
              <div key={playlist.id} style={styles.playlistCard}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div style={{ fontWeight: 700, fontSize: 18 }}>{playlist.name}</div>
                  <button className="btn-click" style={{ background: "rgba(255,255,255,0.05)", border: "none", borderRadius: 8, padding: "6px 12px", color: currentColors.textSecondary, cursor: "pointer" }} onClick={() => deletePlaylist(playlist.id)}><FaTrashAlt /> Delete</button>
                </div>
                <div style={styles.grid}>
                  {playlist.games.slice(0, 8).map(game => <GameCard key={game.id} game={game} showBtn={false} />)}
                </div>
                {playlist.games.length > 8 && <div style={{ textAlign: "center", marginTop: 12 }}>+{playlist.games.length - 8} more</div>}
              </div>
            ))}
          </div>
        )}

        {/* GAME NIGHT TAB */}
        {currentTab === "gameNight" && (
          <div className="fade-in">
            <div style={styles.gameNightCard}>
              <div style={styles.randomFilterTitle}><GiSpinningWheel /> {text.gameNightMode}</div>
              <div style={{ marginBottom: 20 }}>
                <label className="btn-click" style={styles.randomCheckbox}><input type="checkbox" checked={gameNightFilters.excludeMultiplayer} onChange={e => setGameNightFilters({ ...gameNightFilters, excludeMultiplayer: e.target.checked })} /> {text.excludeMultiplayer}</label>
              </div>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, color: currentColors.textSecondary, marginBottom: 8 }}>Min Rating: {gameNightFilters.minRating}</div>
                <input type="range" min="0" max="10" step="0.5" value={gameNightFilters.minRating} onChange={e => setGameNightFilters({ ...gameNightFilters, minRating: parseFloat(e.target.value) })} style={styles.randomSlider} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <input type="number" placeholder="Max Playtime (hours)" style={styles.input} value={gameNightFilters.maxPlaytime} onChange={e => setGameNightFilters({ ...gameNightFilters, maxPlaytime: e.target.value })} />
              </div>
              <button className="btn-click" style={styles.loginBtn} onClick={spinGameNight} disabled={spinning}>
                {spinning ? <span className="spinning-wheel">🎲</span> : <><GiSpinningWheel /> {text.spinWheel}</>}
              </button>
              {spinResult && !spinning && (
                <div style={{ marginTop: 24, textAlign: "center" }}>
                  <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>🎉 Game Night Pick!</div>
                  <GameCard game={spinResult} showBtn={true} />
                </div>
              )}
            </div>
          </div>
        )}

        {/* ACTIVITY TAB */}
        {currentTab === "activity" && (
          <div className="fade-in">
            <div style={styles.sectionTitle}><FaBell /> {text.activityFeed}</div>
            {activityFeed.length === 0 ? <div style={styles.emptyState}>No activity yet. Start adding games to your library!</div> : activityFeed.map(activity => (
              <div key={activity.id} style={styles.activityCard}>
                <div style={{ fontSize: 24 }}>{activity.type === "add" ? "➕" : activity.type === "completed" ? "✅" : activity.type === "review" ? "✍️" : "🎮"}</div>
                <div style={{ flex: 1 }}><div style={{ fontSize: 13 }}>{activity.message}</div><div style={{ fontSize: 10, color: currentColors.textMuted }}>{new Date(activity.timestamp).toLocaleString()}</div></div>
              </div>
            ))}
          </div>
        )}

        {/* WISHLIST TAB */}
        {currentTab === "wishlist" && (
          <div className="fade-in">
            <div style={styles.sectionTitle}><FaStar /> {text.wishlist}</div>
            {wishlist.length === 0 ? <div style={styles.emptyState}>Your wishlist is empty. Add games from the game detail page!</div> : <div style={styles.grid}>{wishlist.map(game => <GameCard key={game.id} game={game} showBtn={true} />)}</div>
          </div>
        )}

        {/* BACKLOG TAB */}
        {currentTab === "backlog" && (
          <div className="fade-in">
            <div style={styles.sectionTitle}><FaChartLine /> {text.backlog}</div>
            {backlogRecommendation && typeof backlogRecommendation === "object" ? (
              <div style={styles.gameNightCard}>
                <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>{text.backlogTip}:</div>
                <GameCard game={backlogRecommendation} showBtn={true} />
              </div>
            ) : (
              <div style={styles.emptyState}>{backlogRecommendation || "No backlog games! Add some games to your library."}</div>
            )}
          </div>
        )}

        {/* COMPARE TAB */}
        {currentTab === "compare" && (
          <div className="fade-in">
            <div style={styles.sectionTitle}><FaBalanceScale /> {text.compareGames}</div>
            <div style={styles.compareCard}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 12 }}>{text.selectGame} 1</div>
                  <select className="btn-click" style={styles.select} value={compareGames[0]?.id || ""} onChange={e => { const game = [...gamesWithData, ...MANUAL_HIDDEN_GEMS].find(g => g.id === parseInt(e.target.value)); setCompareGames([game, compareGames[1]]); }}>
                    <option value="">Select a game</option>
                    {[...gamesWithData, ...MANUAL_HIDDEN_GEMS].slice(0, 50).map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                  </select>
                </div>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 12 }}>{text.selectGame} 2</div>
                  <select className="btn-click" style={styles.select} value={compareGames[1]?.id || ""} onChange={e => { const game = [...gamesWithData, ...MANUAL_HIDDEN_GEMS].find(g => g.id === parseInt(e.target.value)); setCompareGames([compareGames[0], game]); }}>
                    <option value="">Select a game</option>
                    {[...gamesWithData, ...MANUAL_HIDDEN_GEMS].slice(0, 50).map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                  </select>
                </div>
              </div>
              {compareGames[0] && compareGames[1] && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 24 }}>
                  <div style={{ textAlign: "center" }}>
                    <img src={compareGames[0].finalImg || compareGames[0].img} style={{ width: 100, borderRadius: 8, marginBottom: 12 }} alt={compareGames[0].name} />
                    <div style={{ fontWeight: 700, fontSize: 16 }}>{compareGames[0].name}</div>
                    <div>★ {(compareGames[0].finalRating || compareGames[0].rating)?.toFixed(1)}</div>
                    <div>{compareGames[0].genre}</div>
                    <div>{compareGames[0].year}</div>
                    <div>{compareGames[0].playtime}</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <img src={compareGames[1].finalImg || compareGames[1].img} style={{ width: 100, borderRadius: 8, marginBottom: 12 }} alt={compareGames[1].name} />
                    <div style={{ fontWeight: 700, fontSize: 16 }}>{compareGames[1].name}</div>
                    <div>★ {(compareGames[1].finalRating || compareGames[1].rating)?.toFixed(1)}</div>
                    <div>{compareGames[1].genre}</div>
                    <div>{compareGames[1].year}</div>
                    <div>{compareGames[1].playtime}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* MODALS */}
      {showCreatePlaylist && (
        <div className="fade-in" style={styles.modalOverlay} onClick={() => setShowCreatePlaylist(false)}>
          <div className="slide-in" style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div style={styles.modalTitle}>{text.createPlaylist}</div>
            <input style={styles.input} placeholder={text.playlistName} value={newPlaylistName} onChange={e => setNewPlaylistName(e.target.value)} />
            <button className="btn-click" style={styles.modalBtn} onClick={createPlaylist}>{text.createPlaylist}</button>
          </div>
        </div>
      )}

      {showSettings && (
        <div className="fade-in" style={styles.modalOverlay} onClick={() => setShowSettings(false)}>
          <div className="slide-in" style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div style={styles.modalTitle}>{text.settings} ⚙️</div>
            <div style={styles.settingsSection}>
              <div style={styles.settingsRow}><span style={styles.settingsLabel}>{text.sound}:</span><button className="btn-click" style={styles.iconBtn} onClick={() => setSoundEnabled(!soundEnabled)}>{soundEnabled ? <FaVolumeUp /> : <FaVolumeMute />} {soundEnabled ? "ON" : "OFF"}</button></div>
              <div style={styles.settingsRow}><span style={styles.settingsLabel}>{text.language}:</span><button className="btn-click" style={styles.iconBtn} onClick={() => setLang(lang === "en" ? "de" : "en")}><FaLanguage /> {lang === "en" ? "DE" : "EN"}</button></div>
              <div style={styles.settingsRow}><span style={styles.settingsLabel}>{text.theme}:</span><div style={{ display: "flex", gap: 8 }}><button className="btn-click" style={{ ...styles.iconBtn, background: theme === "dark" ? currentColors.primary : "rgba(255,255,255,0.08)" }} onClick={() => setTheme("dark")}><FaMoon /> {text.dark}</button><button className="btn-click" style={{ ...styles.iconBtn, background: theme === "light" ? currentColors.primary : "rgba(255,255,255,0.08)" }} onClick={() => setTheme("light")}><FaSun /> {text.light}</button><button className="btn-click" style={{ ...styles.iconBtn, background: theme === "auto" ? currentColors.primary : "rgba(255,255,255,0.08)" }} onClick={() => setTheme("auto")}><FaAdjust /> {text.auto}</button></div></div>
            </div>
            <button className="btn-click" style={styles.modalBtn} onClick={() => setShowSettings(false)}>{text.close}</button>
          </div>
        </div>
      )}

      {showRandomModal && randomGame && (
        <div className="fade-in" style={styles.modalOverlay} onClick={() => setShowRandomModal(false)}>
          <div className="slide-in" style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div style={styles.modalTitle}>🎲 {text.randomGame}</div>
            <img src={randomGame.finalImg || randomGame.img} style={{ width: "100%", borderRadius: 18, marginBottom: 20 }} alt={randomGame.name} />
            <div style={{ fontSize: 18, fontWeight: 700, textAlign: "center", marginBottom: 8 }}>{randomGame.name}</div>
            <div style={{ fontSize: 15, color: currentColors.primary, textAlign: "center", marginBottom: 14 }}>★ {(randomGame.finalRating || randomGame.rating)?.toFixed(1)} · {randomGame.playtime} · {randomGame.year}</div>
            <div style={{ fontSize: 14, marginBottom: 24, color: currentColors.textSecondary, textAlign: "center", maxHeight: 150, overflow: "auto" }}>{randomGame.finalDescription || generateLongDescription(randomGame.name, "").slice(0, 300)}...</div>
            <div style={{ display: "flex", gap: 14, justifyContent: "center" }}><button className="btn-click" style={{ ...styles.addBtn, width: "auto", marginTop: 0, padding: "10px 24px" }} onClick={() => { addToLibrary(randomGame); setShowRandomModal(false); }}>+ {text.add}</button><button className="btn-click" style={styles.modalBtnSecondary} onClick={doRandom}>{text.rollAgain}</button></div>
          </div>
        </div>
      )}

      {showLoginModal && (
        <div className="fade-in" style={styles.modalOverlay} onClick={() => setShowLoginModal(false)}>
          <div className="slide-in" style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div style={styles.modalTitle}>{isLogin ? text.login : text.register}</div>
            {errorMsg && <div style={styles.errorText}>{errorMsg}</div>}
            <input style={styles.input} type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
            <div style={styles.passwordWrapper}><input style={styles.input} type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} /><span className="btn-click" style={styles.passwordEye} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <FaEyeSlash /> : <FaEye />}</span></div>
            <button className="btn-click" style={styles.modalBtn} onClick={isLogin ? handleLogin : handleRegister}>{isLogin ? text.login : text.register}</button>
            <div className="btn-click" style={styles.switchText} onClick={() => { setIsLogin(!isLogin); setErrorMsg(""); }}>{isLogin ? "No account? Register" : "Already have an account? Login"}</div>
          </div>
        </div>
      )}

      {showEditModal && user && (
        <div className="fade-in" style={styles.modalOverlay} onClick={() => setShowEditModal(false)}>
          <div className="slide-in" style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div style={styles.modalTitle}>{text.editProfile}</div>
            {editError && <div style={styles.errorText}>{editError}</div>}
            {editSuccess && <div style={styles.successText}>{editSuccess}</div>}
            <input style={styles.input} placeholder={text.username} value={editUsername} onChange={e => setEditUsername(e.target.value)} />
            <textarea style={styles.textarea} placeholder={text.bio} rows="2" value={editBio} onChange={e => setEditBio(e.target.value)} />
            <label className="btn-click" style={styles.checkbox}><input type="checkbox" checked={editPrivate} onChange={e => setEditPrivate(e.target.checked)} /> {text.private}</label>
            <button className="btn-click" style={styles.modalBtn} onClick={handleUpdateProfile}>{text.save}</button>
          </div>
        </div>
      )}

      {loadingAction && (
        <div style={styles.loadingOverlay}>
          <div style={styles.loadingSpinner}></div>
          <div style={{ marginTop: 16, color: currentColors.text }}>{text.loading}</div>
        </div>
      )}
    </div>
  );
}