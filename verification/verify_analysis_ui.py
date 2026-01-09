
from playwright.sync_api import sync_playwright
import time

def verify_analysis(page):
    # 1. Navigate to the app (using the base path if necessary)
    page.goto("http://localhost:3000/web-chess-dot-com/")

    # Wait for the "Play" or "Analysis" option in the sidebar
    page.wait_for_selector("text=Analysis")

    # Click Analysis in sidebar
    page.click("text=Analysis")

    # 2. Wait for loading
    page.wait_for_timeout(2000)

    # 3. Check for the Explorer tab
    explorer_tab = page.get_by_text("Explorer")
    explorer_tab.click()

    # Wait for the Explorer panel to render
    page.wait_for_timeout(2000)

    # Take a screenshot of the Explorer view
    page.screenshot(path="verification/explorer_view.png")

    # 4. Check for the Review tab
    review_tab = page.get_by_text("Review")
    review_tab.click()

    # Wait for Review panel
    page.wait_for_timeout(1000)

    # Take a screenshot of the Review view
    page.screenshot(path="verification/review_view.png")

    # Switch back to Explorer to verify content
    explorer_tab.click()
    page.wait_for_timeout(1000)

    # Check text content of the table (basic check)
    content = page.content()
    # "e4" is a move, but might be hidden in html structure.
    # We can check if "Polish Opening" (b4) or similar is present if the move list is robust
    # But current logic is: if start pos, we iterate legal moves.
    # e4 is a legal move.

    page.screenshot(path="verification/final_analysis.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_analysis(page)
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()
