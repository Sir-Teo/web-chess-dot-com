from playwright.sync_api import sync_playwright

def verify_mobile_layout():
    with sync_playwright() as p:
        # iPhone 12 Pro viewport
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 390, "height": 844},
            user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 14_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Mobile/15E148 Safari/604.1"
        )
        page = context.new_page()

        print("Navigating to Dashboard...")
        page.goto("http://localhost:3000/")
        page.wait_for_load_state("networkidle")

        # 1. Screenshot Dashboard Mobile
        print("Taking Dashboard screenshot...")
        page.screenshot(path="verification/mobile_dashboard.png")

        # 2. Navigate to Game
        print("Navigating to Game...")
        # Use more specific selector to avoid ambiguity
        page.locator("button:has-text('New Game')").first.click()

        # Or wait for url
        page.wait_for_timeout(2000) # Wait for animation/load

        # 3. Screenshot Game Interface Mobile
        print("Taking Game Interface screenshot...")
        page.screenshot(path="verification/mobile_game.png")

        browser.close()

if __name__ == "__main__":
    verify_mobile_layout()
