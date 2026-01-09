import React from 'react';

interface EvaluationBarProps {
    score: number; // in centipawns (from white's perspective). +100 = +1.0
    mate?: number; // moves to mate (positive for white, negative for black)
}

const EvaluationBar: React.FC<EvaluationBarProps> = ({ score, mate }) => {
    // Calculate percentage for white bar height
    let percentage = 50;

    if (mate !== undefined) {
        if (mate > 0) percentage = 100; // White mates
        else percentage = 0;   // Black mates
    } else {
        // Use a sigmoid-like function or clamped linear
        // Standard is often: 50 + (score / 10) clamped to 0-100? No, that's too sensitive. 1 pawn = 10%.
        // Lichess uses: 50 + 50 * (2 / (1 + exp(-0.004 * score)) - 1)
        // Let's use a simpler clamped linear for now or the Lichess formula.
        // Let's use a simpler formula: 1 pawn (100cp) = ~10% shift?
        // Let's try: 50 + (score / 10) limited to 5% and 95%.
        // Actually, let's use the formula:
        // p = 1 / (1 + 10^(-score/400)) which is standard ELO probability, but here we want visual advantage.
        // Let's stick to a visual clamp.
        // 500 cp (+5) should be near full bar (95%).

        // Linear Clamped:
        // score is cp.
        // Max range: +/- 500 (5 pawns) -> 100% / 0%
        const clampedScore = Math.max(-500, Math.min(500, score));
        percentage = 50 + (clampedScore / 10);
    }

    // Invert because height is from bottom? Yes, height: X% means X% from bottom is white.
    // CSS height grows from bottom if we position absolute bottom 0.

    // Display text
    let text = "";
    if (mate !== undefined) {
        text = `M${Math.abs(mate)}`;
    } else {
        text = (Math.abs(score) / 100).toFixed(1);
    }

    const isWhiteWinning = (mate !== undefined && mate > 0) || (mate === undefined && score > 0);

    return (
        <div className="w-full h-full bg-[#403d39] relative rounded overflow-hidden flex flex-col border border-black/20">
            {/* Black Bar (Background is technically black/dark, White bar overlays) */}

            {/* White Bar */}
            <div
                className="w-full bg-white absolute bottom-0 left-0 transition-all duration-500 ease-in-out"
                style={{ height: `${percentage}%` }}
            />

            {/* Score Label */}
            <div className={`absolute left-0 right-0 text-[10px] font-bold text-center z-10 ${percentage > 90 ? 'top-1 text-[#403d39]' : percentage < 10 ? 'bottom-1 text-white' : isWhiteWinning ? 'bottom-1 text-[#403d39]' : 'top-1 text-white'}`}>
                {text}
            </div>
        </div>
    );
};

export default EvaluationBar;
