
import time
from playwright.sync_api import sync_playwright

def verify_phase():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        print("Navigating to app...")
        page.goto("http://localhost:3000/web-chess-dot-com/")

        # 1. Go to Play Bots (Dashboard button)
        print("Clicking Play Bots...")
        # The dashboard button says "Play Bots"
        try:
            page.click("text=Play Bots")
        except:
            print("Could not click 'Play Bots', trying fallback selectors...")
            # Try finding the specific container if text fails (e.g. icon or parent)
            page.click("button:has-text('Play Bots')")

        time.sleep(1)

        # 2. Select Mittens (id='mittens') or just a random one
        print("Selecting Bot...")
        # In PlayBotsPanel, bots are listed. Click "Mittens" if visible (needs expanding Master probably, or just pick first available)
        # Default is usually Beginner open. Let's just use the selected bot (default is Martin or similar).
        # We can try to select Mittens if we want to test that specific logic, but any bot works for general verification.
        # Let's try to click "Martin" (first one) to be safe or just proceed with default selected.

        # 3. Start Game
        print("Starting Game...")
        # The button in PlayBotsPanel has data-testid="play-bot-start"
        page.click("data-testid=play-bot-start")

        time.sleep(2)

        # Take screenshot of Game Interface with Bot
        page.screenshot(path="verification/phase_game_start.png")
        print("Screenshot taken: phase_game_start.png")

        # 4. Make a move to see if Bot chats
        # We need to click squares.
        # Assume White. e2 is roughly at bottom.
        # This is hard without specific selectors for squares.
        # However, we can try to find the piece?
        # react-chessboard renders pieces as divs with background images usually, or svgs.
        # Let's just wait a bit to see if the bot says anything on start (Start Message).

        time.sleep(3)
        page.screenshot(path="verification/phase_game_chat.png")
        print("Screenshot taken: phase_game_chat.png")

        # 5. Enable Coach
        try:
             page.click("text=Coach", timeout=2000)
             print("Toggled Coach Mode")
        except:
             print("Could not toggle Coach")

        # 6. Resign to check Game Review Panel
        print("Resigning...")
        # Find resign button (Flag icon or text)
        # In GameInterface, we have a button with title="Resign"
        page.click("button[title='Resign']")
        time.sleep(1)

        page.screenshot(path="verification/phase_game_over.png")
        print("Screenshot taken: phase_game_over.png")

        # 7. Click Game Review
        print("Clicking Game Review...")
        page.click("text=Game Review")

        print("Waiting for analysis...")
        time.sleep(5)

        page.screenshot(path="verification/phase_review.png")
        print("Screenshot taken: phase_review.png")

        browser.close()

if __name__ == "__main__":
    verify_phase()
