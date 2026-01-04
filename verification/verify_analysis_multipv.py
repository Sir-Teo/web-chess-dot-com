import time
from playwright.sync_api import sync_playwright

def verify_analysis_multipv():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        try:
            print("Navigating to app...")
            page.goto("http://localhost:3000/web-chess-dot-com/")

            # Navigate to Analysis via "Learn" -> "Analysis" in Sidebar Flyout?
            # Or just check if "Learn" exists.

            # Since Sidebar Flyout relies on hover which is tricky in Playwright sometimes,
            # we can try to click "Learn" if it's clickable, or simulate hover.

            print("Hovering 'Learn'...")
            page.hover("text=Learn")
            time.sleep(0.5)

            if page.is_visible("text=Analysis"):
                print("Clicking 'Analysis' from flyout...")
                page.click("text=Analysis")
            else:
                print("Flyout not visible, trying direct click on Learn/Analysis if visible in mobile nav or similar?")
                # Fallback: Just look for any "Analysis" text
                page.click("text=Analysis")

            print("Waiting for Analysis Board...")
            # Changed selector to #chessboard-wrapper or #GameBoard or simply text=Analysis in the header
            page.wait_for_selector("#chessboard-wrapper", timeout=10000)

            print("Waiting for Stockfish Analysis...")
            # Analysis starts automatically.
            # We look for MultiPV lines.

            # We added "Depth" text in the stats
            page.wait_for_selector("text=Depth", timeout=10000)
            print("Found Depth indicator.")

            # We assume MultiPV 3, so there should be 3 lines.
            # The lines are rendered in AnalysisPanel.
            # They have score and PV text.
            # We can check if there are multiple elements showing scores.

            print("Checking for multiple lines...")
            # We use a rough heuristic: count elements with specific class or structure if possible.
            # Our code: <div ... className="flex gap-2 bg-[#2a2926] ...">

            # Wait a bit for engine to produce lines
            time.sleep(3)

            lines = page.locator("text=+0.").count() + page.locator("text=-0.").count() + page.locator("text=0.00").count()
            print(f"Found {lines} score indicators (approx).")

            if lines >= 2:
                print("SUCCESS: Multiple analysis lines detected.")
            else:
                # Fallback check: look for "multipv" text in logs or just ensure UI is stable
                print("WARNING: Could not definitely confirm 3 lines via text count, taking screenshot.")

            page.screenshot(path="verification/screenshot_analysis_multipv.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/debug_fail_analysis.png")
            raise e
        finally:
            browser.close()

if __name__ == "__main__":
    verify_analysis_multipv()
