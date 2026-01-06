import re
import sys
from playwright.sync_api import sync_playwright

def verify_coach_mode():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Capture console logs
        page.on("console", lambda msg: print(f"Console: {msg.text}"))
        page.on("pageerror", lambda err: print(f"Page Error: {err}"))

        try:
            # Navigate to Home (Dashboard)
            print("Navigating to Home...")
            page.goto("http://localhost:3000/web-chess-dot-com/")

            # Wait for Dashboard load
            page.wait_for_selector("text=MasterTeo1205", timeout=10000)
            print("Dashboard Loaded.")

            # Click "Play Coach" button
            print("Clicking 'Play Coach'...")
            page.click("text=Play Coach")

            # Wait for Coach Panel
            print("Waiting for Coach Panel...")
            page.wait_for_selector("text=Play Against Coach", timeout=10000)
            print("Coach Panel found.")

            # Select a coach (optional)
            if page.locator("text=Anna").count() > 0:
                page.click("text=Anna")
                print("Selected Anna.")

            # Start Coach Game
            page.click("data-testid=play-coach-start")
            print("Started Coach Game.")

            # Check for Game Interface elements - use ID selector
            page.wait_for_selector("#chessboard-wrapper", timeout=10000)
            print("Chessboard found.")

            # Check for Coach Toggle and Settings
            page.wait_for_selector("button[title='Toggle Coach Mode']")
            page.wait_for_selector("button[title='Coach Settings']")
            print("Coach Controls found.")

            # Take final screenshot
            page.screenshot(path="verification/coach_mode_verified.png")
            print("Verification Complete. Screenshot saved.")

        except Exception as e:
            print(f"Verification Failed: {e}")
            page.screenshot(path="verification/error_state.png")
            raise e
        finally:
            browser.close()

if __name__ == "__main__":
    verify_coach_mode()
