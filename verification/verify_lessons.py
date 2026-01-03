from playwright.sync_api import sync_playwright

def verify_lessons(page):
    # Capture console logs
    page.on("console", lambda msg: print(f"Console: {msg.text}"))
    page.on("pageerror", lambda exc: print(f"Page Error: {exc}"))

    # 1. Navigate to the app (adjust port if necessary)
    print("Navigating...")
    page.goto("http://localhost:3000/web-chess-dot-com/")

    # 2. Wait for app to load
    print("Waiting for 'Chess.com' text...")
    page.wait_for_selector("text=Chess.com")

    # 3. Click on "Learn" in the sidebar
    print("Hovering Learn...")
    page.hover("text=Learn")

    # Wait for the flyout menu
    print("Waiting for Lessons option...")
    page.wait_for_selector("text=Lessons")

    # Click Lessons
    print("Clicking Lessons...")
    page.click("text=Lessons")

    # 5. Verify Lessons Interface loaded
    print("Waiting for Lessons Interface...")
    page.wait_for_selector("text=Lessons")
    page.wait_for_selector("text=Moving the Pieces")

    # 6. Click on a lesson
    print("Clicking a lesson...")
    page.click("text=Moving the Pieces")

    # 7. Verify Lesson View
    print("Waiting for Challenge text...")
    page.wait_for_selector("text=Challenge 1 of 2")

    # Take screenshot of Lesson View
    print("Taking screenshot...")
    page.screenshot(path="/home/jules/verification/lesson_view.png")

    print("Lesson view verified")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_lessons(page)
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="/home/jules/verification/error.png")
        finally:
            browser.close()
