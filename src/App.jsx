import { useState, useEffect, useMemo, useRef } from "react";
import { FaHome, FaUser, FaFire, FaSearch, FaHeart, FaStar, FaTrash, FaSignOutAlt, FaPlus, FaCheck, FaEnvelope, FaEye, FaEyeSlash, FaEdit, FaUsers, FaClock, FaRandom, FaThumbsUp, FaThumbsDown, FaArrowLeft, FaCog, FaVolumeUp, FaVolumeMute, FaLanguage, FaSteam, FaPlaystation, FaGamepad, FaTrophy, FaGem, FaShoppingCart, FaRobot, FaFilter, FaLink, FaExternalLinkAlt, FaDonate, FaAward, FaList, FaMedal, FaGamepad as FaGamepadIcon, FaDiceD6, FaGlobe, FaStarHalfAlt, FaTv, FaMicrophone, FaVideo, FaDesktop, FaPlusCircle, FaTrashAlt, FaUsers as FaUsersIcon, FaBell, FaCalendarAlt, FaChartLine, FaBook, FaTags, FaBalanceScale, FaFileExport, FaFileImport, FaMoon, FaSun, FaAdjust, FaBars, FaTimes, FaChevronDown, FaChevronUp, FaFutbol, FaSpinner, FaCamera, FaQuestionCircle, FaLightbulb, FaBolt, FaRocket, FaCalendarCheck, FaTrophy as FaTrophySolid, FaNewspaper, FaTwitch, FaChartPie, FaPalette, FaCalendarWeek, FaInfinity } from "react-icons/fa";
import { GiConsoleController, GiAchievement, GiSpinningWheel, GiNotebook, GiLevelEndFlag, GiPartyPopper } from "react-icons/gi";
import { BsFillCollectionFill, BsFillHeartFill, BsFillStarFill } from "react-icons/bs";
import { SiKofi, SiTwitch } from "react-icons/si";
import { auth, loginWithEmail, registerWithEmail, logout, loadLibraryFromFirestore, saveLibraryToFirestore, loadProfileFromFirestore, saveProfileToFirestore, updateUsername, updateBio, togglePrivacy, searchUsers, addGameReview, getGameReviews, updateLastPlayed, likeReview, dislikeReview } from "./firebase";
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
  warning: "#ff9800",
  info: "#2196f3",
  steam: "#1b2838",
  epic: "#2a2a2a",
  playstation: "#003791",
  amazon: "#ff9900",
  loaded: "#7c3aed",
};

const MOODS = ["Emotional", "Action", "Dark", "Fantasy", "Horror", "Mystery", "Cozy", "Epic", "Atmospheric", "Challenging"];
const GENRES = ["Action", "Adventure", "RPG", "Indie", "Horror", "Strategy", "Puzzle", "Open World", "Story Rich", "Fighting", "Sports", "Racing", "Simulation"];
const PLAYTIMES = ["Under 10h", "10-20h", "20-40h", "40-60h", "60-100h", "100h+"];
const YEARS = [...Array(25)].map((_, i) => new Date().getFullYear() - i);

const DEEPSEEK_API_KEY = "sk-b5699f49547a4e4ab7eaa74cb6bb7016";

