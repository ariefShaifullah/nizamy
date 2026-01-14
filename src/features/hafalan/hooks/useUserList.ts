
import { useState, useCallback, useEffect } from 'react';
import type { UserSummary } from '../../../types.ts';
import { getAllUsers, deleteUser as serviceDeleteUser } from '../logic/hafalan.service.ts';

export const useUserList = () => {
    const [usersList, setUsersList] = useState<UserSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const refreshUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const users = await getAllUsers();
            setUsersList(users);
        } catch (e) {
            console.error("Failed to fetch users", e);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Initial Load
    useEffect(() => {
        refreshUsers();
    }, [refreshUsers]);

    const handleDeleteUser = useCallback(async (userId: string) => {
        await serviceDeleteUser(userId);
        await refreshUsers();
    }, [refreshUsers]);

    return {
        usersList,
        isLoading,
        refreshUsers,
        handleDeleteUser
    };
};
