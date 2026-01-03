import time
from playwright.sync_api import sync_playwright

def verify_updates():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        print("Navigating to app...")
        page.goto("http://localhost:3000/web-chess-dot-com/")

        # 1. Verify Time Control Connectivity
        print("Checking Time Control buttons...")

        # Click "Play 15 | 10" (Rapid)
        page.click('text="Play 15 | 10"')

        print("Waiting for game interface...")
        page.wait_for_selector("#chessboard-wrapper")

        print("Checking timer for 15 min...")
        time.sleep(1)

        if page.is_visible('text="15:00"'):
            print("SUCCESS: Timer shows 15:00")
        else:
            print("FAILURE: Timer does not show 15:00")

        # Go back to dashboard
        page.goto("http://localhost:3000/web-chess-dot-com/")
        page.wait_for_selector('text="Play 15 | 10"')

        # Click "Play a Friend" which I set to 600s (10 min)
        # The button text is "Play a Friend"
        page.click('text="Play a Friend"')
        page.wait_for_selector("#chessboard-wrapper")

        print("Checking timer for 10 min (Play Friend)...")
        time.sleep(1)
        if page.is_visible('text="10:00"'):
            print("SUCCESS: Timer shows 10:00")
        else:
            print("FAILURE: Timer does not show 10:00")

        # 2. Verify Settings Persistence
        # Open Settings
        print("Opening settings...")
        page.click('svg.text-gray-500.cursor-pointer') # Settings icon in GameInterface

        # Change Board Theme to "Purple"
        print("Changing theme to Purple...")
        page.click('text="Purple"')

        # Save
        print("Saving settings...")
        page.click('button:has-text("Save")')

        # Reload Page
        print("Reloading page...")
        page.reload()

        # After reload, we are back at Dashboard. Need to go to GameInterface to see the board.
        print("Navigating back to Play...")
        page.click('text="Play 15 | 10"')
        page.wait_for_selector("#chessboard-wrapper")

        print("Taking screenshot of persistent settings...")
        time.sleep(1)
        page.screenshot(path="verification/settings_persistence.png")
        print("Screenshot saved to verification/settings_persistence.png")

        browser.close()

if __name__ == "__main__":
    verify_updates()
