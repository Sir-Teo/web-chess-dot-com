from playwright.sync_api import sync_playwright

def verify_gameplay_polish():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1280, 'height': 800})
        page = context.new_page()

        # Navigate to the game
        print("Navigating to app...")
        page.goto("http://localhost:3000/web-chess-dot-com/")
        page.wait_for_load_state("networkidle")

        # In the screenshot, there is a "Play Bots" card.
        # It says "Play Bots" in bold white.
        print("Clicking 'Play Bots'...")
        # Try finding by text "Play Bots"
        try:
             page.click("text=Play Bots")
        except:
             # Maybe try to find the "Play" lightning button if Bots fails
             print("Play Bots text not clickable, trying general Play")
             page.click("text=Play")

        # Wait for bot selection panel
        print("Waiting for bot selection panel...")
        # The panel usually loads quickly.
        page.wait_for_timeout(2000)

        # 1. Verify Player Info Bar Polish (In Game) - START GAME
        print("Starting game...")
        # There is a data-testid="play-bot-start" button
        try:
            page.click("[data-testid='play-bot-start']", timeout=3000)
        except:
            print("Direct play button not found, selecting bot first...")
            # Maybe click on "Jimmy"
            try:
                page.click("text=Jimmy", timeout=2000)
                page.click("[data-testid='play-bot-start']")
            except:
                print("Could not start bot game.")

        # Wait for game to start
        print("Waiting for game start...")
        page.wait_for_selector("button[title='Resign']", timeout=10000)
        page.wait_for_timeout(2000)

        print("Taking screenshot of Game Interface (Player Info)...")
        page.screenshot(path="verification/2_game_interface.png")

        # 2. Verify Move List Polish
        print("Making a move e2->e4...")
        board = page.locator("#chessboard-wrapper")
        box = board.bounding_box()

        if box:
            x = box['x']
            y = box['y']
            w = box['width']
            h = box['height']

            square_w = w / 8
            square_h = h / 8

            # e2 center (file 4, rank 6 from top 0-indexed) -> e2
            start_x = x + (4 * square_w) + (square_w / 2)
            start_y = y + (6 * square_h) + (square_h / 2)

            # e4 -> col 4, row 4
            end_x = x + (4 * square_w) + (square_w / 2)
            end_y = y + (4 * square_h) + (square_h / 2)

            page.mouse.move(start_x, start_y)
            page.mouse.down()
            page.mouse.move(end_x, end_y)
            page.mouse.up()

            page.wait_for_timeout(2000)

        print("Taking screenshot of Move List...")
        page.screenshot(path="verification/3_move_list.png")

        # 3. Game Over Modal
        print("Resigning...")
        page.click("button[title='Resign']")

        print("Waiting for Game Over modal...")
        page.wait_for_selector("text=Game Over", timeout=5000)
        page.wait_for_timeout(1000)

        print("Taking screenshot of Game Over modal...")
        page.screenshot(path="verification/4_game_over_polish.png")

        browser.close()

if __name__ == "__main__":
    verify_gameplay_polish()
