import time
from playwright.sync_api import sync_playwright

def verify_review():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        try:
            print("Navigating to app...")
            page.goto("http://localhost:3000/web-chess-dot-com/")

            # Wait for load
            page.wait_for_selector("text=Play Bots", timeout=5000)

            print("Attempting to enter Bot Mode...")

            # Check if we are on Dashboard (look for Play Bots card)
            if page.is_visible("text=Challenge computer personalities"):
                print("Clicking 'Play Bots' on Dashboard...")
                page.click("text=Play Bots")
            else:
                print("Not on Dashboard or Dashboard different. Checking for Play Computer...")

            # Wait a moment
            time.sleep(1)

            # Check if we are in Play Panel (Green Play Button) but NOT Bot Panel
            # Bot Panel has "Play Bots" header in the right pane.
            # Play Panel has "New Game" tab.

            if page.is_visible("text=New Game") and page.is_visible("text=Play Computer"):
                print("In Play Panel, clicking 'Play Computer'...")
                page.click("text=Play Computer")

            # Now we should be in Bot Panel
            print("Waiting for Bot Panel...")
            page.wait_for_selector("text=Martin", timeout=5000) # Check for a bot name
            # Actually PlayBotsPanel header says "Play Bots" and list of bots.
            # Let's wait for the "Play" button at the bottom of Bot Panel

            # Note: There is a Play button in Bot Panel.
            # It usually says "Play".

            print("Starting Bot Game...")
            # Click the Play button in the bot panel
            # Use a specific selector to ensure we hit the bot panel play button, not the navbar or something.
            # The button is at the bottom of the right sidebar.
            page.click(".flex-col.h-full button:has-text('Play')")

            # Now game starts. MoveList appears. Board is visible.
            print("Waiting for Game to start...")
            # page.wait_for_selector("#GameBoard", timeout=5000) # ID might be unreliable
            page.wait_for_selector("text=Game vs", timeout=5000)

            # Resign
            print("Resigning...")
            # Button might trigger "Resign" confirmation or just resign.
            # In GameInterface.tsx:
            # <button ... onClick={() => { setIsGameOver(true); setGameResult('Resigned'); }}>Resign</button>
            # The button text is "Resign".
            page.wait_for_selector("button:has-text('Resign')", timeout=5000)
            page.click("button:has-text('Resign')")

            # Game Over
            print("Waiting for Game Over...")
            # page.wait_for_selector("text=Game Over", timeout=5000)
            # The result text might be 'Resigned'
            page.wait_for_selector("button:has-text('Game Review')", timeout=5000)

            # Click Game Review
            print("Clicking Game Review...")
            page.click("button:has-text('Game Review')")

            # Verify Review Tab
            print("Verifying Review Panel...")
            page.wait_for_selector("h2:has-text('Game Review')", timeout=5000)
            print("SUCCESS: Found 'Game Review' header.")

            page.screenshot(path="verification/screenshot_review.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/debug_fail.png")
            raise e
        finally:
            browser.close()

if __name__ == "__main__":
    verify_review()
