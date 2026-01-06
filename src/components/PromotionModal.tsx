import React from 'react';

interface PromotionModalProps {
  isOpen: boolean;
  color: 'w' | 'b';
  onSelect: (piece: 'q' | 'r' | 'b' | 'n') => void;
  onClose: () => void;
}

const PromotionModal: React.FC<PromotionModalProps> = ({ isOpen, color, onSelect, onClose }) => {
  if (!isOpen) return null;

  const pieces = [
    { type: 'q', name: 'Queen', img: `https://images.chesscomfiles.com/chess-themes/pieces/neo/150/${color}q.png` },
    { type: 'r', name: 'Rook', img: `https://images.chesscomfiles.com/chess-themes/pieces/neo/150/${color}r.png` },
    { type: 'b', name: 'Bishop', img: `https://images.chesscomfiles.com/chess-themes/pieces/neo/150/${color}b.png` },
    { type: 'n', name: 'Knight', img: `https://images.chesscomfiles.com/chess-themes/pieces/neo/150/${color}n.png` },
  ];

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#262522] p-4 rounded-xl shadow-2xl border border-white/10 flex gap-2">
        {pieces.map((p) => (
          <button
            key={p.type}
            onClick={() => onSelect(p.type as any)}
            className="w-20 h-20 bg-white/5 hover:bg-white/10 rounded-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95 border border-transparent hover:border-white/20"
            title={`Promote to ${p.name}`}
          >
            <img src={p.img} alt={p.name} className="w-16 h-16" />
          </button>
        ))}
        <button
            onClick={onClose}
            className="absolute top-[-10px] right-[-10px] bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg hover:bg-red-600"
        >
            ✕
        </button>
      </div>
    </div>
  );
};

export default PromotionModal;
