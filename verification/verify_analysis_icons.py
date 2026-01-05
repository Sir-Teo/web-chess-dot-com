
import re
from playwright.sync_api import Page, expect, sync_playwright

def test_analysis_icons(page: Page):
    # 1. Navigate to the app
    page.goto("http://localhost:3000/web-chess-dot-com/")

    # 2. Wait for the app to load
    page.wait_for_selector("text=Play Bots")

    # 3. Start a bot game (using Play Bots)
    page.get_by_text("Play Bots").click()

    # Wait for bot selection and Play button
    page.wait_for_selector("text=Mittens") # Wait for default bot or similar
    # Click "Play" (ensure it's the specific Play button for the bot or main action)
    page.get_by_test_id("play-bot-start").click()

    # 4. Play a few moves to generate history
    page.wait_for_selector("#chessboard-wrapper")

    # Attempt to make a move e2-e4 by clicking squares
    # Since visual board, we try to use data-square if available, otherwise just resign.
    # We need a move for analysis to be meaningful.
    try:
        # Assuming standard board setup
        page.locator('[data-square="e2"]').click()
        page.locator('[data-square="e4"]').click()
        page.wait_for_timeout(2000) # Wait for bot response
    except Exception as e:
        print(f"Could not make move: {e}")

    # 5. Resign
    # In GameInterface, Resign button has title="Resign"
    print("Resigning...")
    page.click("button[title='Resign']")

    # Wait for Game Over modal to appear
    page.wait_for_selector("text=Game Over")

    # 6. Click "Game Review"
    page.get_by_role("button", name="Game Review").click()

    # 7. Wait for Analysis to load
    page.wait_for_selector("text=Analysis")

    # 8. Wait for Analysis Data
    # Look for "Stockfish 16" text in panel
    page.wait_for_selector("text=Stockfish 16")

    # Wait for analysis progress
    page.wait_for_timeout(5000)

    # 9. Verify Icons exist (optional check, visual screenshot is main)
    # Icons might be SVGs inside the MoveList buttons
    # Just take screenshot

    page.screenshot(path="verification/analysis_icons.png")
    print("Screenshot taken at verification/analysis_icons.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            test_analysis_icons(page)
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()
