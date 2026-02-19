import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getToken, getUser, setToken, setUser, removeToken, removeUser, login as apiLogin } from "@/lib/api";

export type UserRole = "ADMIN" | "DATA_OFFICER";

interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email?: string; username?: string; password: string }) => Promise<void>;
  loginDataOfficer: (credentials: { username: string; password: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    const storedUser = getUser();
    if (token && storedUser) {
      setUserState(storedUser as User);
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: { email?: string; username?: string; password: string }) => {
    const response = await apiLogin(credentials);
    const userWithRole: User = { ...response.user, role: "ADMIN" as UserRole };
    setToken(response.token);
    setUser(userWithRole);
    setUserState(userWithRole);
  };

  const loginDataOfficer = async (credentials: { username: string; password: string }) => {
    const response = await apiLogin({ username: credentials.username, password: credentials.password });
    const userWithRole: User = { ...response.user, role: "DATA_OFFICER" as UserRole };
    setToken(response.token);
    setUser(userWithRole);
    setUserState(userWithRole);
  };

  const logout = () => {
    removeToken();
    removeUser();
    setUserState(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, loginDataOfficer, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    // Return a safe default during HMR or when provider is momentarily unavailable
    return {
      user: null,
      isAuthenticated: false,
      isLoading: true,
      login: async () => {},
      loginDataOfficer: async () => {},
      logout: () => {},
    };
  }
  return context;
};
