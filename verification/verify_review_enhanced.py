from playwright.sync_api import sync_playwright, expect
import os

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Grant permissions for clipboard if possible, though not critical for this test
        context = browser.new_context()
        context.grant_permissions(['clipboard-read', 'clipboard-write'])
        page = context.new_page()

        try:
            # 1. Start App
            page.goto("http://localhost:3000/web-chess-dot-com/")
            page.wait_for_selector("text=Play Chess", timeout=30000)

            # 2. Go to Play Bots
            print("Navigating to Bot Selection...")
            page.click("text=Play Computer")
            page.wait_for_selector("text=Play Bots")

            # 3. Start Game vs Beginner
            print("Starting Game...")
            page.click("button[data-testid='play-bot-start']")

            # 4. Wait for board
            page.wait_for_selector("#chessboard-wrapper", timeout=30000)

            # 5. Make a move (e4) to have history
            # It's hard to make move via clicks blindly, but let's try resigning immediately to get to review.
            print("Resigning to trigger review...")
            page.click("button[title='Resign']")

            # Confirm resignation
            # Wait for Game Over modal
            page.wait_for_selector("text=Game Review", timeout=10000)

            # 6. Click Game Review
            print("Clicking Game Review...")
            page.click("button:has-text('Game Review')")

            # 7. Verify Review Interface
            print("Verifying Game Review Interface...")
            # Should see "Game Review" header in panel
            page.wait_for_selector("h2:has-text('Game Review')", timeout=30000)

            # 8. Check for Key Moments buttons (might not appear if no blunders, but let's check structure)
            # Since we resigned turn 1, probably no blunders.
            # But we can verify the analysis is running or "Game Review" header exists.

            page.screenshot(path="verification/review_enhanced.png")
            print("Screenshot saved to verification/review_enhanced.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/review_enhanced_failure.png")
        finally:
            browser.close()

if __name__ == "__main__":
    run()
