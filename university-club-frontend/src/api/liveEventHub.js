import * as signalR from "@microsoft/signalr";

// The REST client talks to http://localhost:5000/api — SignalR hubs live one
// level up, at http://localhost:5000/hubs/live (see Program.cs: app.MapHub<LiveEventHub>("/hubs/live")).
const API_BASE_URL = "http://localhost:5000/api";
const HUB_URL = `${API_BASE_URL.replace(/\/api\/?$/, "")}/hubs/live`;

// Builds (but does not start) a HubConnection for the live-event hub.
// The backend's JwtBearerEvents.OnMessageReceived reads the token from the
// ?access_token= query string for hub requests, so we pass it via accessTokenFactory.
export function createLiveEventConnection() {
  return new signalR.HubConnectionBuilder()
    .withUrl(HUB_URL, {
      accessTokenFactory: () => localStorage.getItem("accessToken") || "",
    })
    .withAutomaticReconnect([0, 2000, 5000, 10000, 15000])
    .configureLogging(signalR.LogLevel.Warning)
    .build();
}

export default createLiveEventConnection;
