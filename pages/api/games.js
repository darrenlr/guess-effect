import getConfig from 'next/config';

export default async (req, res) => {
  const { search } = req.query;

  const apiKey = process.env.RAWG_API_KEY;

  const response = await fetch(`https://api.rawg.io/api/games?key=${apiKey}&search=${search}`);

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