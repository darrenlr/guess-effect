const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'data', 'gameData.json');

// ✅ Titles allowed to be duplicated
const allowedDuplicates = new Set([
  "Batman: Arkham City"
]);

let duplicateFound = false;
const seenTitles = new Map();

try {
  const rawData = fs.readFileSync(filePath, 'utf8');
  const entries = JSON.parse(rawData);

  entries.forEach((entry, index) => {
    const title = entry.title;

    if (!title) {
      console.error(`❌ Missing title at index ${index}`);
      duplicateFound = true;
      return;
    }

    if (seenTitles.has(title)) {
      if (!allowedDuplicates.has(title)) {
        const firstIndex = seenTitles.get(title);
        console.error(`❌ Duplicate title "${title}" at index ${index} (already seen at index ${firstIndex})`);
        duplicateFound = true;
      }
    } else {
      seenTitles.set(title, index);
    }
  });
} catch (e) {
  console.error(`❌ Failed to process file:`, e.message);
  process.exit(1);
}

if (duplicateFound) {
  console.error('❌ Duplicate titles or errors found. Failing workflow.');
  process.exit(1);
} else {
  console.log('✅ All titles are valid and unique (excluding allowed exceptions).');
}
