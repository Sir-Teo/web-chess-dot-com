
import time
from playwright.sync_api import sync_playwright, expect

def verify_coach_button_removal():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to Dashboard
        try:
            page.goto("http://localhost:3000/web-chess-dot-com/")
            page.wait_for_load_state("networkidle")

            # 1. Verify Dashboard "Play Coach" button is GONE
            # We look for the text "Play Coach" which was on the button
            # It should NOT be visible
            play_coach_button = page.get_by_role("button", name="Play Coach")

            # Using a more specific locator if the role one is ambiguous, but the text "Play Coach" should be unique to that button in dashboard main area
            # We expect it to have count 0
            count = play_coach_button.count()
            print(f"Play Coach button count: {count}")

            if count > 0:
                print("FAILURE: Play Coach button still visible on Dashboard!")
                # Take screenshot of failure
                page.screenshot(path="verification/failure_dashboard_button.png")
            else:
                print("SUCCESS: Play Coach button removed from Dashboard.")

            # 2. Verify Sidebar "Play Coach" item is GONE
            # The sidebar items are also buttons or links.
            # Depending on if the sidebar is expanded, we check for the text.
            sidebar_coach = page.get_by_text("Play Coach", exact=True)

            sidebar_count = sidebar_coach.count()
            print(f"Sidebar Play Coach item count: {sidebar_count}")

            if sidebar_count > 0:
                 # Check visibility - sidebar items might exist but be hidden?
                 # But in this app they are rendered in the list.
                 if sidebar_coach.first.is_visible():
                     print("FAILURE: Play Coach item visible in Sidebar!")
                     page.screenshot(path="verification/failure_sidebar.png")
                 else:
                     print("SUCCESS: Play Coach item not visible (might be in DOM but hidden? or count is from somewhere else)")
            else:
                print("SUCCESS: Play Coach item removed from Sidebar.")

            # Take a general screenshot of dashboard
            page.screenshot(path="verification/dashboard_verified.png")

        except Exception as e:
            print(f"Error during verification: {e}")
            page.screenshot(path="verification/error_screenshot.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_coach_button_removal()
