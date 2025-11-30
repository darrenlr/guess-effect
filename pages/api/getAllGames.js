import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  try {
    const filePath = path.join(process.cwd(), 'data', 'gameData.json');
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const gameData = JSON.parse(fileContent);

    return res.status(200).json(gameData);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'An error occurred while fetching the games' });
  }
}
