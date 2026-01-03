from playwright.sync_api import sync_playwright

def verify_settings(page):
    page.goto("http://localhost:3000/web-chess-dot-com/")

    # Wait for the settings button in the sidebar (or bottom left)
    page.wait_for_selector("text=Settings", timeout=10000)

    # Click Settings
    page.click("text=Settings")

    # Wait for modal
    page.wait_for_selector("text=Board Theme", timeout=5000)

    # Take screenshot of default settings modal
    page.screenshot(path="verification/settings_modal_default.png")

    # Change Board Theme to Brown
    page.click("text=Brown")
    page.screenshot(path="verification/settings_modal_brown_selected.png")

    # Close Modal
    page.click("button:has-text('Save')")

    # Wait a bit for animation
    page.wait_for_timeout(500)

    # Take screenshot of board with new theme
    page.screenshot(path="verification/board_brown_theme.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        try:
            verify_settings(page)
        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()
