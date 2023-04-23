import React, { useEffect, useRef } from "react";
import ReactDOM from "react-dom/client";
import { Action, MessageType, SyftEvent } from "../types";
import "./index.css";
import Card from "../common/core/Card";
import { Css } from "../common/styles/common.styles";
import EventApp from "./eventapp";
import RecorderApp from "../recorderapp";

function init(
  onNewEvent: (event: SyftEvent) => void,
  onActions: (actions: Action[]) => void
) {
  const listener = (message: any) => {
    // change createdAt
    if (message.type === MessageType.SyftEvent) {
      const event = message.data as SyftEvent;
      event.createdAt = new Date(message.createdAt);
      onNewEvent(event);
    } else if (message.type === MessageType.RecordedStep) {
      // insert actions.
      onActions(message.data as Action[]);
    }
  };
  //Create a connection to the service worker
  const backgroundPageConnection = chrome.runtime.connect({
    name: "devtools",
  });
  backgroundPageConnection.onDisconnect.addListener(() => {
    backgroundPageConnection.onMessage.removeListener(listener);
  });
  backgroundPageConnection.postMessage({
    name: "init",
    tabId: chrome.devtools.inspectedWindow.tabId,
  });
  backgroundPageConnection.onMessage.addListener(listener);
}

const App = () => {
  const [events, setEvents] = React.useState<Array<SyftEvent>>([]);
  const [actions, setActions] = React.useState<Array<Action>>([]);

  useEffect(() => {
    init(
      (event) => {
        setEvents((events) => [event, ...events]);
      },
      (actions) => {
        setActions(actions);
      }
    );
  }, []);
  return (
    <Card className={Css.height("100%")}>
      <EventApp events={events} clear={() => setEvents([])} />
      <RecorderApp actions={actions} />
    </Card>
  );
};

ReactDOM.createRoot(document.getElementById("app") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
