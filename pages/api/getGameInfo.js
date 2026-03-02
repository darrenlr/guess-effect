import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  try {
    const filePath = path.join(process.cwd(), 'data', 'gameData.json');
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const gameData = JSON.parse(fileContent);

    const date = req.query.date || new Date().toISOString().split('T')[0];

    const gameIndex = gameData.findIndex((game) => game.date === date);

    if (gameIndex === -1) {
      return res.status(404).json({ error: 'Game not found' });
    }

    return res.status(200).json({ ...gameData[gameIndex], gameNumber: gameIndex + 1 });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'An error occurred while fetching the game info' });
  }
}
