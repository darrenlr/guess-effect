import getConfig from 'next/config';

const { serverRuntimeConfig } = getConfig();

const clientId = serverRuntimeConfig.IGDB_CLIENT_ID;
const clientSecret = serverRuntimeConfig.IGDB_CLIENT_SECRET

let accessToken = null;
let expiryDate = null;

async function getAccessToken() {
  if (accessToken && new Date() < expiryDate) {
    return accessToken;
  }

  // Otherwise, fetch a new token
  const response = await fetch('https://id.twitch.tv/oauth2/token', {
    method: 'POST',
    body: new URLSearchParams({
      client_id: `${clientId}`,
      client_secret: `${clientSecret}`,
      grant_type: 'client_credentials',
    }),
  });

  const data = await response.json();

  accessToken = data.access_token;
  expiryDate = new Date(new Date().getTime() + (data.expires_in - 60) * 1000);

  return accessToken;
}

export default async (req, res) => {
    const { search } = req.query;
    const igdbEndpoint = "https://api.igdb.com/v4/games";

    const token = await getAccessToken();

    const headers = {
        'Authorization': `Bearer ${token}`,
        'Client-ID': `${clientId}`
    };

    const query = `
      fields name; where name ~ "${search}"*; limit 10;
    `;

    const response = await fetch(igdbEndpoint, {
        method: 'POST',
        headers: headers,
        body: query
    });

    const data = await response.json();

    const formattedData = {


        results: data.map(game => ({
            name: game.name,
        }))
    };

    res.status(200).json(formattedData);
};