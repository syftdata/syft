import { useEffect, useState } from "react";

import {
  setPreferredLibraryStorage,
  localStorageGet,
  setLoginSessionStorage,
} from "./utils";
import { LoginSession, ScriptType } from "../types";

import type { Action } from "../types";

export function usePreferredLibrary() {
  const [preferredLibrary, setPreferredLibrary] = useState<ScriptType | null>(
    null
  );

  useEffect(() => {
    localStorageGet(["preferredLibrary"]).then(
      ({ preferredLibrary: storedPreferredLibrary }) => {
        setPreferredLibrary(storedPreferredLibrary);
      }
    );
  }, []);

  const setPreferredLibraryWithStorage = (library: ScriptType) => {
    setPreferredLibrary(library);
    setPreferredLibraryStorage(library);
  };

  return [preferredLibrary, setPreferredLibraryWithStorage] as const;
}

export function useLoginSessionState() {
  const [loginSession, setLoginSession] = useState<LoginSession | null>(null);

  useEffect(() => {
    localStorageGet(["loginSession"]).then(
      ({ loginSession: storedLoginSession }) => {
        setLoginSession(storedLoginSession);
      }
    );
  }, []);
  chrome.storage.onChanged.addListener((changes) => {
    if (
      changes.loginSession != null &&
      changes.loginSession.newValue != changes.loginSession.oldValue
    ) {
      setLoginSession(changes.loginSession.newValue);
    }
  });
  return [loginSession] as const;
}

export function useRecordingState() {
  const [recordingTabId, setRecordingTabId] = useState<number | null>(null);
  const [actions, setActions] = useState<Action[]>([]);

  useEffect(() => {
    localStorageGet(["recording", "recordingTabId"]).then(
      ({ recording, recordingTabId }) => {
        setActions(recording ?? []);
        setRecordingTabId(recordingTabId ?? null);
      }
    );

    chrome.storage.onChanged.addListener((changes) => {
      if (
        changes.recordingTabId != null &&
        changes.recordingTabId.newValue != changes.recordingTabId.oldValue
      ) {
        setRecordingTabId(changes.recordingTabId.newValue);
      }
      if (
        changes.recording != null &&
        changes.recording.newValue != changes.recording.oldValue
      ) {
        setActions(changes.recording.newValue);
      }
    });
  }, []);

  return [recordingTabId, actions] as const;
}
