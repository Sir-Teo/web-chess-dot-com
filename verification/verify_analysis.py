from playwright.sync_api import sync_playwright
import time

def verify_analysis_navigation():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1280, 'height': 720})
        page = context.new_page()

        print("Navigating to app...")
        page.goto("http://localhost:3000/web-chess-dot-com/")

        # Wait for "Play Bots" button on Dashboard
        print("Waiting for Play Bots button...")
        page.wait_for_selector("text=Play Bots", timeout=60000)

        # Start Bot Game
        print("Clicking Play Bots...")
        # Dashboard is in main, so this works.
        page.click("text=Play Bots")

        # Wait for PlayBotsPanel
        # It has "Play Bots" header.
        page.wait_for_selector("text=Play Bots", timeout=10000)

        # Select Martin
        print("Selecting Martin...")
        page.click("text=Martin")

        # Click Play button (main content, not sidebar)
        # This is crucial to avoid clicking the Sidebar "Play" tab
        print("Clicking Play...")
        page.click("main button:has-text('Play')")

        # Wait for game to start
        print("Waiting for game start...")
        page.wait_for_selector("text=Game vs Martin", timeout=20000)

        # Resign
        print("Resigning...")
        page.click("button[title='Resign']")

        # Wait for Game Over overlay
        print("Waiting for Game Over...")
        page.wait_for_selector("text=Aborted")

        # Click Game Review
        print("Clicking Game Review...")
        page.click("button:has-text('Game Review')")

        # Verify Analysis Page
        print("Verifying Analysis Page...")
        # Wait for Analysis/Review tabs
        page.wait_for_selector("button:has-text('Analysis')", state="visible")

        # Switch to Analysis tab
        print("Switching to Analysis tab...")
        page.click("button:has-text('Analysis')")

        # Verify Analysis Panel header
        page.wait_for_selector("text=Analysis", state="visible")

        # Take screenshot
        time.sleep(1)
        page.screenshot(path="verification/analysis_view.png")
        print("Screenshot saved to verification/analysis_view.png")

        # Verify Move List existence
        if page.is_visible("text=White") and page.is_visible("text=Black"):
            print("MoveList header found.")
        else:
            print("MoveList header NOT found.")

        browser.close()

if __name__ == "__main__":
    verify_analysis_navigation()
