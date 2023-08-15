import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { MessageType, SyftEvent } from "../types";
import EventApp from "./eventapp";
import TaggingApp from "../taggingapp";
import Tabs, { TabsProps } from "antd/es/tabs";
import { Colors } from "../common/styles/colors";
import SettingsApp from "../settingsapp";
import { GitView } from "../cloud/views/gitview";
import { fetchGitInfo } from "../cloud/api/git";
import { getUserSession, useUserSession } from "../cloud/state/usersession";
import { Css, Flex } from "../common/styles/common.styles";
import { css } from "@emotion/css";
import {
  GitInfoContext,
  getGitInfoState,
  useGitInfoState,
} from "../cloud/state/gitinfo";
import { GitInfoActionType } from "../cloud/state/types";
import PortManager from "./PortManager";
import { getCurrentTabId } from "../common/utils";

function createMessageHandler(onNewEvent: (event: SyftEvent) => void) {
  const listener = (message: any, port: chrome.runtime.Port) => {
    if (message.type === MessageType.SyftEvent) {
      const event = message.data as SyftEvent;
      if (event.syft_status.track !== "TRACKED") {
        console.warn("[Syft][Devtools] Received untracked event ", event);
        return;
      }
      event.createdAt = new Date(event.createdAt);
      onNewEvent(event);
    } else if (message.type === MessageType.OnShown) {
      // refresh connection and re-fetch git info.
      // console.debug(
      //   "OnShown called. refreshing connection and re-fetching git info."
      // );
      // refreshConnection();
      getUserSession().then((userSession) => {
        if (userSession != null) {
          getGitInfoState().then((state) => {
            void fetchGitInfo(
              userSession,
              state?.info?.activeSourceId,
              state?.info?.activeBranch
            );
          });
        }
      });
    } else if (message.type === MessageType.OnHidden) {
      // refresh connection and re-fetch git info.
      // console.debug("OnHidden called. cleaning up script");
      // if (existingConnection) {
      //   const tabId = getCurrentTabId();
      //   existingConnection.postMessage({
      //     type: MessageType.CleanupDevTools,
      //     tabId,
      //   });
      //   existingConnection.disconnect();
      //   existingConnection = undefined;
      // }
    } else {
      console.warn(
        "[Syft][Devtools] Received unknown message ",
        message,
        message.type
      );
    }
  };
  return listener;
}

const portManager = new PortManager("syft-devtools");

const App = () => {
  const [events, setEvents] = useState<Array<SyftEvent>>([]);
  const [gitInfoState, dispatch] = useGitInfoState();
  const [userSession] = useUserSession();

  const insertEvent = (event: SyftEvent) => {
    setEvents((events) => [event, ...events]);
  };

  useEffect(() => {
    portManager.init(createMessageHandler(insertEvent));
    const tabId = getCurrentTabId();
    portManager.postMessage({
      type: MessageType.InitDevTools,
      tabId,
    });
  }, []);

  useEffect(() => {
    if (userSession != null) {
      dispatch({
        type: GitInfoActionType.REFRESH_INFO,
      });
    }
  }, [userSession]);

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: `Visual Editor`,
      children: (
        <TaggingApp
          setVisualMode={(mode) => {
            portManager.postMessage({
              type: MessageType.SetVisualMode,
              tabId: chrome.devtools.inspectedWindow.tabId,
              mode,
            });
          }}
        />
      ),
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

  if (userSession == null) {
    // hide catalog and recorder if the user is not logged in.
    items.splice(0, 2);
  }

  return (
    <Flex.Col
      className={css(
        Css.minWidth(500),
        Css.overflow("auto auto"),
        Css.height("100%")
      )}
    >
      <GitInfoContext.Provider
        value={{
          gitInfoState,
          dispatch,
        }}
      >
        <GitView />
        <Tabs
          key={userSession?.user.id} // re-render when userSession changes
          defaultActiveKey="1"
          items={items}
          size="small"
          style={{ height: "calc(100vh - 80px)" }}
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
// chrome.devtools.panels.elements.onSelectionChanged.addListener(() => {
//   chrome.devtools.inspectedWindow.eval(
//     `(() => {
//       // call a method in the content script to change the selection.
//       console.log($0);
//     })()`,
//     {
//       useContentScriptContext: true,
//     }
//   );
//   console.debug("onSelectionChanged");
// });
