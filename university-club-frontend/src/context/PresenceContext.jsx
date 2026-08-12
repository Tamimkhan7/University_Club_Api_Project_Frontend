import { createContext, useContext, useEffect, useRef, useState, useCallback, useMemo } from "react";
import { AuthContext } from "./AuthContext";
import { createNotificationConnection } from "../api/notificationHub";
import { presenceApi } from "../api/presence";

// Backend contract (see UniversityClubAPI.Hubs.NotificationHub /
// UniversityClubAPI.Controllers.PresenceController):
//   REST   GET  /api/presence/users/{userId}         -> single status
//   REST   POST /api/presence/users/bulk              -> status[] for up to 100 ids
//   REST   GET  /api/presence/online-following         -> paginated online-following list
//   HUB    hub.invoke("WatchPresence", userId)         -> subscribe to live updates for a user
//   HUB    hub.invoke("UnwatchPresence", userId)       -> unsubscribe
//   HUB    hub.on("UserPresenceChanged", ({ userId, isOnline, lastSeenAt }) => ...)
//
// This context keeps ONE hub connection alive for the whole app (instead of
// each component opening its own), tracks how many components currently
// care about each userId (refcount) so WatchPresence/UnwatchPresence is
// only sent when that count actually transitions to/from zero, and exposes
// a small `usePresence(userIds)` hook that pages can call directly.

export const PresenceContext = createContext(null);

export default function PresenceProvider({ children }) {
  const { user } = useContext(AuthContext);
  const connectionRef = useRef(null);
  const startPromiseRef = useRef(null);
  const watchCountsRef = useRef(new Map()); // userId -> number of hooks currently watching it
  const [statuses, setStatuses] = useState({}); // userId -> { isOnline, lastSeenAt }

  const applyStatus = useCallback((userId, patch) => {
    setStatuses((prev) => {
      const id = Number(userId);
      const existing = prev[id] || {};
      return { ...prev, [id]: { ...existing, ...patch } };
    });
  }, []);

  // Connect once a user is authenticated; tear the connection down on logout.
  useEffect(() => {
    if (!user) {
      connectionRef.current?.stop();
      connectionRef.current = null;
      startPromiseRef.current = null;
      watchCountsRef.current.clear();
      setStatuses({});
      return;
    }

    const connection = createNotificationConnection();
    connectionRef.current = connection;

    connection.on("UserPresenceChanged", ({ userId, isOnline, lastSeenAt }) => {
      applyStatus(userId, { isOnline, lastSeenAt });
    });

    startPromiseRef.current = connection
      .start()
      .then(() => {
        // Re-subscribe to anything components had already asked to watch
        // before the connection finished handshaking.
        for (const [userId, count] of watchCountsRef.current.entries()) {
          if (count > 0) connection.invoke("WatchPresence", userId).catch(() => {});
        }
      })
      .catch((err) => console.error("NotificationHub connection failed:", err));

    return () => {
      connection.stop();
      if (connectionRef.current === connection) connectionRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const watch = useCallback(async (userId) => {
    const id = Number(userId);
    if (!id) return;
    const counts = watchCountsRef.current;
    const next = (counts.get(id) || 0) + 1;
    counts.set(id, next);
    if (next !== 1) return; // already watched by another component

    try {
      await startPromiseRef.current;
      await connectionRef.current?.invoke("WatchPresence", id);
    } catch (err) {
      console.error("WatchPresence failed:", err);
    }
  }, []);

  const unwatch = useCallback(async (userId) => {
    const id = Number(userId);
    if (!id) return;
    const counts = watchCountsRef.current;
    const next = (counts.get(id) || 0) - 1;
    if (next > 0) {
      counts.set(id, next);
      return;
    }
    counts.delete(id);

    try {
      await startPromiseRef.current;
      await connectionRef.current?.invoke("UnwatchPresence", id);
    } catch (err) {
      console.error("UnwatchPresence failed:", err);
    }
  }, []);

  // Seeds the map with a REST snapshot so the UI has a value immediately,
  // instead of waiting for the first hub push (which only fires on change).
  const seedFromServer = useCallback(async (userIds) => {
    const ids = Array.from(new Set((userIds || []).map(Number).filter(Boolean)));
    if (ids.length === 0) return;
    try {
      const results = await presenceApi.getBulkStatus(ids);
      setStatuses((prev) => {
        const merged = { ...prev };
        for (const r of results || []) {
          merged[r.userId] = {
            ...merged[r.userId],
            isOnline: r.isOnline,
            lastSeenAt: r.lastSeenAt,
            userName: r.userName,
            profileImage: r.profileImage,
          };
        }
        return merged;
      });
    } catch (err) {
      console.error("Failed to load presence snapshot:", err);
    }
  }, []);

  const value = useMemo(
    () => ({ statuses, watch, unwatch, seedFromServer }),
    [statuses, watch, unwatch, seedFromServer]
  );

  return <PresenceContext.Provider value={value}>{children}</PresenceContext.Provider>;
}

// Subscribes to live presence for a list of userIds for as long as the
// calling component is mounted, and returns a lookup of
// { [userId]: { isOnline, lastSeenAt } }. Pass a stable/memoized array (or
// let the hook's own JSON-based dependency check handle re-renders that
// produce a new array with the same ids each time).
export function usePresence(userIds) {
  const ctx = useContext(PresenceContext);
  if (!ctx) throw new Error("usePresence must be used within a PresenceProvider");
  const { statuses, watch, unwatch, seedFromServer } = ctx;

  const ids = useMemo(
    () => Array.from(new Set((userIds || []).map(Number).filter(Boolean))).sort((a, b) => a - b),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(userIds || [])]
  );

  useEffect(() => {
    if (ids.length === 0) return;
    seedFromServer(ids);
    ids.forEach((id) => watch(id));
    return () => {
      ids.forEach((id) => unwatch(id));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids.join(",")]);

  return useMemo(() => {
    const map = {};
    ids.forEach((id) => {
      map[id] = statuses[id] || null;
    });
    return map;
  }, [ids, statuses]);
}

// Formats a lastSeenAt timestamp the way the UI wants to show it
// ("Online now" is handled separately by checking isOnline first).
export function formatLastSeen(lastSeenAt) {
  if (!lastSeenAt) return null;
  const then = new Date(lastSeenAt).getTime();
  if (Number.isNaN(then)) return null;
  const diffMs = Date.now() - then;
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return new Date(lastSeenAt).toLocaleDateString();
}
