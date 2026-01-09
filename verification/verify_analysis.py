
from playwright.sync_api import sync_playwright, expect

def test_analysis_lines():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Capture console logs
        page.on("console", lambda msg: print(f"Console: {msg.text}"))
        page.on("pageerror", lambda err: print(f"Page Error: {err}"))

        try:
            # Navigate
            page.goto("http://localhost:3000/web-chess-dot-com/#analysis")

            # Wait for board
            expect(page.locator("#chessboard-wrapper")).to_be_visible(timeout=10000)

            # Check for header
            expect(page.get_by_text("Stockfish 16 (Lite)")).to_be_visible(timeout=5000)

            # Wait for lines - Use a simpler text search to debug
            # Wait for ANY text in the lines container
            # The container has class "min-h-[100px]"
            # If empty, it says "Calculating..."

            # Check if "Calculating..." is visible
            calc_locator = page.get_by_text("Calculating...")
            if calc_locator.is_visible():
                print("Calculating... is visible")

            # Wait for "Calculating..." to DISAPPEAR (implies lines arrived)
            # OR wait for a score
            # Let's wait for a score span
            score_selector = "span.text-green-400, span.text-white" # We use text-white for moderate scores

            # We can also check if lines.length > 0 by looking for the row container
            # The row has "hover:bg-white/5"
            # selector: .group.hover\:bg-white\/5

            print("Waiting for analysis lines...")
            page.wait_for_selector(".group", timeout=20000)
            print("Lines found!")

            # Take screenshot
            page.screenshot(path="/home/jules/verification/analysis_lines.png")
            print("Verification screenshot taken at /home/jules/verification/analysis_lines.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="/home/jules/verification/error_screenshot.png")
            print("Error screenshot taken at /home/jules/verification/error_screenshot.png")
        finally:
            browser.close()

if __name__ == "__main__":
    test_analysis_lines()
