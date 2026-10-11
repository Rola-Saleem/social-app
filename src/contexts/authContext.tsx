import {
  createContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { authService } from "../services/authService";

export const authContext = createContext<any>({});

export default function AuthContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [isUserLogedIn, setIsUserLogedIn] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function getUserData() {
    try {
      const response = await authService.getUserData();

      console.log("User profile response:", response);

      const user =
        response?.data?.user ??
        response?.user ??
        response?.data ??
        null;

      if (!user) {
        throw new Error("User data not found");
      }

      setUserData(user);
      setIsUserLogedIn(true);
    } catch (error) {
      console.error("Get user data error:", error);

      setUserData(null);
      setIsUserLogedIn(false);
      localStorage.removeItem("token");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (localStorage.getItem("token")) {
      getUserData();
    } else {
      setIsLoading(false);
    }
  }, []);

  return (
    <authContext.Provider
      value={{
        isUserLogedIn,
        setIsUserLogedIn,
        userData,
        setUserData,
        isLoading,
        getUserData,
      }}
    >
      {children}
    </authContext.Provider>
  );
}