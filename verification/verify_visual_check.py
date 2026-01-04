from playwright.sync_api import sync_playwright
import time

def verify_visuals():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1280, 'height': 800})
        page = context.new_page()

        # Listen for console logs
        page.on("console", lambda msg: print(f"CONSOLE: {msg.text}"))
        page.on("pageerror", lambda err: print(f"PAGE ERROR: {err}"))

        # 1. Load the app
        print("Loading app...")
        try:
            page.goto("http://localhost:3000/web-chess-dot-com/")
            # Wait for "Play Bots" instead of "Play Chess"
            page.wait_for_selector('text=Play Bots', timeout=10000)
        except Exception as e:
            print(f"FAILED TO LOAD: {e}")
            page.screenshot(path="verification/error_state.png")
            browser.close()
            return

        print("Dashboard loaded.")

        # 2. Go to Play Bots
        print("Navigating to Bot selection...")
        page.click('text=Play Bots')
        time.sleep(1)

        # 3. Select Mittens
        # Assuming Mittens is in the list.
        # Check if Mittens is visible
        try:
            # Scroll down just in case
            page.evaluate("document.querySelector('.overflow-y-auto').scrollTop = 5000")
            time.sleep(0.5)
        except:
            pass

        # Take screenshot of Bot Selection
        page.screenshot(path="verification/bots_selection.png")
        print("Captured bots_selection.png")

        # Select Mittens
        # Assuming the name "Mittens" appears
        try:
           page.click('text=Mittens')
           print("Selected Mittens")
           time.sleep(0.5)
           # Click Choose/Play
           page.click('button:has-text("Choose")')
           time.sleep(0.5)
           page.click('button:has-text("Play")')
           print("Started Game")
           time.sleep(2)
           page.screenshot(path="verification/game_started.png")
        except Exception as e:
           print(f"Could not start game with Mittens: {e}")
           # Try generic
           try:
             page.click('text=Martin')
             page.click('button:has-text("Choose")')
             page.click('button:has-text("Play")')
             time.sleep(2)
             page.screenshot(path="verification/game_started.png")
           except:
             pass

        browser.close()

if __name__ == "__main__":
    verify_visuals()
