import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import {
  Action,
  ActionType,
  MessageType,
  SyftAction,
  SyftEvent,
} from "../types";
import "./index.css";
import { Css } from "../common/styles/common.styles";
import EventApp from "./eventapp";
import RecorderApp from "../recorderapp";
import { insertNewAction } from "../common/utils";
import Tabs, { TabsProps } from "antd/es/tabs";

let existingConnection: chrome.runtime.Port | undefined;
function init(
  onNewEvent: (event: SyftEvent) => void,
  onActions: (actions: Action[]) => void
) {
  if (existingConnection) {
    return;
  }
  const listener = (message: any, port: chrome.runtime.Port) => {
    console.debug("[Syft][Devtools] Received data ", message);
    if (message.type === MessageType.SyftEvent) {
      // change createdAt
      const event = message.data as SyftEvent;
      if (event.syft_status.track !== "TRACKED") {
        return;
      }
      event.createdAt = new Date(event.createdAt);
      onNewEvent(event);
    } else if (message.type === MessageType.RecordedStep) {
      // insert actions.
      console.debug("[Syft][Devtools] Received actions", message.data);
      onActions(message.data as Action[]);
    }
  };

  const refreshConnection = () => {
    if (existingConnection) {
      existingConnection.disconnect();
    }
    const tabId = chrome.devtools.inspectedWindow.tabId;
    //Create a connection to the service worker
    existingConnection = chrome.runtime.connect({
      name: "syft-devtools",
    });
    existingConnection.onDisconnect.addListener((port) => {
      port.onMessage.removeListener(listener);
    });
    existingConnection.onMessage.addListener(listener);
    console.debug("[Syft][Devtools] Initializing tab ", tabId);
    existingConnection.postMessage({
      type: MessageType.InitDevTools,
      tabId,
    });
    return existingConnection;
  };
  refreshConnection();
  chrome.devtools.network.onNavigated.addListener(refreshConnection);
}

const startRecording = () => {
  existingConnection?.postMessage({
    type: MessageType.StartRecord,
    tabId: chrome.devtools.inspectedWindow.tabId,
  });
};

const endRecording = () => {
  existingConnection?.postMessage({
    type: MessageType.StopRecord,
    tabId: chrome.devtools.inspectedWindow.tabId,
  });
};

const App = () => {
  const [events, setEvents] = React.useState<Array<SyftEvent>>([]);
  const [actions, setActions] = React.useState<Array<Action>>([]);
  useEffect(() => init(insertEvent, setActions), []);

  const insertEvent = (event: SyftEvent) => {
    setEvents((events) => [event, ...events]);
  };
  const insertEventAfterAction = (action: Action) => {
    // find index of the action.
    const index = actions.findIndex((a) => a === action);
    if (index !== -1) {
      insertNewAction(
        {
          type: ActionType.SyftEvent,
          name: "TodoAdded",
          data: {},
        } as SyftAction,
        index + 1
      );
    } else {
      throw new Error("Action not found");
    }
  };

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: `Recorder`,
      children: (
        <RecorderApp
          startRecording={startRecording}
          endRecording={endRecording}
          addEvent={insertEventAfterAction}
          actions={actions}
        />
      ),
    },
    {
      key: "2",
      label: `Events`,
      children: <EventApp events={events} clear={() => setEvents([])} />,
    },
  ];
  return (
    <Tabs
      defaultActiveKey="1"
      items={items}
      className={Css.height("100vh")}
      size="small"
      style={{ marginLeft: 4 }}
    />
  );
};
let target = document.getElementById("app") as HTMLElement;
ReactDOM.createRoot(target).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
