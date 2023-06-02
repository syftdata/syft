import { useState } from "react";
import { localStorageGet } from "../../common/utils";
import { Action, ActionType, RecordingState, TagName } from "../../types";

export const RECORDING_STORAGE_KEY = "recording";

export async function getRecordingState(): Promise<RecordingState | undefined> {
  const { recording } = await localStorageGet([RECORDING_STORAGE_KEY]);
  if (recording) {
    return recording;
  }
}

export async function setRecordingState(Recording: RecordingState | undefined) {
  if (Recording == null) {
    await chrome.storage.local.remove([RECORDING_STORAGE_KEY]);
  } else {
    await chrome.storage.local.set({ [RECORDING_STORAGE_KEY]: Recording });
  }
}

export async function startRecordingState(
  tabId: number,
  frameId: number,
  newUrl: string
) {
  const recording: RecordingState = {
    recordingState: "active",
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

export async function stopRecordingState() {
  setRecordingState({
    recordingState: "finished",
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
      console.log("Recording changed in storage");
      if (
        changes[RECORDING_STORAGE_KEY].newValue !=
        changes[RECORDING_STORAGE_KEY].oldValue
      ) {
        console.log(
          "Updating recording state in storage",
          changes[RECORDING_STORAGE_KEY].newValue,
          changes[RECORDING_STORAGE_KEY].oldValue
        );
        _setRecording(changes[RECORDING_STORAGE_KEY].newValue);
      }
    }
  });

  const setRecordingActions = async (actions: Action[]) => {
    if (_recording == null) {
      throw new Error("Recording state is not set");
    }
    await setRecordingState({
      ..._recording,
      recording: actions,
    });
  };

  return {
    recordingState: _recording,
    startRecordingState,
    stopRecordingState,
    setRecordingActions,
  };
}
