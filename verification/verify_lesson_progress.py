from playwright.sync_api import sync_playwright, expect
import time

def verify_dashboard_update(page):
    # 1. Navigate to Dashboard
    page.goto("http://localhost:3000/web-chess-dot-com/")

    # Wait for dashboard to load (look for user name)
    expect(page.get_by_text("MasterTeo1205")).to_be_visible()

    # 2. Check "Next Lesson" card
    # Initially it should be "Moving the Pieces" (first lesson) or "Opening Principles" if hardcoded was kept
    # The code sets it to nextLesson.title.
    # LESSONS[0] is "Moving the Pieces".

    # Let's take a screenshot of the Dashboard
    page.screenshot(path="verification/dashboard_initial.png")
    print("Screenshot saved: verification/dashboard_initial.png")

    # 3. Navigate to Lessons
    page.get_by_text("Next Lesson").click()
    # Expect to be on lessons page
    expect(page.get_by_role("heading", name="Lessons")).to_be_visible()
    expect(page.get_by_text("Moving the Pieces")).to_be_visible()

    # 4. Simulate completing the first lesson
    # We can't easily simulate all moves in headless quickly without complex logic.
    # Instead, we will simulate the "localStorage" update via script execution
    # effectively bypassing the gameplay but verifying the Dashboard reacts to storage.

    lesson_id = "moving-pieces"
    page.evaluate(f"window.localStorage.setItem('chess_lesson_progress', JSON.stringify(['{lesson_id}']))")

    # Reload page to pick up storage change (or navigate back)
    page.goto("http://localhost:3000/web-chess-dot-com/")
    expect(page.get_by_text("MasterTeo1205")).to_be_visible()

    # 5. Check "Next Lesson" card again
    # Should now be the second lesson: "Basic Tactics"
    expect(page.get_by_text("Basic Tactics")).to_be_visible()

    page.screenshot(path="verification/dashboard_updated.png")
    print("Screenshot saved: verification/dashboard_updated.png")

    # 6. Verify "Start New Game" button in Daily Games section
    # Find the button "Start New Game" in Daily Games (right col)
    # It's unique enough
    daily_start_btn = page.get_by_role("button", name="Start New Game")
    daily_start_btn.click()

    # Should navigate to Play
    expect(page.get_by_role("heading", name="Play Chess")).to_be_visible()
    expect(page.get_by_text("New Game")).to_be_visible()

    page.screenshot(path="verification/play_navigation.png")
    print("Screenshot saved: verification/play_navigation.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_dashboard_update(page)
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()
