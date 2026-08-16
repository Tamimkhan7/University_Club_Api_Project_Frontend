import { createContext, useContext, useEffect, useRef, useState, useCallback, useMemo } from "react";
import { AuthContext } from "./AuthContext";
import { createNotificationConnection } from "../api/notificationHub";
import { presenceApi } from "../api/presence";


export const PresenceContext = createContext(null);

export default function PresenceProvider({ children }) {
  const { user } = useContext(AuthContext);
  const connectionRef = useRef(null);
  const startPromiseRef = useRef(null);
  const watchCountsRef = useRef(new Map()); 
  const [statuses, setStatuses] = useState({}); 

  const applyStatus = useCallback((userId, patch) => {
    setStatuses((prev) => {
      const id = Number(userId);
      const existing = prev[id] || {};
      return { ...prev, [id]: { ...existing, ...patch } };
    });
  }, []);

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
    
        for (const [userId, count] of watchCountsRef.current.entries()) {
          if (count > 0) connection.invoke("WatchPresence", userId).catch(() => {});
        }
      })
      .catch((err) => console.error("NotificationHub connection failed:", err));

    return () => {
      connection.stop();
      if (connectionRef.current === connection) connectionRef.current = null;
    };
  }, [user?.id]);

  const watch = useCallback(async (userId) => {
    const id = Number(userId);
    if (!id) return;
    const counts = watchCountsRef.current;
    const next = (counts.get(id) || 0) + 1;
    counts.set(id, next);
    if (next !== 1) return; 

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

export function usePresence(userIds) {
  const ctx = useContext(PresenceContext);
  if (!ctx) throw new Error("usePresence must be used within a PresenceProvider");
  const { statuses, watch, unwatch, seedFromServer } = ctx;

  const ids = useMemo(
    () => Array.from(new Set((userIds || []).map(Number).filter(Boolean))).sort((a, b) => a - b),

    [JSON.stringify(userIds || [])]
  );

  useEffect(() => {
    if (ids.length === 0) return;
    seedFromServer(ids);
    ids.forEach((id) => watch(id));
    return () => {
      ids.forEach((id) => unwatch(id));
    };

  }, [ids.join(",")]);

  return useMemo(() => {
    const map = {};
    ids.forEach((id) => {
      map[id] = statuses[id] || null;
    });
    return map;
  }, [ids, statuses]);
}

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
