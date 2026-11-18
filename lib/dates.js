// All game dates are UTC calendar days (YYYY-MM-DD), matching the daily rollover.
export const todayUtc = () => new Date().toISOString().split("T")[0];

// First daily puzzle; the archive can't go earlier than this.
export const ARCHIVE_START = "2024-11-25";

export function formatLongDate(dateString) {
  // Dates are plain calendar days stored as UTC midnight; format them in UTC so
  // players west of Greenwich don't see the day before.
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}
