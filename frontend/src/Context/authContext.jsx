import { useState, useEffect, createContext } from "react";

export const Auth_context = createContext();

export const AuthProvider = ({ children }) => {
  const [logined, setLogined] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const isLogined = async () => {
      try {
        const req = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/login/is_Logined`,
          {
            credentials: "include",
          }
        );

        if (req.status === 200) {
          setLogined(true);
        } else {
          setLogined(false);
        }
      } catch (err) {
        console.error("Login check failed:", err.message);
        setLogined(false);
      } finally {
        setAuthLoading(false);
      }
    };

    isLogined();
  }, []); // ✅ Only check when AuthProvider mounts

  return (
    <Auth_context.Provider
      value={{ logined, setLogined, authLoading }}
    >
      {children}
    </Auth_context.Provider>
  );
};