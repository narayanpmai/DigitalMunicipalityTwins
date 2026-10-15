import os
import re

base_dir = r"d:\Project\Municipal_Digital_Twins\fastapi-backend\api\routers"

files = [
    "education.py",
    "revenue.py",
    "project.py",
    "waste_management.py",
    "judicial.py",
    "disaster.py",
    "employment.py",
    "cooperative.py"
]

for file_name in files:
    file_path = os.path.join(base_dir, file_name)
    if os.path.exists(file_path):
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()

        # Find the appended block (which starts with \n\n@router.get( ) and goes to the end)
        # In my last script I did:
        # f.write(f"\n\n@{router_var}.get('{path}')\n")
        # f.write(f"def {method_name}():\n")
        # f.write(...)
        
        # We can extract all functions that we added (get_*_stats, get_revenue_sources, etc.)
        added_funcs_pattern = r"\n\n@router\.get\('[^']+'\)\ndef get_[a-z0-9_]+\(\):\n    return (?:\[\]|\{'total': 0\})\n"
        
        # Find all matches
        matches = re.findall(added_funcs_pattern, content)
        if not matches:
            continue
            
        # Remove them from the end
        new_content = re.sub(added_funcs_pattern, "", content)
        
        # Now inject them right after the APIRouter definition
        # usually router = APIRouter(...)
        router_def_pattern = r"(router = APIRouter\([\s\S]*?\)\n)"
        
        # Reconstruct the string to inject
        injection = "".join(matches)
        
        new_content = re.sub(router_def_pattern, r"\1" + injection, new_content, count=1)
        
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(new_content)
        
        print(f"Moved appended routes in {file_name}")
