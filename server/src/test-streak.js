const calendarStr = "{\"1767398400\": 3, \"1767484800\": 2, \"1769299200\": 5, \"1769817600\": 6, \"1769904000\": 3, \"1771027200\": 1, \"1771113600\": 2, \"1772323200\": 4, \"1773446400\": 1, \"1773532800\": 7, \"1774137600\": 4, \"1776556800\": 2, \"1777161600\": 3, \"1777766400\": 3, \"1777852800\": 1, \"1746835200\": 1, \"1746921600\": 4, \"1747958400\": 1, \"1748044800\": 2, \"1749254400\": 2, \"1749340800\": 4, \"1749427200\": 1, \"1749945600\": 2, \"1750550400\": 7, \"1751414400\": 1, \"1751673600\": 2, \"1751760000\": 9, \"1752364800\": 3, \"1753574400\": 3, \"1754092800\": 4, \"1754179200\": 5, \"1754352000\": 1, \"1755388800\": 5, \"1756598400\": 5, \"1756684800\": 1, \"1757203200\": 5, \"1757808000\": 4, \"1758931200\": 3, \"1759017600\": 4, \"1760140800\": 1, \"1760227200\": 1, \"1761350400\": 3, \"1761436800\": 3, \"1762560000\": 10, \"1763769600\": 1, \"1764460800\": 3, \"1765065600\": 1, \"1765670400\": 2}";

const calendar = JSON.parse(calendarStr);
const timestamps = Object.keys(calendar).map(Number).sort((a, b) => b - a);

// Current date in seconds
const now = Math.floor(Date.now() / 1000);
const SECONDS_IN_DAY = 86400;

// Normalize timestamps to just the day component (start of day in UTC)
const activeDays = new Set(timestamps.map(t => Math.floor(t / SECONDS_IN_DAY)));

let currentStreak = 0;
let today = Math.floor(now / SECONDS_IN_DAY);

// Check if today or yesterday has a submission
if (activeDays.has(today)) {
  currentStreak = 1;
} else if (activeDays.has(today - 1)) {
  currentStreak = 1;
  today = today - 1;
}

if (currentStreak > 0) {
  let checkDay = today - 1;
  while (activeDays.has(checkDay)) {
    currentStreak++;
    checkDay--;
  }
}

console.log("Streak:", currentStreak);
