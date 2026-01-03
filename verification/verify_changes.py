from playwright.sync_api import sync_playwright

def verify_app():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # 1. Verify Dashboard "Play a Friend" button
        try:
            print("Navigating to dashboard...")
            page.goto("http://localhost:3000/web-chess-dot-com/")
            page.wait_for_timeout(2000) # Wait for load

            print("Taking dashboard screenshot...")
            page.screenshot(path="verification/dashboard.png")

            print("Clicking 'Play a Friend'...")
            # Look for button containing text "Play a Friend"
            # It's inside a button element
            btn = page.locator("button").filter(has_text="Play a Friend")
            btn.click()

            page.wait_for_timeout(1000)

            # Verify we are on Play page
            # Play page has "Play Chess" header or "New Game" button active
            print("Verifying navigation to Play...")
            page.screenshot(path="verification/play_friend_nav.png")

        except Exception as e:
            print(f"Error in Dashboard verification: {e}")
            page.screenshot(path="verification/error_dashboard.png")

        # 2. Verify Openings Interface "Start Learning"
        try:
            print("Navigating to Openings...")
            page.goto("http://localhost:3000/web-chess-dot-com/")
            page.wait_for_timeout(2000)

            # To get to openings: Hover "Learn" and click "Openings"
            # Or click "Learn" (which goes to dashboard/learn?) then...
            # The sidebar logic:
            # Hover 'learn' -> flyout appears with 'Openings' which sets activeTab='learn-openings'

            # Simulating hover in Playwright
            print("Hovering 'Learn'...")
            page.get_by_role("button", name="Learn").hover()
            page.wait_for_timeout(500)

            print("Clicking 'Openings'...")
            page.get_by_text("Openings").click()
            page.wait_for_timeout(1000)

            print("Taking Openings screenshot...")
            page.screenshot(path="verification/openings.png")

            print("Clicking 'Start Learning'...")
            # The "Start Learning" button
            page.get_by_role("button", name="Start Learning").click()
            page.wait_for_timeout(2000) # Wait for analysis to load

            # Should be in Analysis now
            print("Verifying navigation to Analysis...")
            # Check for Analysis elements like "Analysis" tab or Evaluation bar
            page.screenshot(path="verification/analysis_from_opening.png")

        except Exception as e:
            print(f"Error in Openings verification: {e}")
            page.screenshot(path="verification/error_openings.png")

        browser.close()

if __name__ == "__main__":
    verify_app()
