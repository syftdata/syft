import { useState, useEffect, useRef, useCallback } from "react";
import Recorder from "./recorder";

import { Action, MessageType } from "../types";
import Highlighters from "./Highlighters";
import {
  GIT_IN_MEMORY_STORAGE_KEY,
  getGitInfoInMemory,
} from "../cloud/state/gitinfo";

export default function VisualTaggerApp() {
  const [eventTags, setEventTags] = useState<Action[]>([]);
  const recorderRef = useRef<Recorder | null>(null);

  const storageListener = useCallback(
    (changes: { [key: string]: chrome.storage.StorageChange }) => {
      console.log("[Syft][Content] storage changed ", changes);
      if (changes[GIT_IN_MEMORY_STORAGE_KEY] != null) {
        const gitInfo = changes[GIT_IN_MEMORY_STORAGE_KEY];
        if (gitInfo.newValue?.eventTags !== gitInfo.oldValue?.eventTags) {
          setEventTags(gitInfo.newValue?.eventTags ?? []);
        }
      }
    },
    []
  );
  const onActionCreated = useCallback((actions: Action[]) => {
    if (!recorderRef.current) return;
    console.log(">>>>> onAction got called ", actions.length);
    window.postMessage({
      type: MessageType.GetSourceFile,
    });
    chrome.runtime.sendMessage({
      type: MessageType.RecordedActions,
      data: actions,
    });
  }, []);

  useEffect(() => {
    recorderRef.current = new Recorder({
      onAction: onActionCreated,
    });

    getGitInfoInMemory().then((gitInfo) => {
      if (gitInfo) {
        setEventTags(gitInfo.eventTags);
      }
    });
    // Set recording to be finished if somewhere else (ex. popup) the state has been set to be finished
    chrome.storage.onChanged.addListener(storageListener);

    return () => {
      chrome.storage.onChanged.removeListener(storageListener);
      recorderRef.current?.deregister();
      recorderRef.current = null;
      onActionCreated([]);
    };
  }, []);

  return <Highlighters actions={eventTags} />;
}
