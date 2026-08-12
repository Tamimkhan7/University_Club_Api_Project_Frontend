import * as signalR from "@microsoft/signalr";

// Mirrors ./liveEventHub.js — the REST client talks to
// http://localhost:5000/api, SignalR hubs live one level up, at
// http://localhost:5000/hubs/notification (see Program.cs:
// app.MapHub<NotificationHub>("/hubs/notification")).
const API_BASE_URL = "http://localhost:5000/api";
const HUB_URL = `${API_BASE_URL.replace(/\/api\/?$/, "")}/hubs/notification`;

// Builds (but does not start) a HubConnection for the notification hub.
// The backend's JwtBearerEvents.OnMessageReceived reads the token from the
// ?access_token= query string for hub requests, so we pass it via
// accessTokenFactory (same pattern as createLiveEventConnection).
export function createNotificationConnection() {
  return new signalR.HubConnectionBuilder()
    .withUrl(HUB_URL, {
      accessTokenFactory: () => localStorage.getItem("accessToken") || "",
    })
    .withAutomaticReconnect([0, 2000, 5000, 10000, 15000])
    .configureLogging(signalR.LogLevel.Warning)
    .build();
}

export default createNotificationConnection;
