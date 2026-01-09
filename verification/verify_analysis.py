import time
from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to analysis mode hash
        page.goto("http://localhost:3000/web-chess-dot-com/#analysis")

        # Wait for board to load
        try:
            page.wait_for_selector(".chessboard-wrapper", timeout=10000)
            print("Board found")
        except:
            print("Board not found - might be loading or broken")

        # Wait for tab buttons
        try:
            page.wait_for_selector("text=Analysis", timeout=5000)
            page.wait_for_selector("text=Review", timeout=5000)
            page.wait_for_selector("text=Explorer", timeout=5000)
            print("Tabs found")
        except:
            print("Tabs missing")

        # Click Review Tab
        page.click("text=Review")
        time.sleep(1)

        # Check review panel content
        try:
            page.wait_for_selector("text=Game Review", timeout=5000)
            print("Review panel loaded")
        except:
            print("Review panel missing")

        # Click Explorer Tab
        page.click("text=Explorer")
        time.sleep(1)

        # Check explorer content
        try:
            page.wait_for_selector("text=Opening Explorer", timeout=5000)
            print("Explorer panel loaded")
        except:
            print("Explorer panel missing")

        # Take screenshot
        page.screenshot(path="verification/analysis_mode.png")
        print("Screenshot saved")

        browser.close()

if __name__ == "__main__":
    run()
