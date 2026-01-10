from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    # Use iPhone 12 emulation to test mobile view
    iphone_12 = playwright.devices['iPhone 12']
    context = browser.new_context(**iphone_12)
    page = context.new_page()

    # Navigate to app
    page.goto("http://localhost:3000/web-chess-dot-com/")

    # Wait for app to load
    page.wait_for_selector("text=Chess.com")

    # Take screenshot of initial state (should show bottom nav)
    page.screenshot(path="verification/mobile_initial.png")

    # Click "More" to open menu
    # The label text is "More", inside a button
    page.get_by_text("More").click()

    # Wait for menu to appear (Search input is a good indicator)
    page.wait_for_selector("input[placeholder='Search']")

    # Screenshot with menu open
    page.screenshot(path="verification/mobile_menu_open.png")

    # Verify sub-items expansion (e.g. Learn)
    # Check if "Learn" exists in the menu
    learn_btn = page.locator("button").filter(has_text="Learn").first
    learn_btn.click()

    # Wait for sub-items like "Lessons"
    page.wait_for_text("Lessons")

    # Screenshot with Learn expanded
    page.screenshot(path="verification/mobile_menu_learn_expanded.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
