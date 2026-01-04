from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            page.goto("http://localhost:3000/web-chess-dot-com/")
            page.screenshot(path="verification/simple_landing.png")
            content = page.content()
            print("Content length:", len(content))
            print("Contains Play Chess:", "Play Chess" in content)
        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    run()
