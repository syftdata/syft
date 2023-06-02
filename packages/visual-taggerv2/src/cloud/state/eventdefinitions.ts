import { useEffect, useState } from "react";
import { localStorageGet } from "../../common/utils";
import { GitInfo } from "../../types";
import { EventTag } from "../../visualtagger/types";

export const EVENT_DEFINITIONS_STORAGE_KEY = "gitInfo";

export async function getEventDefinitions(): Promise<EventTag[]> {
  const { eventDefs } = await localStorageGet([EVENT_DEFINITIONS_STORAGE_KEY]);
  return eventDefs;
}

export async function setEventDefinitions(defs: EventTag[] | undefined) {
  if (defs == null) {
    await chrome.storage.local.remove([EVENT_DEFINITIONS_STORAGE_KEY]);
  } else {
    await chrome.storage.local.set({
      [EVENT_DEFINITIONS_STORAGE_KEY]: defs,
    });
  }
}

export function useEventDefinitions() {
  const [_eventDefinitions, _setEventDefinitions] = useState<EventTag[]>([]);

  // changes flow through the storage listener
  chrome.storage.onChanged.addListener((changes) => {
    if (changes[EVENT_DEFINITIONS_STORAGE_KEY] != null) {
      console.log("event definitions changed in storage");
      if (
        changes[EVENT_DEFINITIONS_STORAGE_KEY].newValue !=
        changes[EVENT_DEFINITIONS_STORAGE_KEY].oldValue
      ) {
        console.log(
          "Updating event definitions in state",
          changes[EVENT_DEFINITIONS_STORAGE_KEY].newValue,
          changes[EVENT_DEFINITIONS_STORAGE_KEY].oldValue
        );
        _setEventDefinitions(changes[EVENT_DEFINITIONS_STORAGE_KEY].newValue);
      }
    }
  });

  return [_eventDefinitions, setEventDefinitions] as const;
}
