import { useState, useEffect, useMemo } from "react";
import { FaHome, FaUser, FaFire, FaSearch, FaHeart, FaStar, FaTrash, FaSignOutAlt, FaPlus, FaCheck, FaEnvelope, FaEye, FaEyeSlash, FaEdit, FaUsers, FaClock, FaRandom, FaThumbsUp, FaThumbsDown, FaArrowLeft, FaCog, FaVolumeUp, FaVolumeMute, FaLanguage, FaSteam, FaPlaystation, FaGamepad, FaTrophy, FaGem, FaShoppingCart, FaRobot, FaFilter, FaLink, FaExternalLinkAlt, FaDonate, FaAward, FaList } from "react-icons/fa";
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
const GENRES = ["Action", "Adventure", "RPG", "Indie", "Horror", "Strategy", "Puzzle", "Open World", "Story Rich", "Fighting", "Sports", "Racing", "Simulation"];
const PLAYTIMES = ["Under 10h", "10-20h", "20-40h", "40-60h", "60-100h", "100h+"];

const GOTY_DATA = {
  2014: { winner: "Dragon Age: Inquisition", nominees: ["Dark Souls II", "Hearthstone", "Middle-earth: Shadow of Mordor", "Destiny"] },
  2015: { winner: "The Witcher 3: Wild Hunt", nominees: ["Bloodborne", "Fallout 4", "Metal Gear Solid V", "Super Mario Maker"] },
  2016: { winner: "Overwatch", nominees: ["Doom", "Inside", "Titanfall 2", "Uncharted 4"] },
  2017: { winner: "The Legend of Zelda: Breath of the Wild", nominees: ["Horizon Zero Dawn", "Persona 5", "Super Mario Odyssey", "PlayerUnknown's Battlegrounds"] },
  2018: { winner: "God of War", nominees: ["Red Dead Redemption 2", "Marvel's Spider-Man", "Celeste", "Monster Hunter: World"] },
  2019: { winner: "Sekiro: Shadows Die Twice", nominees: ["Control", "Death Stranding", "Resident Evil 2", "Super Smash Bros. Ultimate"] },
  2020: { winner: "The Last of Us Part II", nominees: ["Hades", "Ghost of Tsushima", "Doom Eternal", "Final Fantasy VII Remake"] },
  2021: { winner: "It Takes Two", nominees: ["Deathloop", "Metroid Dread", "Psychonauts 2", "Resident Evil Village"] },
  2022: { winner: "Elden Ring", nominees: ["God of War Ragnarök", "Horizon Forbidden West", "Stray", "Xenoblade Chronicles 3"] },
  2023: { winner: "Baldur's Gate 3", nominees: ["Alan Wake 2", "Marvel's Spider-Man 2", "Resident Evil 4", "The Legend of Zelda: Tears of the Kingdom"] },
  2024: { winner: "Astro Bot", nominees: ["Final Fantasy VII Rebirth", "Metaphor: ReFantazio", "Black Myth: Wukong", "Elden Ring: Shadow of the Erdtree"] }
};

