from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the app
        page.goto("http://localhost:3000/web-chess-dot-com/")
        page.wait_for_load_state("networkidle")

        # 1. Verify Home Page Load
        print("Home page loaded.")
        page.screenshot(path="verification/home_page.png")

        # 2. Start Bot Game
        # Click "Play Bots" on the dashboard
        page.get_by_text("Play Bots").first.click()

        # Now we are in the Bots panel.
        # Wait for "Choose your opponent" or check for bot list.
        # The PlayBotsPanel renders bot categories.
        # Let's wait for a bot name, e.g., "Jimmy" or just wait for the panel.
        page.wait_for_selector(".overflow-y-auto") # Wait for scroll area

        # Choose "Jimmy" or any visible bot button
        # The bot list items are buttons.
        page.get_by_role("button", name="Jimmy").first.click()

        # Click Start Game (Choose button became "Choose", then "Play"?)
        # Logic in PlayBotsPanel: Clicking a bot selects it. Then "Choose" button at bottom?
        # No, clicking the bot item usually selects it.
        # Let's look for the big "Choose" button at the bottom right or similar.
        # Or maybe "Play" button.
        page.get_by_text("Choose").click()

        # Now clicking "Start Game" if strictly following flow?
        # Actually usually clicking "Choose" enters the game setup or starts it?
        # In GameInterface.tsx: handleStartBotGame is called.
        # Let's check if the board wrapper appears.

        # Wait for board - if "Choose" starts it immediately.
        try:
             page.wait_for_selector("#chessboard-wrapper", timeout=3000)
        except:
             # Maybe "Start Game" is needed
             if page.get_by_text("Start Game").count() > 0:
                 page.get_by_text("Start Game").click()
             else:
                 # Check if we need to click "Play"
                 if page.get_by_text("Play").count() > 0:
                      page.get_by_text("Play").click()

        page.wait_for_selector("#chessboard-wrapper")
        print("Bot game started.")
        page.screenshot(path="verification/bot_game_start.png")

        # 3. Verify Coach Mode
        # Toggle Coach Mode
        page.get_by_role("button", name="Coach").click()
        page.wait_for_timeout(500)
        page.screenshot(path="verification/coach_mode_active.png")
        print("Coach mode toggled.")

        # 4. Resign and Review
        page.get_by_title("Resign").click()
        # Confirm resignation (Game Over overlay appears)
        # Click "Game Review"
        page.get_by_text("Game Review").click()

        # Wait for Game Review panel
        page.wait_for_selector("text=Game Review", timeout=10000)
        print("Entered Game Review.")
        page.screenshot(path="verification/game_review.png")

        # 5. Analysis Mode
        # Switch tab to Analysis
        page.get_by_text("Analysis").click()

        # Wait for Stockfish indicator
        page.wait_for_selector("text=Stockfish 16")
        print("Entered Analysis Mode.")

        # Check for Threats toggle button
        threats_btn = page.get_by_title("Show Threats")
        if threats_btn.count() > 0:
            print("Threats toggle found.")

        page.screenshot(path="verification/analysis_mode.png")

        browser.close()

if __name__ == "__main__":
    run()
