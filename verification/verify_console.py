from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Listen for console logs
        page.on("console", lambda msg: print(f"Console: {msg.text}"))
        page.on("pageerror", lambda err: print(f"Page Error: {err}"))

        try:
            page.goto("http://localhost:3000/web-chess-dot-com/")

            # Navigate to Review directly via flow
            page.click("text=Play Bots")
            page.click("button[data-testid='play-bot-start']")
            page.wait_for_selector("#chessboard-wrapper")
            page.click("button[title='Resign']")
            page.wait_for_selector("text=Game Review")
            page.click("button:has-text('Game Review')")

            # Wait a bit to catch errors
            page.wait_for_timeout(5000)

        except Exception as e:
            print(f"Script Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    run()
