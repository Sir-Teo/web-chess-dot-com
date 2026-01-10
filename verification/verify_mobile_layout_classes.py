
import os

def check_file_content(filepath, search_strings, description):
    if not os.path.exists(filepath):
        print(f"FAIL: {filepath} not found.")
        return False

    with open(filepath, 'r') as f:
        content = f.read()

    all_found = True
    for s in search_strings:
        if s not in content:
            print(f"FAIL: '{s}' not found in {filepath} ({description})")
            all_found = False

    if all_found:
        print(f"PASS: All expected strings found in {filepath} ({description})")

    return all_found

def main():
    game_interface_checks = [
        ('p-0 md:p-4', "Board container padding optimized for mobile"),
        ('px-3 md:px-1', "Opponent/Player info horizontal padding increased for mobile"),
        ('min-h-0 md:h-full', "Right Sidebar height optimized for mobile flex scrolling")
    ]

    dashboard_checks = [
        ('p-4 md:p-8', "Dashboard padding optimized for mobile")
    ]

    success = True

    if not check_file_content('components/GameInterface.tsx', [s[0] for s in game_interface_checks], "GameInterface Mobile Optimization"):
        success = False

    if not check_file_content('components/Dashboard.tsx', [s[0] for s in dashboard_checks], "Dashboard Mobile Optimization"):
        success = False

    if success:
        print("\nAll mobile optimization checks passed!")
    else:
        print("\nSome checks failed.")
        exit(1)

if __name__ == "__main__":
    main()
