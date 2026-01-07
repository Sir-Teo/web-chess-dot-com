import time
from playwright.sync_api import sync_playwright, expect

def verify_hint():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1280, "height": 720})
        page = context.new_page()

        # 1. Navigate to the app
        print("Navigating to app...")
        page.goto("http://localhost:3000/web-chess-dot-com/")

        # 2. Go to Play Bots
        print("Clicking Play Bots...")
        # In the screenshot, it says "Play Bots"
        try:
             # Just target text
             page.get_by_text("Play Computer").click()
        except:
             print("Failed to click Play Computer. Trying Play Bots...")
             try:
                page.get_by_text("Play Bots", exact=False).first.click()
             except:
                print("Failed to click Play Bots. Taking screenshot...")
                page.screenshot(path="verification/fail_click.png")
                raise


        # 3. Select a bot
        print("Selecting Bot...")
        # Wait for the panel header
        try:
            expect(page.get_by_text("Play Bots", exact=True)).to_be_visible()
        except:
            # Maybe looking for "Choose a Computer Opponent" text?
            # PlayBotsPanel.tsx has "Play Bots" in header.
            # And "Beginner", "Intermediate" categories.
            pass

        # Select first bot (Jimmy or similar)
        # We can just click the Play button since a default bot is selected (ALL_BOTS[0])

        # 4. Click Play
        print("Clicking Play...")
        play_btn = page.get_by_test_id("play-bot-start")
        expect(play_btn).to_be_visible()
        play_btn.click()

        # 5. Wait for game to start
        print("Waiting for game start...")
        # GameInterface shows "Game vs ..."
        expect(page.get_by_text("Game vs")).to_be_visible()

        # 6. Request Hint
        print("Requesting Hint...")
        hint_button = page.get_by_title("Move Suggestion (Hint)")
        expect(hint_button).to_be_visible()
        hint_button.click()

        # 7. Check for loading state or result
        # Since I added a spinner, we might see it briefly?
        # Or if it's fast, we see the arrow.

        time.sleep(5) # Give engine time to think and arrow to render

        print("Taking screenshot...")
        page.screenshot(path="verification/hint_verification.png")

        # Also try to assert that the button is not disabled (hint delivered)
        expect(hint_button).not_to_be_disabled()

        browser.close()

if __name__ == "__main__":
    verify_hint()
