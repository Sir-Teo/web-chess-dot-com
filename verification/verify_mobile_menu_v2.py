from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    iphone_12 = playwright.devices['iPhone 12']
    context = browser.new_context(**iphone_12)
    page = context.new_page()

    page.goto("http://localhost:3000/web-chess-dot-com/")

    # Wait for app to load
    page.wait_for_selector(".fixed.bottom-0", timeout=10000)

    # Click "More" in the bottom navigation
    more_btn = page.locator(".fixed.bottom-0 button").filter(has_text="More").first
    more_btn.click()

    # Wait for the mobile menu to appear (Search input inside the menu)
    # Using a selector that targets the specific mobile menu structure or visibility
    # The mobile menu is the one that is visible in this viewport
    search_input = page.locator("input[placeholder='Search']").filter(has=page.locator("xpath=ancestor::div[contains(@class, 'z-50')]"))
    # Or simply filter by visibility

    # Let's use filter visible=True
    page.locator("input[placeholder='Search']").get_by_text("Search").first # This is wrong, placeholder isn't text

    # Better: Wait for the mobile menu container
    page.wait_for_selector(".fixed.inset-0.z-50", timeout=5000)

    # Screenshot with menu open
    page.screenshot(path="verification/mobile_menu_open.png")

    # Verify sub-items expansion (e.g. Learn)
    # Find the Learn button inside the mobile menu
    # The menu overlay is visible, so we can scope to it
    menu = page.locator(".fixed.inset-0.z-50")
    learn_btn = menu.locator("button").filter(has_text="Learn").first
    learn_btn.click()

    # Wait for sub-items like "Lessons"
    page.wait_for_text("Lessons")

    # Screenshot with Learn expanded
    page.screenshot(path="verification/mobile_menu_learn_expanded.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
