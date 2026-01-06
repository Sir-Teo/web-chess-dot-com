from playwright.sync_api import sync_playwright, expect
import time

def verify_puzzles():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        try:
            base_url = "http://localhost:3000/web-chess-dot-com/"
            print(f"Navigating to {base_url}...")
            page.goto(base_url)

            page.wait_for_selector("text=Chess.com")

            print("Navigating to Puzzles...")
            page.get_by_role("button", name="Puzzles").first.click()

            print("Waiting for Puzzles Interface...")
            page.wait_for_selector("text=Puzzles", timeout=10000)

            # ------------------------------------------------------------------
            # Verify Puzzle 1 (Mate in 1)
            # ------------------------------------------------------------------
            print("--- Verifying Puzzle 1 (Mate in 1) ---")
            expect(page.get_by_text("White to Move")).to_be_visible(timeout=5000)

            # Move h5 -> f7
            print("Attempting move h5 -> f7")
            page.locator("div[data-square='h5']").click()
            time.sleep(0.3)
            page.locator("div[data-square='f7']").click()

            print("Waiting for feedback...")
            expect(page.get_by_text("Excellent!")).to_be_visible(timeout=5000)

            # ------------------------------------------------------------------
            # Verify Puzzle 2 (Back Rank Mate)
            # ------------------------------------------------------------------
            print("--- Verifying Puzzle 2 ---")
            page.get_by_role("button", name="Next Puzzle").click()

            # Wait for board to update/feedback to clear
            expect(page.get_by_text("Excellent!")).not_to_be_visible(timeout=2000)
            # Expect "White to Move"

            # FEN: 6k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1
            # Move: e1e8

            print("Attempting move e1 -> e8")
            page.locator("div[data-square='e1']").click()
            time.sleep(0.3)
            page.locator("div[data-square='e8']").click()

            expect(page.get_by_text("Excellent!")).to_be_visible(timeout=5000)

            # ------------------------------------------------------------------
            # Verify Puzzle 3 (Opening)
            # ------------------------------------------------------------------
            print("--- Verifying Puzzle 3 ---")
            page.get_by_role("button", name="Next Puzzle").click()
            expect(page.get_by_text("Excellent!")).not_to_be_visible(timeout=2000)

            # Puzzle 3 is Black to move. d8 -> f6.
            # FEN: r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P1Q1/8/PPPP1PPP/RNB1K1NR b KQkq - 3 4

            print("Attempting move d8 -> f6")
            page.locator("div[data-square='d8']").click()
            time.sleep(0.3)
            page.locator("div[data-square='f6']").click()

            expect(page.get_by_text("Excellent!")).to_be_visible(timeout=5000)

            # ------------------------------------------------------------------
            # Verify Puzzle 4 (Multi-move Mate in 2)
            # ------------------------------------------------------------------
            print("--- Verifying Puzzle 4 (Multi-move) ---")
            page.get_by_role("button", name="Next Puzzle").click()
            expect(page.get_by_text("Excellent!")).not_to_be_visible(timeout=2000)

            # FEN: r5k1/5ppp/8/8/4Q3/8/5PPP/4R1K1 w - - 0 1
            # Moves: 1. Qe8+ Rxe8 2. Rxe8#
            # User: e4 -> e8
            # Opponent: a8 -> e8 (auto)
            # User: e1 -> e8

            print("Step 1: User moves e4 -> e8")
            page.locator("div[data-square='e4']").click()
            time.sleep(0.3)
            page.locator("div[data-square='e8']").click()

            # Expect NO "Excellent!" yet, but NO "Incorrect"
            time.sleep(0.5)
            # Verify feedback is NOT visible (game continues)
            expect(page.get_by_text("Excellent!")).not_to_be_visible()
            expect(page.get_by_text("That is not the correct move")).not_to_be_visible()

            # Wait for opponent move (auto).
            # Opponent moves a8->e8.
            # We can check if piece at e8 is now a black rook? Or just proceed.
            # Wait for animation delay (500ms)
            time.sleep(1.0)

            print("Step 2: User moves e1 -> e8")
            page.locator("div[data-square='e1']").click()
            time.sleep(0.3)
            page.locator("div[data-square='e8']").click()

            # Now we expect success
            print("Waiting for success feedback...")
            expect(page.get_by_text("Excellent!")).to_be_visible(timeout=5000)

            page.screenshot(path="verification/puzzle_multimove_complete.png")
            print("Captured puzzle_multimove_complete.png")

            print("All Puzzles Verified Successfully!")

        except Exception as e:
            print(f"Test Failed: {e}")
            page.screenshot(path="verification/puzzle_failure.png")
            raise e
        finally:
            browser.close()

if __name__ == "__main__":
    verify_puzzles()
