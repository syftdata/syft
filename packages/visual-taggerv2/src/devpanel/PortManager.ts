import { getCurrentTabId } from "../common/utils";
import { MessageType } from "../types";

export type MessageListener = (message: any, port: chrome.runtime.Port) => void;
export default class PortManager {
  existingConnection: chrome.runtime.Port | undefined;
  name: string;
  listener: MessageListener | undefined;

  constructor(name: string) {
    this.name = name;
  }

  init(listener: MessageListener) {
    this.listener = listener;
    this.refreshConnection();
    chrome.devtools.network.onNavigated.addListener(this.onNavigated);
  }

  onNavigated = (url: string) => {
    console.debug("[Syft][Devtools] Navigated to ", url);
    this.refreshConnection();
  };

  onDisconnect = (port: chrome.runtime.Port) => {
    console.debug("[Syft][Devtools] Getting disconnected", port.name);
    port.onMessage.removeListener(this.listener!);
  };

  refreshConnection = () => {
    if (!this.listener) {
      console.warn(
        "[Syft][Devtools] No listener found. Cannot refresh connection"
      );
      return;
    }
    console.debug("[Syft][Devtools] Attempting to refresh connection");
    if (this.existingConnection) {
      this.existingConnection.disconnect();
    }
    //Create a connection to the service worker
    this.existingConnection = chrome.runtime.connect({
      name: this.name,
    });
    this.existingConnection.onDisconnect.addListener(this.onDisconnect);
    this.existingConnection.onMessage.addListener(this.listener);
    // initialize the connection.
    const tabId = getCurrentTabId();
    this.postMessage({
      type: MessageType.InitDevTools,
      tabId,
    });
  };

  postMessage(message: any) {
    try {
      this.existingConnection?.postMessage(message);
    } catch (e) {
      console.warn(
        "[Syft][Devtools] Error sending message. refreshing connection.",
        message,
        e
      );
      this.refreshConnection();
      // this.postMessage(message);
      this.existingConnection?.postMessage(message);
    }
  }
}
