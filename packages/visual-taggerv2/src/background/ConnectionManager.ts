import { MessageType } from "../types";

export type MessageListener = (message: any, port: chrome.runtime.Port) => void;
export type MessageListener2 = (
  message: any,
  sender: chrome.runtime.MessageSender,
  sendResponse: (res: any) => void
) => void;

export default class ConnectionManager {
  existingConnections: Map<string, chrome.runtime.Port>;
  listener: MessageListener | undefined;
  externalListener: MessageListener2 | undefined;
  pendingMessages: Map<string, any[]> = new Map();

  constructor() {
    this.existingConnections = new Map();
    chrome.runtime.onConnect.addListener(this.onNewConnection);
    chrome.runtime.onMessage.addListener(this.onNewMessage);
  }

  init(listener: MessageListener, externalListener?: MessageListener2) {
    this.listener = listener;
    this.externalListener = externalListener;
  }

  onMessage: MessageListener = (message, port) => {
    console.debug(
      "[Syft][Background] Received a message from Devtools",
      message,
      port
    );
    switch (message.type) {
      case MessageType.InitDevTools:
        const tabId = message.tabId.toString();
        console.debug(
          "[Syft][Background] messages from content will be forwarded to Devtools",
          tabId,
          port
        );
        this.existingConnections.set(tabId, port);
        // clear out pending messages
        const pendingMessages = this.pendingMessages.get(tabId);
        if (pendingMessages) {
          console.debug(
            "[Syft][Background] Forwarding pending messages",
            pendingMessages.length
          );
          pendingMessages.forEach((message) => {
            this.postMessage(tabId, message);
          });
          this.pendingMessages.delete(tabId);
        }
        break;
    }
    if (this.listener) {
      return this.listener(message, port);
    }
    return true;
  };

  addToPendingMessages = (tabId: string, message: any) => {
    this.pendingMessages.set(tabId, this.pendingMessages.get(tabId) || []);
    this.pendingMessages.get(tabId)?.push(message);
  };

  /**
   * Handle messages from content scripts.
   * @param message
   * @param sender
   * @param sendResponse
   */
  onNewMessage: MessageListener2 = (message, sender, sendResponse) => {
    console.debug(
      "[Syft][Background] Received a message from content",
      message,
      sender
    );
    // Messages from content scripts should have sender.tab set
    let tabId: string | undefined;
    if (sender.tab) {
      tabId = sender.tab.id?.toString();
    } else if (message.tabId != null) {
      tabId = message.tabId.toString();
    }
    if (tabId != null) {
      sendResponse(this.postMessage(tabId, message));
    } else {
      console.warn(
        "[Syft][Background] Received a message without tabId",
        message
      );
    }
  };

  onNewConnection = async (port: chrome.runtime.Port) => {
    if (port.name !== "syft-devtools") {
      return;
    }
    console.debug(
      "[Syft][Background] Received a connection from DevPanel",
      port
    );
    // Listen to messages sent from the DevTools page starting from init.
    port.onMessage.addListener(this.onMessage!);
    port.onDisconnect.addListener((port) => {
      port.onMessage.removeListener(this.onMessage!);
      console.debug("[Syft][Background] on port disconnect", port);
      [...this.existingConnections.keys()].forEach((key) => {
        if (this.existingConnections.get(key) === port) {
          this.existingConnections.delete(key);
        }
      });
    });
  };

  postMessage(tabId: string, message: any) {
    if (this.existingConnections.has(tabId)) {
      this.existingConnections.get(tabId)?.postMessage(message);
      return true;
    } else {
      this.addToPendingMessages(tabId, message);
      console.debug(
        "[Syft][Background] Tab not found in connection list. adding to pending messages.",
        tabId
      );
      return false;
    }
  }
}
