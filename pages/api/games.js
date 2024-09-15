import getConfig from 'next/config';

const { serverRuntimeConfig } = getConfig();

export default async (req, res) => {
  const { search } = req.query;

  const apiKey = serverRuntimeConfig.RAWG_API_KEY;

  const response = await fetch(`https://api.rawg.io/api/games?key=${apiKey}&search=${search}`);

  // console.log("Response status:", response.status);
  // console.log("Response headers:", response.headers);

  const text = await response.text();

  // Then try to parse it as JSON
  try {
    const data = JSON.parse(text);
    res.status(200).json(data);
  } catch (error) {
    console.error("JSON parsing error:", error);
    res.status(500).json({ message: "Error parsing JSON response from server.", error: error.toString() });
  }
};