export type MessageListener = (message: any, port: chrome.runtime.Port) => void;
export default class PortManager {
  existingConnection: chrome.runtime.Port | undefined;
  name: string;
  listener: MessageListener | undefined;

  constructor(name: string) {
    this.name = name;
  }

  init(listener: MessageListener) {
    this.refreshConnection();
    this.listener = listener;
    this.existingConnection?.onMessage.addListener(listener);
    chrome.devtools.network.onNavigated.addListener(this.refreshConnection);
  }

  onDisconnect(port: chrome.runtime.Port) {
    console.info("[Syft][Devtools] Getting disconnected", port.name);
    port.onMessage.removeListener(this.listener!);
  }

  refreshConnection() {
    console.info("[Syft][Devtools] Attempting to refresh connection");
    if (this.existingConnection) {
      this.existingConnection.disconnect();
    }
    //Create a connection to the service worker
    this.existingConnection = chrome.runtime.connect({
      name: this.name,
    });
    this.existingConnection.onDisconnect.addListener(this.onDisconnect);
  }

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
