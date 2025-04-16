import { createContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import API from "../api";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userGroups, setUserGroups] = useState([]); // ✅ Store user groups
  const [userProfilePic, setUserProfilePic] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [authTokens, setAuthTokens] = useState(() => {
    const storedTokens = sessionStorage.getItem("authTokens");
    return storedTokens ? JSON.parse(storedTokens) : null;
  });

  const [user, setUser] = useState(() => {
    const storedTokens = sessionStorage.getItem("authTokens");
    if (storedTokens) {
      try {
        const parsedTokens = JSON.parse(storedTokens);
        if (parsedTokens?.access_token && typeof parsedTokens.access_token === "string") {
          return jwtDecode(parsedTokens.access_token);
        }
      } catch (error) {
        console.error("Error decoding token:", error);
        return null;
      }
    }
    return null;
  });

  // Check authentication status on mount
  const checkAuthStatus = useCallback(async () => {
    try {
      const response = await API.get("profile/");
      setIsAuthenticated(true);
      setUserProfilePic(response.data.profile_pic || "");
      setFirstName(response.data.first_name);
      setLastName(response.data.last_name);
      setUserName(response.data.username);
      setEmail(response.data.email)
    } catch (error) {
      console.error("Auth check failed:", error);
      setIsAuthenticated(false);
      setUserProfilePic("");
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Login function
  const login = async (credentials) => {
    try {
      const response = await API.post("/login/", credentials, {
        withCredentials: true,
      });

      console.log("Login response:", response.data);

      if (!response.data.access_token || typeof response.data.access_token !== "string") {
        throw new Error("Invalid token received");
      }

      setIsAuthenticated(true);
      setUserProfilePic(response.data.profile_pic || "");
      setAuthTokens(response.data);
      
      setUser(jwtDecode(response.data.access_token));

      // Store authTokens in sessionStorage
      sessionStorage.setItem("authTokens", JSON.stringify(response.data));
      
      // Store access token separately for API interceptor
      sessionStorage.setItem("accessToken", response.data.access_token);

      const groups = response.data.groups ||  [];
      setUserGroups(groups);
      return groups;

    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await API.post("/logout/");
      setIsAuthenticated(false);
      setUserProfilePic("");
      setAuthTokens(null);
      setUser(null);
      
      // Remove tokens from sessionStorage
      sessionStorage.removeItem("authTokens");
      sessionStorage.removeItem("accessToken");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const contextData = {
    isAuthenticated,
    userProfilePic,
    userName,
    firstName,
    lastName,
    email,
    setUserProfilePic,
    user,
    authTokens,
    userGroups,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={contextData}>{children}</AuthContext.Provider>
  );
}