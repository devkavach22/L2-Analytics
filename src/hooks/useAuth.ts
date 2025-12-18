// hooks/useAuth.ts
import { useState, useEffect } from "react";

export const useAuth = () => {
  const [isAuth, setIsAuth] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Example: check from localStorage or API
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role"); // "admin" or "user"
    setIsAuth(!!token);
    setIsAdmin(role === "admin");
  }, []);

  return { isAuth, isAdmin };
};
