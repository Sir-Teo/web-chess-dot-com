from playwright.sync_api import sync_playwright, expect
import time

def verify_authentic_flow():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Grant permissions for clipboard access
        context = browser.new_context(permissions=['clipboard-read', 'clipboard-write'])
        page = context.new_page()

        try:
            # 1. Navigate to Dashboard
            print("Navigating to Dashboard...")
            page.goto("http://localhost:3000/web-chess-dot-com/")
            page.wait_for_selector("text=MasterTeo1205") # Wait for dashboard load

            # 2. Click "New Game" (Play button in Dashboard center column)
            print("Clicking New Game...")
            # Use a more specific locator or the first match since we know the dashboard structure
            page.locator("button:has-text('New Game')").first.click()

            # 3. Verify we are on Play panel
            print("Verifying Play Panel...")
            page.wait_for_selector("button:has-text('Play')")

            # Take screenshot of Play Panel
            page.screenshot(path="verification/1_play_panel.png")

            # 4. Test "Play Friend" Flow
            print("Testing Play Friend...")
            page.get_by_role("button", name="Play Friend").click()

            # Verify "Challenge Link" modal/panel
            page.wait_for_selector("text=Challenge Link")
            expect(page.get_by_text("Play a Friend")).to_be_visible()

            # Take screenshot of Play Friend
            page.screenshot(path="verification/2_play_friend.png")

            # Cancel Play Friend
            page.get_by_role("button", name="Cancel").click()

            # 5. Test "Online Play" Flow
            print("Testing Online Play Simulation...")
            # Click the big green "Play" button
            # It might have multiple Play buttons, use specific selector or first one
            # The big green one is usually the first "Play" button in the list or styled with bg-chess-green
            # Let's use the text "Play" which is inside the big button

            # There is a Play tab in sidebar, and a Play button in panel.
            # The Play button in panel is inside "Play Chess" section.

            play_btn = page.locator("button.bg-chess-green:has-text('Play')").first
            play_btn.click()

            # Verify Searching State
            print("Verifying Searching State...")
            expect(page.get_by_text("Searching...")).to_be_visible()
            page.screenshot(path="verification/3_searching.png")

            # Wait for "Opponent Found"
            print("Waiting for Opponent Found...")
            expect(page.get_by_text("Opponent Found!")).to_be_visible(timeout=5000)
            page.screenshot(path="verification/4_opponent_found.png")

            # Wait for Game Start
            print("Waiting for Game Start...")
            # Game starts when Searching UI disappears and Board appears/Move List appears
            # We can check for "Game vs" text in the right panel header
            expect(page.get_by_text("Game vs Guest")).to_be_visible(timeout=5000)

            # Take screenshot of Active Game
            page.screenshot(path="verification/5_active_game.png")

            print("Verification Complete!")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_authentic_flow()
