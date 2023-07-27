import getConfig from 'next/config';

const { serverRuntimeConfig } = getConfig();

export default async (req, res) => {
  const { search } = req.query;
  
  const apiKey = serverRuntimeConfig.RAWG_API_KEY;

  const response = await fetch(`https://api.rawg.io/api/games?key=${apiKey}&search=${search}`);
  const data = await response.json();

  res.status(200).json(data);
};