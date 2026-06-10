import { useState, useCallback, useMemo, useRef, useEffect, createContext, useContext } from "react";

// ==================================================
// 1. STYLES (VOLLFLÄCHIG - KEINE WEISSEN RÄNDER)
// ==================================================
const ACC = "#ffd400";
const BG = "#0a0a0f";
const CARD = "#1c1c2e";

const globalStyles = {
  body: { margin: 0, padding: 0, background: BG, color: "#fff", fontFamily: "'Inter', 'Segoe UI', sans-serif" },
  app: { minHeight: "100vh", background: BG, width: "100%" },
  container: { maxWidth: 1400, margin: "0 auto", padding: "0 24px", width: "100%", boxSizing: "border-box" }
};

// ==================================================
// 2. API SERVICE (ZUKUNFTSSICHER)
// ==================================================

const LOCAL_GAMES = new GameService();

// ==================================================
// 3. USER CONTEXT (FÜR ACCOUNTS)
// ==================================================
const UserContext = createContext(null);

// ==================================================
// 4. GAME DATABASE
// ==================================================
const LOCAL_GAMES = [
  { id:1, name:"The Walking Dead: Season One", rating:9.2, color:"150505", trailer:"https://www.youtube.com/embed/N40uY51s5Z0", mood:["Emotional","Story Rich","Sad"], genre:["Adventure","Story Rich","Choices Matter"], playtime:"10-15h", description:"Begleite Lee Everett, einen verurteilten Straftäter, der während der Zombie-Apokalypse auf das kleine Mädchen Clementine trifft.", developer:"Telltale Games", releaseYear:2012, platforms:["PC","PS4","Xbox","Switch"], popularity:95, img:"https://cdn.cloudflare.steamstatic.com/steam/apps/207610/header.jpg" },
  { id:2, name:"The Walking Dead: Season Two", rating:8.9, color:"100505", trailer:"https://www.youtube.com/embed/q_0f0D4Jqtw", mood:["Emotional","Dark","Story Rich"], genre:["Adventure","Choices Matter"], playtime:"8-12h", description:"Clementine ist nun die Hauptfigur und muss alleine überleben. Die Welt um sie herum ist grausamer geworden.", developer:"Telltale Games", releaseYear:2013, platforms:["PC","PS4","Xbox","Switch"], popularity:90, img:"https://cdn.cloudflare.steamstatic.com/steam/apps/261030/header.jpg" },
  { id:3, name:"Life is Strange", rating:9.1, color:"0a1020", trailer:"https://www.youtube.com/embed/AURVxvIZrmU", mood:["Emotional","Story Rich","Mystery"], genre:["Adventure","Choices Matter"], playtime:"10-15h", description:"Max Caulfield entdeckt, dass sie die Zeit zurückdrehen kann. Sie nutzt ihre Fähigkeit, um ihre beste Freundin Chloe zu retten.", developer:"Dontnod", releaseYear:2015, platforms:["PC","PS4","Xbox","Mobile"], popularity:94, img:"https://cdn.cloudflare.steamstatic.com/steam/apps/319630/header.jpg" },
  { id:4, name:"The Last of Us Part I", rating:9.5, color:"2d1b1b", trailer:"https://www.youtube.com/embed/bC3B5pgFxTc", mood:["Emotional","Sad","Survival"], genre:["Action","Adventure","Story Rich"], playtime:"15-20h", description:"Joel, ein hartgesottener Überlebender, soll Ellie, ein teenager Mädchen, das immun gegen die Pilzinfektion ist, quer durch die zerstörte USA schmuggeln.", developer:"Naughty Dog", releaseYear:2013, platforms:["PS5","PS4","PC"], popularity:99, img:"https://cdn.cloudflare.steamstatic.com/steam/apps/1888930/header.jpg" },
  { id:5, name:"Red Dead Redemption 2", rating:9.7, color:"2b1a0a", trailer:"https://www.youtube.com/embed/gmA6MrX81z4", mood:["Emotional","Atmospheric","Epic"], genre:["Action","Open World","Story Rich"], playtime:"60-100h", description:"Arthur Morgan, ein Outlaw, navigiert durch die sterbende Ära des amerikanischen Wilden Westens.", developer:"Rockstar Games", releaseYear:2018, platforms:["PS4","Xbox One","PC"], popularity:99, img:"https://cdn.cloudflare.steamstatic.com/steam/apps/1174180/header.jpg" },
  { id:6, name:"The Witcher 3: Wild Hunt", rating:9.6, color:"0e1f0e", trailer:"https://www.youtube.com/embed/c0i88t0Kacs", mood:["Epic","Fantasy","Story Rich"], genre:["RPG","Open World","Action"], playtime:"100h+", description:"Geralt von Rivia sucht nach seiner Adoptivtochter Ciri. Eine epische Reise durch eine wunderschöne, moralisch graue Fantasy-Welt.", developer:"CD Projekt Red", releaseYear:2015, platforms:["PS4","Xbox One","PC","Switch"], popularity:99, img:"https://cdn.cloudflare.steamstatic.com/steam/apps/292030/header.jpg" },
  { id:7, name:"Elden Ring", rating:9.5, color:"1a1505", trailer:"https://www.youtube.com/embed/E3Huy2cdih0", mood:["Dark","Exploration","Epic"], genre:["Action","RPG","Open World"], playtime:"60-100h", description:"Erkunde die Zwischenlande und besiege mächtige Bosse. Das neueste Meisterwerk von FromSoftware.", developer:"FromSoftware", releaseYear:2022, platforms:["PS5","PS4","Xbox","PC"], popularity:99, img:"https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/header.jpg" },
  { id:8, name:"Baldur's Gate 3", rating:9.8, color:"1a0505", trailer:"https://www.youtube.com/embed/IMd7YMFtaN8", mood:["Epic","Story Rich","Fantasy"], genre:["RPG","Turn Based","Co-op"], playtime:"100h+", description:"Das ultimative D&D-Erlebnis. Versammle deine Gruppe, treffe Entscheidungen mit Konsequenzen.", developer:"Larian Studios", releaseYear:2023, platforms:["PC","PS5","Xbox"], popularity:99, img:"https://cdn.cloudflare.steamstatic.com/steam/apps/1086940/header.jpg" },
  { id:9, name:"Hades", rating:9.3, color:"1f0a05", trailer:"https://www.youtube.com/embed/InjlPq2QBjI", mood:["Action","Story Rich","Greek"], genre:["Roguelite","Action","Indie"], playtime:"40-60h", description:"Trotze dem Tod und entkomme der Unterwelt in diesem preisgekrönten Roguelite.", developer:"Supergiant Games", releaseYear:2020, platforms:["PC","Switch","PS4","Xbox"], popularity:96, img:"https://cdn.cloudflare.steamstatic.com/steam/apps/1145360/header.jpg" },
  { id:10, name:"Hollow Knight", rating:9.3, color:"111118", trailer:"https://www.youtube.com/embed/UAO2urG23S4", mood:["Atmospheric","Dark","Exploration"], genre:["Metroidvania","Indie","Action"], playtime:"40-60h", description:"Erkunde das verfallene Königreich Hallownest, kämpfe gegen Insekten und enthülle uralte Geheimnisse.", developer:"Team Cherry", releaseYear:2017, platforms:["PC","Switch","PS4","Xbox One"], popularity:94, img:"https://cdn.cloudflare.steamstatic.com/steam/apps/367520/header.jpg" },
  { id:11, name:"Disco Elysium", rating:9.4, color:"1a1020", trailer:"https://www.youtube.com/embed/FvGROAIanxo", mood:["Story Rich","Mystery","Dark"], genre:["RPG","Choices Matter"], playtime:"20-40h", description:"Ein Detektiv mit Gedächtnisverlust löst einen Mordfall in einer komplexen Welt.", developer:"ZA/UM", releaseYear:2019, platforms:["PC","PS4","Xbox","Switch"], popularity:90, img:"https://cdn.cloudflare.steamstatic.com/steam/apps/632470/header.jpg" },
  { id:12, name:"Stardew Valley", rating:9.3, color:"0a1a08", trailer:"https://www.youtube.com/embed/ot7uXNQskhs", mood:["Cozy","Relaxing","Wholesome"], genre:["Simulation","Indie","RPG"], playtime:"100h+", description:"Baue deine eigene Farm auf, fische, minze und finde die Liebe in Pelican Town.", developer:"ConcernedApe", releaseYear:2016, platforms:["PC","Switch","PS4","Xbox","Mobile"], popularity:97, img:"https://cdn.cloudflare.steamstatic.com/steam/apps/413150/header.jpg" },
];

