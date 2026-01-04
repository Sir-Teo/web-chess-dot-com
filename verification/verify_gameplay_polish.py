from playwright.sync_api import sync_playwright, expect
import time

def verify_gameplay_polish():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1280, 'height': 800})
        page = context.new_page()

        print("Loading application...")
        try:
            page.goto("http://localhost:3000/web-chess-dot-com/", timeout=60000)

            # Wait for *any* content in root to ensure React mounted
            page.wait_for_selector("#root div", timeout=15000)

            # Debug: print title
            print(f"Page title: {page.title()}")

            # 2. Start a Bot Game
            print("Navigating to Play Bots...")

            # Use "Play Bots" based on screenshot
            # It's a card.
            play_computer_btn = page.locator("text=Play Bots")
            play_computer_btn.wait_for(state="visible", timeout=10000)
            play_computer_btn.click()

            print("Selecting Bot...")
            # Select "Mittens"
            # It might be down the list, but it's in the text.
            page.get_by_text("Mittens").click()

            # Click Play/Choose
            # The play button has testid 'play-bot-start'
            # Playwright version might prefer different casing or locator
            page.locator("[data-testid='play-bot-start']").click()

            print("Game Starting...")
            # Wait for game to start (board wrapper)
            page.wait_for_selector("#chessboard-wrapper", timeout=10000)

            # Wait for potential Bot Chatter (start message)
            print("Waiting for chat...")
            time.sleep(3)

            # Take screenshot of Bot Game Start
            page.screenshot(path="verification/gameplay_polish_bot_chat.png")
            print("Screenshot taken: verification/gameplay_polish_bot_chat.png")

            # Success
            frontend_verification_complete(screenshot_path="verification/gameplay_polish_bot_chat.png")

        except Exception as e:
            print(f"Verification failed: {e}")
            # Capture what we see
            try:
                page.screenshot(path="verification/debug_failure.png")
                print("Failure screenshot saved to verification/debug_failure.png")
            except:
                pass
            raise e
        finally:
            browser.close()

# Mock for the tool if running locally outside the agent env,
# but inside the agent env I should call the tool via the API.
# The script itself cannot call the tool directly unless I wrap it.
# I will just print the path and call the tool manually in the next step.
def frontend_verification_complete(screenshot_path):
    print(f"VERIFICATION_COMPLETE:{screenshot_path}")

if __name__ == "__main__":
    verify_gameplay_polish()
