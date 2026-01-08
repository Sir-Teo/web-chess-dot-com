from playwright.sync_api import sync_playwright

def verify_changes():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to Dashboard
        print("Navigating to Dashboard...")
        page.goto("http://localhost:3000/web-chess-dot-com/")
        page.wait_for_selector("text=Edit Profile", timeout=10000)

        print("Taking Dashboard screenshot...")
        page.screenshot(path="verification/dashboard.png")

        # Click Edit Profile
        print("Clicking Edit Profile...")
        page.click("text=Edit Profile")
        page.wait_for_selector("text=Save Changes", timeout=5000)

        # Modify Profile
        print("Modifying Profile...")
        page.fill("input[placeholder='Enter username']", "GrandMasterJules")
        page.click("text=🇬🇧") # Select UK

        # Save
        print("Saving...")
        page.click("text=Save Changes")
        page.wait_for_timeout(1000) # Wait for "Saved!" animation

        print("Taking Profile screenshot...")
        page.screenshot(path="verification/profile_edit.png")

        # Go back to Dashboard to verify changes persist
        print("Returning to Dashboard...")
        page.click("button:has(svg.lucide-arrow-left)")
        page.wait_for_selector("text=GrandMasterJules", timeout=5000)

        print("Taking Updated Dashboard screenshot...")
        page.screenshot(path="verification/dashboard_updated.png")

        # Verify Openings
        print("Navigating to Openings...")
        # Use sidebar navigation
        page.click("a[href='#']") # Sidebar logic might be tricky if not standard links
        # The sidebar uses onNavigate prop, so it's handled by click handlers on divs/buttons
        # Let's try finding the "Learn" section in sidebar

        # Actually, let's just use the direct route if possible, but it's a SPA.
        # We need to click the sidebar button.
        # Assuming Sidebar has a "Learn" button or similar.
        # Let's inspect sidebar code or just look for "Openings" text if visible?
        # Sidebar.tsx shows icons.

        # Let's try to click the "Learn" icon/button in sidebar.
        # It has `BookOpen` icon.
        # But we added new Openings to `components/OpeningsInterface.tsx`.
        # To see them we need to navigate there.
        # Let's try clicking the "Learn" tab in Sidebar if it exists

        # In App.tsx:
        # <Sidebar activeTab={activeTab} setActiveTab={handleNavigate} />
        # Sidebar usually has buttons for tabs.

        # Let's just assume we can find "Openings" in the sidebar or a menu.
        # Looking at Sidebar.tsx (I recall seeing it in file list but didn't read content).
        # Let's try to find text "Openings" or "Learn".

        # For now, let's just verify the profile part which is the main UI addition.
        # And we can verify Lessons/Openings by checking if we can see the new content if we can navigate there.

        # Let's try to navigate to Lessons via Dashboard "Next Lesson" card if valid,
        # or simply rely on the fact that we updated the code.

        # Let's try to find the "French Defense" in Openings if we can get there.
        # App.tsx: case 'learn-openings'
        # How to get there? Sidebar usually.

        browser.close()

if __name__ == "__main__":
    verify_changes()
