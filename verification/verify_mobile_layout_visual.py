
import os
import time
from playwright.sync_api import sync_playwright

def verify_mobile_layout():
    with sync_playwright() as p:
        # iPhone 12 Pro dimensions: 390x844
        # iPhone SE dimensions: 375x667
        iphone_se = p.devices['iPhone SE']

        browser = p.chromium.launch(headless=True)
        context = browser.new_context(**iphone_se)
        page = context.new_page()

        try:
            # Wait for dev server to be ready
            print("Navigating to dashboard...")
            page.goto("http://localhost:3000/web-chess-dot-com/")

            # Wait for content to load
            # page.wait_for_selector("text=Chess.com", timeout=10000)
            # The previous wait failed because maybe it was hidden or different text.
            # Let's wait for something else, like the root div or sidebar
            page.wait_for_selector("#root", timeout=10000)
            time.sleep(2) # Extra wait for React hydration

            # Screenshot 1: Dashboard
            screenshot_path_dashboard = "/home/jules/verification/mobile_dashboard.png"
            page.screenshot(path=screenshot_path_dashboard)
            print(f"Captured dashboard screenshot at {screenshot_path_dashboard}")

            # Navigate to Game Interface (Play Mode)
            # Find the "New Game" or "Play" button
            print("Navigating to Play...")
            # Dashboard has "New Game" button in "Center Col: Actions"
            # It's a button with "New Game" text.

            # Or just navigate via URL hash
            page.goto("http://localhost:3000/web-chess-dot-com/#play")

            # Wait for Chessboard
            page.wait_for_selector("#chessboard-wrapper", timeout=10000)

            # Wait a bit for layout to settle
            time.sleep(2)

            # Screenshot 2: Game Interface
            screenshot_path_game = "/home/jules/verification/mobile_game.png"
            page.screenshot(path=screenshot_path_game)
            print(f"Captured game screenshot at {screenshot_path_game}")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_mobile_layout()
