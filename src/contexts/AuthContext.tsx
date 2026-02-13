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

const AuthContext = createContext<AuthContextType | null>(null);

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
    if (credentials.username === "dataofficer" && credentials.password === "Data@1234") {
      const token = "mock-do-token-" + Date.now();
      const doUser: User = {
        id: "do-1",
        username: "dataofficer",
        email: "dataofficer@karnataka.gov.in",
        name: "Data Officer",
        role: "DATA_OFFICER",
      };
      setToken(token);
      setUser(doUser);
      setUserState(doUser);
    } else {
      throw new Error("Invalid credentials");
    }
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
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
