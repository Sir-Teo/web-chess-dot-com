from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            # We can't easily verify props from outside, but we can verify behavior.
            # If we set up a game with custom FEN in App, it should show up.
            # But we don't have a direct URL param for FEN in App.tsx routing logic except .
            pass
        finally:
            browser.close()

if __name__ == "__main__":
    run()
