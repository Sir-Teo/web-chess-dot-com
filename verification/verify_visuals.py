from playwright.sync_api import sync_playwright
import time

def verify_visuals():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1280, 'height': 800})
        page = context.new_page()

        print("Navigating to app...")
        page.goto("http://localhost:3000/web-chess-dot-com/")
        page.wait_for_load_state("networkidle")

        # 1. Start Bot Game
        print("Starting Bot Game...")
        page.click("text=Play Bots")
        page.wait_for_timeout(500)
        # Assuming PlayBotsPanel is open, we need to click "Choose" on Martin or similar
        # Based on verify_complete_game.py, we have:
        page.click("button[title='Play as White']")
        page.click("data-testid=play-bot-start")

        print("Waiting for game start...")
        page.wait_for_selector("#chessboard-wrapper", timeout=10000)

        # 2. Make Moves (e2-e4)
        print("Making move e2-e4...")
        board = page.locator("#chessboard-wrapper")
        box = board.bounding_box()
        if box:
            square_width = box['width'] / 8
            square_height = box['height'] / 8
            # e2 (file 4, rank 6 from top) -> e4 (file 4, rank 4 from top)
            x_e2 = box['x'] + (4 + 0.5) * square_width
            y_e2 = box['y'] + (6 + 0.5) * square_height
            x_e4 = box['x'] + (4 + 0.5) * square_width
            y_e4 = box['y'] + (4 + 0.5) * square_height

            page.mouse.move(x_e2, y_e2)
            page.mouse.down()
            page.mouse.move(x_e4, y_e4, steps=10)
            page.mouse.up()
            time.sleep(2) # Wait for bot response

        # 3. Resign
        print("Resigning...")
        try:
            page.click("text=Resign", timeout=2000)
        except:
            page.click("button[title='Resign']")

        time.sleep(1)

        # 4. Game Review
        print("Going to Review...")
        page.get_by_role("button", name="Game Review").click()

        # Wait for analysis
        time.sleep(5)

        # Screenshot Review
        print("Taking Review Screenshot...")
        page.screenshot(path="verification/review_panel.png")

        # 5. Analysis Mode
        print("Going to Analysis...")
        # Scroll to bottom if needed to find button
        try:
            page.get_by_role("button", name="Review Moves").click()
        except:
             # Maybe "Analysis" tab button?
             page.click("text=Analysis")

        time.sleep(2)

        # Screenshot Analysis
        print("Taking Analysis Screenshot...")
        page.screenshot(path="verification/analysis_mode.png")

        browser.close()

if __name__ == "__main__":
    verify_visuals()
