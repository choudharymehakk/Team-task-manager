const formatter = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });

export function relativeTime(value) {
  const date = new Date(value);
  const seconds = Math.round((date.getTime() - Date.now()) / 1000);
  const ranges = [
    ["year", 31536000],
    ["month", 2592000],
    ["week", 604800],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
    ["second", 1]
  ];
  for (const [unit, amount] of ranges) {
    if (Math.abs(seconds) >= amount || unit === "second") {
      return formatter.format(Math.round(seconds / amount), unit);
    }
  }
}
