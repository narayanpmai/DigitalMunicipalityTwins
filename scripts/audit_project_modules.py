import os
import re
import sys

# Ensure UTF-8 output
sys.stdout.reconfigure(encoding='utf-8')

def audit():
    print("==================================================")
    print("  MUNICIPAL DIGITAL TWINS - FULL SYSTEM AUDIT")
    print("==================================================")
    
    # 1. Feature folders in frontend
    feature_dir = 'frontend/src/features'
    features = [d for d in os.listdir(feature_dir) if os.path.isdir(os.path.join(feature_dir, d))]
    print(f"\n1. FRONTEND FEATURES ({len(features)} total):")
    for f in sorted(features):
        files = os.listdir(os.path.join(feature_dir, f))
        print(f"  - {f} ({len(files)} files)")

    # 2. Public Pages
    pages_dir = 'frontend/src/pages/public'
    pages = [f for f in os.listdir(pages_dir) if f.endswith(('.tsx', '.ts'))]
    print(f"\n2. PUBLIC PORTAL PAGES ({len(pages)} total):")
    for p in sorted(pages):
        print(f"  - {p}")

    # 3. Sidebar Sections
    sidebar_file = 'frontend/src/components/layout/Sidebar.tsx'
    with open(sidebar_file, 'r', encoding='utf-8') as f:
        sb = f.read()

    # Extract sections
    sections = re.findall(r"title:\s*['\"]([^'\"]+)['\"],\s*items:\s*\[([\s\S]*?)\]\s*\}", sb)
    print(f"\n3. SIDEBAR NAVIGATION SECTIONS ({len(sections)} sections):")
    all_sidebar_items = []
    for title, items_block in sections:
        items = re.findall(r"path:\s*['\"]([^'\"]+)['\"],\s*label:\s*['\"]([^'\"]+)['\"]", items_block)
        print(f"\n  📁 {title} ({len(items)} items):")
        for path, label in items:
            print(f"     • {label} -> {path}")
            all_sidebar_items.append((title, label, path))

    # 4. App.tsx routes
    app_file = 'frontend/src/App.tsx'
    with open(app_file, 'r', encoding='utf-8') as f:
        app_code = f.read()

    route_matches = re.findall(r"<Route\s+path=[\'\"]([^\'\"]+)[\'\"]", app_code)
    print(f"\n4. APP.TSX REGISTERED ROUTES ({len(route_matches)} total routes)")

    # Check Sidebar items that have no route or 404
    missing_routes = []
    for section, label, path in all_sidebar_items:
        # Check if path or exact matches in route_matches
        clean_path = path.split('?')[0]
        if clean_path not in route_matches and clean_path != '/' and clean_path != '':
            missing_routes.append((section, label, path))

    print(f"\n5. SIDEBAR ITEMS MISSING IN APP.TSX ROUTER:")
    if missing_routes:
        for s, l, p in missing_routes:
            print(f"  ❌ [{s}] {l} -> {p}")
    else:
        print("  ✅ All sidebar navigation items have registered routes in App.tsx!")

    # 6. Check Pages that contain 'Mock' or 'Under Construction' or 'comingSoon'
    print(f"\n6. CHECKING MOCK DATA & PLACEHOLDERS:")
    mock_files = []
    for root, dirs, files in os.walk('frontend/src'):
        for file in files:
            if file.endswith(('.tsx', '.ts')):
                fp = os.path.join(root, file)
                with open(fp, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                    has_mock = bool(re.search(r'\b(mockData|mock_\w+|MOCK_\w+|fakeData|dummyData)\b', content))
                    has_wip = bool(re.search(r'(निर्माणाधीन|काम हुँदैछ|Coming Soon|under construction)', content, re.IGNORECASE))
                    if has_mock or has_wip:
                        mock_files.append((fp, has_mock, has_wip))

    print(f"Files with mock data or WIP indicators ({len(mock_files)} files):")
    for fp, hm, hw in mock_files[:30]:
        status = []
        if hm: status.append("Mock Data")
        if hw: status.append("WIP / Under Construction")
        print(f"  - {os.path.relpath(fp)}: {', '.join(status)}")

if __name__ == '__main__':
    audit()
