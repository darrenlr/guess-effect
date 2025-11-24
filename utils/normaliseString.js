export function normaliseString(str) {
  return str
    .normalize('NFKC')
    .replace(/[\u2010-\u2015]/g, '-')                         // Normalize all dash variants to -
    .replace(/[\u00A0\u2000-\u200B\u202F\u205F\u3000]/g, ' ') // Normalize weird spaces
    .replace(/[\u2018\u2019\u201A\u201B\u2032]/g, "'")         // Normalize single quotes/apostrophes
    .replace(/\s+/g, ' ')                                     // Collapse multiple spaces
    .trim()                                                   // Trim leading/trailing spaces
    .toLowerCase();                                           // Lowercase
}