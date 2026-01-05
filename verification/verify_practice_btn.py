import time
from playwright.sync_api import sync_playwright

def verify_practice_mode():
    print("Verifying Practice Mode Fix...")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        try:
            # 1. Start at a specific FEN using the analysis URL (which usually triggers practice logic)
            # Alternatively, navigate to analysis, make a move, then click practice.
            # Let's go to /analysis directly if possible or dashboard -> analysis.
            page.goto("http://localhost:3000/web-chess-dot-com/")

            # Click Analysis
            print("Navigating to Analysis...")
            page.click("text=Analysis")
            time.sleep(1)

            # Make a move to create a custom FEN (e.g. e4)
            print("Making a move (e2-e4)...")
            # Drag e2 to e4
            # We can use the drag_and_drop but it's flaky. Let's try to simulate click-click.
            # Or just assume the start position is fine for "New Game" check,
            # BUT we want to ensure Practice keeps the current board.

            # Better: Use the onAnalyze hook logic simulated by URL params if supported?
            # No URL param support for initial FEN in current App.tsx logic for root URL, only internal state.

            # Let's interact with the board.
            # Locate e2
            e2 = page.locator("div[data-square='e2']")
            e4 = page.locator("div[data-square='e4']")

            if e2.count() > 0:
                e2.first.click()
                e4.first.click()
                time.sleep(1)
            else:
                print("Could not find board squares.")

            # Click "Practice" button in Analysis Panel footer
            print("Clicking Practice...")
            page.click("button[title='Practice Position vs Computer']")
            time.sleep(1)

            # Should now be in "Play Bots" mode (PlayBotsPanel)
            # Verify "Choose a Computer Opponent" text or similar
            if page.locator("text=Choose a Computer Opponent").count() > 0:
                print("Navigated to Bot Selection.")
            else:
                print("Failed to navigate to Bot Selection.")
                exit(1)

            # Select a bot (e.g. Jimmy)
            print("Selecting a bot...")
            page.click("text=Jimmy") # Assuming Jimmy exists in bots.ts, or just click the first available bot

            # Click "Choose" or "Play"
            # The PlayBotsPanel has a "Choose" button usually.
            # Let's look for the main CTA.
            page.click("button:has-text('Choose')")
            time.sleep(1)

            # Select Color and Play
            page.click("button[data-testid='play-bot-start']")
            time.sleep(2)

            # NOW: Verify the board has the move e4 played!
            # If it reset to start, e4 would be empty and e2 would be a white pawn.
            # If it worked, e4 has white pawn, e2 is empty.

            # Check e4
            # React-chessboard uses background images.
            # Let's check the HTML for piece at e4.
            # data-square="e4" -> child div -> data-piece="wP"

            e4_square = page.locator("div[data-square='e4']")
            piece_at_e4 = e4_square.locator("div[data-piece='wP']")

            if piece_at_e4.count() > 0:
                print("SUCCESS: Game started with custom position (Pawn at e4).")
            else:
                print("FAILURE: Game reset to start position (Pawn not at e4).")
                # Debug screenshot
                page.screenshot(path="verification/practice_failure.png")
                exit(1)

            # Check e2 is empty (or doesn't have wP)
            e2_square = page.locator("div[data-square='e2']")
            piece_at_e2 = e2_square.locator("div[data-piece='wP']")
            if piece_at_e2.count() == 0:
                 print("SUCCESS: e2 is empty.")
            else:
                 print("FAILURE: e2 still has pawn.")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error_practice.png")
            exit(1)

        browser.close()

if __name__ == "__main__":
    verify_practice_mode()
