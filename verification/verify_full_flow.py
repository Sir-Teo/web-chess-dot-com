import time
from playwright.sync_api import sync_playwright

def verify_full_flow():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        print("Navigating to app...")
        page.goto("http://localhost:3000/web-chess-dot-com/")

        # 1. Start Bot Game
        print("Waiting for 'Play Bots' button on dashboard...")
        # The dashboard has a main button to navigate to the bot selection screen
        page.wait_for_selector("text=Play Bots")
        page.click("text=Play Bots")

        print("Selecting Martin...")
        page.wait_for_selector("text=Martin")
        page.click("text=Martin")

        print("Clicking Play...")
        # Use a more specific selector for the green play button in the bots panel
        page.click("button.bg-\\[\\#81b64c\\]")

        print("Waiting for game start...")
        page.wait_for_selector("#chessboard-wrapper")
        # Add a small delay to ensure UI transition completes
        time.sleep(1)

        # 2. Make a move (e2 -> e4)
        print("Making a move e2 -> e4...")
        page.locator("[data-square='e2']").drag_to(page.locator("[data-square='e4']"))

        time.sleep(2)

        # 3. Enable Coach Mode
        print("Enabling Coach Mode...")
        page.wait_for_selector("button[title='Toggle Coach Mode']")
        page.click("button[title='Toggle Coach Mode']")

        # Make another move (d2 -> d4)
        print("Making move d2 -> d4...")
        if page.locator("[data-square='d2']").count() > 0:
            page.locator("[data-square='d2']").drag_to(page.locator("[data-square='d4']"))

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

        # Wait for the first move to appear in the move list
        page.wait_for_selector('button:has-text("e4")')

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
