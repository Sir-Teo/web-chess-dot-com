import time
from playwright.sync_api import sync_playwright, expect

def verify_puzzles():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Use larger viewport to ensure sidebar is visible
        context = browser.new_context(viewport={"width": 1280, "height": 720})
        page = context.new_page()

        # Print console logs
        page.on("console", lambda msg: print(f"BROWSER: {msg.text}"))

        print("Navigating to app...")
        page.goto("http://localhost:3000/web-chess-dot-com/")

        # 1. Navigate to Puzzles
        print("Clicking Puzzles in sidebar...")
        try:
             page.locator("button").filter(has_text="Puzzles").first.click()
        except:
            print("Failed to click Puzzles button. Trying generic text click...")
            try:
                page.get_by_text("Puzzles", exact=True).first.click()
            except:
                print("Failed to find Puzzles link. Taking screenshot...")
                page.screenshot(path="verification/fail_puzzles_nav.png")
                raise

        # 2. Verify Puzzle 1 (Single Move)
        print("Verifying Puzzle 1...")
        expect(page.get_by_text("White to Move")).to_be_visible()
        expect(page.get_by_text("Mate in 1")).to_be_visible()

        print("Executing move h5-f7...")
        try:
             page.locator("[data-square='h5']").click()
             time.sleep(0.5)
             page.locator("[data-square='f7']").click()
        except:
             print("Failed to click squares. Taking screenshot...")
             page.screenshot(path="verification/fail_puzzle_move.png")
             raise

        print("Checking for success...")
        try:
            expect(page.get_by_role("button", name="Next Puzzle")).to_be_visible(timeout=5000)
        except:
            print("Failed to solve Puzzle 1. Taking screenshot...")
            page.screenshot(path="verification/fail_puzzle_1_solve.png")
            raise

        print("Puzzle 1 Solved!")
        page.get_by_role("button", name="Next Puzzle").click()


        # 3. Verify Puzzle 2 (Single Move)
        print("Verifying Puzzle 2...")
        expect(page.get_by_text("Back Rank Mate")).to_be_visible()

        print("Executing move e1-e8...")
        page.locator("[data-square='e1']").click()
        time.sleep(0.5)
        page.locator("[data-square='e8']").click()

        expect(page.get_by_role("button", name="Next Puzzle")).to_be_visible()
        print("Puzzle 2 Solved!")
        page.get_by_role("button", name="Next Puzzle").click()


        # 4. Verify Puzzle 3 (Multi-Move Mate in 2)
        print("Verifying Puzzle 3 (Multi-move)...")
        expect(page.get_by_text("Mate in 2 (Sacrifice)")).to_be_visible()

        # Sequence:
        # 1. e2e8 (User)
        # 2. d8e8 (Opponent Auto)
        # 3. d1e8 (User)

        print("Executing Move 1: e2-e8")
        page.locator("[data-square='e2']").click()
        time.sleep(0.5)
        page.locator("[data-square='e8']").click()

        # Wait for opponent move (d8e8)
        print("Waiting for opponent move...")

        try:
            expect(page.locator(".cursor-wait")).not_to_be_visible(timeout=5000)
        except:
            print("Timed out waiting for opponent move overlay to clear.")

        time.sleep(1.0) # Extra buffer

        print("Executing Move 2: d1-e8")

        page.locator("[data-square='d1']").click()
        time.sleep(0.5) # Wait for selection
        page.locator("[data-square='e8']").click()

        # Check result
        try:
             expect(page.get_by_role("button", name="Next Puzzle")).to_be_visible(timeout=5000)
        except:
             print("Failed to solve Puzzle 3. Taking screenshot...")
             page.screenshot(path="verification/fail_puzzle_3_solve.png")
             raise

        print("Puzzle 3 Solved!")

        page.screenshot(path="verification/puzzle_success.png")
        print("All puzzles verified.")
        browser.close()

if __name__ == "__main__":
    verify_puzzles()
