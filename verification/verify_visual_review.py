from playwright.sync_api import sync_playwright

def verify_visuals():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.set_viewport_size({"width": 1280, "height": 800})

        print("Navigating to app...")
        page.goto("http://localhost:3000/web-chess-dot-com/")
        page.wait_for_selector(".flex-1", state="visible") # Wait for sidebar

        # 1. Play Bots
        print("Entering Bot Mode...")
        page.get_by_text("Play Bots", exact=False).first.click()
        page.wait_for_selector("[data-testid='play-bot-start']", state="visible")

        # 2. Start Game
        print("Starting Bot Game...")
        page.get_by_test_id("play-bot-start").click()
        page.wait_for_selector("#chessboard-wrapper", state="visible")

        # 3. Resign to get to Review
        print("Resigning...")
        page.get_by_title("Resign").click()
        # Confirm resign (if there is a confirmation, the current code just sets Game Over directly)

        # 4. Go to Review
        print("Clicking Game Review...")
        page.get_by_text("Game Review").click()
        page.wait_for_selector("text=Game Review", state="visible")

        # 5. Wait for Analysis (mock it or wait?)
        # Since we just started, analysis might take a moment.
        # But we want to see the UI structure.
        print("Waiting for Coach Bubble...")
        page.wait_for_timeout(2000) # Wait for some analysis

        # Take Screenshot
        print("Taking screenshot...")
        page.screenshot(path="verification/review_ui.png")

        browser.close()

if __name__ == "__main__":
    verify_visuals()
