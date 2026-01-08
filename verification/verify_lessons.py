
import time
from playwright.sync_api import sync_playwright

def verify_lessons():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        print("Navigating to app...")
        page.goto("http://localhost:3000/web-chess-dot-com/")

        # Wait for app to load - Dashboard
        print("Waiting for Dashboard...")
        page.wait_for_selector("text=MasterTeo1205", timeout=10000)

        print("Navigating to Lessons...")
        # Hover over Learn to see sub-menu or just click if it's a direct link (it's not, it opens a sub-menu or sidebar logic)
        # Sidebar.tsx: clicking "Learn" sets activeTab to 'learn-lessons' (action: 'learn-lessons' is in subItems but the parent button has no action... wait)

        # In Sidebar.tsx:
        # Parent button onClick sets activeTab to 'dashboard' unless it's play/puzzles.
        # Wait, let's check Sidebar.tsx logic.
        # onClick={() => setActiveTab(item.id === 'play' ? 'play' : item.id === 'puzzles' ? 'puzzles' : 'dashboard')}
        # So clicking "Learn" goes to Dashboard? That seems like a bug or incomplete feature in Sidebar.

        # However, there is a flyout menu on hover.
        # "hoveredItem && hoveredItem.subItems" -> renders flyout.
        # Subitem "Lessons" has action 'learn-lessons'.

        # So I must HOVER over "Learn" and then CLICK "Lessons".

        print("Hovering over Learn...")
        page.hover("text=Learn")

        print("Waiting for Lessons sub-item...")
        page.wait_for_selector("text=Lessons", timeout=2000)

        print("Clicking Lessons...")
        # There are two "Lessons": one in Sidebar main list (label "Learn"), one in sub-menu (label "Lessons").
        # The sub-menu one is what we want.
        # The sidebar item text is "Learn".
        # The sub-menu item text is "Lessons".

        # Note: "Lessons" might also be in the dashboard stats ("Next Lesson").
        # Let's be specific.

        # Click the one in the flyout menu.
        # The flyout menu is `div.fixed ...`

        # Let's try clicking "Lessons" text.
        page.click("text=Lessons")

        # Wait for Lessons Interface
        print("Waiting for Lessons Interface...")
        page.wait_for_selector("text=Master the game with our interactive lessons", timeout=5000)

        # Select "Basic Tactics" lesson
        print("Selecting 'Basic Tactics' lesson...")
        page.click("text=Basic Tactics")

        # Wait for board to load
        print("Waiting for board...")
        page.wait_for_selector("text=Challenge 1 of 2", timeout=5000)

        # 1. Challenge 1: Knight Fork
        # FEN: 3q3k/8/8/4N3/8/8/8/6K1 w - - 0 1
        # Moves: e5f7 (User), h8g8 (Opponent), f7d8 (User)

        print("Performing Move 1: e5 -> f7")

        def click_square(square):
            page.locator(f"[data-square='{square}']").click()
            time.sleep(0.3)

        click_square("e5")
        click_square("f7")

        print("Waiting for Opponent move (h8 -> g8)...")
        time.sleep(2) # Opponent delay

        # Verify piece positions or just make next move
        print("Performing Move 2: f7 -> d8")
        click_square("f7")
        click_square("d8")

        # Verify Success Message
        print("Checking for success...")
        page.wait_for_selector("text=Excellent!", timeout=5000)
        print("Challenge 1 Complete!")

        page.screenshot(path="verification/lessons_success.png")
        print("Screenshot saved to verification/lessons_success.png")

        # Move to next challenge
        print("Clicking Next Challenge...")
        page.click("text=Next Challenge")
        time.sleep(1)

        # 2. Challenge 2: Pin
        # FEN: 6k1/5q2/8/8/2B5/8/8/6K1 w - - 0 1
        # Moves: c4f7 (User), g8f8 (Opponent), f7e8 (User)

        print("Performing Move 1: c4 -> f7")
        click_square("c4")
        click_square("f7")

        print("Waiting for Opponent move...")
        time.sleep(2)

        print("Performing Move 2: f7 -> e8")
        click_square("f7")
        click_square("e8")

        print("Checking for success...")
        page.wait_for_selector("text=Excellent!", timeout=5000)
        print("Challenge 2 Complete!")

        page.screenshot(path="verification/lessons_complete.png")

        browser.close()

if __name__ == "__main__":
    verify_lessons()
