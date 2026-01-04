from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            page.goto("http://localhost:3000/web-chess-dot-com/")
            page.click("text=Play Bots")
            page.click("button[data-testid='play-bot-start']")
            page.wait_for_selector("#chessboard-wrapper", timeout=10000)
            page.click("button[title='Resign']")
            page.wait_for_selector("text=Game Review", timeout=10000)
            page.click("button:has-text('Game Review')")

            # Wait for header
            page.wait_for_selector("h2:has-text('Game Review')", timeout=10000)

            # Find Analysis Tab button
            # In AnalysisInterface, the tab buttons are:
            # <button ...>Review</button>
            # <button ...>Analysis</button>
            # We want to click 'Analysis'

            page.click("button:has-text('Analysis')")

            # Check for Practice button
            # It has title="Practice Position vs Computer"
            page.wait_for_selector("button[title='Practice Position vs Computer']", timeout=10000)
            print("Practice Button Found")

            page.screenshot(path="verification/practice_btn.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/practice_btn_fail.png")
        finally:
            browser.close()

if __name__ == "__main__":
    run()
