import { useState, useEffect } from "react";
import { getCurrentUser } from "../api/itemsApi";
import { useUserRoles } from "./useUserRoles";

export const useCurrentUser = () => {
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);
  const { isTreasury, isMaster } = useUserRoles(currentUsername);

  useEffect(() => {
    getCurrentUser()
      .then(setCurrentUsername)
      .catch((err) => console.error("خطا در دریافت کاربر فعلی:", err));
  }, []);

  return { currentUsername, isTreasury, isMaster };
};
