import os
import sys

# Mapping of endpoint to (file_path, router_var, method_name, path)
patches = [
    ("agriculture.py", "router", "get_agriculture_farmers_stats", "/farmers/stats"),
    ("education.py", "router", "get_education_schools_stats", "/schools/stats"),
    ("revenue.py", "router", "get_revenue_sources", "/sources"),
    ("revenue.py", "router", "get_revenue_sources_stats", "/sources/stats"),
    ("project.py", "router", "get_projects_stats", "/stats"),
    ("darta_chalani.py", "router", "get_darta_chalani_list", ""),
    ("tourism.py", "router", "get_tourism_spots", "/spots"),
    ("waste_management.py", "router", "get_waste_schedule", "/schedule"),
    ("waste_management.py", "router", "get_waste_routes", "/routes"),
    ("judicial.py", "router", "get_judicial_cases_stats", "/cases/stats"),
    ("disaster.py", "router", "get_disasters_list", ""),
    ("social_security.py", "router", "get_social_security_stats", "/stats"),
    ("employment.py", "router", "get_employment_job_seekers", "/job-seekers"),
    ("employment.py", "router", "get_employment_stats", "/stats"),
    ("heritage.py", "router", "get_heritage_stats", "/stats"),
    ("badapatra.py", "router", "get_badapatra_citizens_charter", "/citizens-charter"),
    ("dashboard.py", "router", "get_dashboard_overview", "/overview"),
    ("analytics.py", "router", "get_analytics_realtime", "/realtime"),
    ("it_branch.py", "router", "get_it_branch_systems", "/systems"),
    ("cooperative.py", "router", "get_cooperatives_stats", "/stats")
]

base_dir = r"d:\Project\Municipal_Digital_Twins\fastapi-backend\api\routers"

for file_name, router_var, method_name, path in patches:
    file_path = os.path.join(base_dir, file_name)
    if os.path.exists(file_path):
        with open(file_path, "a", encoding="utf-8") as f:
            f.write(f"\n\n@{router_var}.get('{path}')\n")
            f.write(f"def {method_name}():\n")
            if "stats" in method_name or "overview" in method_name or "realtime" in method_name:
                f.write(f"    return {{'total': 0}}\n")
            else:
                f.write(f"    return []\n")
        print(f"Patched {file_name} for {path}")
    else:
        print(f"File not found: {file_path}")
