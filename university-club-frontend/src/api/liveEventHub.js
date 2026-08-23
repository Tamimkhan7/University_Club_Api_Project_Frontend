import { createHubConnection } from "./signalr";

export function createLiveEventConnection() {
  return createHubConnection("/hubs/live");
}

export default createLiveEventConnection;
