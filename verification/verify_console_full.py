from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.on("console", lambda msg: print(f"Console: {msg.text}"))
        page.on("pageerror", lambda err: print(f"Page Error: {err}"))
        try:
            page.goto("http://localhost:3000/web-chess-dot-com/")
            page.wait_for_timeout(3000)

            # Use specific locator for Dashboard button
            print("Clicking Play Bots...")
            page.click("text=Play Bots")

            # Now we are in Bot Selection
            page.wait_for_selector("button[data-testid='play-bot-start']", timeout=10000)
            print("Starting Game...")
            page.click("button[data-testid='play-bot-start']")

            page.wait_for_selector("#chessboard-wrapper", timeout=10000)
            print("Board Visible")

            page.click("button[title='Resign']")
            print("Resigned")

            page.wait_for_selector("text=Game Review", timeout=10000)
            print("Modal Visible")

            page.click("button:has-text('Game Review')")
            print("Clicked Game Review")

            # Check for header again
            page.wait_for_selector("h2:has-text('Game Review')", timeout=10000)
            print("Review Panel Header Found")

        except Exception as e:
            print(f"Script Error: {e}")
            page.screenshot(path="verification/console_debug_fail.png")
        finally:
            browser.close()

if __name__ == "__main__":
    run()
