import time
from playwright.sync_api import sync_playwright

def verify_analysis():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # 1. Navigate to the App
        page.goto("http://localhost:3000/web-chess-dot-com/")
        page.wait_for_timeout(3000)

        # 2. Click "Play Bots" in Sidebar
        page.get_by_role("button", name="Play Bots").click()
        page.wait_for_timeout(2000)

        # 3. Take screenshot to see if Play Button is there
        page.screenshot(path="verification/play_bots_panel.png")

        # 4. Click Play Button (using visible text instead of test-id to be safe?)
        # Or check if ID is correct. Memory said "play-bot-start".
        # Let's try locating by text "Play"

        try:
             page.get_by_test_id("play-bot-start").click(timeout=5000)
        except:
             # Fallback
             print("Test ID not found, trying Text 'Play'")
             page.get_by_role("button", name="Play", exact=True).click()

        page.wait_for_timeout(3000)

        # 5. Resign
        # Try to find flag button
        try:
             # Look for button with title "Resign" or class containing "lucide-flag" parent
             page.locator("button:has(svg.lucide-flag)").first.click(timeout=3000)
             page.wait_for_timeout(1000)
             page.get_by_role("button", name="Resign", exact=True).click()
        except:
             print("Resign button not found")
             page.screenshot(path="verification/game_error.png")
             return

        page.wait_for_timeout(2000)

        # 6. Click Game Review
        page.get_by_role("button", name="Game Review").click()
        page.wait_for_timeout(3000)

        # 7. Check Tabs
        # Analysis
        page.get_by_text("Analysis").click()
        page.wait_for_timeout(1000)
        if page.get_by_text("Copy PGN").is_visible():
            print("Verified: Copy PGN button exists")
        if page.get_by_text("Reset").is_visible():
            print("Verified: Reset button exists")

        page.screenshot(path="verification/analysis_ui.png")

        # Explorer
        page.get_by_text("Explorer").click()
        page.wait_for_timeout(1000)
        page.screenshot(path="verification/explorer_ui.png")

        # Check if table exists
        if page.locator("table").is_visible():
             print("Verified: Explorer table exists")

        # Review
        page.get_by_text("Review").click()
        page.wait_for_timeout(1000)
        page.screenshot(path="verification/review_ui.png")

        # Check Key Moments
        if page.get_by_text("Key Moments").is_visible():
             print("Verified: Key Moments section exists")

        browser.close()

if __name__ == "__main__":
    verify_analysis()
