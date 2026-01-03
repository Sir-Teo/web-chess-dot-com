
import pytest
from playwright.sync_api import sync_playwright, expect

def verify_bot_feature():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to app
        page.goto("http://localhost:3000/web-chess-dot-com/")

        # Click Play Bots from Dashboard
        page.click("text=Play Bots")

        # Wait for Bot Panel
        page.wait_for_selector("text=Play Bots")

        # Verify Bot Panel has color selection
        expect(page.locator("button[title='Play as White']")).to_be_visible()
        expect(page.locator("button[title='Play as Black']")).to_be_visible()
        expect(page.locator("button[title='Random Side']")).to_be_visible()

        # Select Black
        page.click("button[title='Play as Black']")

        # Click Play
        page.click("[data-testid='play-bot-start']")

        # Wait for game start and engine move
        page.wait_for_selector("#chessboard-wrapper")

        # Check if engine moved (white pawn at e3/e4/d3/d4)
        # We wait a bit for engine
        page.wait_for_timeout(3000)

        # Take screenshot of the game as black
        page.screenshot(path="verification/verification_black_bot.png")
        print("Screenshot saved to verification/verification_black_bot.png")

        browser.close()

if __name__ == "__main__":
    verify_bot_feature()
