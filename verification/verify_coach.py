from playwright.sync_api import sync_playwright

def verify_coach_mode():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        page.on("console", lambda msg: print(f"CONSOLE: {msg.text}"))

        page.goto("http://localhost:5173")

        # Navigate to Bots
        page.locator("button").filter(has_text="Play Bots").first.click()

        # Wait for Sidebar Panel
        page.wait_for_timeout(1000)

        # Start Game
        play_btn = page.locator("button").filter(has_text="Play").last
        play_btn.click()

        # Toggle Coach
        coach_btn = page.get_by_title("Toggle Coach Mode")
        coach_btn.wait_for()
        coach_btn.click()

        # Wait for board setup
        page.wait_for_timeout(1000)

        # Drag e2 to e4
        print("Moving e2 to e4...")
        e2 = page.locator("div[data-square='e2']").first
        e4 = page.locator("div[data-square='e4']").first

        piece = e2.locator("div").first

        if piece.count() > 0:
            print("Dragging piece...")
            piece.drag_to(e4)
        else:
            print("Dragging square...")
            e2.drag_to(e4)

        # Wait for feedback
        page.wait_for_timeout(6000)

        page.screenshot(path="verification/coach_mode_feedback.png")
        print("Screenshot taken.")

        browser.close()

if __name__ == "__main__":
    verify_coach_mode()
