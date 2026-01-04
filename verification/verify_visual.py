from playwright.sync_api import sync_playwright

def verify_visuals():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the app
        print("Navigating...")
        page.goto("http://localhost:3000/web-chess-dot-com/")

        # Wait for "Play" header or dashboard content
        print("Waiting for load...")
        page.wait_for_selector("#root", timeout=10000)

        # Navigate to Play
        print("Clicking Sidebar Play...")
        page.get_by_role("button", name="Play").first.click()

        # Wait for Play panel
        print("Waiting for Play panel...")
        page.wait_for_selector("text=Play Chess", timeout=5000)

        # Click "Play Friend" button in the panel
        print("Clicking Play Friend...")
        # There are two buttons with text "Play Friend", one in dashboard (hidden?) and one in panel.
        # We are on Play view, so panel one should be visible.
        page.get_by_role("button", name="Play Friend").click()

        # Wait for "Start Game" to be visible
        print("Waiting for Start Game...")
        page.wait_for_selector("button:has-text('Start Game')", timeout=5000)

        # Click Start Game
        print("Clicking Start Game...")
        page.get_by_role("button", name="Start Game").click()

        # Wait for board interaction
        page.wait_for_timeout(1000)

        # Screenshot the board with new Flip button
        print("Screenshotting...")
        page.screenshot(path="verification/visual_play_friend_success.png")

        browser.close()

if __name__ == "__main__":
    verify_visuals()
