import os
import re

print("=== STARTING BACKEND SECURITY SCAN ===")

sql_vulns = []
hardcoded_secrets = []
unprotected_routes = []

secret_patterns = [
    (r'(?i)(password|secret|key|token)\s*=\s*[\'"][^\'"]{6,}[\'"]', "Potential Hardcoded Secret"),
    (r'(?i)bearer\s+[a-zA-Z0-9_\-\.]{20,}', "Hardcoded Bearer Token"),
]

for root, dirs, files in os.walk('fastapi-backend'):
    if 'venv' in root or '__pycache__' in root:
        continue
    for f in files:
        if f.endswith('.py'):
            p = os.path.join(root, f)
            with open(p, 'r', encoding='utf-8', errors='ignore') as fp:
                lines = fp.readlines()

            for line_no, line in enumerate(lines, 1):
                # SQL injection check
                if re.search(r'execute\(\s*(?:text\()?\s*f[\'"]', line):
                    sql_vulns.append((p, line_no, line.strip()))

                # Secrets check
                for pattern, desc in secret_patterns:
                    if re.search(pattern, line) and not any(k in line.lower() for k in ['getenv', 'os.environ', 'sample', 'dummy', 'mock', 'placeholder', 'test']):
                        if 'jwt_secret' not in line.lower() and 'jwt_refresh' not in line.lower():
                            hardcoded_secrets.append((p, line_no, desc, line.strip()[:80]))

print(f"Interpolated SQL queries found: {len(sql_vulns)}")
for p, lno, snippet in sql_vulns[:10]:
    print(f"  {p}:{lno} -> {snippet}")

print(f"\nPotential hardcoded secrets: {len(hardcoded_secrets)}")
for p, lno, desc, snippet in hardcoded_secrets[:10]:
    print(f"  {p}:{lno} ({desc}) -> {snippet}")