const MOODS = ["Emotional", "Sad", "Happy", "Relaxing", "Cozy", "Action Packed", "Story Rich", "Dark", "Mystery", "Funny", "Wholesome", "Survival", "Exploration", "Epic", "Atmospheric", "Sci-Fi", "Fantasy"];
const GENRES = ["Action", "Adventure", "RPG", "Open World", "Story Rich", "Horror", "Puzzle", "Platformer", "Strategy", "Fighting", "Racing", "Simulation", "Co-op", "Multiplayer", "Indie", "Shooter", "Survival", "JRPG", "Metroidvania", "Roguelite"];
const PLAYTIMES = ["Under 3h", "3-5h", "5-10h", "10-20h", "20-40h", "40-60h", "60-100h", "100h+", "Endless"];

function scoreGame(game, moods, genres, playtime) {
  let score = 0;
  if (moods.length > 0) {
    const moodMatches = moods.filter(m => game.mood?.includes(m)).length;
    score += Math.round((moodMatches / moods.length) * 30);
  } else score += 15;
  if (genres.length > 0) {
    const genreMatches = genres.filter(g => game.genre?.includes(g)).length;
    score += Math.round((genreMatches / genres.length) * 30);
  } else score += 15;
  if (playtime && game.playtime === playtime) score += 20;
  else if (playtime) score += 10;
  else score += 10;
  score += Math.round((game.rating / 10) * 20);
  return score;
}

