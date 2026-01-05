from playwright.sync_api import sync_playwright
import time

def verify_coach_mode():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1280, 'height': 800})
        page = context.new_page()

        # 1. Navigate to Dashboard
        print("Navigating to Dashboard...")
        page.goto("http://localhost:3000/web-chess-dot-com/")
        page.wait_for_selector("text=MasterTeo1205", timeout=10000)

        # 2. Check "Play Coach" button in Dashboard
        print("Checking Dashboard for Play Coach button...")
        coach_btn = page.get_by_text("Play Coach")
        if not coach_btn.is_visible():
            print("Play Coach button not found on Dashboard!")
            # Take screenshot of dashboard
            page.screenshot(path="verification/coach_dashboard_failure.png")
            return

        # 3. Click "Play Coach"
        print("Clicking Play Coach...")
        coach_btn.click()
        time.sleep(1) # Animation

        # 4. Verify Play Coach Panel
        print("Verifying Play Coach Panel...")
        panel_header = page.get_by_text("Play Against Coach")
        if not panel_header.is_visible():
            print("Play Coach Panel header not found!")
            page.screenshot(path="verification/coach_panel_failure.png")
            return

        # 5. Interact with Slider (Optional, just check visibility)
        slider = page.locator("input[type='range']")
        if not slider.is_visible():
            print("Level slider not found!")

        # Take screenshot of the Play Coach Panel
        page.screenshot(path="verification/play_coach_panel.png")
        print("Screenshot of Play Coach Panel saved.")

        # 6. Start Game
        print("Starting Coach Game...")
        start_btn = page.locator("button[data-testid='play-coach-start']")
        start_btn.click()
        time.sleep(2) # Wait for game load

        # 7. Verify Game Interface with Coach Mode enabled
        # Check for Coach Feedback or Toggle
        coach_toggle = page.get_by_title("Toggle Coach Mode")
        if not coach_toggle.is_visible():
             print("Coach Toggle not found in game!")

        # Check for Coach Feedback container (might be empty initially)
        # We can try to make a move or just check if the feedback component is mounted?
        # The toggle should be green if enabled by default?
        # It has class 'bg-chess-green' if enabled.
        # But `isCoachMode` default is what we set. In `handleStartBotGame` for coach, we set `setIsCoachMode(true)`.

        # Let's check the toggle class
        is_green = page.evaluate("document.querySelector('button[title=\"Toggle Coach Mode\"]').classList.contains('bg-chess-green')")
        if is_green:
            print("Coach Mode is ACTIVE.")
        else:
            print("Coach Mode is NOT ACTIVE (Toggle is gray).")

        # 8. Check Settings Cog
        settings_cog = page.locator("button[title='Coach Settings']")
        if settings_cog.is_visible():
            print("Coach Settings Cog is visible.")
            settings_cog.click()
            time.sleep(0.5)
            page.screenshot(path="verification/coach_settings_modal.png")
            print("Screenshot of Coach Settings Modal saved.")
            # Close modal
            page.locator("button").filter(has_text="Done").click()
        else:
            print("Coach Settings Cog NOT found!")

        # 9. Take final game screenshot
        page.screenshot(path="verification/coach_game_active.png")
        print("Screenshot of Active Game saved.")

        browser.close()

if __name__ == "__main__":
    verify_coach_mode()
