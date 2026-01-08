from playwright.sync_api import sync_playwright, expect
import time

def verify_peer_js():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        try:
            print("Navigating to app...")
            # We assume the app is running on port 3000
            page.goto("http://localhost:3000/web-chess-dot-com/#multiplayer")

            # Wait for the page to load
            time.sleep(2)

            print("Checking for Multiplayer header...")
            expect(page.get_by_role("heading", name="Multiplayer")).to_be_visible()

            print("Checking for Peer ID generation...")
            # The input field initially says "Generating..." then should have a UUID
            # We wait for it to NOT be "Generating..." or empty
            peer_id_input = page.locator("input[readonly]")

            # Wait up to 10 seconds for ID generation
            for i in range(10):
                val = peer_id_input.input_value()
                print(f"Current ID value: {val}")
                if val and val != "Generating...":
                    print("Peer ID generated successfully!")
                    break
                time.sleep(1)

            expect(peer_id_input).not_to_have_value("Generating...", timeout=10000)
            expect(peer_id_input).not_to_have_value("", timeout=10000)

            print("Taking screenshot...")
            page.screenshot(path="verification/verification_peer.png")
            print("Screenshot saved.")

        except Exception as e:
            print(f"Verification failed: {e}")
            page.screenshot(path="verification/verification_failed.png")
            raise e
        finally:
            browser.close()

if __name__ == "__main__":
    verify_peer_js()
