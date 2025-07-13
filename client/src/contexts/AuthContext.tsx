import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  login as apiLogin,
  logout as apiLogout,
  register as apiRegister,
  getCurrentUser,
  LoginCredentials,
  RegisterData,
} from "../api";
import { useNavigate } from "react-router-dom";

// Define user type
interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  organization_id: string;
}

// Define auth context interface
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Check for existing auth on mount
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      getCurrentUser()
        .then((userData) => {
          setUser(userData);
        })
        .catch(() => {
          // If token is invalid, clear it
          localStorage.removeItem("token");
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  // Login handler
  const login = async (credentials: LoginCredentials) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiLogin(credentials);
      setUser(response.user);

      // Check if there's a redirect path stored
      const redirectPath = localStorage.getItem("redirectAfterLogin");
      if (redirectPath) {
        // Clear the stored path
        localStorage.removeItem("redirectAfterLogin");
        // Navigate to the stored path
        navigate(redirectPath);
      } else {
        // Default redirect to dashboard
        navigate("/dashboard");
      }
    } catch (err: any) {
      // Check for FastAPI error format first (detail field)
      setError(
        err.data?.detail || err.data?.error?.message || "Failed to login"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Register handler
  const register = async (data: RegisterData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiRegister(data);
      if (response.access_token) {
        setUser(response.user);
        navigate("/dashboard");
      }
    } catch (err: any) {
      // Check for FastAPI error format first (detail field)
      setError(
        err.data?.detail || err.data?.error?.message || "Failed to register"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout handler
  const logout = async () => {
    setLoading(true);

    try {
      await apiLogout();
      setUser(null);
      navigate("/login");
    } catch (err: any) {
      // Check for FastAPI error format first (detail field)
      setError(
        err.data?.detail || err.data?.error?.message || "Failed to logout"
      );
    } finally {
      setLoading(false);
    }
  };

  // Auth context value
  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
