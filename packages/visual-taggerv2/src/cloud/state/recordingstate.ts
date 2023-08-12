import { useState } from "react";
import { localStorageGet } from "../../common/utils";
import { VisualMode, RecordingState } from "../../types";

export const RECORDING_STORAGE_KEY = "recording";

export async function getRecordingState(): Promise<RecordingState | undefined> {
  const { recording } = await localStorageGet([RECORDING_STORAGE_KEY]);
  if (recording) {
    return recording;
  }
}

async function setRecordingState(recording: RecordingState | undefined) {
  if (recording == null) {
    await chrome.storage.local.remove([RECORDING_STORAGE_KEY]);
  } else {
    await chrome.storage.local.set({ [RECORDING_STORAGE_KEY]: recording });
  }
}

const DEFAULT_RECORDING_STATE: RecordingState = {
  mode: VisualMode.SELECTED,
  tabId: undefined,
  frameId: 0,
  elements: [],
};

export async function updateRecordingState(
  updater: (state: RecordingState) => RecordingState
) {
  const state = (await getRecordingState()) ?? DEFAULT_RECORDING_STATE;
  const newState = updater(state);
  setRecordingState(newState);
  return newState;
}

export function useRecordingState() {
  const [_recording, _setRecording] = useState<RecordingState>(
    DEFAULT_RECORDING_STATE
  );

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
  };
}
