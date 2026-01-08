from playwright.sync_api import sync_playwright, expect
import time

def verify_tournaments():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Increase viewport size to capture more content
        context = browser.new_context(viewport={'width': 1280, 'height': 800})
        page = context.new_page()

        # 1. Navigate to the app (Tournaments is now in sidebar)
        page.goto("http://localhost:3000/#tournaments")

        # Wait for the main container to load
        page.wait_for_selector('h1:has-text("Tournaments")')

        print("Taking screenshot of Tournaments List")
        page.screenshot(path="verification/tournaments_list.png")

        # 2. Click on a specific tournament (e.g., 'Hourly Bullet Arena')
        # It's in MOCK_TOURNAMENTS with status 'Upcoming'
        # We look for the text "Hourly Bullet Arena"
        page.click('text="Hourly Bullet Arena"')

        # 3. Verify Lobby View
        # Should see "Hourly Bullet Arena" as title and "Join Tournament" button
        page.wait_for_selector('h1:has-text("Hourly Bullet Arena")')
        expect(page.get_by_role("button", name="Join Tournament")).to_be_visible()

        print("Taking screenshot of Tournament Lobby (Upcoming)")
        page.screenshot(path="verification/tournament_lobby_upcoming.png")

        # 4. Join the Tournament
        page.click('text="Join Tournament"')

        # 5. Verify Joined State (Countdown)
        # Should see "Starting In" and countdown
        page.wait_for_selector('text="Starting In"')

        print("Taking screenshot of Tournament Lobby (Joined)")
        page.screenshot(path="verification/tournament_lobby_joined.png")

        # 6. Test Navigation to Game (Simulate Start)
        # In our mock logic, we might need to wait for countdown or force it?
        # The mock has a 120s countdown. We can't wait that long in a test.
        # But we added a "Start Round 1" button if countdown is 0.
        # We can try to fast-forward by manipulating the component state if possible, or just verify the lobby looks right.
        # Actually, let's just verify the lobby for now.

        # 7. Check Back Navigation
        page.click('text="Back to Tournaments"')
        page.wait_for_selector('h1:has-text("Tournaments")')

        browser.close()

if __name__ == "__main__":
    verify_tournaments()
