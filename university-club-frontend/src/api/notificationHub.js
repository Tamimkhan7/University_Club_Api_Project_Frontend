import { createHubConnection } from "./signalr";

export function createNotificationConnection() {
  return createHubConnection("/hubs/notification");
}

export default createNotificationConnection;
