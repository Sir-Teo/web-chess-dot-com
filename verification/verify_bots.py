from playwright.sync_api import sync_playwright

def verify_bots(page):
    print("Navigating to home...")
    page.goto("http://localhost:3000/")

    print("Waiting for Play Bots...")
    page.wait_for_selector("text=Play Bots")

    print("Clicking Play Bots...")
    page.click("text=Play Bots")

    print("Waiting for Play Bots Header...")
    page.wait_for_selector("div.flex.items-center.gap-2 span:has-text('Play Bots')")

    print("Selecting Martin...")
    page.click("text=Martin")

    print("Waiting for Play button...")
    play_button = page.locator("button.bg-\\[\\#81b64c\\]")
    play_button.wait_for()

    print("Taking bot selection screenshot...")
    page.screenshot(path="/home/jules/verification/bot_selection.png")

    print("Starting Game...")
    play_button.click()

    print("Waiting for game...")
    page.wait_for_timeout(3000)

    print("Taking game screenshot...")
    page.screenshot(path="/home/jules/verification/bot_game.png")
    print("Done.")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_bots(page)
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="/home/jules/verification/error.png")
        finally:
            browser.close()
