import React from 'react';
import {
    Sparkles,
    Star,
    ThumbsUp,
    Check,
    BookOpen,
    X,
    Minus,
    CircleSlash, // For missed win (forced) - or Target
    Target
} from 'lucide-react';
import { MoveAnalysis } from '../src/utils/gameAnalysis';

interface MoveClassificationIconProps {
    classification: MoveAnalysis['classification'] | null | undefined;
    size?: 'sm' | 'md' | 'lg' | number;
}

const MoveClassificationIcon: React.FC<MoveClassificationIconProps> = ({ classification, size = 16 }) => {
    if (!classification) return null;

    // Resolve size prop
    let pixelSize = 16;
    if (typeof size === 'number') {
        pixelSize = size;
    } else {
        switch (size) {
            case 'sm': pixelSize = 12; break;
            case 'md': pixelSize = 20; break;
            case 'lg': pixelSize = 24; break;
        }
    }

    const getIcon = () => {
        switch (classification) {
            case 'brilliant':
                return <Sparkles size={pixelSize} className="text-white fill-white" />;
            case 'great':
                return <span className="font-bold font-mono text-white" style={{ fontSize: pixelSize * 0.8 }}>!</span>;
            case 'best':
                return <Star size={pixelSize} className="text-white fill-white" />; // Filled star usually
            case 'excellent':
                return <ThumbsUp size={pixelSize} className="text-white fill-white" />;
            case 'good':
                return <Check size={pixelSize} className="text-white" />;
            case 'book':
                return <BookOpen size={pixelSize} className="text-white fill-white" />;
            case 'inaccuracy':
                return <span className="font-bold font-mono text-white" style={{ fontSize: pixelSize * 0.8 }}>?!</span>;
            case 'mistake':
                return <span className="font-bold font-mono text-white" style={{ fontSize: pixelSize * 0.8 }}>?</span>;
            case 'blunder':
                return <span className="font-bold font-mono text-white" style={{ fontSize: pixelSize * 0.8 }}>??</span>;
            case 'missed-win':
            case 'forced': // Legacy support
                return <Target size={pixelSize} className="text-white fill-white" />;
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
            case 'missed-win':
            case 'forced': return 'bg-[#fa412d]'; // Red or Pink? Chess.com uses Pink/Red for Missed Win.
            default: return 'bg-transparent';
        }
    };

    const bgColor = getBgColor();

    return (
        <div
            className={`flex items-center justify-center rounded-full shadow-sm ${bgColor}`}
            style={{ width: pixelSize + 4, height: pixelSize + 4, minWidth: pixelSize + 4 }}
            title={classification.charAt(0).toUpperCase() + classification.slice(1)}
        >
            {getIcon()}
        </div>
    );
};

export default MoveClassificationIcon;
