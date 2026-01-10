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

    # Wait for the mobile menu to appear
    page.wait_for_selector(".fixed.inset-0.z-50", timeout=5000)

    # Screenshot with menu open
    page.screenshot(path="verification/mobile_menu_open.png")

    # Verify sub-items expansion (e.g. Learn)
    menu = page.locator(".fixed.inset-0.z-50")
    learn_btn = menu.locator("button").filter(has_text="Learn").first
    learn_btn.click()

    # Wait for sub-items like "Lessons"
    # Using locator + expect to wait
    expect(page.locator("text=Lessons").first).to_be_visible()

    # Screenshot with Learn expanded
    page.screenshot(path="verification/mobile_menu_learn_expanded.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
