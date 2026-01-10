import React from 'react';

interface EvaluationBarProps {
    score: number; // in centipawns (from white's perspective). +100 = +1.0
    mate?: number; // moves to mate (positive for white, negative for black)
    orientation?: 'vertical' | 'horizontal';
}

const EvaluationBar: React.FC<EvaluationBarProps> = ({ score, mate, orientation = 'vertical' }) => {
    // Calculate percentage for white bar size
    let percentage = 50;

    if (mate !== undefined) {
        if (mate > 0) percentage = 100; // White mates
        else percentage = 0;   // Black mates
    } else {
        // Linear Clamped:
        // score is cp.
        // Max range: +/- 500 (5 pawns) -> 100% / 0%
        const clampedScore = Math.max(-500, Math.min(500, score));
        percentage = 50 + (clampedScore / 10);
    }

    // Display text
    let text = "";
    if (mate !== undefined) {
        text = `M${Math.abs(mate)}`;
    } else {
        text = (Math.abs(score) / 100).toFixed(1);
    }

    const isWhiteWinning = (mate !== undefined && mate > 0) || (mate === undefined && score > 0);

    const isVertical = orientation === 'vertical';

    return (
        <div className={`w-full h-full bg-[#403d39] relative rounded overflow-hidden flex ${isVertical ? 'flex-col' : 'flex-row'} border border-black/20`}>
            {/* White Bar */}
            <div
                className="bg-white absolute transition-all duration-500 ease-in-out"
                style={{
                    ...(isVertical ? {
                        bottom: 0,
                        left: 0,
                        width: '100%',
                        height: `${percentage}%`
                    } : {
                        top: 0,
                        left: 0,
                        height: '100%',
                        width: `${percentage}%`
                    })
                }}
            />

            {/* Score Label */}
            <div
                className={`absolute text-[10px] font-bold z-10 flex items-center justify-center
                ${isVertical
                    ? `left-0 right-0 text-center ${percentage > 90 ? 'top-1 text-[#403d39]' : percentage < 10 ? 'bottom-1 text-white' : isWhiteWinning ? 'bottom-1 text-[#403d39]' : 'top-1 text-white'}`
                    : `top-0 bottom-0 px-1 ${percentage > 90 ? 'right-0 text-[#403d39]' : percentage < 10 ? 'left-0 text-white' : isWhiteWinning ? 'left-1 text-[#403d39]' : 'right-1 text-white'}`
                }`}
                style={!isVertical && !(percentage > 90 || percentage < 10) ? {
                     left: isWhiteWinning ? `${percentage}%` : 'auto',
                     right: !isWhiteWinning ? `${100 - percentage}%` : 'auto',
                     transform: isWhiteWinning ? 'translateX(-100%)' : 'translateX(100%)' // Move text inside/outside? No, just keep it simple.
                } : {}}
            >
                {!isVertical ? (
                    // Simplified horizontal text positioning
                    <div className={`w-full h-full flex items-center ${
                         percentage > 90 ? 'justify-end pr-1 text-[#403d39]' :
                         percentage < 10 ? 'justify-start pl-1 text-white' :
                         isWhiteWinning ? 'justify-end pr-1 text-[#403d39] mix-blend-exclusion' : 'justify-start pl-1 text-white mix-blend-exclusion'
                         // mix-blend might be tricky with bg colors.
                         // Let's stick to simple logic:
                         // If White winning (large white bar), text should be inside white bar (black text) or outside?
                         // If bar is 50%, text is in middle.
                    }`}>
                         <span style={{
                             color: percentage > 50 ? '#403d39' : '#fff',
                             // Position absolute based on center?
                             position: 'absolute',
                             left: '50%',
                             transform: 'translateX(-50%)',
                             textShadow: '0 0 2px rgba(0,0,0,0.5)' // Ensure visibility
                         }}>{text}</span>
                    </div>
                ) : (
                    text
                )}
            </div>
        </div>
    );
};

export default EvaluationBar;
