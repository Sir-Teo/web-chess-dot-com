
from playwright.sync_api import sync_playwright

def verify_buttons_exist():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        try:
            print("Navigating to app...")
            page.goto("http://localhost:3000/web-chess-dot-com/")
            page.wait_for_timeout(3000)

            print("Selecting 'Play Bots'...")
            page.get_by_text("Play Bots", exact=True).click()
            page.wait_for_timeout(1000)

            print("Starting Bot Game...")
            page.get_by_test_id("play-bot-start").click()
            page.wait_for_timeout(2000)

            print("Checking for Hint button...")
            if page.locator("button[title='Hint']").count() > 0:
                print("SUCCESS: Hint button found.")
            else:
                print("FAILURE: Hint button NOT found.")

            print("Checking for Takeback button...")
            if page.locator("button[title='Takeback']").count() > 0:
                print("SUCCESS: Takeback button found.")
            else:
                print("FAILURE: Takeback button NOT found.")

            page.screenshot(path="verification/buttons_verification.png")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_buttons_exist()
