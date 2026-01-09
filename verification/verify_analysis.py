
from playwright.sync_api import sync_playwright

def verify_analysis_features():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to analysis mode
        page.goto("http://localhost:3000/web-chess-dot-com/#analysis")

        # Wait for board to load
        page.wait_for_selector("#chessboard-wrapper")

        # 1. Test Setup Modal
        # Open Setup Modal
        page.get_by_role("button", name="Setup").click()
        page.wait_for_selector("text=Load Position")

        # Check for new tabs
        if page.get_by_role("button", name="FEN").is_visible() and page.get_by_role("button", name="PGN").is_visible():
            print("Setup Modal: Tabs visible")
        else:
            print("Setup Modal: Tabs MISSING")

        # Switch to PGN tab
        page.get_by_role("button", name="PGN").click()
        page.get_by_placeholder("1. e4 e5 ...").fill("1. e4 e5 2. Nf3 Nc6 3. Bb5 a6")

        # Load PGN
        page.get_by_role("button", name="Load Game").click()

        # Verify PGN loaded (game should be at end, move list visible)
        page.wait_for_timeout(1000)

        # Take screenshot of Loaded PGN state
        page.screenshot(path="verification/analysis_pgn_load.png")
        print("Screenshot saved: analysis_pgn_load.png")

        # 2. Test Explorer
        # Switch to Explorer tab
        page.get_by_role("button", name="Explorer").click()
        page.wait_for_selector("text=Opening Explorer")

        # Check if Ruy Lopez is identified (since we loaded 1. e4 e5 2. Nf3 Nc6 3. Bb5 a6)
        # 3. Bb5 is Ruy Lopez. 3... a6 is Morphy Defense.
        # The explorer shows moves from current position.
        # Current position after 3... a6 is r1bqkbnr/1pppppp1/p1n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 4
        # White to move. Best move usually Ba4 or Bxc6.
        # Check if "Ba4" is in the list.

        page.screenshot(path="verification/analysis_explorer.png")
        print("Screenshot saved: analysis_explorer.png")

        browser.close()

if __name__ == "__main__":
    verify_analysis_features()
