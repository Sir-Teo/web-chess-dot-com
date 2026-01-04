from playwright.sync_api import sync_playwright

def verify_game_interface():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the app
        page.goto("http://localhost:3000/web-chess-dot-com/")

        # Wait for board to load (using a known element if eval-bar fails)
        page.wait_for_selector("#chessboard-wrapper")

        # Take screenshot of the initial state (Play mode)
        page.screenshot(path="verification/verify_ui_fix.png")

        # Check if Eval Bar is visible
        eval_bar = page.locator("[data-testid='eval-bar']")
        if eval_bar.is_visible():
            print("Evaluation Bar is visible!")
        else:
            print("Evaluation Bar is NOT visible!")

        browser.close()

if __name__ == "__main__":
    verify_game_interface()
