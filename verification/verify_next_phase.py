import os
import sys

# Mock imports or simple check to ensure files exist and key logic patterns are present
# We can't run the React app here, but we can check if the files contain the expected logic.

def verify_file_content(filepath, search_strings):
    if not os.path.exists(filepath):
        print(f"FAILED: {filepath} does not exist")
        return False

    with open(filepath, 'r') as f:
        content = f.read()

    for s in search_strings:
        if s not in content:
            print(f"FAILED: '{s}' not found in {filepath}")
            return False

    print(f"PASSED: {filepath} contains expected patterns")
    return True

def main():
    print("Verifying implementation of Next Phase features...")

    # 1. Check GameInterface for Review Button logic
    # We look for where onAnalyze is called with 'review'
    if not verify_file_content('components/GameInterface.tsx', [
        "onAnalyze(game.pgn(), 'review')",
        "Game Review"
    ]): return

    # 2. Check GameReviewPanel for Retry logic
    if not verify_file_content('components/GameReviewPanel.tsx', [
        "onRetry(currentMoveIndex)",
        "Review Moves"
    ]): return

    # 3. Check CoachFeedback is integrated
    if not verify_file_content('components/GameInterface.tsx', [
        "<CoachFeedback",
        "feedback={feedback}",
        "isThinking={isCoachThinking}"
    ]): return

    print("Success! Key integration points verified.")

if __name__ == "__main__":
    main()
