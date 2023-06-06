import { useState } from "react";
import { localStorageGet } from "../../common/utils";
import {
  Action,
  ActionType,
  RecordingMode,
  RecordingState,
  TagName,
} from "../../types";

export const RECORDING_STORAGE_KEY = "recording";

export async function getRecordingState(): Promise<RecordingState | undefined> {
  const { recording } = await localStorageGet([RECORDING_STORAGE_KEY]);
  if (recording) {
    return recording;
  }
}

export async function setRecordingState(recording: RecordingState | undefined) {
  if (recording == null) {
    await chrome.storage.local.remove([RECORDING_STORAGE_KEY]);
  } else {
    await chrome.storage.local.set({ [RECORDING_STORAGE_KEY]: recording });
  }
}

export async function startPreview(
  tabId: number,
  frameId: number,
  newUrl: string
) {
  const recording: RecordingState = {
    mode: RecordingMode.PREVIEW,
    recordingTabId: tabId,
    recordingFrameId: frameId,
    recording: [
      // @ts-ignore
      {
        type: ActionType.Load,
        url: newUrl,
        selectors: {},
        timestamp: 0,
        isPassword: false,
        hasOnlyText: false,
      },
    ],
  };
  await setRecordingState(recording);
}

export async function stopPreview() {
  await setRecordingState({
    mode: RecordingMode.RECORDING,
    recordingTabId: undefined,
    recordingFrameId: undefined,
    recording: [],
  });
}

export async function updateRecordingState(
  updater: (state: RecordingState) => RecordingState
) {
  const state = await getRecordingState();
  if (!state) {
    throw new Error("No recording state found");
  }
  const newState = updater(state);
  setRecordingState(newState);
  return newState;
}

export function useRecordingState() {
  const [_recording, _setRecording] = useState<RecordingState | undefined>();

  // changes flow through the storage listener
  chrome.storage.onChanged.addListener((changes) => {
    if (changes[RECORDING_STORAGE_KEY] != null) {
      if (
        changes[RECORDING_STORAGE_KEY].newValue !=
        changes[RECORDING_STORAGE_KEY].oldValue
      ) {
        _setRecording(changes[RECORDING_STORAGE_KEY].newValue);
      }
    }
  });

  return {
    recordingState: _recording,
    startRecordingState: startPreview,
    stopRecordingState: stopPreview,
  };
}
