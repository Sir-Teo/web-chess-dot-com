
import time
from playwright.sync_api import sync_playwright

def verify_analysis_settings():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate directly to analysis tab via hash
        page.goto("http://localhost:3000/web-chess-dot-com/#analysis")

        # Wait for Analysis panel to load
        try:
            page.wait_for_selector("text=Stockfish", timeout=10000)
        except:
            print("Analysis panel not loaded")
            page.screenshot(path="verification/analysis_load_fail.png")
            return

        time.sleep(2)

        # Click the settings button.
        # The previous error showed there are 2 settings buttons.
        # One is likely in the Sidebar (Global Settings), one in the Analysis Panel (Engine Settings).
        # We want the one in the Analysis Panel.

        # The Analysis Panel button is likely inside the div with class "bg-[#211f1c]" or similar header structure.
        # Or we can just grab the second one since the sidebar is usually first in DOM or we can scope it.

        try:
             # Find the settings button specifically in the analysis panel header
             # The header has "Stockfish 16 (Lite)" text
             # We can traverse from that text to the parent, then find the button.

             # Locate the header containing Stockfish text
             header = page.locator("div", has_text="Stockfish 16 (Lite)").last

             # Inside this header, find the button with the settings icon
             settings_btn = header.locator("button").filter(has=page.locator("svg.lucide-settings"))

             if settings_btn.count() > 0:
                 settings_btn.click()
             else:
                 print("Could not find specific settings button, trying by index on page")
                 # The error said there were 2. The second one (index 1) looked like the analysis one based on class
                 # <button class="p-1.5 rounded text-gray-400 hover:text-white bg-[#302e2b]">
                 page.locator("button").filter(has=page.locator("svg.lucide-settings")).nth(1).click()

        except Exception as e:
            print(f"Failed to click settings: {e}")
            page.screenshot(path="verification/click_failed.png")
            return

        time.sleep(1)

        # Verify modal is open
        if page.is_visible("text=Analysis Settings"):
            print("Settings modal opened successfully")
        else:
            print("Settings modal did not open")
            page.screenshot(path="verification/modal_fail.png")
            return

        # Take a screenshot of the modal
        page.screenshot(path="verification/analysis_settings_modal.png")

        # Interact with settings
        try:
            # Change lines to 5
            ranges = page.locator("input[type=range]")
            ranges.nth(0).fill("5")

            # Change Threads to 2
            if ranges.count() > 1:
                ranges.nth(1).fill("2")

            # Change Hash to 64MB
            page.select_option("select", "64")

            time.sleep(1)

            # Save
            page.click("text=Save Changes")

            time.sleep(1)

            # Verify modal closed
            if not page.is_visible("text=Analysis Settings"):
                print("Settings modal closed successfully")
            else:
                print("Settings modal did not close")

        except Exception as e:
            print(f"Interaction failed: {e}")

        browser.close()

if __name__ == "__main__":
    verify_analysis_settings()
