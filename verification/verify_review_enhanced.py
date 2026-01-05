from playwright.sync_api import sync_playwright, expect
import os

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        try:
            # 1. Start App
            print("Navigating to home...")
            page.goto("http://localhost:3000/web-chess-dot-com/")

            # Wait for any unique element on Dashboard
            page.wait_for_selector("text=MasterTeo1205", timeout=30000)

            # 2. Go to Play Bots
            print("Navigating to Bot Selection...")
            # Dashboard has a button "Play Bots"
            page.click("text=Play Bots")

            # Wait for Bot Selection panel header
            # It is a span with "Play Bots" inside PlayBotsPanel
            page.wait_for_selector("span:has-text('Play Bots')", timeout=30000)

            # 3. Start Game vs Mittens (or default)
            print("Starting Game...")
            page.click("button[data-testid='play-bot-start']")

            # 4. Wait for board
            page.wait_for_selector("#chessboard-wrapper", timeout=30000)

            # Wait a bit for game to "start" (bot chatter etc)
            page.wait_for_timeout(2000)

            # 5. Resign
            print("Resigning to trigger review...")

            # Look for Resign or Abort button
            # In GameInterface, bottom controls
            resign_btn = page.locator("button[title='Resign']")
            abort_btn = page.locator("button[title='Abort']")

            if resign_btn.is_visible():
                resign_btn.click()
                print("Clicked Resign")
            elif abort_btn.is_visible():
                abort_btn.click()
                print("Clicked Abort")
            else:
                print("Could not find Resign or Abort button, taking screenshot")
                page.screenshot(path="verification/debug_no_resign.png")

            # Confirm resignation if modal appears or needed?
            # GameInterface logic: onClick={() => { setIsGameOver(true); setGameResult('Resigned'); }}
            # It sets game over immediately, triggering the overlay.

            # 6. Wait for Game Over modal
            print("Waiting for Game Over...")
            page.wait_for_selector("text=Game Review", timeout=30000)

            # 7. Click Game Review
            print("Clicking Game Review...")
            # "Game Review" button in the modal
            page.click("button:has-text('Game Review')")

            # 8. Verify Review Interface
            print("Verifying Game Review Interface...")
            # Should see "Game Review" header in panel
            page.wait_for_selector("h2:has-text('Game Review')", timeout=30000)

            # 9. Verify Stats/Graph exist
            if page.locator("text=Move by Move").is_visible():
                print("Move List found")

            # 10. Verify Analysis Interface Enhancements (Threats Toggle)
            # Switch to Analysis tab if needed, but Game Review Panel is separate.
            # AnalysisInterface renders GameReviewPanel if activeTab is 'review'.
            # We want to check 'Analysis' tab to see Threats toggle.

            print("Switching to Analysis Tab...")
            page.click("button:has-text('Analysis')")

            # Check for Threat Toggle (Target icon)
            # It has title "Show Threats"
            if page.locator("button[title='Show Threats']").is_visible():
                print("Threats Toggle found")
            else:
                print("Threats Toggle NOT found")
                raise Exception("Threats Toggle missing")

            page.screenshot(path="verification/review_enhanced_success.png")
            print("Screenshot saved to verification/review_enhanced_success.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/review_enhanced_failure.png")
            raise e
        finally:
            browser.close()

if __name__ == "__main__":
    run()
