import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { Action, MessageType, SyftEvent } from "../types";
import EventApp from "./eventapp";
import TaggingApp from "../recorderapp";
import Tabs, { TabsProps } from "antd/es/tabs";
import { Colors } from "../common/styles/colors";
import SchemaApp from "../schemaapp";
import SettingsApp from "../settingsapp";
import { GitView } from "../cloud/views/gitview";
import { getCurrentTabId } from "../common/utils";
import { fetchGitInfo } from "../cloud/api/git";
import { getUserSession } from "../cloud/state/usersession";
import { Css, Flex } from "../common/styles/common.styles";
import { css } from "@emotion/css";
import {
  GitInfoContext,
  useGitInfo,
  useGitInfoContext,
} from "../cloud/state/gitinfo";

let existingConnection: chrome.runtime.Port | undefined;

function init(
  onNewEvent: (event: SyftEvent) => void,
  onActions: (actions: Action[]) => void
) {
  if (existingConnection) {
    return;
  }
  const listener = (message: any, port: chrome.runtime.Port) => {
    if (message.type === MessageType.SyftEvent) {
      const event = message.data as SyftEvent;
      if (event.syft_status.track !== "TRACKED") {
        console.warn("[Syft][Devtools] Received untracked event ", event);
        return;
      }
      event.createdAt = new Date(event.createdAt);
      onNewEvent(event);
    } else if (message.type === MessageType.RecordedStep) {
      onActions(message.data as Action[]);
    } else if (message.type === MessageType.OnShown) {
      // refresh connection and re-fetch git info.
      console.debug(
        "OnShown called. refreshing connection and re-fetching git info."
      );
      refreshConnection();
      getUserSession().then((userSession) => {
        if (userSession != null) {
          void fetchGitInfo(userSession);
        }
      });
    } else {
      console.warn("[Syft][Devtools] Received unknown message ", message);
    }
  };

  const refreshConnection = () => {
    if (existingConnection) {
      existingConnection.disconnect();
    }
    const tabId = getCurrentTabId();
    console.debug("[Syft][Devtools] Initializing/Refreshing tab ", tabId);
    //Create a connection to the service worker
    existingConnection = chrome.runtime.connect({
      name: "syft-devtools",
    });
    existingConnection.onDisconnect.addListener((port) => {
      port.onMessage.removeListener(listener);
    });
    existingConnection.onMessage.addListener(listener);
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

const replaceAction = (index: number, action?: Action) => {
  existingConnection?.postMessage({
    type: MessageType.ReplaceStep,
    index,
    action,
    tabId: chrome.devtools.inspectedWindow.tabId,
  });
};

const App = () => {
  const [events, setEvents] = useState<Array<SyftEvent>>([]);
  const [actions, setActions] = useState<Array<Action>>([]);
  useEffect(() => init(insertEvent, setActions), []);
  const [gitInfoState, dispatch] = useGitInfo();

  const insertEvent = (event: SyftEvent) => {
    setEvents((events) => [event, ...events]);
  };

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: `Visual Tagger`,
      children: (
        <TaggingApp
          startTagging={startRecording}
          endTagging={endRecording}
          onUpdateAction={replaceAction}
          actions={actions}
        />
      ),
    },
    {
      key: "2",
      label: `Catalog`,
      children: <SchemaApp />,
    },
    {
      key: "3",
      label: `Debugger`,
      children: <EventApp events={events} clear={() => setEvents([])} />,
    },
    {
      key: "4",
      label: `Settings`,
      children: <SettingsApp />,
    },
  ];

  return (
    <Flex.Col className={css(Css.minWidth(500), Css.overflow("auto auto"))}>
      <GitInfoContext.Provider
        value={{
          gitInfoState,
          dispatch,
        }}
      >
        <GitView />
        <Tabs
          defaultActiveKey="1"
          items={items}
          size="small"
          style={{ height: "100vh" }}
          tabBarStyle={{
            marginBottom: 0,
            backgroundColor: Colors.Gray.V1,
            paddingLeft: 8,
            borderBottom: `1px solid ${Colors.Gray.V3}`,
          }}
        />
      </GitInfoContext.Provider>
    </Flex.Col>
  );
};
let target = document.getElementById("app") as HTMLElement;
ReactDOM.createRoot(target).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
