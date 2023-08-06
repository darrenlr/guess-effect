export function stripBrackets(str) {
    return str.replace(/ *\([^)]*\) */g, "").trim();
}