import { AUTH_TOKEN, AUTH_USER } from "./constants";

export function userFromStorage() {
  try {
    const userString = window.localStorage.getItem(AUTH_USER);
    if (!userString) return null;
    return JSON.parse(userString);
  } catch {}
  return {};
}

export function baseHeaders(providedToken = null): any {
  const token = providedToken || window.localStorage.getItem(AUTH_TOKEN);
  return {
    Authorization: token ? `Bearer ${token}` : null,
  };
}
