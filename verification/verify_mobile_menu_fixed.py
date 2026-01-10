from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    iphone_12 = playwright.devices['iPhone 12']
    context = browser.new_context(**iphone_12)
    page = context.new_page()

    page.goto("http://localhost:3000/web-chess-dot-com/")

    # Wait for app to load (checking for Play button in bottom nav)
    # Using specific class or text unique to mobile nav if possible, or just filtering by visibility
    page.wait_for_selector(".fixed.bottom-0", timeout=10000)

    # Take screenshot of initial state
    page.screenshot(path="verification/mobile_initial.png")

    # Click "More" in the bottom navigation
    # We locate the button inside the fixed bottom bar
    more_btn = page.locator(".fixed.bottom-0 button").filter(has_text="More").first
    more_btn.click()

    # Wait for the mobile menu to appear
    # The menu has a Search input
    page.wait_for_selector("input[placeholder='Search']", timeout=5000)

    # Screenshot with menu open
    page.screenshot(path="verification/mobile_menu_open.png")

    # Check for presence of Settings (which is in the new menu)
    expect(page.get_by_role("button", name="Settings").first).to_be_visible()

    # Verify sub-items expansion (e.g. Learn)
    # The Learn button in the MENU (not the bottom bar) needs to be clicked.
    # The menu is overlaying everything.
    # We can find the Learn button in the menu list.
    # It has text "Learn" and should be visible.

    # Be careful not to click the bottom bar Learn button again if it's visible (z-index should handle it but selectors might be ambiguous)
    # The menu is in a div with fixed inset-0 z-50.

    menu_learn_btn = page.locator(".fixed.inset-0.z-50 button").filter(has_text="Learn").first
    menu_learn_btn.click()

    # Wait for sub-items like "Lessons"
    page.wait_for_text("Lessons")

    # Screenshot with Learn expanded
    page.screenshot(path="verification/mobile_menu_learn_expanded.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
