
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import GameInterface from '../components/GameInterface';
import { SettingsProvider } from '../context/SettingsContext';

// Mock dependencies
jest.mock('react-chessboard', () => ({
  Chessboard: ({ onMove, customArrows }) => {
    return (
      <div data-testid="chessboard">
        <button onClick={() => onMove('e2', 'e4')}>Move e2-e4</button>
        <div data-testid="arrows">{JSON.stringify(customArrows)}</div>
      </div>
    );
  }
}));

jest.mock('../hooks/useStockfish', () => ({
  useStockfish: () => ({
    bestMove: null,
    sendCommand: jest.fn(),
    resetBestMove: jest.fn(),
    isReady: true
  })
}));

jest.mock('../hooks/useCoach', () => ({
  useCoach: (enabled) => ({
    onTurnStart: jest.fn(),
    evaluateMove: jest.fn(),
    feedback: {
        message: "Best move!",
        type: 'best',
        reason: "You found the optimal continuation."
    },
    arrows: [],
    isThinking: false,
    resetFeedback: jest.fn(),
    currentEval: { score: 10, bestMove: 'e2e4' }
  })
}));

test('Coach Mode feedback is rendered', () => {
  render(
    <SettingsProvider>
      <GameInterface initialMode="bots" />
    </SettingsProvider>
  );

  // Toggle Coach Mode
  const coachButton = screen.getByTitle('Toggle Coach Mode');
  fireEvent.click(coachButton);

  // Check if Coach Feedback is visible (It is mocked to always return feedback if useCoach is called)
  // But useCoach implementation in the component depends on state.
  // We mocked the hook to return feedback.
  // The component renders CoachFeedback if feedback is present.

  expect(screen.getByText('Best move!')).toBeInTheDocument();
  expect(screen.getByText('Best Move')).toBeInTheDocument(); // Header from CoachFeedback
});

test('Move Suggestion button works', () => {
    render(
        <SettingsProvider>
          <GameInterface initialMode="bots" />
        </SettingsProvider>
    );

    // Find Move Suggestion button
    const suggestionBtn = screen.getByTitle('Move Suggestion');
    expect(suggestionBtn).toBeInTheDocument();

    // Click it
    fireEvent.click(suggestionBtn);

    // Check if arrow is set (via customArrows prop on Chessboard)
    // The mocked hook returns bestMove: 'e2e4'
    const chessboard = screen.getByTestId('arrows');
    expect(chessboard.textContent).toContain('e2');
    expect(chessboard.textContent).toContain('e4');
});
