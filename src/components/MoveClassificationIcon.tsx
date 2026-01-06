import React from 'react';
import {
    Sparkles,
    Star,
    ThumbsUp,
    Check,
    BookOpen,
    X,
    Minus
} from 'lucide-react';
import { MoveAnalysis } from '../utils/gameAnalysis';

interface MoveClassificationIconProps {
    classification: MoveAnalysis['classification'] | null | undefined;
    size?: number;
}

const MoveClassificationIcon: React.FC<MoveClassificationIconProps> = ({ classification, size = 16 }) => {
    if (!classification) return null;

    const getIcon = () => {
        switch (classification) {
            case 'brilliant':
                return <Sparkles size={size} className="text-white fill-white" />;
            case 'great':
                return <span className="font-bold font-mono text-white text-[10px]">!</span>;
            case 'best':
                return <Star size={size} className="text-white fill-white" />; // Filled star usually
            case 'excellent':
                return <ThumbsUp size={size} className="text-white fill-white" />;
            case 'good':
                return <Check size={size} className="text-white" />;
            case 'book':
                return <BookOpen size={size} className="text-white fill-white" />;
            case 'inaccuracy':
                return <span className="font-bold font-mono text-white text-[10px]">?!</span>;
            case 'mistake':
                return <span className="font-bold font-mono text-white text-[10px]">?</span>;
            case 'blunder':
                return <span className="font-bold font-mono text-white text-[10px]">??</span>;
            case 'missed-win':
                return <Minus size={size} className="text-white" />;
            default:
                return null;
        }
    };

    const getBgColor = () => {
        switch (classification) {
            case 'brilliant': return 'bg-[#1baca6]'; // Teal
            case 'great': return 'bg-[#5c8bb0]'; // Blue
            case 'best': return 'bg-[#95b776]'; // Green
            case 'excellent': return 'bg-[#96bc4b]'; // Light Green
            case 'good': return 'bg-[#b3b3b3]'; // Gray (Good is usually neutral/positive) -> Actually Chess.com uses checkmark in gray/green
            case 'book': return 'bg-[#a38d79]'; // Brown
            case 'inaccuracy': return 'bg-[#f7c045]'; // Yellow
            case 'mistake': return 'bg-[#e6912c]'; // Orange
            case 'blunder': return 'bg-[#fa412d]'; // Red
            case 'missed-win': return 'bg-[#fa412d]'; // Red
            default: return 'bg-transparent';
        }
    };

    const bgColor = getBgColor();

    // "Good" usually has no background or a subtle one, but consistent styling looks better.
    // Authentic chess.com icons are often inside a circle or square.

    return (
        <div
            className={`flex items-center justify-center rounded-full shadow-sm ${bgColor}`}
            style={{ width: size + 4, height: size + 4, minWidth: size + 4 }}
            title={classification.charAt(0).toUpperCase() + classification.slice(1)}
        >
            {getIcon()}
        </div>
    );
};

export default MoveClassificationIcon;
