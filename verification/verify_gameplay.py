from playwright.sync_api import sync_playwright
import time

def verify_gameplay():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            # Go to the local app
            print("Navigating to app...")
            page.goto("http://localhost:3000")

            # Wait for Dashboard to load (look for unique dashboard element)
            print("Waiting for Dashboard...")
            page.wait_for_selector("text=MasterTeo1205", timeout=10000)

            # Click "Play Bots" button
            print("Clicking Play Bots...")
            # The button contains "Play Bots" text
            page.click("text=Play Bots")

            # Wait for GameInterface to load (Sidebar should show Play Bots panel)
            print("Waiting for Play Bots panel...")
            page.wait_for_selector("text=Play Bots", timeout=10000)

            # Allow board to render
            time.sleep(2)

            # Take screenshot of Play Bots mode
            print("Taking screenshot...")
            page.screenshot(path="verification/verification_bots_screen.png")

            # Now verify if board has pieces.
            # react-chessboard renders pieces as images or divs with background images.
            # We can look for ".piece" class or similar if we inspected DOM, but visually checking screenshot is safer for now.

            # Let's try to start a game to ensure interaction works
            print("Starting game against Martin...")
            # "Play" button in the panel
            page.click("button:has-text('Play')")

            # Wait for game start (Move list might appear or just active bot UI)
            # The panel changes to MoveList or Active Game view
            time.sleep(2)

            page.screenshot(path="verification/verification_game_start.png")

            print("Verification script finished successfully")

        except Exception as e:
            print(f"Verification failed: {e}")
            page.screenshot(path="verification/verification_failed.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_gameplay()
