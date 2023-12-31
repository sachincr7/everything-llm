import React, { createContext, useState } from 'react';
import { AUTH_TIMESTAMP, AUTH_TOKEN, AUTH_USER } from './utils/constants';

type Auth = {
  store: { user: any; authToken: string | null };
  actions: { updateUser: (user: any, authToken?: string) => void; unsetUser: () => void };
} | null;

export const AuthContext = createContext<Auth>(null);
export const ContextWrapper = (props: any) => {
  const localUser = localStorage.getItem(AUTH_USER);
  const localAuthToken = localStorage.getItem(AUTH_TOKEN);
  const [store, setStore] = useState({
    user: localUser ? JSON.parse(localUser) : null,
    authToken: localAuthToken ? localAuthToken : null,
  });

  const [actions] = useState({
    updateUser: (user: any, authToken = '') => {
      localStorage.setItem(AUTH_USER, JSON.stringify(user));
      localStorage.setItem(AUTH_TOKEN, authToken);
      setStore({ user, authToken });
    },
    unsetUser: () => {
      localStorage.removeItem(AUTH_USER);
      localStorage.removeItem(AUTH_TOKEN);
      localStorage.removeItem(AUTH_TIMESTAMP);
      setStore({ user: null, authToken: null });
    },
  });

  return <AuthContext.Provider value={{ store, actions }}>{props.children}</AuthContext.Provider>;
};
