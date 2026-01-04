from playwright.sync_api import sync_playwright

def verify_gameplay_polish(page):
    print("Navigating to app...")
    page.goto("http://localhost:3000/web-chess-dot-com/")

    # Try multiple selectors for the play button
    try:
        page.wait_for_selector("text=Play Computer", state="visible", timeout=5000)
        print("Starting bot game via 'Play Computer'...")
        page.click("text=Play Computer")
    except:
        print("Play Computer not found, trying Sidebar...")
        page.click("text=Play Bots")

    # Select Mittens (id 1)
    page.wait_for_selector("text=Mittens")
    page.click("text=Mittens")

    # Start Game
    page.click("data-testid=play-bot-start")

    # Wait for board
    page.wait_for_selector("#chessboard-wrapper")

    # Make a move (e4)
    # Since drag and drop is flaky, we just verify the elements are correct
    # Check if user can click specific squares or if visuals are correct

    # Highlight check: Click a square and check highlight
    # We can't easily check canvas pixels in headless, but we can check the active move list style

    # Wait for bot to move (variable delay)
    page.wait_for_timeout(3000)

    # Check if Move List has items
    # Use partial class match or escape it, but simpler to use regex or another class
    moves = page.locator("div.flex.text-sm.py-0\\.5")
    count = moves.count()
    print(f"Moves found: {count}")

    # Take screenshot of the board and move list to verify visual polish
    page.screenshot(path="verification/gameplay_polish.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        try:
            verify_gameplay_polish(page)
            print("Verification script completed.")
        except Exception as e:
            print(f"Verification failed: {e}")
        finally:
            browser.close()
