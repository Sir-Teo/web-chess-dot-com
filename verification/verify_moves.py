from playwright.sync_api import sync_playwright

def verify_moves(page):
    page.goto("http://localhost:3000/web-chess-dot-com/")

    # Wait for board
    page.wait_for_selector("#chessboard-wrapper")

    # Click on the white pawn at e2 (Assuming starting position)
    # e2 is in the 2nd row from bottom, 5th from left.
    # Coordinates in React Chessboard might be tricky.
    # But squares usually have data attributes or just are divs.

    # Let's try to click on a square by its data-square attribute if available, or coordinates.
    # react-chessboard often uses data-square="e2".

    try:
        page.locator('[data-square="e2"]').click()
    except:
        # Fallback: Click center of e2 square
        # e2 is 7th rank from top (index 6) and 5th file (index 4) if 0-indexed?
        # Actually ranks are 8 (top) to 1 (bottom).
        # e2 is rank 2.
        # We can find the square element.
        # react-chessboard squares often have `data-square` in recent versions.
        pass

    # Wait a bit for highlight
    page.wait_for_timeout(1000)

    # Take screenshot
    page.screenshot(path="/home/jules/verification/verification.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_moves(page)
        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()
