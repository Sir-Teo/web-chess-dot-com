
import React, { useMemo } from 'react';
import { MoveAnalysis } from '../src/utils/gameAnalysis';

interface EvaluationGraphProps {
  moves: MoveAnalysis[];
  currentMoveIndex: number;
  onMoveClick: (index: number) => void;
}

const EvaluationGraph: React.FC<EvaluationGraphProps> = ({ moves, currentMoveIndex, onMoveClick }) => {
  const points = useMemo(() => {
    // 1. Initial point (start of game) - assume 0 or roughly equal
    const data = [{ x: 0, y: 0, index: -1 }];

    moves.forEach((move, i) => {
        let val = move.eval || 0;
        if (move.mate) {
            // Clamp mate scores for visual graph
            val = move.mate > 0 ? 1000 : -1000;
        }

        // Clamp CP scores between -1000 and 1000 for display
        val = Math.max(-1000, Math.min(1000, val));

        data.push({
            x: i + 1,
            y: val,
            index: i
        });
    });
    return data;
  }, [moves]);

  // Dimensions
  const height = 100;
  const width = 100; // Percent

  // Scales
  const mapY = (val: number) => {
      // Input: -1000 to 1000
      // Output: 100% (bottom) to 0% (top)
      // 0 => 50%
      const normalized = (val + 1000) / 2000; // 0 to 1
      return (1 - normalized) * 100;
  };

  const polylinePoints = points.map(p => {
      const xPct = (p.x / Math.max(1, moves.length)) * 100;
      return `${xPct},${mapY(p.y)}`;
  }).join(' ');

  // Fill area points (close the loop at y=0 which is mapY(0))
  const zeroY = mapY(0);
  const fillPoints = `0,${zeroY} ${polylinePoints} 100,${zeroY}`;

  return (
    <div className="w-full h-32 bg-[#211f1c] relative border-b border-white/5 overflow-hidden group">
        {/* Zero Line */}
        <div className="absolute top-1/2 left-0 right-0 h-px bg-white/10" />

        <svg viewBox={`0 0 100 100`} preserveAspectRatio="none" className="w-full h-full">
            <polygon points={fillPoints} fill="rgba(255, 255, 255, 0.1)" />
            <polyline
                points={polylinePoints}
                fill="none"
                stroke="#a3d154"
                strokeWidth="1.5"
                vectorEffect="non-scaling-stroke"
            />
        </svg>

        {/* Hover / Interaction Layer */}
        <div className="absolute inset-0 flex items-stretch">
            {points.map((p, i) => {
                const isCurrent = p.index === currentMoveIndex;
                // Skip the start point 0 if it messes up alignment or handle it
                if (i === 0) return null; // Or render a small slice

                // Get original move if possible
                const move = moves[p.index];

                return (
                    <div
                        key={i}
                        className="flex-1 hover:bg-white/5 relative group/bar cursor-pointer"
                        onClick={() => onMoveClick(p.index)}
                    >
                         {/* Highlight if current */}
                         {isCurrent && (
                             <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-white/50" />
                         )}

                         {/* Tooltip on hover */}
                         <div className="hidden group-hover/bar:block absolute bottom-full left-1/2 -translate-x-1/2 bg-black/80 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap mb-1 z-10">
                            Move {Math.ceil((p.index + 1) / 2)}: {move?.mate ? `M${move.mate}` : move?.eval ? (move.eval / 100).toFixed(2) : "0.00"}
                         </div>
                    </div>
                );
            })}
        </div>
    </div>
  );
};

export default EvaluationGraph;
