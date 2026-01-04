
import time
from playwright.sync_api import sync_playwright

def verify_hint_undo():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Grant clipboard permissions for copy link test if needed
        context = browser.new_context(permissions=['clipboard-read', 'clipboard-write'])
        page = context.new_page()

        try:
            print("Navigating to app...")
            page.goto("http://localhost:3000/web-chess-dot-com/")
            page.wait_for_timeout(3000)

            print("Selecting 'Play Bots'...")
            # Use 'Play Bots' text which is in Dashboard
            page.get_by_text("Play Bots", exact=True).click()
            page.wait_for_timeout(1000)

            print("Starting Bot Game...")
            # Click 'Play' in the bot panel
            page.get_by_test_id("play-bot-start").click()
            page.wait_for_timeout(2000)

            print("Verifying Hint Button exists...")
            hint_btn = page.locator("button[title='Hint']")
            if hint_btn.count() > 0:
                print("Hint button found.")
                hint_btn.click()
                print("Hint clicked.")
                page.wait_for_timeout(1000)
                # Take screenshot of hint
                page.screenshot(path="verification/hint_verification.png")
            else:
                print("Hint button NOT found!")

            print("Making a move (e2-e4)...")
            # We can't easily drag and drop in headless sometimes, but let's try or just assume Hint works.
            # But we want to test Undo. We need a move history.

            # Since automated moves are flaky, we might skip actual move execution if simple click fails.
            # But let's try clicking squares.
            # White is at bottom. e2 is roughly center-bottom.
            # Use data-square if available?
            # react-chessboard often has data-square

            e2 = page.locator("[data-square='e2']")
            e4 = page.locator("[data-square='e4']")

            if e2.count() > 0:
                print("Found e2, clicking...")
                e2.click()
                time.sleep(0.5)
                e4.click()
                print("Clicked e4.")
                time.sleep(2000) # Wait for bot response

                print("Verifying Undo Button exists...")
                undo_btn = page.locator("button[title='Takeback']")
                if undo_btn.count() > 0:
                    print("Undo button found.")
                    undo_btn.click()
                    print("Undo clicked.")
                    time.sleep(1000)
                    page.screenshot(path="verification/undo_verification.png")
                else:
                     print("Undo button NOT found!")
            else:
                print("Square e2 not found via data-square.")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_hint_undo()
