from playwright.sync_api import sync_playwright, expect
import time

def verify_analysis_mode(page):
    # Navigate to Analysis mode
    print("Navigating to Analysis Mode...")
    page.goto("http://localhost:3000/web-chess-dot-com/#analysis")

    # Wait for the board to load (using the wrapper ID we know exists)
    page.wait_for_selector("#chessboard-wrapper")
    print("Board loaded.")

    # Check for the new "Explorer" tab button
    print("Checking for Explorer tab...")
    explorer_tab = page.get_by_text("Explorer")
    expect(explorer_tab).to_be_visible()

    # Click it
    print("Clicking Explorer tab...")
    explorer_tab.click()

    # Wait for Explorer Panel content
    print("Waiting for Explorer content...")
    page.wait_for_selector("text=Opening Explorer")
    page.wait_for_selector("text=Games")

    # Check for Move List (should list e4, d4, etc.)
    # Note: Initial position should have e4 as a candidate
    print("Checking for moves...")
    expect(page.get_by_text("e4").first).to_be_visible()

    # Click "e4" to make a move
    print("Making a move (e4)...")
    page.get_by_text("e4").first.click()

    # Wait for move to be made (e5 response or user to play next)
    # The explorer just plays the move for the current side (White)
    time.sleep(1)

    # Check if history updated (Black's turn now)
    # Explorer should now show Black's responses to e4
    expect(page.get_by_text("e5").first).to_be_visible()
    expect(page.get_by_text("c5").first).to_be_visible()

    # Take screenshot of Explorer
    print("Taking screenshot of Explorer...")
    page.screenshot(path="verification/analysis_explorer.png")

    # Now check Setup Position Modal
    print("Checking Setup Position...")
    # Go back to analysis tab to see the toolbar
    page.get_by_text("Analysis").click()

    # Click "Setup" button in footer
    print("Clicking Setup button...")
    setup_btn = page.get_by_text("Setup")
    setup_btn.click()

    # Check if modal opens
    print("Waiting for modal...")
    # Fix strict mode violation by using a more specific locator
    expect(page.get_by_role("heading", name="Load Position")).to_be_visible()
    expect(page.get_by_text("FEN String")).to_be_visible()

    # Take screenshot of Modal
    print("Taking screenshot of Setup Modal...")
    page.screenshot(path="verification/analysis_setup_modal.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        print("Launching browser...")
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_analysis_mode(page)
            print("Verification successful!")
        except Exception as e:
            print(f"Verification failed: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()
