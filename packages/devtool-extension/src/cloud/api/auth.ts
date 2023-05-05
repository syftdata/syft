import { createTab } from "../../common/utils";
import { getConstants } from "../../constants";
import { UserSession } from "../../types";
import { getUserSession, setUserSession } from "../state/usersession";
import { getUnauthorized } from "./utils";

export async function fetchUserSession(): Promise<UserSession | undefined> {
  const userSession = await getUserSession();
  if (userSession) {
    return userSession;
  }

  console.log(
    "[Syft][Devtools] userSession not found. Retrieving from server."
  );
  const response = await getUnauthorized("/api/extension_auth");
  if (response.status !== 200) {
    return;
  }
  const loginResponse: UserSession = await response.json();
  console.log("[Syft][Devtools] session", loginResponse);
  if (loginResponse != null) {
    setUserSession(loginResponse);
    return loginResponse;
  }
  return;
}

let loginCheckInterval: NodeJS.Timer | null = null;
export async function initiateLoginFlow(): Promise<UserSession> {
  const session = await fetchUserSession();
  if (session) {
    return session;
  } else {
    // TODO: clearing old interval. This is a hack. Need to fix this.
    if (loginCheckInterval) clearInterval(loginCheckInterval);
    const constants = await getConstants();
    return new Promise((resolve, reject) => {
      createTab(constants.WebAppUrl);
      loginCheckInterval = setInterval(async () => {
        const session = await fetchUserSession();
        if (session) {
          resolve(session);
          if (loginCheckInterval) clearInterval(loginCheckInterval);
        }
      }, 1000);
    });
  }
}
