import time
from playwright.sync_api import sync_playwright

def verify_full_flow():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        print("Navigating to app...")
        page.goto("http://localhost:3000/web-chess-dot-com/")

        # 1. Start Bot Game
        print("Waiting for Play Bots button...")
        page.wait_for_selector("text=Play Bots")
        page.click("text=Play Bots")

        print("Selecting Martin...")
        page.click("text=Martin")

        print("Clicking Play...")
        page.click("button:has-text('Play')")

        print("Waiting for game start...")
        page.wait_for_selector("#chessboard-wrapper")

        # 2. Make a move (e2 -> e4)
        print("Making a move e2 -> e4...")
        page.wait_for_selector("[data-square='e2']")
        page.drag_and_drop("[data-square='e2']", "[data-square='e4']")

        time.sleep(2)

        # 3. Enable Coach Mode
        print("Enabling Coach Mode...")
        # Check if button exists first to debug
        if page.is_visible("text=Coach"):
             page.click("text=Coach")
        else:
             print("Coach button not found! Dumping page content...")
             # Maybe the layout shifted or button is hidden/different text
             # The button is MessageCircle icon + "Coach" text.
             # In GameInterface:
             # <button ...> <MessageCircle /> <span ...>Coach</span> </button>
             # Maybe "Coach" text is hidden on some responsive layout?
             # But we are in headless, usually 1280x720 default.
             pass

        # Make another move (d2 -> d4)
        print("Making move d2 -> d4...")
        if page.locator("[data-square='d2']").count() > 0:
            page.drag_and_drop("[data-square='d2']", "[data-square='d4']")

        time.sleep(2)

        # 4. Resign
        print("Resigning...")
        page.click("button[title='Resign']")

        # 5. Go to Analysis
        print("Clicking Game Review...")
        page.click("text=Game Review")

        print("Verifying Analysis Page...")
        page.wait_for_selector("text=Analysis")

        # Switch to Analysis tab
        page.click("text=Analysis")

        # Check if moves are listed
        if page.is_visible("text=e4"):
            print("Move e4 found in analysis!")
        else:
            print("Move e4 NOT found in analysis.")

        time.sleep(1)
        page.screenshot(path="verification/full_flow_analysis.png")
        print("Screenshot saved to verification/full_flow_analysis.png")

        browser.close()

if __name__ == "__main__":
    verify_full_flow()
