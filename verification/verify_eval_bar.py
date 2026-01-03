from playwright.sync_api import sync_playwright

def verify_evaluation_bar():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the app
        page.goto("http://localhost:3000")

        # Click "Play Bots" in Dashboard
        # "Play Bots" is the bold text inside the button
        page.click("text=Play Bots")

        # Now inside PlayBotsPanel
        # By default "Beginner" category is expanded and "Martin" is selected.
        # We should see the "Play" button at the bottom.
        # It's a large button with text "Play"

        # Wait for "Play" button
        # There might be multiple "Play" texts (e.g. in the sidebar).
        # The button has class bg-[#81b64c]
        page.wait_for_selector("button.bg-\\[\\#81b64c\\]", timeout=10000)

        # Click Play
        page.click("button.bg-\\[\\#81b64c\\]")

        # Game should start.
        # Viewport size for desktop to show eval bar
        page.set_viewport_size({"width": 1280, "height": 720})

        # Wait for eval bar.
        # It has "hidden lg:block absolute ..."
        # And contains text like "+0.0" or "0.0" or similar.
        # Let's wait for the element that contains text "0.0"
        page.wait_for_selector("text=0.0", timeout=10000)

        # Take screenshot
        page.screenshot(path="verification/eval_bar.png")

        browser.close()

if __name__ == "__main__":
    verify_evaluation_bar()
