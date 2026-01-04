from playwright.sync_api import sync_playwright, expect

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # 1. Navigate to app
        page.goto("http://localhost:3000/web-chess-dot-com/")

        # 2. Select Bot (Use same selectors as verify_review.py which worked)
        # Try to find 'Play Computer' or navigate via Dashboard
        try:
             page.click("text=Play Computer", timeout=5000)
        except:
             # If failing, try clicking 'Play' in sidebar first if needed, but Dashboard should be default
             pass

        # Wait for Bot Panel
        page.wait_for_selector("text=Play Bots")

        # Click Play
        page.click("data-testid=play-bot-start")

        # 3. Wait for game start
        page.wait_for_selector("#chessboard-wrapper")

        # 4. Resign to trigger Game Over
        # Need to find Resign button. In MoveList footer.
        page.click("text=Resign")

        # 5. Wait for Game Over Overlay
        # Look for "Rematch" and "New Bot" buttons
        page.wait_for_selector("text=Rematch")
        page.wait_for_selector("text=New Bot")

        # 6. Screenshot
        page.screenshot(path="verification/game_over_overlay.png")
        print("Screenshot saved to verification/game_over_overlay.png")

        browser.close()

if __name__ == "__main__":
    run()
