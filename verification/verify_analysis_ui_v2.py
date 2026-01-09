
from playwright.sync_api import sync_playwright
import time

def verify_analysis(page):
    print("Navigating to #/analysis...")
    page.goto("http://localhost:3000/web-chess-dot-com/#/analysis")

    # Wait for the component to mount. The "Explorer" tab button should be visible.
    # We use a specific locator for the tab button to avoid ambiguity with sidebar.
    # The tab has an icon and text "Explorer".
    print("Waiting for Explorer tab...")
    explorer_tab = page.get_by_role("button", name="Explorer")
    explorer_tab.wait_for(state="visible", timeout=10000)

    print("Clicking Explorer tab...")
    explorer_tab.click()

    # Wait for the table to appear
    print("Waiting for Explorer content...")
    page.wait_for_timeout(1000)

    # Take screenshot of Explorer
    print("Taking Explorer screenshot...")
    page.screenshot(path="verification/explorer_view.png")

    # Check for "Book Move" text if I implemented that title?
    # I added `title: isBook ? 'Book Move' : undefined` to the move stats.
    # But I didn't update the render logic in ExplorerPanel to SHOW the title, just passed it in data.
    # Let's check ExplorerPanel.tsx content I wrote.

    # In ExplorerPanel.tsx:
    # <tbody>
    #   {moves.map((m) => (
    #     <tr ...>
    #       <td ...> {m.san} </td>
    # ...
    # It does NOT render m.title explicitly in the table, effectively hidden.
    # But the moves order should be affected (Book moves boosted).

    # Let's check the Review tab for the Retry buttons.
    print("Clicking Review tab...")
    review_tab = page.get_by_role("button", name="Review")
    review_tab.click()

    print("Waiting for Review content...")
    page.wait_for_timeout(1000)

    # Take screenshot of Review
    print("Taking Review screenshot...")
    page.screenshot(path="verification/review_view.png")

    print("Verification Done.")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        # Set viewport to standard desktop
        page.set_viewport_size({"width": 1280, "height": 720})
        try:
            verify_analysis(page)
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error_script.png")
        finally:
            browser.close()
