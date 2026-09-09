"use client";

import * as React from "react";
import { ApiRequestError } from "@/lib/api/client";
import {
  fetchCurrentUser,
  login as loginRequest,
  logout as logoutRequest,
  register as registerRequest,
} from "@/lib/api/auth";
import type { LoginValues, RegisterValues } from "@/lib/validation/auth";
import type { User } from "@/types/user";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (values: LoginValues) => Promise<User>;
  register: (values: RegisterValues) => Promise<User>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const refresh = React.useCallback(async () => {
    try {
      const currentUser = await fetchCurrentUser();
      setUser(currentUser);
    } catch (error) {
      if (error instanceof ApiRequestError && error.status === 401) {
        setUser(null);
      } else {
        throw error;
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount session check
    refresh();
  }, [refresh]);

  const login = React.useCallback(async (values: LoginValues) => {
    const loggedInUser = await loginRequest(values);
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const register = React.useCallback(async (values: RegisterValues) => {
    const newUser = await registerRequest(values);
    setUser(newUser);
    return newUser;
  }, []);

  const logout = React.useCallback(async () => {
    await logoutRequest();
    setUser(null);
  }, []);

  const value = React.useMemo(
    () => ({ user, isLoading, login, register, logout, refresh }),
    [user, isLoading, login, register, logout, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = React.useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}