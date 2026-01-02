import React from 'react';
import Chessboard from './Chessboard';
import PuzzlesPanel from './PuzzlesPanel';

const PuzzlesInterface: React.FC = () => {
  return (
    <div className="flex flex-col lg:flex-row h-full md:h-screen w-full overflow-hidden bg-chess-dark">
      
      {/* Left Area (Board) */}
      <div className="flex-none lg:flex-1 flex flex-col items-center justify-center p-2 lg:p-4 bg-[#312e2b] relative">
        <div className="w-full max-w-[400px] lg:max-w-[85vh] aspect-square relative flex flex-col justify-center">
             {/* Puzzle Header Info (Simplistic) */}
             <div className="flex justify-between items-end mb-2 px-1">
                <div className="flex items-center gap-2">
                    <span className="text-white font-bold text-lg">Black to Move</span>
                </div>
            </div>

            <div className="rounded-sm overflow-hidden shadow-2xl ring-4 ring-black/10">
                 <Chessboard interactable={true} />
            </div>
            
             <div className="flex justify-between items-start mt-2 px-1">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-gray-500 overflow-hidden border border-white/20 relative group">
                        <img src="https://picsum.photos/200" alt="Me" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col justify-center">
                        <div className="flex items-center gap-1.5">
                            <span className="text-white font-bold text-sm leading-none">MasterTeo1205</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="flex-1 lg:flex-none w-full lg:w-[350px] xl:w-[420px] bg-[#262522] flex flex-col border-l border-white/10 shrink-0 h-auto lg:h-auto z-10 relative shadow-2xl overflow-hidden">
          <PuzzlesPanel />
      </div>
    </div>
  );
};

export default PuzzlesInterface;