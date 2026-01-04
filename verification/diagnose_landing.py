
from playwright.sync_api import sync_playwright

def diagnose_landing():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        try:
            print("Navigating...")
            page.goto("http://localhost:3000/web-chess-dot-com/")

            print("Waiting for body...")
            page.wait_for_selector("body", timeout=5000)

            print("Taking landing screenshot...")
            page.screenshot(path="verification/debug_landing_v2.png")

            print("Checking for 'Play Computer' text...")
            if page.get_by_text("Play Computer").is_visible():
                print("Found 'Play Computer'")
            else:
                print("'Play Computer' NOT found")
                # print page content to see what IS there
                print(page.content())

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/debug_error_v2.png")
        finally:
            browser.close()

if __name__ == "__main__":
    diagnose_landing()
