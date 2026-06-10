import { useState, useCallback, useMemo, useRef, useEffect } from "react";

const GAMES = [
  { id:1, name:"The Walking Dead: Season One", rating:9.2, trailer:"https://www.youtube.com/embed/N40uY51s5Z0", mood:["Emotional","Story Rich"], genre:["Adventure","Story Rich"], playtime:"10-15h", description:"Begleite Lee Everett und Clementine in einer der emotionalsten Geschichten der Gaming-Geschichte.", developer:"Telltale Games", releaseYear:2012, platforms:["PC","PS4","Xbox","Switch"], popularity:95, img:"https://cdn.cloudflare.steamstatic.com/steam/apps/207610/header.jpg" },
  { id:2, name:"The Walking Dead: Season Two", rating:8.9, trailer:"https://www.youtube.com/embed/q_0f0D4Jqtw", mood:["Emotional","Dark"], genre:["Adventure","Story Rich"], playtime:"8-12h", description:"Clementine ist nun die Hauptfigur und muss alleine überleben.", developer:"Telltale Games", releaseYear:2013, platforms:["PC","PS4","Xbox","Switch"], popularity:90, img:"https://cdn.cloudflare.steamstatic.com/steam/apps/261030/header.jpg" },
  { id:3, name:"Life is Strange", rating:9.1, trailer:"https://www.youtube.com/embed/AURVxvIZrmU", mood:["Emotional","Mystery"], genre:["Adventure","Choices Matter"], playtime:"10-15h", description:"Max Caulfield entdeckt, dass sie die Zeit zurückdrehen kann.", developer:"Dontnod", releaseYear:2015, platforms:["PC","PS4","Xbox","Mobile"], popularity:94, img:"https://cdn.cloudflare.steamstatic.com/steam/apps/319630/header.jpg" },
  { id:4, name:"The Last of Us Part I", rating:9.5, trailer:"https://www.youtube.com/embed/bC3B5pgFxTc", mood:["Emotional","Sad"], genre:["Action","Adventure"], playtime:"15-20h", description:"Joel soll Ellie quer durch die zerstörte USA schmuggeln.", developer:"Naughty Dog", releaseYear:2013, platforms:["PS5","PS4","PC"], popularity:99, img:"https://cdn.cloudflare.steamstatic.com/steam/apps/1888930/header.jpg" },
  { id:5, name:"Red Dead Redemption 2", rating:9.7, trailer:"https://www.youtube.com/embed/gmA6MrX81z4", mood:["Epic","Atmospheric"], genre:["Action","Open World"], playtime:"60-100h", description:"Arthur Morgan navigiert durch die sterbende Ära des Wilden Westens.", developer:"Rockstar Games", releaseYear:2018, platforms:["PS4","Xbox One","PC"], popularity:99, img:"https://cdn.cloudflare.steamstatic.com/steam/apps/1174180/header.jpg" },
  { id:6, name:"The Witcher 3", rating:9.6, trailer:"https://www.youtube.com/embed/c0i88t0Kacs", mood:["Epic","Fantasy"], genre:["RPG","Open World"], playtime:"100h+", description:"Geralt von Rivia sucht nach seiner Adoptivtochter Ciri.", developer:"CD Projekt Red", releaseYear:2015, platforms:["PC","PS4","Xbox","Switch"], popularity:99, img:"https://cdn.cloudflare.steamstatic.com/steam/apps/292030/header.jpg" },
  { id:7, name:"Elden Ring", rating:9.5, trailer:"https://www.youtube.com/embed/E3Huy2cdih0", mood:["Dark","Exploration"], genre:["Action","RPG"], playtime:"60-100h", description:"Erkunde die Zwischenlande und besiege mächtige Bosse.", developer:"FromSoftware", releaseYear:2022, platforms:["PS5","PS4","Xbox","PC"], popularity:99, img:"https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/header.jpg" },
  { id:8, name:"Baldur's Gate 3", rating:9.8, trailer:"https://www.youtube.com/embed/IMd7YMFtaN8", mood:["Epic","Fantasy"], genre:["RPG","Turn Based"], playtime:"100h+", description:"Das ultimative D&D-Erlebnis.", developer:"Larian Studios", releaseYear:2023, platforms:["PC","PS5","Xbox"], popularity:99, img:"https://cdn.cloudflare.steamstatic.com/steam/apps/1086940/header.jpg" },
];

