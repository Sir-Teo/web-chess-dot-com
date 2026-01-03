from playwright.sync_api import sync_playwright, expect
import time

def verify_analysis(page):
    # Go to app - PORT 3000
    page.goto("http://localhost:3000")

    # Wait for loading
    page.wait_for_timeout(3000)

    # Hover "Learn" - Use first one (Desktop)
    learn_btn = page.locator("button", has_text="Learn").first
    learn_btn.hover()
    page.wait_for_timeout(500)

    # Click Analysis in the flyout
    page.get_by_text("Analysis").click()

    # Wait for Interface
    page.wait_for_timeout(2000)

    # We are in Review tab by default usually or depending on state.
    # Click "Review Moves" to switch to Analysis if present
    review_btn = page.get_by_role("button", name="Review Moves")
    if review_btn.count() > 0 and review_btn.is_visible():
        review_btn.click()
    else:
        # Or click the "Analysis" tab explicitly
        # It's likely the second "Analysis" button on the page (first is sidebar)
        # Or check for tab class
        page.locator("button", has_text="Analysis").last.click()

    page.wait_for_timeout(2000)

    # Check for Stockfish 16 text (Analysis Panel)
    expect(page.get_by_text("Stockfish 16")).to_be_visible()

    # Take screenshot
    page.screenshot(path="verification/analysis_view.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.set_viewport_size({"width": 1280, "height": 720})
        try:
            verify_analysis(page)
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()
