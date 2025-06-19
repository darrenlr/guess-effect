const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');

// ✅ List of titles allowed to have duplicates
const allowedDuplicates = new Set([
  "Batman: Arkham City"
]);

const seenTitles = new Map();
let duplicateFound = false;

fs.readdirSync(dataDir).forEach(file => {
  if (path.extname(file) !== '.json') return;

  const filePath = path.join(dataDir, file);
  const rawData = fs.readFileSync(filePath, 'utf8');

  try {
    const jsonData = JSON.parse(rawData);
    const title = jsonData.title;

    if (!title) {
      console.error(`❌ Missing title in: ${file}`);
      duplicateFound = true;
      return;
    }

    if (seenTitles.has(title)) {
      if (!allowedDuplicates.has(title)) {
        console.error(`❌ Duplicate title "${title}" found in: ${file} and ${seenTitles.get(title)}`);
        duplicateFound = true;
      }
    } else {
      seenTitles.set(title, file);
    }
  } catch (e) {
    console.error(`❌ Failed to parse ${file}:`, e.message);
    duplicateFound = true;
  }
});

if (duplicateFound) {
  console.error('❌ Duplicate titles or errors found. Failing workflow.');
  process.exit(1);
} else {
  console.log('✅ All titles are valid and unique (excluding allowed exceptions).');
}