// ==================================================
// 5. MAIN APP COMPONENT (OPTIMIERT)
// ==================================================
export default function NexPlay() {
  // User State (für Accounts)
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("nexplay_user");
      return saved ? JSON.parse(saved) : { id: "guest", name: "Guest", isLoggedIn: false };
    } catch { return { id: "guest", name: "Guest", isLoggedIn: false }; }
  });
  
  const [currentPage, setCurrentPage] = useState("home");
  const [library, setLibrary] = useState(() => {
    try {
      const saved = localStorage.getItem("gameLibrary");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  
  // FAVORITES / BACKLOG SYSTEM
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem("favorites");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  
  const [backlog, setBacklog] = useState(() => {
    try {
      const saved = localStorage.getItem("backlog");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  
  const [librarySearchQuery, setLibrarySearchQuery] = useState("");
  const [trendingGames, setTrendingGames] = useState([]);
  const [personalizedGames, setPersonalizedGames] = useState([]);
  
  const [step, setStep] = useState(1);
  const [selectedMoods, setSelectedMoods] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedPlaytime, setSelectedPlaytime] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("score");
  const [hoveredGame, setHoveredGame] = useState(null);
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });
  const hoverTimer = useRef(null);
  const hoverPanelRef = useRef(null);
  const [activeTab, setActiveTab] = useState("discover");
  const [trailerError, setTrailerError] = useState({});
  const [games, setGames] = useState(LOCAL_GAMES);
  const [libraryFilter, setLibraryFilter] = useState("all");
  const [librarySort, setLibrarySort] = useState("date");
  
  // AI Search (für später - DeepSeek ready)
  const [aiSearchQuery, setAiSearchQuery] = useState("");
  const [isAiSearching, setIsAiSearching] = useState(false);

  // Profile Settings
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem("userProfile");
      return saved ? JSON.parse(saved) : {
        username: "Gamer",
        avatar: "🎮",
        joinDate: new Date().toISOString(),
        favoriteGenre: "",
        favoriteMood: "",
        achievements: { gamesCompleted: 0, totalRatings: 0, avgRating: 0 }
      };
    } catch { return { username: "Gamer", avatar: "🎮", joinDate: new Date().toISOString(), favoriteGenre: "", favoriteMood: "", achievements: { gamesCompleted: 0, totalRatings: 0, avgRating: 0 } }; }
  });
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editUsername, setEditUsername] = useState(profile.username);
  const [editAvatar, setEditAvatar] = useState(profile.avatar);
  
  // Random Game Filters
  const [showRandomModal, setShowRandomModal] = useState(false);
  const [randomGame, setRandomGame] = useState(null);
  const [randomFilters, setRandomFilters] = useState({
    minRating: 7, maxRating: 10, excludeGenres: [], excludeMoods: [],
    excludeHorror: false, excludeIndie: false, excludeMultiplayer: false,
    excludeOldGames: false, onlyHighRated: true, randomMode: "full_random"
  });
  const [randomHistory, setRandomHistory] = useState([]);

  // ==================================================
  // 6. OPTIMIERTE EFFECTS & CALLBACKS
  // ==================================================
  useEffect(() => {
    localStorage.setItem("gameLibrary", JSON.stringify(library));
    localStorage.setItem("favorites", JSON.stringify(favorites));
    localStorage.setItem("backlog", JSON.stringify(backlog));
    localStorage.setItem("userProfile", JSON.stringify(profile));
  }, [library, favorites, backlog, profile]);

  // Lade Trending und Personalized Games
  useEffect(() => {
    const loadData = async () => {
      const trending = await gameService.getTrending();
      setTrendingGames(trending);
      const personalized = await gameService.getPersonalized(user.id, library);
      setPersonalizedGames(personalized);
    };
    loadData();
  }, [user.id, library]);

  // Achievements aktualisieren (memoized)
  const updateAchievements = useCallback(() => {
    const completed = library.filter(g => g.status === "completed").length;
    const ratings = library.filter(g => g.userRating && g.userRating > 0);
    const avgRating = ratings.length > 0 
      ? ratings.reduce((sum, g) => sum + (g.userRating || 0), 0) / ratings.length 
      : 0;
    
    setProfile(prev => ({
      ...prev,
      achievements: {
        gamesCompleted: completed,
        totalRatings: ratings.length,
        avgRating: Math.round(avgRating * 10) / 10
      }
    }));
  }, [library]);

  useEffect(() => { updateAchievements(); }, [library, updateAchievements]);

  // Favorites/Backlog Actions
  const toggleFavorite = useCallback((gameId) => {
    setFavorites(prev => prev.includes(gameId) ? prev.filter(id => id !== gameId) : [...prev, gameId]);
  }, []);

  const toggleBacklog = useCallback((gameId) => {
    setBacklog(prev => prev.includes(gameId) ? prev.filter(id => id !== gameId) : [...prev, gameId]);
  }, []);

  const addToLibrary = useCallback((game, status = "wishlist") => {
    setLibrary(prev => {
      const exists = prev.find(g => g.id === game.id);
      if (exists) {
        return prev.map(g => g.id === game.id ? { ...g, status, dateAdded: new Date().toISOString() } : g);
      }
      return [...prev, { ...game, status, dateAdded: new Date().toISOString(), userRating: null, userComment: "" }];
    });
  }, []);

  const removeFromLibrary = useCallback((gameId) => {
    setLibrary(prev => prev.filter(g => g.id !== gameId));
  }, []);

  const updateGameStatus = useCallback((gameId, newStatus) => {
    setLibrary(prev => prev.map(g => g.id === gameId ? { ...g, status: newStatus } : g));
  }, []);

  const updateUserRating = useCallback((gameId, rating, comment) => {
    setLibrary(prev => prev.map(g => g.id === gameId ? { ...g, userRating: rating, userComment: comment } : g));
  }, []);

  // Optimierte Filterung
  const filteredLibrary = useMemo(() => {
    let filtered = [...library];
    if (librarySearchQuery.trim()) {
      const query = librarySearchQuery.toLowerCase();
      filtered = filtered.filter(g => 
        g.name.toLowerCase().includes(query) ||
        g.developer.toLowerCase().includes(query) ||
        g.genre.some(genre => genre.toLowerCase().includes(query))
      );
    }
    if (libraryFilter === "playing") filtered = filtered.filter(g => g.status === "playing");
    if (libraryFilter === "completed") filtered = filtered.filter(g => g.status === "completed");
    if (libraryFilter === "wishlist") filtered = filtered.filter(g => g.status === "wishlist");
    if (librarySort === "rating") filtered.sort((a, b) => (b.userRating || b.rating) - (a.userRating || a.rating));
    if (librarySort === "name") filtered.sort((a, b) => a.name.localeCompare(b.name));
    if (librarySort === "date") filtered.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
    return filtered;
  }, [library, libraryFilter, librarySort, librarySearchQuery]);

  const handleSearch = useCallback(async (query) => {
    setSearchQuery(query);
    const results = await gameService.getGames({ search: query });
    setGames(results.length > 0 ? results : LOCAL_GAMES);
  }, []);

  // AI Search (DeepSeek ready)
  const handleAiSearch = useCallback(async () => {
    if (!aiSearchQuery.trim()) return;
    setIsAiSearching(true);
    // Hier später DeepSeek API integration
    // Aktuell: einfache Keyword-Suche
    const results = await gameService.getGames({ search: aiSearchQuery });
    setGames(results);
    setActiveTab("discover");
    setStep(4);
    setIsAiSearching(false);
  }, [aiSearchQuery]);

  const handleCardHover = useCallback((game, e) => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    const rect = e.currentTarget.getBoundingClientRect();
    hoverTimer.current = setTimeout(() => {
      setHoveredGame(game);
      setHoverPos({ x: rect.right, y: rect.top, left: rect.left, width: rect.width, winW: window.innerWidth });
    }, 500);
  }, []);

  const handleCardLeave = useCallback(() => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    setTimeout(() => {
      if (!hoverPanelRef.current?.matches(':hover')) setHoveredGame(null);
    }, 300);
  }, []);

  const toggle = useCallback((arr, setArr, val) => {
    setArr(prev => prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val]);
  }, []);

  const results = useMemo(() => {
    let gameList = games.length > 0 ? games : LOCAL_GAMES;
    let gameListWithScore = gameList.map(g => ({ 
      ...g, 
      score: scoreGame(g, selectedMoods, selectedGenres, selectedPlaytime),
      isFavorite: favorites.includes(g.id),
      isBacklog: backlog.includes(g.id)
    }));
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      gameListWithScore = gameListWithScore.filter(g => 
        g.name.toLowerCase().includes(q) || 
        g.genre.some(genre => genre.toLowerCase().includes(q))
      );
    }
    let sorted = [...gameListWithScore];
    if (sortBy === "score") sorted.sort((a, b) => b.score - a.score);
    else if (sortBy === "rating") sorted.sort((a, b) => b.rating - a.rating);
    else if (sortBy === "year") sorted.sort((a, b) => b.releaseYear - a.releaseYear);
    else if (sortBy === "popularity") sorted.sort((a, b) => b.popularity - a.popularity);
    return sorted;
  }, [games, selectedMoods, selectedGenres, selectedPlaytime, searchQuery, sortBy, favorites, backlog]);

  const topPicks = useMemo(() => results.slice(0, 10), [results]);
  const restResults = useMemo(() => results.slice(10), [results]);
  const mustPlayNow = useMemo(() => [...LOCAL_GAMES].filter(g => g.rating >= 8.5).sort((a, b) => b.rating - a.rating).slice(0, 30), []);
  const bestAllTime = useMemo(() => [...LOCAL_GAMES].sort((a, b) => b.rating - a.rating).slice(0, 30), []);
  const hiddenGems = useMemo(() => [...LOCAL_GAMES].filter(g => g.rating >= 8.2 && g.popularity < 85).sort((a, b) => b.rating - a.rating).slice(0, 20), []);

  const doRandom = useCallback(() => {
    let pool = [...LOCAL_GAMES];
    if (randomFilters.onlyHighRated) {
      pool = pool.filter(g => g.rating >= randomFilters.minRating && g.rating <= randomFilters.maxRating);
    }
    if (randomFilters.excludeGenres.length > 0) {
      pool = pool.filter(g => !g.genre.some(genre => randomFilters.excludeGenres.includes(genre)));
    }
    if (randomFilters.excludeHorror) pool = pool.filter(g => !g.mood.includes("Horror"));
    if (randomFilters.excludeIndie) pool = pool.filter(g => !g.genre.includes("Indie"));
    if (randomFilters.excludeOldGames) pool = pool.filter(g => g.releaseYear >= 2015);
    if (randomHistory.length > 0 && pool.length > randomHistory.length) {
      pool = pool.filter(g => !randomHistory.includes(g.id));
    }
    if (pool.length === 0) pool = LOCAL_GAMES;
    const randomIndex = Math.floor(Math.random() * pool.length);
    const chosenGame = pool[randomIndex];
    setRandomGame(chosenGame);
    setRandomHistory(prev => [...prev.slice(-20), chosenGame.id]);
  }, [randomFilters, randomHistory]);

  const libraryStats = useMemo(() => ({
    total: library.length,
    playing: library.filter(g => g.status === "playing").length,
    completed: library.filter(g => g.status === "completed").length,
    wishlist: library.filter(g => g.status === "wishlist").length,
    favorites: favorites.length,
    backlog: backlog.length,
  }), [library, favorites, backlog]);

  const styles = {
    app: { ...globalStyles.app },
    container: { ...globalStyles.container },
    header: { textAlign: "center", padding: "20px 0 16px", borderBottom: `1px solid rgba(255,212,0,0.15)`, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 15 },
    logo: { fontSize: 28, fontWeight: 800, color: ACC, letterSpacing: -1 },
    tagline: { fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 2 },
    navButtons: { display: "flex", gap: 12, flexWrap: "wrap" },
    navBtn: (active) => ({ background: active ? ACC : "rgba(255,255,255,0.08)", border: "none", borderRadius: 12, padding: "12px 24px", color: active ? "#0a0a0f" : "#fff", cursor: "pointer", fontWeight: 600, fontSize: 14 }),
    randomBtn: { background: "rgba(255,212,0,0.15)", border: `1px solid ${ACC}40`, borderRadius: 12, padding: "12px 20px", color: ACC, cursor: "pointer", fontWeight: 600, fontSize: 14 },
    subNav: { display: "flex", gap: 4, borderBottom: `1px solid rgba(255,255,255,0.08)`, padding: "0", overflowX: "auto" },
    subNavBtn: (active) => ({ background: "none", border: "none", borderBottom: active ? `2px solid ${ACC}` : "2px solid transparent", color: active ? ACC : "rgba(255,255,255,0.6)", padding: "12px 20px", cursor: "pointer", fontSize: 14, fontWeight: active ? 600 : 400, whiteSpace: "nowrap" }),
    statCard: { background: CARD, borderRadius: 12, padding: "16px 24px", textAlign: "center", minWidth: 100 },
    statNumber: { fontSize: 28, fontWeight: 800, color: ACC },
    statLabel: { fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 4 },
    filterRow: { display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "center" },
    filterBtn: (active) => ({ background: active ? ACC : "rgba(255,255,255,0.06)", border: "none", borderRadius: 8, padding: "8px 18px", color: active ? "#0a0a0f" : "#fff", cursor: "pointer", fontSize: 12, fontWeight: active ? 600 : 400 }),
    searchBar: { background: CARD, border: `1px solid rgba(255,255,255,0.1)`, borderRadius: 12, padding: "12px 18px", color: "#fff", fontSize: 14, width: "100%", outline: "none" },
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 16 },
    gameCard: { background: CARD, borderRadius: 12, overflow: "hidden", cursor: "pointer", transition: "transform 0.2s", border: "1px solid rgba(255,255,255,0.06)", position: "relative" },
    gameImg: { width: "100%", aspectRatio: "3/4", objectFit: "cover", display: "block" },
    gameInfo: { padding: "10px" },
    gameName: { fontSize: 13, fontWeight: 600, color: "#fff", marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
    badge: (color) => ({ background: color || "rgba(255,255,255,0.1)", color: "#fff", fontSize: 9, fontWeight: 600, padding: "3px 8px", borderRadius: 10 }),
    addBtn: { background: ACC, border: "none", borderRadius: 8, padding: "8px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", marginTop: 8, width: "100%" },
    selectDark: { background: "#2a2a3a", border: `1px solid ${ACC}40`, borderRadius: 8, padding: "8px 12px", color: "#fff", fontSize: 12, cursor: "pointer", outline: "none" },
    pillGrid: { display: "flex", flexWrap: "wrap", gap: 8, maxHeight: 280, overflowY: "auto", padding: 4 },
    pill: (selected) => ({ background: selected ? ACC : "rgba(255,255,255,0.06)", color: selected ? "#0a0a0f" : "rgba(255,255,255,0.8)", border: `1px solid ${selected ? ACC : "rgba(255,255,255,0.1)"}`, borderRadius: 30, padding: "8px 18px", cursor: "pointer", fontSize: 13, fontWeight: selected ? 600 : 400 }),
    stepContainer: { padding: "30px 0", maxWidth: 900, margin: "0 auto" },
    stepTitle: { fontSize: 24, fontWeight: 700, marginBottom: 8, color: "#fff" },
    nextBtn: { marginTop: 28, background: ACC, color: "#0a0a0f", border: "none", borderRadius: 10, padding: "12px 36px", fontSize: 15, fontWeight: 700, cursor: "pointer" },
    topPicksRow: { display: "flex", gap: 14, marginBottom: 28, overflowX: "auto", paddingBottom: 10 },
    topPickCard: (i) => ({ minWidth: 280, background: i === 0 ? "linear-gradient(135deg,#2a2408,#1c1c2e)" : CARD, border: `1px solid ${i === 0 ? "rgba(255,212,0,0.3)" : "rgba(255,255,255,0.08)"}`, borderRadius: 12, padding: "14px", cursor: "pointer", position: "relative" }),
    sectionLabel: { fontSize: 12, fontWeight: 700, color: ACC, letterSpacing: 1, textTransform: "uppercase", marginBottom: 16 },
    hoverPanel: { position: "fixed", zIndex: 1000, background: "#13131f", border: `1px solid rgba(255,212,0,0.2)`, borderRadius: 14, boxShadow: "0 20px 60px rgba(0,0,0,0.8)", display: "flex", gap: 0, overflow: "hidden", maxWidth: 560 },
    ratingStars: { display: "flex", gap: 5, flexWrap: "wrap", alignItems: "center", marginTop: 8 },
    star: (filled) => ({ fontSize: 18, cursor: "pointer", color: filled ? ACC : "rgba(255,255,255,0.2)" }),
    commentInput: { width: "100%", background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 8, padding: "8px 10px", color: "#fff", fontSize: 11, marginTop: 8, resize: "vertical" },
    libraryGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 },
    libraryCard: { background: CARD, borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,0.06)" },
    libraryCardHeader: { display: "flex", gap: 12, padding: 12 },
    libraryImg: { width: 70, height: 93, objectFit: "cover", borderRadius: 8 },
    profileHeader: { display: "flex", gap: 24, alignItems: "center", background: CARD, borderRadius: 20, padding: 24, marginBottom: 24, flexWrap: "wrap" },
    profileAvatar: { fontSize: 70, background: "rgba(255,212,0,0.1)", borderRadius: "50%", padding: 16, textAlign: "center" },
    profileUsername: { fontSize: 26, fontWeight: 800, marginBottom: 4 },
    achievementsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14, marginTop: 16 },
    achievementCard: { background: CARD, borderRadius: 12, padding: 14, textAlign: "center" },
    editModal: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.95)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center" },
    editModalContent: { background: CARD, borderRadius: 20, padding: 24, width: "90%", maxWidth: 400 },
    aiSearchRow: { display: "flex", gap: 10, marginBottom: 16, alignItems: "center" },
    aiInput: { flex: 1, background: CARD, border: `1px solid ${ACC}40`, borderRadius: 12, padding: "12px 16px", color: "#fff", fontSize: 14, outline: "none" },
    aiButton: { background: "linear-gradient(135deg, #2a2408, #1c1c2e)", border: `1px solid ${ACC}40`, borderRadius: 12, padding: "12px 20px", color: ACC, cursor: "pointer", fontWeight: 600, whiteSpace: "nowrap" },
  };

  // Library Card Component
  const LibraryCardComponent = ({ game }) => {
    const [localComment, setLocalComment] = useState(game.userComment || "");
    const [localRating, setLocalRating] = useState(game.userRating || 0);
    const saveTimeout = useRef(null);
    
    const handleCommentChange = (e) => {
      const newComment = e.target.value;
      setLocalComment(newComment);
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
      saveTimeout.current = setTimeout(() => updateUserRating(game.id, localRating, newComment), 1000);
    };
    
    const handleRatingChange = (rating) => {
      setLocalRating(rating);
      updateUserRating(game.id, rating, localComment);
    };
    
    useEffect(() => () => { if (saveTimeout.current) clearTimeout(saveTimeout.current); }, []);
    
    return (
      <div style={styles.libraryCard}>
        <div style={styles.libraryCardHeader}>
          <img src={game.img} style={styles.libraryImg} alt={game.name} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4, color: "#fff" }}>{game.name}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 6 }}>{game.developer} · {game.releaseYear}</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
              <select value={game.status} onChange={(e) => updateGameStatus(game.id, e.target.value)} style={styles.selectDark}>
                <option value="wishlist">📝 Wishlist</option>
                <option value="playing">🎮 Playing</option>
                <option value="completed">✅ Completed</option>
              </select>
              <button onClick={() => toggleFavorite(game.id)} style={{ background: favorites.includes(game.id) ? ACC : "rgba(255,255,255,0.08)", border: "none", borderRadius: 6, padding: "6px 12px", color: favorites.includes(game.id) ? "#0a0a0f" : "#fff", fontSize: 11, cursor: "pointer" }}>
                ❤️
              </button>
              <button onClick={() => toggleBacklog(game.id)} style={{ background: backlog.includes(game.id) ? ACC : "rgba(255,255,255,0.08)", border: "none", borderRadius: 6, padding: "6px 12px", color: backlog.includes(game.id) ? "#0a0a0f" : "#fff", fontSize: 11, cursor: "pointer" }}>
                📋
              </button>
              <button onClick={() => removeFromLibrary(game.id)} style={{ background: "rgba(255,0,0,0.2)", border: "none", borderRadius: 6, padding: "6px 12px", color: "#ff6b6b", fontSize: 11, cursor: "pointer" }}>🗑️</button>
            </div>
          </div>
        </div>
        <div style={{ padding: "0 12px 12px 12px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>Your Rating:</span>
            <div style={styles.ratingStars}>
              {[0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10].map(star => (
                <span key={star} style={styles.star(localRating >= star)} onClick={() => handleRatingChange(star)}>
                  {star % 1 === 0 ? "★" : "½"}
                </span>
              ))}
            </div>
            {localRating > 0 && <span style={{ fontSize: 11, color: ACC }}>{localRating}/10</span>}
          </div>
          <textarea style={styles.commentInput} placeholder="Your review..." value={localComment} onChange={handleCommentChange} rows={2} />
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 6 }}>Global: ★ {game.rating}/10</div>
        </div>
      </div>
    );
  };

  const renderGameCard = (game, showButtons = false) => {
    const inLibrary = library.some(g => g.id === game.id);
    return (
      <div key={game.id} style={styles.gameCard} onMouseEnter={e => handleCardHover(game, e)} onMouseLeave={handleCardLeave}>
        <div style={{ position: "relative" }}>
          <img src={game.img} style={styles.gameImg} onError={e => { e.target.src = `https://placehold.co/300x400/1c1c2e/ffd400?text=${encodeURIComponent(game.name?.slice(0,4) || "Game")}`; }} />
          <div style={{ position: "absolute", top: 6, right: 6, background: "rgba(0,0,0,0.85)", borderRadius: 6, padding: "3px 8px", fontSize: 11, fontWeight: 700, color: ACC }}>{game.rating?.toFixed(1)}</div>
          <div style={{ position: "absolute", top: 6, left: 6, display: "flex", gap: 4 }}>
            {favorites.includes(game.id) && <span style={{ fontSize: 14 }}>❤️</span>}
            {backlog.includes(game.id) && <span style={{ fontSize: 14 }}>📋</span>}
          </div>
        </div>
        <div style={styles.gameInfo}>
          <div style={styles.gameName}>{game.name}</div>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {game.genre?.slice(0, 2).map(g => <span key={g} style={{ ...styles.badge(), fontSize: 8 }}>{g}</span>)}
          </div>
          {showButtons && (
            <button style={styles.addBtn} onClick={(e) => { e.stopPropagation(); addToLibrary(game, "wishlist"); }}>
              {inLibrary ? "✓ In Library" : "+ Add"}
            </button>
          )}
        </div>
      </div>
    );
  };

  const hoverPanelPos = useMemo(() => {
    if (!hoverPos.winW) return {};
    const panelW = 560;
    const right = hoverPos.winW - hoverPos.x;
    if (right > panelW + 20) return { left: hoverPos.x + 12, top: Math.max(10, hoverPos.y - 20) };
    return { right: hoverPos.winW - hoverPos.left + 12, top: Math.max(10, hoverPos.y - 20) };
  }, [hoverPos]);

  return (
    <div style={styles.app}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <div style={styles.logo}>🎮 NexPlay</div>
            <div style={styles.tagline}>Find • Track • Review • Discover</div>
          </div>
          <div style={styles.navButtons}>
            <button style={styles.navBtn(currentPage === "home")} onClick={() => setCurrentPage("home")}>🏠 Home</button>
            <button style={styles.navBtn(currentPage === "trending")} onClick={() => setCurrentPage("trending")}>📈 Trending</button>
            <button style={styles.navBtn(currentPage === "library")} onClick={() => setCurrentPage("library")}>📚 Library ({library.length})</button>
            <button style={styles.navBtn(currentPage === "profile")} onClick={() => setCurrentPage("profile")}>👤 Profile</button>
            <button style={styles.randomBtn} onClick={() => setShowRandomModal(true)}>🎲 Random</button>
          </div>
        </div>

        {/* AI SEARCH BAR (DeepSeek ready) */}
        <div style={{ margin: "20px 0", display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div style={styles.aiSearchRow}>
            <input style={styles.aiInput} placeholder="🔍 Natural language search (e.g., 'I want something like Firewatch but darker')" value={aiSearchQuery} onChange={e => setAiSearchQuery(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleAiSearch()} />
            <button style={styles.aiButton} onClick={handleAiSearch} disabled={isAiSearching}>
              {isAiSearching ? "🤔 Thinking..." : "✨ AI Search"}
            </button>
          </div>
        </div>

        {/* TRENDING PAGE */}
        {currentPage === "trending" && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20 }}>📈 Trending Now</h2>
            <div style={styles.grid}>{trendingGames.map(g => renderGameCard(g, true))}</div>
          </div>
        )}

        {/* PROFILE PAGE */}
        {currentPage === "profile" && (
          <div>
            <div style={styles.profileHeader}>
              <div style={styles.profileAvatar}>{profile.avatar}</div>
              <div style={{ flex: 1 }}>
                <div style={styles.profileUsername}>{profile.username}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 12 }}>Member since: {new Date(profile.joinDate).toLocaleDateString()}</div>
                <button style={styles.filterBtn(true)} onClick={() => setShowEditProfile(true)}>✏️ Edit Profile</button>
                <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginTop: 16 }}>
                  <div><div style={styles.statNumber}>{libraryStats.total}</div><div style={styles.statLabel}>Games</div></div>
                  <div><div style={styles.statNumber}>{libraryStats.completed}</div><div style={styles.statLabel}>Completed</div></div>
                  <div><div style={styles.statNumber}>{profile.achievements.avgRating}</div><div style={styles.statLabel}>Avg Rating</div></div>
                  <div><div style={styles.statNumber}>{libraryStats.favorites}</div><div style={styles.statLabel}>Favorites</div></div>
                  <div><div style={styles.statNumber}>{libraryStats.backlog}</div><div style={styles.statLabel}>Backlog</div></div>
                </div>
              </div>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
              <div style={styles.statCard}><div style={styles.statNumber}>{profile.favoriteGenre || "—"}</div><div style={styles.statLabel}>Favorite Genre</div></div>
              <div style={styles.statCard}><div style={styles.statNumber}>{profile.favoriteMood || "—"}</div><div style={styles.statLabel}>Favorite Mood</div></div>
            </div>
            
            <div style={styles.sectionLabel}>🏆 Achievements</div>
            <div style={styles.achievementsGrid}>
              <div style={styles.achievementCard}><div style={styles.achievementIcon}>🏅</div><div>First Game</div>{library.length >= 1 && <div style={{ color: ACC }}>✓</div>}</div>
              <div style={styles.achievementCard}><div style={styles.achievementIcon}>⭐</div><div>Rater (5+)</div>{profile.achievements.totalRatings >= 5 && <div style={{ color: ACC }}>✓</div>}</div>
              <div style={styles.achievementCard}><div style={styles.achievementIcon}>🎮</div><div>Collector (10+)</div>{library.length >= 10 && <div style={{ color: ACC }}>✓</div>}</div>
              <div style={styles.achievementCard}><div style={styles.achievementIcon}>✅</div><div>Completionist (5+)</div>{profile.achievements.gamesCompleted >= 5 && <div style={{ color: ACC }}>✓</div>}</div>
            </div>
            
            {/* Personalized Recommendations */}
            {personalizedGames.length > 0 && (
              <>
                <div style={styles.sectionLabel}>🎯 Personalized For You</div>
                <div style={styles.grid}>{personalizedGames.slice(0, 10).map(g => renderGameCard(g, true))}</div>
              </>
            )}
          </div>
        )}

        {/* LIBRARY PAGE */}
        {currentPage === "library" && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 10 }}>📚 My Game Library</h2>
            <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
              <div style={styles.statCard}><div style={styles.statNumber}>{libraryStats.total}</div><div>Total</div></div>
              <div style={styles.statCard}><div style={styles.statNumber}>{libraryStats.playing}</div><div>Playing</div></div>
              <div style={styles.statCard}><div style={styles.statNumber}>{libraryStats.completed}</div><div>Completed</div></div>
              <div style={styles.statCard}><div style={styles.statNumber}>{libraryStats.wishlist}</div><div>Wishlist</div></div>
            </div>
            
            <input style={styles.searchBar} placeholder="🔍 Search library..." value={librarySearchQuery} onChange={e => setLibrarySearchQuery(e.target.value)} />
            
            <div style={styles.filterRow}>
              <span>Filter:</span>
              <button style={styles.filterBtn(libraryFilter === "all")} onClick={() => setLibraryFilter("all")}>All</button>
              <button style={styles.filterBtn(libraryFilter === "playing")} onClick={() => setLibraryFilter("playing")}>🎮 Playing</button>
              <button style={styles.filterBtn(libraryFilter === "completed")} onClick={() => setLibraryFilter("completed")}>✅ Completed</button>
              <button style={styles.filterBtn(libraryFilter === "wishlist")} onClick={() => setLibraryFilter("wishlist")}>📝 Wishlist</button>
              <span style={{ marginLeft: "auto" }}>Sort:</span>
              <button style={styles.filterBtn(librarySort === "date")} onClick={() => setLibrarySort("date")}>📅 Date</button>
              <button style={styles.filterBtn(librarySort === "rating")} onClick={() => setLibrarySort("rating")}>⭐ Rating</button>
              <button style={styles.filterBtn(librarySort === "name")} onClick={() => setLibrarySort("name")}>🔤 Name</button>
            </div>
            
            {filteredLibrary.length === 0 ? (
              <div style={{ textAlign: "center", padding: 60, background: CARD, borderRadius: 16 }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
                <div style={{ fontSize: 18, marginBottom: 8 }}>Your library is empty</div>
                <button style={styles.filterBtn(true)} onClick={() => setCurrentPage("home")}>🔍 Browse Games</button>
              </div>
            ) : (
              <div style={styles.libraryGrid}>{filteredLibrary.map(game => <LibraryCardComponent key={game.id} game={game} />)}</div>
            )}
          </div>
        )}

        {/* HOME PAGE - DISCOVER */}
        {currentPage === "home" && (
          <>
            <div style={styles.subNav}>
              {[["discover","🔍 Discover"],["must","🔥 Must Play"],["best","🏆 Best Ever"],["gems","💎 Hidden Gems"]].map(([id, label]) => (
                <button key={id} style={styles.subNavBtn(activeTab === id)} onClick={() => setActiveTab(id)}>{label}</button>
              ))}
            </div>

            {activeTab === "discover" && (
              <>
                {step === 1 && (
                  <div style={styles.stepContainer}>
                    <div style={styles.stepTitle}>What's your mood? 🎭</div>
                    <div style={styles.pillGrid}>{MOODS.map(m => <button key={m} style={styles.pill(selectedMoods.includes(m))} onClick={() => toggle(selectedMoods, setSelectedMoods, m)}>{m}</button>)}</div>
                    <button style={styles.nextBtn} onClick={() => setStep(2)}>Next →</button>
                  </div>
                )}
                {step === 2 && (
                  <div style={styles.stepContainer}>
                    <div style={styles.stepTitle}>Pick your genres 🎮</div>
                    <div style={styles.pillGrid}>{GENRES.map(g => <button key={g} style={styles.pill(selectedGenres.includes(g))} onClick={() => toggle(selectedGenres, setSelectedGenres, g)}>{g}</button>)}</div>
                    <button style={styles.nextBtn} onClick={() => setStep(3)}>Next →</button>
                  </div>
                )}
                {step === 3 && (
                  <div style={styles.stepContainer}>
                    <div style={styles.stepTitle}>How long? ⏱️</div>
                    <div style={styles.pillGrid}>{PLAYTIMES.map(p => <button key={p} style={{ ...styles.pill(selectedPlaytime === p), padding: "10px 20px" }} onClick={() => setSelectedPlaytime(p === selectedPlaytime ? null : p)}>{p}</button>)}</div>
                    <button style={styles.nextBtn} onClick={() => setStep(4)}>Show Results 🚀</button>
                  </div>
                )}
                {step === 4 && (
                  <div>
                    <input style={styles.searchBar} placeholder="🔍 Search games..." value={searchQuery} onChange={e => handleSearch(e.target.value)} />
                    <div style={styles.sortRow}>
                      <span>Sort:</span>
                      {[["score","⚡ Match"],["rating","⭐ Rating"],["year","📅 New"],["popularity","🔥 Popular"]].map(([id, label]) => <button key={id} style={styles.sortBtn(sortBy === id)} onClick={() => setSortBy(id)}>{label}</button>)}
                      <span style={{ marginLeft: "auto" }}>{results.length} games</span>
                    </div>
                    
                    {topPicks.length > 0 && (
                      <div style={{ marginBottom: 28 }}>
                        <div style={styles.sectionLabel}>🎯 Top Picks For You →</div>
                        <div style={styles.topPicksRow}>
                          {topPicks.map((g, i) => (
                            <div key={g.id} style={styles.topPickCard(i)} onMouseEnter={e => handleCardHover(g, e)} onMouseLeave={handleCardLeave}>
                              <div style={{ position: "absolute", top: 10, right: 10, fontSize: 20 }}>{["🥇","🥈","🥉","4","5","6","7","8","9","10"][i]}</div>
                              <div style={{ display: "flex", gap: 12 }}>
                                <img src={g.img} style={{ width: 55, height: 73, objectFit: "cover", borderRadius: 8 }} />
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontWeight: 700, fontSize: 13 }}>{g.name}</div>
                                  <div style={{ fontSize: 11, color: ACC }}>★ {g.rating} · {g.releaseYear}</div>
                                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>{g.description?.slice(0, 60)}…</div>
                                  <button style={styles.addBtn} onClick={(e) => { e.stopPropagation(); addToLibrary(g, "wishlist"); }}>+ Library</button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div style={styles.sectionLabel}>📋 All Results</div>
                    <div style={styles.grid}>{restResults.map(g => renderGameCard(g, true))}</div>
                  </div>
                )}
              </>
            )}
            {activeTab === "must" && <div style={styles.grid}>{mustPlayNow.map(g => renderGameCard(g, true))}</div>}
            {activeTab === "best" && <div style={styles.grid}>{bestAllTime.map(g => renderGameCard(g, true))}</div>}
            {activeTab === "gems" && <div style={styles.grid}>{hiddenGems.map(g => renderGameCard(g, true))}</div>}
          </>
        )}

        {/* EDIT PROFILE MODAL */}
        {showEditProfile && (
          <div style={styles.editModal} onClick={() => setShowEditProfile(false)}>
            <div style={styles.editModalContent} onClick={e => e.stopPropagation()}>
              <h3 style={{ marginBottom: 16, fontSize: 20 }}>Edit Profile</h3>
              <div style={{ textAlign: "center", fontSize: 48, marginBottom: 12 }}>{editAvatar}</div>
              <input style={styles.searchBar} placeholder="Avatar Emoji (🎮, 👾, 🎲)" value={editAvatar} onChange={e => setEditAvatar(e.target.value)} />
              <input style={styles.searchBar} placeholder="Username" value={editUsername} onChange={e => setEditUsername(e.target.value)} />
              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 16 }}>
                <button style={styles.filterBtn(false)} onClick={() => setShowEditProfile(false)}>Cancel</button>
                <button style={styles.filterBtn(true)} onClick={() => { setProfile(prev => ({ ...prev, username: editUsername, avatar: editAvatar })); setShowEditProfile(false); }}>Save</button>
              </div>
            </div>
          </div>
        )}

        {/* RANDOM MODAL */}
        {showRandomModal && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.96)", zIndex: 2000, overflow: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "20px 28px", borderBottom: `1px solid ${ACC}30` }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: ACC }}>🎲 Random Game Generator</div>
              <button style={{ background: "none", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8, color: "#fff", padding: "8px 16px", cursor: "pointer" }} onClick={() => setShowRandomModal(false)}>✕ Close</button>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 24, padding: 28 }}>
              <div style={{ width: 280, background: CARD, borderRadius: 16, padding: 20 }}>
                <h3 style={{ marginBottom: 16 }}>Filters</h3>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, color: ACC }}>⭐ Min Rating</div>
                  <input type="range" min={0} max={10} step={0.5} value={randomFilters.minRating} onChange={e => setRandomFilters(prev => ({ ...prev, minRating: parseFloat(e.target.value) }))} style={{ width: "100%", accentColor: ACC }} />
                  <div>{randomFilters.minRating} - {randomFilters.maxRating}</div>
                </div>
                <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}><input type="checkbox" checked={randomFilters.excludeHorror} onChange={e => setRandomFilters(prev => ({ ...prev, excludeHorror: e.target.checked }))} /> Exclude Horror</label>
                <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}><input type="checkbox" checked={randomFilters.excludeIndie} onChange={e => setRandomFilters(prev => ({ ...prev, excludeIndie: e.target.checked }))} /> Exclude Indie</label>
                <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}><input type="checkbox" checked={randomFilters.excludeOldGames} onChange={e => setRandomFilters(prev => ({ ...prev, excludeOldGames: e.target.checked }))} /> Exclude before 2015</label>
                <button style={{ ...styles.filterBtn(true), width: "100%", marginTop: 16 }} onClick={() => { doRandom(); }}>🎲 Generate</button>
              </div>
              {randomGame && (
                <div style={{ flex: 1, background: CARD, borderRadius: 16, padding: 24 }}>
                  <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                    <img src={randomGame.img} style={{ width: 160, borderRadius: 12 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>{randomGame.name}</div>
                      <div style={{ fontSize: 14, color: ACC, marginBottom: 12 }}>★ {randomGame.rating} · {randomGame.releaseYear}</div>
                      <div style={{ fontSize: 13, lineHeight: 1.5, marginBottom: 16 }}>{randomGame.description}</div>
                      <button style={styles.addBtn} onClick={() => { addToLibrary(randomGame, "wishlist"); setShowRandomModal(false); }}>+ Add to Library</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* HOVER PANEL */}
        {hoveredGame && (
          <div ref={hoverPanelRef} style={{ ...styles.hoverPanel, ...hoverPanelPos }} onMouseLeave={handleCardLeave}>
            <div style={{ width: 200, background: "#0a0a0f" }}>
              <iframe src={`${hoveredGame.trailer}?autoplay=1&mute=1&controls=0&loop=1`} style={{ width: "100%", height: 260, border: "none" }} allow="autoplay" title={hoveredGame.name} />
            </div>
            <div style={{ flex: 1, padding: "14px", maxHeight: 340, overflow: "auto" }}>
              <div style={{ fontWeight: 800, fontSize: 15 }}>{hoveredGame.name}</div>
              <div style={{ fontSize: 11, color: ACC, marginBottom: 6 }}>★ {hoveredGame.rating} · {hoveredGame.releaseYear}</div>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 6 }}>
                {hoveredGame.genre?.slice(0, 3).map(g => <span key={g} style={{ background: `${ACC}20`, padding: "2px 8px", borderRadius: 12, fontSize: 9, color: ACC }}>{g}</span>)}
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", lineHeight: 1.4 }}>{hoveredGame.description?.slice(0, 120)}…</div>
              <button style={styles.addBtn} onClick={() => addToLibrary(hoveredGame, "wishlist")}>+ Add to Library</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}