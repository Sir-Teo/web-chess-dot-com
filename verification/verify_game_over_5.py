import time
from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        try:
            print("Navigating to app...")
            page.goto("http://localhost:3000/web-chess-dot-com/")

            # Mimic verify_review.py logic exactly
            page.wait_for_selector("text=Play Bots", timeout=5000)

            if page.is_visible("text=Challenge computer personalities"):
                print("Clicking 'Play Bots' on Dashboard...")
                page.click("text=Play Bots")

            time.sleep(1)

            if page.is_visible("text=New Game") and page.is_visible("text=Play Computer"):
                 print("In Play Panel, clicking 'Play Computer'...")
                 page.click("text=Play Computer")

            print("Waiting for Bot Panel...")
            page.wait_for_selector("text=Martin", timeout=5000)

            print("Starting Bot Game...")
            # Use data-testid which I verified exists in code
            page.click("data-testid=play-bot-start")

            print("Waiting for Game to start...")
            page.wait_for_selector("text=Game vs", timeout=5000)

            print("Resigning...")
            page.wait_for_selector("button:has-text('Resign')", timeout=5000)
            page.click("button:has-text('Resign')")

            print("Waiting for Game Over Overlay...")
            page.wait_for_selector("text=Rematch", timeout=5000)
            page.wait_for_selector("text=New Bot", timeout=5000)

            print("Taking screenshot...")
            page.screenshot(path="verification/game_over_overlay.png")
            print("Screenshot saved to verification/game_over_overlay.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/debug_fail_overlay.png")
            raise e
        finally:
            browser.close()

if __name__ == "__main__":
    run()
