import * as signalR from "@microsoft/signalr";

const API_BASE_URL = "http://localhost:5000/api";
const HUB_URL = `${API_BASE_URL.replace(/\/api\/?$/, "")}/hubs/notification`;


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