const MOODS = ["Emotional","Sad","Happy","Relaxing","Cozy","Action","Story Rich","Dark","Mystery","Epic","Atmospheric","Fantasy"];
const GENRES = ["Action","Adventure","RPG","Open World","Story Rich","Horror","Puzzle","Platformer","Strategy","Indie","Roguelite","Metroidvania"];
const PLAYTIMES = ["Under 3h","3-5h","5-10h","10-20h","20-40h","40-60h","60-100h","100h+"];

function scoreGame(game, moods, genres, playtime) {
  let score = 0;
  if (moods.length > 0) {
    const matches = moods.filter(m => game.mood?.includes(m)).length;
    score += Math.round((matches / moods.length) * 40);
  } else score += 20;
  if (genres.length > 0) {
    const matches = genres.filter(g => game.genre?.includes(g)).length;
    score += Math.round((matches / genres.length) * 40);
  } else score += 20;
  if (playtime && game.playtime === playtime) score += 20;
  score += (game.rating * 2);
  return Math.min(100, score);
}

export default function NexPlay() {
  const [page, setPage] = useState("home");
  const [library, setLibrary] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [step, setStep] = useState(1);
  const [selectedMoods, setSelectedMoods] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedPlaytime, setSelectedPlaytime] = useState(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("score");
  const [hoveredGame, setHoveredGame] = useState(null);
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });
  const hoverTimer = useRef(null);
  const [showRandom, setShowRandom] = useState(false);
  const [randomGame, setRandomGame] = useState(null);
  const [activeTab, setActiveTab] = useState("discover");
  const [libraryFilter, setLibraryFilter] = useState("all");

  useEffect(() => {
    const savedLib = localStorage.getItem("library");
    const savedFav = localStorage.getItem("favorites");
    if (savedLib) setLibrary(JSON.parse(savedLib));
    if (savedFav) setFavorites(JSON.parse(savedFav));
  }, []);

  useEffect(() => {
    localStorage.setItem("library", JSON.stringify(library));
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [library, favorites]);

  const addToLibrary = (game, status = "wishlist") => {
    if (library.find(g => g.id === game.id)) return;
    setLibrary([...library, { ...game, status, userRating: null, userComment: "", dateAdded: new Date().toISOString() }]);
  };

  const removeFromLibrary = (id) => setLibrary(library.filter(g => g.id !== id));
  const updateStatus = (id, status) => setLibrary(library.map(g => g.id === id ? { ...g, status } : g));
  const updateRating = (id, rating, comment) => setLibrary(library.map(g => g.id === id ? { ...g, userRating: rating, userComment: comment } : g));
  const toggleFavorite = (id) => setFavorites(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

  const filteredLibrary = useMemo(() => {
    let filtered = [...library];
    if (libraryFilter === "playing") filtered = filtered.filter(g => g.status === "playing");
    if (libraryFilter === "completed") filtered = filtered.filter(g => g.status === "completed");
    if (libraryFilter === "wishlist") filtered = filtered.filter(g => g.status === "wishlist");
    return filtered;
  }, [library, libraryFilter]);

  const results = useMemo(() => {
    let list = GAMES.map(g => ({ ...g, score: scoreGame(g, selectedMoods, selectedGenres, selectedPlaytime) }));
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(g => g.name.toLowerCase().includes(q));
    }
    if (sortBy === "score") list.sort((a, b) => b.score - a.score);
    if (sortBy === "rating") list.sort((a, b) => b.rating - a.rating);
    if (sortBy === "year") list.sort((a, b) => b.releaseYear - a.releaseYear);
    return list;
  }, [selectedMoods, selectedGenres, selectedPlaytime, search, sortBy]);

  const topPicks = results.slice(0, 5);
  const restResults = results.slice(5);
  const trending = [...GAMES].sort((a,b) => b.popularity - a.popularity).slice(0, 20);
  const bestEver = [...GAMES].sort((a,b) => b.rating - a.rating).slice(0, 20);
  const hiddenGems = [...GAMES].filter(g => g.rating >= 9.0 && g.popularity < 90).slice(0, 15);

  const doRandom = () => {
    const random = GAMES[Math.floor(Math.random() * GAMES.length)];
    setRandomGame(random);
    setShowRandom(true);
  };

  const toggle = (arr, setArr, val) => setArr(prev => prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val]);

  const handleHover = (game, e) => {
    clearTimeout(hoverTimer.current);
    const rect = e.currentTarget.getBoundingClientRect();
    hoverTimer.current = setTimeout(() => {
      setHoveredGame(game);
      setHoverPos({ x: rect.right, y: rect.top, winW: window.innerWidth });
    }, 500);
  };

  const leaveHover = () => {
    clearTimeout(hoverTimer.current);
    setTimeout(() => setHoveredGame(null), 200);
  };

  const ACC = "#ffd400";
  const BG = "#0a0a0f";
  const CARD = "#1c1c2e";

  const styles = {
    app: { background: BG, minHeight: "100vh", width: "100%", margin: 0, padding: 0 },
    container: { maxWidth: 1200, margin: "0 auto", padding: "0 20px" },
    header: { padding: "20px 0", borderBottom: `1px solid ${ACC}20`, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10 },
    logo: { fontSize: 28, fontWeight: 800, color: ACC },
    nav: { display: "flex", gap: 10, flexWrap: "wrap" },
    navBtn: (active) => ({ background: active ? ACC : "rgba(255,255,255,0.05)", border: "none", borderRadius: 10, padding: "10px 20px", color: active ? BG : "#fff", cursor: "pointer", fontWeight: 600 }),
    randomBtn: { background: `${ACC}20`, border: `1px solid ${ACC}`, borderRadius: 10, padding: "10px 20px", color: ACC, cursor: "pointer", fontWeight: 600 },
    subNav: { display: "flex", gap: 4, borderBottom: `1px solid rgba(255,255,255,0.1)`, marginTop: 20, overflowX: "auto" },
    subNavBtn: (active) => ({ background: "none", border: "none", borderBottom: active ? `2px solid ${ACC}` : "2px solid transparent", color: active ? ACC : "#aaa", padding: "10px 16px", cursor: "pointer" }),
    stepContainer: { padding: "40px 0", maxWidth: 800, margin: "0 auto" },
    stepTitle: { fontSize: 28, fontWeight: 700, marginBottom: 20 },
    pillGrid: { display: "flex", flexWrap: "wrap", gap: 10, maxHeight: 300, overflowY: "auto", marginBottom: 30 },
    pill: (selected) => ({ background: selected ? ACC : "rgba(255,255,255,0.05)", border: `1px solid ${selected ? ACC : "rgba(255,255,255,0.1)"}`, borderRadius: 30, padding: "8px 18px", cursor: "pointer", color: selected ? BG : "#fff", fontWeight: selected ? 600 : 400 }),
    nextBtn: { background: ACC, border: "none", borderRadius: 10, padding: "12px 30px", fontSize: 16, fontWeight: 700, cursor: "pointer", color: BG },
    searchBar: { background: CARD, border: `1px solid rgba(255,255,255,0.1)`, borderRadius: 10, padding: "12px 16px", color: "#fff", width: "100%", marginBottom: 20 },
    filterRow: { display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20, alignItems: "center" },
    filterBtn: (active) => ({ background: active ? ACC : "rgba(255,255,255,0.05)", border: "none", borderRadius: 8, padding: "6px 14px", cursor: "pointer", color: active ? BG : "#fff" }),
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 16 },
    gameCard: { background: CARD, borderRadius: 12, overflow: "hidden", cursor: "pointer", border: "1px solid rgba(255,255,255,0.05)" },
    gameImg: { width: "100%", aspectRatio: "3/4", objectFit: "cover" },
    gameInfo: { padding: "10px" },
    gameName: { fontSize: 13, fontWeight: 600, marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden" },
    addBtn: { background: ACC, border: "none", borderRadius: 8, padding: "6px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer", width: "100%", marginTop: 8, color: BG },
    topPicksRow: { display: "flex", gap: 16, overflowX: "auto", marginBottom: 30, paddingBottom: 10 },
    topPickCard: { minWidth: 260, background: CARD, borderRadius: 12, padding: "12px", cursor: "pointer", position: "relative" },
    sectionLabel: { fontSize: 12, fontWeight: 700, color: ACC, marginBottom: 16, textTransform: "uppercase" },
    libraryGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 },
    libraryCard: { background: CARD, borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,0.05)" },
    libraryHeader: { display: "flex", gap: 12, padding: 12 },
    libraryImg: { width: 70, height: 93, objectFit: "cover", borderRadius: 8 },
    ratingStars: { display: "flex", gap: 4, marginTop: 8, flexWrap: "wrap" },
    star: (filled) => ({ fontSize: 18, cursor: "pointer", color: filled ? ACC : "rgba(255,255,255,0.2)" }),
    commentInput: { width: "100%", background: "rgba(255,255,255,0.05)", border: "none", borderRadius: 8, padding: "8px", color: "#fff", marginTop: 8, fontSize: 11 },
    statCard: { background: CARD, borderRadius: 12, padding: "16px", textAlign: "center", minWidth: 100 },
    statNumber: { fontSize: 28, fontWeight: 800, color: ACC },
    hoverPanel: { position: "fixed", zIndex: 1000, background: "#1a1a2a", border: `1px solid ${ACC}`, borderRadius: 12, display: "flex", maxWidth: 500, overflow: "hidden", boxShadow: "0 10px 40px rgba(0,0,0,0.5)" },
  };

  const LibraryCard = ({ game }) => {
    const [rating, setRating] = useState(game.userRating || 0);
    const [comment, setComment] = useState(game.userComment || "");
    const timeout = useRef(null);
    const handleComment = (e) => {
      setComment(e.target.value);
      if (timeout.current) clearTimeout(timeout.current);
      timeout.current = setTimeout(() => updateRating(game.id, rating, e.target.value), 1000);
    };
    return (
      <div style={styles.libraryCard}>
        <div style={styles.libraryHeader}>
          <img src={game.img} style={styles.libraryImg} alt={game.name} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700 }}>{game.name}</div>
            <div style={{ fontSize: 11, color: "#aaa" }}>{game.developer} · {game.releaseYear}</div>
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <select value={game.status} onChange={e => updateStatus(game.id, e.target.value)} style={styles.filterBtn(false)}>
                <option value="wishlist">📝 Wishlist</option>
                <option value="playing">🎮 Playing</option>
                <option value="completed">✅ Completed</option>
              </select>
              <button onClick={() => toggleFavorite(game.id)} style={styles.filterBtn(favorites.includes(game.id))}>❤️</button>
              <button onClick={() => removeFromLibrary(game.id)} style={{ background: "#ff000020", border: "none", borderRadius: 6, padding: "6px 12px", color: "#ff6b6b", cursor: "pointer" }}>🗑️</button>
            </div>
          </div>
        </div>
        <div style={{ padding: "0 12px 12px 12px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={styles.ratingStars}>
            {[0.5,1,1.5,2,2.5,3,3.5,4,4.5,5,5.5,6,6.5,7,7.5,8,8.5,9,9.5,10].map(s => (
              <span key={s} style={styles.star(rating >= s)} onClick={() => { setRating(s); updateRating(game.id, s, comment); }}>{s % 1 === 0 ? "★" : "½"}</span>
            ))}
          </div>
          <textarea style={styles.commentInput} placeholder="Your review..." value={comment} onChange={handleComment} rows={2} />
          <div style={{ fontSize: 10, color: "#555", marginTop: 6 }}>Global: ★ {game.rating}/10</div>
        </div>
      </div>
    );
  };

  const GameCard = ({ game, showBtn = false }) => {
    const inLib = library.some(g => g.id === game.id);
    return (
      <div style={styles.gameCard} onMouseEnter={e => handleHover(game, e)} onMouseLeave={leaveHover}>
        <img src={game.img} style={styles.gameImg} onError={e => e.target.src = "https://placehold.co/300x400/1c1c2e/ffd400?text=Game"} />
        <div style={styles.gameInfo}>
          <div style={styles.gameName}>{game.name}</div>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {game.genre?.slice(0, 2).map(g => <span key={g} style={{ fontSize: 9, background: "rgba(255,255,255,0.1)", padding: "2px 6px", borderRadius: 10 }}>{g}</span>)}
          </div>
          {showBtn && <button style={styles.addBtn} onClick={(e) => { e.stopPropagation(); addToLibrary(game); }}>{inLib ? "✓ In Library" : "+ Add"}</button>}
        </div>
      </div>
    );
  };

  const hoverPanelPos = hoveredGame ? {
    left: hoverPos.x + 10,
    top: Math.max(10, hoverPos.y - 100),
    ...(hoverPos.x + 500 > (hoverPos.winW || 1200) ? { right: 10, left: "auto" } : {})
  } : {};

  const stats = {
    total: library.length,
    playing: library.filter(g => g.status === "playing").length,
    completed: library.filter(g => g.status === "completed").length,
    wishlist: library.filter(g => g.status === "wishlist").length,
    favorites: favorites.length,
  };

  const profile = {
    username: "Gamer",
    avatar: "🎮",
    achievements: {
      gamesCompleted: library.filter(g => g.status === "completed").length,
      totalRatings: library.filter(g => g.userRating && g.userRating > 0).length,
      avgRating: library.filter(g => g.userRating && g.userRating > 0).reduce((sum, g) => sum + (g.userRating || 0), 0) / (library.filter(g => g.userRating && g.userRating > 0).length || 1)
    }
  };

  return (
    <div style={styles.app}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div><div style={styles.logo}>🎮 NexPlay</div><div style={{ fontSize: 11, color: "#666" }}>Find • Track • Review</div></div>
          <div style={styles.nav}>
            <button style={styles.navBtn(page === "home")} onClick={() => setPage("home")}>🏠 Home</button>
            <button style={styles.navBtn(page === "library")} onClick={() => setPage("library")}>📚 Library ({library.length})</button>
            <button style={styles.navBtn(page === "profile")} onClick={() => setPage("profile")}>👤 Profile</button>
            <button style={styles.randomBtn} onClick={doRandom}>🎲 Random</button>
          </div>
        </div>

        {page === "home" && (
          <>
            <div style={styles.subNav}>
              {[["discover","🔍 Discover"],["trending","📈 Trending"],["best","🏆 Best Ever"],["gems","💎 Hidden Gems"]].map(([id, label]) => (
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
                    <div style={styles.pillGrid}>{PLAYTIMES.map(p => <button key={p} style={styles.pill(selectedPlaytime === p)} onClick={() => setSelectedPlaytime(p === selectedPlaytime ? null : p)}>{p}</button>)}</div>
                    <button style={styles.nextBtn} onClick={() => setStep(4)}>Show Results 🚀</button>
                  </div>
                )}
                {step === 4 && (
                  <div>
                    <input style={styles.searchBar} placeholder="🔍 Search games..." value={search} onChange={e => setSearch(e.target.value)} />
                    <div style={styles.filterRow}>
                      <span>Sort:</span>
                      <button style={styles.filterBtn(sortBy === "score")} onClick={() => setSortBy("score")}>⚡ Best Match</button>
                      <button style={styles.filterBtn(sortBy === "rating")} onClick={() => setSortBy("rating")}>⭐ Rating</button>
                      <button style={styles.filterBtn(sortBy === "year")} onClick={() => setSortBy("year")}>📅 Newest</button>
                      <span style={{ marginLeft: "auto" }}>{results.length} games</span>
                    </div>
                    {topPicks.length > 0 && (
                      <div style={{ marginBottom: 30 }}>
                        <div style={styles.sectionLabel}>🎯 Top Picks For You →</div>
                        <div style={styles.topPicksRow}>
                          {topPicks.map((g, i) => (
                            <div key={g.id} style={styles.topPickCard} onMouseEnter={e => handleHover(g, e)} onMouseLeave={leaveHover}>
                              <div style={{ position: "absolute", top: 5, left: 5, fontSize: 20 }}>{["🥇","🥈","🥉","4","5"][i]}</div>
                              <img src={g.img} style={{ width: "100%", height: 100, objectFit: "cover", borderRadius: 8 }} />
                              <div style={{ fontWeight: 700, marginTop: 8 }}>{g.name}</div>
                              <div style={{ fontSize: 11, color: ACC }}>★ {g.rating}</div>
                              <button style={styles.addBtn} onClick={(e) => { e.stopPropagation(); addToLibrary(g); }}>+ Library</button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div style={styles.sectionLabel}>📋 All Results</div>
                    <div style={styles.grid}>{restResults.map(g => <GameCard key={g.id} game={g} showBtn={true} />)}</div>
                  </div>
                )}
              </>
            )}
            {activeTab === "trending" && <div style={styles.grid}>{trending.map(g => <GameCard key={g.id} game={g} showBtn={true} />)}</div>}
            {activeTab === "best" && <div style={styles.grid}>{bestEver.map(g => <GameCard key={g.id} game={g} showBtn={true} />)}</div>}
            {activeTab === "gems" && <div style={styles.grid}>{hiddenGems.map(g => <GameCard key={g.id} game={g} showBtn={true} />)}</div>}
          </>
        )}

        {page === "library" && (
          <div>
            <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
              <div style={styles.statCard}><div style={styles.statNumber}>{stats.total}</div><div>Total</div></div>
              <div style={styles.statCard}><div style={styles.statNumber}>{stats.playing}</div><div>Playing</div></div>
              <div style={styles.statCard}><div style={styles.statNumber}>{stats.completed}</div><div>Completed</div></div>
              <div style={styles.statCard}><div style={styles.statNumber}>{stats.wishlist}</div><div>Wishlist</div></div>
            </div>
            <div style={styles.filterRow}>
              <button style={styles.filterBtn(libraryFilter === "all")} onClick={() => setLibraryFilter("all")}>All</button>
              <button style={styles.filterBtn(libraryFilter === "playing")} onClick={() => setLibraryFilter("playing")}>🎮 Playing</button>
              <button style={styles.filterBtn(libraryFilter === "completed")} onClick={() => setLibraryFilter("completed")}>✅ Completed</button>
              <button style={styles.filterBtn(libraryFilter === "wishlist")} onClick={() => setLibraryFilter("wishlist")}>📝 Wishlist</button>
            </div>
            {filteredLibrary.length === 0 ? (
              <div style={{ textAlign: "center", padding: 60, background: CARD, borderRadius: 16 }}>
                <div style={{ fontSize: 48 }}>📭</div>
                <div>Your library is empty</div>
                <button style={styles.filterBtn(true)} onClick={() => setPage("home")}>Browse Games</button>
              </div>
            ) : (
              <div style={styles.libraryGrid}>{filteredLibrary.map(g => <LibraryCard key={g.id} game={g} />)}</div>
            )}
          </div>
        )}

        {page === "profile" && (
          <div>
            <div style={{ display: "flex", gap: 24, alignItems: "center", background: CARD, borderRadius: 20, padding: 24, marginBottom: 24 }}>
              <div style={{ fontSize: 70, background: `${ACC}20`, borderRadius: "50%", padding: 20 }}>{profile.avatar}</div>
              <div>
                <div style={{ fontSize: 28, fontWeight: 800 }}>{profile.username}</div>
                <div style={{ display: "flex", gap: 20, marginTop: 16 }}>
                  <div><div style={styles.statNumber}>{stats.total}</div><div>Games</div></div>
                  <div><div style={styles.statNumber}>{stats.completed}</div><div>Completed</div></div>
                  <div><div style={styles.statNumber}>{profile.achievements.avgRating.toFixed(1)}</div><div>Avg Rating</div></div>
                </div>
              </div>
            </div>
            <div style={styles.sectionLabel}>🏆 Achievements</div>
            <div style={styles.grid}>
              <div style={styles.statCard}><div>🏅 First Game</div>{stats.total >= 1 && <div style={{ color: ACC }}>✓</div>}</div>
              <div style={styles.statCard}><div>⭐ Rater</div>{profile.achievements.totalRatings >= 5 && <div style={{ color: ACC }}>✓</div>}</div>
              <div style={styles.statCard}><div>🎮 Collector</div>{stats.total >= 10 && <div style={{ color: ACC }}>✓</div>}</div>
              <div style={styles.statCard}><div>✅ Completionist</div>{stats.completed >= 5 && <div style={{ color: ACC }}>✓</div>}</div>
            </div>
          </div>
        )}

        {showRandom && randomGame && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.95)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ background: CARD, borderRadius: 20, maxWidth: 500, width: "90%", padding: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: ACC }}>🎲 Random Game</div>
                <button style={{ background: "none", border: "none", color: "#fff", fontSize: 20, cursor: "pointer" }} onClick={() => setShowRandom(false)}>✕</button>
              </div>
              <img src={randomGame.img} style={{ width: "100%", borderRadius: 12 }} />
              <div style={{ fontSize: 20, fontWeight: 700, marginTop: 12 }}>{randomGame.name}</div>
              <div style={{ fontSize: 14, color: ACC }}>★ {randomGame.rating} · {randomGame.releaseYear}</div>
              <div style={{ fontSize: 13, marginTop: 12 }}>{randomGame.description}</div>
              <button style={styles.addBtn} onClick={() => { addToLibrary(randomGame); setShowRandom(false); }}>+ Add to Library</button>
              <button style={{ ...styles.filterBtn(false), marginTop: 8, width: "100%" }} onClick={doRandom}>🎲 Roll Again</button>
            </div>
          </div>
        )}

        {hoveredGame && (
          <div style={{ ...styles.hoverPanel, ...hoverPanelPos }}>
            <img src={hoveredGame.img} style={{ width: 180, height: 240, objectFit: "cover" }} />
            <div style={{ padding: 12, flex: 1 }}>
              <div style={{ fontWeight: 700 }}>{hoveredGame.name}</div>
              <div style={{ fontSize: 11, color: ACC }}>★ {hoveredGame.rating} · {hoveredGame.releaseYear}</div>
              <div style={{ fontSize: 10, marginTop: 8 }}>{hoveredGame.description?.slice(0, 100)}…</div>
              <button style={styles.addBtn} onClick={() => addToLibrary(hoveredGame)}>+ Add</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}