const STEAM_API_KEY = '787B1E8A4730B5CFD4E80FD6CAC33F64';

export default async function handler(req, res) {
  // CORS-Header
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { action, steamId } = req.query;

  if (action === 'getGames') {
    if (!steamId) {
      return res.status(400).json({ error: 'Missing steamId' });
    }
    
    try {
      const url = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${STEAM_API_KEY}&steamid=${steamId}&include_appinfo=true&format=json`;
      const response = await fetch(url);
      const data = await response.json();
      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(400).json({ error: 'Invalid action. Use action=getGames' });
}