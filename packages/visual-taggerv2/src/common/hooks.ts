import { useEffect, useState } from "react";

import { localStorageGet } from "./utils";
import { ScriptType } from "../types";

export const PREFERRED_LIB_STORAGE_KEY = "preferredLibrary";

export function usePreferredLibrary() {
  const [preferredLibrary, setPreferredLibrary] = useState<ScriptType | null>(
    null
  );

  useEffect(() => {
    localStorageGet([PREFERRED_LIB_STORAGE_KEY]).then(
      ({ preferredLibrary: storedPreferredLibrary }) => {
        setPreferredLibrary(storedPreferredLibrary);
      }
    );
  }, []);

  const setPreferredLibraryWithStorage = (library: ScriptType) => {
    setPreferredLibrary(library);
    chrome.storage.local.set({ [PREFERRED_LIB_STORAGE_KEY]: library });
  };

  return [preferredLibrary, setPreferredLibraryWithStorage] as const;
}
