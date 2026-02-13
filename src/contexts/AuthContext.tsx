// AuthContext - Employee Transfer Management System
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getToken, getUser, setToken, setUser, removeToken, removeUser, login as apiLogin } from "@/lib/api";

interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: {
    email: string;
    password: string;
  }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    const token = getToken();
    const storedUser = getUser();
    
    if (token && storedUser) {
      setUserState(storedUser);
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: {
    email: string;
    password: string;
  }) => {
    const response = await apiLogin(credentials);
    setToken(response.token);
    setUser(response.user);
    setUserState(response.user);
  };

  const logout = () => {
    removeToken();
    removeUser();
    setUserState(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
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
