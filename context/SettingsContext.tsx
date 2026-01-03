import React, { createContext, useContext, useState, ReactNode } from 'react';

export type BoardThemeId = 'green' | 'brown' | 'blue' | 'gray' | 'purple' | 'orange';
export type PieceThemeId = 'neo' | 'wood' | 'alpha' | 'classic' | 'icy' | 'game_room' | 'glass';

interface BoardTheme {
    id: BoardThemeId;
    name: string;
    light: string;
    dark: string;
}

interface PieceTheme {
    id: PieceThemeId;
    name: string;
}

export const BOARD_THEMES: BoardTheme[] = [
    { id: 'green', name: 'Green', light: '#eeeed2', dark: '#769656' },
    { id: 'brown', name: 'Brown', light: '#f0d9b5', dark: '#b58863' },
    { id: 'blue', name: 'Icy Sea', light: '#dee3e6', dark: '#8ca2ad' },
    { id: 'gray', name: 'Gray', light: '#cdd2da', dark: '#7d8796' },
    { id: 'purple', name: 'Purple', light: '#e2e2ee', dark: '#7675ac' },
    { id: 'orange', name: 'Orange', light: '#fce4b2', dark: '#ce8832' },
];

export const PIECE_THEMES: PieceTheme[] = [
    { id: 'neo', name: 'Neo' },
    { id: 'wood', name: 'Wood' },
    { id: 'alpha', name: 'Alpha' },
    { id: 'classic', name: 'Classic' },
    { id: 'icy', name: 'Icy' },
    { id: 'game_room', name: 'Game Room' },
    { id: 'glass', name: 'Glass' },
];

interface SettingsContextType {
    boardTheme: BoardThemeId;
    setBoardTheme: (theme: BoardThemeId) => void;
    pieceTheme: PieceThemeId;
    setPieceTheme: (theme: PieceThemeId) => void;
    showCoordinates: boolean;
    setShowCoordinates: (show: boolean) => void;
    isSettingsOpen: boolean;
    openSettings: () => void;
    closeSettings: () => void;
    animationSpeed: 'slow' | 'normal' | 'fast';
    setAnimationSpeed: (speed: 'slow' | 'normal' | 'fast') => void;
    soundEnabled: boolean;
    setSoundEnabled: (enabled: boolean) => void;
    moveMethod: 'drag' | 'click';
    setMoveMethod: (method: 'drag' | 'click') => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Default settings
    const [boardTheme, setBoardTheme] = useState<BoardThemeId>('green');
    const [pieceTheme, setPieceTheme] = useState<PieceThemeId>('neo');
    const [showCoordinates, setShowCoordinates] = useState(true);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [animationSpeed, setAnimationSpeed] = useState<'slow' | 'normal' | 'fast'>('normal');
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [moveMethod, setMoveMethod] = useState<'drag' | 'click'>('drag');

    const openSettings = () => setIsSettingsOpen(true);
    const closeSettings = () => setIsSettingsOpen(false);

    return (
        <SettingsContext.Provider
            value={{
                boardTheme,
                setBoardTheme,
                pieceTheme,
                setPieceTheme,
                showCoordinates,
                setShowCoordinates,
                isSettingsOpen,
                openSettings,
                closeSettings,
                animationSpeed,
                setAnimationSpeed,
                soundEnabled,
                setSoundEnabled,
                moveMethod,
                setMoveMethod
            }}
        >
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};
