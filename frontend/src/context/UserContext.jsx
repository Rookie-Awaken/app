import React, { createContext, useContext, useEffect, useState } from "react";

const UserContext = createContext(null);

const STORAGE_KEY = "gpsc_user";

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch (e) { /* ignore */ }
    setLoaded(true);
  }, []);

  const saveUser = (u) => {
    setUser(u);
    if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    else localStorage.removeItem(STORAGE_KEY);
  };

  const logout = () => saveUser(null);

  return (
    <UserContext.Provider value={{ user, setUser: saveUser, logout, loaded }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
