from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto("http://localhost:3000")
    page.screenshot(path="verification/debug_initial.png")

    # Try to find "Play Bots" button
    try:
        page.click("text=Play Bots", timeout=2000)
        page.wait_for_timeout(1000)
        page.screenshot(path="verification/debug_after_click.png")
    except Exception as e:
        print(f"Error clicking: {e}")

    browser.close()
