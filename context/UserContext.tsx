import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserProfile {
    username: string;
    country: string; // Emoji flag or code
    rating: number;
    avatar: string;
    isPremium: boolean;
}

interface UserContextType {
    user: UserProfile;
    updateUser: (updates: Partial<UserProfile>) => void;
}

const defaultUser: UserProfile = {
    username: 'Guest',
    country: '🇺🇸',
    rating: 800,
    avatar: 'https://images.chesscomfiles.com/uploads/v1/user/guest.png', // Placeholder
    isPremium: false
};

const UserContext = createContext<UserContextType>({
    user: defaultUser,
    updateUser: () => {}
});

export const useUser = () => useContext(UserContext);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<UserProfile>(() => {
        const saved = localStorage.getItem('chess_user_profile');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error("Failed to parse user profile", e);
            }
        }
        return {
            ...defaultUser,
            username: `Guest${Math.floor(Math.random() * 10000)}`
        };
    });

    useEffect(() => {
        localStorage.setItem('chess_user_profile', JSON.stringify(user));
    }, [user]);

    const updateUser = (updates: Partial<UserProfile>) => {
        setUser(prev => ({ ...prev, ...updates }));
    };

    return (
        <UserContext.Provider value={{ user, updateUser }}>
            {children}
        </UserContext.Provider>
    );
};
