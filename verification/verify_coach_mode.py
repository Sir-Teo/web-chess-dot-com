from playwright.sync_api import sync_playwright

def verify_coach_mode():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Set viewport to large size to ensure Evaluation Bar shows (hidden lg:block)
        page = browser.new_page(viewport={'width': 1920, 'height': 1080})

        # Navigate to Play Coach route
        page.goto("http://localhost:3000/web-chess-dot-com/#/play/coach")

        # Wait for Coach Panel
        page.wait_for_selector("text=Play Coach", timeout=10000)

        # Take Screenshot of Setup
        page.screenshot(path="verification/coach_setup.png")
        print("Captured Coach Setup")

        # Start Game
        page.click("button:has-text('Play')")

        # Wait for board wrapper using ID
        page.wait_for_selector("#chessboard-wrapper", timeout=10000)

        # Wait a bit for game to initialize
        page.wait_for_timeout(2000)

        # Make a move to trigger Coach Feedback (e2-e4)
        # We need to drag and drop or click.
        # Let's try click-click interaction which is implemented in Chessboard.

        # Click e2 (White pawn)
        # We need to find the square. The squares have data-square attribute in react-chessboard usually?
        # Or we can click based on coordinates if we know the board size.
        # react-chessboard squares often have `data-square="e2"`.

        try:
            page.click("[data-square='e2']")
            page.wait_for_timeout(500)
            page.click("[data-square='e4']")
            print("Made move e2-e4")

            # Wait for Coach Feedback to appear (Coach thinks, then shows)
            page.wait_for_timeout(3000)

        except Exception as e:
            print(f"Failed to make move: {e}")

        # Take Screenshot of Gameplay
        page.screenshot(path="verification/coach_gameplay.png")
        print("Captured Coach Gameplay")

        browser.close()

if __name__ == "__main__":
    verify_coach_mode()
