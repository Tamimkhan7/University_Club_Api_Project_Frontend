import * as signalR from "@microsoft/signalr";
const API_BASE_URL = "http://localhost:5000/api";
const ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

export function createHubConnection(hubPath) {
  return new signalR.HubConnectionBuilder()
    .withUrl(`${ORIGIN}${hubPath}`, {
      accessTokenFactory: () => localStorage.getItem("accessToken") || "",
    })
    .withAutomaticReconnect([0, 2000, 5000, 10000, 15000])
    .configureLogging(signalR.LogLevel.Warning)
    .build();
}

export default createHubConnection;
