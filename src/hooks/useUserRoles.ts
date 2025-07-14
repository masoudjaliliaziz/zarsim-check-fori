// hooks/useUserRoles.ts
import { useMemo } from "react";
import { allowedUsernames, MasterUsers, treasury } from "../constants/userRoles";

export function useUserRoles(username: string | null) {
  const isAgent = useMemo(
    () => username !== null && allowedUsernames.includes(username),
    [username]
  );
  const isMaster = useMemo(
    () => username !== null && MasterUsers.includes(username),
    [username]
  );

  const isTreasury = useMemo(
    () => username !== null && treasury.includes(username),
    [username]
  );
  return { isAgent, isMaster, isTreasury };
}
