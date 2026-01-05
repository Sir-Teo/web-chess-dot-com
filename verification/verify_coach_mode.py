from playwright.sync_api import sync_playwright
import time

def verify_coach_mode():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the app (assuming it's running on localhost:3000)
        page.goto("http://localhost:3000/web-chess-dot-com/")

        # Wait for load
        page.wait_for_timeout(5000)

        # Click "Play Bots" if available, else Play Computer
        if page.get_by_text("Play Bots").count() > 0:
             print("Found 'Play Bots'. Clicking it.")
             page.get_by_text("Play Bots").first.click()
        elif page.get_by_text("Play Computer").count() > 0:
             print("Found 'Play Computer'. Clicking it.")
             page.get_by_text("Play Computer").first.click()

        page.wait_for_timeout(2000)

        # Click start bot game
        try:
             start_btn = page.locator("[data-testid='play-bot-start']")
             if start_btn.count() > 0:
                 start_btn.click()
                 print("Clicked Start Bot Game (data-testid).")
             else:
                 # Fallback: select Mittens
                 page.get_by_text("Mittens").first.click()
                 page.wait_for_timeout(1000)
                 page.locator("[data-testid='play-bot-start']").click()
        except Exception as e:
             print(f"Start game error: {e}")

        page.wait_for_timeout(3000)

        # 1. Check Move Suggestion
        suggestion_btn = page.locator("button[title='Move Suggestion']")
        if suggestion_btn.count() > 0:
            print("SUCCESS: 'Move Suggestion' button found.")

        # 2. Toggle Coach Mode
        coach_btn = page.locator("button[title='Toggle Coach Mode']")
        if coach_btn.count() > 0:
            print("SUCCESS: Coach Mode toggle found.")
            coach_btn.click()

        # Take screenshot of the UI with Coach button active
        page.wait_for_timeout(1000)
        page.screenshot(path="verification/coach_mode.png")
        print("Screenshot saved to verification/coach_mode.png")

        browser.close()

if __name__ == "__main__":
    verify_coach_mode()
