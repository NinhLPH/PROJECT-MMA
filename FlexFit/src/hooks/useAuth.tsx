import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import type {
  AuthSession,
  LoginInput,
  RegisterInput,
} from "@/models";
import { authService } from "@/services";

type AuthContextValue = {
  session: AuthSession | null;
  isAuthenticated: boolean;
  signIn: (input: LoginInput) => Promise<AuthSession>;
  signUp: (input: RegisterInput) => Promise<AuthSession>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<AuthSession | null>(null);

  const signIn = useCallback(async (input: LoginInput) => {
    const nextSession = await authService.login(input);
    setSession(nextSession);
    return nextSession;
  }, []);

  const signUp = useCallback(async (input: RegisterInput) => {
    await authService.register(input);
    const nextSession = await authService.login({
      email: input.email,
      password: input.password,
    });
    setSession(nextSession);
    return nextSession;
  }, []);

  const signOut = useCallback(() => {
    authService.logout();
    setSession(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: session !== null,
      session,
      signIn,
      signOut,
      signUp,
    }),
    [session, signIn, signOut, signUp],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
