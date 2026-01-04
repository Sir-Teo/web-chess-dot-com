from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("http://localhost:3000/web-chess-dot-com/")

        # Navigate to a game
        page.click("text=Play Bots")
        page.click("button[title='Play as White']")
        page.click("data-testid=play-bot-start")
        page.wait_for_selector("#chessboard-wrapper", timeout=10000)

        # Dump HTML of chessboard
        handle = page.locator("#chessboard-wrapper")
        print(handle.inner_html())

        browser.close()

if __name__ == "__main__":
    run()
