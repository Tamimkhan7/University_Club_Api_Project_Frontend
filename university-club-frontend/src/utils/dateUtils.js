
export function formatRelativeTime(date, { shortForm = false } = {}) {
  if (!date) return shortForm ? "" : "Recently";

  const diffMs = Date.now() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return shortForm ? `${diffMins}m` : `${diffMins}m ago`;
  if (diffHours < 24) return shortForm ? `${diffHours}h` : `${diffHours}h ago`;
  if (shortForm) return `${diffDays}d`;

  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}


export function formatClockTime(date) {
  if (!date) return "";
  return new Date(date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

export function formatFullDateTime(date, { includeYear = true } = {}) {
  if (!date) return "";
  return new Date(date).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    ...(includeYear ? { year: "numeric" } : {}),
    hour: "2-digit",
    minute: "2-digit",
  });
}
