from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    iphone_12 = playwright.devices['iPhone 12']
    context = browser.new_context(**iphone_12)
    page = context.new_page()

    page.goto("http://localhost:3000/web-chess-dot-com/")

    # Wait for app
    try:
        # Try a more generic selector first to ensure page loaded
        page.wait_for_selector("div", timeout=5000)

        # Take screenshot to debug what's visible
        page.screenshot(path="verification/debug_initial.png")

        # Wait for bottom nav
        page.wait_for_selector("text=More", timeout=5000)

        # Click More
        page.get_by_text("More").click()

        # Wait for menu
        page.wait_for_selector("input[placeholder='Search']", timeout=5000)
        page.screenshot(path="verification/mobile_menu_open.png")

        # Expand Learn
        page.get_by_role("button", name="Learn").click()
        page.wait_for_text("Lessons")
        page.screenshot(path="verification/mobile_menu_learn_expanded.png")

    except Exception as e:
        print(f"Error: {e}")
        page.screenshot(path="verification/error_state.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
