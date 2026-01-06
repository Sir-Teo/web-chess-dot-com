import { useState, useEffect, useRef } from 'react';
import { Chess } from 'chess.js';
import { BotProfile } from '../utils/bots';

export const useBotChatter = (
  game: Chess,
  activeBot: BotProfile | null,
  userColor: 'w' | 'b',
  isGameOver: boolean
) => {
  const [botMessage, setBotMessage] = useState<string | null>(null);

  // Effect 1: Auto-clear message after a delay
  useEffect(() => {
      if (botMessage) {
          const timer = setTimeout(() => {
              setBotMessage(null);
          }, 4000); // 4 seconds duration
          return () => clearTimeout(timer);
      }
  }, [botMessage]);

  // Effect 2: Game Events
  useEffect(() => {
    if (!activeBot || isGameOver) {
        if (isGameOver && activeBot) {
             // Game Over messages
             if (game.isCheckmate()) {
                 if (game.turn() === userColor) {
                     // User lost (Bot won)
                     setBotMessage(getWinMessage(activeBot));
                 } else {
                     // User won (Bot lost)
                     setBotMessage(getLossMessage(activeBot));
                 }
             } else if (game.isDraw()) {
                 setBotMessage("Good game! It's a draw.");
             }
        }
        return;
    }

    const history = game.history({ verbose: true });

    // Start Game Message
    if (history.length === 0) {
        setBotMessage(getStartMessage(activeBot));
        return;
    }

    const lastMove = history[history.length - 1];
    const isBotMove = lastMove.color !== userColor;

    // Logic based on last move
    let msg: string | null = null;
    const chance = Math.random();

    if (isBotMove) {
        // Bot just moved
        if (game.isCheckmate()) {
            msg = getWinMessage(activeBot);
        } else if (game.isCheck()) {
             msg = getCheckMessage(activeBot);
        } else if (lastMove.captured) {
            if (chance > 0.6) msg = getCaptureMessage(activeBot);
        } else if (lastMove.flags.includes('k') || lastMove.flags.includes('q')) {
            if (chance > 0.8) msg = "Castling for safety.";
        }
    } else {
        // User just moved
        if (game.isCheck()) {
            if (chance > 0.5) msg = getReactToCheckMessage(activeBot);
        } else if (lastMove.captured) {
            if (chance > 0.7) msg = getReactToCaptureMessage(activeBot);
        }
    }

    if (msg) {
        setBotMessage(msg);
    }

  }, [game, activeBot, userColor, isGameOver]);

  return botMessage;
};

// Helper functions for personalities

const getStartMessage = (bot: BotProfile) => {
    switch (bot.id) {
        case 'mittens': return "Meow? Meow.";
        case 'nelson': return "I will destroy you!";
        case 'martin': return "Hi! I'm Martin.";
        case 'stockfish': return "I am ready.";
        case 'emir': return "Prepared for a challenge?";
        case 'sven': return "Let's have a clean game.";
        case 'antonio': return "Hola! Let's play.";
        case 'isabel': return "Don't blink.";
        case 'wemerson': return "I hope you know your endgames.";
        case 'li': return "Show me what you've got.";
        case 'komodo': return "I smell fear.";
        default: return "Good luck! Have fun.";
    }
};

const getWinMessage = (bot: BotProfile) => {
    switch (bot.id) {
        case 'mittens': return "All too easy. Meow.";
        case 'nelson': return "I told you I was aggressive!";
        case 'martin': return "Wow, I won? Good game!";
        case 'stockfish': return "Checkmate. As expected.";
        default: return "Good game! Well played.";
    }
};

const getLossMessage = (bot: BotProfile) => {
    switch (bot.id) {
        case 'mittens': return "Hissssss!";
        case 'nelson': return "You got lucky this time.";
        case 'martin': return "You are very good! I learned a lot.";
        default: return "Well done. You played better.";
    }
};

const getCheckMessage = (bot: BotProfile) => {
    switch (bot.id) {
        case 'mittens': return "Meow?";
        case 'nelson': return "Check! Watch your King.";
        default: return "Check!";
    }
};

const getCaptureMessage = (bot: BotProfile) => {
     switch (bot.id) {
        case 'mittens': return "Oopsie!";
        case 'nelson': return "That piece is mine now.";
        case 'martin': return "Did I do that?";
        default: return "Yum!";
    }
};

const getReactToCheckMessage = (bot: BotProfile) => {
     switch (bot.id) {
        case 'mittens': return "Scary!";
        case 'nelson': return "You think you can trap me?";
        case 'martin': return "Oh no, check!";
        default: return "Ooh, pressure.";
    }
};

const getReactToCaptureMessage = (bot: BotProfile) => {
     switch (bot.id) {
        case 'mittens': return "My piece! :(";
        case 'nelson': return "A bold trade.";
        case 'martin': return "Oh my...";
        default: return "Interesting choice.";
    }
};
