from playwright.sync_api import sync_playwright
import time

def verify_black_bot_game():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # Capture console logs
        page.on("console", lambda msg: print(f"BROWSER LOG: {msg.text}"))

        print("Navigating to app...")
        page.goto("http://localhost:3000/web-chess-dot-com/")

        # Click Play Bots on Dashboard
        print("Entering Bot Mode...")
        try:
             page.wait_for_selector("text=Play Bots")
             page.click("text=Play Bots")
        except Exception as e:
             print(f"Error clicking Play Bots: {e}")
             raise e

        print("Waiting for Bot Panel...")
        page.wait_for_selector("text=Play Bots", state="visible")

        # Select Black color
        print("Selecting Black...")
        try:
            # Check if button is visible
            page.wait_for_selector("button[title='Play as Black']", state="visible")
            page.click("button[title='Play as Black']")
        except Exception as e:
            print(f"Error selecting black: {e}")
            raise e

        # Start Game
        print("Starting Game...")
        page.click("data-testid=play-bot-start")

        print("Waiting for game start...")
        page.wait_for_selector("#chessboard-wrapper")

        # Wait for bot to move (White moves first)
        print("Waiting for Bot (White) to move...")

        time.sleep(4)

        page.screenshot(path="verification/verification_black_bot.png")
        print("Screenshot saved to verification/verification_black_bot.png")

        browser.close()

if __name__ == "__main__":
    verify_black_bot_game()
