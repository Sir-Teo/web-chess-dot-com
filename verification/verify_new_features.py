from playwright.sync_api import sync_playwright, expect
import time

def verify_features(page):
    print("Navigating to home...")
    page.goto("http://localhost:3000/web-chess-dot-com/")

    # In the screenshot, the "Play Bots" card is visible.
    print("Clicking Play Bots...")
    page.get_by_text("Play Bots").first.click()

    print("Selecting Bot...")
    # Wait for bots panel
    # The Play button has data-testid="play-bot-start"
    page.wait_for_selector("[data-testid='play-bot-start']", timeout=10000)
    page.locator("[data-testid='play-bot-start']").click()

    print("Waiting for game to start...")
    # Wait for board
    # In react-chessboard, pieces are SVGs or images.
    # The screenshot shows pieces.
    # Maybe alt text is different or pieces are not images.
    # Let's wait for the "Game vs Martin" text in sidebar which confirms game start.
    page.wait_for_selector("text=Game vs Martin", timeout=10000)

    # 2. Check for Bot Chat
    print("Checking for Bot Chat Bubble...")
    try:
        # Chat might take a second to appear
        page.wait_for_selector("text=Good luck! Have fun.", timeout=5000)
        print("Bot Chat Bubble found!")
    except:
        print("Bot Chat Bubble NOT found.")

    page.screenshot(path="verification/1_bot_game_chat.png")

    # 4. Resign and Review
    print("Resigning...")
    page.get_by_title("Resign").click()

    # Check Game Over overlay
    page.wait_for_selector("text=Game Review", timeout=10000)

    print("Clicking Game Review...")
    page.get_by_role("button", name="Game Review").click()

    # 5. Check Review Panel for Graph and Opening
    print("Checking Review Panel...")
    page.wait_for_selector("text=Game Review", timeout=10000)

    # Check for Graph (SVG)
    # The graph is an SVG inside a div
    if page.locator("svg").count() > 0:
        print("Graph SVG found.")
    else:
        print("Graph SVG NOT found.")

    page.screenshot(path="verification/2_game_review.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_features(page)
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()