// ========== AOTY DATA with WINNERS & NOMINEES ==========
const AOTY_DATA = {
  2025: { winner: "Clair Obscur: Expedition 33", nominees: ["Clair Obscur: Expedition 33", "Fable", "Avowed", "Star Wars Outlaws", "Assassin's Creed Shadows"], img: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/2358720/header.jpg", steamId: 2358720, genre: "RPG", playtime: "60-100h", developer: "Kepler Interactive", description: "Clair Obscur: Expedition 33 ist ein episches RPG in einer düsteren Fantasy-Welt." },
  2024: { winner: "Astro Bot", nominees: ["Astro Bot", "Final Fantasy VII Rebirth", "Metaphor: ReFantazio", "Tekken 8", "Dragon's Dogma 2"], img: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/2357570/header.jpg", steamId: 2357570, genre: "Platformer", playtime: "20-40h", developer: "Team Asobi", description: "Astro Bot ist ein charmantes 3D-Platformer-Abenteuer." },
  2023: { winner: "Baldur's Gate 3", nominees: ["Baldur's Gate 3", "Alan Wake 2", "Spider-Man 2", "Resident Evil 4", "Super Mario Bros. Wonder"], img: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1086940/header.jpg", steamId: 1086940, genre: "RPG", playtime: "100h+", developer: "Larian Studios", description: "Baldur's Gate 3 ist das ultimative D&D-Rollenspielerlebnis." },
  2022: { winner: "Elden Ring", nominees: ["Elden Ring", "God of War Ragnarök", "Horizon Forbidden West", "Stray", "Xenoblade Chronicles 3"], img: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1245620/header.jpg", steamId: 1245620, genre: "Open World", playtime: "100h+", developer: "FromSoftware", description: "Elden Ring ist ein Meisterwerk des Open-World-Action-RPGs." },
  2021: { winner: "It Takes Two", nominees: ["It Takes Two", "Resident Evil Village", "Metroid Dread", "Psychonauts 2", "Ratchet & Clank: Rift Apart"], img: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1426210/header.jpg", steamId: 1426210, genre: "Adventure", playtime: "20-40h", developer: "Hazelight Studios", description: "It Takes Two ist ein einzigartiges Koop-Abenteuer." },
  2020: { winner: "The Last of Us Part II", nominees: ["The Last of Us Part II", "Hades", "Ghost of Tsushima", "Doom Eternal", "Final Fantasy VII Remake"], img: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1888930/header.jpg", steamId: 1888930, genre: "Action", playtime: "40-60h", developer: "Naughty Dog", description: "The Last of Us Part II ist ein emotionales Meisterwerk." }
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

// ========== FUNNY ACHIEVEMENTS ==========
const FUNNY_ACHIEVEMENTS = [
  { id: "click_master", name: "🖱️ Klick-Meister", description: "Klicke 100 Mal auf das NexPlay Logo", requirement: "100 logo clicks", unlocked: false, progress: 0, icon: "🖱️", secret: false, reward: 100 },
  { id: "night_owl", name: "🦉 Nacht-Eule", description: "Besuche die Seite zwischen 2-4 Uhr morgens", requirement: "Visit between 2-4 AM", unlocked: false, progress: 0, icon: "🌙", secret: true, reward: 150 },
  { id: "collector_mania", name: "📦 Bibliotheks-König", description: "Füge 50 Spiele zur Bibliothek hinzu", requirement: "50 games in library", unlocked: false, progress: 0, icon: "📚", secret: false, reward: 200 },
  { id: "review_god", name: "✍️ Review-Gott", description: "Schreibe 20 Bewertungen", requirement: "20 reviews", unlocked: false, progress: 0, icon: "✍️", secret: false, reward: 150 },
  { id: "completionist_ultra", name: "🏆 Ultra-Vollender", description: "Schließe 15 Spiele ab", requirement: "15 completed games", unlocked: false, progress: 0, icon: "🏆", secret: false, reward: 250 },
  { id: "random_addict", name: "🎲 Zufalls-Junkie", description: "Nutze den Random Generator 50 Mal", requirement: "50 random rolls", unlocked: false, progress: 0, icon: "🎲", secret: false, reward: 100 },
  { id: "ai_friend", name: "🤖 KI-Buddy", description: "Stelle der KI 100 Fragen", requirement: "100 AI messages", unlocked: false, progress: 0, icon: "🤖", secret: false, reward: 150 },
  { id: "theme_hopper", name: "🎨 Theme-Hüpfer", description: "Wechsle das Theme 50 Mal", requirement: "50 theme changes", unlocked: false, progress: 0, icon: "🎨", secret: false, reward: 100 },
  { id: "secret_click", name: "🤫 Geheimnis-Klicker", description: "Klicke auf das versteckte Easter Egg", requirement: "Find the secret", unlocked: false, progress: 0, icon: "🥚", secret: true, reward: 500 },
  { id: "midnight_coder", name: "💻 Mitternachts-Coder", description: "Speichere um Mitternacht eine Änderung", requirement: "Save at midnight", unlocked: false, progress: 0, icon: "🌃", secret: true, reward: 200 },
  { id: "five_star", name: "⭐⭐⭐⭐⭐ Fünf-Sterne", description: "Gib einem Spiel 5 Sterne", requirement: "Rate a game 5 stars", unlocked: false, progress: 0, icon: "⭐", secret: false, reward: 50 },
  { id: "wishlist_master", name: "📝 Wunschlisten-Master", description: "Füge 20 Spiele zur Wunschliste hinzu", requirement: "20 wishlisted games", unlocked: false, progress: 0, icon: "📝", secret: false, reward: 100 }
];

const translations = {
  en: { 
    home: "Discover", library: "Library", profile: "Profile", friends: "Friends", ai: "AI Assistant", aoty: "AOTY", random: "Random", playlists: "Playlists", compare: "Compare", achievements: "Achievements", gamification: "Gamification", news: "Gaming News", support: "Support",
    activity: "Activity", wishlist: "Wishlist", backlog: "Backlog Cleaner", tags: "Tags", journal: "Journal", export: "Export", import: "Import", theme: "Theme", dark: "Dark", light: "Light", auto: "Auto",
    randomGame: "Random Game", yearFilter: "Year", allYears: "All Years", login: "Login", register: "Register", logout: "Logout", search: "Search games...", searchAOTY: "Search by year or game name...",
    mood: "What's your mood?", genre: "Pick your genres", playtime: "How long?", next: "Next", results: "Show Results", topPicks: "Top Picks", bestEver: "Best Ever", allResults: "All Results",
    hiddenGems: "Hidden Gems", sort: "Sort", bestMatch: "Best Match", rating: "Rating", year: "Year", add: "Add to Library", inLibrary: "In Library", reviews: "Reviews", played: "Played",
    remove: "Remove", editProfile: "Edit Profile", username: "Username", bio: "Bio", private: "Private profile", save: "Save", achievementsTitle: "Achievements", firstGame: "First Game",
    collector: "Collector", completionist: "Completionist", recentlyPlayed: "Recently Played", favorites: "Favorites", total: "Total", playing: "Playing", completed: "Completed",
    rollAgain: "Roll Again", close: "Close", back: "Back", buyOn: "Buy on", writeReview: "Write Review", yourReview: "Your review...", submit: "Submit", noReviews: "No reviews yet",
    findFriends: "Find Friends", settings: "Settings", sound: "Sound Effects", language: "Language", steamId: "Steam ID", importGames: "Import Steam Games", findSteamId: "How to find your Steam ID",
    donate: "Support the developer", topRated: "Top Rated Game", topGenre: "Top Genre", totalPlaytime: "Total Playtime", aotyTitle: "Game of the Year", top10: "Top 10 by Genre",
    findYourGame: "Find Your Game", allAwards: "All Awards", backToAOTY: "Back to AOTY Overview", createPlaylist: "Create Playlist", playlistName: "Playlist Name",
    addToPlaylist: "Add to Playlist", gameNightMode: "Game Night Mode", spinWheel: "Spin the Wheel", excludeMultiplayer: "Exclude Multiplayer", activityFeed: "Activity Feed",
    addToWishlist: "Add to Wishlist", checkPrice: "Check Price", backlogTip: "You should play", addTag: "Add Tag", compareGames: "Compare Games", selectGame: "Select Game",
    journalNotes: "My Notes", exportLibrary: "Export Library", importLibrary: "Import Library", themeSelect: "Select Theme", loading: "Loading...", showMore: "Show more",
    showLess: "Show less", winner: "Winner", graphics: "Graphics", story: "Story", gameplay: "Gameplay", replayability: "Replayability", steamConnect: "Steam Connect",
    level: "Level", xp: "XP", badges: "Badges", completionProgress: "Completion Progress", quickStats: "Quick Stats", dailyChallenges: "Daily Challenges", weeklyChallenges: "Weekly Challenges",
    levelUp: "Level Up!", congrats: "Congratulations!", newLevel: "You reached level", points: "points", claim: "Claim", completed: "Completed", inProgress: "In Progress",
    gameRoulette: "Game Roulette", pickThree: "Pick 3 random games", rouletteResult: "Your 3 games for today:", achievementsUnlocked: "Achievements Unlocked", clickToSee: "Click to see requirement",
    secret: "🔒 SECRET", notifications: "Notifications", autoSave: "Auto-save", compactView: "Compact View", highContrast: "High Contrast", nominees: "Nominees", winnerBadge: "🏆 Winner",
    freeAiQueries: "Free AI Queries left", subscribeUnlimited: "Subscribe on Ko-fi for unlimited AI chat", readMore: "Read more", supportMessage: "Support NexPlay development",
    becomePatron: "Become a Patron", aiLimitReached: "You've used all free AI queries. Support NexPlay on Ko-fi to unlock unlimited AI chat!"
  },
  de: { 
    home: "Entdecken", library: "Bibliothek", profile: "Profil", friends: "Freunde", ai: "KI-Assistent", aoty: "AOTY", random: "Zufall", playlists: "Playlists", compare: "Vergleichen", achievements: "Erfolge", gamification: "Gamification", news: "Gaming News", support: "Unterstützen",
    activity: "Aktivitäten", wishlist: "Wunschliste", backlog: "Backlog Reiniger", tags: "Tags", journal: "Tagebuch", export: "Exportieren", import: "Importieren", theme: "Design", dark: "Dunkel", light: "Hell", auto: "Auto",
    randomGame: "Zufälliges Spiel", yearFilter: "Jahr", allYears: "Alle Jahre", login: "Anmelden", register: "Registrieren", logout: "Abmelden", search: "Spiele suchen...", searchAOTY: "Suche nach Jahr oder Spielname...",
    mood: "Wie ist deine Stimmung?", genre: "Wähle deine Genres", playtime: "Wie lange?", next: "Weiter", results: "Ergebnisse", topPicks: "Top Empfehlungen", bestEver: "Beste Aller Zeiten", allResults: "Alle Ergebnisse",
    hiddenGems: "Geheimtipps", sort: "Sortieren", bestMatch: "Bester Treffer", rating: "Bewertung", year: "Jahr", add: "Zur Bibliothek", inLibrary: "In Bibliothek", reviews: "Bewertungen", played: "Gespielt",
    remove: "Entfernen", editProfile: "Profil bearbeiten", username: "Benutzername", bio: "Über mich", private: "Privates Profil", save: "Speichern", achievementsTitle: "Erfolge", firstGame: "Erstes Spiel",
    collector: "Sammler", completionist: "Vollender", recentlyPlayed: "Zuletzt gespielt", favorites: "Favoriten", total: "Gesamt", playing: "Spielt", completed: "Abgeschlossen",
    rollAgain: "Nochmal", close: "Schließen", back: "Zurück", buyOn: "Kaufen auf", writeReview: "Bewertung schreiben", yourReview: "Deine Bewertung...", submit: "Speichern", noReviews: "Keine Bewertungen",
    findFriends: "Freunde finden", settings: "Einstellungen", sound: "Soundeffekte", language: "Sprache", steamId: "Steam ID", importGames: "Steam Spiele importieren", findSteamId: "So findest du deine Steam ID",
    donate: "Unterstütze den Entwickler", topRated: "Bestbewertetes Spiel", topGenre: "Top Genre", totalPlaytime: "Spielzeit Gesamt", aotyTitle: "Spiel des Jahres", top10: "Top 10 pro Genre",
    findYourGame: "Finde dein Spiel", allAwards: "Alle Auszeichnungen", backToAOTY: "Zurück zur AOTY Übersicht", createPlaylist: "Playlist erstellen", playlistName: "Playlist Name",
    addToPlaylist: "Zu Playlist hinzufügen", gameNightMode: "Spielabend Modus", spinWheel: "Rad drehen", excludeMultiplayer: "Multiplayer ausschließen", activityFeed: "Aktivitäten Feed",
    addToWishlist: "Zur Wunschliste", checkPrice: "Preis prüfen", backlogTip: "Du solltest spielen", addTag: "Tag hinzufügen", compareGames: "Spiele vergleichen", selectGame: "Spiel auswählen",
    journalNotes: "Meine Notizen", exportLibrary: "Bibliothek exportieren", importLibrary: "Bibliothek importieren", themeSelect: "Design auswählen", loading: "Laden...", showMore: "Mehr anzeigen",
    showLess: "Weniger anzeigen", winner: "Gewinner", graphics: "Grafik", story: "Geschichte", gameplay: "Spielspaß", replayability: "Wiederspielwert", steamConnect: "Steam Verbindung",
    level: "Level", xp: "XP", badges: "Abzeichen", completionProgress: "Fortschritt", quickStats: "Schnellstatistiken", dailyChallenges: "Tägliche Herausforderungen", weeklyChallenges: "Wöchentliche Herausforderungen",
    levelUp: "Level Up!", congrats: "Glückwunsch!", newLevel: "Du hast Level", points: "Punkte", claim: "Abholen", completed: "Abgeschlossen", inProgress: "In Bearbeitung",
    gameRoulette: "Spiel-Roulette", pickThree: "3 zufällige Spiele", rouletteResult: "Deine 3 Spiele für heute:", achievementsUnlocked: "Erfolge freigeschaltet", clickToSee: "Klicken für Aufgabe",
    secret: "🔒 GEHEIM", notifications: "Benachrichtigungen", autoSave: "Auto-speichern", compactView: "Kompakte Ansicht", highContrast: "Hoher Kontrast", nominees: "Nominierte", winnerBadge: "🏆 Gewinner",
    freeAiQueries: "Kostenlose KI-Anfragen übrig", subscribeUnlimited: "Auf Ko-fi abonnieren für unbegrenzten KI-Chat", readMore: "Weiterlesen", supportMessage: "Unterstütze die NexPlay-Entwicklung",
    becomePatron: "Unterstützer werden", aiLimitReached: "Du hast alle kostenlosen KI-Anfragen aufgebraucht. Unterstütze NexPlay auf Ko-fi für unbegrenzten KI-Chat!"
  }
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
  const [accentColor, setAccentColor] = useState(() => localStorage.getItem("nexplay_accent") || "#ffd400");
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
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => localStorage.getItem("nexplay_notifications") !== "false");
  const [compactView, setCompactView] = useState(() => localStorage.getItem("nexplay_compact") === "true");
  const [highContrast, setHighContrast] = useState(() => localStorage.getItem("nexplay_highContrast") === "true");
  const [autoSave, setAutoSave] = useState(() => localStorage.getItem("nexplay_autoSave") !== "false");
  const [showSettings, setShowSettings] = useState(false);
  const [showRandomModal, setShowRandomModal] = useState(false);
  const [randomGame, setRandomGame] = useState(null);
  const [randomExcludeHorror, setRandomExcludeHorror] = useState(false);
  const [randomExcludeIndie, setRandomExcludeIndie] = useState(false);
  const [randomExcludeOld, setRandomExcludeOld] = useState(false);
  const [randomMinRating, setRandomMinRating] = useState(7);
  const [randomYear, setRandomYear] = useState("all");
  const [randomMode, setRandomMode] = useState("full");
  const [randomSelectedGenre, setRandomSelectedGenre] = useState("all");
  const [randomSelectedMood, setRandomSelectedMood] = useState("all");
  const [rouletteResult, setRouletteResult] = useState([]);
  const [showRoulette, setShowRoulette] = useState(false);
  const [aiMessages, setAiMessages] = useState([{ role: "assistant", content: "🎮 Hallo! Ich bin dein KI-Gaming-Assistent! Frag mich nach Spielen, Tipps oder lass dir was empfehlen!\n\n💡 Quick-Actions:\n• Empfehle mir ein RPG\n• Tipps für Elden Ring\n• Was ist neu in der Gaming-Welt?" }]);
  const [aiInput, setAiInput] = useState("");
  const [freeAiQueries, setFreeAiQueries] = useState(() => {
    const saved = localStorage.getItem("nexplay_freeAi");
    return saved ? parseInt(saved) : 5;
  });
  const [isAiLoading, setIsAiLoading] = useState(false);
  const aiChatEndRef = useRef(null);
  const [logoClickCount, setLogoClickCount] = useState(() => parseInt(localStorage.getItem("nexplay_logoClicks") || "0"));
  const [randomRollCount, setRandomRollCount] = useState(() => parseInt(localStorage.getItem("nexplay_randomRolls") || "0"));
  const [aiMessageCount, setAiMessageCount] = useState(() => parseInt(localStorage.getItem("nexplay_aiMessages") || "0"));
  const [themeChangeCount, setThemeChangeCount] = useState(() => parseInt(localStorage.getItem("nexplay_themeChanges") || "0"));
  const [midnightSave, setMidnightSave] = useState(() => localStorage.getItem("nexplay_midnightSave") === "true");
  const [secretEggFound, setSecretEggFound] = useState(() => localStorage.getItem("nexplay_secretEgg") === "true");
  const [news, setNews] = useState([]);
  const [loadingNews, setLoadingNews] = useState(false);
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
  const [dailyChallenges, setDailyChallenges] = useState([]);
  const [achievements, setAchievements] = useState(() => {
    const saved = localStorage.getItem("nexplay_achievements");
    if (saved) return JSON.parse(saved);
    return FUNNY_ACHIEVEMENTS.map(a => ({ ...a, unlocked: false, progress: 0 }));
  });
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [levelUpMessage, setLevelUpMessage] = useState(null);

  const text = translations[lang];
  const currentColors = (() => {
    let base = theme === "dark" ? { ...colors, primary: accentColor, primaryDark: accentColor } : theme === "light" ? { ...colors, bg: "#ffffff", bgCard: "#f0f0f0", text: "#000000", textSecondary: "#333333", textMuted: "#666666", primary: accentColor, primaryDark: accentColor } : colors;
    if (highContrast) {
      base = { ...base, bg: "#000000", bgCard: "#1a1a1a", text: "#ffffff", textSecondary: "#cccccc", primary: "#ffff00", primaryDark: "#ffff00" };
    }
    return base;
  })();

  const scrollToBottom = () => { aiChatEndRef.current?.scrollIntoView({ behavior: "smooth" }); };
  useEffect(() => { scrollToBottom(); }, [aiMessages]);

  // ========== ACHIEVEMENT & LEVEL SYSTEM ==========
  const calculateXP = () => {
    let xp = 0;
    xp += library.length * 10;
    xp += library.filter(g => g.status === "completed").length * 25;
    xp += favorites.length * 5;
    xp += gameDetailReviews.length * 15;
    xp += Object.keys(gameJournal).length * 10;
    xp += achievements.filter(a => a.unlocked).length * 100;
    xp += randomRollCount * 2;
    xp += aiMessageCount * 1;
    return xp;
  };

  const calculateLevel = (xp) => Math.floor(Math.sqrt(xp / 100)) + 1;

  const updateAchievements = () => {
    const newAchievements = [...achievements];
    let changed = false;

    if (newAchievements.find(a => a.id === "click_master") && !newAchievements.find(a => a.id === "click_master").unlocked && logoClickCount >= 100) {
      newAchievements.find(a => a.id === "click_master").unlocked = true;
      changed = true;
      showNotif(`🎉 Achievement unlocked: Click Master! +100 XP`, "success");
    }
    if (newAchievements.find(a => a.id === "collector_mania") && !newAchievements.find(a => a.id === "collector_mania").unlocked && library.length >= 50) {
      newAchievements.find(a => a.id === "collector_mania").unlocked = true;
      changed = true;
      showNotif(`🎉 Achievement unlocked: Collector Mania! +200 XP`, "success");
    }
    if (newAchievements.find(a => a.id === "review_god") && !newAchievements.find(a => a.id === "review_god").unlocked && gameDetailReviews.length >= 20) {
      newAchievements.find(a => a.id === "review_god").unlocked = true;
      changed = true;
      showNotif(`🎉 Achievement unlocked: Review God! +150 XP`, "success");
    }
    if (newAchievements.find(a => a.id === "completionist_ultra") && !newAchievements.find(a => a.id === "completionist_ultra").unlocked && library.filter(g => g.status === "completed").length >= 15) {
      newAchievements.find(a => a.id === "completionist_ultra").unlocked = true;
      changed = true;
      showNotif(`🎉 Achievement unlocked: Completionist Ultra! +250 XP`, "success");
    }
    if (newAchievements.find(a => a.id === "random_addict") && !newAchievements.find(a => a.id === "random_addict").unlocked && randomRollCount >= 50) {
      newAchievements.find(a => a.id === "random_addict").unlocked = true;
      changed = true;
      showNotif(`🎉 Achievement unlocked: Random Addict! +100 XP`, "success");
    }
    if (newAchievements.find(a => a.id === "ai_friend") && !newAchievements.find(a => a.id === "ai_friend").unlocked && aiMessageCount >= 100) {
      newAchievements.find(a => a.id === "ai_friend").unlocked = true;
      changed = true;
      showNotif(`🎉 Achievement unlocked: AI Friend! +150 XP`, "success");
    }
    if (newAchievements.find(a => a.id === "theme_hopper") && !newAchievements.find(a => a.id === "theme_hopper").unlocked && themeChangeCount >= 50) {
      newAchievements.find(a => a.id === "theme_hopper").unlocked = true;
      changed = true;
      showNotif(`🎉 Achievement unlocked: Theme Hopper! +100 XP`, "success");
    }
    const hour = new Date().getHours();
    if (newAchievements.find(a => a.id === "night_owl") && !newAchievements.find(a => a.id === "night_owl").unlocked && hour >= 2 && hour < 4) {
      newAchievements.find(a => a.id === "night_owl").unlocked = true;
      changed = true;
      showNotif(`🎉 Secret achievement unlocked: Night Owl! 🦉 +150 XP`, "success");
    }
    if (newAchievements.find(a => a.id === "midnight_coder") && !newAchievements.find(a => a.id === "midnight_coder").unlocked && midnightSave) {
      newAchievements.find(a => a.id === "midnight_coder").unlocked = true;
      changed = true;
      showNotif(`🎉 Secret achievement unlocked: Midnight Coder! 🌃 +200 XP`, "success");
    }
    if (newAchievements.find(a => a.id === "five_star") && !newAchievements.find(a => a.id === "five_star").unlocked && reviewRating === 5) {
      newAchievements.find(a => a.id === "five_star").unlocked = true;
      changed = true;
      showNotif(`🎉 Achievement unlocked: Five Star! ⭐⭐⭐⭐⭐ +50 XP`, "success");
    }
    if (newAchievements.find(a => a.id === "wishlist_master") && !newAchievements.find(a => a.id === "wishlist_master").unlocked && wishlist.length >= 20) {
      newAchievements.find(a => a.id === "wishlist_master").unlocked = true;
      changed = true;
      showNotif(`🎉 Achievement unlocked: Wishlist Master! 📝 +100 XP`, "success");
    }

    if (changed) {
      localStorage.setItem("nexplay_achievements", JSON.stringify(newAchievements));
      setAchievements(newAchievements);
      updateUserLevel();
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  };

  const updateUserLevel = () => {
    const newXP = calculateXP();
    const oldLevel = userLevel;
    const newLevel = calculateLevel(newXP);
    setUserXP(newXP);
    setUserLevel(newLevel);
    
    if (newLevel > oldLevel && oldLevel > 0) {
      setLevelUpMessage({ level: newLevel, xp: newXP });
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
      setTimeout(() => setLevelUpMessage(null), 5000);
      showNotif(`🎉 LEVEL UP! Du bist jetzt Level ${newLevel}! 🎉`, "success");
    }
    
    const badges = [];
    if (library.length >= 10) badges.push({ id: "collector", name: text.collector, icon: "📚" });
    if (library.length >= 25) badges.push({ id: "master", name: "Game Master", icon: "👑" });
    if (gameDetailReviews.length >= 5) badges.push({ id: "critic", name: "The Critic", icon: "✍️" });
    if (library.filter(g => g.status === "completed").length >= 5) badges.push({ id: "completionist", name: text.completionist, icon: "✅" });
    if (newLevel >= 5) badges.push({ id: "veteran", name: "Veteran", icon: "🎖️" });
    if (newLevel >= 10) badges.push({ id: "legend", name: "Legend", icon: "🏆" });
    if (achievements.filter(a => a.unlocked).length >= 5) badges.push({ id: "achiever", name: "Achiever", icon: "🏅" });
    setUserBadges(badges);
  };

  useEffect(() => { 
    if (user) {
      updateUserLevel();
      updateAchievements();
    }
  }, [library, favorites, gameDetailReviews, gameJournal, logoClickCount, randomRollCount, aiMessageCount, themeChangeCount, achievements]);

  // ========== DAILY CHALLENGES ==========
  useEffect(() => {
    const today = new Date().toDateString();
    const savedDaily = localStorage.getItem("nexplay_dailyChallenges");
    const savedDailyDate = localStorage.getItem("nexplay_dailyDate");
    if (savedDaily && savedDailyDate === today) {
      setDailyChallenges(JSON.parse(savedDaily));
    } else {
      const newChallenges = [
        { id: "daily_1", name: "🎮 Spiel hinzufügen", description: "Füge ein Spiel zur Bibliothek hinzu", reward: 50, completed: false, progress: 0, target: 1 },
        { id: "daily_2", name: "⭐ Bewertung schreiben", description: "Schreibe eine Bewertung", reward: 30, completed: false, progress: 0, target: 1 },
        { id: "daily_3", name: "❤️ Favorit markieren", description: "Markiere ein Spiel als Favorit", reward: 20, completed: false, progress: 0, target: 1 },
        { id: "daily_4", name: "🎲 Random Generator", description: "Nutze den Random Generator 3 Mal", reward: 40, completed: false, progress: 0, target: 3 }
      ];
      setDailyChallenges(newChallenges);
      localStorage.setItem("nexplay_dailyChallenges", JSON.stringify(newChallenges));
      localStorage.setItem("nexplay_dailyDate", today);
    }
  }, []);

  const showNotif = (msg, type = "success") => {
    if (notificationsEnabled) {
      const notification = document.createElement("div");
      notification.textContent = msg;
      notification.style.position = "fixed";
      notification.style.bottom = "20px";
      notification.style.right = "20px";
      notification.style.background = type === "success" ? colors.success : colors.error;
      notification.style.color = "#fff";
      notification.style.padding = "12px 24px";
      notification.style.borderRadius = "12px";
      notification.style.zIndex = "10000";
      notification.style.animation = "slideIn 0.3s ease";
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);
    }
  };

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  useEffect(() => {
    localStorage.setItem("nexplay_theme", theme);
    localStorage.setItem("nexplay_accent", accentColor);
    localStorage.setItem("nexplay_sound", soundEnabled);
    localStorage.setItem("nexplay_notifications", notificationsEnabled);
    localStorage.setItem("nexplay_compact", compactView);
    localStorage.setItem("nexplay_highContrast", highContrast);
    localStorage.setItem("nexplay_autoSave", autoSave);
    localStorage.setItem("nexplay_logoClicks", logoClickCount);
    localStorage.setItem("nexplay_randomRolls", randomRollCount);
    localStorage.setItem("nexplay_aiMessages", aiMessageCount);
    localStorage.setItem("nexplay_themeChanges", themeChangeCount);
    localStorage.setItem("nexplay_freeAi", freeAiQueries);
    document.body.style.backgroundColor = currentColors.bg;
  }, [theme, accentColor, soundEnabled, notificationsEnabled, compactView, highContrast, autoSave, logoClickCount, randomRollCount, aiMessageCount, themeChangeCount, freeAiQueries, currentColors.bg]);

  // Load saved data
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
    if (autoSave) {
      localStorage.setItem("nexplay_playlists", JSON.stringify(playlists));
      localStorage.setItem("nexplay_wishlist", JSON.stringify(wishlist));
      localStorage.setItem("nexplay_tags", JSON.stringify(customTags));
      localStorage.setItem("nexplay_journal", JSON.stringify(gameJournal));
    }
  }, [playlists, wishlist, customTags, gameJournal, autoSave]);

  const createPlaylist = () => {
    if (!newPlaylistName.trim()) return;
    setPlaylists([...playlists, { id: Date.now(), name: newPlaylistName, games: [] }]);
    setNewPlaylistName("");
    setShowCreatePlaylist(false);
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

  const doGameRoulette = () => {
    let pool = [...gamesWithData, ...MANUAL_GAMES, ...MANUAL_HIDDEN_GEMS];
    if (randomExcludeHorror) pool = pool.filter(g => g.mood !== "Horror" && g.genre !== "Horror");
    if (randomExcludeIndie) pool = pool.filter(g => g.genre !== "Indie");
    if (randomExcludeOld) pool = pool.filter(g => g.year >= 2015);
    if (randomYear !== "all") pool = pool.filter(g => g.year === parseInt(randomYear));
    if (randomSelectedGenre !== "all") pool = pool.filter(g => g.genre === randomSelectedGenre);
    if (randomSelectedMood !== "all") pool = pool.filter(g => g.mood === randomSelectedMood);
    pool = pool.filter(g => (g.finalRating || g.rating) >= randomMinRating);
    if (pool.length === 0) pool = [...gamesWithData, ...MANUAL_GAMES, ...MANUAL_HIDDEN_GEMS];
    
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3);
    setRouletteResult(selected);
    setShowRoulette(true);
    setRandomRollCount(prev => prev + 1);
    updateAchievements();
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
      const data = { library, favorites, wishlist, playlists, customTags, gameJournal, achievements };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `nexplay_backup_${new Date().toISOString().slice(0, 19)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setLoadingAction(false);
      showNotif("Bibliothek exportiert!");
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
        if (data.achievements) setAchievements(data.achievements);
        showNotif("Import erfolgreich!");
      } catch (err) { showNotif("Fehler beim Import", "error"); }
      setLoadingAction(false);
    };
    reader.readAsText(file);
  };

  const addToWishlist = (game) => {
    if (wishlist.find(g => g.id === game.id)) return;
    setWishlist([...wishlist, game]);
    updateAchievements();
    showNotif(`${game.name} zur Wunschliste hinzugefügt!`);
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
    if (yearMatch) { const year = parseInt(search); if (AOTY_DATA[year]) { setAotyResult({ type: "year", year, data: AOTY_DATA[year] }); setSelectedAotyYear(year); } else setAotyResult({ type: "error", message: `Keine Daten für ${year}` }); return; }
    for (const [year, data] of Object.entries(AOTY_DATA)) { if (data.winner?.toLowerCase().includes(search)) { setAotyResult({ type: "game", year, game: data.winner, data }); setSelectedAotyYear(year); return; } }
    setAotyResult({ type: "error", message: "Spiel nicht gefunden" });
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
      if (randomSelectedGenre !== "all") pool = pool.filter(g => g.genre === randomSelectedGenre);
      if (randomSelectedMood !== "all") pool = pool.filter(g => g.mood === randomSelectedMood);
      pool = pool.filter(g => (g.finalRating || g.rating) >= randomMinRating);
      if (randomMode === "genre" && pool.length) { const randomGenre = pool[Math.floor(Math.random() * pool.length)].genre; pool = pool.filter(g => g.genre === randomGenre); }
      if (randomMode === "mood" && pool.length) { const randomMood = pool[Math.floor(Math.random() * pool.length)].mood; pool = pool.filter(g => g.mood === randomMood); }
      if (!pool.length) pool = [...gamesWithData, ...MANUAL_GAMES, ...MANUAL_HIDDEN_GEMS];
      setRandomGame(pool[Math.floor(Math.random() * pool.length)]);
      setShowRandomModal(true);
      setRandomRollCount(prev => prev + 1);
      updateAchievements();
      setLoadingAction(false);
    }, 500);
  };

  const sendAiMessage = async () => {
    if (!aiInput.trim()) return;
    
    if (freeAiQueries <= 0) {
      setAiMessages(prev => [...prev, { role: "assistant", content: `🚫 ${text.aiLimitReached}\n\n💡 ${text.subscribeUnlimited}: https://ko-fi.com/sherlock10k` }]);
      return;
    }
    
    const userMessage = aiInput.trim();
    setAiMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setAiInput("");
    setIsAiLoading(true);
    setAiMessageCount(prev => prev + 1);
    setFreeAiQueries(prev => prev - 1);
    updateAchievements();
    
    const getLocalResponse = (msg) => {
      const lowerMsg = msg.toLowerCase();
      if (lowerMsg.includes("empfehl") || lowerMsg.includes("vorschlag")) {
        const random = TOP_PICKS_GAMES[Math.floor(Math.random() * TOP_PICKS_GAMES.length)];
        return `🎮 **Spielempfehlung:** ${random.name}\n⭐ Bewertung: ${random.finalRating}/10\n🎭 Genre: ${random.genre}\n⏱️ Spielzeit: ${random.playtime}\n\n${random.finalDescription?.substring(0, 150)}...`;
      }
      if (lowerMsg.includes("witcher")) return "🐺 **The Witcher 3 Tipps:** Mach alle Nebenquests, lerne Gwent, die DLCs sind ein Muss!";
      if (lowerMsg.includes("elden ring")) return "🗡️ **Elden Ring Tipps:** Level Lebenspunkte zuerst, erkunde Limgrave gründlich, nutze Geisterbeschwörungen!";
      return `Danke für deine Frage! Ich kann dir helfen mit:\n• Spielempfehlungen\n• Spiel-Tipps\n• Genre-Fragen\n• Gaming-News\n\n💡 Tipp: Du hast noch ${freeAiQueries - 1} kostenlose Anfragen.`;
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
      showNotif("Profilbild erfolgreich geändert!");
    } catch (error) { console.error("Fehler:", error); showNotif("Fehler beim Hochladen - Prüfe Firebase Storage Regeln", "error"); }
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
    if (!email || !password) { setErrorMsg("Email und Passwort erforderlich"); return; }
    setLoadingAction(true);
    const result = await loginWithEmail(email, password);
    if (result && !result.error) { setShowLoginModal(false); setEmail(""); setPassword(""); showNotif("Willkommen zurück!"); }
    else { setErrorMsg(result?.error || "Login fehlgeschlagen"); }
    setLoadingAction(false);
  };

  const handleRegister = async () => {
    if (!email || !password) { setErrorMsg("Email und Passwort erforderlich"); return; }
    if (password.length < 6) { setErrorMsg("Passwort muss mindestens 6 Zeichen haben"); return; }
    setLoadingAction(true);
    const username = email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "");
    const result = await registerWithEmail(email, password, username);
    if (result.user) { setShowLoginModal(false); setEmail(""); setPassword(""); showNotif("Account erstellt! Willkommen bei NexPlay!"); }
    else { setErrorMsg(result.error || "Registrierung fehlgeschlagen"); }
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
    if (!steamIdInput.trim()) { showNotif("Bitte Steam ID eingeben", "error"); return; }
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
        showNotif(`✅ ${importedCount} von ${steamGames.length} Steam-Spielen importiert!`);
      } else { showNotif("Keine Spiele gefunden. Stelle sicher, dass dein Steam-Profil öffentlich ist.", "error"); }
    } catch (err) { showNotif("Fehler beim Laden der Steam-Spiele", "error"); }
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
    setEditSuccess("Profil aktualisiert!");
    setTimeout(() => setShowEditModal(false), 1500);
    setLoadingAction(false);
    showNotif("Profil gespeichert!");
  };

  const openEditModal = () => { setEditUsername(userData?.username || ""); setEditBio(userData?.bio || ""); setEditPrivate(userData?.isPrivate || false); setEditError(""); setEditSuccess(""); setShowEditModal(true); };

  const openGameDetail = async (game) => {
    setLoadingAction(true);
    try {
      const fullGame = [...gamesWithData, ...MANUAL_GAMES, ...MANUAL_HIDDEN_GEMS].find(g => g.id === game.id) || game;
      if (!fullGame) { showNotif("Spiel konnte nicht geladen werden.", "error"); setLoadingAction(false); return; }
      setSelectedGameDetail(fullGame);
      const reviews = await getGameReviews(fullGame.id);
      setGameDetailReviews(reviews);
      setCurrentTab("gameDetail");
    } catch (error) { console.error("Error loading game detail:", error); showNotif("Fehler beim Laden des Spiels", "error"); }
    finally { setLoadingAction(false); }
  };

  const closeGameDetail = () => { setSelectedGameDetail(null); setCurrentTab("home"); };

  const submitGameDetailReview = async () => {
    if (reviewRating === 0) { showNotif("Bitte gib eine Bewertung ab", "error"); return; }
    if (!user) { showNotif("Bitte melde dich an, um Bewertungen zu schreiben", "error"); return; }
    setLoadingAction(true);
    await addGameReview(user.uid, selectedGameDetail.id, selectedGameDetail.name, reviewRating, reviewComment);
    setGameDetailReviews(await getGameReviews(selectedGameDetail.id));
    setReviewRating(0); setReviewComment("");
    updateAchievements();
    updateUserLevel();
    setLoadingAction(false);
    showNotif("Bewertung gespeichert!");
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
    if (!user) return;
    setLoadingAction(true);
    await updateLastPlayed(user.uid, game.id, game.name, game.img);
    setUserData(await loadProfileFromFirestore(user.uid));
    addActivity("played", game.name);
    setLoadingAction(false);
    showNotif(`"${game.name}" als gespielt markiert!`);
  };

  const addToLibrary = async (game) => {
    if (library.find(g => g.id === game.id)) return;
    setLoadingAction(true);
    setLibrary([...library, { ...game, status: "wishlist", dateAdded: new Date().toISOString() }]);
    addActivity("add", game.name);
    updateUserLevel();
    updateAchievements();
    setLoadingAction(false);
    showNotif(`${game.name} zur Bibliothek hinzugefügt!`);
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
      updateAchievements();
      showNotif(`🎉 "${game.name}" abgeschlossen!`, "success");
    }
    setLoadingAction(false);
  };
  
  const toggleFavorite = (id) => setFavorites(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

  const getBuyLinks = (game) => [
    { name: "Steam", url: `https://store.steampowered.com/search/?term=${encodeURIComponent(game.name)}`, icon: <FaSteam />, color: colors.steam },
    { name: "Amazon", url: `https://www.amazon.de/s?k=${encodeURIComponent(game.name)}`, icon: <FaShoppingCart />, color: colors.amazon },
    { name: "Loaded", url: `https://www.loaded.com/de_de/search?q=${encodeURIComponent(game.name)}`, icon: <FaExternalLinkAlt />, color: colors.loaded }
  ];

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

  const backlogRecommendation = getBacklogRecommendation();
  const completionPercentage = library.length > 0 ? Math.round((library.filter(g => g.status === "completed").length / library.length) * 100) : 0;
  const unlockedCount = achievements.filter(a => a.unlocked).length;

  const animationStyles = `
    @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes slideIn { from { opacity: 0; transform: translateY(-50px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes wheelSpin { 0% { transform: rotate(0deg); } 100% { transform: rotate(1440deg); } }
    @keyframes pulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }
    @keyframes confetti { 0% { transform: translateY(0) rotate(0deg); opacity: 1; } 100% { transform: translateY(100vh) rotate(720deg); opacity: 0; } }
    .fade-in { animation: fadeIn 0.4s ease-out; }
    .slide-in { animation: slideIn 0.3s ease-out; }
    .game-card { transition: all 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1); cursor: pointer; background: ${currentColors.bgCard}; border-radius: 20px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08); }
    .game-card:hover { transform: translateY(-8px) scale(1.02); box-shadow: 0 20px 30px -12px rgba(0,0,0,0.5); border-color: ${currentColors.primary}40; }
    .btn-click:active { transform: scale(0.96); }
    .spinning-wheel { animation: wheelSpin 0.5s ease-out; }
    .pulse-dot { animation: pulse 1s infinite; }
    .confetti { position: fixed; animation: confetti 3s linear forwards; pointer-events: none; z-index: 10000; }
    @media (max-width: 768px) { 
      .hamburger-btn { display: flex !important; } 
      .main-tabs-desktop { display: none !important; } 
      .game-card { margin-bottom: 16px; }
      .sectionTitle { font-size: 22px !important; }
      .game-name { font-size: 14px !important; }
      .mobile-menu-item { padding: 14px 0 !important; font-size: 15px !important; }
    }
    @media (min-width: 769px) { 
      .hamburger-btn { display: none !important; } 
      .main-tabs-desktop { display: flex !important; } 
      .mobile-only { display: none !important; }
    }
  `;

  useEffect(() => { const style = document.createElement("style"); style.textContent = animationStyles; document.head.appendChild(style); }, [currentColors]);

  const styles = {
    app: { background: currentColors.bg, minHeight: "100vh", width: "100%", color: currentColors.text, fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" },
    container: { maxWidth: compactView ? 1200 : 1400, margin: "0 auto", padding: "0 24px" },
    header: { padding: "16px 0", borderBottom: `1px solid ${currentColors.primary}20`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 },
    logo: { display: "flex", alignItems: "center", gap: 12, cursor: "pointer" },
    logoIcon: { background: `linear-gradient(135deg, ${currentColors.primary} 0%, ${currentColors.primaryDark} 100%)`, borderRadius: "12px", padding: "8px 10px", color: currentColors.bg, display: "flex", alignItems: "center", gap: 6 },
    logoIconText: { fontSize: 18, fontWeight: 700 },
    logoText: { background: `linear-gradient(135deg, ${currentColors.primary} 0%, ${currentColors.primaryDark} 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontSize: 20, fontWeight: 800 },
    rightSection: { display: "flex", alignItems: "center", gap: 16 },
    badge10k: { background: currentColors.primary, color: currentColors.bg, borderRadius: "20px", padding: "4px 12px", fontSize: 12, fontWeight: 700 },
    mainTabs: { display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", justifyContent: "flex-end" },
    mainTab: (active) => ({ background: active ? currentColors.primary : "rgba(255,255,255,0.08)", border: "none", borderRadius: 12, padding: compactView ? "6px 16px" : "8px 20px", color: active ? currentColors.bg : currentColors.text, cursor: "pointer", fontWeight: 600, fontSize: 13, display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s ease", whiteSpace: "nowrap" }),
    iconBtn: { background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 12, padding: compactView ? "6px 12px" : "8px 14px", color: currentColors.text, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontSize: 13, transition: "all 0.2s ease" },
    loginBtn: { background: "linear-gradient(135deg, #4285f4, #3367d6)", border: "none", borderRadius: 12, padding: compactView ? "6px 16px" : "8px 20px", color: "#fff", cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: 8, fontSize: 13, transition: "all 0.2s ease" },
    logoutBtn: { background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 12, padding: compactView ? "6px 16px" : "8px 20px", color: currentColors.text, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontSize: 13, transition: "all 0.2s ease" },
    userAvatar: { width: 36, height: 36, borderRadius: "50%", background: currentColors.primary, display: "flex", alignItems: "center", justifyContent: "center", color: currentColors.bg, fontWeight: 700, fontSize: 16, objectFit: "cover" },
    hamburgerBtn: { background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 12, padding: "8px 12px", color: currentColors.text, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontSize: 18, display: "none" },
    mobileMenu: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: currentColors.bg, zIndex: 1000, padding: "20px", overflowY: "auto", transform: mobileMenuOpen ? "translateX(0)" : "translateX(-100%)", transition: "transform 0.3s ease" },
    mobileMenuClose: { position: "absolute", top: 16, right: 16, background: "rgba(255,255,255,0.1)", border: "none", borderRadius: "50%", padding: "10px", cursor: "pointer", color: currentColors.text, fontSize: 18 },
    mobileMenuItem: { display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", width: "100%", background: "none", border: "none", color: currentColors.text, fontSize: 14, cursor: "pointer" },
    grid: { display: "grid", gridTemplateColumns: compactView ? "repeat(auto-fill, minmax(160px, 1fr))" : "repeat(auto-fill, minmax(200px, 1fr))", gap: compactView ? 16 : 24 },
    gameCard: { background: currentColors.bgCard, borderRadius: 16, overflow: "hidden", cursor: "pointer", border: "1px solid rgba(255,255,255,0.08)", transition: "all 0.3s ease", position: "relative" },
    gameImg: { width: "100%", aspectRatio: "3/4", objectFit: "cover" },
    gameInfo: { padding: compactView ? "10px" : "12px" },
    gameName: { fontSize: compactView ? 12 : 14, fontWeight: 700, marginBottom: 4, color: currentColors.text, wordWrap: "break-word" },
    rating: { display: "flex", alignItems: "center", gap: 4, color: currentColors.primary, fontSize: 11, fontWeight: 600, marginBottom: 4 },
    addBtn: { background: currentColors.primary, border: "none", borderRadius: 8, padding: compactView ? "6px 8px" : "8px 10px", fontSize: compactView ? 11 : 12, fontWeight: 600, cursor: "pointer", width: "100%", marginTop: 8, color: currentColors.bg, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "all 0.2s ease" },
    searchBar: { background: currentColors.bgCard, border: `1px solid rgba(255,255,255,0.08)`, borderRadius: 14, padding: "10px 16px", color: currentColors.text, fontSize: 13, width: "100%", marginBottom: 20, outline: "none" },
    select: { background: currentColors.bgCard, border: `1px solid ${currentColors.primary}30`, borderRadius: 8, padding: "6px 10px", color: currentColors.text, fontSize: 12, cursor: "pointer", transition: "all 0.2s ease" },
    modalOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.96)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" },
    modalContent: { background: currentColors.bgCard, borderRadius: 24, padding: 24, width: "90%", maxWidth: 480, border: `1px solid ${currentColors.primary}30`, maxHeight: "85vh", overflowY: "auto" },
    modalTitle: { fontSize: 22, fontWeight: 700, marginBottom: 16, textAlign: "center", color: currentColors.text },
    input: { width: "100%", background: "rgba(255,255,255,0.08)", border: `1px solid rgba(255,255,255,0.1)`, borderRadius: 10, padding: "10px 14px", color: currentColors.text, fontSize: 13, marginBottom: 12, outline: "none" },
    modalBtn: { background: currentColors.primary, border: "none", borderRadius: 12, padding: "10px", fontSize: 14, fontWeight: 600, cursor: "pointer", width: "100%", marginTop: 12, color: currentColors.bg },
    loadingSpinner: { width: 40, height: 40, border: `3px solid ${currentColors.primary}20`, borderTop: `3px solid ${currentColors.primary}`, borderRadius: "50%", animation: "spin 1s linear infinite" },
    emptyState: { textAlign: "center", padding: 40, background: currentColors.bgCard, borderRadius: 20, color: currentColors.textSecondary, fontSize: 14 },
    sectionTitle: { fontSize: compactView ? 20 : 22, fontWeight: 700, marginBottom: 16, display: "flex", alignItems: "center", gap: 10, color: currentColors.text },
    filterRow: { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16, alignItems: "center" },
    filterBtn: (active) => ({ background: active ? currentColors.primary : "rgba(255,255,255,0.05)", border: "none", borderRadius: 8, padding: "6px 12px", color: active ? currentColors.bg : currentColors.text, cursor: "pointer", fontSize: 12, transition: "all 0.2s ease" }),
    achievementCard: { background: `${currentColors.primary}10`, borderRadius: 12, padding: 10, marginBottom: 10, display: "flex", alignItems: "center", gap: 10, cursor: "pointer", transition: "all 0.2s ease", border: `1px solid ${currentColors.primary}20` },
    achievementIcon: { fontSize: 24 },
    achievementInfo: { flex: 1 },
    achievementName: { fontSize: 13, fontWeight: 700, color: currentColors.text },
    achievementDesc: { fontSize: 10, color: currentColors.textSecondary, marginTop: 2 },
    progressBar: { background: `${currentColors.primary}20`, borderRadius: 6, height: 5, overflow: "hidden", marginTop: 6 },
    progressFill: { background: currentColors.primary, height: 5, transition: "width 0.3s ease" },
    gameNightCard: { background: currentColors.bgCard, borderRadius: 20, padding: 20, marginBottom: 20, textAlign: "center" },
    wheelContainer: { margin: "16px 0", display: "flex", justifyContent: "center" },
    wheel: { width: 180, height: 180, borderRadius: "50%", background: `conic-gradient(${currentColors.primary} 0deg 72deg, ${currentColors.primaryDark} 72deg 144deg, ${colors.success} 144deg 216deg, ${colors.error} 216deg 288deg, ${colors.steam} 288deg 360deg)`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "transform 0.1s", boxShadow: "0 10px 30px rgba(0,0,0,0.3)" },
    wheelInner: { width: 50, height: 50, borderRadius: "50%", background: currentColors.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 },
    aotyYearCard: { background: currentColors.bgCard, borderRadius: 16, padding: 16, textAlign: "center", cursor: "pointer", border: "1px solid rgba(255,255,255,0.05)", transition: "all 0.2s ease" },
    gameDetailHeader: { display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 20, alignItems: "flex-start" },
    gameDetailImg: { width: window.innerWidth <= 768 ? "100%" : 200, maxWidth: 200, borderRadius: 14, objectFit: "cover" },
    gameDetailInfo: { flex: 1 },
    gameDetailName: { fontSize: 24, fontWeight: 700, marginBottom: 6, color: currentColors.text, wordWrap: "break-word" },
    backBtn: { display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.05)", border: "none", borderRadius: 10, padding: "8px 16px", color: currentColors.text, cursor: "pointer", marginBottom: 16, fontSize: 12 },
    trailerFrame: { width: "100%", height: window.innerWidth <= 768 ? 200 : 320, borderRadius: 16, marginBottom: 20, border: "none", background: "#000" },
    settingsSection: { background: currentColors.bgCard, borderRadius: 18, padding: 16, marginBottom: 20 },
    settingsRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 10 },
    statsRow: { display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" },
    statCard: { background: currentColors.bgCard, borderRadius: 12, padding: "12px", textAlign: "center", flex: 1, minWidth: 70 },
    statNumber: { fontSize: compactView ? 20 : 24, fontWeight: 800, color: currentColors.primary },
    statLabel: { fontSize: 10, color: currentColors.textSecondary, marginTop: 3 },
    profileHeader: { display: "flex", gap: 20, alignItems: "center", background: currentColors.bgCard, borderRadius: 20, padding: 20, marginBottom: 20, flexWrap: "wrap", justifyContent: "center", textAlign: "center" },
    profileAvatarLarge: { width: 80, height: 80, borderRadius: "50%", background: `linear-gradient(135deg, ${currentColors.primary} 0%, ${currentColors.primaryDark} 100%)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontWeight: 700, color: currentColors.bg, position: "relative", objectFit: "cover" },
    cameraIcon: { position: "absolute", bottom: 0, right: 0, background: currentColors.bg, borderRadius: "50%", padding: "5px", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.3)" },
    editBtn: { background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 8, padding: "6px 12px", color: currentColors.text, cursor: "pointer", fontSize: 11, marginTop: 10, display: "inline-flex", alignItems: "center", gap: 6 },
    randomFilterSection: { background: currentColors.bgCard, borderRadius: 18, padding: 16, marginBottom: 20 },
    randomFilterTitle: { fontSize: 15, fontWeight: 600, color: currentColors.text, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 },
    randomFilterRow: { display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 8 },
    randomCheckbox: { display: "flex", alignItems: "center", gap: 5, cursor: "pointer", fontSize: 12, color: currentColors.textSecondary },
    randomSlider: { width: 160, accentColor: currentColors.primary },
    aiSection: { background: currentColors.bgCard, borderRadius: 18, padding: 16, marginBottom: 20 },
    aiChatContainer: { height: 350, display: "flex", flexDirection: "column", background: currentColors.bgCard, borderRadius: 14, overflow: "hidden", marginTop: 10, border: `1px solid ${currentColors.primary}20` },
    aiMessages: { flex: 1, overflowY: "auto", padding: 14, display: "flex", flexDirection: "column", gap: 8 },
    aiMessage: (isUser) => ({ background: isUser ? currentColors.primary : `${currentColors.primary}20`, color: isUser ? currentColors.bg : currentColors.text, padding: "8px 12px", borderRadius: 14, borderBottomRightRadius: isUser ? 4 : 14, borderBottomLeftRadius: isUser ? 14 : 4, maxWidth: "80%", alignSelf: isUser ? "flex-end" : "flex-start", whiteSpace: "pre-wrap", fontSize: 12 }),
    aiInputRow: { display: "flex", gap: 8, padding: 10, background: `${currentColors.primary}10`, borderTop: `1px solid ${currentColors.primary}20` },
    aiQuickActions: { display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10, padding: "0 10px" },
    aiQuickBtn: { background: `${currentColors.primary}20`, border: "none", borderRadius: 16, padding: "3px 8px", fontSize: 10, cursor: "pointer", color: currentColors.text },
    supportCard: { background: currentColors.bgCard, borderRadius: 20, padding: 24, textAlign: "center", border: `1px solid ${currentColors.primary}30` },
    newsCard: { background: currentColors.bgCard, borderRadius: 14, padding: 14, marginBottom: 14, border: `1px solid ${currentColors.primary}20` },
    playlistCard: { background: currentColors.bgCard, borderRadius: 16, padding: 16, marginBottom: 16, border: `1px solid ${currentColors.primary}20` },
    compareCard: { background: currentColors.bgCard, borderRadius: 20, padding: 20, marginBottom: 20 },
    compareGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 },
    compareColumn: { background: "rgba(0,0,0,0.2)", borderRadius: 16, padding: 16 },
    compareHeader: { fontSize: 16, fontWeight: 700, marginBottom: 12, textAlign: "center", paddingBottom: 10, borderBottom: `2px solid ${currentColors.primary}40` },
    compareRow: { display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" },
    compareLabel: { fontWeight: 600, color: currentColors.textSecondary, fontSize: 12 },
    compareValue: { fontWeight: 500, color: currentColors.text, fontSize: 12 },
    journalCard: { background: currentColors.bgCard, borderRadius: 14, padding: 14, marginBottom: 16 },
    tag: { background: "rgba(255,212,0,0.15)", borderRadius: 14, padding: "2px 8px", fontSize: 9, color: currentColors.primary, display: "inline-flex", alignItems: "center", gap: 3 },
    libraryCard: { background: currentColors.bgCard, borderRadius: 12, display: "flex", gap: 10, padding: 10, marginBottom: 10, alignItems: "center", flexWrap: "wrap" },
    libraryImg: { width: 50, height: 66, objectFit: "cover", borderRadius: 10 },
    libraryInfo: { flex: 1, minWidth: 160 },
    libraryTitle: { fontWeight: 700, fontSize: 14, color: currentColors.text, marginBottom: 3 },
    libraryMeta: { fontSize: 10, color: currentColors.textSecondary, marginBottom: 5 },
    libraryActions: { display: "flex", gap: 6, flexWrap: "wrap" },
    aotyResultCard: { background: currentColors.bgCard, borderRadius: 20, padding: 20, marginBottom: 20, border: `1px solid ${currentColors.primary}30` },
    aotyWinnerCard: { background: `linear-gradient(135deg, ${currentColors.primary}10, ${currentColors.bgCard})`, borderRadius: 16, padding: 14, marginBottom: 12, cursor: "pointer", display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", transition: "all 0.2s ease" },
    gotyBackBtn: { background: "rgba(255,255,255,0.05)", border: "none", borderRadius: 10, padding: "6px 12px", color: currentColors.text, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 16, fontSize: 11, transition: "all 0.2s ease" },
    topGenreSelect: { background: currentColors.bgCard, border: `1px solid ${currentColors.primary}30`, borderRadius: 12, padding: "10px 16px", color: currentColors.text, fontSize: 13, marginBottom: 20, cursor: "pointer", width: "100%", transition: "all 0.2s ease" },
    topPicksRow: { display: "flex", gap: 16, overflowX: "auto", marginBottom: 24, paddingBottom: 10 },
    topPickCard: { minWidth: 160, background: currentColors.bgCard, borderRadius: 14, padding: 12, cursor: "pointer", position: "relative" },
    pillGrid: { display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 24 },
    pill: (selected) => ({ background: selected ? currentColors.primary : "rgba(255,255,255,0.06)", border: "none", borderRadius: 30, padding: "8px 18px", color: selected ? currentColors.bg : currentColors.text, cursor: "pointer", fontSize: 13, fontWeight: selected ? 600 : 400, transition: "all 0.2s ease" }),
    nextBtn: { background: currentColors.primary, border: "none", borderRadius: 12, padding: "10px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer", color: currentColors.bg, marginTop: 24, width: "100%" },
    textarea: { width: "100%", background: "rgba(255,255,255,0.08)", border: `1px solid rgba(255,255,255,0.1)`, borderRadius: 10, padding: "10px 14px", color: currentColors.text, fontSize: 13, marginBottom: 12, outline: "none", resize: "vertical", fontFamily: "inherit" }
  };

  const GameCard = ({ game, showBtn = false }) => {
    const isFavorite = favorites.includes(game.id);
    const inLibrary = library.some(g => g.id === game.id);
    const rating = game.finalRating || game.rating;
    const img = game.finalImg || game.img;
    return (
      <div className="game-card" style={styles.gameCard} onClick={() => openGameDetail(game)}>
        <img src={img} style={styles.gameImg} alt={game.name} onError={(e) => { e.target.src = `https://placehold.co/300x400/14141f/ffd400?text=${encodeURIComponent(game.name?.slice(0, 8) || "Game")}`; }} />
        <div style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.75)", borderRadius: 16, padding: "2px 6px", fontSize: 10, fontWeight: 700, color: currentColors.primary }}>★ {rating?.toFixed(1)}</div>
        <button className="btn-click" style={{ position: "absolute", top: 8, left: 8, background: "rgba(0,0,0,0.75)", border: "none", borderRadius: 16, padding: "4px 5px", cursor: "pointer" }} onClick={(e) => { e.stopPropagation(); toggleFavorite(game.id); }}>
          {isFavorite ? <BsFillHeartFill color={currentColors.primary} size={10} /> : <FaHeart color="#fff" size={10} />}
        </button>
        <div style={styles.gameInfo}>
          <div style={styles.gameName}>{game.name}</div>
          <div style={styles.rating}><FaStar size={9} /> {rating?.toFixed(1)}</div>
          <div style={{ fontSize: 10, color: currentColors.textSecondary, marginBottom: 4 }}>{game.playtime}</div>
          {showBtn && <button className="btn-click" style={styles.addBtn} onClick={(e) => { e.stopPropagation(); addToLibrary(game); }}>{inLibrary ? <FaCheck size={10} /> : <FaPlus size={10} />} {inLibrary ? text.inLibrary : text.add}</button>}
        </div>
      </div>
    );
  };

  if (loading || gamesLoading) {
    return (
      <div style={{ background: currentColors.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
        <div style={styles.loadingSpinner}></div>
        <div style={{ marginTop: 16, color: currentColors.text, fontSize: 13 }}>{text.loading}</div>
      </div>
    );
  }

  // Confetti Effect
  const renderConfetti = () => {
    if (!showConfetti) return null;
    const colorsList = ["#ffd400", "#ff6b6b", "#4caf50", "#2196f3", "#e91e63", "#9c27b0"];
    return Array.from({ length: 60 }).map((_, i) => (
      <div key={i} className="confetti" style={{
        left: `${Math.random() * 100}%`,
        top: `-20px`,
        width: `${Math.random() * 6 + 3}px`,
        height: `${Math.random() * 6 + 3}px`,
        backgroundColor: colorsList[Math.floor(Math.random() * colorsList.length)],
        animationDuration: `${Math.random() * 2 + 2}s`,
        animationDelay: `${Math.random() * 0.5}s`
      }} />
    ));
  };

  // Level Up Message
  const renderLevelUp = () => {
    if (!levelUpMessage) return null;
    return (
      <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", background: currentColors.primary, color: currentColors.bg, padding: "14px 28px", borderRadius: 24, zIndex: 10001, textAlign: "center", animation: "fadeIn 0.5s ease-out" }}>
        <div style={{ fontSize: 36, marginBottom: 10 }}>🎉</div>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 5 }}>{text.levelUp}</div>
        <div style={{ fontSize: 12 }}>{text.congrats} {text.newLevel} {levelUpMessage.level}! 🎮</div>
      </div>
    );
  };

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
        {renderConfetti()}
        {renderLevelUp()}
        <div style={styles.container}>
          <div style={styles.header}>
            <div style={styles.logo} onClick={() => setCurrentTab("home")}>
              <div style={styles.logoIcon}><GiConsoleController size={16} /><span style={styles.logoIconText}>NX</span></div>
              <span style={styles.logoText}>NexPlay</span>
            </div>
            <div style={styles.rightSection}>
              <div className="main-tabs-desktop" style={styles.mainTabs}>
                <button className="btn-click" style={styles.iconBtn} onClick={() => setShowSettings(true)}><FaCog size={12} /></button>
                {!user ? <button className="btn-click" style={styles.loginBtn} onClick={() => setShowLoginModal(true)}><FaEnvelope size={12} /> {text.login}</button> :
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {profilePicUrl ? <img src={profilePicUrl} style={styles.userAvatar} alt="avatar" /> : <div style={styles.userAvatar}>{userData?.username?.charAt(0).toUpperCase()}</div>}
                    <button className="btn-click" style={styles.logoutBtn} onClick={logout}><FaSignOutAlt size={12} /></button>
                  </div>}
                <span style={styles.badge10k}>10K</span>
              </div>
              <button className="btn-click hamburger-btn" style={styles.hamburgerBtn} onClick={toggleMobileMenu}><FaBars size={18} /></button>
            </div>
          </div>
          <button className="btn-click" style={styles.backBtn} onClick={closeGameDetail}><FaArrowLeft size={10} /> {text.back}</button>
          <div className="fade-in" style={styles.gameDetailHeader}>
            <img src={selectedGameDetail.finalImg || selectedGameDetail.img} style={styles.gameDetailImg} alt={selectedGameDetail.name} />
            <div style={styles.gameDetailInfo}>
              <div style={styles.gameDetailName}>{selectedGameDetail.name}</div>
              <div style={{ fontSize: 12, color: currentColors.textSecondary, marginBottom: 4 }}>{selectedGameDetail.developer}</div>
              <div style={{ fontSize: 13, color: currentColors.primary, marginBottom: 10 }}>★ {(selectedGameDetail.finalRating || selectedGameDetail.rating)?.toFixed(1)} · {selectedGameDetail.year} · {selectedGameDetail.playtime}</div>
              <div style={{ fontSize: 12, color: currentColors.textSecondary, lineHeight: 1.4, marginBottom: 14 }}>
                {isExpanded ? fullDescription : shortDescription}
                {fullDescription.length > 300 && (<button className="btn-click" style={{ background: "none", border: "none", color: currentColors.primary, cursor: "pointer", marginTop: 6, fontSize: 11 }} onClick={() => toggleDescription(selectedGameDetail.id)}>{isExpanded ? <><FaChevronUp size={9} /> {text.showLess}</> : <><FaChevronDown size={9} /> {text.showMore}</>}</button>)}
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>{selectedGameDetail.platforms?.slice(0, 4).map(p => <span key={p} style={{ background: "rgba(255,255,255,0.1)", borderRadius: 16, padding: "3px 8px", fontSize: 10, color: currentColors.text }}>{p}</span>)}</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>{buyLinks.map(link => <button key={link.name} className="btn-click" style={{ background: link.color, border: "none", borderRadius: 8, padding: "5px 12px", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontSize: 11 }} onClick={() => window.open(link.url, "_blank")}>{link.icon} {link.name}</button>)}</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                <button className="btn-click" style={{ ...styles.addBtn, width: "auto", padding: "5px 12px", fontSize: 11 }} onClick={() => addToLibrary(selectedGameDetail)}>+ {text.add}</button>
                <button className="btn-click" style={{ ...styles.addBtn, width: "auto", padding: "5px 12px", fontSize: 11, background: isOnWishlist ? colors.success : currentColors.primary }} onClick={() => { if (!isOnWishlist) addToWishlist(selectedGameDetail); }}>⭐ {text.addToWishlist}</button>
              </div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontWeight: 600, marginBottom: 4, fontSize: 11 }}>{text.tags}:</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 4 }}>{tags.map((tag, i) => <span key={i} style={styles.tag}>{tag} <button onClick={() => removeTag(selectedGameDetail.id, i)} style={{ background: "none", border: "none", cursor: "pointer", marginLeft: 2 }}>✕</button></span>)}</div>
                <div style={{ display: "flex", gap: 6 }}><input style={{ ...styles.input, marginBottom: 0, padding: "5px 8px", fontSize: 10, width: 100 }} placeholder={text.addTag} value={newTag} onChange={e => setNewTag(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addTag(selectedGameDetail.id, newTag)} /><button className="btn-click" style={{ ...styles.addBtn, width: "auto", padding: "4px 8px", fontSize: 10 }} onClick={() => addTag(selectedGameDetail.id, newTag)}>+</button></div>
              </div>
              <div style={styles.journalCard}><div style={{ fontWeight: 600, marginBottom: 4, fontSize: 11, display: "flex", alignItems: "center", gap: 5 }}><GiNotebook size={12} /> {text.journalNotes}</div><textarea style={{ ...styles.input, fontSize: 11, padding: "6px 10px" }} rows="2" placeholder="Write your thoughts..." value={journalText} onChange={e => setJournalText(e.target.value)} onBlur={() => saveJournalNote(selectedGameDetail.id, journalText)} /></div>
            </div>
          </div>
          {selectedGameDetail.finalTrailer && <iframe src={selectedGameDetail.finalTrailer} style={styles.trailerFrame} title="Trailer" allowFullScreen />}
          <div className="fade-in">
            <div style={styles.sectionTitle}>{text.writeReview}</div>
            <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 12 }}>{[1,2,3,4,5].map(star => <span key={star} className="btn-click" style={{ fontSize: 28, cursor: "pointer", color: star <= reviewRating ? currentColors.primary : currentColors.textSecondary }} onClick={() => { setReviewRating(star); updateAchievements(); }}>★</span>)}</div>
            <textarea style={styles.textarea} placeholder={text.yourReview} rows="2" value={reviewComment} onChange={e => setReviewComment(e.target.value)} />
            <button className="btn-click" style={styles.modalBtn} onClick={submitGameDetailReview}>{text.submit}</button>
          </div>
          <div className="fade-in" style={{ marginTop: 20 }}>
            <div style={styles.sectionTitle}>{text.reviews} ({gameDetailReviews.length})</div>
            {gameDetailReviews.length === 0 ? <div style={styles.emptyState}>{text.noReviews}</div> : gameDetailReviews.slice(0, 5).map(review => (
              <div key={review.id} style={{ background: `${currentColors.primary}10`, borderRadius: 10, padding: 12, marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, flexWrap: "wrap", gap: 4 }}><span style={{ fontWeight: 700, fontSize: 12 }}>{review.username || "User"}</span><span style={{ color: currentColors.primary, fontSize: 11 }}>★ {review.rating}/5</span></div>
                <div style={{ fontSize: 11, color: currentColors.textSecondary, marginBottom: 8 }}>{review.comment || "No comment"}</div>
                {user && (<div style={{ display: "flex", gap: 12 }}><button className="btn-click" style={{ background: "none", border: "none", color: currentColors.textSecondary, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontSize: 11 }} onClick={() => handleLikeReview(review.id)}><FaThumbsUp size={10} /> {review.likes?.length || 0}</button><button className="btn-click" style={{ background: "none", border: "none", color: currentColors.textSecondary, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontSize: 11 }} onClick={() => handleDislikeReview(review.id)}><FaThumbsDown size={10} /> {review.dislikes?.length || 0}</button></div>)}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.app}>
      {renderConfetti()}
      {renderLevelUp()}
      
      {/* Mobile Menu - ALLE TABS SICHTBAR */}
      <div className="mobile-menu-overlay" style={styles.mobileMenu}>
        <button className="btn-click" style={styles.mobileMenuClose} onClick={closeMobileMenu}><FaTimes size={18} /></button>
        <div style={{ marginTop: 50 }}>
          <button className="btn-click mobile-menu-item" style={styles.mobileMenuItem} onClick={() => { setCurrentTab("home"); closeMobileMenu(); }}><FaHome size={14} /> {text.home}</button>
          <button className="btn-click mobile-menu-item" style={styles.mobileMenuItem} onClick={() => { setCurrentTab("library"); closeMobileMenu(); }}><BsFillCollectionFill size={14} /> {text.library}</button>
          <button className="btn-click mobile-menu-item" style={styles.mobileMenuItem} onClick={() => { setCurrentTab("profile"); closeMobileMenu(); }}><FaUser size={14} /> {text.profile}</button>
          <button className="btn-click mobile-menu-item" style={styles.mobileMenuItem} onClick={() => { setCurrentTab("friends"); closeMobileMenu(); }}><FaUsers size={14} /> {text.friends}</button>
          <button className="btn-click mobile-menu-item" style={styles.mobileMenuItem} onClick={() => { setCurrentTab("ai"); closeMobileMenu(); }}><FaRobot size={14} /> {text.ai}</button>
          <button className="btn-click mobile-menu-item" style={styles.mobileMenuItem} onClick={() => { setCurrentTab("aoty"); closeMobileMenu(); }}><FaTrophy size={14} /> {text.aoty}</button>
          <button className="btn-click mobile-menu-item" style={styles.mobileMenuItem} onClick={() => { setCurrentTab("random"); closeMobileMenu(); }}><FaRandom size={14} /> {text.random}</button>
          <button className="btn-click mobile-menu-item" style={styles.mobileMenuItem} onClick={() => { setCurrentTab("playlists"); closeMobileMenu(); }}><FaList size={14} /> {text.playlists}</button>
          <button className="btn-click mobile-menu-item" style={styles.mobileMenuItem} onClick={() => { setCurrentTab("achievements"); closeMobileMenu(); }}><GiAchievement size={14} /> {text.achievementsTitle}</button>
          <button className="btn-click mobile-menu-item" style={styles.mobileMenuItem} onClick={() => { setCurrentTab("gamification"); closeMobileMenu(); }}><FaBolt size={14} /> {text.gamification}</button>
          <button className="btn-click mobile-menu-item" style={styles.mobileMenuItem} onClick={() => { setCurrentTab("news"); closeMobileMenu(); }}><FaNewspaper size={14} /> {text.news}</button>
          <button className="btn-click mobile-menu-item" style={styles.mobileMenuItem} onClick={() => { setCurrentTab("support"); closeMobileMenu(); }}><FaDonate size={14} /> {text.support}</button>
          <button className="btn-click mobile-menu-item" style={styles.mobileMenuItem} onClick={() => { setCurrentTab("compare"); closeMobileMenu(); }}><FaBalanceScale size={14} /> {text.compare}</button>
          <button className="btn-click mobile-menu-item" style={styles.mobileMenuItem} onClick={() => { setShowSettings(true); closeMobileMenu(); }}><FaCog size={14} /> {text.settings}</button>
          {!user ? <button className="btn-click" style={{ ...styles.mobileMenuItem, background: "linear-gradient(135deg, #4285f4, #3367d6)", marginTop: 16, borderRadius: 12, justifyContent: "center", padding: "10px" }} onClick={() => { setShowLoginModal(true); closeMobileMenu(); }}><FaEnvelope size={14} /> {text.login}</button> :
            <button className="btn-click" style={{ ...styles.mobileMenuItem, background: "rgba(255,255,255,0.08)", marginTop: 16, borderRadius: 12, justifyContent: "center", padding: "10px" }} onClick={() => { logout(); closeMobileMenu(); }}><FaSignOutAlt size={14} /> {text.logout}</button>}
        </div>
      </div>

      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.logo} onClick={() => { setLogoClickCount(prev => prev + 1); updateAchievements(); setCurrentTab("home"); }}>
            <div style={styles.logoIcon}><GiConsoleController size={16} /><span style={styles.logoIconText}>NX</span></div>
            <span style={styles.logoText}>NexPlay</span>
          </div>
          <div style={styles.rightSection}>
            <div className="main-tabs-desktop" style={styles.mainTabs}>
              <button className="btn-click" style={styles.mainTab(currentTab === "home")} onClick={() => setCurrentTab("home")}><FaHome size={12} /> {text.home}</button>
              <button className="btn-click" style={styles.mainTab(currentTab === "library")} onClick={() => setCurrentTab("library")}><BsFillCollectionFill size={12} /> {text.library}</button>
              <button className="btn-click" style={styles.mainTab(currentTab === "profile")} onClick={() => setCurrentTab("profile")}><FaUser size={12} /> {text.profile}</button>
              <button className="btn-click" style={styles.mainTab(currentTab === "friends")} onClick={() => setCurrentTab("friends")}><FaUsers size={12} /> {text.friends}</button>
              <button className="btn-click" style={styles.mainTab(currentTab === "ai")} onClick={() => setCurrentTab("ai")}><FaRobot size={12} /> {text.ai}</button>
              <button className="btn-click" style={styles.mainTab(currentTab === "aoty")} onClick={() => setCurrentTab("aoty")}><FaTrophy size={12} /> {text.aoty}</button>
              <button className="btn-click" style={styles.mainTab(currentTab === "random")} onClick={() => setCurrentTab("random")}><FaRandom size={12} /> {text.random}</button>
              <button className="btn-click" style={styles.mainTab(currentTab === "playlists")} onClick={() => setCurrentTab("playlists")}><FaList size={12} /> {text.playlists}</button>
              <button className="btn-click" style={styles.mainTab(currentTab === "achievements")} onClick={() => setCurrentTab("achievements")}><GiAchievement size={12} /> {text.achievementsTitle}</button>
              <button className="btn-click" style={styles.mainTab(currentTab === "gamification")} onClick={() => setCurrentTab("gamification")}><FaBolt size={12} /> {text.gamification}</button>
              <button className="btn-click" style={styles.mainTab(currentTab === "news")} onClick={() => setCurrentTab("news")}><FaNewspaper size={12} /> {text.news}</button>
              <button className="btn-click" style={styles.mainTab(currentTab === "support")} onClick={() => setCurrentTab("support")}><FaDonate size={12} /> {text.support}</button>
              <button className="btn-click" style={styles.iconBtn} onClick={() => setShowSettings(true)}><FaCog size={12} /></button>
              <span style={styles.badge10k}>10K</span>
              {!user ? <button className="btn-click" style={styles.loginBtn} onClick={() => setShowLoginModal(true)}><FaEnvelope size={12} /> {text.login}</button> :
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {profilePicUrl ? <img src={profilePicUrl} style={styles.userAvatar} alt="avatar" /> : <div style={styles.userAvatar}>{userData?.username?.charAt(0).toUpperCase()}</div>}
                  <button className="btn-click" style={styles.logoutBtn} onClick={logout}><FaSignOutAlt size={12} /></button>
                </div>}
            </div>
            <button className="btn-click hamburger-btn" style={styles.hamburgerBtn} onClick={toggleMobileMenu}><FaBars size={18} /></button>
          </div>
        </div>

        {/* HOME TAB */}
        {currentTab === "home" && (
          <div className="fade-in">
            <div style={{ display: "flex", gap: 4, borderBottom: `1px solid rgba(255,255,255,0.08)`, marginTop: 16, marginBottom: 16, overflowX: "auto", flexWrap: "nowrap" }}>
              <button className="btn-click" style={{ background: "none", border: "none", borderBottom: discoverSubTab === "findGame" ? `2px solid ${currentColors.primary}` : "2px solid transparent", color: discoverSubTab === "findGame" ? currentColors.primary : currentColors.textSecondary, padding: "6px 12px", cursor: "pointer", fontSize: 11, whiteSpace: "nowrap" }} onClick={() => setDiscoverSubTab("findGame")}>🔍 {text.findYourGame}</button>
              <button className="btn-click" style={{ background: "none", border: "none", borderBottom: discoverSubTab === "topPicks" ? `2px solid ${currentColors.primary}` : "2px solid transparent", color: discoverSubTab === "topPicks" ? currentColors.primary : currentColors.textSecondary, padding: "6px 12px", cursor: "pointer", fontSize: 11, whiteSpace: "nowrap" }} onClick={() => setDiscoverSubTab("topPicks")}>🎯 {text.topPicks}</button>
              <button className="btn-click" style={{ background: "none", border: "none", borderBottom: discoverSubTab === "bestEver" ? `2px solid ${currentColors.primary}` : "2px solid transparent", color: discoverSubTab === "bestEver" ? currentColors.primary : currentColors.textSecondary, padding: "6px 12px", cursor: "pointer", fontSize: 11, whiteSpace: "nowrap" }} onClick={() => setDiscoverSubTab("bestEver")}>🏆 {text.bestEver}</button>
              <button className="btn-click" style={{ background: "none", border: "none", borderBottom: discoverSubTab === "hiddenGems" ? `2px solid ${currentColors.primary}` : "2px solid transparent", color: discoverSubTab === "hiddenGems" ? currentColors.primary : currentColors.textSecondary, padding: "6px 12px", cursor: "pointer", fontSize: 11, whiteSpace: "nowrap" }} onClick={() => setDiscoverSubTab("hiddenGems")}>💎 {text.hiddenGems}</button>
              <button className="btn-click" style={{ background: "none", border: "none", borderBottom: discoverSubTab === "top10" ? `2px solid ${currentColors.primary}` : "2px solid transparent", color: discoverSubTab === "top10" ? currentColors.primary : currentColors.textSecondary, padding: "6px 12px", cursor: "pointer", fontSize: 11, whiteSpace: "nowrap" }} onClick={() => setDiscoverSubTab("top10")}>📊 {text.top10}</button>
              <button className="btn-click" style={{ background: "none", border: "none", borderBottom: discoverSubTab === "compare" ? `2px solid ${currentColors.primary}` : "2px solid transparent", color: discoverSubTab === "compare" ? currentColors.primary : currentColors.textSecondary, padding: "6px 12px", cursor: "pointer", fontSize: 11, whiteSpace: "nowrap" }} onClick={() => setDiscoverSubTab("compare")}>⚖️ {text.compare}</button>
            </div>

            {discoverSubTab === "findGame" && (
              <>
                <div style={styles.randomFilterSection}>
                  <div style={styles.randomFilterTitle}><FaRandom size={12} /> {text.randomGame}</div>
                  <div style={styles.randomFilterRow}>
                    <label className="btn-click" style={styles.randomCheckbox}><input type="checkbox" checked={randomExcludeHorror} onChange={e => setRandomExcludeHorror(e.target.checked)} /> Kein Horror</label>
                    <label className="btn-click" style={styles.randomCheckbox}><input type="checkbox" checked={randomExcludeIndie} onChange={e => setRandomExcludeIndie(e.target.checked)} /> Keine Indie</label>
                    <label className="btn-click" style={styles.randomCheckbox}><input type="checkbox" checked={randomExcludeOld} onChange={e => setRandomExcludeOld(e.target.checked)} /> Nur ab 2015</label>
                  </div>
                  <div style={styles.randomFilterRow}>
                    <select className="btn-click" value={randomYear} onChange={e => setRandomYear(e.target.value)} style={styles.randomSelect}>
                      <option value="all">{text.allYears}</option>
                      {YEARS.map(year => (<option key={year} value={year}>{year}</option>))}
                    </select>
                    <select className="btn-click" value={randomSelectedGenre} onChange={e => setRandomSelectedGenre(e.target.value)} style={styles.randomSelect}>
                      <option value="all">Alle Genres</option>
                      {GENRES.map(g => (<option key={g} value={g}>{g}</option>))}
                    </select>
                    <select className="btn-click" value={randomSelectedMood} onChange={e => setRandomSelectedMood(e.target.value)} style={styles.randomSelect}>
                      <option value="all">Alle Moods</option>
                      {MOODS.map(m => (<option key={m} value={m}>{m}</option>))}
                    </select>
                    <select className="btn-click" value={randomMode} onChange={e => setRandomMode(e.target.value)} style={styles.randomSelect}>
                      <option value="full">Voll Random</option><option value="genre">Nach Genre</option><option value="mood">Nach Stimmung</option>
                    </select>
                    <button className="btn-click" style={styles.loginBtn} onClick={doRandom}><FaRandom size={11} /> Zufall</button>
                    <button className="btn-click" style={{ ...styles.loginBtn, background: colors.success }} onClick={doGameRoulette}><FaDiceD6 size={11} /> Roulette (3)</button>
                  </div>
                  <div style={{ marginTop: 10 }}><span style={{ fontSize: 11 }}>Min. Bewertung: {randomMinRating}</span><input type="range" min="0" max="10" step="0.5" value={randomMinRating} onChange={e => setRandomMinRating(parseFloat(e.target.value))} style={styles.randomSlider} /></div>
                </div>

                {showRoulette && rouletteResult.length > 0 && (
                  <div className="fade-in" style={{ marginBottom: 16, background: currentColors.bgCard, borderRadius: 16, padding: 14 }}>
                    <div style={styles.sectionTitle}>🎲 {text.rouletteResult}</div>
                    <div style={styles.grid}>{rouletteResult.map(game => <GameCard key={game.id} game={game} showBtn={true} />)}</div>
                    <button className="btn-click" style={styles.modalBtnSecondary} onClick={() => setShowRoulette(false)}>{text.close}</button>
                  </div>
                )}

                <div style={{ display: "flex", gap: 4, borderBottom: `1px solid rgba(255,255,255,0.08)`, marginBottom: 16 }}>
                  <button className="btn-click" style={{ background: "none", border: "none", borderBottom: step === 1 ? `2px solid ${currentColors.primary}` : "2px solid transparent", color: step === 1 ? currentColors.primary : currentColors.textSecondary, padding: "4px 10px", cursor: "pointer", fontSize: 10 }} onClick={() => setStep(1)}>{text.mood}</button>
                  <button className="btn-click" style={{ background: "none", border: "none", borderBottom: step === 2 ? `2px solid ${currentColors.primary}` : "2px solid transparent", color: step === 2 ? currentColors.primary : currentColors.textSecondary, padding: "4px 10px", cursor: "pointer", fontSize: 10 }} onClick={() => setStep(2)}>{text.genre}</button>
                  <button className="btn-click" style={{ background: "none", border: "none", borderBottom: step === 3 ? `2px solid ${currentColors.primary}` : "2px solid transparent", color: step === 3 ? currentColors.primary : currentColors.textSecondary, padding: "4px 10px", cursor: "pointer", fontSize: 10 }} onClick={() => setStep(3)}>{text.playtime}</button>
                  <button className="btn-click" style={{ background: "none", border: "none", borderBottom: step === 4 ? `2px solid ${currentColors.primary}` : "2px solid transparent", color: step === 4 ? currentColors.primary : currentColors.textSecondary, padding: "4px 10px", cursor: "pointer", fontSize: 10 }} onClick={() => setStep(4)}>{text.results}</button>
                </div>

                {step === 1 && (<div className="slide-in"><div style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, textAlign: "center" }}>{text.mood} 🎭</div><div style={styles.pillGrid}>{MOODS.map(m => <button key={m} className="btn-click" style={styles.pill(selectedMoods.includes(m))} onClick={() => toggle(selectedMoods, setSelectedMoods, m)}>{m}</button>)}</div><button className="btn-click" style={styles.nextBtn} onClick={() => setStep(2)}>{text.next} →</button></div>)}
                {step === 2 && (<div className="slide-in"><div style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, textAlign: "center" }}>{text.genre} 🎮</div><div style={styles.pillGrid}>{GENRES.map(g => <button key={g} className="btn-click" style={styles.pill(selectedGenres.includes(g))} onClick={() => toggle(selectedGenres, setSelectedGenres, g)}>{g}</button>)}</div><button className="btn-click" style={styles.nextBtn} onClick={() => setStep(3)}>{text.next} →</button></div>)}
                {step === 3 && (<div className="slide-in"><div style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, textAlign: "center" }}>{text.playtime} ⏱️</div><div style={styles.pillGrid}>{PLAYTIMES.map(p => <button key={p} className="btn-click" style={styles.pill(selectedPlaytime === p)} onClick={() => setSelectedPlaytime(p === selectedPlaytime ? null : p)}>{p}</button>)}</div><button className="btn-click" style={styles.nextBtn} onClick={() => setStep(4)}>{text.results} 🚀</button></div>)}
                {step === 4 && (<div className="fade-in"><input style={styles.searchBar} placeholder={text.search} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} /><div style={styles.filterRow}><span style={{ fontSize: 11 }}>{text.sort}:</span><button className="btn-click" style={styles.filterBtn(sortBy === "score")} onClick={() => setSortBy("score")}>{text.bestMatch}</button><button className="btn-click" style={styles.filterBtn(sortBy === "rating")} onClick={() => setSortBy("rating")}>{text.rating}</button><button className="btn-click" style={styles.filterBtn(sortBy === "year")} onClick={() => setSortBy("year")}>{text.year}</button></div><div><div style={styles.sectionTitle}>🎯 {text.topPicks}</div><div style={styles.topPicksRow}>{topPicks.slice(0, 6).map((g,i) => <div key={g.id} className="game-card" style={styles.topPickCard} onClick={() => openGameDetail(g)}><div style={{ fontSize: 16, marginBottom: 5 }}>{["🥇","🥈","🥉","4","5","6"][i]}</div><img src={g.finalImg || g.img} style={{ width: "100%", height: 70, objectFit: "cover", borderRadius: 8 }} alt={g.name} /><div style={{ fontWeight: 700, marginTop: 6, fontSize: 11 }}>{g.name}</div><div style={{ fontSize: 10, color: currentColors.primary, marginTop: 2 }}>★ {(g.finalRating || g.rating)?.toFixed(1)}</div><button className="btn-click" style={{ ...styles.addBtn, padding: "5px 8px", fontSize: 10 }} onClick={(e) => { e.stopPropagation(); addToLibrary(g); }}>+ {text.add}</button></div>)}</div></div><div style={styles.sectionTitle}>📋 {text.allResults}</div><div style={styles.grid}>{restResults.slice(0, 24).map(g => <GameCard key={g.id} game={g} showBtn={true} />)}</div></div>)}
              </>
            )}

            {discoverSubTab === "topPicks" && (<div className="fade-in"><div style={styles.sectionTitle}>🎯 {text.topPicks}</div><div style={styles.grid}>{TOP_PICKS_GAMES.slice(0, 20).map(g => <GameCard key={g.id} game={g} showBtn={true} />)}</div></div>)}
            {discoverSubTab === "bestEver" && (<div className="fade-in"><input style={styles.searchBar} placeholder={text.search} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} /><div style={styles.filterRow}><span>{text.sort}:</span><button className="btn-click" style={styles.filterBtn(sortBy === "score")} onClick={() => setSortBy("score")}>{text.bestMatch}</button><button className="btn-click" style={styles.filterBtn(sortBy === "rating")} onClick={() => setSortBy("rating")}>{text.rating}</button></div><div style={styles.sectionTitle}>🏆 {text.bestEver}</div><div style={styles.grid}>{BEST_EVER_GAMES.slice(0, 30).map(g => <GameCard key={g.id} game={g} showBtn={true} />)}</div></div>)}
            {discoverSubTab === "hiddenGems" && (<div className="fade-in"><div style={styles.sectionTitle}>💎 {text.hiddenGems}</div><div style={styles.grid}>{HIDDEN_GEMS_GAMES.map(g => <GameCard key={g.id} game={g} showBtn={true} />)}</div></div>)}
            {discoverSubTab === "top10" && (<div className="fade-in"><select className="btn-click" value={selectedGenreForTop} onChange={e => setSelectedGenreForTop(e.target.value)} style={styles.topGenreSelect}>{GENRES.map(g => <option key={g} value={g}>{g}</option>)}</select><div style={styles.sectionTitle}>⭐ {text.top10} - {selectedGenreForTop}</div>{top10ByGenre.length === 0 ? (<div style={styles.emptyState}>Keine Spiele in diesem Genre.</div>) : (<div style={styles.grid}>{top10ByGenre.map(g => <GameCard key={g.id} game={g} showBtn={true} />)}</div>)}</div>)}
            {discoverSubTab === "compare" && (
              <div className="fade-in">
                <div style={styles.sectionTitle}><FaBalanceScale size={12} /> {text.compareGames}</div>
                <div style={styles.compareCard}>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
                    <select className="btn-click" style={{ ...styles.select, flex: 1, padding: "8px", fontSize: 12 }} value={compareGames[0]?.id || ""} onChange={e => { const game = [...gamesWithData, ...MANUAL_GAMES, ...MANUAL_HIDDEN_GEMS].find(g => g.id === parseInt(e.target.value)); setCompareGames([game, compareGames[1]]); }}>
                      <option value="">{text.selectGame} 1</option>
                      {[...gamesWithData, ...MANUAL_GAMES, ...MANUAL_HIDDEN_GEMS].slice(0, 50).map(g => <option key={g.id} value={g.id}>{g.name} ({g.year}) - ★{g.finalRating?.toFixed(1)}</option>)}
                    </select>
                    <div style={{ fontSize: 20, color: currentColors.primary, alignSelf: "center", fontWeight: 700 }}>VS</div>
                    <select className="btn-click" style={{ ...styles.select, flex: 1, padding: "8px", fontSize: 12 }} value={compareGames[1]?.id || ""} onChange={e => { const game = [...gamesWithData, ...MANUAL_GAMES, ...MANUAL_HIDDEN_GEMS].find(g => g.id === parseInt(e.target.value)); setCompareGames([compareGames[0], game]); }}>
                      <option value="">{text.selectGame} 2</option>
                      {[...gamesWithData, ...MANUAL_GAMES, ...MANUAL_HIDDEN_GEMS].slice(0, 50).map(g => <option key={g.id} value={g.id}>{g.name} ({g.year}) - ★{g.finalRating?.toFixed(1)}</option>)}
                    </select>
                  </div>
                  {compareGames[0] && compareGames[1] && (<div><div style={styles.compareGrid}><div style={styles.compareColumn}><div style={styles.compareHeader}><img src={compareGames[0].finalImg || compareGames[0].img} style={{ width: 70, height: 93, objectFit: "cover", borderRadius: 10, marginBottom: 10 }} alt={compareGames[0].name} /><div style={{ fontSize: 14 }}>{compareGames[0].name}</div><div style={{ fontSize: 12, color: currentColors.primary, marginTop: 3 }}>★ {compareGames[0].finalRating?.toFixed(1)}</div></div><div style={styles.compareRow}><span style={styles.compareLabel}>{text.year}</span><span style={styles.compareValue}>{compareGames[0].year}</span></div><div style={styles.compareRow}><span style={styles.compareLabel}>{text.genre}</span><span style={styles.compareValue}>{compareGames[0].genre}</span></div><div style={styles.compareRow}><span style={styles.compareLabel}>{text.playtime}</span><span style={styles.compareValue}>{compareGames[0].playtime}</span></div><div style={styles.compareRow}><span style={styles.compareLabel}>Developer</span><span style={styles.compareValue}>{compareGames[0].developer}</span></div></div><div style={styles.compareColumn}><div style={styles.compareHeader}><img src={compareGames[1].finalImg || compareGames[1].img} style={{ width: 70, height: 93, objectFit: "cover", borderRadius: 10, marginBottom: 10 }} alt={compareGames[1].name} /><div style={{ fontSize: 14 }}>{compareGames[1].name}</div><div style={{ fontSize: 12, color: currentColors.primary, marginTop: 3 }}>★ {compareGames[1].finalRating?.toFixed(1)}</div></div><div style={styles.compareRow}><span style={styles.compareLabel}>{text.year}</span><span style={styles.compareValue}>{compareGames[1].year}</span></div><div style={styles.compareRow}><span style={styles.compareLabel}>{text.genre}</span><span style={styles.compareValue}>{compareGames[1].genre}</span></div><div style={styles.compareRow}><span style={styles.compareLabel}>{text.playtime}</span><span style={styles.compareValue}>{compareGames[1].playtime}</span></div><div style={styles.compareRow}><span style={styles.compareLabel}>Developer</span><span style={styles.compareValue}>{compareGames[1].developer}</span></div></div></div><div style={{ marginTop: 20, padding: 12, background: "rgba(0,0,0,0.2)", borderRadius: 14, textAlign: "center" }}><div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>🏆 {text.winner}</div><div style={{ fontSize: 20, fontWeight: 800, color: currentColors.primary }}>{compareGames[0].finalRating > compareGames[1].finalRating ? compareGames[0].name : compareGames[1].finalRating > compareGames[0].finalRating ? compareGames[1].name : "Unentschieden!"}</div></div></div>)}
                </div>
              </div>
            )}
          </div>
        )}

        {/* LIBRARY TAB */}
        {currentTab === "library" && (
          <div className="fade-in">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
              <div style={styles.sectionTitle}>📚 {text.library} ({library.length})</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn-click" style={styles.loginBtn} onClick={exportLibrary}><FaFileExport size={11} /> {text.export}</button>
                <label className="btn-click" style={styles.loginBtn}><FaFileImport size={11} /> {text.import}<input type="file" accept=".json" style={{ display: "none" }} onChange={importLibrary} /></label>
              </div>
            </div>
            <div style={styles.statsRow}>
              <div style={styles.statCard}><div style={styles.statNumber}>{library.length}</div><div>{text.total}</div></div>
              <div style={styles.statCard}><div style={styles.statNumber}>{library.filter(g => g.status === "playing").length}</div><div>{text.playing}</div></div>
              <div style={styles.statCard}><div style={styles.statNumber}>{library.filter(g => g.status === "completed").length}</div><div>{text.completed}</div></div>
            </div>
            <div style={styles.profileSection}><div style={styles.profileSectionTitle}>{text.completionProgress}</div><div style={styles.progressBar}><div style={styles.progressFill}></div></div><div style={{ textAlign: "center", marginTop: 5, fontSize: 11, color: currentColors.textSecondary }}>{completionPercentage}% abgeschlossen</div></div>
            {library.length === 0 ? <div style={styles.emptyState}>{text.library} ist leer. Füge Spiele hinzu!</div> : library.map(game => (
              <div key={game.id} className="fade-in" style={styles.libraryCard}>
                <img src={game.finalImg || game.img} style={styles.libraryImg} onClick={() => openGameDetail(game)} alt={game.name} />
                <div style={styles.libraryInfo}>
                  <div style={styles.libraryTitle}>{game.name}</div>
                  <div style={styles.libraryMeta}>{game.developer?.slice(0, 40)} · {game.year}</div>
                  <div style={styles.libraryActions}>
                    <select className="btn-click" value={game.status} onChange={e => updateStatus(game.id, e.target.value, game)} style={styles.select}>
                      <option value="wishlist">📝 Wunschliste</option>
                      <option value="playing">🎮 {text.playing}</option>
                      <option value="completed">✅ {text.completed}</option>
                    </select>
                    <button className="btn-click" onClick={() => toggleFavorite(game.id)} style={styles.select}><FaHeart color={favorites.includes(game.id) ? currentColors.primary : "#fff"} size={10} /></button>
                    <button className="btn-click" onClick={() => markAsPlayed(game)} style={styles.select}><FaClock size={10} /> {text.played}</button>
                    <button className="btn-click" onClick={() => removeFromLibrary(game.id)} style={{ ...styles.select, color: "#ff6b6b" }}><FaTrash size={10} /> {text.remove}</button>
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
                  <div style={{ position: "relative" }}>
                    {profilePicUrl ? <img src={profilePicUrl} style={styles.profileAvatarLarge} alt="avatar" /> : <div style={styles.profileAvatarLarge}>{userData?.username?.charAt(0).toUpperCase()}</div>}
                    <div style={styles.cameraIcon} onClick={() => fileInputRef.current?.click()}><FaCamera size={12} color={currentColors.primary} /></div>
                    <input type="file" ref={fileInputRef} style={{ display: "none" }} accept="image/*" onChange={handleProfilePicUpload} />
                    {profilePicUploading && <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", background: "rgba(0,0,0,0.7)", borderRadius: "50%", padding: "5px" }}><FaSpinner className="spinning-wheel" size={14} /></div>}
                  </div>
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 700, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", justifyContent: "center" }}>{userData?.username}{userData?.username === "Sherlock10K" && <span style={{ color: currentColors.primary, fontSize: 18 }}>👑</span>}</div>
                    <div style={{ fontSize: 11, color: currentColors.textSecondary }}>{user.email}</div>
                    <div style={{ fontSize: 11, color: currentColors.textSecondary, marginBottom: 12 }}>{userData?.bio || "Keine Bio"}</div>
                    <div style={styles.statsRow}>
                      <div style={styles.statCard}><div style={styles.statNumber}>{library.length}</div><div>{text.total}</div></div>
                      <div style={styles.statCard}><div style={styles.statNumber}>{library.filter(g => g.status === "completed").length}</div><div>{text.completed}</div></div>
                      <div style={styles.statCard}><div style={styles.statNumber}>{favorites.length}</div><div>{text.favorites}</div></div>
                    </div>
                    <div style={styles.statsRow}>
                      <div style={styles.statCard}><div style={styles.statNumber}>{userLevel}</div><div>{text.level}</div></div>
                      <div style={styles.statCard}><div style={styles.statNumber}>{userXP}</div><div>{text.xp}</div></div>
                      <div style={styles.statCard}><div style={styles.statNumber}>{userBadges.length}</div><div>{text.badges}</div></div>
                    </div>
                    <button className="btn-click" style={styles.editBtn} onClick={openEditModal}><FaEdit size={10} /> {text.editProfile}</button>
                    <button className="btn-click" style={{ ...styles.donationBtn, marginLeft: 8, marginTop: 12 }} onClick={() => window.open("https://ko-fi.com/sherlock10k", "_blank")}><FaDonate size={10} /> {text.donate}</button>
                  </div>
                </div>

                <div style={styles.profileSection}><div style={styles.profileSectionTitle}><FaStar size={12} /> {text.wishlist}</div>{wishlist.length === 0 ? <div style={styles.emptyState}>Deine Wunschliste ist leer.</div> : <div style={styles.grid}>{wishlist.slice(0, 6).map(game => <GameCard key={game.id} game={game} showBtn={true} />)}</div>}</div>
                <div style={styles.profileSection}><div style={styles.profileSectionTitle}><FaBell size={12} /> {text.activityFeed}</div>{activityFeed.length === 0 ? <div style={styles.emptyState}>Noch keine Aktivitäten.</div> : activityFeed.slice(0, 5).map(activity => (<div key={activity.id} style={{ background: currentColors.bgCard, borderRadius: 10, padding: 10, marginBottom: 10, display: "flex", alignItems: "center", gap: 10 }}><div style={{ fontSize: 20 }}>{activity.type === "add" ? "➕" : activity.type === "completed" ? "✅" : "🎮"}</div><div style={{ flex: 1 }}><div style={{ fontSize: 12 }}>{activity.message}</div><div style={{ fontSize: 9, color: currentColors.textMuted }}>{new Date(activity.timestamp).toLocaleString()}</div></div></div>))}</div>
                <div style={styles.profileSection}><div style={styles.profileSectionTitle}><FaChartLine size={12} /> {text.backlog}</div>{backlogRecommendation && typeof backlogRecommendation === "object" ? (<div style={styles.gameNightCard}><div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>{text.backlogTip}:</div><GameCard game={backlogRecommendation} showBtn={true} /></div>) : (<div style={styles.emptyState}>{backlogRecommendation || "Keine Spiele im Backlog! Füge welche hinzu."}</div>)}</div>
              </>
            ) : <div style={styles.emptyState}>Login um dein Profil zu sehen</div>}
          </div>
        )}

        {/* FRIENDS TAB */}
        {currentTab === "friends" && (
          <div className="fade-in">
            <div style={styles.sectionTitle}><FaUsers size={12} /> {text.findFriends}</div>
            <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}><input style={{ ...styles.input, marginBottom: 0, flex: 1 }} placeholder="Benutzername suchen..." value={searchUsersTerm} onChange={e => setSearchUsersTerm(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSearchUsers()} /><button className="btn-click" style={styles.loginBtn} onClick={handleSearchUsers}><FaSearch size={11} /> {text.search}</button></div>
            {searchingUsers && <div style={{ textAlign: "center", color: currentColors.textSecondary, fontSize: 12 }}>Suche...</div>}
            {foundUsers.length === 0 && searchUsersTerm && !searchingUsers && <div style={styles.emptyState}>Keine Benutzer gefunden</div>}
            {foundUsers.map(u => (<div key={u.id} className="fade-in" style={{ background: currentColors.bgCard, borderRadius: 12, padding: 10, marginBottom: 10, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}><div style={{ width: 36, height: 36, borderRadius: "50%", background: currentColors.primary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: currentColors.bg }}>{u.username?.charAt(0).toUpperCase()}</div><div><div style={{ fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", gap: 5 }}>{u.username}{u.username === "Sherlock10K" && <span style={{ color: currentColors.primary }}>👑</span>}</div><div style={{ fontSize: 11, color: currentColors.textSecondary }}>{u.bio?.slice(0, 50) || "Keine Bio"}</div></div><button className="btn-click" style={{ ...styles.addBtn, width: "auto", marginTop: 0, padding: "5px 12px", fontSize: 10 }} onClick={() => showNotif(`Freundschaftsanfrage an ${u.username} gesendet!`)}>Freund anfragen</button></div>))}
          </div>
        )}

        {/* AI TAB */}
        {currentTab === "ai" && (
          <div className="fade-in">
            <div style={styles.aiSection}>
              <div style={styles.randomFilterTitle}><FaRobot size={12} /> {text.ai}</div>
              <div style={{ marginBottom: 8, padding: "0 10px" }}><span style={{ fontSize: 10, color: currentColors.primary }}>💬 {text.freeAiQueries}: {freeAiQueries}</span></div>
              <div style={styles.aiQuickActions}>
                <button className="btn-click" style={styles.aiQuickBtn} onClick={() => { setAiInput("Empfehle mir ein RPG"); sendAiMessage(); }}>🎮 RPG empfehlen</button>
                <button className="btn-click" style={styles.aiQuickBtn} onClick={() => { setAiInput("Tipps für Elden Ring"); sendAiMessage(); }}>🗡️ Elden Ring</button>
                <button className="btn-click" style={styles.aiQuickBtn} onClick={() => { setAiInput("Was ist neu?"); sendAiMessage(); }}>📰 News</button>
              </div>
              <div style={styles.aiChatContainer}>
                <div style={styles.aiMessages}>
                  {aiMessages.map((msg, idx) => (<div key={idx} style={styles.aiMessage(msg.role === "user")}><div style={{ fontWeight: 600, marginBottom: 2, fontSize: 9, opacity: 0.7 }}>{msg.role === "user" ? "Du" : "🎮 NexPlay KI"}</div><div style={{ fontSize: 11, lineHeight: 1.4, whiteSpace: "pre-wrap" }}>{msg.content}</div></div>))}
                  {isAiLoading && (<div style={styles.aiMessage(false)}><div style={{ display: "flex", gap: 3 }}><span className="pulse-dot">●</span><span className="pulse-dot" style={{ animationDelay: "0.2s" }}>●</span><span className="pulse-dot" style={{ animationDelay: "0.4s" }}>●</span></div></div>)}
                  <div ref={aiChatEndRef} />
                </div>
                <div style={styles.aiInputRow}>
                  <input style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "none", borderRadius: 18, padding: "8px 12px", color: currentColors.text, fontSize: 11, outline: "none" }} placeholder="Frag mich nach Spielen..." value={aiInput} onChange={e => setAiInput(e.target.value)} onKeyPress={e => e.key === "Enter" && sendAiMessage()} />
                  <button className="btn-click" style={styles.addBtn} onClick={sendAiMessage}>{isAiLoading ? <FaSpinner className="spinning-wheel" size={10} /> : "Senden"}</button>
                </div>
              </div>
            </div>
            <div style={styles.sectionTitle}>🎯 {text.topPicks}</div>
            <div style={styles.grid}>{TOP_PICKS_GAMES.slice(0, 16).map(g => <GameCard key={g.id} game={g} showBtn={true} />)}</div>
          </div>
        )}

        {/* AOTY TAB */}
        {currentTab === "aoty" && (
          <div className="fade-in">
            {selectedAotyYear ? (
              <>
                <button className="btn-click" style={styles.gotyBackBtn} onClick={() => { setSelectedAotyYear(null); setAotySearch(""); setAotyResult(null); }}><FaArrowLeft size={10} /> {text.backToAOTY}</button>
                <div style={styles.aotyResultCard}>
                  <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 16, textAlign: "center", color: currentColors.primary }}>{selectedAotyYear}</div>
                  <div className="award-card" style={styles.aotyWinnerCard} onClick={() => {
                    const award = AOTY_DATA[selectedAotyYear];
                    if (award) {
                      const gameData = {
                        id: selectedAotyYear,
                        name: award.winner,
                        rating: 9.0,
                        genre: award.genre || "Action",
                        playtime: award.playtime || "20-40h",
                        year: selectedAotyYear,
                        img: award.img,
                        developer: award.developer || "Various",
                        description: award.description || `${award.winner} ist das Spiel des Jahres ${selectedAotyYear}.`,
                        platforms: ["PC", "Console"],
                        steamId: award.steamId,
                        finalRating: 9.0,
                        finalImg: award.img
                      };
                      openGameDetail(gameData);
                    }
                  }}>
                    <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                      <FaTrophy style={{ color: currentColors.primary, fontSize: 22 }} />
                      <div>
                        <div style={{ fontSize: 10, color: currentColors.primary }}>🏆 {text.winner}</div>
                        <div style={{ fontSize: 18, fontWeight: 700 }}>{AOTY_DATA[selectedAotyYear]?.winner}</div>
                      </div>
                    </div>
                  </div>
                  <div style={{ marginTop: 16 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>📋 {text.nominees}</div>
                    {AOTY_DATA[selectedAotyYear]?.nominees?.map((nominee, idx) => (
                      <div key={idx} style={{ ...styles.aotyWinnerCard, opacity: 0.8, marginBottom: 8 }} onClick={() => {
                        const nomineeGame = MANUAL_GAMES.find(g => g.name === nominee) || { name: nominee, genre: "Unknown", year: selectedAotyYear, img: "https://placehold.co/300x400" };
                        const gameData = {
                          id: `nominee-${idx}`,
                          name: nominee,
                          rating: 8.5,
                          genre: nomineeGame.genre || "Action",
                          playtime: "20-40h",
                          year: selectedAotyYear,
                          img: nomineeGame.img || "https://placehold.co/300x400",
                          developer: "Various",
                          description: `${nominee} war nominiert für das Spiel des Jahres ${selectedAotyYear}.`,
                          platforms: ["PC", "Console"],
                          finalRating: 8.5,
                          finalImg: nomineeGame.img || "https://placehold.co/300x400"
                        };
                        openGameDetail(gameData);
                      }}>
                        <div style={{ fontSize: 14 }}>{idx + 1}.</div>
                        <div><div style={{ fontSize: 13 }}>{nominee}</div></div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div style={styles.sectionTitle}><FaTrophy size={16} /> {text.aotyTitle}</div>
                <input style={styles.searchBar} placeholder={text.searchAOTY} value={aotySearch} onChange={e => setAotySearch(e.target.value)} />
                {aotyResult ? (
                  <div style={styles.aotyResultCard}>
                    <button className="btn-click" style={styles.gotyBackBtn} onClick={() => { setAotyResult(null); setSelectedAotyYear(null); setAotySearch(""); }}><FaArrowLeft size={10} /> {text.backToAOTY}</button>
                    <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 16, textAlign: "center", color: currentColors.primary }}>{aotyResult.year}</div>
                    <div className="award-card" style={styles.aotyWinnerCard} onClick={() => {
                      const award = aotyResult.data;
                      const gameData = {
                        id: aotyResult.year,
                        name: award.winner,
                        rating: 9.0,
                        genre: award.genre || "Action",
                        playtime: award.playtime || "20-40h",
                        year: aotyResult.year,
                        img: award.img,
                        developer: award.developer || "Various",
                        description: award.description || `${award.winner} ist das Spiel des Jahres ${aotyResult.year}.`,
                        platforms: ["PC", "Console"],
                        steamId: award.steamId,
                        finalRating: 9.0,
                        finalImg: award.img
                      };
                      openGameDetail(gameData);
                    }}>
                      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                        <FaTrophy style={{ color: currentColors.primary, fontSize: 22 }} />
                        <div>
                          <div style={{ fontSize: 10, color: currentColors.primary }}>🏆 {text.winner}</div>
                          <div style={{ fontSize: 18, fontWeight: 700 }}>{aotyResult.data.winner}</div>
                        </div>
                      </div>
                    </div>
                    <div style={{ marginTop: 16 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>📋 {text.nominees}</div>
                      {aotyResult.data.nominees?.map((nominee, idx) => (
                        <div key={idx} style={{ ...styles.aotyWinnerCard, opacity: 0.8, marginBottom: 8 }} onClick={() => {
                          const nomineeGame = MANUAL_GAMES.find(g => g.name === nominee) || { name: nominee, genre: "Unknown", year: aotyResult.year, img: "https://placehold.co/300x400" };
                          const gameData = {
                            id: `nominee-${idx}`,
                            name: nominee,
                            rating: 8.5,
                            genre: nomineeGame.genre || "Action",
                            playtime: "20-40h",
                            year: aotyResult.year,
                            img: nomineeGame.img || "https://placehold.co/300x400",
                            developer: "Various",
                            description: `${nominee} war nominiert für das Spiel des Jahres ${aotyResult.year}.`,
                            platforms: ["PC", "Console"],
                            finalRating: 8.5,
                            finalImg: nomineeGame.img || "https://placehold.co/300x400"
                          };
                          openGameDetail(gameData);
                        }}>
                          <div style={{ fontSize: 14 }}>{idx + 1}.</div>
                          <div><div style={{ fontSize: 13 }}>{nominee}</div></div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div style={styles.grid}>
                    {Object.keys(AOTY_DATA).sort((a,b) => b - a).map(year => (
                      <div key={year} className="aoty-year-card" style={styles.aotyYearCard} onClick={() => setSelectedAotyYear(parseInt(year))}>
                        <div style={{ fontWeight: 700, fontSize: 18, color: currentColors.primary }}>{year}</div>
                        <img src={AOTY_DATA[year].img} style={{ width: "100%", borderRadius: 12, marginTop: 8 }} alt={AOTY_DATA[year].winner} />
                        <div style={{ fontSize: 11, marginTop: 8 }}>🏆 {AOTY_DATA[year].winner}</div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* RANDOM TAB */}
        {currentTab === "random" && (
          <div className="fade-in">
            <div style={styles.randomFilterSection}>
              <div style={styles.randomFilterTitle}><FaRandom size={12} /> {text.randomGame}</div>
              <div style={styles.randomFilterRow}>
                <label className="btn-click" style={styles.randomCheckbox}><input type="checkbox" checked={randomExcludeHorror} onChange={e => setRandomExcludeHorror(e.target.checked)} /> Horror ausschließen</label>
                <label className="btn-click" style={styles.randomCheckbox}><input type="checkbox" checked={randomExcludeIndie} onChange={e => setRandomExcludeIndie(e.target.checked)} /> Indie ausschließen</label>
                <label className="btn-click" style={styles.randomCheckbox}><input type="checkbox" checked={randomExcludeOld} onChange={e => setRandomExcludeOld(e.target.checked)} /> Vor 2015 ausschließen</label>
              </div>
              <div style={styles.randomFilterRow}>
                <select className="btn-click" value={randomYear} onChange={e => setRandomYear(e.target.value)} style={styles.randomSelect}>
                  <option value="all">{text.allYears}</option>
                  {YEARS.map(year => (<option key={year} value={year}>{year}</option>))}
                </select>
                <select className="btn-click" value={randomSelectedGenre} onChange={e => setRandomSelectedGenre(e.target.value)} style={styles.randomSelect}>
                  <option value="all">Alle Genres</option>
                  {GENRES.map(g => (<option key={g} value={g}>{g}</option>))}
                </select>
                <select className="btn-click" value={randomSelectedMood} onChange={e => setRandomSelectedMood(e.target.value)} style={styles.randomSelect}>
                  <option value="all">Alle Moods</option>
                  {MOODS.map(m => (<option key={m} value={m}>{m}</option>))}
                </select>
                <select className="btn-click" value={randomMode} onChange={e => setRandomMode(e.target.value)} style={styles.randomSelect}>
                  <option value="full">Voll Random</option><option value="genre">Nach Genre</option><option value="mood">Nach Stimmung</option>
                </select>
                <button className="btn-click" style={styles.loginBtn} onClick={doRandom}><FaRandom size={11} /> {text.randomGame}</button>
                <button className="btn-click" style={{ ...styles.loginBtn, background: colors.success }} onClick={doGameRoulette}><FaDiceD6 size={11} /> Roulette (3)</button>
              </div>
              <div style={{ marginTop: 10 }}><span style={{ fontSize: 11 }}>Min. Bewertung: {randomMinRating}</span><input type="range" min="0" max="10" step="0.5" value={randomMinRating} onChange={e => setRandomMinRating(parseFloat(e.target.value))} style={styles.randomSlider} /></div>
            </div>

            {showRoulette && rouletteResult.length > 0 && (
              <div className="fade-in" style={{ marginBottom: 16, background: currentColors.bgCard, borderRadius: 16, padding: 14 }}>
                <div style={styles.sectionTitle}>🎲 {text.rouletteResult}</div>
                <div style={styles.grid}>{rouletteResult.map(game => <GameCard key={game.id} game={game} showBtn={true} />)}</div>
                <button className="btn-click" style={styles.modalBtnSecondary} onClick={() => setShowRoulette(false)}>{text.close}</button>
              </div>
            )}

            <div style={styles.gameNightCard}>
              <div style={styles.randomFilterTitle}><GiSpinningWheel size={12} /> {text.gameNightMode}</div>
              <div style={{ marginBottom: 12 }}><label className="btn-click" style={styles.randomCheckbox}><input type="checkbox" checked={gameNightFilters.excludeMultiplayer} onChange={e => setGameNightFilters({ ...gameNightFilters, excludeMultiplayer: e.target.checked })} /> {text.excludeMultiplayer}</label></div>
              <div style={{ marginBottom: 12 }}><div style={{ fontSize: 11, color: currentColors.textSecondary, marginBottom: 3 }}>Min. Bewertung: {gameNightFilters.minRating}</div><input type="range" min="0" max="10" step="0.5" value={gameNightFilters.minRating} onChange={e => setGameNightFilters({ ...gameNightFilters, minRating: parseFloat(e.target.value) })} style={styles.randomSlider} /></div>
              <div style={{ marginBottom: 12 }}><input type="number" placeholder="Max. Spielzeit (Stunden)" style={styles.input} value={gameNightFilters.maxPlaytime} onChange={e => setGameNightFilters({ ...gameNightFilters, maxPlaytime: e.target.value })} /></div>
              <div style={styles.wheelContainer}><div className={spinning ? "spinning-wheel" : ""} style={styles.wheel} onClick={spinGameNight}><div style={styles.wheelInner}><GiSpinningWheel size={22} /></div></div></div>
              <button className="btn-click" style={styles.loginBtn} onClick={spinGameNight} disabled={spinning}>{spinning ? "🎲 Spinning..." : <>🎲 {text.spinWheel}</>}</button>
              {spinResult && !spinning && (<div style={{ marginTop: 16, textAlign: "center", animation: "fadeIn 0.5s ease-out" }}><div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10, color: currentColors.primary }}>🎉 {text.gameNightMode} Pick!</div><GameCard game={spinResult} showBtn={true} /></div>)}
            </div>
          </div>
        )}

        {/* PLAYLISTS TAB */}
        {currentTab === "playlists" && (
          <div className="fade-in">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}><div style={styles.sectionTitle}><FaList size={12} /> {text.playlists}</div><button className="btn-click" style={styles.loginBtn} onClick={() => setShowCreatePlaylist(true)}><FaPlusCircle size={11} /> {text.createPlaylist}</button></div>
            {playlists.length === 0 ? <div style={styles.emptyState}>Noch keine Playlists. Erstelle deine erste!</div> : playlists.map(playlist => (<div key={playlist.id} style={styles.playlistCard}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}><div style={{ fontWeight: 700, fontSize: 14 }}>{playlist.name}</div><button className="btn-click" style={{ background: "rgba(255,255,255,0.05)", border: "none", borderRadius: 8, padding: "3px 10px", color: currentColors.textSecondary, cursor: "pointer", fontSize: 10 }} onClick={() => deletePlaylist(playlist.id)}><FaTrashAlt size={9} /> Löschen</button></div><div style={styles.grid}>{playlist.games.slice(0, 6).map(game => <GameCard key={game.id} game={game} showBtn={false} />)}</div>{playlist.games.length > 6 && <div style={{ textAlign: "center", marginTop: 10, fontSize: 10 }}>+{playlist.games.length - 6} weitere</div>}</div>))}
          </div>
        )}

        {/* ACHIEVEMENTS TAB */}
        {currentTab === "achievements" && (
          <div className="fade-in">
            <div style={styles.sectionTitle}><GiAchievement size={16} /> {text.achievementsTitle} ({unlockedCount}/{achievements.length})</div>
            <div style={{ marginBottom: 16, background: currentColors.bgCard, borderRadius: 12, padding: 12 }}>
              <div style={{ fontWeight: 600, marginBottom: 5, fontSize: 12 }}>Fortschritt: {Math.round((unlockedCount / achievements.length) * 100)}%</div>
              <div style={styles.progressBar}><div style={{ ...styles.progressFill, width: `${(unlockedCount / achievements.length) * 100}%` }}></div></div>
            </div>
            {achievements.map(ach => (
              <div key={ach.id} className="fade-in" style={{ ...styles.achievementCard, opacity: ach.unlocked ? 1 : 0.6, cursor: "pointer" }} onClick={() => setSelectedAchievement(ach)}>
                <div style={styles.achievementIcon}>{ach.icon}</div>
                <div style={styles.achievementInfo}>
                  <div style={styles.achievementName}>{ach.name}</div>
                  <div style={styles.achievementDesc}>{ach.unlocked ? "✅ " + ach.description : "🔒 " + (ach.secret ? text.secret : ach.description)}</div>
                  {ach.secret && !ach.unlocked && <div style={{ fontSize: 9, color: colors.warning, marginTop: 2 }}>{text.clickToSee}</div>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* GAMIFICATION TAB */}
        {currentTab === "gamification" && (
          <div className="fade-in">
            <div style={styles.sectionTitle}><FaBolt size={16} /> {text.gamification}</div>
            <div style={styles.statsRow}>
              <div style={styles.statCard}><div style={styles.statNumber}>{userLevel}</div><div>{text.level}</div></div>
              <div style={styles.statCard}><div style={styles.statNumber}>{userXP}</div><div>{text.xp}</div></div>
              <div style={styles.statCard}><div style={styles.statNumber}>{unlockedCount}</div><div>{text.achievementsTitle}</div></div>
            </div>
            <div style={{ marginBottom: 16, background: currentColors.bgCard, borderRadius: 12, padding: 12 }}>
              <div style={{ fontWeight: 600, marginBottom: 5, fontSize: 12 }}>XP Fortschritt zu Level {userLevel + 1}</div>
              <div style={styles.progressBar}><div style={{ ...styles.progressFill, width: `${(userXP % 1000) / 10}%` }}></div></div>
            </div>
            <div style={styles.sectionTitle}><FaCalendarCheck size={14} /> {text.dailyChallenges}</div>
            {dailyChallenges.map(challenge => (
              <div key={challenge.id} style={{ ...styles.achievementCard, background: challenge.completed ? `${colors.success}20` : `${currentColors.primary}10` }}>
                <div style={styles.achievementIcon}>🎯</div>
                <div style={styles.achievementInfo}>
                  <div style={styles.achievementName}>{challenge.name}</div>
                  <div style={styles.achievementDesc}>{challenge.description} (+{challenge.reward} XP)</div>
                  {!challenge.completed && <div style={styles.progressBar}><div style={{ ...styles.progressFill, width: `${(challenge.progress / challenge.target) * 100}%` }}></div></div>}
                </div>
                {!challenge.completed ? <button className="btn-click" style={styles.modalBtnSecondary}>In Bearbeitung</button> : <span style={{ color: colors.success, fontSize: 11 }}>✅ {text.completed}</span>}
              </div>
            ))}
          </div>
        )}

        {/* NEWS TAB */}
        {currentTab === "news" && (
          <div className="fade-in">
            <div style={styles.sectionTitle}><FaNewspaper size={16} /> {text.news}</div>
            {loadingNews ? (
              <div style={{ textAlign: "center", padding: 30 }}><div style={styles.loadingSpinner}></div></div>
            ) : news.length === 0 ? (
              <div style={styles.emptyState}>Keine News verfügbar. API-Key für GNews.io erforderlich.</div>
            ) : (
              news.map((article, idx) => (
                <div key={idx} style={styles.newsCard}>
                  {article.image && <img src={article.image} style={{ width: "100%", height: 140, objectFit: "cover", borderRadius: 12, marginBottom: 10 }} alt={article.title} />}
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{article.title}</div>
                  <div style={{ fontSize: 11, color: currentColors.textSecondary, marginBottom: 6 }}>{article.description?.substring(0, 100)}...</div>
                  <a href={article.url} target="_blank" rel="noopener noreferrer" style={{ color: currentColors.primary, textDecoration: "none", fontSize: 10 }}>{text.readMore} →</a>
                </div>
              ))
            )}
          </div>
        )}

        {/* SUPPORT TAB */}
        {currentTab === "support" && (
          <div className="fade-in">
            <div style={styles.supportCard}>
              <div style={{ fontSize: 36, marginBottom: 16 }}>☕</div>
              <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, color: currentColors.primary }}>{text.supportMessage}</div>
              <p style={{ fontSize: 12, marginBottom: 16, color: currentColors.textSecondary }}>Mit deiner Unterstützung kann NexPlay weiter wachsen und noch mehr Features bekommen! 🚀</p>
              <a href="https://ko-fi.com/sherlock10k" target="_blank" rel="noopener noreferrer" style={{ background: "#ff5e5e", border: "none", borderRadius: 14, padding: "10px 20px", fontSize: 13, fontWeight: 700, color: "#fff", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8, transition: "all 0.2s ease", textDecoration: "none" }}>
                <SiKofi size={16} /> {text.becomePatron}
              </a>
              <div style={{ marginTop: 20, fontSize: 11, color: currentColors.textSecondary }}>
                <p>💪 Als Unterstützer bekommst du:</p>
                <ul style={{ textAlign: "left", display: "inline-block", marginTop: 8 }}>
                  <li>✓ Unbegrenzte KI-Chats</li>
                  <li>✓ Exklusive Badges & Achievements</li>
                  <li>✓ Früher Zugang zu neuen Features</li>
                  <li>✓ Dein Name in den Credits</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* COMPARE TAB */}
        {currentTab === "compare" && (
          <div className="fade-in">
            <div style={styles.sectionTitle}><FaBalanceScale size={14} /> {text.compareGames}</div>
            <div style={styles.compareCard}>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
                <select className="btn-click" style={{ ...styles.select, flex: 1, padding: "8px", fontSize: 12 }} value={compareGames[0]?.id || ""} onChange={e => { const game = [...gamesWithData, ...MANUAL_GAMES, ...MANUAL_HIDDEN_GEMS].find(g => g.id === parseInt(e.target.value)); setCompareGames([game, compareGames[1]]); }}>
                  <option value="">{text.selectGame} 1</option>
                  {[...gamesWithData, ...MANUAL_GAMES, ...MANUAL_HIDDEN_GEMS].slice(0, 50).map(g => <option key={g.id} value={g.id}>{g.name} ({g.year}) - ★{g.finalRating?.toFixed(1)}</option>)}
                </select>
                <div style={{ fontSize: 20, color: currentColors.primary, alignSelf: "center", fontWeight: 700 }}>VS</div>
                <select className="btn-click" style={{ ...styles.select, flex: 1, padding: "8px", fontSize: 12 }} value={compareGames[1]?.id || ""} onChange={e => { const game = [...gamesWithData, ...MANUAL_GAMES, ...MANUAL_HIDDEN_GEMS].find(g => g.id === parseInt(e.target.value)); setCompareGames([compareGames[0], game]); }}>
                  <option value="">{text.selectGame} 2</option>
                  {[...gamesWithData, ...MANUAL_GAMES, ...MANUAL_HIDDEN_GEMS].slice(0, 50).map(g => <option key={g.id} value={g.id}>{g.name} ({g.year}) - ★{g.finalRating?.toFixed(1)}</option>)}
                </select>
              </div>
              {compareGames[0] && compareGames[1] && (<div><div style={styles.compareGrid}><div style={styles.compareColumn}><div style={styles.compareHeader}><img src={compareGames[0].finalImg || compareGames[0].img} style={{ width: 70, height: 93, objectFit: "cover", borderRadius: 10, marginBottom: 10 }} alt={compareGames[0].name} /><div style={{ fontSize: 14 }}>{compareGames[0].name}</div><div style={{ fontSize: 12, color: currentColors.primary, marginTop: 3 }}>★ {compareGames[0].finalRating?.toFixed(1)}</div></div><div style={styles.compareRow}><span style={styles.compareLabel}>{text.year}</span><span style={styles.compareValue}>{compareGames[0].year}</span></div><div style={styles.compareRow}><span style={styles.compareLabel}>{text.genre}</span><span style={styles.compareValue}>{compareGames[0].genre}</span></div><div style={styles.compareRow}><span style={styles.compareLabel}>{text.playtime}</span><span style={styles.compareValue}>{compareGames[0].playtime}</span></div><div style={styles.compareRow}><span style={styles.compareLabel}>Developer</span><span style={styles.compareValue}>{compareGames[0].developer}</span></div></div><div style={styles.compareColumn}><div style={styles.compareHeader}><img src={compareGames[1].finalImg || compareGames[1].img} style={{ width: 70, height: 93, objectFit: "cover", borderRadius: 10, marginBottom: 10 }} alt={compareGames[1].name} /><div style={{ fontSize: 14 }}>{compareGames[1].name}</div><div style={{ fontSize: 12, color: currentColors.primary, marginTop: 3 }}>★ {compareGames[1].finalRating?.toFixed(1)}</div></div><div style={styles.compareRow}><span style={styles.compareLabel}>{text.year}</span><span style={styles.compareValue}>{compareGames[1].year}</span></div><div style={styles.compareRow}><span style={styles.compareLabel}>{text.genre}</span><span style={styles.compareValue}>{compareGames[1].genre}</span></div><div style={styles.compareRow}><span style={styles.compareLabel}>{text.playtime}</span><span style={styles.compareValue}>{compareGames[1].playtime}</span></div><div style={styles.compareRow}><span style={styles.compareLabel}>Developer</span><span style={styles.compareValue}>{compareGames[1].developer}</span></div></div></div><div style={{ marginTop: 20, padding: 12, background: "rgba(0,0,0,0.2)", borderRadius: 14, textAlign: "center" }}><div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>🏆 {text.winner}</div><div style={{ fontSize: 20, fontWeight: 800, color: currentColors.primary }}>{compareGames[0].finalRating > compareGames[1].finalRating ? compareGames[0].name : compareGames[1].finalRating > compareGames[0].finalRating ? compareGames[1].name : "Unentschieden!"}</div></div></div>)}
            </div>
          </div>
        )}
      </div>

      {/* MODALS */}
      {showEditModal && user && (<div className="fade-in" style={styles.modalOverlay} onClick={() => setShowEditModal(false)}><div className="slide-in" style={styles.modalContent} onClick={e => e.stopPropagation()}><div style={styles.modalTitle}>{text.editProfile}</div>{editError && <div style={styles.errorText}>{editError}</div>}{editSuccess && <div style={styles.successText}>{editSuccess}</div>}<input style={styles.input} placeholder={text.username} value={editUsername} onChange={e => setEditUsername(e.target.value)} /><textarea style={styles.textarea} placeholder={text.bio} rows="2" value={editBio} onChange={e => setEditBio(e.target.value)} /><label className="btn-click" style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 12, marginBottom: 10 }}><input type="checkbox" checked={editPrivate} onChange={e => setEditPrivate(e.target.checked)} /> {text.private}</label><div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid rgba(255,255,255,0.1)` }}><div style={{ fontWeight: 600, marginBottom: 10, fontSize: 12 }}><FaSteam /> {text.steamConnect}</div><div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 8 }}><input type="text" placeholder={text.steamId} value={steamIdInput} onChange={e => setSteamIdInput(e.target.value)} style={{ ...styles.input, marginBottom: 0, flex: 1 }} /><button className="btn-click" style={{ background: colors.steam, border: "none", borderRadius: 10, padding: "6px 12px", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 11 }} onClick={handleSteamLogin} disabled={syncingPlatform === "steam"}><FaSteam size={10} /> {syncingPlatform === "steam" ? "Importiere..." : text.importGames}</button></div><div style={{ fontSize: 10, color: currentColors.textSecondary }}>🔍 {text.findSteamId}: <a href="https://steamidfinder.com/" target="_blank" rel="noreferrer" style={{ color: currentColors.primary }}>steamidfinder.com</a></div></div><button className="btn-click" style={styles.modalBtn} onClick={handleUpdateProfile}>{text.save}</button></div></div>)}
      {selectedAchievement && (<div className="fade-in" style={styles.modalOverlay} onClick={() => setSelectedAchievement(null)}><div className="slide-in" style={styles.modalContent} onClick={e => e.stopPropagation()}><div style={styles.modalTitle}>{selectedAchievement.name}</div><div style={{ fontSize: 36, textAlign: "center", marginBottom: 10 }}>{selectedAchievement.icon}</div><div style={{ fontSize: 13, marginBottom: 8, textAlign: "center" }}>{selectedAchievement.description}</div><div style={{ fontSize: 11, color: currentColors.textSecondary, textAlign: "center" }}>🎯 Aufgabe: {selectedAchievement.requirement}</div><div style={{ fontSize: 10, color: colors.success, textAlign: "center", marginTop: 8 }}>🏆 Belohnung: +{selectedAchievement.reward} XP</div>{selectedAchievement.secret && !selectedAchievement.unlocked && <div style={{ fontSize: 10, color: colors.warning, textAlign: "center", marginTop: 8 }}>🔒 {text.secret} - Die Aufgabe wird enthüllt, wenn du sie erfüllst!</div>}<button className="btn-click" style={styles.modalBtn} onClick={() => setSelectedAchievement(null)}>{text.close}</button></div></div>)}
      {showCreatePlaylist && (<div className="fade-in" style={styles.modalOverlay} onClick={() => setShowCreatePlaylist(false)}><div className="slide-in" style={styles.modalContent} onClick={e => e.stopPropagation()}><div style={styles.modalTitle}>{text.createPlaylist}</div><input style={styles.input} placeholder={text.playlistName} value={newPlaylistName} onChange={e => setNewPlaylistName(e.target.value)} /><button className="btn-click" style={styles.modalBtn} onClick={createPlaylist}>{text.createPlaylist}</button></div></div>)}
      {showSettings && (<div className="fade-in" style={styles.modalOverlay} onClick={() => setShowSettings(false)}><div className="slide-in" style={styles.modalContent} onClick={e => e.stopPropagation()}><div style={styles.modalTitle}>{text.settings} ⚙️</div><div style={styles.settingsSection}><div style={styles.settingsRow}><span style={styles.settingsLabel}>{text.sound}:</span><button className="btn-click" style={styles.iconBtn} onClick={() => setSoundEnabled(!soundEnabled)}>{soundEnabled ? <FaVolumeUp size={11} /> : <FaVolumeMute size={11} />} {soundEnabled ? "ON" : "OFF"}</button></div><div style={styles.settingsRow}><span style={styles.settingsLabel}>{text.language}:</span><button className="btn-click" style={styles.iconBtn} onClick={() => setLang(lang === "en" ? "de" : "en")}><FaLanguage size={11} /> {lang === "en" ? "DE" : "EN"}</button></div><div style={styles.settingsRow}><span style={styles.settingsLabel}>{text.theme}:</span><div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}><button className="btn-click" style={{ ...styles.iconBtn, background: theme === "dark" ? currentColors.primary : "rgba(255,255,255,0.08)", padding: "5px 10px", fontSize: 11 }} onClick={() => { setTheme("dark"); setThemeChangeCount(prev => prev + 1); updateAchievements(); }}><FaMoon size={10} /> {text.dark}</button><button className="btn-click" style={{ ...styles.iconBtn, background: theme === "light" ? currentColors.primary : "rgba(255,255,255,0.08)", padding: "5px 10px", fontSize: 11 }} onClick={() => { setTheme("light"); setThemeChangeCount(prev => prev + 1); updateAchievements(); }}><FaSun size={10} /> {text.light}</button><button className="btn-click" style={{ ...styles.iconBtn, background: theme === "auto" ? currentColors.primary : "rgba(255,255,255,0.08)", padding: "5px 10px", fontSize: 11 }} onClick={() => { setTheme("auto"); setThemeChangeCount(prev => prev + 1); updateAchievements(); }}><FaAdjust size={10} /> {text.auto}</button></div></div><div style={styles.settingsRow}><span style={styles.settingsLabel}>Akzent-Farbe:</span><input type="color" value={accentColor} onChange={e => setAccentColor(e.target.value)} style={{ width: 35, height: 35, borderRadius: 8, cursor: "pointer", background: currentColors.bgCard, border: `1px solid ${currentColors.primary}30` }} /></div><div style={styles.settingsRow}><span style={styles.settingsLabel}>{text.notifications}:</span><button className="btn-click" style={styles.iconBtn} onClick={() => setNotificationsEnabled(!notificationsEnabled)}>{notificationsEnabled ? "🔔 ON" : "🔕 OFF"}</button></div><div style={styles.settingsRow}><span style={styles.settingsLabel}>{text.autoSave}:</span><button className="btn-click" style={styles.iconBtn} onClick={() => setAutoSave(!autoSave)}>{autoSave ? "✅ ON" : "❌ OFF"}</button></div><div style={styles.settingsRow}><span style={styles.settingsLabel}>{text.compactView}:</span><button className="btn-click" style={styles.iconBtn} onClick={() => setCompactView(!compactView)}>{compactView ? "📐 ON" : "📏 OFF"}</button></div><div style={styles.settingsRow}><span style={styles.settingsLabel}>{text.highContrast}:</span><button className="btn-click" style={styles.iconBtn} onClick={() => setHighContrast(!highContrast)}>{highContrast ? "🔆 ON" : "🔅 OFF"}</button></div></div><button className="btn-click" style={styles.modalBtn} onClick={() => setShowSettings(false)}>{text.close}</button></div></div>)}
      {showRandomModal && randomGame && (<div className="fade-in" style={styles.modalOverlay} onClick={() => setShowRandomModal(false)}><div className="slide-in" style={styles.modalContent} onClick={e => e.stopPropagation()}><div style={styles.modalTitle}>🎲 {text.randomGame}</div><img src={randomGame.finalImg || randomGame.img} style={{ width: "100%", borderRadius: 16, marginBottom: 14 }} alt={randomGame.name} /><div style={{ fontSize: 16, fontWeight: 700, textAlign: "center", marginBottom: 6 }}>{randomGame.name}</div><div style={{ fontSize: 12, color: currentColors.primary, textAlign: "center", marginBottom: 10 }}>★ {(randomGame.finalRating || randomGame.rating)?.toFixed(1)} · {randomGame.playtime} · {randomGame.year}</div><div style={{ fontSize: 11, marginBottom: 16, color: currentColors.textSecondary, textAlign: "center", maxHeight: 100, overflow: "auto" }}>{(randomGame.finalDescription || generateLongDescription(randomGame.name, "")).slice(0, 150)}...</div><div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}><button className="btn-click" style={{ ...styles.addBtn, width: "auto", padding: "6px 16px", fontSize: 12 }} onClick={() => { addToLibrary(randomGame); setShowRandomModal(false); }}>+ {text.add}</button><button className="btn-click" style={styles.modalBtnSecondary} onClick={doRandom}>{text.rollAgain}</button></div></div></div>)}
      {showLoginModal && (<div className="fade-in" style={styles.modalOverlay} onClick={() => setShowLoginModal(false)}><div className="slide-in" style={styles.modalContent} onClick={e => e.stopPropagation()}><div style={styles.modalTitle}>{isLogin ? text.login : text.register}</div>{errorMsg && <div style={styles.errorText}>{errorMsg}</div>}<input style={styles.input} type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} /><div style={{ position: "relative", width: "100%" }}><input style={styles.input} type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} /><span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", cursor: "pointer", color: currentColors.textSecondary }} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <FaEyeSlash size={12} /> : <FaEye size={12} />}</span></div><button className="btn-click" style={styles.modalBtn} onClick={isLogin ? handleLogin : handleRegister}>{isLogin ? text.login : text.register}</button><div style={styles.switchText} onClick={() => { setIsLogin(!isLogin); setErrorMsg(""); }}>{isLogin ? "Kein Account? Registrieren" : "Bereits einen Account? Login"}</div></div></div>)}
      {loadingAction && (<div style={styles.loadingOverlay}><div style={styles.loadingSpinner}></div><div style={{ marginTop: 12, color: currentColors.text, fontSize: 12 }}>{text.loading}</div></div>)}
    </div>
  );
}