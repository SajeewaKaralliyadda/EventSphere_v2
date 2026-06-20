import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import api from "../lib/api";

export type Role =
  | "SUPER_ADMIN"
  | "TENANT_ADMIN"
  | "ORGANIZER"
  | "CO_ORGANIZER"
  | "GATE_SCANNER"
  | "ATTENDEE";

export type UserStatus = "PENDING" | "ACTIVE";

/** Shape returned by GET /api/identity/users/me (tolerant of optional fields). */
export interface BackendUserDto {
  id: string;
  email: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  role: Role;
  status: UserStatus;
  tenantId?: string | null;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  status: UserStatus;
  tenantId?: string;
}

export interface LoginResult {
  status: UserStatus;
  role: Role;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  /** Demo / landing-page simulation only — not a real Supabase session. */
  demoLoginAs: (role: Role) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapBackendToUser(dto: BackendUserDto): User {
  let firstName = dto.firstName ?? "";
  let lastName = dto.lastName ?? "";
  
  // Fallback: split fullName if specific name fields are missing
  if ((!firstName || !lastName) && dto.fullName) {
    const parts = dto.fullName.trim().split(/\s+/);
    firstName = firstName || parts[0] || "";
    lastName = lastName || parts.slice(1).join(" ") || "";
  }
  
  return {
    id: dto.id,
    email: dto.email,
    firstName,
    lastName,
    role: dto.role,
    status: dto.status,
    tenantId: dto.tenantId ?? undefined,
  };
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Loads the backend profile. Pass `sessionFromEvent` from `onAuthStateChange` so the access token is used
   * immediately; `getSession()` can lag right after sign-in and would otherwise send unauthenticated requests.
   */
  const fetchUserProfile = useCallback(
    async (sessionFromEvent?: Session | null) => {
      const session =
        sessionFromEvent ?? (await supabase.auth.getSession()).data.session;

      if (!session?.user) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      const accessToken = session.access_token;

      try {
        const { data } = await api.get<BackendUserDto>(
          "/api/identity/users/me",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );
        setUser(mapBackendToUser(data));
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    void fetchUserProfile();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      // Sync local state whenever Supabase session changes (login/logout/refresh)
      if (session?.user) {
        void fetchUserProfile(session);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchUserProfile]);

  const login = async (
    email: string,
    password: string,
  ): Promise<LoginResult> => {
    setIsLoading(true);

    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setIsLoading(false);
      throw error;
    }

    // Try getting the token directly from signIn result, or fallback to fetching a fresh session
    let accessToken = authData.session?.access_token;
    if (!accessToken) {
      const {
        data: { session: recovered },
      } = await supabase.auth.getSession();
      accessToken = recovered?.access_token;
    }
    if (!accessToken) {
      setIsLoading(false);
      throw new Error("No access token after login");
    }

    try {
      const { data } = await api.get<BackendUserDto>("/api/identity/users/me", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const mapped = mapBackendToUser(data);
      setUser(mapped);
      setIsLoading(false);
      return { status: mapped.status, role: mapped.role };
    } catch (e) {
      console.error("Failed to load profile after login:", e);
      setIsLoading(false);
      throw e;
    }
  };

  const logout = async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setIsLoading(false);
  };

  const refreshProfile = async () => {
    setIsLoading(true);
    await fetchUserProfile();
  };

  const resetPassword = async (email: string): Promise<void> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  };

  const demoLoginAs = (role: Role) => {
    setUser({
      id: "demo-user",
      email: "demo@eventsphere.app",
      firstName: "Demo",
      lastName: "User",
      role,
      status: "ACTIVE",
    });
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        refreshProfile,
        resetPassword,
        demoLoginAs,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
