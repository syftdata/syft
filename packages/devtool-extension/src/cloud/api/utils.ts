import { constants } from "../../constants";
import { UserSession } from "../../types";

export async function getUnauthorized(path: string) {
  return await fetch(`${constants.WebAppUrl}/${path}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    mode: "cors",
  });
}

export async function get(
  path: string,
  session: UserSession,
  params?: Record<string, string | undefined | number | boolean>
) {
  let queryParams = "";
  if (params) {
    queryParams = Object.keys(params)
      .filter((k) => params[k] != null)
      .map((k) => encodeURIComponent(k) + "=" + encodeURIComponent(params[k]!))
      .join("&");
  }
  return await fetch(`${constants.WebAppUrl}/${path}?` + queryParams, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.jwt}`,
    },
  });
}

export async function post(path: string, session: UserSession, body: any) {
  return await fetch(`${constants.WebAppUrl}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.jwt}`,
    },
    body: JSON.stringify(body),
  });
}