const translations = {
  en: { 
    home: "Discover", library: "Library", profile: "Profile", friends: "Friends", ai: "AI Assistant",
    login: "Login", register: "Register", logout: "Logout", search: "Search games...", searchGOTY: "Search by year or game name...",
    mood: "What's your mood?", genre: "Pick your genres", playtime: "How long?", 
    next: "Next", results: "Show Results", topPicks: "Top Picks", bestEver: "Best Ever", allResults: "All Results", hiddenGems: "Hidden Gems",
    sort: "Sort", bestMatch: "Best Match", rating: "Rating", year: "Year", 
    add: "Add to Library", inLibrary: "In Library", reviews: "Reviews", played: "Played", 
    remove: "Remove", editProfile: "Edit Profile", username: "Username", bio: "Bio", 
    private: "Private profile", save: "Save", achievements: "Achievements", 
    firstGame: "First Game", collector: "Collector", completionist: "Completionist", 
    recentlyPlayed: "Recently Played", favorites: "Favorites", total: "Total", 
    playing: "Playing", completed: "Completed", randomGame: "Random Game", 
    rollAgain: "Roll Again", close: "Close", back: "Back", buyOn: "Buy on", 
    writeReview: "Write Review", yourReview: "Your review...", submit: "Submit", 
    noReviews: "No reviews yet", findFriends: "Find Friends", settings: "Settings", 
    sound: "Sound Effects", language: "Language", steamId: "Steam ID", 
    importGames: "Import Steam Games", findSteamId: "How to find your Steam ID",
    donate: "Support the developer", topRated: "Top Rated Game", topGenre: "Top Genre",
    totalPlaytime: "Total Playtime", gotyWinner: "Game of the Year Winner", gotyNominees: "Nominees",
    winner: "WINNER", nominee: "Nominee", playerFavorites: "Player Favorites",
    backToGOTY: "Back to GOTY Overview", goty: "GOTY", top20: "Top 20 by Genre",
    findYourGame: "Find Your Game"
  },
  de: { 
    home: "Entdecken", library: "Bibliothek", profile: "Profil", friends: "Freunde", ai: "KI-Assistent",
    login: "Anmelden", register: "Registrieren", logout: "Abmelden", search: "Spiele suchen...", searchGOTY: "Suche nach Jahr oder Spielname...",
    mood: "Wie ist deine Stimmung?", genre: "Wähle deine Genres", playtime: "Wie lange?", 
    next: "Weiter", results: "Ergebnisse", topPicks: "Top Empfehlungen", bestEver: "Beste Aller Zeiten", allResults: "Alle Ergebnisse", hiddenGems: "Geheimtipps",
    sort: "Sortieren", bestMatch: "Bester Treffer", rating: "Bewertung", year: "Jahr", 
    add: "Zur Bibliothek", inLibrary: "In Bibliothek", reviews: "Bewertungen", played: "Gespielt", 
    remove: "Entfernen", editProfile: "Profil bearbeiten", username: "Benutzername", bio: "Über mich", 
    private: "Privates Profil", save: "Speichern", achievements: "Erfolge", 
    firstGame: "Erstes Spiel", collector: "Sammler", completionist: "Vollender", 
    recentlyPlayed: "Zuletzt gespielt", favorites: "Favoriten", total: "Gesamt", 
    playing: "Spielt", completed: "Abgeschlossen", randomGame: "Zufälliges Spiel", 
    rollAgain: "Nochmal", close: "Schließen", back: "Zurück", buyOn: "Kaufen auf", 
    writeReview: "Bewertung schreiben", yourReview: "Deine Bewertung...", submit: "Speichern", 
    noReviews: "Keine Bewertungen", findFriends: "Freunde finden", settings: "Einstellungen", 
    sound: "Soundeffekte", language: "Sprache", steamId: "Steam ID", 
    importGames: "Steam Spiele importieren", findSteamId: "So findest du deine Steam ID",
    donate: "Unterstütze den Entwickler", topRated: "Bestbewertetes Spiel", topGenre: "Top Genre",
    totalPlaytime: "Spielzeit Gesamt", gotyWinner: "Spiel des Jahres Gewinner", gotyNominees: "Nominiert",
    winner: "GEWINNER", nominee: "Nominiert", playerFavorites: "Spieler-Favoriten",
    backToGOTY: "Zurück zur GOTY Übersicht", goty: "GOTY", top20: "Top 20 pro Genre",
    findYourGame: "Finde dein Spiel"
  }
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

// RATING-KONTROLLSYSTEM
const checkAndFixRatings = (game, steamData) => {
  let rating = game.rawgRating || 7.0;
  const name = game.name?.toLowerCase() || "";
  
  // Spezifische Korrekturen für überschätzte Klassiker
  if (name.includes("goldeneye") && name.includes("007")) rating = 8.5;
  if (name.includes("perfect dark")) rating = 8.3;
  if (name.includes("metroid prime") && !name.includes("remastered")) rating = 9.0;
  if (name.includes("ocarina of time")) rating = 9.0;
  if (name.includes("majora's mask")) rating = 8.8;
  if (name.includes("super mario 64")) rating = 8.8;
  
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
  if (name.includes("call of duty") && !name.includes("modern warfare 2")) weightedRating = Math.min(weightedRating, 7.8);
  
  // BUFFER für gute Games
  if (weightedRating >= 8.5 && weightedRating < 9.0) weightedRating += 0.2;
  if (weightedRating >= 9.0 && weightedRating < 9.3) weightedRating += 0.15;
  
  if (name.includes("witcher 3") || name.includes("baldur's gate 3") || name.includes("elden ring") || name.includes("red dead redemption 2")) {
    weightedRating = Math.max(weightedRating, 9.3);
    weightedRating = Math.min(weightedRating, 9.7);
  } else if (name.includes("god of war") || name.includes("the last of us")) {
    weightedRating = Math.max(weightedRating, 9.2);
    weightedRating = Math.min(weightedRating, 9.5);
  } else if (name.includes("zelda") || name.includes("mario")) {
    weightedRating = Math.max(weightedRating, 9.0);
    weightedRating = Math.min(weightedRating, 9.3);
  } else {
    weightedRating = Math.min(weightedRating, 9.2);
  }
  
  weightedRating = Math.round(weightedRating * 10) / 10;
  weightedRating = Math.max(weightedRating, 6.0);
  return weightedRating;
};

const generateLongDescription = (gameName, rawDescription) => {
  if (rawDescription && rawDescription.length > 200) return rawDescription;
  const templates = [
    `${gameName} ist ein Meisterwerk der Videospielgeschichte, das Spieler seit Jahren begeistert. Die Entwickler haben unglaubliche Arbeit in jedes Detail gesteckt, von der Grafik bis zum Sounddesign. Die Spielmechanik ist intuitiv und dennoch tiefgründig genug, um auch erfahrene Spieler herauszufordern. Die Geschichte fesselt von der ersten Minute an und lässt dich nicht mehr los. Besonders die Charaktere und ihre Entwicklung bleiben noch lange im Gedächtnis. Ein absolutes Muss für jeden Fan des Genres!`,
    `Erlebe ein unvergessliches Abenteuer mit ${gameName}. Dieses Spiel bietet eine packende Story, die dich in eine faszinierende Welt entführt. Die Grafik ist atemberaubend und die Soundkulisse unterstreicht die Atmosphäre perfekt. Die Steuerung ist präzise und fühlt sich natürlich an. Mit über 20 Stunden Spielzeit bekommst du mehr als dein Geld wert. Ein Highlight, das man nicht verpassen sollte!`,
    `${gameName} ist ein Spiel, das man einfach erlebt haben muss. Die Atmosphäre ist einzigartig und zieht dich sofort in ihren Bann. Die Level sind abwechslungsreich gestaltet und bieten immer wieder neue Herausforderungen. Die Musik untermalt jede Situation perfekt und bleibt noch lange im Ohr. Die packende Handlung hält bis zum Schluss Überraschungen bereit. Ein rundum gelungenes Spielerlebnis!`
  ];
  return templates[Math.floor(Math.random() * templates.length)];
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
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [gamesLoading, setGamesLoading] = useState(true);
  const [allGames, setAllGames] = useState([]);
  const [library, setLibrary] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [currentTab, setCurrentTab] = useState("home");
  const [discoverSubTab, setDiscoverSubTab] = useState("findGame");
  const [gotySearch, setGotySearch] = useState("");
  const [gotyResult, setGotyResult] = useState(null);
  const [selectedGotyYear, setSelectedGotyYear] = useState(null);
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

  useEffect(() => localStorage.setItem("nexplay_lang", lang), [lang]);
  useEffect(() => localStorage.setItem("nexplay_sound", soundEnabled), [soundEnabled]);

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
      
      return {
        ...game,
        finalRating,
        finalImg,
        finalDescription: generateLongDescription(game.name, game.description),
        finalTrailer: getTrailerUrl(game),
        reviewCount,
        steamRating: steamData?.steamRating || finalRating
      };
    });
  }, [allGames]);

  const searchGOTY = () => {
    const search = gotySearch.trim().toLowerCase();
    if (!search) { setGotyResult(null); setSelectedGotyYear(null); return; }
    if (/^\d{4}$/.test(search)) {
      const year = parseInt(search);
      if (GOTY_DATA[year]) { setGotyResult({ type: "year", year, data: GOTY_DATA[year] }); setSelectedGotyYear(year); }
      else setGotyResult({ type: "error", message: `No GOTY data for ${year}` });
      return;
    }
    for (const [year, data] of Object.entries(GOTY_DATA)) {
      if (data.winner.toLowerCase().includes(search)) {
        setGotyResult({ type: "game", year, game: data.winner, role: "winner", data });
        setSelectedGotyYear(year);
        return;
      }
      if (data.nominees.some(n => n.toLowerCase().includes(search))) {
        const nominee = data.nominees.find(n => n.toLowerCase().includes(search));
        setGotyResult({ type: "game", year, game: nominee, role: "nominee", data });
        setSelectedGotyYear(year);
        return;
      }
    }
    setGotyResult({ type: "error", message: "Game not found in GOTY history" });
    setSelectedGotyYear(null);
  };

  useEffect(() => { searchGOTY(); }, [gotySearch]);

  const top20ByGenre = useMemo(() => {
    const filtered = gamesWithData.filter(g => g.genre === selectedGenreForTop);
    return [...filtered].sort((a, b) => b.finalRating - a.finalRating).slice(0, 20);
  }, [gamesWithData, selectedGenreForTop]);

  // KATEGORIEN
  const TOP_PICKS_GAMES = useMemo(() => 
    [...gamesWithData].filter(g => g.finalRating >= 9.0 && g.reviewCount >= 50000).sort((a,b) => b.finalRating - a.finalRating).slice(0, 30),
    [gamesWithData]
  );
  
  const BEST_EVER_GAMES = useMemo(() => 
    [...gamesWithData].sort((a,b) => b.finalRating - a.finalRating).slice(0, 40),
    [gamesWithData]
  );
  
  const HIDDEN_GEMS_GAMES = useMemo(() => 
    [...gamesWithData].filter(g => g.finalRating >= 8.5 && g.reviewCount < 20000).sort((a,b) => b.finalRating - a.finalRating).slice(0, 30),
    [gamesWithData]
  );

  const playSound = (type) => {
    if (!soundEnabled || !audioInitialized) return;
    const audio = new Audio();
    audio.src = type === "click" ? "https://www.soundjay.com/misc/sounds/button-click-1.mp3" : 
                type === "add" ? "https://www.soundjay.com/misc/sounds/notification-1.mp3" : 
                "https://www.soundjay.com/misc/sounds/bell-ringing-1.mp3";
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
        } catch (err) { console.error(err); }
      } else { setUser(null); setUserData(null); setLibrary([]); setFavorites([]); }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => { if (user && library.length) saveLibraryToFirestore(user.uid, library); }, [library, user]);
  useEffect(() => { if (user && favorites) saveProfileToFirestore(user.uid, { favorites }); }, [favorites, user]);
  useEffect(() => { if (user && platformLinks) saveProfileToFirestore(user.uid, { platformLinks }); }, [platformLinks, user]);

  const handleLogin = async () => {
    if (!email || !password) { setErrorMsg("Email and password required"); return; }
    const result = await loginWithEmail(email, password);
    if (result) { setShowLoginModal(false); setEmail(""); setPassword(""); playSound("login"); }
    else setErrorMsg("Login failed");
  };

  const handleRegister = async () => {
    if (!email || !password) { setErrorMsg("Email and password required"); return; }
    if (password.length < 6) { setErrorMsg("Password must be at least 6 characters"); return; }
    const username = email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "");
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
    if (editUsername && editUsername !== userData?.username) {
      const result = await updateUsername(user.uid, editUsername, userData?.username);
      if (result.error) { setEditError(result.error); return; }
      setUserData({ ...userData, username: editUsername });
    }
    if (editBio !== userData?.bio) { await updateBio(user.uid, editBio); setUserData({ ...userData, bio: editBio }); }
    if (editPrivate !== userData?.isPrivate) { await togglePrivacy(user.uid, editPrivate); setUserData({ ...userData, isPrivate: editPrivate }); }
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

  const closeGameDetail = () => { setSelectedGameDetail(null); setCurrentTab("home"); };

  const submitGameDetailReview = async () => {
    if (reviewRating === 0) { alert("Please give a rating"); return; }
    await addGameReview(user.uid, selectedGameDetail.id, selectedGameDetail.name, reviewRating, reviewComment);
    setGameDetailReviews(await getGameReviews(selectedGameDetail.id));
    setReviewRating(0); setReviewComment("");
    playSound("add");
  };

  const handleLikeReview = async (reviewId) => {
    if (!user) return;
    await likeReview(reviewId, user.uid);
    setGameDetailReviews(await getGameReviews(selectedGameDetail.id));
  };

  const handleDislikeReview = async (reviewId) => {
    if (!user) return;
    await dislikeReview(reviewId, user.uid);
    setGameDetailReviews(await getGameReviews(selectedGameDetail.id));
  };

  const markAsPlayed = async (game) => {
    await updateLastPlayed(user.uid, game.id, game.name, game.img);
    setUserData(await loadProfileFromFirestore(user.uid));
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
      setUserData(await loadProfileFromFirestore(user.uid));
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
    if (randomMode === "genre" && pool.length) {
      const randomGenre = pool[Math.floor(Math.random() * pool.length)].genre;
      pool = pool.filter(g => g.genre === randomGenre);
    }
    if (randomMode === "mood" && pool.length) {
      const randomMood = pool[Math.floor(Math.random() * pool.length)].mood;
      pool = pool.filter(g => g.mood === randomMood);
    }
    if (!pool.length) pool = [...gamesWithData];
    setRandomGame(pool[Math.floor(Math.random() * pool.length)]);
    setShowRandomModal(true);
    playSound("click");
  };

  const handleAiSearch = async () => {
    if (!aiQuery.trim()) return;
    setIsAiLoading(true);
    setTimeout(() => {
      const recommendations = gamesWithData.filter(g => g.finalRating >= 8.5).sort(() => 0.5 - Math.random()).slice(0, 5).map(g => g.name).join(", ");
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
    if (categoryFilter.minRating > 0) filtered = filtered.filter(g => g.finalRating >= categoryFilter.minRating);
    if (categoryFilter.year > 0) filtered = filtered.filter(g => g.year >= categoryFilter.year);
    return filtered;
  };

  const results = useMemo(() => {
    let list = gamesWithData.map(g => ({ ...g, score: (selectedMoods.includes(g.mood) ? 40 : 20) + (selectedGenres.includes(g.genre) ? 40 : 20) + (selectedPlaytime === g.playtime ? 20 : 0) + (g.finalRating * 2) }));
    if (searchQuery) list = list.filter(g => g.name.toLowerCase().includes(searchQuery.toLowerCase()));
    if (sortBy === "score") list.sort((a,b) => b.score - a.score);
    else if (sortBy === "rating") list.sort((a,b) => b.finalRating - a.finalRating);
    else if (sortBy === "year") list.sort((a,b) => b.year - a.year);
    return list;
  }, [selectedMoods, selectedGenres, selectedPlaytime, searchQuery, sortBy, gamesWithData]);

  const topPicks = results.slice(0, 8);
  const restResults = results.slice(3);
  const toggle = (arr, setArr, val) => setArr(prev => prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val]);

  const profileStats = useMemo(() => {
    if (!library.length) return { topRated: null, topGenre: null, totalPlaytime: 0 };
    const gamesWithRatings = library.map(libGame => ({ ...libGame, finalRating: gamesWithData.find(g => g.id === libGame.id)?.finalRating || 7.0 }));
    const topRated = [...gamesWithRatings].sort((a,b) => b.finalRating - a.finalRating)[0];
    const genreCount = {};
    library.forEach(g => genreCount[g.genre] = (genreCount[g.genre] || 0) + 1);
    const topGenre = Object.entries(genreCount).sort((a,b) => b[1] - a[1])[0]?.[0] || "None";
    const totalPlaytime = library.reduce((sum, g) => sum + (parseInt(g.playtime?.match(/\d+/)?.[0]) || 0), 0);
    return { topRated, topGenre, totalPlaytime };
  }, [library, gamesWithData]);

  const achievements = useMemo(() => {
    const ach = [];
    if (library.length >= 1) ach.push({ id: "first", name: text.firstGame, desc: "First game added", icon: "🏅", unlocked: true });
    if (library.length >= 10) ach.push({ id: "collector", name: text.collector, desc: "10 games", icon: "🎮", unlocked: true });
    if (library.filter(g => g.status === "completed").length >= 5) ach.push({ id: "completionist", name: text.completionist, desc: "5 completed", icon: "✅", unlocked: true });
    if (favorites.length >= 5) ach.push({ id: "favorites", name: "5 Favorites", desc: "5 games in favorites", icon: "❤️", unlocked: true });
    if (library.length >= 25) ach.push({ id: "master", name: "Game Master", desc: "25 games", icon: "👑", unlocked: true });
    if (library.length >= 50) ach.push({ id: "legend", name: "Legend", desc: "50 games", icon: "⭐", unlocked: true });
    if (gameDetailReviews.length >= 10) ach.push({ id: "critic", name: "The Critic", desc: "Wrote 10 reviews", icon: "✍️", unlocked: true, hidden: true });
    return ach;
  }, [library, favorites, gameDetailReviews]);

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
    tabNavBtn: (active) => ({ background: "none", border: "none", borderBottom: active ? `2px solid ${colors.primary}` : "2px solid transparent", color: active ? colors.primary : colors.textSecondary, padding: "12px 20px", cursor: "pointer", fontSize: 13, fontWeight: active ? 600 : 400, whiteSpace: "nowrap" }),
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
    trailerFrame: { width: "100%", height: 350, borderRadius: 18, marginBottom: 24, border: "none", background: "#000" },
    settingsSection: { background: colors.bgCard, borderRadius: 16, padding: 24, marginBottom: 24 },
    settingsRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 14 },
    settingsLabel: { fontSize: 15, color: colors.text },
    checkbox: { display: "flex", alignItems: "center", gap: 12, marginBottom: 16, cursor: "pointer", fontSize: 14, color: colors.textSecondary },
    achievementGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12, marginTop: 16 },
    achievementCard: { background: "rgba(0,0,0,0.3)", borderRadius: 12, padding: 12, display: "flex", alignItems: "center", gap: 12 },
    achievementIcon: { fontSize: 28 },
    achievementInfo: { flex: 1 },
    achievementName: { fontSize: 13, fontWeight: 600, color: colors.text },
    achievementDesc: { fontSize: 11, color: colors.textSecondary },
    donationBtn: { background: "linear-gradient(135deg, #ffd400, #e6bf00)", border: "none", borderRadius: 12, padding: "12px 20px", color: "#0a0a0f", cursor: "pointer", fontWeight: 700, display: "flex", alignItems: "center", gap: 8, fontSize: 14 },
    gotyResultCard: { background: colors.bgCard, borderRadius: 20, padding: 24, marginBottom: 24, textAlign: "center", border: `1px solid ${colors.primary}30` },
    gotyWinnerCard: { background: `linear-gradient(135deg, ${colors.primary}20, ${colors.bgCard})`, borderRadius: 16, padding: 20, marginBottom: 16 },
    gotyNomineeCard: { background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: 10, margin: 4, display: "inline-block" },
    topGenreSelect: { background: colors.bgCard, border: `1px solid ${colors.primary}30`, borderRadius: 12, padding: "12px 20px", color: colors.text, fontSize: 14, marginBottom: 24, cursor: "pointer" },
    gotyBackBtn: { background: "rgba(255,255,255,0.05)", border: "none", borderRadius: 12, padding: "10px 20px", color: colors.text, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 20, fontSize: 14 }
  };

  const GameCard = ({ game, showBtn = false }) => {
    const isFavorite = favorites.includes(game.id);
    const inLibrary = library.some(g => g.id === game.id);
    return (
      <div className="game-card" style={styles.gameCard} onClick={() => openGameDetail(game)}>
        <img src={game.finalImg} style={styles.gameImg} alt={game.name} onError={(e) => { e.target.src = `https://placehold.co/300x400/14141f/ffd400?text=${encodeURIComponent(game.name.slice(0, 8))}`; }} />
        <div style={{ position: "absolute", top: 10, right: 10, background: "rgba(0,0,0,0.7)", borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 700, color: colors.primary }}>★ {game.finalRating?.toFixed(1)}</div>
        <button className="btn-click" style={{ position: "absolute", top: 10, left: 10, background: "rgba(0,0,0,0.7)", border: "none", borderRadius: 20, padding: "6px 8px", cursor: "pointer" }} onClick={(e) => { e.stopPropagation(); toggleFavorite(game.id); }}>
          {isFavorite ? <BsFillHeartFill color={colors.primary} size={12} /> : <FaHeart color="#fff" size={12} />}
        </button>
        <div style={styles.gameInfo}>
          <div style={styles.gameName}>{game.name}</div>
          <div style={styles.rating}><FaStar size={11} /> {game.finalRating?.toFixed(1)}</div>
          <div style={{ fontSize: 11, color: colors.textSecondary, marginBottom: 8 }}>{game.playtime}</div>
          {showBtn && <button className="btn-click" style={styles.addBtn} onClick={(e) => { e.stopPropagation(); addToLibrary(game); }}>{inLibrary ? <FaCheck size={12} /> : <FaPlus size={12} />} {inLibrary ? text.inLibrary : text.add}</button>}
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
            <img src={selectedGameDetail.finalImg} style={styles.gameDetailImg} alt={selectedGameDetail.name} />
            <div style={styles.gameDetailInfo}>
              <div style={styles.gameDetailName}>{selectedGameDetail.name}</div>
              <div style={styles.gameDetailDeveloper}>{selectedGameDetail.developer}</div>
              <div style={styles.gameDetailRating}>★ {selectedGameDetail.finalRating?.toFixed(1)} · {selectedGameDetail.year} · {selectedGameDetail.playtime}</div>
              <div style={styles.gameDetailDescription}>{selectedGameDetail.finalDescription}</div>
              <div style={styles.gameDetailPlatforms}>{selectedGameDetail.platforms?.map(p => <span key={p} style={styles.platformBadge}>{p}</span>)}</div>
              <div style={styles.buyButtonsRow}>{buyLinks.map(link => <button key={link.name} className="btn-click" style={styles.buyBtn(link.color)} onClick={() => window.open(link.url, "_blank")}>{link.icon} {text.buyOn} {link.name}</button>)}</div>
              <button className="btn-click" style={{ ...styles.addBtn, width: "auto", display: "inline-flex" }} onClick={() => addToLibrary(selectedGameDetail)}>+ {text.add}</button>
            </div>
          </div>
          {selectedGameDetail.finalTrailer && <iframe src={selectedGameDetail.finalTrailer} style={styles.trailerFrame} title="Trailer" allowFullScreen />}
          <div className="fade-in">
            <div style={styles.sectionTitle}>{text.writeReview}</div>
            <div style={styles.reviewStars}>{[1,2,3,4,5].map(star => <span key={star} className="btn-click" style={{ ...styles.reviewStar, color: star <= reviewRating ? colors.primary : colors.textSecondary }} onClick={() => setReviewRating(star)}>★</span>)}</div>
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
          <div style={styles.mainTabs}>
            <button className="btn-click" style={styles.mainTab(currentTab === "home")} onClick={() => setCurrentTab("home")}><FaHome /> {text.home}</button>
            <button className="btn-click" style={styles.mainTab(currentTab === "library")} onClick={() => setCurrentTab("library")}><BsFillCollectionFill /> {text.library}</button>
            <button className="btn-click" style={styles.mainTab(currentTab === "profile")} onClick={() => setCurrentTab("profile")}><FaUser /> {text.profile}</button>
            <button className="btn-click" style={styles.mainTab(currentTab === "friends")} onClick={() => setCurrentTab("friends")}><FaUsers /> {text.friends}</button>
            <button className="btn-click" style={styles.mainTab(currentTab === "ai")} onClick={() => setCurrentTab("ai")}><FaRobot /> {text.ai}</button>
            <button className="btn-click" style={styles.iconBtn} onClick={() => setShowSettings(true)}><FaCog /></button>
            {!user ? <button className="btn-click" style={styles.loginBtn} onClick={() => setShowLoginModal(true)}><FaEnvelope /> {text.login}</button> :
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={styles.userAvatar}>{userData?.username?.charAt(0).toUpperCase()}</div>
                <button className="btn-click" style={styles.logoutBtn} onClick={logout}>{text.logout}</button>
              </div>}
          </div>
        </div>

        {/* ========== HOME TAB (Discover) ========== */}
        {currentTab === "home" && (
          <div className="fade-in">
            <div style={styles.tabNav}>
              <button className="btn-click" style={styles.tabNavBtn(discoverSubTab === "findGame")} onClick={() => setDiscoverSubTab("findGame")}>🔍 {text.findYourGame}</button>
              <button className="btn-click" style={styles.tabNavBtn(discoverSubTab === "topPicks")} onClick={() => setDiscoverSubTab("topPicks")}>🎯 {text.topPicks}</button>
              <button className="btn-click" style={styles.tabNavBtn(discoverSubTab === "bestEver")} onClick={() => setDiscoverSubTab("bestEver")}>🏆 {text.bestEver}</button>
              <button className="btn-click" style={styles.tabNavBtn(discoverSubTab === "hiddenGems")} onClick={() => setDiscoverSubTab("hiddenGems")}>💎 {text.hiddenGems}</button>
              <button className="btn-click" style={styles.tabNavBtn(discoverSubTab === "goty")} onClick={() => setDiscoverSubTab("goty")}>🏆GOTY</button>
              <button className="btn-click" style={styles.tabNavBtn(discoverSubTab === "top20")} onClick={() => setDiscoverSubTab("top20")}>📊 {text.top20}</button>
            </div>

            {/* FIND YOUR GAME - Mood/Genre/Playtime Filter */}
            {discoverSubTab === "findGame" && (
              <>
                <div style={styles.randomFilterSection}>
                  <div style={styles.randomFilterTitle}><FaRandom /> {text.randomGame}</div>
                  <div style={styles.randomFilterRow}>
                    <label className="btn-click" style={styles.randomCheckbox}><input type="checkbox" checked={randomExcludeHorror} onChange={e => setRandomExcludeHorror(e.target.checked)} /> Exclude Horror</label>
                    <label className="btn-click" style={styles.randomCheckbox}><input type="checkbox" checked={randomExcludeIndie} onChange={e => setRandomExcludeIndie(e.target.checked)} /> Exclude Indie</label>
                    <label className="btn-click" style={styles.randomCheckbox}><input type="checkbox" checked={randomExcludeOld} onChange={e => setRandomExcludeOld(e.target.checked)} /> Exclude before 2015</label>
                    <div><span style={{ color: colors.textSecondary }}>Min Rating: {randomMinRating}</span><input type="range" min="0" max="10" step="0.5" value={randomMinRating} onChange={e => setRandomMinRating(parseFloat(e.target.value))} style={styles.randomSlider} /></div>
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
                        <div style={styles.topPicksRow}>{topPicks.map((g,i) => <div key={g.id} className="game-card" style={styles.topPickCard} onClick={() => openGameDetail(g)}><div style={{ fontSize: 24, marginBottom: 8 }}>{["🥇","🥈","🥉","4","5","6","7","8"][i]}</div><img src={g.finalImg} style={{ width: "100%", height: 90, objectFit: "cover", borderRadius: 10 }} alt={g.name} /><div style={{ fontWeight: 700, marginTop: 10, color: colors.text }}>{g.name}</div><div style={{ fontSize: 12, color: colors.primary }}>★ {g.finalRating?.toFixed(1)}</div><button className="btn-click" style={styles.addBtn} onClick={(e) => { e.stopPropagation(); addToLibrary(g); }}>+ {text.add}</button></div>)}</div>
                      </div>
                    )}
                    <div style={styles.sectionTitle}>📋 {text.allResults}</div>
                    <div style={styles.grid}>{restResults.map(g => <GameCard key={g.id} game={g} showBtn={true} />)}</div>
                  </div>
                )}
              </>
            )}

            {/* TOP PICKS */}
            {discoverSubTab === "topPicks" && (
              <div className="fade-in">
                <div style={styles.sectionTitle}>🎯 {text.topPicks}</div>
                <div style={styles.grid}>{TOP_PICKS_GAMES.slice(0, 30).map(g => <GameCard key={g.id} game={g} showBtn={true} />)}</div>
              </div>
            )}

            {/* BEST EVER mit Suche und Filter */}
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

            {/* HIDDEN GEMS */}
            {discoverSubTab === "hiddenGems" && (
              <div className="fade-in">
                <div style={styles.sectionTitle}>💎 {text.hiddenGems}</div>
                <div style={styles.grid}>{HIDDEN_GEMS_GAMES.map(g => <GameCard key={g.id} game={g} showBtn={true} />)}</div>
              </div>
            )}

            {/* GOTY */}
            {discoverSubTab === "goty" && (
              <div className="fade-in">
                {selectedGotyYear ? (
                  <>
                    <button className="btn-click" style={styles.gotyBackBtn} onClick={() => { setSelectedGotyYear(null); setGotySearch(""); setGotyResult(null); }}>
                      <FaArrowLeft /> {text.backToGOTY}
                    </button>
                    <div style={styles.gotyResultCard}>
                      <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 16, color: colors.primary }}>{selectedGotyYear}</div>
                      <div style={styles.gotyWinnerCard}>
                        <div style={{ fontSize: 14, color: colors.primary, marginBottom: 8 }}>{text.winner}</div>
                        <div style={{ fontSize: 24, fontWeight: 700 }}>{GOTY_DATA[selectedGotyYear].winner}</div>
                      </div>
                      <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: colors.textSecondary }}>{text.gotyNominees}</div>
                      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8 }}>
                        {GOTY_DATA[selectedGotyYear].nominees.map(nom => (
                          <div key={nom} style={styles.gotyNomineeCard}>
                            <span style={{ fontSize: 14 }}>📋 {nom}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <input style={styles.searchBar} placeholder={text.searchGOTY} value={gotySearch} onChange={e => setGotySearch(e.target.value)} />
                    {gotyResult?.type === "year" && (
                      <div style={styles.gotyResultCard}>
                        <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 16, color: colors.primary }}>{gotyResult.year}</div>
                        <div style={styles.gotyWinnerCard}>
                          <div style={{ fontSize: 14, color: colors.primary, marginBottom: 8 }}>{text.winner}</div>
                          <div style={{ fontSize: 24, fontWeight: 700 }}>{gotyResult.data.winner}</div>
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: colors.textSecondary }}>{text.gotyNominees}</div>
                        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8 }}>
                          {gotyResult.data.nominees.map(nom => (
                            <div key={nom} style={styles.gotyNomineeCard}>
                              <span style={{ fontSize: 14 }}>📋 {nom}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {gotyResult?.type === "game" && (
                      <div style={styles.gotyResultCard}>
                        <div style={{ fontSize: 20, fontWeight: 700, color: colors.primary, marginBottom: 8 }}>{gotyResult.game}</div>
                        <div style={{ fontSize: 14, color: gotyResult.role === "winner" ? colors.primary : colors.textSecondary, marginBottom: 16 }}>
                          {gotyResult.role === "winner" ? text.winner : text.nominee} - {gotyResult.year}
                        </div>
                        <div style={styles.gotyWinnerCard}>
                          <div style={{ fontSize: 14, color: colors.primary, marginBottom: 8 }}>{text.winner}</div>
                          <div style={{ fontSize: 20, fontWeight: 600 }}>{gotyResult.data.winner}</div>
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 500, marginTop: 16 }}>{text.gotyNominees}:</div>
                        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8, marginTop: 8 }}>
                          {gotyResult.data.nominees.map(nom => (
                            <div key={nom} style={styles.gotyNomineeCard}>
                              <span style={{ fontSize: 13 }}>{nom}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {gotyResult?.type === "error" && <div style={styles.emptyState}>{gotyResult.message}</div>}
                    {!gotySearch && !selectedGotyYear && (
                      <div style={styles.grid}>
                        {Object.entries(GOTY_DATA).reverse().map(([year, data]) => (
                          <div key={year} className="game-card" style={{ ...styles.gameCard, padding: 16, textAlign: "center" }} onClick={() => setSelectedGotyYear(parseInt(year))}>
                            <div style={{ fontSize: 32, marginBottom: 8 }}>🏆</div>
                            <div style={{ fontWeight: 700, fontSize: 20, color: colors.primary }}>{year}</div>
                            <div style={{ fontSize: 13, marginTop: 8 }}>{data.winner}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* TOP 20 BY GENRE */}
            {discoverSubTab === "top20" && (
              <div className="fade-in">
                <select className="btn-click" value={selectedGenreForTop} onChange={e => setSelectedGenreForTop(e.target.value)} style={styles.topGenreSelect}>
                  {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
                <div style={{ ...styles.sectionTitle, fontSize: 20, marginBottom: 16 }}>⭐ {selectedGenreForTop}</div>
                {top20ByGenre.length === 0 ? (
                  <div style={styles.emptyState}>No games found in this genre yet. More games will be added soon! (Minimum 15 games required for this genre)</div>
                ) : top20ByGenre.length < 15 ? (
                  <div style={styles.emptyState}>⚠️ Only {top20ByGenre.length} games found in this genre. Minimum 15 games required for full list.</div>
                ) : (
                  <div style={styles.grid}>{top20ByGenre.map(g => <GameCard key={g.id} game={g} showBtn={true} />)}</div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ========== LIBRARY TAB ========== */}
        {currentTab === "library" && (
          <div className="fade-in">
            <div style={styles.sectionTitle}>📚 {text.library} ({library.length})</div>
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
                    <button className="btn-click" onClick={() => toggleFavorite(game.id)} style={styles.select}><FaHeart color={favorites.includes(game.id) ? colors.primary : "#fff"} /></button>
                    <button className="btn-click" onClick={() => markAsPlayed(game)} style={styles.select}><FaClock /> {text.played}</button>
                    <button className="btn-click" onClick={() => removeFromLibrary(game.id)} style={{ ...styles.select, color: "#ff6b6b" }}>{text.remove}</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ========== PROFILE TAB ========== */}
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
                      <div><div style={styles.statNumber}>{library.length}</div><div>{text.total}</div></div>
                      <div><div style={styles.statNumber}>{library.filter(g => g.status === "completed").length}</div><div>{text.completed}</div></div>
                      <div><div style={styles.statNumber}>{favorites.length}</div><div>{text.favorites}</div></div>
                    </div>
                    <div style={{ ...styles.statsRow, marginTop: 8 }}>
                      <div style={styles.statCard}><div style={{ fontSize: 20 }}>🏆</div><div>{text.topRated}</div><div style={{ fontSize: 12, color: colors.primary }}>{profileStats.topRated?.name || "None"}</div></div>
                      <div style={styles.statCard}><div style={{ fontSize: 20 }}>🎭</div><div>{text.topGenre}</div><div style={{ fontSize: 12, color: colors.primary }}>{profileStats.topGenre}</div></div>
                      <div style={styles.statCard}><div style={{ fontSize: 20 }}>⏱️</div><div>{text.totalPlaytime}</div><div style={{ fontSize: 12, color: colors.primary }}>{profileStats.totalPlaytime}h</div></div>
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
                        <div style={styles.achievementName}>{ach.name}</div>
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
                  <div style={{ fontSize: 12, color: colors.textSecondary, marginTop: 12 }}>
                    🔍 {text.findSteamId}: <a href="https://steamidfinder.com/" target="_blank" rel="noreferrer" style={{ color: colors.primary }}>steamidfinder.com</a>
                  </div>
                </div>

                {userData?.lastPlayed?.length > 0 && (
                  <><div style={styles.sectionTitle}><FaClock /> {text.recentlyPlayed}</div><div style={styles.lastPlayedRow}>{userData.lastPlayed.slice(0,6).map((g,i) => <div key={i} className="hover-lift" style={styles.lastPlayedCard} onClick={() => { const game = gamesWithData.find(a => a.id === g.gameId); if (game) openGameDetail(game); }}><img src={g.gameImg} style={styles.lastPlayedImg} alt={g.gameName} /><div style={styles.lastPlayedName}>{g.gameName}</div></div>)}</div></>
                )}
              </>
            ) : <div style={styles.emptyState}>Login to see your profile</div>}
          </div>
        )}

        {/* ========== FRIENDS TAB ========== */}
        {currentTab === "friends" && (
          <div className="fade-in">
            <div style={styles.sectionTitle}><FaUsers /> {text.findFriends}</div>
            <div style={styles.searchRow}>
              <input style={{ ...styles.input, marginBottom: 0, flex: 1 }} placeholder="Search by username..." value={searchUsersTerm} onChange={e => setSearchUsersTerm(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSearchUsers()} />
              <button className="btn-click" style={styles.loginBtn} onClick={handleSearchUsers}><FaSearch /> {text.search}</button>
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

        {/* ========== AI TAB ========== */}
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
      </div>

      {showSettings && (
        <div className="fade-in" style={styles.modalOverlay} onClick={() => setShowSettings(false)}>
          <div className="slide-in" style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div style={styles.modalTitle}>{text.settings} ⚙️</div>
            <div style={styles.settingsSection}>
              <div style={styles.settingsRow}><span style={styles.settingsLabel}>{text.sound}:</span><button className="btn-click" style={styles.iconBtn} onClick={() => setSoundEnabled(!soundEnabled)}>{soundEnabled ? <FaVolumeUp /> : <FaVolumeMute />} {soundEnabled ? "ON" : "OFF"}</button></div>
              <div style={styles.settingsRow}><span style={styles.settingsLabel}>{text.language}:</span><button className="btn-click" style={styles.iconBtn} onClick={() => setLang(lang === "en" ? "de" : "en")}><FaLanguage /> {lang === "en" ? "DE" : "EN"}</button></div>
            </div>
            <button className="btn-click" style={styles.modalBtn} onClick={() => setShowSettings(false)}>{text.close}</button>
          </div>
        </div>
      )}

      {showRandomModal && randomGame && (
        <div className="fade-in" style={styles.modalOverlay} onClick={() => setShowRandomModal(false)}>
          <div className="slide-in" style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div style={styles.modalTitle}>🎲 {text.randomGame}</div>
            <img src={randomGame.finalImg} style={{ width: "100%", borderRadius: 18, marginBottom: 20 }} alt={randomGame.name} />
            <div style={{ fontSize: 18, fontWeight: 700, textAlign: "center", marginBottom: 8 }}>{randomGame.name}</div>
            <div style={{ fontSize: 15, color: colors.primary, textAlign: "center", marginBottom: 14 }}>★ {randomGame.finalRating?.toFixed(1)} · {randomGame.playtime} · {randomGame.year}</div>
            <div style={{ fontSize: 14, marginBottom: 24, color: colors.textSecondary, textAlign: "center", maxHeight: 150, overflow: "auto" }}>{randomGame.finalDescription?.slice(0, 300)}...</div>
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

      {showReviews && reviewsGame && (
        <div className="fade-in" style={styles.modalOverlay} onClick={closeReviews}>
          <div className="slide-in" style={{ ...styles.modalContent, maxWidth: 550 }} onClick={e => e.stopPropagation()}>
            <div style={styles.modalTitle}>{text.reviews} for {reviewsGame.name}</div>
            {gameDetailReviews.length === 0 ? <div style={styles.emptyState}>{text.noReviews}</div> :
              gameDetailReviews.map(review => (
                <div key={review.id} style={styles.reviewCard}>
                  <div style={styles.reviewHeader}>
                    <span style={styles.reviewUsername}>{review.username}</span>
                    <span style={styles.reviewRating}>★ {review.rating}/5</span>
                  </div>
                  <div style={styles.reviewComment}>{review.comment || "No comment"}</div>
                </div>
              ))}
            <button className="btn-click" style={styles.modalBtn} onClick={closeReviews}>{text.close}</button>
          </div>
        </div>
      )}
    </div>
  );
}