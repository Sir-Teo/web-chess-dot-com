import React from 'react';

interface EvaluationBarProps {
  score: number; // Centipawns, always from White's perspective (+ = White winning)
  mate?: number; // Moves to mate (positive = White mates, negative = Black mates)
  orientation?: 'white' | 'black'; // To match board orientation (default white)
}

const EvaluationBar: React.FC<EvaluationBarProps> = ({ score, mate, orientation = 'white' }) => {
  // Cap the visual score to +/- 10.0 (1000 cp)
  const CAP = 1000;

  // Calculate percentage for White's bar (0 to 100)
  let whitePercent = 50;

  if (mate !== undefined) {
      if (mate > 0) whitePercent = 100; // White mates
      else if (mate < 0) whitePercent = 0; // Black mates
      else whitePercent = 50; // Should not happen if mate is set
  } else {
      const clampedScore = Math.max(-CAP, Math.min(CAP, score));
      // Map -1000..1000 to 0..100
      whitePercent = 50 + (clampedScore / CAP) * 50;

      // Clamp strictly between 2% and 98%
      whitePercent = Math.max(2, Math.min(98, whitePercent));
  }

  // Format the text label
  let label = "0.0";
  if (mate !== undefined) {
      label = `M${Math.abs(mate)}`;
  } else {
      const val = score / 100;
      label = (score > 0 ? "+" : "") + val.toFixed(1);
      if (score === 0) label = "0.0";
  }

  const isWhiteWinning = (mate !== undefined && mate > 0) || (mate === undefined && score > 0);

  return (
    <div
        className="w-full h-full bg-[#262421] rounded overflow-hidden border border-white/10 shadow-lg select-none"
        data-testid="eval-bar"
    >
        {/* Inner container with Black background */}
        <div className="relative w-full h-full bg-[#111]">
            {/* White Bar */}
            <div
                className="absolute w-full bg-white transition-all duration-700 ease-in-out will-change-[height]"
                style={{
                    height: `${whitePercent}%`,
                    bottom: orientation === 'white' ? 0 : 'auto',
                    top: orientation === 'black' ? 0 : 'auto',
                }}
            />

            {/* Score Label */}
            <div className={`
                absolute left-0 w-full text-[10px] text-center font-bold font-mono py-0.5 z-10
                ${isWhiteWinning ? 'text-[#312e2b]' : 'text-gray-200'}
            `}
            style={{
                top: orientation === 'white'
                    ? (isWhiteWinning ? 'auto' : '4px')
                    : (isWhiteWinning ? '4px' : 'auto'),

                bottom: orientation === 'white'
                    ? (isWhiteWinning ? '4px' : 'auto')
                    : (isWhiteWinning ? 'auto' : '4px'),
            }}
            >
                {label}
            </div>
        </div>
    </div>
  );
};

export default EvaluationBar;
