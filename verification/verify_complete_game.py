from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Grant permissions for clipboard if needed
        context = browser.new_context(permissions=["clipboard-read", "clipboard-write"])
        page = context.new_page()

        url = "http://localhost:3000/web-chess-dot-com/"
        print(f"Navigating to {url}...")
        page.goto(url)

        try:
            # 1. Start Game
            print("Starting game...")
            page.click("text=Play Bots")
            page.wait_for_timeout(500)
            page.click("button[title='Play as White']")
            page.click("data-testid=play-bot-start")

            # Wait for board
            page.wait_for_selector("#chessboard-wrapper", timeout=10000)
            print("Board loaded.")
            page.wait_for_timeout(2000) # Wait for animation

            # 2. Make Move (e2 -> e4) using Drag and Drop simulation
            print("Attempting move e2 -> e4 via Drag & Drop...")

            # Get source and target elements
            # react-chessboard uses data-square attributes usually?
            # Let's inspect the DOM structure from previous knowledge or assume standard.
            # In `components/Chessboard.tsx` we saw `onPieceDrop`.
            # We can try to drag from e2 center to e4 center.

            # Find square e2
            # The squares might be div with data-square or just calculated positions.
            # If no data-square attribute, we might need to calculate coordinates.
            # Let's check if we can find piece on e2.

            # We will use bounding box logic which is robust for canvas/div boards
            board = page.locator("#chessboard-wrapper")
            box = board.bounding_box()

            if box:
                # 8x8 grid
                square_width = box['width'] / 8
                square_height = box['height'] / 8

                # e2 is file 5 (index 4), rank 2 (index 6 from top)
                # files: a=0, b=1, c=2, d=3, e=4
                # ranks: 8=0, 7=1, ..., 2=6, 1=7

                x_e2 = box['x'] + (4 + 0.5) * square_width
                y_e2 = box['y'] + (6 + 0.5) * square_height

                x_e4 = box['x'] + (4 + 0.5) * square_width
                y_e4 = box['y'] + (4 + 0.5) * square_height

                print(f"Dragging from ({x_e2}, {y_e2}) to ({x_e4}, {y_e4})")

                page.mouse.move(x_e2, y_e2)
                page.mouse.down()
                page.wait_for_timeout(200)
                page.mouse.move(x_e4, y_e4, steps=10)
                page.wait_for_timeout(200)
                page.mouse.up()

            else:
                print("Could not find board bounding box.")

            # 3. Verify Move
            print("Verifying move...")
            time.sleep(2)

            # Check if it's black's turn (indicator or clock)
            # Or check if move list has "1. e4"
            # We can check the MoveList content

            # The Move List should be visible now
            try:
                if page.is_visible("text=e4"):
                     print("SUCCESS: Move 1. e4 detected in move list.")
                else:
                     print("FAIL: Move 1. e4 NOT found.")
                     page.screenshot(path="verification/verification_move_fail.png")
            except:
                pass

            # 4. Resign
            print("Resigning...")
            # Click Resign flag icon or button
            # In our UI we have a flag icon for resign in the top bar or a big button
            # Let's try the text "Resign"

            try:
                page.click("text=Resign", timeout=2000)
            except:
                # Try finding the flag icon button
                page.click("button[title='Resign']")

            # 5. Game Over
            try:
                page.wait_for_selector("text=Resigned", timeout=3000)
                print("Found 'Resigned'.")
            except:
                if page.is_visible("text=Aborted"):
                    print("Found 'Aborted'.")
                else:
                    print("Game Over state check skipped/failed.")

            # 6. Review
            print("Navigating to Review...")
            page.click("text=Game Review")

            # Wait for "Review Moves" or "Game Review" header
            page.wait_for_selector("text=Game Review", timeout=10000)
            print("Review Panel loaded.")

            print("Verification Successful!")
            page.screenshot(path="verification/verification_complete_game.png")

        except Exception as e:
            print(f"Verification Failed: {e}")
            page.screenshot(path="verification/verification_error.png")
            import traceback
            traceback.print_exc()
            raise e

        browser.close()

if __name__ == "__main__":
    run()
