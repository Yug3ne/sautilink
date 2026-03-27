import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  createElement,
} from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

const SESSION_KEY = "sauti-session-token";

interface AuthContextType {
  mca: any | null;
  sessionToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  mca: null,
  sessionToken: null,
  isLoading: true,
  isAuthenticated: false,
  isSuperAdmin: false,
  login: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(SESSION_KEY)
  );

  const session = useQuery(
    api.auth.getSession,
    token ? { sessionToken: token } : "skip"
  );

  const loginMutation = useMutation(api.auth.login);
  const logoutMutation = useMutation(api.auth.logout);

  // If the session query resolves to null (expired/invalid token), clear it
  useEffect(() => {
    if (session === null && token) {
      localStorage.removeItem(SESSION_KEY);
      setToken(null);
    }
  }, [session, token]);

  const login = useCallback(
    async (email: string, password: string) => {
      const result: any = await loginMutation({ email, password });
      localStorage.setItem(SESSION_KEY, result.token);
      setToken(result.token);
    },
    [loginMutation]
  );

  const logout = useCallback(async () => {
    if (token) {
      try {
        await logoutMutation({ sessionToken: token });
      } catch {
        // Even if the server call fails, clear local state
      }
      localStorage.removeItem(SESSION_KEY);
      setToken(null);
    }
  }, [token, logoutMutation]);

  // session === undefined means the query is still loading
  // session === null means not authenticated (or token invalid)
  // session is an object means authenticated
  const isLoading = token !== null && session === undefined;
  const mca = session && typeof session === "object" ? session : null;
  const isAuthenticated = mca !== null;
  const isSuperAdmin = mca?.role === "superadmin";

  return createElement(
    AuthContext.Provider,
    {
      value: {
        mca,
        sessionToken: token,
        isLoading,
        isAuthenticated,
        isSuperAdmin,
        login,
        logout,
      },
    },
    children
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
