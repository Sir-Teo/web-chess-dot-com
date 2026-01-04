from playwright.sync_api import sync_playwright, expect
import time
import os

def verify_review_retry():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Grant permissions for clipboard (though not strictly needed for this test)
        context = browser.new_context(permissions=["clipboard-read", "clipboard-write"])
        page = context.new_page()

        # 1. Navigate to main page
        page.goto("http://localhost:3000/web-chess-dot-com/")

        # Wait for dashboard to load
        # Sometimes the text 'Play Bots' isn't initially visible or rendered differently.
        # Let's verify what IS on the screen first if it fails.
        try:
             page.wait_for_selector("text=Play Bots", timeout=10000)
        except:
             print("Dashboard not fully loaded or text missing. Retrying navigation...")
             page.reload()
             page.wait_for_selector("text=Play Bots", timeout=10000)

        print("Navigating to Play Bots...")
        page.get_by_text("Play Bots").click()

        # Select Nelson (or any bot)
        print("Selecting Bot...")
        # Wait for bot category to be open (Beginner is default)
        # Nelson is Intermediate?
        # Let's just pick the first available bot if Nelson isn't visible.
        # Check if Nelson is visible.

        # Expand Intermediate if needed
        if not page.is_visible("text=Nelson"):
            print("Expanding Intermediate...")
            page.locator("text=Intermediate").click()

        page.wait_for_selector("text=Nelson")
        page.locator("text=Nelson").click()

        # Start Game
        print("Starting Game...")
        page.get_by_test_id("play-bot-start").click()

        # Wait for board
        page.wait_for_selector("#chessboard-wrapper")

        # Make a move (White) - e2 to e4
        print("Making move e2-e4...")
        try:
            # We can use the drag_and_drop but explicitly waiting for elements
            source = page.locator("[data-square='e2']")
            target = page.locator("[data-square='e4']")

            # Ensure they are visible
            source.wait_for(state="visible", timeout=5000)
            target.wait_for(state="visible", timeout=5000)

            source.drag_to(target)
            print("Moved e2-e4")
            time.sleep(2) # Wait for bot response
        except Exception as e:
            print(f"Move failed: {e}")

        # Resign
        print("Resigning...")
        page.get_by_title("Resign").click()
        # Should show game over overlay

        # Click Game Review
        print("Clicking Game Review...")
        page.get_by_role("button", name="Game Review").click()

        # Wait for Analysis
        # Check for text "Game Review"
        expect(page.get_by_text("Game Review")).to_be_visible()

        # Check if Evaluation Graph is visible
        page.wait_for_selector("svg", timeout=10000)

        time.sleep(5) # Let analysis run a bit

        page.screenshot(path="/home/jules/verification/review_page.png")
        print("Screenshot saved.")

        browser.close()

if __name__ == "__main__":
    verify_review_retry()
