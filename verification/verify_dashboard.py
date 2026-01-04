from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            page.goto("http://localhost:3000/web-chess-dot-com/")

            # Wait for dashboard items
            page.wait_for_selector("text=MasterTeo1205", timeout=30000)

            # Check for "Play Bots" button
            bots_btn = page.locator("text=Play Bots")
            if bots_btn.count() > 0:
                print("Found Play Bots button")
                bots_btn.first.click()

                # Check navigation
                page.wait_for_selector("text=Play Bots", timeout=30000)
                print("Navigated to Play Bots panel")

                # Start Game
                page.click("button[data-testid='play-bot-start']")

                # Wait for board
                page.wait_for_selector("#chessboard-wrapper", timeout=30000)
                print("Game started")

                # Resign
                page.click("button[title='Resign']")
                page.wait_for_selector("text=Game Review", timeout=10000)
                print("Game Over Modal shown")

                # Click Game Review
                page.click("button:has-text('Game Review')")

                # Check Review Panel
                page.wait_for_selector("h2:has-text('Game Review')", timeout=30000)
                print("Review Panel shown")

                # Screenshot
                page.screenshot(path="verification/dashboard_flow_success.png")
            else:
                print("Play Bots button not found")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/dashboard_flow_failure.png")
        finally:
            browser.close()

if __name__ == "__main__":
    run()
