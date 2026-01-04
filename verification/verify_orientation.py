from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("http://localhost:3000/web-chess-dot-com/")

        # 1. Start Game as Black
        page.click("text=Play Bots")
        page.click("button[title='Play as Black']")
        page.click("data-testid=play-bot-start")

        page.wait_for_selector("#chessboard-wrapper", timeout=10000)

        # Take screenshot
        page.screenshot(path="verification/black_orientation.png")
        print("Screenshot taken: verification/black_orientation.png")

        browser.close()

if __name__ == "__main__":
    run()
