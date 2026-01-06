import time
from playwright.sync_api import sync_playwright, expect

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1280, 'height': 800})
        page = context.new_page()

        # 1. Navigate to the app (assuming default Vite port)
        page.goto("http://localhost:3000/web-chess-dot-com/")

        # 2. Wait for loading - Wait for text "Play 15 | 10" which is in the dashboard
        page.wait_for_selector("text=Play 15 | 10", timeout=10000)

        # 3. Navigate to Lessons
        # Sidebar click
        page.click("text=Learn")
        page.click("text=Lessons")

        # 4. Wait for Lessons page
        page.wait_for_selector("text=Checkmate Patterns")

        # 5. Click on Checkmate Patterns
        page.click("text=Checkmate Patterns")

        # 6. Wait for Lesson Interface (First challenge is Back Rank Mate)
        page.wait_for_selector("text=Deliver a Back Rank Mate")

        # 7. Take screenshot of first challenge
        page.screenshot(path="verification/lesson_start.png")
        print("Screenshot lesson_start.png saved")

        browser.close()

if __name__ == "__main__":
    run()
