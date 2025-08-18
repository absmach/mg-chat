"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { signIn, signOut } from "next-auth/react";
import { User } from "@absmach/magistrala-sdk";
import { CreateUser } from "@/lib/users";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    username: string,
    firstName: string,
    lastName: string
  ) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for existing auth token
    const token = localStorage.getItem("auth-token");
    const userData = localStorage.getItem("user-data");

    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        localStorage.removeItem("auth-token");
        localStorage.removeItem("user-data");
      }
    }

    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    await signIn("credentials", {
      redirect: true,
      callbackUrl: "/",
      identity: email,
      password: password,
    });
  };

  const register = async (
    email: string,
    password: string,
    name: string,
    firstName: string,
    lastName: string
  ) => {
    const user: User = {
      first_name: firstName,
      last_name: lastName,
      email: email,
      credentials: {
        username: name,
        secret: password,
      },
    };
    const result = await CreateUser(user);
    if (result.error === null) {
      await signIn("credentials", {
        redirect: true,
        callbackUrl: "/",
        identity: email,
        password: password,
      });
    } else {
      console.error(result.error);
    }
  };

  const logout = async () => {
    const data = await signOut({
      redirect: false,
      callbackUrl: "/auth",
    });
    router.push(data.url);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
