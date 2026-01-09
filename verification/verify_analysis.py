import time
from playwright.sync_api import sync_playwright

def verify_analysis():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # Navigate to the analysis page (assuming there's a route or button)
        # Since I added features to AnalysisInterface, I'll navigate to it.
        # It's likely routed via App.tsx but specific route might be tricky if not default.
        # But I can use hash routing if supported or just default path if it defaults to Dashboard then I click "Analysis" or similar?
        # App.tsx usually has routes. Based on memory,  handles view.
        # Let's try to find a way to reach Analysis.
        # Actually, I can use the hash param #analysis if supported, or just verify the components if I can reach them.

        # Checking App.tsx (memory or read?)
        # Memory says: "The transition from gameplay to analysis is handled by App.tsx... mounts AnalysisInterface with initialPgn prop."
        # Also "OpeningsInterface implements... 'Analyze' triggers the onAnalyze callback".

        # Let's try navigating to root and looking for "Analysis" or "Tools" -> "Analysis".
        # Or I can try the  path.

        page.goto("http://localhost:3000/web-chess-dot-com/")

        # Wait for page load
        page.wait_for_timeout(3000)

        # Check if we can find a link to analysis
        # "ExplorerPanel" is in AnalysisInterface.
        # Maybe I can reach it via sidebar "Analysis" (if it exists)
        # Or clicking "Review" button after a game.

        # Try to find sidebar item "Analysis" or "Tools"
        # If not, try to start a game and resign and review.

        # Let's try clicking "Play Bots" -> Start -> Resign -> Review
        # This covers GameReviewPanel and AnalysisPanel.

        # 1. Click Play Bots (Sidebar)
        page.get_by_role("button", name="Play Bots").click()
        page.wait_for_timeout(1000)

        # 2. Click Play (PlayBotsPanel)
        page.get_by_test_id("play-bot-start").click()
        page.wait_for_timeout(2000)

        # 3. Resign (GameInterface)
        # Resign button is usually a flag icon or "Resign".
        # Find flag icon button.
        page.locator("button.bg-neutral-700").first.click() # Guessing selector for controls? No.
        # Let's look for "Resign" text or aria-label.
        # Or just make moves until game over? Resign is faster.
        # The resign button has flag icon.
        # Let's try to click the button with title "Resign" or similar.
        # If not found, I'll try to find the generic "Resign" text in modal if it appears.

        # Actually, let's try to verify the UI without full game flow if possible.
        # Is there a direct route?
        # Memory: "Sidebar component directs 'Tournaments' ... 'Daily Puzzle' ... 'Multiplayer'".
        # Doesn't mention 'Analysis' in sidebar explicitly.

        # Let's try the URL hash approach?
        # Memory: "App.tsx ... validates and maps URL hash parameters ... to activeTab".
        # But  is for internal tabs like "puzzles".
        #  handles mode.

        # Let's stick to the Game -> Resign -> Review flow.

        # Finding Resign button:
        # It's usually in the controls area.
        #  has controls.
        # Button with Flag icon.
        # Let's try ? No text usually.
        #

        page.locator("button:has(svg.lucide-flag)").click()
        page.wait_for_timeout(1000)

        # Confirm Resign (Modal)
        page.get_by_role("button", name="Resign", exact=True).click()
        page.wait_for_timeout(1000)

        # Game Over Modal appears.
        # Click "Game Review" button.
        page.get_by_role("button", name="Game Review").click()
        page.wait_for_timeout(2000)

        # Now we should be in AnalysisInterface.
        # Verify "Analysis", "Review", "Explorer" tabs exist.
        page.get_by_text("Analysis").click()
        page.wait_for_timeout(1000)
        page.screenshot(path="verification/analysis_tab.png")

        page.get_by_text("Review").click()
        page.wait_for_timeout(1000)
        page.screenshot(path="verification/review_tab.png")

        page.get_by_text("Explorer").click()
        page.wait_for_timeout(1000)
        page.screenshot(path="verification/explorer_tab.png")

        # Verify specific features

        # 1. Review Tab: Click on "Key Moments" (even if 0)
        # We need a game with moves to have blunders. Resigning at start has 0 moves.
        # So stats will be 0.
        # But we can check if the elements exist.

        # 2. Explorer Tab: Check for opening name.
        # Start pos opening name is usually "Unknown" or nothing or "Start".
        #  -> "Unknown Opening" or "".
        # Let's check if the table exists.

        # 3. Analysis Tab: Check for "Copy PGN" and "Reset" buttons.
        page.get_by_text("Analysis").click()
        page.wait_for_timeout(500)

        # Look for Copy PGN button
        if page.get_by_text("Copy PGN").is_visible():
            print("Copy PGN button found")

        if page.get_by_text("Reset").is_visible():
            print("Reset button found")

        browser.close()

if __name__ == "__main__":
    verify_analysis()
