export function normaliseString(str){
  return str
    .normalize('NFKC')
    .replace(/[\u00A0\u2000-\u200B\u202F\u205F\u3000]/g, ' ') // Replace non-standard spaces with normal space
    .replace(/\s+/g, ' ')                                     // Collapse multiple spaces
    .trim()                                                   // Trim leading/trailing
    .toLowerCase();                                           // Make lowercase
}