import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import authService from "../services/authService";
import type { LoginRequest, RegisterRequest } from "../types/auth";
import type { User } from "../types/user";
import {
  clearAuthStorage,
  getStoredUser,
  getToken,
  setStoredUser,
  setToken,
} from "../utils/storage";

type AuthContextValue = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginRequest) => Promise<void>;
  register: (payload: RegisterRequest) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(getStoredUser());
  const [token, setTokenState] = useState<string | null>(getToken());
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const currentToken = getToken();
    if (!currentToken) {
      setUser(null);
      setTokenState(null);
      return;
    }
    const profile = await authService.getCurrentUser();
    setUser(profile);
    setStoredUser(profile);
    setTokenState(currentToken);
  }, []);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        if (getToken()) {
          await refreshUser();
        }
      } catch {
        clearAuthStorage();
        setUser(null);
        setTokenState(null);
      } finally {
        setIsLoading(false);
      }
    };
    void bootstrap();
  }, [refreshUser]);

  const login = useCallback(async (payload: LoginRequest) => {
    const response = await authService.login(payload);
    setToken(response.token);
    setTokenState(response.token);
    const profile: User = {
      id: response.userId,
      fullName: response.fullName,
      email: response.email,
      role: response.role,
      active: true,
    };
    setUser(profile);
    setStoredUser(profile);
    await refreshUser();
  }, [refreshUser]);

  const register = useCallback(async (payload: RegisterRequest) => {
    await authService.register(payload);
  }, []);

  const logout = useCallback(() => {
    clearAuthStorage();
    setUser(null);
    setTokenState(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      isLoading,
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, token, isLoading, login, register, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
