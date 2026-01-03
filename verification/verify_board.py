from playwright.sync_api import sync_playwright

def verify_chess_app():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the app
        print("Navigating to app...")
        page.goto("http://localhost:3000")

        # Initial load is the dashboard
        print("Waiting for page load...")
        page.wait_for_timeout(3000)

        # Take screenshot of Dashboard
        print("Taking Dashboard screenshot...")
        page.screenshot(path="verification/dashboard.png")

        # Try to find "New Game" button
        print("Clicking 'New Game'...")
        # Based on the screenshot, there is "Start New Game" button
        if page.get_by_text("Start New Game").count() > 0:
            page.get_by_text("Start New Game").click()
        else:
             print("Start New Game button not found, trying generic Play button")
             # There is a big "Play 30" block
             if page.get_by_text("Play").count() > 0:
                  page.get_by_text("Play").first.click()

        # Wait for game interface to load
        print("Waiting for Game Interface...")
        page.wait_for_timeout(3000)

        # Take screenshot of Game Interface
        print("Taking Game Interface screenshot...")
        page.screenshot(path="verification/game_interface.png")

        # Verify Pieces are present
        images = page.locator("img[src*='wP']").count() # white pawn
        print(f"Found {images} white pawns")

        browser.close()

if __name__ == "__main__":
    verify_chess_app()
