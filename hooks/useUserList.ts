import { useState, useCallback, useEffect } from "react";
import type { UserSummary } from "../types.ts";
import {
  getAllUsers,
  deleteUser as serviceDeleteUser,
} from "../services/hafalan.service.ts";

export const useUserList = () => {
  const [usersList, setUsersList] = useState<UserSummary[]>([]);

  const refreshUsers = useCallback(() => {
    setUsersList(getAllUsers());
  }, []);

  // Initial Load
  useEffect(() => {
    refreshUsers();
  }, [refreshUsers]);

  const handleDeleteUser = useCallback(
    (userId: string) => {
      serviceDeleteUser(userId);
      refreshUsers();
    },
    [refreshUsers]
  );

  return {
    usersList,
    refreshUsers,
    handleDeleteUser,
  };
};
