import { useState, useEffect } from 'react';

const STORAGE_KEY = 'chess_lesson_progress';

export const useLessonProgress = () => {
    const [completedLessons, setCompletedLessons] = useState<string[]>(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error("Failed to load lesson progress", e);
            return [];
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(completedLessons));
        } catch (e) {
            console.error("Failed to save lesson progress", e);
        }
    }, [completedLessons]);

    const markLessonComplete = (lessonId: string) => {
        setCompletedLessons(prev => {
            if (prev.includes(lessonId)) return prev;
            return [...prev, lessonId];
        });
    };

    const isLessonComplete = (lessonId: string) => {
        return completedLessons.includes(lessonId);
    };

    return {
        completedLessons,
        markLessonComplete,
        isLessonComplete
    };
};
